import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let client: SupabaseClient | null = null;

/** Service-role client. Server-only: it bypasses row-level security, which denies all client roles. */
export function db(): SupabaseClient {
  client ??= createClient(env.supabaseUrl(), env.serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
