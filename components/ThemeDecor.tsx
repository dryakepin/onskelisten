"use client";

import { useEffect, useMemo, useState } from "react";
import { daysUntil, seasonFor, type Season } from "@/lib/season";
import { fxHtml, garland, SANTA_SVG } from "./decor";

function currentSeason(): Season {
  const h = typeof location !== "undefined" ? location.hash : "";
  if (h === "#jul") return "xmas";
  if (h === "#foedselsdag") return "bday";
  return seasonFor(new Date());
}

/** Seasonal garland, falling snow or flags, Santa and the countdown line. Renders after mount (random, local date). */
export default function ThemeDecor() {
  const [season, setSeason] = useState<Season | null>(null);

  useEffect(() => {
    const apply = () => setSeason(currentSeason());
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    if (!season) return;
    document.body.classList.toggle("theme-xmas", season === "xmas");
    document.body.classList.toggle("theme-bday", season === "bday");
    if (season !== "xmas") return;
    let timer: ReturnType<typeof setTimeout>;
    const fly = () => {
      const fx = document.getElementById("fx");
      if (fx) {
        const el = document.createElement("div");
        el.className = "santa";
        el.style.top = `${(5 + Math.random() * 14).toFixed(1)}vh`;
        el.innerHTML = `<div class="santa-bob">${SANTA_SVG}</div>`;
        el.addEventListener("animationend", (e) => e.target === el && el.remove());
        fx.appendChild(el);
      }
      timer = setTimeout(fly, (25 + Math.random() * 25) * 1000);
    };
    timer = setTimeout(fly, 4000);
    return () => clearTimeout(timer);
  }, [season]);

  // Random flake positions: build once per season so re-renders don't make the snow jump.
  const fx = useMemo(() => (season ? fxHtml(season) : ""), [season]);
  const deco = useMemo(() => (season ? garland(season) : ""), [season]);
  if (!season) return <div id="deco" aria-hidden="true" />;
  const n = season === "xmas" ? daysUntil(12, 24) : daysUntil(5, 12);
  const eyebrow =
    season === "xmas"
      ? n === 0 ? "🎄 Glædelig jul" : `🎄 Jul · ${n} ${n === 1 ? "dag" : "dage"} til juleaften`
      : n === 0 ? "🇩🇰 Tillykke med fødselsdagen" : `🇩🇰 Fødselsdag · ${n} ${n === 1 ? "dag" : "dage"} til 12. maj`;
  return (
    <>
      <div id="fx" aria-hidden="true" dangerouslySetInnerHTML={{ __html: fx }} />
      <div id="deco" aria-hidden="true" dangerouslySetInnerHTML={{ __html: deco }} />
      <div className="eyebrow">{eyebrow}</div>
    </>
  );
}
