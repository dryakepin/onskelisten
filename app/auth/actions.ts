"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/owner";

/** Start Google sign-in. Used by both the owner and family members; /auth/callback sorts out who is who. */
export async function signInWithGoogle() {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback`, queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) redirect("/login?fejl=google");
  redirect(data.url);
}
