"use client";

import { useEffect, useState } from "react";
import { candleDay, seasonFor, type Season } from "@/lib/season";

export interface SeasonView {
  season: Season;
  /** Calendar-candle day, see candleDay(). */
  day: number | null;
}

/**
 * Today's theme, known only after mount (it depends on the visitor's local date).
 * Preview with the address ending in #jul, #jul-9 (as on 9 December) or #foedselsdag.
 */
function read(): SeasonView {
  const now = new Date();
  const m = /^#jul(?:-(\d{1,2}))?$/.exec(location.hash);
  if (m) {
    const d = m[1] ? Number(m[1]) : NaN;
    return { season: "xmas", day: d >= 1 && d <= 24 ? d : candleDay(now) };
  }
  if (location.hash === "#foedselsdag") return { season: "bday", day: null };
  return { season: seasonFor(now), day: candleDay(now) };
}

export function useSeason(): SeasonView | null {
  const [view, setView] = useState<SeasonView | null>(null);
  useEffect(() => {
    const apply = () => setView(read());
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  return view;
}
