import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { fetchProduct, looksLikeProductUrl } from "@/lib/scrape";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Weekly price refresh (vercel.json). Vercel Cron calls with "Authorization: Bearer $CRON_SECRET". */
export async function GET(request: NextRequest) {
  const secret = env.cronSecret();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: wishes, error } = await db().from("wishes").select("id, url").eq("status", "active").neq("url", "");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const w of wishes ?? []) {
    if (!looksLikeProductUrl(w.url)) continue;
    const info = await fetchProduct(w.url);
    const ok = info.amount != null;
    await db().from("price_checks").insert({ wish_id: w.id, amount: info.amount ?? null, currency: info.currency ?? null, ok, error: info.error ?? null });
    if (ok) {
      await db().from("wishes").update({ price_amount: info.amount, currency: info.currency, price_checked_at: new Date().toISOString() }).eq("id", w.id);
    }
    results.push({ id: w.id, ok, error: info.error });
    await new Promise((r) => setTimeout(r, 750)); // be polite to shops
  }
  return NextResponse.json({ checked: results.length, updated: results.filter((r) => r.ok).length, results });
}
