// @ts-nocheck -- string-template SVG code carried over as-is from the artifact
/* Seasonal decorations, ported from the Claude artifact. Pure string builders: no DOM access. */
import type { Season } from "@/lib/season";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export function garland(kind: Season): string {
  const W=860,H=64,n=kind==="xmas"?15:13; const sag=22;
  const y=x=>8+sag*4*(x/W)*(1-x/W);
  let s=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8 Q ${W/2} ${8+sag*2} ${W} 8" fill="none" stroke="${kind==="xmas"?"var(--accent)":"var(--muted)"}" stroke-width="1.5" opacity=".6"/>`;
  if(kind==="xmas") s+=`<defs><pattern id="weave" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="5" height="5" fill="#c8102e"/><rect width="2.5" height="2.5" fill="#fff"/><rect x="2.5" y="2.5" width="2.5" height="2.5" fill="#fff"/></pattern></defs>`;
  for(let i=1;i<=n;i++){
    const x=i*W/(n+1), yy=y(x);
    if(kind==="xmas"){
      const k=Math.floor(i/2)%3;
      if(i%2===0){ // flettet julehjerte
        const cy=yy+15;
        s+=`<line x1="${x}" y1="${yy}" x2="${x}" y2="${cy-5}" stroke="var(--muted)" stroke-width="1"/>
          <path transform="translate(${x} ${cy}) scale(1.25)" d="M0 6 L-7 -1 A4.05 4.05 0 0 1 0 -5 A4.05 4.05 0 0 1 7 -1 Z" fill="url(#weave)" stroke="#a50d26" stroke-width=".6"/>`;
      } else if(k===0){ // stjerne
        const r=7, pts=[...Array(10)].map((_,j)=>{const a=-Math.PI/2+j*Math.PI/5, rr=j%2?r*.45:r; return (x+rr*Math.cos(a)).toFixed(1)+","+(yy+14+rr*Math.sin(a)).toFixed(1)}).join(" ");
        s+=`<line x1="${x}" y1="${yy}" x2="${x}" y2="${yy+7}" stroke="var(--muted)" stroke-width="1"/><polygon points="${pts}" fill="var(--gold)"/>`;
      } else { // julekugle
        const c=k===1?"var(--berry)":"var(--accent)";
        s+=`<line x1="${x}" y1="${yy}" x2="${x}" y2="${yy+6}" stroke="var(--muted)" stroke-width="1"/>
          <rect x="${x-2.5}" y="${yy+5}" width="5" height="3" rx="1" fill="var(--gold)"/>
          <circle cx="${x}" cy="${yy+16}" r="8" fill="${c}"/><circle cx="${x-2.6}" cy="${yy+13.4}" r="2" fill="#fff" opacity=".35"/>`;
      }
    } else { // Dannebrog-flag på snor
      const w=30,h=22,fx=x-w/2,fy=yy+2;
      s+=`<g transform="rotate(${(i%2?-3:3)} ${x} ${yy})"><rect x="${fx}" y="${fy}" width="${w}" height="${h}" fill="#c8102e"/>
        <rect x="${fx+10}" y="${fy}" width="4" height="${h}" fill="#fff"/><rect x="${fx}" y="${fy+9}" width="${w}" height="4" fill="#fff"/></g>`;
    }
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
