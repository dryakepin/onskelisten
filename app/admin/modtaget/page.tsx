import WishCard, { fmtDate } from "@/components/WishCard";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteWish, restoreWish } from "../actions";
import { listWishes } from "@/lib/queries";

export default async function ReceivedPage() {
  const list = (await listWishes())
    .filter((w) => w.status === "received")
    .sort((a, b) => (b.received_at ?? "").localeCompare(a.received_at ?? ""));
  return (
    <>
      {list.length === 0 && <div className="empty">Ingen modtagne gaver endnu.</div>}
      {list.map((w) => (
        <WishCard key={w.id} wish={w}
          tag={<span className="tag res">Modtaget{w.received_from ? ` fra ${w.received_from}` : ""} {fmtDate(w.received_at)}</span>}
          actions={
            <>
              <form action={restoreWish}><input type="hidden" name="id" value={w.id} /><button className="btn ghost sm" type="submit">Tilbage på listen</button></form>
              <ConfirmButton action={deleteWish} fields={{ id: w.id }} label="Slet" confirmLabel="Slet helt" />
            </>
          } />
      ))}
    </>
  );
}
