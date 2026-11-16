import { describe, expect, it } from "vitest";
import { extractProduct, looksLikeProductUrl } from "@/lib/scrape";

describe("extractProduct", () => {
  it("reads JSON-LD offers (Shopify-style)", () => {
    const html = `<html><head><title>Skiundertøj</title><script type="application/ld+json">{"@type":"Product","name":"Merino sæt","offers":[{"@type":"Offer","price":"580.00","priceCurrency":"DKK"}]}</script></head></html>`;
    expect(extractProduct(html, "https://danishendurance.com/x")).toEqual({ title: "Merino sæt", amount: 580, currency: "DKK" });
  });
  it("reads @graph JSON-LD", () => {
    const html = `<script type="application/ld+json">{"@graph":[{"@type":"WebPage"},{"@type":"Product","name":"Bog","offers":{"price":127.46,"priceCurrency":"DKK"}}]}</script>`;
    expect(extractProduct(html, "https://www.saxo.com/dk/x").amount).toBe(127.46);
  });
  it("falls back to product meta tags", () => {
    const html = `<meta property="og:title" content="EasyDens"><meta property="product:price:amount" content="4429.00"><meta property="product:price:currency" content="DKK">`;
    expect(extractProduct(html, "https://humlecentralen.dk/x")).toEqual({ title: "EasyDens", amount: 4429, currency: "DKK" });
  });
  it("reads Amazon's selected format price, not the audiobook", () => {
    const html = `<span id="productTitle"> 1177 B.C. </span><div id="tmmSwatches"><div class="swatchElement">Audiobook £0.99</div><div class="swatchElement selected">Paperback £14.79</div></div>`;
    expect(extractProduct(html, "https://www.amazon.co.uk/dp/0691208018")).toEqual({ title: "1177 B.C.", amount: 14.79, currency: "GBP" });
  });
  it("returns no price when there is none", () => {
    expect(extractProduct("<title>Hi</title>", "https://x.dk").amount).toBeUndefined();
  });
});

describe("looksLikeProductUrl", () => {
  it("skips search and collection pages", () => {
    expect(looksLikeProductUrl("https://www.amazon.de/s?k=Scanpan")).toBe(false);
    expect(looksLikeProductUrl("https://minibrew.io/collections/recipe-kits")).toBe(false);
    expect(looksLikeProductUrl("https://brewtaurus.com/products/rapt-pill")).toBe(true);
    expect(looksLikeProductUrl("https://www.amazon.co.uk/dp/1408839997")).toBe(true);
  });
});
