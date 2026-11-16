"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentGiver } from "@/lib/giver";


async function giverOrFail() {
  const g = await currentGiver();
  if (!g) throw new Error("Linket er ikke gyldigt længere. Brug det nyeste link fra Kåres mail.");
  return g;
}

export async function reserve(fd: FormData): Promise<void> {
  const g = await giverOrFail();
  const wishId = String(fd.get("wish_id") ?? "");
  const { data: wish } = await db().from("wishes").select("status, suggested").eq("id", wishId).maybeSingle();
  if (!wish || wish.status !== "active" || wish.suggested) return;
  // The unique index on wish_id makes this race-safe: a second reservation fails with 23505.
  await db().from("reservations").insert({ wish_id: wishId, giver_id: g.id, status: "reserved" });
  revalidatePath("/");
}

export async function markBought(fd: FormData): Promise<void> {
  const g = await giverOrFail();
  await db().from("reservations").update({ status: "bought" }).eq("wish_id", String(fd.get("wish_id"))).eq("giver_id", g.id);
  revalidatePath("/");
}

export async function release(fd: FormData): Promise<void> {
  const g = await giverOrFail();
  await db().from("reservations").delete().eq("wish_id", String(fd.get("wish_id"))).eq("giver_id", g.id);
  revalidatePath("/");
}
