import "server-only";
import { db } from "./db";
import type { Giver, MailSend, Reservation, Wish } from "./types";

function rows<T>(res: { data: T[] | null; error: { message: string } | null }): T[] {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

const toWish = (w: Wish): Wish => ({ ...w, price_amount: w.price_amount == null ? null : Number(w.price_amount) });

export async function listWishes(): Promise<Wish[]> {
  const res = await db().from("wishes").select("*").order("priority").order("created_at");
  return rows<Wish>(res).map(toWish);
}

export async function getWish(id: string): Promise<Wish | null> {
  const { data } = await db().from("wishes").select("*").eq("id", id).maybeSingle<Wish>();
  return data ? toWish(data) : null;
}

export async function listGivers(): Promise<Giver[]> {
  return rows<Giver>(await db().from("givers").select("*").order("sort_order").order("name"));
}

export async function lastMailSend(): Promise<MailSend | null> {
  const { data } = await db().from("mail_sends").select("*").order("sent_at", { ascending: false }).limit(1).maybeSingle<MailSend>();
  return data ?? null;
}

/**
 * Reservations, for GIVER views only. Never call this from owner pages or owner actions:
 * keeping reservations out of every owner code path is what keeps the gifts a surprise.
 */
export async function reservationsForGivers(): Promise<Reservation[]> {
  return rows<Reservation>(await db().from("reservations").select("id, wish_id, giver_id, status"));
}
