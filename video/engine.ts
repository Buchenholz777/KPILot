/**
 * KPILot Motion-Engine: zeitgesteuerte 2D-Vektoranimation als reine Funktion „Zeit → SVG“.
 *
 * Jede Szene ist deterministisch: derselbe Zeitpunkt erzeugt immer dasselbe Bild. Dadurch lässt sich jedes Video
 * reproduzierbar Frame für Frame rendern (video/render.ts) und einzelne Frames lassen sich prüfen.
 * Format: 1920 × 1080, 30 fps. Unten (y > 930) bleibt Platz für Untertitel des Players.
 */

export const W = 1920;
export const H = 1080;
export const FPS = 30;

/* ---------------- Designsystem (abgeleitet aus src/styles/tokens.css) ---------------- */
export const C = {
  navy: "#0B1730",
  navy2: "#102246",
  ink: "#17253D",
  muted: "#4A5872",
  line: "#C3CCDB",
  paper: "#F6F8FC",
  paper2: "#EEF2F8",
  white: "#FFFFFF",
  accent: "#4338CA",
  accent2: "#5B5BF0",
  accentSoft: "#E3E6FD",
  teal: "#0F766E",
  tealSoft: "#D5EFEC",
  rose: "#B4235A",
  roseSoft: "#F9DFE8",
  amber: "#B45309",
  amberSoft: "#FCEBD3",
  gold: "#E9A93A",
  goldSoft: "#FFF1D2",
  skin: "#F1C7A4",
  hair: "#3A2A22",
  sky: "#A5B4FC",
} as const;

export const FONT = "Inter, 'DejaVu Sans', Arial, sans-serif";

/* ---------------- Zeit und Bewegung ---------------- */
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
/** Leichter Überschwinger (für „Ankommen“ von Objekten), ohne Hektik. */
export const easeBack = (x: number) => {
  const c1 = 1.2,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** Fortschritt 0…1 zwischen a und b (Sekunden). */
export const p = (t: number, a: number, b: number, ease: (x: number) => number = easeInOut) => ease(clamp((t - a) / (b - a)));
/** Ein- und Ausblenden eines Elements, das von a bis b sichtbar ist. */
export const vis = (t: number, a: number, b: number, fadeIn = 0.45, fadeOut = 0.45) =>
  Math.min(p(t, a, a + fadeIn, easeOut), 1 - p(t, b - fadeOut, b, easeIn));

/* ---------------- SVG-Bausteine ---------------- */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f = (n: number) => (Math.round(n * 10) / 10).toString();

export const g = (inner: string, o: { x?: number; y?: number; s?: number; r?: number; o?: number; ox?: number; oy?: number } = {}) => {
  if (o.o !== undefined && o.o <= 0.001) return "";
  const tr: string[] = [];
  if (o.x || o.y) tr.push(`translate(${f(o.x ?? 0)} ${f(o.y ?? 0)})`);
  if (o.r) tr.push(`rotate(${f(o.r)} ${f(o.ox ?? 0)} ${f(o.oy ?? 0)})`);
  if (o.s !== undefined && o.s !== 1) tr.push(`translate(${f(o.ox ?? 0)} ${f(o.oy ?? 0)}) scale(${o.s.toFixed(4)}) translate(${f(-(o.ox ?? 0))} ${f(-(o.oy ?? 0))})`);
  return `<g${tr.length ? ` transform="${tr.join(" ")}"` : ""}${o.o !== undefined && o.o < 1 ? ` opacity="${o.o.toFixed(3)}"` : ""}>${inner}</g>`;
};

export interface Paint {
  fill?: string;
  stroke?: string;
  sw?: number;
  rx?: number;
  o?: number;
  dash?: string;
}
const paint = (s: Paint, defFill = "none") =>
  `fill="${s.fill ?? defFill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.sw ?? 4}" stroke-linejoin="round" stroke-linecap="round"` : ""}${s.o !== undefined ? ` opacity="${s.o.toFixed(3)}"` : ""}${s.dash ? ` stroke-dasharray="${s.dash}"` : ""}`;

export const rect = (x: number, y: number, w: number, h: number, s: Paint = {}) =>
  w <= 0 || h <= 0 ? "" : `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${s.rx ?? 0}" ${paint(s, C.white)}/>`;
export const circle = (cx: number, cy: number, r: number, s: Paint = {}) => (r <= 0 ? "" : `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" ${paint(s, C.white)}/>`);
export const path = (d: string, s: Paint = {}) => `<path d="${d}" ${paint(s)}/>`;
export const line = (x1: number, y1: number, x2: number, y2: number, s: Paint = {}) =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${paint({ stroke: C.ink, ...s })}/>`;

export interface TextOpts {
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  o?: number;
  ls?: number;
  font?: string;
  /** Heller Rand hinter dem Text (lesbar auf Schraffuren). */
  halo?: string;
}
export const text = (x: number, y: number, s: string, o: TextOpts = {}) =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${o.font ?? FONT}" font-size="${o.size ?? 44}" font-weight="${o.weight ?? 600}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}"${o.halo ? ` stroke="${o.halo}" stroke-width="12" stroke-linejoin="round" paint-order="stroke"` : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.o !== undefined ? ` opacity="${o.o.toFixed(3)}"` : ""}>${esc(s)}</text>`;

/** Text, der weich von unten einblendet (Lesbarkeit vor Effekt). */
export const textIn = (t: number, at: number, x: number, y: number, s: string, o: TextOpts = {}, dur = 0.5) => {
  const k = p(t, at, at + dur, easeOut);
  return k <= 0 ? "" : text(x, y + (1 - k) * 18, s, { ...o, o: k * (o.o ?? 1) });
};

/** Zahl, die nachvollziehbar hochzählt; das Endergebnis steht exakt da. */
export const countUp = (value: number, k: number, fmt: (n: number) => string) => fmt(k >= 1 ? value : Math.round(value * k));

export const eur = (n: number, digits = 0) => `${n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`;
export const num = (n: number, digits = 0) => n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/* ---------------- Gemeinsame Illustrationen ---------------- */

export type Mood = "neutral" | "happy" | "thinking" | "worried" | "surprised";

/**
 * „Kalle“, der wiederkehrende KPILot-Unternehmer. Immer gleich gebaut: runder Kopf, kurze dunkle Haare,
 * indigo Pullover mit türkisem Kragen, navy Hose. Fußpunkt (x, y), Höhe ca. 360 px bei s = 1.
 */
export function kalle(x: number, y: number, o: { s?: number; mood?: Mood; look?: -1 | 1; arm?: "down" | "wave" | "point" | "think" | "hold"; t?: number; bob?: boolean } = {}) {
  const s = o.s ?? 1,
    t = o.t ?? 0,
    mood = o.mood ?? "neutral",
    look = o.look ?? 1,
    arm = o.arm ?? "down";
  const bob = o.bob === false ? 0 : Math.sin(t * 2.2) * 3; // ruhiges Atmen
  const blink = (t % 3.7) > 3.55; // gelegentliches Blinzeln
  const st = { stroke: C.ink, sw: 5 };
  let b = "";
  // Beine
  b += rect(-40, -120, 34, 120, { fill: C.navy2, ...st, rx: 14 }) + rect(6, -120, 34, 120, { fill: C.navy2, ...st, rx: 14 });
  b += rect(-50, -14, 50, 22, { fill: C.ink, rx: 11 }) + rect(4, -14, 50, 22, { fill: C.ink, rx: 11 });
  // Körper
  const body = g(
    rect(-70, -290, 140, 185, { fill: C.accent, ...st, rx: 52 }) +
      path("M -34 -288 Q 0 -250 34 -288", { stroke: C.teal, sw: 10 }) +
      // Arme
      (arm === "wave"
        ? path(`M 60 -250 Q 110 -${300 + Math.sin(t * 6) * 18} 120 -${350 + Math.sin(t * 6) * 22}`, { stroke: C.accent, sw: 30 }) + circle(122, -352 - Math.sin(t * 6) * 22, 18, { fill: C.skin, ...st })
        : arm === "point"
          ? path(`M 60 -245 Q 120 -250 170 -270`, { stroke: C.accent, sw: 30 }) + circle(176, -272, 17, { fill: C.skin, ...st })
          : arm === "think"
            ? path(`M 55 -245 Q 95 -200 40 -330`, { stroke: C.accent, sw: 30 }) + circle(36, -336, 17, { fill: C.skin, ...st })
            : arm === "hold"
              ? path(`M 60 -245 Q 110 -200 120 -175`, { stroke: C.accent, sw: 30 }) + circle(122, -172, 17, { fill: C.skin, ...st })
              : path(`M 62 -250 Q 86 -200 80 -150`, { stroke: C.accent, sw: 30 }) + circle(80, -142, 17, { fill: C.skin, ...st })) +
      path(`M -62 -250 Q -86 -200 -80 -150`, { stroke: C.accent, sw: 30 }) +
      circle(-80, -142, 17, { fill: C.skin, ...st }),
    { y: bob * 0.5 },
  );
  b += body;
  // Kopf
  const ex = look * 8;
  let face = circle(0, -360, 72, { fill: C.skin, ...st });
  face += path("M -72 -372 Q -70 -446 0 -446 Q 66 -446 74 -378 Q 40 -410 -10 -404 Q -46 -398 -72 -372 Z", { fill: C.hair, stroke: C.ink, sw: 5 });
  face += blink ? line(-30 + ex, -362, -16 + ex, -362, { sw: 5 }) + line(16 + ex, -362, 30 + ex, -362, { sw: 5 }) : circle(-23 + ex, -362, 8, { fill: C.ink }) + circle(23 + ex, -362, 8, { fill: C.ink });
  const brow = mood === "worried" ? 6 : mood === "surprised" ? -8 : mood === "thinking" ? -3 : 0;
  face += line(-36 + ex, -386 - brow, -12 + ex, -389 + (mood === "worried" ? 4 : 0), { sw: 5 }) + line(12 + ex, -389 + (mood === "thinking" ? -6 : mood === "worried" ? 4 : 0), 36 + ex, -386 - brow, { sw: 5 });
  face +=
    mood === "happy"
      ? path(`M ${-24 + ex} -330 Q ${ex} -306 ${24 + ex} -330`, { stroke: C.ink, sw: 6 })
      : mood === "worried"
        ? path(`M ${-20 + ex} -320 Q ${ex} -334 ${20 + ex} -320`, { stroke: C.ink, sw: 6 })
        : mood === "surprised"
          ? circle(ex, -324, 11, { fill: C.ink })
          : mood === "thinking"
            ? path(`M ${-14 + ex} -324 L ${18 + ex} -330`, { stroke: C.ink, sw: 6 })
            : path(`M ${-18 + ex} -326 Q ${ex} -316 ${18 + ex} -326`, { stroke: C.ink, sw: 6 });
  face += circle(-44 + ex, -336, 10, { fill: "#F29C8C", o: 0.45 }) + circle(44 + ex, -336, 10, { fill: "#F29C8C", o: 0.45 });
  b += g(face, { y: bob });
  return g(g(b, { s, ox: 0, oy: 0 }), { x, y });
}

/** Sprechblase mit (max. 2) Zeilen. Pfeil zeigt nach unten links (tx) zum Sprecher. */
export function bubble(t: number, at: number, until: number, x: number, y: number, w: number, lines: string[], o: { size?: number; tail?: "left" | "right"; tone?: "white" | "accent" | "teal" | "rose" } = {}) {
  const k = vis(t, at, until, 0.35, 0.35);
  if (k <= 0) return "";
  const size = o.size ?? 44,
    h = 44 + lines.length * size * 1.25;
  const tone = o.tone ?? "white";
  const fill = tone === "accent" ? C.accentSoft : tone === "teal" ? C.tealSoft : tone === "rose" ? C.roseSoft : C.white;
  const tx = o.tail === "right" ? x + w - 90 : x + 70;
  let s = rect(x, y, w, h, { fill, stroke: C.ink, sw: 5, rx: 34 });
  s += path(`M ${tx} ${y + h - 3} L ${tx + (o.tail === "right" ? 30 : -10)} ${y + h + 46} L ${tx + 46} ${y + h - 3}`, { fill, stroke: C.ink, sw: 5 });
  s += rect(tx + 4, y + h - 8, 40, 10, { fill });
  lines.forEach((l, i) => (s += text(x + 36, y + 32 + size * (i + 0.95) * 1.2, l, { size, weight: 600 })));
  const sc = 0.9 + 0.1 * easeBack(clamp((t - at) / 0.35));
  return g(s, { o: k, s: sc, ox: tx, oy: y + h + 40 });
}

/** Münze mit Euro-Zeichen. */
export const coin = (x: number, y: number, r = 34, o = 1) =>
  g(circle(x, y, r, { fill: C.gold, stroke: C.ink, sw: 4 }) + circle(x, y, r * 0.7, { fill: "none", stroke: "#B9781F", sw: 3 }) + text(x, y + r * 0.42, "€", { size: r * 1.05, weight: 800, fill: "#7A4A0E", anchor: "middle" }), { o });

/** Paket/Produkt mit Preisschild. */
export const product = (x: number, y: number, s = 1, color: string = C.teal, label?: string) =>
  g(
    rect(-60, -100, 120, 100, { fill: color, stroke: C.ink, sw: 5, rx: 12 }) +
      path("M -60 -70 L 60 -70", { stroke: C.ink, sw: 4 }) +
      rect(-14, -100, 28, 30, { fill: C.white, stroke: C.ink, sw: 4, rx: 4 }) +
      (label ? rect(18, -40, 92, 46, { fill: C.white, stroke: C.ink, sw: 4, rx: 10 }) + text(64, -6, label, { size: 30, weight: 800, anchor: "middle" }) : ""),
    { x, y, s, ox: 0, oy: 0 },
  );

/** Karte mit Schatten (für Rechenkästen, Kontostand usw.). */
export const card = (x: number, y: number, w: number, h: number, inner = "", fill: string = C.white) =>
  rect(x + 8, y + 12, w, h, { fill: "#0B1730", o: 0.08, rx: 28 }) + rect(x, y, w, h, { fill, stroke: C.ink, sw: 5, rx: 28 }) + inner;

/** Pfeil von (x1,y1) nach (x2,y2), progressiv gezeichnet (k = 0…1). */
export function arrow(x1: number, y1: number, x2: number, y2: number, k: number, o: { color?: string; sw?: number; bend?: number } = {}) {
  if (k <= 0) return "";
  const color = o.color ?? C.ink,
    sw = o.sw ?? 7,
    bend = o.bend ?? 0;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend,
    my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const len = Math.hypot(x2 - x1, y2 - y1) * (1 + Math.abs(bend));
  let s = `<path d="M ${f(x1)} ${f(y1)} Q ${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${f(len)}" stroke-dashoffset="${f(len * (1 - k))}"/>`;
  if (k > 0.92) {
    const a = Math.atan2(y2 - my, x2 - mx);
    const hx = (d: number, ang: number) => `${f(x2 - d * Math.cos(a + ang))} ${f(y2 - d * Math.sin(a + ang))}`;
    s += `<path d="M ${hx(30, 0.45)} L ${f(x2)} ${f(y2)} L ${hx(30, -0.45)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${((k - 0.92) / 0.08).toFixed(2)}"/>`;
  }
  return s;
}

/** Schraffur-Muster (Bedeutung nicht nur über Farbe). */
export const defs = () =>
  `<defs>
    <pattern id="hatchRose" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="${C.roseSoft}"/><line x1="0" y1="0" x2="0" y2="18" stroke="${C.rose}" stroke-width="5"/></pattern>
    <pattern id="hatchTeal" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${C.tealSoft}"/><circle cx="9" cy="9" r="3.5" fill="${C.teal}"/></pattern>
    <pattern id="hatchAccent" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="18" height="18" fill="${C.accentSoft}"/><line x1="0" y1="0" x2="0" y2="18" stroke="${C.accent}" stroke-width="5"/></pattern>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAFBFE"/><stop offset="1" stop-color="${C.paper2}"/></linearGradient>
    <linearGradient id="navyGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.navy2}"/></linearGradient>
  </defs>`;

/** Hintergrund mit feinem Koordinatenraster (KPILot-Markenbild) und Kapitelkennung. */
export function backdrop(chapter: string, step: string) {
  let s = rect(0, 0, W, H, { fill: "url(#bgGrad)" });
  for (let x = 0; x <= W; x += 80) s += line(x, 0, x, H, { stroke: "#E2E7F1", sw: 1.5 });
  for (let y = 0; y <= H; y += 80) s += line(0, y, W, y, { stroke: "#E2E7F1", sw: 1.5 });
  s += rect(56, 44, 22, 22, { fill: C.accent, rx: 6 }) + text(92, 64, "KPILot", { size: 30, weight: 800, fill: C.navy });
  s += text(W - 60, 64, `${step} · ${chapter}`, { size: 28, weight: 600, fill: C.muted, anchor: "end" });
  return s;
}

/** Titelkarte zu Beginn (dunkle KPILot-Markenfläche, ruhige Einblendung). */
export function titleCard(t: number, kicker: string, title: string[], until = 3.2) {
  const k = 1 - p(t, until - 0.5, until, easeIn);
  if (k <= 0) return "";
  let s = rect(0, 0, W, H, { fill: "url(#navyGrad)" });
  for (let i = 0; i < 9; i++) s += line(0, 140 + i * 110, W, 140 + i * 110 - 60, { stroke: "#ffffff", sw: 1.2, o: 0.06 });
  s += path(`M 0 ${900} C 500 860, 900 760, 1300 600 S 1800 360, 1920 300`, { stroke: C.sky, sw: 5, o: 0.35 * p(t, 0, 1.6) });
  s += g(rect(0, 0, 30, 30, { fill: C.sky, rx: 8 }) + text(48, 26, "KPILot", { size: 36, weight: 800, fill: C.white }), { x: 140, y: 230, o: p(t, 0.1, 0.6) });
  s += textIn(t, 0.25, 140, 360, kicker.toUpperCase(), { size: 34, weight: 700, fill: C.sky, ls: 4 });
  title.forEach((l, i) => (s += textIn(t, 0.5 + i * 0.25, 140, 470 + i * 104, l, { size: 92, weight: 800, fill: C.white }, 0.7)));
  return g(s, { o: k });
}

/** Abschlusskarte: Erkenntnis + „Jetzt selbst mit KPILot berechnen“. */
export function outroCard(t: number, at: number, insight: string[], pathLabel: string) {
  const k = p(t, at, at + 0.6);
  if (k <= 0) return "";
  let s = rect(0, 0, W, H, { fill: "url(#navyGrad)" });
  s += textIn(t, at + 0.3, 140, 220, "DAS NIMMST DU MIT", { size: 34, weight: 700, fill: C.sky, ls: 4 });
  insight.forEach((l, i) => (s += textIn(t, at + 0.5 + i * 0.2, 140, 320 + i * 86, l, { size: 70, weight: 800, fill: C.white }, 0.6)));
  const by = 320 + insight.length * 86 + 30;
  const kb = p(t, at + 1.2, at + 1.8, easeOut);
  s += g(rect(0, 0, 920, 120, { fill: C.white, rx: 60 }) + text(64, 78, "Jetzt selbst mit KPILot berechnen", { size: 44, weight: 800, fill: C.accent }) + path("M 836 60 l 34 0 m -16 -18 l 18 18 l -18 18", { stroke: C.accent, sw: 7 }), { x: 140, y: by, o: kb, s: 0.95 + 0.05 * kb, ox: 0, oy: 60 });
  s += textIn(t, at + 1.6, 1110, by + 76, `my-kpilot.de${pathLabel}`, { size: 38, weight: 600, fill: C.sky });
  return g(s, { o: k });
}

/** Beschrifteter Szenentitel oben links (eine zentrale Erkenntnis pro Szene). */
export const sceneTitle = (t: number, at: number, s: string, until = 999) => g(textIn(t, at, 140, 190, s, { size: 58, weight: 800, fill: C.navy }), { o: vis(t, at, until, 0.01, 0.4) });

/** Hilfsfunktion: Szene nur innerhalb [a, b] sichtbar (weiche Blende). */
export const scene = (t: number, a: number, b: number, render: (lt: number) => string, fade = 0.5) => {
  if (t < a - 0.01 || t > b + 0.01) return "";
  const o = vis(t, a, b, fade, fade);
  return o <= 0 ? "" : g(render(t - a), { o });
};

export interface VideoDef {
  id: string;
  duration: number;
  render(t: number): string;
}

/** Vollständiges Bild (SVG) eines Zeitpunkts. */
export const frameSvg = (v: VideoDef, t: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${v.render(t)}</svg>`;

/* ---------------- Erzähltext (synchron eingeblendet) ---------------- */

/** Grober Zeilenumbruch nach geschätzter Textbreite (Inter, halbfett ≈ 0,55 em pro Zeichen). */
export function wrap(s: string, maxWidth: number, size: number) {
  const max = Math.floor(maxWidth / (size * 0.55));
  const out: string[] = [];
  let cur = "";
  // Zahl und Einheit nie trennen („20 %“, „50 €“)
  for (const w of s.replace(/(\d) (?=[%€])/g, "$1\u00a0").split(" ")) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}

export interface Cue {
  start: number;
  end: number;
  text: string;
}

/**
 * Erzählband unten im Bild. Ersetzt die (nicht vorhandene) Sprecherstimme; dieselben Texte gibt es als WebVTT
 * und als Transkript. Bereich y ≥ 920 ist dafür reserviert.
 */
/** Render-Optionen (z. B. Vorschaubild ohne Erzählband). */
export const RENDER = { narration: true };

export function narration(t: number, cues: Cue[], dark = false) {
  if (!RENDER.narration) return "";
  const c = cues.find((c) => t >= c.start - 0.05 && t <= c.end + 0.05);
  if (!c) return "";
  const k = vis(t, c.start, c.end, 0.25, 0.25);
  const size = 46;
  const lines = wrap(c.text, 1640, size);
  const h = 38 + lines.length * size * 1.32;
  const y = 1052 - h;
  let s = rect(120, y, 1680, h, { fill: dark ? "#ffffff" : C.navy, rx: 26, o: dark ? 0.12 : 0.94 });
  s += rect(120, y, 12, h, { fill: C.sky, rx: 6 });
  lines.forEach((l, i) => (s += text(172, y + 22 + size * 1.32 * i + size * 0.98, l, { size, weight: 600, fill: C.white })));
  return g(s, { o: k, y: (1 - k) * 8 });
}

/* ---------------- Wasserfall-/Brückendiagramm ---------------- */

export interface WfItem {
  label: string;
  value: number;
  /** Summenbalken (beginnt bei 0), sonst Veränderung ab dem laufenden Stand. */
  total?: boolean;
  color: string;
  fill: string;
  /** zweite Beschriftungszeile unter der Achse */
  sub?: string;
  /** gestrichelt (z. B. „zählt noch nicht“) */
  ghost?: boolean;
}

/**
 * Proportionales Brückendiagramm: Balken wachsen nacheinander ab `at` (je `step` Sekunden).
 * Werte werden exakt maßstabsgetreu gezeichnet (min…max auf h Pixel).
 */
export function waterfall(
  t: number,
  at: number,
  items: WfItem[],
  o: { x: number; y: number; w: number; h: number; max: number; min?: number; step?: number; fmt?: (n: number) => string; signed?: boolean },
) {
  const min = o.min ?? 0,
    step = o.step ?? 1.1;
  const ky = o.h / (o.max - min);
  const base = o.y + o.max * ky;
  const vy = (v: number) => base - v * ky;
  const slot = o.w / items.length,
    bw = Math.min(220, slot * 0.62);
  const fmt = o.fmt ?? ((n: number) => eur(n));
  let s = line(o.x - 20, base, o.x + o.w + 20, base, { stroke: C.ink, sw: 5 });
  let run = 0;
  items.forEach((it, i) => {
    const k = p(t, at + i * step, at + i * step + 0.8, easeOut);
    const prev = run;
    const from = it.total ? 0 : run;
    const to = it.total ? it.value : run + it.value;
    if (!it.ghost) run = to;
    const cx = o.x + slot * (i + 0.5);
    // Verbindungslinie vom vorherigen Stand
    if (i > 0 && k > 0) s += line(cx - slot + bw / 2, vy(prev), cx - bw / 2, vy(prev), { stroke: C.muted, sw: 3, dash: "8 8", o: k });
    const cur = from + (to - from) * k;
    const top = Math.min(vy(from), vy(cur)),
      hh = Math.abs(vy(cur) - vy(from));
    if (k > 0)
      s += rect(cx - bw / 2, top, bw, Math.max(hh, 2), { fill: it.ghost ? "none" : it.fill, stroke: it.color, sw: 6, rx: 10, dash: it.ghost ? "16 12" : undefined });
    const kl = p(t, at + i * step + 0.5, at + i * step + 1.0);
    const val = it.total ? fmt(it.value) : (it.value >= 0 ? (o.signed === false ? "" : "+") : "−") + fmt(Math.abs(it.value));
    const ly = it.value >= 0 || it.total ? Math.min(vy(from), vy(to)) - 20 : Math.max(vy(from), vy(to)) + 54;
    s += g(text(cx, ly, val, { size: 46, weight: 800, fill: it.color, anchor: "middle", halo: C.paper }), { o: kl });
    s += g(text(cx, base + 52, it.label, { size: 34, weight: 700, fill: C.ink, anchor: "middle" }) + (it.sub ? text(cx, base + 92, it.sub, { size: 28, weight: 600, fill: C.muted, anchor: "middle" }) : ""), { o: p(t, at + i * step, at + i * step + 0.4) });
  });
  return s;
}

/** Bankkonto-Karte mit Kontostand. */
export const account = (x: number, y: number, label: string, amount: string, o: { w?: number; tone?: string; sub?: string } = {}) => {
  const w = o.w ?? 420;
  let s = card(0, 0, w, 200);
  s += rect(0, 0, w, 64, { fill: C.navy, rx: 28 }) + rect(0, 36, w, 28, { fill: C.navy });
  s += text(30, 44, label, { size: 30, weight: 700, fill: C.white });
  s += text(30, 140, amount, { size: 64, weight: 800, fill: o.tone ?? C.navy });
  if (o.sub) s += text(30, 182, o.sub, { size: 28, weight: 600, fill: C.muted });
  return g(s, { x, y });
};

/** Dokument/Rechnung. */
export const invoice = (x: number, y: number, amount: string, o: { s?: number; r?: number; stamp?: string } = {}) => {
  let d = card(-110, -140, 220, 280);
  d += text(-80, -90, "RECHNUNG", { size: 26, weight: 800, fill: C.navy, ls: 2 });
  for (let i = 0; i < 4; i++) d += rect(-80, -60 + i * 30, 160 - (i % 2) * 50, 10, { fill: C.line, rx: 5 });
  d += text(80, 100, amount, { size: 38, weight: 800, fill: C.navy, anchor: "end" });
  if (o.stamp) d += g(rect(-96, 0, 192, 52, { fill: C.white, stroke: C.amber, sw: 5, rx: 8 }) + text(0, 37, o.stamp, { size: 28, weight: 800, fill: C.amber, anchor: "middle" }), { r: -10, ox: 0, oy: 26 });
  return g(g(d, { s: o.s ?? 1, ox: 0, oy: 0, r: o.r ?? 0 }), { x, y });
};

/** Gestapelter Säulenbalken (von unten nach oben), maßstabsgetreu: px pro Einheit = scale. */
export function stack(
  x: number,
  base: number,
  w: number,
  scale: number,
  segs: { v: number; color: string; fill: string; label?: string; o?: number; dx?: number; dy?: number }[],
  o: { labelSize?: number; labelInside?: boolean } = {},
) {
  let s = "",
    y = base;
  for (const sg of segs) {
    const h = sg.v * scale;
    const piece =
      rect(x, y - h, w, h, { fill: sg.fill, stroke: sg.color, sw: 6, rx: 10 }) +
      (sg.label && h > 40 ? text(x + w / 2, y - h / 2 + (o.labelSize ?? 44) * 0.36, sg.label, { size: o.labelSize ?? 44, weight: 800, fill: sg.color, anchor: "middle" }) : "");
    s += g(piece, { o: sg.o ?? 1, x: sg.dx ?? 0, y: sg.dy ?? 0 });
    y -= h;
  }
  return s;
}

/** Schlichte Personen-Figur (für Besucher usw.). Fußpunkt (x, y). */
export const person = (x: number, y: number, s = 1, color: string = C.accent, o = 1) =>
  g(g(circle(0, -118, 30, { fill: C.skin, stroke: C.ink, sw: 4 }) + path("M -44 0 L -44 -50 Q -44 -84 0 -84 Q 44 -84 44 -50 L 44 0 Z", { fill: color, stroke: C.ink, sw: 4 }), { s, ox: 0, oy: 0 }), { x, y, o });

/** Browserfenster mit Titelzeile. */
export const browser = (x: number, y: number, w: number, h: number, title: string, inner = "") =>
  g(card(0, 0, w, h) + rect(0, 0, w, 60, { fill: C.paper2, rx: 28 }) + rect(0, 32, w, 28, { fill: C.paper2 }) + line(0, 60, w, 60, { stroke: C.ink, sw: 4 }) +
    circle(36, 30, 9, { fill: C.rose }) + circle(64, 30, 9, { fill: C.gold }) + circle(92, 30, 9, { fill: C.teal }) +
    rect(130, 14, w - 170, 32, { fill: C.white, stroke: C.line, sw: 2, rx: 16 }) + text(150, 39, title, { size: 22, weight: 600, fill: C.muted }) + inner, { x, y });
