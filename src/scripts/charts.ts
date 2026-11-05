/**
 * Zeichnet ChartSpec (siehe src/calc/chart-types.ts) als SVG-Text. Keine Rechenlogik: alle Zahlen und Texte kommen fertig aus der Aufbereitung.
 * Die Breite richtet sich nach dem Container, damit Schrift auch auf kleinen Bildschirmen lesbar bleibt.
 * Jede Grafik hat Titel, sichtbare Datenlabel, einen erklärenden Satz, eine Legende und eine aufklappbare Tabellenalternative.
 */
import type {
  BarsChart,
  HBarsChart,
  BridgeChart,
  ChartOutcome,
  ChartSpec,
  CompositionChart,
  LinesChart,
  MeterChart,
  ScaleChart,
} from "../calc/chart-types";

export const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const C = { ink: "#17253D", muted: "#4A5872", accent: "#3D4AE8", teal: "#0D766E", rose: "#B4235A", grid: "#DDE3EE", greySoft: "#E4E9F1", greyLine: "#6B7A93", bg: "#FFFFFF" };
const TONE = { ink: C.ink, accent: C.accent, teal: C.teal } as const;
const FS = 12;

/** Kennungen sind je Aufruf von renderChartArea deterministisch (gleiche Eingabe → gleicher HTML-Text), damit unveränderte Ausgaben nicht neu geschrieben werden müssen. */
let uidN = 0;
let uidPrefix = "c";
const uid = () => `${uidPrefix}${++uidN}`;

/** Muster, damit Bedeutung nicht nur über Farbe getragen wird. */
const defs = (id: string) =>
  `<defs>
    <pattern id="${id}-acc" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#E3E6FD"/><line x1="0" y1="0" x2="0" y2="6" stroke="${C.accent}" stroke-width="2"/></pattern>
    <pattern id="${id}-rose" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#F9DFE8"/><line x1="0" y1="0" x2="0" y2="6" stroke="${C.rose}" stroke-width="2"/></pattern>
    <pattern id="${id}-teal" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#D5EFEC"/><circle cx="3" cy="3" r="1.4" fill="${C.teal}"/></pattern>
    <pattern id="${id}-grey" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${C.greySoft}"/></pattern>
  </defs>`;
const FILL = (id: string) => ({ acc: `url(#${id}-acc)`, rose: `url(#${id}-rose)`, teal: `url(#${id}-teal)`, grey: `url(#${id}-grey)` });

/** Text mit heller Kontur, damit Beschriftungen über Linien und Flächen lesbar bleiben. */
interface TextOpts {
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  lh?: number;
}
const text = (x: number, y: number, s: string, o: TextOpts = {}) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.size ?? FS}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">${escHtml(s)}</text>`;

/** Bricht Text in Zeilen mit höchstens n Zeichen (lange Wörter werden mit Bindestrich getrennt). */
export function wrap(s: string, n: number): string[] {
  const out: string[] = [];
  let line = "";
  // Zahl und Einheit zusammenhalten („200 Stück“, „16.000,00 €“)
  const glued = s.replace(/(\d) (Stück|Einheiten|€|%|Tage|h)(?![\p{L}])/gu, "$1\u00a0$2");
  for (let w of glued.split(/ +/)) {
    while (w.length > n) {
      if (line) {
        out.push(line);
        line = "";
      }
      out.push(w.slice(0, n - 1) + "-");
      w = w.slice(n - 1);
    }
    if (!line) line = w;
    else if ((line + " " + w).length <= n) line += " " + w;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}
const charsFor = (px: number, size = FS) => Math.max(4, Math.floor(px / (size * 0.52)));
const lines = (x: number, y: number, ls: string[], o: TextOpts = {}) =>
  ls.map((l, k) => text(x, y + k * (o.lh ?? 14), l, o)).join("");

/** „Schöne“ Achsenschritte. */
export function niceTicks(min: number, max: number, count = 5): { min: number; max: number; ticks: number[] } {
  if (!(max > min)) {
    max = min + 1;
  }
  const raw = (max - min) / count;
  const e = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / e;
  const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.abs(v) < step / 1e6 ? 0 : v);
  return { min: lo, max: hi, ticks };
}

const shell = (W: number, H: number, id: string, label: string, inner: string) =>
  `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escHtml(label)}" focusable="false">${defs(id)}${inner}</svg>`;

/* ---------------- Linien ---------------- */
function interp(pts: { x: number; y: number }[], x: number): number {
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1],
      b = pts[k];
    if (x <= b.x || k === pts.length - 1) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x || 1);
  }
  return pts[0].y;
}

function renderLines(c: LinesChart, id: string, Wc: number, sel: number | undefined) {
  const W = Wc,
    H = Math.round(Math.min(340, Math.max(250, W * 0.58)));
  const ml = 62,
    mr = 14,
    mt = 14,
    mb = 52;
  const w = W - ml - mr,
    h = H - mt - mb;
  const allY = [...c.series.flatMap((s) => s.points.map((p) => p.y)), ...(c.hlines ?? []).map((l) => l.y), ...(c.markers ?? []).map((m) => m.y), 0];
  const yt = niceTicks(Math.min(...allY), Math.max(...allY), 4);
  const xt = niceTicks(0, c.xMax, Math.max(3, Math.min(6, Math.floor(w / 80))));
  const X = (x: number) => ml + ((x - xt.min) / (xt.max - xt.min)) * w;
  const Y = (y: number) => mt + h - ((y - yt.min) / (yt.max - yt.min)) * h;
  const F = FILL(id);
  let g = "";
  for (const t of yt.ticks) g += `<line x1="${ml}" y1="${Y(t).toFixed(1)}" x2="${ml + w}" y2="${Y(t).toFixed(1)}" stroke="${t === 0 ? C.ink : C.grid}" stroke-width="${t === 0 ? 1.4 : 1}"/>` + text(ml - 6, Y(t) + 4, c.yFormat(t), { size: 11, anchor: "end", fill: C.muted });
  for (const t of xt.ticks) g += `<line x1="${X(t).toFixed(1)}" y1="${mt + h}" x2="${X(t).toFixed(1)}" y2="${mt + h + 4}" stroke="${C.ink}"/>` + text(X(t), mt + h + 17, c.xFormat(t), { size: 11, anchor: "middle", fill: C.muted });
  g += `<line x1="${X(0)}" y1="${mt}" x2="${X(0)}" y2="${mt + h}" stroke="${C.ink}" stroke-width="1.4"/>`;
  g += text(ml + w / 2, H - 6, c.xLabel, { size: 12, anchor: "middle", fill: C.muted });
  g += `<text transform="translate(12 ${mt + h / 2}) rotate(-90)" font-size="12" fill="${C.muted}" text-anchor="middle" font-weight="500">${escHtml(c.yLabel)}</text>`;
  for (const r of c.regions ?? []) {
    const pts = r.points.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
    g += `<polygon points="${pts}" fill="${r.pattern === "loss" ? F.rose : F.teal}" opacity="0.9"/>`;
  }
  for (const l of c.hlines ?? []) g += `<line x1="${ml}" y1="${Y(l.y).toFixed(1)}" x2="${ml + w}" y2="${Y(l.y).toFixed(1)}" stroke="${C.muted}" stroke-dasharray="3 3"/>` + text(ml + 6, Y(l.y) - 5, l.label, { size: 11, anchor: "start", fill: C.muted });
  const dash = { solid: "", dashed: ' stroke-dasharray="9 5"', dotted: ' stroke-dasharray="2 5"' } as const;
  for (const s of c.series) g += `<path d="${s.points.map((p, k) => `${k ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(" ")}" fill="none" stroke="${TONE[s.tone]}" stroke-width="2.8"${dash[s.style]} stroke-linejoin="round"/>`;
  for (const r of c.regions ?? []) g += text(X(r.labelAt.x), Y(r.labelAt.y) + 4, r.label, { size: 11, anchor: "middle", weight: 700, fill: r.pattern === "loss" ? C.rose : C.teal });
  for (const m of c.markers ?? []) {
    const px = X(m.x),
      py = Y(m.y);
    if (m.kind === "intersection" && m.x > 0) g += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${mt + h}" stroke="${C.muted}" stroke-dasharray="3 3"/>`;
    g += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5.5" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
    // Beschriftung dorthin, wo bei steigenden Linien Platz ist: links oben (rechte Plothälfte) bzw. rechts unten
    const pos = m.pos ?? (px > ml + w * 0.55 ? "tl" : "br");
    const left = pos === "tl" || pos === "bl";
    const above = pos === "tl" || pos === "tr";
    const room = left ? px - ml - 8 : ml + w - px - 8;
    const ls = wrap(m.label, charsFor(Math.min(230, Math.max(110, room)), 12));
    const y0 = above ? py - 12 - (ls.length - 1) * 14 : py + 22;
    g += lines(left ? px - 9 : px + 9, y0, ls, { anchor: left ? "end" : "start", weight: 700 });
  }
  let cursor = "";
  if (c.explore && sel !== undefined) {
    const st = c.explore.stops[sel];
    if (st) {
      cursor = `<line data-cursor-line x1="${X(st.x).toFixed(1)}" y1="${mt}" x2="${X(st.x).toFixed(1)}" y2="${mt + h}" stroke="${C.accent}" stroke-width="1.6"/>` + c.series.map((s, k) => `<circle data-cursor-dot="${k}" cx="${X(st.x).toFixed(1)}" cy="${Y(interp(s.points, st.x)).toFixed(1)}" r="4.5" fill="${TONE[s.tone]}" stroke="#fff" stroke-width="1.5"/>`).join("");
    }
  }
  const svg = shell(W, H, id, c.summary, g + `<g data-cursor>${cursor}</g>`);
  // Pixelpositionen für die Punktauswahl
  const geo = c.explore ? JSON.stringify(c.explore.stops.map((st) => ({ px: +X(st.x).toFixed(1), py: c.series.map((s) => +Y(interp(s.points, st.x)).toFixed(1)), lines: st.lines }))) : "";
  const legend = `<ul class="chart-legend">${c.series
    .map((s) => `<li><svg width="34" height="10" aria-hidden="true"><line x1="0" y1="5" x2="34" y2="5" stroke="${TONE[s.tone]}" stroke-width="3"${dash[s.style]}/></svg> ${escHtml(s.label)}</li>`)
    .join("")}${(c.regions ?? []).map((r) => `<li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${r.pattern === "loss" ? F.rose : F.teal}" stroke="${r.pattern === "loss" ? C.rose : C.teal}"/></svg> ${escHtml(r.label)}</li>`).join("")}</ul>`;
  return { svg, legend, geo };
}

/* ---------------- Balken ---------------- */
function renderBars(c: BarsChart, id: string, W: number) {
  const F = FILL(id);
  const n = c.panels.length;
  const cols = Math.max(1, Math.min(n, Math.floor(W / 190)));
  const rowsN = Math.ceil(n / cols);
  const gap = 14;
  let g = "";
  let yOff = 0;
  const plotH = 120;
  for (let r = 0; r < rowsN; r++) {
    const rowPanels = c.panels.slice(r * cols, r * cols + cols);
    // Panelbreite proportional zur Zahl der Balken, damit Beschriftungen Platz haben
    const totalBars = rowPanels.reduce((s, p) => s + p.bars.length, 0);
    const avail = W - gap * (rowPanels.length - 1);
    let acc = 0;
    let maxLab = 1;
    const meta = rowPanels.map((p) => {
      const pw = (avail * p.bars.length) / totalBars;
      const x0 = acc;
      acc += pw + gap;
      const slot = pw / p.bars.length;
      const chars = charsFor(slot - 4, 12);
      const labs = p.bars.map((b) => ({ l: wrap(b.label, chars), s: b.sub ? wrap(b.sub, charsFor(slot - 4, 10.5)) : [] }));
      maxLab = Math.max(maxLab, ...labs.map((x) => x.l.length + x.s.length));
      return { pw, x0, slot, labs, tl: wrap(p.title, charsFor(pw, 12)) };
    });
    const titleLines = Math.max(...meta.map((m) => m.tl.length));
    const top = yOff + titleLines * 15 + 22;
    rowPanels.forEach((p, k) => {
      const { pw, x0 } = meta[k];
      const vals = p.bars.map((b) => b.value);
      const vmin = Math.min(0, ...vals, p.ref ? Math.min(0, p.ref.value) : 0),
        vmax = Math.max(0, ...vals, p.ref?.value ?? 0, vmin === 0 && Math.max(...vals) === 0 ? 1 : 0);
      const span = vmax - vmin || 1;
      const zero = top + (vmax / span) * plotH;
      const Yv = (v: number) => top + ((vmax - v) / span) * plotH;
      g += lines(x0 + 2, yOff + 14, meta[k].tl, { size: 12, weight: 700 });
      g += `<line x1="${x0}" y1="${zero.toFixed(1)}" x2="${x0 + pw}" y2="${zero.toFixed(1)}" stroke="${C.ink}" stroke-width="1.4"/>`;
      const bw = Math.min(64, meta[k].slot - 14);
      p.bars.forEach((b, bi) => {
        const cx = x0 + meta[k].slot * (bi + 0.5);
        const y1 = Yv(b.value);
        const yTop = Math.min(zero, y1),
          hh = Math.max(2, Math.abs(zero - y1));
        const fill = b.value < 0 ? F.rose : b.emphasis ? F.acc : F.grey;
        const stroke = b.value < 0 ? C.rose : b.emphasis ? C.accent : C.greyLine;
        g += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${yTop.toFixed(1)}" width="${bw}" height="${hh.toFixed(1)}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
        const labelY = b.value < 0 ? zero + hh + 14 : yTop - 6;
        g += text(cx, labelY, b.text, { size: 12, weight: 700, anchor: "middle" });
        const m = meta[k].labs[bi];
        const base = top + plotH + 18;
        g += lines(cx, base, m.l, { size: 12, anchor: "middle", fill: C.ink });
        g += lines(cx, base + m.l.length * 14, m.s, { size: 10.5, anchor: "middle", fill: C.muted, lh: 12 });
      });
      if (p.ref) g += `<line x1="${x0}" y1="${Yv(p.ref.value).toFixed(1)}" x2="${x0 + pw}" y2="${Yv(p.ref.value).toFixed(1)}" stroke="${C.ink}" stroke-dasharray="5 4" stroke-width="1.6"/>` + text(x0 + pw - 2, Yv(p.ref.value) - 5, p.ref.label, { size: 11, anchor: "end", weight: 700 });
    });
    yOff = top + plotH + 18 + maxLab * 14 + 14;
  }
  return { svg: shell(W, Math.ceil(yOff), id, c.summary, g), legend: legendBars(c, id), H: yOff };
}
const legendBars = (c: BarsChart, id: string) => {
  const F = FILL(id);
  const hasNeg = c.panels.some((p) => p.bars.some((b) => b.value < 0));
  const hasEmph = c.panels.some((p) => p.bars.some((b) => b.emphasis));
  return `<ul class="chart-legend"><li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.grey}" stroke="${C.greyLine}"/></svg> Ausgangs- bzw. Eingabewert</li>${hasEmph ? `<li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.acc}" stroke="${C.accent}"/></svg> Ergebnis</li>` : ""}${hasNeg ? `<li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.rose}" stroke="${C.rose}"/></svg> negativer Wert (unter der Nulllinie)</li>` : ""}</ul>`;
};

/* ---------------- Brücke ---------------- */
function renderBridge(c: BridgeChart, id: string, W: number) {
  const F = FILL(id);
  const n = c.steps.length;
  let run = 0;
  const levels = c.steps.map((s) => {
    const from = s.type === "delta" ? run : 0;
    const to = s.type === "delta" ? run + s.value : s.value;
    run = to;
    return { from, to, s };
  });
  const vmin = Math.min(0, ...levels.flatMap((l) => [l.from, l.to])),
    vmax = Math.max(0, ...levels.flatMap((l) => [l.from, l.to]));
  const span = vmax - vmin || 1;
  const style = (l: (typeof levels)[number]) => {
    if (l.s.type === "delta") return l.s.value < 0 ? { fill: F.rose, stroke: C.rose } : { fill: F.teal, stroke: C.teal };
    return l.s.type === "total" ? { fill: F.acc, stroke: C.accent } : { fill: F.grey, stroke: C.greyLine };
  };
  const vertical = (W - 12) / n >= 76;
  let g = "";
  let H: number;
  if (vertical) {
    const slot = (W - 12) / n,
      bw = Math.min(58, slot - 14);
    const top = 30,
      plotH = 150;
    const Yv = (v: number) => top + ((vmax - v) / span) * plotH;
    const chars = charsFor(slot - 4, 12);
    const labs = c.steps.map((s) => wrap(s.label, chars));
    const maxL = Math.max(...labs.map((l) => l.length));
    g += `<line x1="6" y1="${Yv(0).toFixed(1)}" x2="${W - 6}" y2="${Yv(0).toFixed(1)}" stroke="${C.ink}" stroke-width="1.4"/>`;
    levels.forEach((l, k) => {
      const cx = 6 + slot * (k + 0.5);
      const y1 = Yv(l.from),
        y2 = Yv(l.to);
      const st = style(l);
      g += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${Math.min(y1, y2).toFixed(1)}" width="${bw}" height="${Math.max(2, Math.abs(y1 - y2)).toFixed(1)}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="${l.s.type === "subtotal" ? 2.4 : 1.6}"/>`;
      const up = l.to >= l.from;
      g += text(cx, up ? Math.min(y1, y2) - 6 : Math.max(y1, y2) + 15, l.s.text, { size: 12, weight: 700, anchor: "middle" });
      if (k < n - 1) g += `<line x1="${(cx + bw / 2).toFixed(1)}" y1="${Yv(l.to).toFixed(1)}" x2="${(cx + slot - bw / 2).toFixed(1)}" y2="${Yv(l.to).toFixed(1)}" stroke="${C.muted}" stroke-dasharray="3 3"/>`;
      g += lines(cx, top + plotH + 30, labs[k], { size: 12, anchor: "middle" });
    });
    H = top + plotH + 30 + maxL * 14 + 8;
  } else {
    const rowH = 44,
      left = 4,
      top = 6;
    const bx0 = left,
      bw = W - left - 8;
    const Xv = (v: number) => bx0 + ((v - vmin) / span) * (bw - 96);
    levels.forEach((l, k) => {
      const y = top + k * rowH;
      const st = style(l);
      const x1 = Xv(l.from),
        x2 = Xv(l.to);
      g += text(left, y + 12, l.s.label, { size: 12, weight: l.s.type === "delta" ? 500 : 700 });
      g += `<rect x="${Math.min(x1, x2).toFixed(1)}" y="${y + 18}" width="${Math.max(2, Math.abs(x2 - x1)).toFixed(1)}" height="16" fill="${st.fill}" stroke="${st.stroke}" stroke-width="${l.s.type === "subtotal" ? 2.4 : 1.6}"/>`;
      const end = Math.max(x1, x2);
      g += text(end + 6, y + 31, l.s.text, { size: 12, weight: 700 });
    });
    g += `<line x1="${Xv(0).toFixed(1)}" y1="${top}" x2="${Xv(0).toFixed(1)}" y2="${top + n * rowH}" stroke="${C.ink}" stroke-width="1.4"/>`;
    H = top + n * rowH + 4;
  }
  const legend = `<ul class="chart-legend"><li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.acc}" stroke="${C.accent}"/></svg> Summe</li><li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.rose}" stroke="${C.rose}"/></svg> Abzug (−)</li><li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.teal}" stroke="${C.teal}"/></svg> Zuschlag (+)</li>${c.steps.some((s) => s.type === "subtotal") ? `<li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.grey}" stroke="${C.greyLine}" stroke-width="2.4"/></svg> Zwischensumme</li>` : ""}</ul>`;
  return { svg: shell(W, H, id, c.summary, g), legend };
}

/* ---------------- Zusammensetzung ---------------- */
function renderComposition(c: CompositionChart, id: string, W: number) {
  const F = [FILL(id).acc, FILL(id).grey, FILL(id).teal, FILL(id).rose];
  const S = [C.accent, C.greyLine, C.teal, C.rose];
  const total = c.parts.reduce((s, p) => s + p.value, 0) || 1;
  const x0 = 6,
    w = W - 12,
    y0 = 34,
    h = 40;
  let x = x0;
  let g = text(x0, 18, `Gesamt: ${c.totalLabel}`, { weight: 700 });
  c.parts.forEach((p, k) => {
    const ww = (p.value / total) * w;
    if (ww <= 0) return;
    g += `<rect x="${x.toFixed(1)}" y="${y0}" width="${ww.toFixed(1)}" height="${h}" fill="${F[k % 4]}" stroke="${S[k % 4]}" stroke-width="1.8"/>`;
    const pctTxt = `${Math.round((p.value / total) * 100)} %`;
    if (ww > 44) g += text(x + ww / 2, y0 + h / 2 + 4, pctTxt, { weight: 700, anchor: "middle" });
    x += ww;
  });
  const legend = `<ul class="chart-legend legend-vert">${c.parts.map((p, k) => `<li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F[k % 4]}" stroke="${S[k % 4]}"/></svg> <strong>${escHtml(p.label)}:</strong> ${escHtml(p.text)}</li>`).join("")}</ul>`;
  return { svg: shell(W, y0 + h + 8, id, c.summary, g), legend };
}

/* ---------------- Meter ---------------- */
function renderMeter(c: MeterChart, id: string, W: number) {
  const F = FILL(id);
  const max = Math.max(c.max, ...c.rows.map((r) => r.value * 1.05), ...c.rows.flatMap((r) => (r.ref ? [r.ref.value * 1.05] : [])));
  const nt = niceTicks(0, max, Math.max(3, Math.min(5, Math.floor(W / 90))));
  const left = 6,
    w = W - 12 - 56;
  const X = (v: number) => left + (v / nt.max) * w;
  const rowH = 52,
    top = 34;
  let g = "";
  c.rows.forEach((r, k) => {
    const y = top + k * rowH;
    g += lines(left, y + 10, wrap(r.label, charsFor(W - 12, 12)), { weight: 700 });
    const bw = Math.max(2, X(r.value) - X(0));
    g += `<rect x="${X(0)}" y="${y + 18}" width="${bw.toFixed(1)}" height="18" fill="${F.acc}" stroke="${C.accent}" stroke-width="1.6"/>`;
    g += text(X(r.value) + 6 > W - 50 ? X(r.value) - 6 : X(r.value) + 6, y + 32, r.text, { weight: 700, anchor: X(r.value) + 6 > W - 50 ? "end" : "start" });
  });
  const bottom = top + c.rows.length * rowH;
  g += `<line x1="${left}" y1="${bottom}" x2="${left + w}" y2="${bottom}" stroke="${C.ink}"/>`;
  for (const t of nt.ticks) g += `<line x1="${X(t)}" y1="${bottom}" x2="${X(t)}" y2="${bottom + 4}" stroke="${C.ink}"/>` + text(X(t), bottom + 17, c.axisFormat(t), { size: 11, anchor: "middle", fill: C.muted });
  const ref = c.rows.find((r) => r.ref)?.ref;
  if (ref) g += `<line x1="${X(ref.value)}" y1="${top - 6}" x2="${X(ref.value)}" y2="${bottom}" stroke="${C.ink}" stroke-width="1.8" stroke-dasharray="5 4"/>` + text(X(ref.value) + 4, top - 8, ref.label, { size: 11, weight: 700 });
  return { svg: shell(W, bottom + 28, id, c.summary, g), legend: "" };
}

/* ---------------- Skala ---------------- */
function renderScale(c: ScaleChart, id: string, W: number) {
  const F = FILL(id);
  const left = 18,
    w = W - 36,
    y = 56;
  const X = (v: number) => left + ((v - c.min) / (c.max - c.min)) * w;
  let g = `<line x1="${left}" y1="${y}" x2="${left + w}" y2="${y}" stroke="${C.ink}" stroke-width="2"/>`;
  const step = (c.max - c.min) / 4;
  for (let k = 0; k <= 4; k++) {
    const v = c.min + step * k;
    g += `<line x1="${X(v)}" y1="${y - 5}" x2="${X(v)}" y2="${y + 5}" stroke="${C.ink}"/>` + text(X(v), y + 22, c.axisFormat(v), { size: 11, anchor: "middle", fill: C.muted });
  }
  const zeroX = X(0);
  const vx = X(c.value);
  g += `<rect x="${Math.min(zeroX, vx).toFixed(1)}" y="${y - 8}" width="${Math.max(2, Math.abs(vx - zeroX)).toFixed(1)}" height="16" fill="${c.value < 0 ? F.rose : F.acc}" stroke="${c.value < 0 ? C.rose : C.accent}" stroke-width="1.6"/>`;
  g += `<path d="M${vx - 7} ${y - 20} L${vx + 7} ${y - 20} L${vx} ${y - 10} Z" fill="${C.ink}"/>` + text(Math.min(Math.max(vx, left + 40), left + w - 40), y - 26, c.text, { weight: 700, anchor: "middle" });
  return { svg: shell(W, y + 40, id, c.summary, g), legend: "" };
}

/* ---------------- Horizontale Balken (Wirkung gegenüber der Basis) ---------------- */
function renderHBars(c: HBarsChart, id: string, W: number) {
  const F = FILL(id);
  const vals = c.rows.map((r) => r.value);
  const nt = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 4);
  const left = 6,
    right = Math.min(120, W * 0.3);
  const w = W - left - right;
  const X = (v: number) => left + ((v - nt.min) / (nt.max - nt.min)) * w;
  const rowH = 54,
    top = 22;
  let g = text(X(0), 12, c.zeroLabel, { size: 11, anchor: "middle", weight: 700 });
  c.rows.forEach((r, k) => {
    const y = top + k * rowH;
    const x1 = X(0),
      x2 = X(r.value);
    g += lines(left, y + 10, wrap(r.label, charsFor(W - 12, 12)), { weight: 700 });
    g += `<rect x="${Math.min(x1, x2).toFixed(1)}" y="${y + 20}" width="${Math.max(2, Math.abs(x2 - x1)).toFixed(1)}" height="18" fill="${r.value < 0 ? F.rose : F.teal}" stroke="${r.value < 0 ? C.rose : C.teal}" stroke-width="1.6"/>`;
    const end = Math.max(x1, x2);
    g += text(end + 6, y + 34, r.text, { weight: 700 });
    if (r.sub) g += text(left, y + 50, r.sub, { size: 11, fill: C.muted });
  });
  const bottom = top + c.rows.length * rowH;
  g += `<line x1="${X(0).toFixed(1)}" y1="${top - 4}" x2="${X(0).toFixed(1)}" y2="${bottom}" stroke="${C.ink}" stroke-width="1.6"/>`;
  for (const t of nt.ticks) g += `<line x1="${X(t).toFixed(1)}" y1="${bottom}" x2="${X(t).toFixed(1)}" y2="${bottom + 4}" stroke="${C.ink}"/>` + text(X(t), bottom + 17, `${t > 0 ? "+" : t < 0 ? "−" : ""}${Math.abs(t).toLocaleString("de-DE")} €`, { size: 11, anchor: "middle", fill: C.muted });
  const legend = `<ul class="chart-legend"><li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.teal}" stroke="${C.teal}"/></svg> Ergebnis steigt (+)</li><li><svg width="18" height="12" aria-hidden="true"><rect width="18" height="12" fill="${F.rose}" stroke="${C.rose}"/></svg> Ergebnis sinkt (−)</li></ul>`;
  return { svg: shell(W, bottom + 26, id, c.summary, g), legend };
}

/* ---------------- Gesamtausgabe ---------------- */
export interface RenderOpts {
  width: number;
  /** Präfix für Element-Kennungen (verschiedene Grafikbereiche auf einer Seite). */
  idPrefix?: string;
  /** Titel der Grafiken, deren Tabelle aufgeklappt ist (bleibt bei Aktualisierung erhalten). */
  openTables?: Set<string>;
  /** Gespeicherte Auswahl der Punktauswahl (Schlüssel = Titel). */
  selection?: Map<string, number>;
}

function tableHtml(c: ChartSpec, open: boolean): string {
  return `<details class="chart-table" data-key="${escHtml(c.title)}"${open ? " open" : ""}><summary>Werte als Tabelle</summary><div class="table-scroll" tabindex="0" role="region" aria-label="Tabelle zum Diagramm: ${escHtml(c.title)}, bei Bedarf horizontal scrollbar"><table><caption class="visually-hidden">${escHtml(c.title)}</caption><thead><tr>${c.table.head.map((h) => `<th scope="col">${escHtml(h)}</th>`).join("")}</tr></thead><tbody>${c.table.rows.map((r) => `<tr><th scope="row">${escHtml(r[0])}</th>${r.slice(1).map((x) => `<td>${escHtml(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
}

function figure(c: ChartSpec, o: RenderOpts): string {
  const id = uid();
  const W = Math.round(Math.max(260, Math.min(o.width, 640)));
  let r: { svg: string; legend: string; geo?: string };
  let explore = "";
  if (c.kind === "lines") {
    const defSel = c.explore ? Math.max(0, c.explore.stops.findIndex((s) => c.markers?.some((m) => m.kind === "intersection" && Math.abs(m.x - s.x) < 1e-9))) : undefined;
    const sel = c.explore ? (o.selection?.get(c.title) ?? defSel) : undefined;
    r = renderLines(c, id, W, sel);
    if (c.explore && r.geo) {
      const cur = c.explore.stops[sel ?? 0];
      explore = `<div class="chart-explore" data-explore data-key="${escHtml(c.title)}" data-geo='${escHtml(r.geo)}'><label for="${id}-r">${escHtml(c.explore.label)}</label><input id="${id}-r" type="range" min="0" max="${c.explore.stops.length - 1}" step="1" value="${sel ?? 0}" aria-describedby="${id}-o"><output id="${id}-o" for="${id}-r" aria-live="polite">${cur.lines.map((l) => `<span><b>${escHtml(l.label)}:</b> ${escHtml(l.text)}</span>`).join("")}</output></div>`;
    }
  } else if (c.kind === "bars") r = renderBars(c, id, W);
  else if (c.kind === "hbars") r = renderHBars(c, id, W);
  else if (c.kind === "bridge") r = renderBridge(c, id, W);
  else if (c.kind === "composition") r = renderComposition(c, id, W);
  else if (c.kind === "meter") r = renderMeter(c, id, W);
  else r = renderScale(c, id, W);
  return `<figure class="chart-box" data-kind="${c.kind}"><figcaption class="chart-title">${escHtml(c.title)}</figcaption>${r.svg}${r.legend}<p class="chart-caption">${escHtml(c.caption)}</p>${c.notice ? `<p class="chart-notice" role="note">${escHtml(c.notice)}</p>` : ""}${explore}${tableHtml(c, !!o.openTables?.has(c.title))}</figure>`;
}

/** Vollständiger Diagrammbereich für das Ergebnis. Leere Liste → nur die Begründung (falls vorhanden). */
export function renderChartArea(o: ChartOutcome, opts: RenderOpts): string {
  uidN = 0;
  uidPrefix = opts.idPrefix ?? "c";
  if (!o.charts.length)
    return o.note ? `<section class="chart-area" aria-label="Diagramm"><h4 class="chart-heading">Deine Berechnung als Diagramm</h4><p class="chart-empty">${escHtml(o.note)}</p></section>` : "";
  return `<section class="chart-area" aria-label="Deine Berechnung als Diagramm"><h4 class="chart-heading">Deine Berechnung als Diagramm</h4>${o.charts.map((c) => figure(c, opts)).join("")}</section>`;
}

export const chartPlaceholder = () =>
  `<section class="chart-area chart-area-empty" aria-label="Diagramm"><h4 class="chart-heading">Deine Berechnung als Diagramm</h4><p class="chart-empty">Gib deine Werte ein – das Diagramm erscheint automatisch.</p></section>`;

/** Verdrahtet die Punktauswahl (Schieberegler, auch per Tastatur und Touch). */
export function hydrateCharts(root: HTMLElement, selection: Map<string, number>, openTables?: Set<string>) {
  root.querySelectorAll<HTMLDetailsElement>("details.chart-table:not([data-hydrated])").forEach((d) => {
    d.dataset.hydrated = "";
    d.addEventListener("toggle", () => (d.open ? openTables?.add(d.dataset.key!) : openTables?.delete(d.dataset.key!)));
  });
  root.querySelectorAll<HTMLElement>("[data-explore]:not([data-hydrated])").forEach((box) => {
    box.dataset.hydrated = "";
    const input = box.querySelector<HTMLInputElement>("input[type=range]")!;
    const out = box.querySelector<HTMLOutputElement>("output")!;
    const geo = JSON.parse(box.dataset.geo!) as { px: number; py: number[]; lines: { label: string; text: string }[] }[];
    const svg = box.closest("figure")!.querySelector("svg")!;
    const cursor = svg.querySelector("[data-cursor]")!;
    input.addEventListener("input", () => {
      const k = Number(input.value);
      selection.set(box.dataset.key!, k);
      const g = geo[k];
      out.innerHTML = g.lines.map((l) => `<span><b>${escHtml(l.label)}:</b> ${escHtml(l.text)}</span>`).join("");
      input.setAttribute("aria-valuetext", g.lines.map((l) => `${l.label} ${l.text}`).join(", "));
      cursor.innerHTML = `<line x1="${g.px}" y1="14" x2="${g.px}" y2="${Number(svg.getAttribute("height")) - 52}" stroke="${C.accent}" stroke-width="1.6"/>` + g.py.map((py, s) => `<circle cx="${g.px}" cy="${py}" r="4.5" fill="${s === 0 ? C.accent : C.ink}" stroke="#fff" stroke-width="1.5"/>`).join("");
    });
  });
}
