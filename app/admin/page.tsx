import Link from "next/link";
import WishCard from "@/components/WishCard";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteWish, markReceived, refreshPrice } from "./actions";
import { listGivers, listWishes, lastMailSend } from "@/lib/queries";
import { PRIORITIES, type Priority } from "@/lib/types";

export default async function WishesPage() {
  const [wishes, givers, last] = await Promise.all([listWishes(), listGivers(), lastMailSend()]);
  const approved = wishes.filter((w) => w.status === "active" && !w.suggested);
  const sugg = wishes.filter((w) => w.status === "active" && w.suggested).length;
  const sent = new Set(last?.wish_ids ?? []);
  const names = [...givers.map((g) => g.name), "Andre"];
  return (
    <>
      <div className="addbar"><Link className="btn primary" href="/admin/ny">＋ Nyt ønske</Link></div>
      {sugg > 0 && (
        <div className="banner gold">{sugg} forslag venter under <Link href="/admin/forslag">Forslag</Link>. De er skjult for familien, til du godkender dem.</div>
      )}
      {approved.length === 0 && <div className="empty">Listen er tom. Tilføj dit første ønske.</div>}
      {([1, 2, 3] as Priority[]).map((p) => {
        const items = approved.filter((w) => w.priority === p);
        if (!items.length) return null;
        return (
          <section className="group" key={p}>
            <h2>{PRIORITIES[p]} <small>{items.length}</small></h2>
            {items.map((w) => (
              <WishCard
                key={w.id}
                wish={w}
                showPriceCheck
                tag={last && !sent.has(w.id) ? <span className="tag new">Ny siden sidste mail</span> : null}
                actions={
                  <>
                    <details className="confirm">
                      <summary className="btn sm">Modtaget</summary>
                      <form action={markReceived} className="recv">
                        <input type="hidden" name="id" value={w.id} />
                        <select name="from" aria-label="Fra hvem?" defaultValue="">
                          <option value="" disabled>Fra hvem?</option>
                          {names.map((n) => <option key={n}>{n}</option>)}
                        </select>
                        <button className="btn sm primary" type="submit">Gem</button>
                      </form>
                    </details>
                    <Link className="btn ghost sm" href={`/admin/wish/${w.id}`}>Redigér</Link>
                    {w.url && (
                      <form action={refreshPrice}>
                        <input type="hidden" name="id" value={w.id} />
                        <button className="btn ghost sm" type="submit" title="Hent pris fra butikken">Opdatér pris</button>
                      </form>
                    )}
                    <ConfirmButton action={deleteWish} fields={{ id: w.id }} label="Slet" confirmLabel="Slet helt" />
                  </>
                }
              />
            ))}
          </section>
        );
      })}
    </>
  );
}
