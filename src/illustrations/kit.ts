/**
 * Kleines Zeichenwerkzeug für die Erklärillustrationen.
 * Alle Motive werden in einem 320 × 180-Koordinatensystem gezeichnet.
 * detail = false → Kachelversion (nur Hauptbeschriftungen, große Schrift)
 * detail = true  → Detailversion (zusätzliche Beschriftungen, Rechenhinweise)
 * Farben werden immer durch Schraffur, Symbol oder Text ergänzt.
 */
export const C = {
  ink: "#17253D",
  muted: "#4A5872",
  line: "#C3CCDB",
  soft: "#EEF2F9",
  bg: "#F6F8FC",
  white: "#FFFFFF",
  accent: "#3D4AE8",
  accentSoft: "#E3E6FD",
  teal: "#0D766E",
  tealSoft: "#D5EFEC",
  rose: "#B4235A",
  roseSoft: "#F9DFE8",
  amber: "#9A4D00",
  amberSoft: "#FCEBD3",
  grey: "#AEB8C8",
  greySoft: "#E4E9F1",
} as const;

export const HATCH = {
  accent: "url(#h-accent)",
  teal: "url(#h-teal)",
  rose: "url(#h-rose)",
  amber: "url(#h-amber)",
};

export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Deutsche Zahl für Beschriftungen. */
export function n(v: number, decimals?: number): string {
  const s =
    decimals !== undefined
      ? v.toFixed(decimals)
      : String(Math.round(v * 10000) / 10000);
  const [i, f] = s.replace("-", "").split(".");
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (v < 0 ? "−" : "") + g + (f ? `,${f}` : "");
}
export const eur = (v: number, d?: number) => `${n(v, d)} €`;

interface TextOpts {
  s?: number;
  w?: number;
  c?: string;
  a?: "start" | "middle" | "end";
}
export const T = (x: number, y: number, str: string, o: TextOpts = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.s ?? 12}" font-weight="${o.w ?? 500}" fill="${o.c ?? C.ink}" text-anchor="${o.a ?? "start"}">${esc(str)}</text>`;

interface RectOpts {
  rx?: number;
  stroke?: string;
  sw?: number;
  dash?: boolean;
}
export const R = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  o: RectOpts = {},
) =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${o.rx ?? 3}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1.2}"` : ""}${o.dash ? ' stroke-dasharray="4 3"' : ""}/>`;

interface LineOpts {
  c?: string;
  sw?: number;
  dash?: boolean;
  arrow?: boolean;
}
export const L = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: LineOpts = {},
) =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${o.c ?? C.muted}" stroke-width="${o.sw ?? 1.4}"${o.dash ? ' stroke-dasharray="4 3"' : ""}${o.arrow ? ' marker-end="url(#arrow)"' : ""} stroke-linecap="round"/>`;

export const P = (d: string, fill: string, stroke?: string, sw = 1.4) =>
  `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ""}/>`;

export const circle = (
  x: number,
  y: number,
  rad: number,
  fill: string,
  stroke?: string,
) =>
  `<circle cx="${r(x)}" cy="${r(y)}" r="${rad}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.2"` : ""}/>`;

const r = (v: number) => Math.round(v * 100) / 100;

/** Kleine Person (Kunde, Mitarbeitende). */
export function person(x: number, y: number, size: number, fill: string) {
  const h = size * 0.38;
  return `<g>${circle(x, y + h * 0.7, h * 0.62, fill)}${P(
    `M${r(x - size * 0.42)} ${r(y + size)} Q${r(x - size * 0.42)} ${r(y + h * 1.55)} ${r(x)} ${r(y + h * 1.55)} Q${r(x + size * 0.42)} ${r(y + h * 1.55)} ${r(x + size * 0.42)} ${r(y + size)} Z`,
    fill,
  )}</g>`;
}

/** Klammer über (up) oder unter einer Strecke mit Beschriftung. */
export function bracket(
  x1: number,
  x2: number,
  y: number,
  label: string,
  o: { up?: boolean; c?: string; s?: number; w?: number } = {},
) {
  const d = o.up === false ? 5 : -5;
  const c = o.c ?? C.muted;
  const ly = o.up === false ? y + 16 : y - 7;
  return `${P(`M${r(x1)} ${r(y)} v${d} H${r(x2)} v${-d}`, "none", c, 1.2)}${T((x1 + x2) / 2, ly + (o.up === false ? 0 : d), label, { s: o.s ?? 11, c: o.w ? C.ink : c, a: "middle", w: o.w ?? 500 })}`;
}

/** Häkchen- oder Kreuz-Symbol (nicht nur Farbe). */
export const check = (x: number, y: number, c: string) =>
  P(`M${x - 4} ${y} l3 3.5 l6 -7`, "none", c, 2);
export const cross = (x: number, y: number, c: string) =>
  P(`M${x - 4} ${y - 4} l8 8 M${x + 4} ${y - 4} l-8 8`, "none", c, 2);

/** Rahmen-SVG mit Mustern, Pfeilspitze und „Beispiel“-Hinweis. */
export function frame(
  body: string,
  detail: boolean,
  title: string,
  label = "Beispiel",
) {
  const pat = (id: string, c: string) =>
    `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${c}"/><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" stroke-opacity="0.38" stroke-width="2.4"/></pattern>`;
  const bw = label.length * 5.6 + 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="${detail ? 640 : 320}" height="${detail ? 360 : 180}" font-family="'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif" role="img"><title>${esc(title)}</title><defs>${pat("h-accent", C.accent)}${pat("h-teal", C.teal)}${pat("h-rose", C.rose)}${pat("h-amber", C.amber)}<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${C.muted}"/></marker></defs><rect width="320" height="180" fill="${C.bg}"/>${body}<g>${R(314 - bw, 6, bw, 15, C.white, { rx: 7.5, stroke: C.line, sw: 1 })}${T(314 - bw / 2, 16.8, label, { s: 9, w: 600, c: C.muted, a: "middle" })}</g></svg>`;
}

export type Draw = (detail: boolean) => string;
