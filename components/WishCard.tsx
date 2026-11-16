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
}: {
  wish: Wish;
  actions?: React.ReactNode;
  tag?: React.ReactNode;
  showPriceCheck?: boolean;
}) {
  const cat = CATEGORIES[wish.category] ?? CATEGORIES.andet;
  const price = formatPrice(wish.price_amount, wish.currency);
  const h = host(wish.url);
  const one = wish.occasions.length === 1 ? (wish.occasions[0] === "jul" ? "Kun jul" : "Kun fødselsdag") : "";
  return (
    <div className={`card${wish.suggested ? " suggested" : ""}`}>
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
