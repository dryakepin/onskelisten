/**
 * One-off import from the Claude artifact's database export into Supabase.
 * Usage: npx tsx --env-file=.env.local scripts/import-artifact.ts data/artifact-export.json
 * Idempotent: wishes upsert on legacy_id, givers on email. Reservations are not imported.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

type ArtifactWish = {
  id: string;
  title: string;
  url?: string;
  note?: string;
  category?: string;
  priority?: number;
  occasions?: string[];
  status?: string;
  suggested?: boolean;
  receivedFrom?: string;
  receivedAt?: number | null;
  createdAt?: number;
  priceAmount?: number | null;
  currency?: string | null;
  priceCheckedAt?: number | null;
  price?: string;
};
type ArtifactRecipient = { name: string; email: string; selected?: boolean; order?: number };

const file = process.argv[2];
if (!file) throw new Error("Pass the export file path");
const { wishes, recipients } = JSON.parse(readFileSync(file, "utf8")) as { wishes: ArtifactWish[]; recipients: ArtifactRecipient[] };

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const iso = (ms?: number | null) => (ms ? new Date(ms).toISOString() : null);
const legacyPrice = (p?: string) => (p && /^\d+([.,]\d+)?$/.test(p.trim()) ? Number(p.replace(",", ".")) : null);

const wishRows = wishes.map((w) => {
  const amount = w.priceAmount ?? legacyPrice(w.price);
  return {
    legacy_id: w.id,
    title: w.title.slice(0, 200),
    url: w.url ?? "",
    note: w.note ?? "",
    category: w.category ?? "andet",
    priority: w.priority ?? 2,
    occasions: w.occasions?.length ? w.occasions : ["jul", "fødselsdag"],
    status: w.status === "received" ? "received" : "active",
    suggested: !!w.suggested,
    received_from: w.receivedFrom === "gammel liste" ? "" : (w.receivedFrom ?? ""),
    received_at: iso(w.receivedAt),
    created_at: iso(w.createdAt) ?? new Date().toISOString(),
    price_amount: amount,
    currency: amount != null ? (w.currency ?? "DKK") : null,
    price_checked_at: iso(w.priceCheckedAt),
  };
});

const giverRows = recipients.map((r, i) => ({
  name: r.name,
  email: r.email.toLowerCase(),
  active_for_mail: r.selected !== false,
  sort_order: r.order ?? i,
}));

const w = await sb.from("wishes").upsert(wishRows, { onConflict: "legacy_id" });
if (w.error) throw w.error;
const g = await sb.from("givers").upsert(giverRows, { onConflict: "email" });
if (g.error) throw g.error;
console.log(`Imported ${wishRows.length} wishes and ${giverRows.length} givers.`);
