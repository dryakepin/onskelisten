import { CATEGORIES, type Wish } from "@/lib/types";
import { formatPrice } from "@/lib/price";

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const dateFmt = new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Copenhagen" });
export const fmtDate = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : "");

export default function WishCard({
  wish,
  actions,
  tag,
  showPriceCheck = false,
  wrap,
  nisse = false,
}: {
  wish: Wish;
  actions?: React.ReactNode;
  tag?: React.ReactNode;
  showPriceCheck?: boolean;
  /** Christmas theme: a reserved wish is gift-wrapped, red ribbon for your own, green for someone else's. */
  wrap?: "mine" | "other";
  /** Christmas theme: a kravlenisse peeks over the top edge. */
  nisse?: boolean;
}) {
  const cat = CATEGORIES[wish.category] ?? CATEGORIES.andet;
  const price = formatPrice(wish.price_amount, wish.currency);
  const h = host(wish.url);
  const one = wish.occasions.length === 1 ? (wish.occasions[0] === "jul" ? "Kun jul" : "Kun fødselsdag") : "";
  return (
    <div className={`card${wish.suggested ? " suggested" : ""}${wrap ? ` wrap-${wrap}` : ""}${nisse ? " has-nisse" : ""}`}>
      {wrap && (
        <>
          <span className="ribbon" aria-hidden="true" />
          <svg className="bow" aria-hidden="true" viewBox="0 0 44 30">
            <path d="M22 15 C 10 2 2 4 3 14 C 4 24 12 24 22 15 Z" fill="var(--bow)" />
            <path d="M22 15 C 34 2 42 4 41 14 C 40 24 32 24 22 15 Z" fill="var(--bow)" />
            <circle cx="22" cy="15" r="4.5" fill="var(--bow-dark)" stroke="var(--paper)" strokeWidth="1" />
          </svg>
        </>
      )}
      {nisse && (
        <svg className="nisse" aria-hidden="true" viewBox="0 0 74 46">
          <path d="M20 34 C 22 12 40 2 60 4 C 50 10 50 22 54 34 Z" fill="#a8202b" />
          <circle cx="61" cy="5" r="4.5" fill="#f7f0e1" />
          <path d="M18 34 H56 V46 H18 Z" fill="#f0c9a8" />
          <rect x="16" y="31" width="42" height="6" rx="3" fill="#f7f0e1" />
          <circle cx="30" cy="41" r="1.8" fill="#2a2420" />
          <circle cx="44" cy="41" r="1.8" fill="#2a2420" />
          <ellipse cx="6" cy="43" rx="6" ry="4" fill="#a8202b" />
          <ellipse cx="68" cy="43" rx="6" ry="4" fill="#a8202b" />
        </svg>
      )}
      <div className="icon" aria-hidden="true">{cat.icon}</div>
      <div>
        <div className="title">
          {wish.url ? (
            <a href={wish.url} target="_blank" rel="noopener noreferrer">{wish.title}</a>
          ) : (
            wish.title
          )}{" "}
          {tag}
        </div>
        <div className="meta">
          {price && (
            <span>
              {price}
              {showPriceCheck && wish.price_checked_at && <> · tjekket {fmtDate(wish.price_checked_at)}</>}
            </span>
          )}
          {h && <span>{h}</span>}
          <span>{cat.label}</span>
          {one && <span>{one}</span>}
        </div>
        {wish.note && <div className="note">{wish.note}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
