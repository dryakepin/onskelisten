import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { giverFromEmail } from "@/lib/giver";
import { authClient, isOwnerEmail } from "@/lib/owner";

/** Google sign-in lands here. The owner goes to the admin pages, a family member to the list, anyone else is signed out. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const fail = (reason: string) => {
    // Shown on the login page and in the server log, so a failed sign-in explains itself.
    console.error(`[auth/callback] sign-in failed: ${reason}`);
    const url = new URL("/login", request.url);
    url.searchParams.set("fejl", "google");
    url.searchParams.set("grund", reason.slice(0, 200));
    return NextResponse.redirect(url);
  };
  const code = q.get("code");
  if (!code) return fail(q.get("error_description") ?? q.get("error_code") ?? q.get("error") ?? "no code in callback");
  const supabase = await authClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email?.toLowerCase();
  if (error) return fail(`exchange: ${error.message}`);
  if (!email) return fail("Google returned no email");
  if (isOwnerEmail(email)) return NextResponse.redirect(new URL("/admin", request.url));
  const giver = await giverFromEmail(email);
  if (!giver) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?fejl=adgang", request.url));
  }
  await db().from("givers").update({ last_seen_at: new Date().toISOString() }).eq("id", giver.id);
  return NextResponse.redirect(new URL("/", request.url));
}
