import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient, getOwnerEmail } from "@/lib/owner";

async function signIn() {
  "use server";
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) redirect("/login?fejl=google");
  redirect(data.url);
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fejl?: string }> }) {
  if (await getOwnerEmail()) redirect("/admin");
  const { fejl } = await searchParams;
  return (
    <main className="wrap narrow">
      <h1>Kåres ønskeliste</h1>
      <p className="muted">Log ind for at redigere listen.</p>
      {fejl === "adgang" && <div className="banner warn">Den Google-konto har ikke adgang til at redigere listen.</div>}
      {fejl === "google" && <div className="banner warn">Login med Google mislykkedes. Prøv igen.</div>}
      <form action={signIn}>
        <button className="btn primary" type="submit">Log ind med Google</button>
      </form>
      <p className="muted small">Er du familie? Brug linket fra Kåres mail – du skal ikke logge ind.</p>
    </main>
  );
}
