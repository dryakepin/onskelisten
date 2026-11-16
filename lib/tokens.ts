import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A giver's personal link token: "<giverId>.<mac>", where mac = HMAC-SHA256(secret, giverId:version).
 * Nothing secret is stored in the database; bumping a giver's link_version revokes old links.
 */
export function signGiverToken(giverId: string, version: number, secret: string): string {
  const mac = createHmac("sha256", secret).update(`${giverId}:${version}`).digest("base64url");
  return `${giverId}.${mac}`;
}

export function parseGiverToken(token: string): { giverId: string; mac: string } | null {
  const m = /^([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/.exec(token);
  return m ? { giverId: m[1], mac: m[2] } : null;
}

export function verifyGiverToken(token: string, version: number, secret: string): boolean {
  const p = parseGiverToken(token);
  if (!p) return false;
  const expected = signGiverToken(p.giverId, version, secret).split(".")[1];
  const a = Buffer.from(p.mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
