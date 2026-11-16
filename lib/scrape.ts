import { parse, type HTMLElement } from "node-html-parser";
import { guessCurrency, isCurrency, parseAmount } from "./price";
import type { Currency } from "./types";

export interface ProductInfo {
  title?: string;
  amount?: number;
  currency?: Currency;
}

const SYMBOLS: Record<string, Currency> = { "£": "GBP", "€": "EUR", $: "USD", kr: "DKK" };

function fromJsonLd(root: HTMLElement): ProductInfo {
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    let data: unknown;
    try {
      data = JSON.parse(s.textContent);
    } catch {
      continue;
    }
    const nodes: unknown[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") {
        nodes.push(v);
        const g = (v as Record<string, unknown>)["@graph"];
        if (g) walk(g);
      }
    };
    walk(data);
    for (const n of nodes as Record<string, unknown>[]) {
      const type = ([] as unknown[]).concat(n["@type"] ?? []).map(String);
      if (!type.includes("Product") && !n.offers) continue;
      const offers = ([] as Record<string, unknown>[]).concat((n.offers as Record<string, unknown>) ?? []);
      for (const o of offers) {
        const spec = o.priceSpecification as Record<string, unknown> | undefined;
        const raw = o.price ?? o.lowPrice ?? spec?.price;
        const amount = raw != null ? parseAmount(String(raw)) : null;
        const cur = o.priceCurrency ?? spec?.priceCurrency;
        if (amount != null) {
          return {
            title: typeof n.name === "string" ? n.name : undefined,
            amount,
            currency: isCurrency(cur) ? cur : undefined,
          };
        }
      }
    }
  }
  return {};
}

function meta(root: HTMLElement, ...names: string[]): string | undefined {
  for (const name of names) {
    const el = root.querySelector(`meta[property="${name}"]`) ?? root.querySelector(`meta[name="${name}"]`);
    const v = el?.getAttribute("content");
    if (v) return v;
  }
  return undefined;
}

function fromMeta(root: HTMLElement): ProductInfo {
  const raw = meta(root, "product:price:amount", "og:price:amount");
  const cur = meta(root, "product:price:currency", "og:price:currency");
  const itemprop = root.querySelector('[itemprop="price"]');
  const ip = itemprop?.getAttribute("content") ?? itemprop?.textContent;
  const amount = parseAmount(raw ?? ip ?? "");
  const ipCur = root.querySelector('[itemprop="priceCurrency"]')?.getAttribute("content");
  const c = cur ?? ipCur;
  return { amount: amount ?? undefined, currency: isCurrency(c) ? c : undefined };
}

/** Amazon puts the selected format's price in the format swatches or the buy box. */
function fromAmazon(root: HTMLElement): ProductInfo {
  const candidates = [
    root.querySelector("#tmmSwatches .selected")?.textContent,
    root.querySelector("#corePrice_feature_div .a-offscreen")?.textContent,
    root.querySelector("#corePriceDisplay_desktop_feature_div .a-offscreen")?.textContent,
    root.querySelector("#buybox")?.textContent,
  ];
  for (const t of candidates) {
    const m = t?.match(/([£€$])\s?(\d[\d.,]*)/);
    if (m) {
      const amount = parseAmount(m[2]);
      if (amount != null) return { amount, currency: SYMBOLS[m[1]] };
    }
  }
  return {};
}

export function extractProduct(html: string, url: string): ProductInfo {
  const root = parse(html);
  const title =
    meta(root, "og:title")?.trim() ??
    root.querySelector("#productTitle")?.textContent.trim() ??
    root.querySelector("title")?.textContent.trim();
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  const sources = /amazon\./.test(host)
    ? [fromAmazon(root), fromJsonLd(root), fromMeta(root)]
    : [fromJsonLd(root), fromMeta(root)];
  const hit = sources.find((s) => s.amount != null) ?? {};
  return {
    title: hit.title ?? title ?? undefined,
    amount: hit.amount,
    currency: hit.amount != null ? (hit.currency ?? guessCurrency(url)) : undefined,
  };
}

/** Search and category pages have no single price; skip them. */
export function looksLikeProductUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (/\/(s|search|soeg|collections)(\/|$)/.test(u.pathname) && !/\/products\//.test(u.pathname)) return false;
    if (u.searchParams.has("k") && /amazon\./.test(u.hostname)) return false;
    return /^https?:$/.test(u.protocol);
  } catch {
    return false;
  }
}

export async function fetchProduct(url: string, timeoutMs = 10_000): Promise<ProductInfo & { error?: string }> {
  if (!looksLikeProductUrl(url)) return { error: "not a product page" };
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
        "accept-language": "da-DK,da;q=0.9,en;q=0.8",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();
    const info = extractProduct(html, url);
    return info.amount == null ? { ...info, error: "no price found" } : info;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
