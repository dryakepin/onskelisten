import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/owner";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?fejl=google", request.url));
  const supabase = await authClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return NextResponse.redirect(new URL("/login?fejl=google", request.url));
  if (!env.ownerEmails().includes(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?fejl=adgang", request.url));
  }
  return NextResponse.redirect(new URL("/admin", request.url));
}
