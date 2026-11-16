export type Season = "xmas" | "bday";

/** Christmas theme 13 May – 24 Dec; birthday theme (12 May) 25 Dec – 12 May. Uses local calendar date. */
export function seasonFor(d: Date): Season {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 12 && day >= 25) return "bday";
  if (m > 5 || (m === 5 && day >= 13)) return "xmas";
  return "bday";
}

/** Whole days from `from` (local date) until the next occurrence of month/day; 0 on the day itself. */
export function daysUntil(month: number, day: number, from: Date = new Date()): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let target = new Date(from.getFullYear(), month - 1, day);
  if (target < today) target = new Date(from.getFullYear() + 1, month - 1, day);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function occasionFor(season: Season) {
  return season === "xmas" ? ("jul" as const) : ("fødselsdag" as const);
}

/**
 * The calendar candle (kalenderlys): 1–24 in December is the number at the top of the candle that day,
 * with the earlier numbers burnt away. Null outside 1–24 December: the candle is whole and unlit.
 */
export function candleDay(d: Date): number | null {
  const day = d.getDate();
  return d.getMonth() === 11 && day >= 1 && day <= 24 ? day : null;
}
