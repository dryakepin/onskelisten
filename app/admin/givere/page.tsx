import CopyButton from "@/components/CopyButton";
import ConfirmButton from "@/components/ConfirmButton";
import { fmtDate } from "@/components/WishCard";
import { deleteGiver, regenerateLink, saveGiver, toggleGiverMail } from "../actions";
import { giverLink } from "@/lib/giver";
import { listGivers } from "@/lib/queries";

export default async function GiversPage() {
  const givers = await listGivers();
  return (
    <>
      <p className="muted">Familien åbner listen med deres personlige link – uden login. Et nyt link gør det gamle ugyldigt.</p>
      <div className="recips">
        {givers.map((g) => (
          <div className="rrow giver" key={g.id}>
            <form action={saveGiver} className="giver-edit">
              <input type="hidden" name="id" value={g.id} />
              <input name="name" defaultValue={g.name} aria-label="Navn" maxLength={60} required />
              <input name="email" type="email" defaultValue={g.email} aria-label="Email" maxLength={120} required />
              <button className="btn ghost sm" type="submit">Gem</button>
            </form>
            <div className="giver-meta">
              <form action={toggleGiverMail}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="active" value={g.active_for_mail ? "0" : "1"} />
                <button className="btn ghost sm" type="submit">{g.active_for_mail ? "✓ Får mail" : "Får ikke mail"}</button>
              </form>
              <CopyButton text={giverLink(g)} />
              <ConfirmButton action={regenerateLink} fields={{ id: g.id }} label="Nyt link" confirmLabel="Lav nyt link (det gamle stopper)" />
              <ConfirmButton action={deleteGiver} fields={{ id: g.id }} label="Fjern" confirmLabel={`Fjern ${g.name}`} />
              <span className="status">{g.last_seen_at ? `Sidst set ${fmtDate(g.last_seen_at)}` : "Har ikke åbnet listen endnu"}</span>
            </div>
          </div>
        ))}
        <form action={saveGiver} className="rrow radd">
          <input name="name" placeholder="Navn" aria-label="Navn" maxLength={60} required />
          <input name="email" type="email" placeholder="email@eksempel.dk" aria-label="Email" maxLength={120} required />
          <span className="ract"><button className="btn sm" type="submit">＋ Tilføj</button></span>
        </form>
      </div>
    </>
  );
}
