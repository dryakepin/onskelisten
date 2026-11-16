"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { isCurrency, parseAmount } from "@/lib/price";
import { fetchProduct, type ProductInfo } from "@/lib/scrape";
import { CATEGORIES, type Occasion } from "@/lib/types";
import { lastMailSend, listWishes } from "@/lib/queries";
import { wishesForOccasion } from "@/lib/mail";

// Every owner action starts with requireOwner(). None of them read the reservations table.

function str(fd: FormData, k: string, max = 2000): string {
  return String(fd.get(k) ?? "").trim().slice(0, max);
}

function cleanUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return "";
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|gclid|gbraid|wbraid|gad_|fbclid|dib|dib_tag|qid|sr|ref_|crid|sprefix)/.test(k)) u.searchParams.delete(k);
    }
    return u.toString();
  } catch {
    return "";
  }
}

export async function saveWish(fd: FormData) {
  await requireOwner();
  const id = str(fd, "id");
  const title = str(fd, "title", 200);
  if (!title) throw new Error("Titel mangler");
  const url = cleanUrl(str(fd, "url"));
  const amount = parseAmount(str(fd, "price_amount", 30));
  const currency = str(fd, "currency", 3);
  const category = str(fd, "category");
  const priority = Number(str(fd, "priority")) as 1 | 2 | 3;
  const occasions = fd.getAll("occasions").map(String).filter((o): o is Occasion => o === "jul" || o === "fødselsdag");
  const row = {
    title,
    url,
    note: str(fd, "note", 600),
    category: category in CATEGORIES ? category : "andet",
    priority: [1, 2, 3].includes(priority) ? priority : 2,
    occasions: occasions.length ? occasions : ["jul", "fødselsdag"],
    price_amount: amount,
    currency: amount != null && isCurrency(currency) ? currency : null,
  };
  if (id) {
    const { data: old } = await db().from("wishes").select("price_amount, currency").eq("id", id).single();
    const priceChanged = Number(old?.price_amount ?? NaN) !== (amount ?? NaN) || old?.currency !== row.currency;
    await db().from("wishes").update(priceChanged ? { ...row, price_checked_at: null } : row).eq("id", id);
  } else {
    await db().from("wishes").insert({ ...row, price_checked_at: fd.get("price_from_shop") ? new Date().toISOString() : null });
  }
  revalidatePath("/", "layout");
  redirect(fd.get("back") === "forslag" ? "/admin/forslag" : "/admin");
}

export async function deleteWish(fd: FormData) {
  await requireOwner();
  await db().from("wishes").delete().eq("id", str(fd, "id"));
  revalidatePath("/", "layout");
}

export async function approveSuggestion(fd: FormData) {
  await requireOwner();
  await db().from("wishes").update({ suggested: false, created_at: new Date().toISOString() }).eq("id", str(fd, "id"));
  revalidatePath("/", "layout");
}

export async function markReceived(fd: FormData) {
  await requireOwner();
  const id = str(fd, "id");
  await db().from("wishes").update({ status: "received", received_from: str(fd, "from", 60), received_at: new Date().toISOString() }).eq("id", id);
  // A received gift is done: clear any reservation without reading it.
  await db().from("reservations").delete().eq("wish_id", id);
  revalidatePath("/", "layout");
}

export async function restoreWish(fd: FormData) {
  await requireOwner();
  await db().from("wishes").update({ status: "active", received_from: "", received_at: null }).eq("id", str(fd, "id"));
  revalidatePath("/", "layout");
}

/** Read title and price from a product page, for the add-wish form. */
export async function lookupProduct(url: string): Promise<ProductInfo & { url?: string; error?: string }> {
  await requireOwner();
  const clean = cleanUrl(url);
  if (!clean) return { error: "Ugyldigt link" };
  const info = await fetchProduct(clean);
  return { url: clean, ...info };
}

export async function refreshPrice(fd: FormData) {
  await requireOwner();
  const id = str(fd, "id");
  const { data: w } = await db().from("wishes").select("url").eq("id", id).single();
  if (!w?.url) return;
  const info = await fetchProduct(w.url);
  const ok = info.amount != null;
  await db().from("price_checks").insert({ wish_id: id, amount: info.amount ?? null, currency: info.currency ?? null, ok, error: info.error ?? null });
  if (ok) await db().from("wishes").update({ price_amount: info.amount, currency: info.currency, price_checked_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/", "layout");
}

// ---------- Givers ----------

export async function saveGiver(fd: FormData) {
  await requireOwner();
  const id = str(fd, "id");
  const name = str(fd, "name", 60);
  const email = str(fd, "email", 120).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Navn og en gyldig email er påkrævet");
  if (id) await db().from("givers").update({ name, email }).eq("id", id);
  else await db().from("givers").insert({ name, email, sort_order: Date.now() % 1e9 });
  revalidatePath("/admin", "layout");
}

export async function toggleGiverMail(fd: FormData) {
  await requireOwner();
  await db().from("givers").update({ active_for_mail: fd.get("active") === "1" }).eq("id", str(fd, "id"));
  revalidatePath("/admin", "layout");
}

export async function deleteGiver(fd: FormData) {
  await requireOwner();
  await db().from("givers").delete().eq("id", str(fd, "id"));
  revalidatePath("/", "layout");
}

/** Revoke a giver's personal link: old links and remembered devices stop working. */
export async function regenerateLink(fd: FormData) {
  await requireOwner();
  const id = str(fd, "id");
  const { data } = await db().from("givers").select("link_version").eq("id", id).single();
  await db().from("givers").update({ link_version: (data?.link_version ?? 1) + 1 }).eq("id", id);
  revalidatePath("/admin", "layout");
}

// ---------- Mail ----------

export async function markMailSent(fd: FormData) {
  await requireOwner();
  const occasion: Occasion = fd.get("occasion") === "fødselsdag" ? "fødselsdag" : "jul";
  const recipientIds = fd.getAll("recipient").map(String);
  const wishes = wishesForOccasion(await listWishes(), occasion);
  const prev = await lastMailSend();
  // Keep titles of everything ever mailed so a later "removed" line can still name it.
  const titles: Record<string, string> = { ...(prev?.wish_titles ?? {}) };
  for (const w of wishes) titles[w.id] = w.title;
  await db().from("mail_sends").insert({ occasion, recipient_ids: recipientIds, wish_ids: wishes.map((w) => w.id), wish_titles: titles });
  revalidatePath("/admin", "layout");
}
