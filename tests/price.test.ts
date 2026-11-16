import { describe, expect, it } from "vitest";
import { formatPrice, guessCurrency, parseAmount } from "@/lib/price";

describe("parseAmount", () => {
  it.each([
    ["580", 580], ["580.00", 580], ["79.95", 79.95], ["79,95", 79.95], ["4.429", 4429],
    ["1.234,50", 1234.5], ["1,234.50", 1234.5], ["£14.79", 14.79], ["1,299", 1299], ["127.46", 127.46],
    ["4429.00", 4429], ["abc", null], ["", null],
  ])("%s → %s", (raw, expected) => expect(parseAmount(raw)).toBe(expected));
});

describe("guessCurrency", () => {
  it("reads the shop's country", () => {
    expect(guessCurrency("https://www.amazon.co.uk/dp/1")).toBe("GBP");
    expect(guessCurrency("https://www.amazon.de/dp/1")).toBe("EUR");
    expect(guessCurrency("https://www.boozt.com/eu/en/x")).toBe("EUR");
    expect(guessCurrency("https://www.saxo.com/dk/x")).toBe("DKK");
    expect(guessCurrency("not a url")).toBe("DKK");
  });
});

describe("formatPrice", () => {
  it("formats the Danish way", () => {
    expect(formatPrice(580, "DKK")).toMatch(/^580\s?kr\.$/);
    expect(formatPrice(14.79, "GBP")).toMatch(/^14,79\s?£$/);
    expect(formatPrice(null, "DKK")).toBe("");
  });
});
