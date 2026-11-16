import { describe, expect, it } from "vitest";
import { daysUntil, seasonFor } from "@/lib/season";

describe("seasonFor", () => {
  it.each([
    ["2026-05-12", "bday"], ["2026-05-13", "xmas"], ["2026-11-16", "xmas"],
    ["2026-12-24", "xmas"], ["2026-12-25", "bday"], ["2027-01-10", "bday"],
  ])("%s → %s", (d, s) => {
    const [y, m, day] = d.split("-").map(Number);
    expect(seasonFor(new Date(y, m - 1, day))).toBe(s);
  });
});

describe("daysUntil", () => {
  it("counts to Christmas Eve and wraps to next year", () => {
    expect(daysUntil(12, 24, new Date(2026, 10, 15))).toBe(39);
    expect(daysUntil(12, 24, new Date(2026, 11, 24))).toBe(0);
    expect(daysUntil(5, 12, new Date(2026, 4, 13))).toBe(364);
  });
});
