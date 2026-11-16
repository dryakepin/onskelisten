import Link from "next/link";
import WishCard from "@/components/WishCard";
import ConfirmButton from "@/components/ConfirmButton";
import { approveSuggestion, deleteWish } from "../actions";
import { listWishes } from "@/lib/queries";

export default async function SuggestionsPage() {
  const list = (await listWishes()).filter((w) => w.status === "active" && w.suggested);
  return (
    <>
      <div className="banner gold">Idéer fra Claude. Godkend dem, du vil have på listen – resten sletter du. Familien kan ikke se forslag.</div>
      {list.length === 0 && <div className="empty">Ingen forslag lige nu. Bed Claude i chatten om flere idéer.</div>}
      {list.map((w) => (
        <WishCard key={w.id} wish={w} actions={
          <>
            <form action={approveSuggestion}><input type="hidden" name="id" value={w.id} /><button className="btn sm primary" type="submit">Godkend</button></form>
            <Link className="btn ghost sm" href={`/admin/wish/${w.id}`}>Redigér</Link>
            <ConfirmButton action={deleteWish} fields={{ id: w.id }} label="Slet" confirmLabel="Slet helt" />
          </>
        } />
      ))}
    </>
  );
}
