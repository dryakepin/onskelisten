import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { giverFromEmail } from "@/lib/giver";
import { authClient, isOwnerEmail } from "@/lib/owner";

/** Google sign-in lands here. The owner goes to the admin pages, a family member to the list, anyone else is signed out. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?fejl=google", request.url));
  const supabase = await authClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return NextResponse.redirect(new URL("/login?fejl=google", request.url));
  if (isOwnerEmail(email)) return NextResponse.redirect(new URL("/admin", request.url));
  const giver = await giverFromEmail(email);
  if (!giver) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?fejl=adgang", request.url));
  }
  await db().from("givers").update({ last_seen_at: new Date().toISOString() }).eq("id", giver.id);
  return NextResponse.redirect(new URL("/", request.url));
}
