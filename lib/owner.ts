import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { env } from "./env";

export async function authClient() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in owner's email, or null. Verified against Supabase Auth, not just read from the cookie. */
export async function getOwnerEmail(): Promise<string | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return email && env.ownerEmails().includes(email) ? email : null;
}

export async function requireOwner(): Promise<string> {
  const email = await getOwnerEmail();
  if (!email) redirect("/login");
  return email;
}
