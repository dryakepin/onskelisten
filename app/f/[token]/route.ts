import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { GIVER_COOKIE, GIVER_COOKIE_MAX_AGE, giverFromToken } from "@/lib/giver";

/** Personal link from the family mail: remember the giver on this device and open the list. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const giver = await giverFromToken(token);
  if (!giver) return NextResponse.redirect(new URL("/?link=ugyldigt", request.url));

  await db().from("givers").update({ last_seen_at: new Date().toISOString() }).eq("id", giver.id);
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(GIVER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GIVER_COOKIE_MAX_AGE,
  });
  return res;
}
