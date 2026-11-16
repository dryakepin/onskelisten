import "server-only";

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export const env = {
  supabaseUrl: () => need("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => need("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceRoleKey: () => need("SUPABASE_SERVICE_ROLE_KEY"),
  linkSecret: () => need("LINK_SECRET"),
  appUrl: () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  ownerEmails: () =>
    need("OWNER_EMAILS")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  cronSecret: () => process.env.CRON_SECRET ?? "",
};
