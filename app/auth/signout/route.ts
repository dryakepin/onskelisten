import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/owner";

export async function POST(request: NextRequest) {
  const supabase = await authClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
