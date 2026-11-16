import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";
import { env } from "./env";
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

export async function currentGiver(): Promise<Giver | null> {
  const token = (await cookies()).get(GIVER_COOKIE)?.value;
  return token ? giverFromToken(token) : null;
}
