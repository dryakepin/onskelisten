import { NextResponse, type NextRequest } from "next/server";
import { GIVER_COOKIE } from "@/lib/giver";
import { authClient } from "@/lib/owner";

/** Signs out of Google and forgets a personal link on this device. */
export async function POST(request: NextRequest) {
  const supabase = await authClient();
  await supabase.auth.signOut();
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.delete(GIVER_COOKIE);
  return res;
}
