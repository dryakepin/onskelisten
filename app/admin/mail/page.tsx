import Link from "next/link";
import { fmtDate } from "@/components/WishCard";
import { markMailSent } from "../actions";
import { giverLink } from "@/lib/giver";
import { buildMail, gmailComposeUrl, wishesForOccasion } from "@/lib/mail";
import { lastMailSend, listGivers, listWishes } from "@/lib/queries";
import { occasionFor, seasonFor } from "@/lib/season";
import type { Occasion } from "@/lib/types";

export default async function MailPage({ searchParams }: { searchParams: Promise<{ anledning?: string }> }) {
  const { anledning } = await searchParams;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }));
  const occasion: Occasion =
    anledning === "jul" ? "jul" : anledning === "fodselsdag" ? "fødselsdag" : occasionFor(seasonFor(now));
  const [wishes, givers, last] = await Promise.all([listWishes(), listGivers(), lastMailSend()]);
  const list = wishesForOccasion(wishes, occasion);
  const recipients = givers.filter((g) => g.active_for_mail);
  const drafts = recipients.map((g) => {
    const m = buildMail({ name: g.name, link: giverLink(g), occasion, wishes: list, lastSend: last, year: now.getFullYear() });
    return { g, m, href: gmailComposeUrl(g.email, m.subject, m.body) };
  });
  const sample = drafts.at(0)?.m;

  return (
    <div className="panel">
      <h3>Mail til familien</h3>
      <div className="status">
        {last
          ? `Sidste mail markeret som sendt ${fmtDate(last.sent_at)}. ${sample?.newTitles.length ?? 0} nye og ${sample?.removedTitles.length ?? 0} fjernet siden da.`
          : "Der er ikke sendt mail fra listen endnu."}
      </div>
      <label>Anledning</label>
      <div className="chips">
        <Link className={`chip${occasion === "jul" ? " on" : ""}`} href="/admin/mail?anledning=jul">Jul</Link>
        <Link className={`chip${occasion === "fødselsdag" ? " on" : ""}`} href="/admin/mail?anledning=fodselsdag">Fødselsdag</Link>
      </div>
      <label>Én mail pr. person – tryk, send i Gmail, og tag den næste ({list.length} ønsker)</label>
      {recipients.length === 0 && <div className="status">Ingen modtagere. Tilføj familie under <Link href="/admin/givere">Familie</Link>.</div>}
      <div className="recips">
        {drafts.map(({ g, href }) => (
          <div className="rrow" key={g.id}>
            <b>{g.name}</b>
            <span className="remail">{g.email}</span>
            <span className="ract">
              <a className="btn sm primary" href={href} target="_blank" rel="noopener noreferrer">Åbn i Gmail</a>
            </span>
          </div>
        ))}
      </div>
      {sample && (
        <>
          <label>Sådan ser mailen ud (til {drafts[0].g.name})</label>
          <div className="preview"><b>{sample.subject}</b>{"\n\n"}{sample.body}</div>
        </>
      )}
      <form action={markMailSent} className="dlg-foot" style={{ justifyContent: "flex-start" }}>
        <input type="hidden" name="occasion" value={occasion} />
        {recipients.map((g) => <input key={g.id} type="hidden" name="recipient" value={g.id} />)}
        <button className="btn" type="submit" disabled={!recipients.length}>Markér som sendt</button>
        <span className="status">Gør det, når du har sendt dem alle – så viser næste mail, hvad der er nyt.</span>
      </form>
    </div>
  );
}
