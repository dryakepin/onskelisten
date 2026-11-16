import { redirect } from "next/navigation";
import { signInWithGoogle } from "../auth/actions";
import { currentGiver } from "@/lib/giver";
import { getOwnerEmail } from "@/lib/owner";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fejl?: string; grund?: string }> }) {
  if (await getOwnerEmail()) redirect("/admin");
  if (await currentGiver()) redirect("/");
  const { fejl, grund } = await searchParams;
  return (
    <main className="narrow">
      <h1>Kåres ønskeliste</h1>
      <p className="muted">Log ind med din Google-konto for at se listen og reservere gaver.</p>
      {fejl === "adgang" && (
        <div className="banner warn">Den Google-konto er ikke på familielisten. Prøv en anden konto, eller bed Kåre om at tilføje din adresse.</div>
      )}
      {fejl === "google" && (
        <div className="banner warn">
          Login med Google mislykkedes. Prøv igen.
          {grund && <div className="muted small">Teknisk årsag: {grund.slice(0, 200)}</div>}
        </div>
      )}
      <form action={signInWithGoogle}>
        <button className="btn primary" type="submit">Log ind med Google</button>
      </form>
      <p className="muted small">Brug den Google-konto, Kåre har skrevet til.</p>
    </main>
  );
}
