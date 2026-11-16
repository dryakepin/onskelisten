import Link from "next/link";
import WishCard from "@/components/WishCard";
import { markBought, release, reserve } from "./actions";
import { currentGiver } from "@/lib/giver";
import { listGivers, listWishes, reservationsForGivers } from "@/lib/queries";
import { PRIORITIES, type Priority } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const giver = await currentGiver();
  const { link } = await searchParams;

  if (!giver) {
    return (
      <main className="narrow">
        <h1>Kåres ønskeliste</h1>
        {link === "ugyldigt" ? (
          <div className="banner warn">Linket virker ikke længere. Brug linket fra Kåres nyeste mail, eller bed ham om et nyt.</div>
        ) : (
          <p>Åbn listen med linket fra Kåres mail – du skal ikke logge ind.</p>
        )}
        <p className="muted small"><Link href="/login">Er du Kåre? Log ind her.</Link></p>
      </main>
    );
  }

  const [wishes, givers, reservations] = await Promise.all([listWishes(), listGivers(), reservationsForGivers()]);
  const visible = wishes.filter((w) => w.status === "active" && !w.suggested);
  const byWish = new Map(reservations.map((r) => [r.wish_id, r]));
  const nameOf = new Map(givers.map((g) => [g.id, g.name]));
  const mine = reservations.filter((r) => r.giver_id === giver.id).length;

  return (
    <>
      <header>
        <h1>Kåres ønskeliste</h1>
        <p>Hej {giver.name}. Tryk “Reservér” ved det, du vil give – så kan de andre se, at det er taget.{mine ? ` Du har reserveret ${mine}.` : ""}</p>
      </header>
      {visible.length === 0 && <div className="empty">Listen er tom lige nu.</div>}
      {([1, 2, 3] as Priority[]).map((p) => {
        const items = visible.filter((w) => w.priority === p);
        if (!items.length) return null;
        return (
          <section className="group" key={p}>
            <h2>{PRIORITIES[p]}</h2>
            {items.map((w) => {
              const r = byWish.get(w.id);
              const isMine = r?.giver_id === giver.id;
              const who = r ? (isMine ? "dig" : (nameOf.get(r.giver_id) ?? "en anden")) : "";
              const tag = r ? <span className="tag res">{r.status === "bought" ? "Købt" : "Reserveret"} af {who}</span> : null;
              const hidden = <input type="hidden" name="wish_id" value={w.id} />;
              const actions = !r ? (
                <form action={reserve}>{hidden}<button className="btn sm primary" type="submit">Reservér</button></form>
              ) : isMine ? (
                <>
                  {r.status !== "bought" && <form action={markBought}>{hidden}<button className="btn sm" type="submit">Markér som købt</button></form>}
                  <form action={release}>{hidden}<button className="btn ghost sm" type="submit">Fortryd</button></form>
                </>
              ) : null;
              return <WishCard key={w.id} wish={w} tag={tag} actions={actions} />;
            })}
          </section>
        );
      })}
    </>
  );
}
