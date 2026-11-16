import "server-only";
import { db } from "./db";
import { isOwnerEmail, sessionEmail } from "./owner";
import type { Giver } from "./types";

/** The giver whose email matches, or null. The owner is never a giver: that would show him the reservations. */
export async function giverFromEmail(email: string): Promise<Giver | null> {
  const e = email.trim().toLowerCase();
  if (!e || isOwnerEmail(e)) return null;
  const { data } = await db().from("givers").select("*").eq("email", e).maybeSingle<Giver>();
  return data ?? null;
}

/** Who is looking at the list: the Google-signed-in person, if their email is on the family list. */
export async function currentGiver(): Promise<Giver | null> {
  const email = await sessionEmail();
  return email ? giverFromEmail(email) : null;
}
