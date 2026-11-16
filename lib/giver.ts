import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";
import { env } from "./env";
import { isOwnerEmail, sessionEmail } from "./owner";
import { parseGiverToken, signGiverToken, verifyGiverToken } from "./tokens";
import type { Giver } from "./types";

export const GIVER_COOKIE = "onsker_giver";
/** Browsers cap cookie lifetime at 400 days. */
export const GIVER_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export function giverLink(g: Pick<Giver, "id" | "link_version">): string {
  return `${env.appUrl()}/f/${signGiverToken(g.id, g.link_version, env.linkSecret())}`;
}

/** Resolve a token to its giver, or null if unknown, malformed or revoked. */
export async function giverFromToken(token: string): Promise<Giver | null> {
  const p = parseGiverToken(token);
  if (!p) return null;
  const { data } = await db().from("givers").select("*").eq("id", p.giverId).maybeSingle<Giver>();
  if (!data) return null;
  return verifyGiverToken(token, data.link_version, env.linkSecret()) ? data : null;
}

/** The giver whose email matches, or null. The owner is never a giver: that would show him the reservations. */
export async function giverFromEmail(email: string): Promise<Giver | null> {
  const e = email.trim().toLowerCase();
  if (!e || isOwnerEmail(e)) return null;
  const { data } = await db().from("givers").select("*").eq("email", e).maybeSingle<Giver>();
  return data ?? null;
}

export type GiverSession = { giver: Giver; via: "link" | "google" };

/** Who is looking at the list: a personal-link cookie first, otherwise a Google sign-in whose email is on the family list. */
export async function currentGiverSession(): Promise<GiverSession | null> {
  const token = (await cookies()).get(GIVER_COOKIE)?.value;
  const byLink = token ? await giverFromToken(token) : null;
  if (byLink) return { giver: byLink, via: "link" };
  const email = await sessionEmail();
  const byGoogle = email ? await giverFromEmail(email) : null;
  return byGoogle ? { giver: byGoogle, via: "google" } : null;
}

export async function currentGiver(): Promise<Giver | null> {
  return (await currentGiverSession())?.giver ?? null;
}
