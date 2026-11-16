// @ts-nocheck -- string-template SVG code carried over as-is from the artifact
/* Seasonal decorations, ported from the Claude artifact. Pure string builders: no DOM access. */
import type { Season } from "@/lib/season";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Calendar candle. `day` 1–24: that number is on top and the flame is lit; null: whole and unlit. */
export function candle(day: number | null): string {
  const left = day == null ? 24 : 25 - day, first = 25 - left;
  const T = 42, B = 8, base = T + left * B, H = base + 20;
  let lines = "", nums = "";
  for (let k = 0; k < left; k++) {
    if (k) lines += `M19 ${T + B * k}H43`;
    nums += `<tspan x="31" ${k ? `dy="${B}"` : `y="${T + 6.3}"`}>${first + k}</tspan>`;
  }
  const flame = day == null ? "" : `<g class="flame"><circle cx="31" cy="26" r="26" fill="#f2b65a" opacity=".16"/><circle cx="31" cy="26" r="15" fill="#f2b65a" opacity=".22"/>
    <path class="flame-body" d="M31 8 C 38 20 39 28 31 36 C 23 28 24 20 31 8 Z" fill="#f2b65a"/><path d="M31 20 C 34 26 34 30 31 34 C 28 30 28 26 31 20 Z" fill="#fff4d6"/></g>`;
  return `<svg viewBox="0 0 62 ${H}" width="62" height="${H}" xmlns="http://www.w3.org/2000/svg">${flame}
    <line x1="31" y1="35" x2="31" y2="${T}" stroke="${day == null ? "#f3ead8" : "#2a2420"}" stroke-width="1.6"/>
    <rect x="19" y="${T}" width="24" height="${left * B}" rx="3" fill="#f7f0e1"/>
    <path d="${lines}" stroke="#a8202b" stroke-width=".8" fill="none"/>
    <text fill="#a8202b" font-family="Inter,sans-serif" font-size="6.5" font-weight="600" text-anchor="middle">${nums}</text>
    <path d="M8 ${base} H54 L50 ${base + 10} H12 Z" fill="#c8962e"/><rect x="4" y="${base + 10}" width="54" height="5" rx="2.5" fill="#c8962e"/>
    <path d="M2 ${base + 2} l10 -6 M4 ${base + 8} l10 -3 M60 ${base + 2} l-10 -6 M58 ${base + 8} l-10 -3" stroke="#2f6b4f" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}

/** Christmas: a spruce branch hung with woven hearts, paper cones, stars and flags. Shown unscaled; narrow screens see the middle. */
function spruceGarland(): string {
  const W = 860, H = 92, n = 15, sag = 24;
  const y = (x) => 12 + sag * 4 * (x / W) * (1 - x / W);
  const heart = (x, cy, fill, line) => `<path transform="translate(${x} ${cy}) scale(1.7)" d="M0 7 L-7 -1 A4.05 4.05 0 0 1 0 -5 A4.05 4.05 0 0 1 7 -1 Z" fill="${fill}" stroke="${line}" stroke-width=".8"/>
    <path transform="translate(${x} ${cy}) scale(1.7)" d="M-4.6 -2.6 L1 3 M-2.2 -4.6 L3.4 1 M4.6 -2.6 L-1 3 M2.2 -4.6 L-3.4 1" stroke="${line}" stroke-width=".9" fill="none"/>`;
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M-4 12 Q ${W / 2} ${12 + sag * 2} ${W + 4} 12" fill="none" stroke="#2f6b4f" stroke-width="5" stroke-linecap="round"/>`;
  let needles = "";
  for (let x = 14; x < W; x += 28) { const yy = y(x); needles += `M${x} ${yy.toFixed(1)} l-6 9 M${x} ${yy.toFixed(1)} l5 10 `; }
  s += `<path d="${needles}" stroke="#2f6b4f" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  for (let i = 1; i <= n; i++) {
    const x = i * W / (n + 1), yy = y(x), k = i % 5;
    const string = (len) => `<line x1="${x}" y1="${yy}" x2="${x}" y2="${yy + len}" stroke="#b9c4b8" stroke-width="1"/>`;
    if (k === 1) s += string(12) + heart(x, yy + 26, "#a8202b", "#f3ead8");
    else if (k === 2) s += string(8) + `<path d="M${x - 12} ${yy + 8} L${x + 12} ${yy + 8} L${x} ${yy + 40} Z" fill="#f3ead8" stroke="#c8962e" stroke-width="1.2"/><path d="M${x - 9} ${yy + 16} L${x + 9} ${yy + 16} M${x - 6} ${yy + 24} L${x + 6} ${yy + 24}" stroke="#a8202b" stroke-width="2"/>`;
    else if (k === 3) { const r = 13, pts = [...Array(10)].map((_, j) => { const a = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? r * .45 : r; return (x + rr * Math.cos(a)).toFixed(1) + "," + (yy + 21 + rr * Math.sin(a)).toFixed(1); }).join(" ");
      s += string(8) + `<polygon points="${pts}" fill="#c8962e"/>`; }
    else if (k === 4) s += string(8) + `<rect x="${x - 15}" y="${yy + 8}" width="30" height="22" fill="#a8202b"/><rect x="${x - 6}" y="${yy + 8}" width="4" height="22" fill="#f3ead8"/><rect x="${x - 15}" y="${yy + 17}" width="30" height="4" fill="#f3ead8"/>`;
    else s += string(12) + heart(x, yy + 26, "#f3ead8", "#a8202b");
  }
  return s + "</svg>";
}

export function garland(kind: Season): string {
  if (kind === "xmas") return spruceGarland();
  const W=860,H=64,n=13; const sag=22;
  const y=x=>8+sag*4*(x/W)*(1-x/W);
  let s=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8 Q ${W/2} ${8+sag*2} ${W} 8" fill="none" stroke="var(--muted)" stroke-width="1.5" opacity=".6"/>`;
  for(let i=1;i<=n;i++){
    const x=i*W/(n+1), yy=y(x);
    const w=30,h=22,fx=x-w/2,fy=yy+2; // Dannebrog-flag på snor
    s+=`<g transform="rotate(${(i%2?-3:3)} ${x} ${yy})"><rect x="${fx}" y="${fy}" width="${w}" height="${h}" fill="#c8102e"/>
      <rect x="${fx+10}" y="${fy}" width="4" height="${h}" fill="#fff"/><rect x="${fx}" y="${fy+9}" width="${w}" height="4" fill="#fff"/></g>`;
  }
  return s+"</svg>";
}

export const SANTA_SVG: string =(()=>{
  // Rensdyr tegnes vendt mod højre og spejles, så de ser i flyveretningen (mod venstre).
  const deer=(dx,i)=>`<g transform="translate(${dx+44} 0) scale(-1 1)"><g class="deer" style="animation-delay:${(-0.13*i).toFixed(2)}s">
    <g class="legs-b" style="animation-delay:${(-0.13*i).toFixed(2)}s"><path d="M10 33 L1.5 35.5 M12.5 34.5 L5 40" stroke="#6b4429" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>
    <g class="legs-f" style="animation-delay:${(-0.13*i).toFixed(2)}s"><path d="M27 33 L35 37 M24.5 34 L31 40.5" stroke="#6b4429" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>
    <ellipse cx="18" cy="30" rx="13" ry="5.5" fill="#8a5a3b"/><ellipse cx="18" cy="32.5" rx="9" ry="2.5" fill="#b78a62"/>
    <path d="M27 27 L33 19 L37 21 L31 31 Z" fill="#8a5a3b"/><path d="M27.5 28.5 L31.5 30.5" stroke="#d4a73a" stroke-width="2"/>
    <ellipse cx="37" cy="19" rx="5" ry="3" fill="#8a5a3b"/><circle cx="41.6" cy="19.4" r="1.2" fill="#2a1a10"/><circle cx="36.5" cy="17.8" r=".7" fill="#fff"/>
    <path d="M35 16 L32 8 M33.5 12 L29.5 10 M37.5 16 L40 8 M38.8 12 L43 10.5" stroke="#d8b98f" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M5 28 L1 25 L4 30 Z" fill="#f4ede4"/></g></g>`;
  return `<svg viewBox="0 0 270 60" width="270" height="60" xmlns="http://www.w3.org/2000/svg">
    ${deer(0,0)}${deer(46,1)}${deer(92,2)}
    <path d="M169 31 L99 21 L53 21 L7 21" stroke="#5a3a22" stroke-width="1" fill="none"/>
    <circle cx="203" cy="29" r="9.5" fill="#8b5a2b"/><path d="M198.5 21 L203 16.5 L207.5 21 Z" fill="#8b5a2b"/><path d="M199 21.5 L207 21.5" stroke="#d4a73a" stroke-width="1.6"/>
    <rect x="200" y="14" width="6" height="5" rx="1" fill="#1e7a52"/><rect x="202.3" y="14" width="1.4" height="5" fill="#f2c94c"/>
    <path d="M171 40 Q169 27 180 25 Q191 27 190 40 Z" fill="#c8102e"/>
    <path d="M174 30 L168 31.5" stroke="#c8102e" stroke-width="3.2" stroke-linecap="round"/><circle cx="167.5" cy="31.6" r="1.8" fill="#2a1a10"/>
    <rect x="171" y="34" width="19" height="3" fill="#222"/><rect x="178.5" y="33.6" width="4" height="3.8" fill="none" stroke="#d4a73a" stroke-width="1"/>
    <circle cx="180.5" cy="20" r="5" fill="#f2c7a5"/><circle cx="178.6" cy="19.2" r=".7" fill="#2a1a10"/><circle cx="177.6" cy="21.3" r="1.1" fill="#e89a8a"/>
    <path d="M175.2 20.5 Q176 30 180.5 31 Q185 30 185.8 20.5 Q180.5 24 175.2 20.5 Z" fill="#fff"/>
    <path d="M175 18 Q181 13 187 17 L193 10 Q195 9 196 12 L188 19 Z" fill="#c8102e"/>
    <path d="M174.5 18.3 Q181 13.8 187.8 17.8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="196" cy="11" r="2.2" fill="#fff"/>
    <path d="M148 30 L152 46 L212 46 Q222 46 222 34 L214 34 L210 40 L160 40 L156 30 Z" fill="#a50d26"/>
    <path d="M156 30 L160 40 L210 40 L214 34" stroke="#d4a73a" stroke-width="1.6" fill="none"/>
    <path d="M146 53 L222 53 Q233 53 231 44" stroke="#d4a73a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M162 46 L162 53 M204 46 L204 53" stroke="#d4a73a" stroke-width="2"/>
    <g class="sparkle" fill="#f2c94c"><circle cx="240" cy="38" r="1.8"/><circle cx="250" cy="33" r="1.4"/><circle cx="258" cy="41" r="1.1"/><circle cx="266" cy="35" r=".9"/></g>
  </svg>`;
})();

export function fxHtml(kind: Season): string {
  const flag = (w: number) => `<svg width="${w}" height="${(w * 28 / 37).toFixed(1)}" viewBox="0 0 37 28"><rect width="37" height="28" fill="#c8102e"/><rect x="12" width="4" height="28" fill="#fff"/><rect y="12" width="37" height="4" fill="#fff"/></svg>`;
  const n = kind === "xmas" ? 55 : 28;
  let h = "";
  for (let i = 0; i < n; i++) {
    const dur = kind === "xmas" ? rnd(9, 20) : rnd(11, 22), delay = -rnd(0, dur), sway = rnd(2.5, 5);
    const style = `left:${rnd(0, 100).toFixed(1)}%;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s`;
    if (kind === "xmas") {
      const s = rnd(3, 8).toFixed(1);
      h += `<div class="flake snow" style="${style};opacity:${rnd(.45, .95).toFixed(2)}"><i style="width:${s}px;height:${s}px;animation-duration:${sway.toFixed(1)}s"></i></div>`;
    } else {
      h += `<div class="flake" style="${style};opacity:${rnd(.55, .9).toFixed(2)}"><i style="animation-duration:${sway.toFixed(1)}s">${flag(rnd(12, 22))}</i></div>`;
    }
  }
  return h;
}
