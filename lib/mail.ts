import { formatPrice } from "./price";
import { PRIORITIES, type MailSend, type Occasion, type Wish } from "./types";

export interface MailDraft {
  subject: string;
  body: string;
  newTitles: string[];
  removedTitles: string[];
}

export function wishesForOccasion(wishes: Wish[], occasion: Occasion): Wish[] {
  return wishes.filter(
    (w) => w.status === "active" && !w.suggested && (w.occasions.length === 0 || w.occasions.includes(occasion)),
  );
}

/** Plain-text mail for one giver. Short on purpose: the list itself lives on the site, behind Google sign-in. */
export function buildMail(opts: {
  name: string;
  email: string;
  link: string;
  occasion: Occasion;
  wishes: Wish[];
  lastSend: MailSend | null;
  year: number;
}): MailDraft {
  const { name, email, link, occasion, wishes, lastSend, year } = opts;
  const sent = new Set(lastSend?.wish_ids ?? []);
  const live = new Set(wishes.map((w) => w.id));
  const fresh = lastSend ? wishes.filter((w) => !sent.has(w.id)) : [];
  const removed = lastSend
    ? (lastSend.wish_ids.filter((id) => !live.has(id)).map((id) => lastSend.wish_titles[id]).filter(Boolean) as string[])
    : [];

  const subject = occasion === "jul" ? `Min ønskeliste til jul ${year}` : "Min ønskeliste til min fødselsdag";
  const lines: string[] = [`Hej ${name}`, ""];
  lines.push(
    lastSend
      ? `Her er en opdatering af min ønskeliste${occasion === "jul" ? " til jul" : ""}.`
      : `Så er der ønskeliste${occasion === "jul" ? " til jul" : ""}.`,
  );
  lines.push("", "Listen ligger her:", link, "", `Log ind med din Google-konto (${email}).`, "");
  lines.push("Tryk “Reservér” ved det, du vil give, så vi undgår at give det samme.", "");

  if (fresh.length) {
    lines.push("NYT SIDEN SIDST");
    for (const w of fresh) lines.push(`- ${w.title}${w.price_amount != null ? ` (${formatPrice(w.price_amount, w.currency)})` : ""}`);
    lines.push("");
  }
  if (removed.length) {
    lines.push("FJERNET SIDEN SIDST");
    for (const t of removed) lines.push(`- ${t}`);
    lines.push("");
  }
  if (!lastSend) {
    const top = wishes.filter((w) => w.priority === 1);
    if (top.length) {
      lines.push(PRIORITIES[1].toUpperCase());
      for (const w of top) lines.push(`- ${w.title}`);
      lines.push("", `… og ${wishes.length - top.length} andre ønsker på listen.`, "");
    }
  }
  lines.push("Kærlig hilsen", "Kåre");
  return { subject, body: lines.join("\n"), newTitles: fresh.map((w) => w.title), removedTitles: removed };
}

/** A Gmail compose URL that opens a ready-written message in the owner's Gmail. */
export function gmailComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${p.toString()}`;
}
