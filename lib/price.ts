import { CURRENCIES, type Currency } from "./types";

export function isCurrency(c: unknown): c is Currency {
  return typeof c === "string" && (CURRENCIES as readonly string[]).includes(c);
}

/** Guess a shop's currency from its URL; DKK when unsure. */
export function guessCurrency(url: string): Currency {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return "DKK";
  }
  if (/\.co\.uk$|\.uk$/.test(host)) return "GBP";
  if (/\.se$/.test(host)) return "SEK";
  if (/\.no$/.test(host)) return "NOK";
  if (/\.(de|eu|nl|fr|es|it|at|be|fi)$/.test(host) || /\/eu\//.test(url)) return "EUR";
  if (/\.com$/.test(host) && /amazon\.com$/.test(host)) return "USD";
  return "DKK";
}

/** Parse a user- or shop-supplied amount: "4.429", "79,95", "1.234,50", "£14.79", "580.00", "1,299". */
export function parseAmount(raw: string): number | null {
  let s = raw.replace(/[^\d.,]/g, "");
  if (!/\d/.test(s)) return null;
  const commas = (s.match(/,/g) ?? []).length;
  const dots = (s.match(/\./g) ?? []).length;
  if (commas && dots) {
    // whichever separator comes last is the decimal mark
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (commas) {
    s = commas > 1 || /,\d{3}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (dots) {
    s = dots > 1 || /\.\d{3}$/.test(s) ? s.replace(/\./g, "") : s;
  }
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

export function formatPrice(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null || !currency) return "";
  try {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
