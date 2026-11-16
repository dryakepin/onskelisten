"use client";

import { useMemo } from "react";
import { daysUntil } from "@/lib/season";
import { candle } from "./decor";
import { useSeason } from "./useSeason";

const days = (n: number) => `${n} ${n === 1 ? "dag" : "dage"}`;

/** Page header: the seasonal countdown line above the title and, at Christmas, the calendar candle beside it. */
export default function Hero({ children }: { children: React.ReactNode }) {
  const view = useSeason();
  const svg = useMemo(() => (view?.season === "xmas" ? candle(view.day) : ""), [view]);
  let eyebrow = "";
  let label = "";
  if (view?.season === "xmas") {
    const n = view.day != null ? 24 - view.day : daysUntil(12, 24);
    eyebrow = n === 0 ? "Glædelig jul" : view.day != null ? `${view.day}. december · ${days(n)} til juleaften` : `${days(n)} til juleaften`;
    label = view.day != null ? `Kalenderlys: tallene ${view.day} til 24 er tilbage` : "Kalenderlys, endnu ikke tændt";
  } else if (view) {
    const n = daysUntil(5, 12);
    eyebrow = n === 0 ? "🇩🇰 Tillykke med fødselsdagen" : `🇩🇰 Fødselsdag · ${days(n)} til 12. maj`;
  }
  return (
    <div className="hero">
      {svg && <div className="candle" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />}
      <div className="hero-text">
        <div className="eyebrow">{eyebrow}</div>
        {children}
      </div>
    </div>
  );
}
