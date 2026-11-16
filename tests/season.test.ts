import { describe, expect, it } from "vitest";
import { candleDay, daysUntil, seasonFor } from "@/lib/season";

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

describe("candleDay", () => {
  it("is unlit before 1 December and burns one number a day until the 24th", () => {
    expect(candleDay(new Date(2026, 10, 16))).toBeNull();
    expect(candleDay(new Date(2026, 10, 30))).toBeNull();
    expect(candleDay(new Date(2026, 11, 1))).toBe(1);
    expect(candleDay(new Date(2026, 11, 9))).toBe(9);
    expect(candleDay(new Date(2026, 11, 24))).toBe(24);
    expect(candleDay(new Date(2026, 11, 25))).toBeNull();
  });
});
