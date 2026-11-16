import { describe, expect, it } from "vitest";
import { buildMail, gmailComposeUrl, wishesForOccasion } from "@/lib/mail";
import type { MailSend, Wish } from "@/lib/types";

const w = (id: string, title: string, extra: Partial<Wish> = {}): Wish => ({
  id, title, url: "", price_amount: null, currency: null, price_checked_at: null, note: "", category: "andet",
  priority: 2, occasions: ["jul", "fødselsdag"], status: "active", suggested: false, received_from: "",
  received_at: null, created_at: "", updated_at: "", ...extra,
});

describe("buildMail", () => {
  const wishes = [w("a", "Bog", { priority: 1 }), w("b", "Shorts", { price_amount: 580, currency: "DKK" })];

  it("first mail lists top wishes and the link", () => {
    const m = buildMail({ name: "Mor", link: "https://x/f/t", occasion: "jul", wishes, lastSend: null, year: 2026 });
    expect(m.subject).toBe("Min ønskeliste til jul 2026");
    expect(m.body).toContain("Hej Mor");
    expect(m.body).toContain("https://x/f/t");
    expect(m.body).toContain("- Bog");
    expect(m.newTitles).toEqual([]);
  });

  it("later mail shows new and removed since last send", () => {
    const last: MailSend = { id: "m", sent_at: "", occasion: "jul", recipient_ids: [], wish_ids: ["a", "gone"], wish_titles: { gone: "Gryde" } };
    const m = buildMail({ name: "Thue", link: "L", occasion: "jul", wishes, lastSend: last, year: 2026 });
    expect(m.newTitles).toEqual(["Shorts"]);
    expect(m.removedTitles).toEqual(["Gryde"]);
    expect(m.body).toMatch(/NYT SIDEN SIDST\n- Shorts \(580\s?kr\.\)/);
    expect(m.body).toContain("FJERNET SIDEN SIDST\n- Gryde");
  });
});

describe("wishesForOccasion", () => {
  it("drops suggestions, received and other-occasion wishes", () => {
    const list = [w("1", "A"), w("2", "B", { suggested: true }), w("3", "C", { status: "received" }), w("4", "D", { occasions: ["fødselsdag"] })];
    expect(wishesForOccasion(list, "jul").map((x) => x.id)).toEqual(["1"]);
  });
});

describe("gmailComposeUrl", () => {
  it("encodes recipient, subject and body", () => {
    const u = new URL(gmailComposeUrl("a@b.dk", "Ønsker", "Hej\nlinje 2"));
    expect(u.searchParams.get("to")).toBe("a@b.dk");
    expect(u.searchParams.get("su")).toBe("Ønsker");
    expect(u.searchParams.get("body")).toBe("Hej\nlinje 2");
  });
});
