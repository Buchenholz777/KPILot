/** Diagramme der Ergebnisanzeige als SVG-Text (ohne DOM, testbar). Jedes Diagramm hat eine Tabellenalternative. */
import type { BarsChart, ChartPoint } from "../calc/types";
import { formatDecimal } from "../lib/number";
import { D } from "../lib/decimal";

export const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const n = (v: number, d = 0) => formatDecimal(D(v), { max: d });

function table(head: string[], rows: string[][]): string {
  return `<details class="chart-table"><summary>Werte als Tabelle</summary><div class="table-scroll" tabindex="0" role="region" aria-label="Tabelle zum Diagramm, bei Bedarf horizontal scrollbar"><table><thead><tr>${head
    .map((h) => `<th scope="col">${escHtml(h)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr><th scope="row">${escHtml(r[0])}</th>${r.slice(1).map((c) => `<td>${escHtml(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div></details>`;
}

export function breakEvenChart(chart: { points: ChartPoint[]; breakEven?: number }): string {
  const pts = chart.points;
  const be = chart.breakEven ?? 0;
  const qMax = pts[pts.length - 1].q;
  const vMax = Math.max(...pts.map((p) => Math.max(p.revenue, p.cost))) || 1;
  const W = 520, H = 250, x0 = 60, y0 = 210, w = 440, h = 170;
  const X = (q: number) => x0 + (q / qMax) * w;
  const Y = (v: number) => y0 - (v / vMax) * h;
  const line = (key: "revenue" | "cost") =>
    `M${X(pts[0].q)} ${Y(pts[0][key])} L${X(pts[1].q)} ${Y(pts[1][key])}`;
  const rev = (q: number) => pts[0].revenue + ((pts[1].revenue - pts[0].revenue) * q) / qMax;
  const cost = (q: number) => pts[0].cost + ((pts[1].cost - pts[0].cost) * q) / qMax;
  const beY = Y(rev(be));
  const rows = [0, be, qMax].map((q) => [
    n(q, 2),
    `${n(rev(q), 2)} €`,
    `${n(cost(q), 2)} €`,
    `${n(rev(q) - cost(q), 2)} €`,
  ]);
  return `<figure class="chart-box">
    <figcaption class="result-tag">Dein Ergebnis als Diagramm</figcaption>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Umsatz- und Gesamtkostenlinie deiner Eingaben; sie schneiden sich bei ${n(be, 2)} Stück.">
      <line x1="${x0}" y1="${y0}" x2="${x0 + w}" y2="${y0}" stroke="#17253D"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - h}" stroke="#17253D"/>
      <path d="${line("cost")}" stroke="#17253D" stroke-width="2.4" fill="none"/>
      <path d="${line("revenue")}" stroke="#3D4AE8" stroke-width="3" fill="none" stroke-dasharray="8 4"/>
      <line x1="${X(be)}" y1="${beY}" x2="${X(be)}" y2="${y0}" stroke="#4A5872" stroke-dasharray="3 3"/>
      <circle cx="${X(be)}" cy="${beY}" r="5" fill="#fff" stroke="#17253D" stroke-width="2"/>
      <text x="${X(be)}" y="${y0 + 18}" font-size="13" text-anchor="middle" fill="#17253D" font-weight="700">${n(be, 2)} Stück</text>
      <text x="${x0 - 6}" y="${y0 - h + 5}" font-size="12" text-anchor="end" fill="#4A5872">${n(vMax)} €</text>
      <text x="${x0 - 6}" y="${y0 + 4}" font-size="12" text-anchor="end" fill="#4A5872">0</text>
      <text x="${x0 + w}" y="${y0 + 36}" font-size="12" text-anchor="end" fill="#4A5872">${n(qMax)} Stück</text>
      <line x1="${x0 + 8}" y1="20" x2="${x0 + 34}" y2="20" stroke="#3D4AE8" stroke-width="3" stroke-dasharray="8 4"/><text x="${x0 + 40}" y="24" font-size="13" fill="#17253D">Umsatz (gestrichelt)</text>
      <line x1="${x0 + 190}" y1="20" x2="${x0 + 216}" y2="20" stroke="#17253D" stroke-width="2.4"/><text x="${x0 + 222}" y="24" font-size="13" fill="#17253D">Gesamtkosten (durchgezogen)</text>
    </svg>
    ${table(["Stück", "Umsatz", "Gesamtkosten", "Ergebnis"], rows)}
  </figure>`;
}

export function barsChart(chart: BarsChart): string {
  const W = 520, H = 230;
  const panelW = 240, gap = 40, left = 10;
  const baseY = 180, maxH = 120;
  let svg = "";
  chart.panels.forEach((p, pi) => {
    const x0 = left + pi * (panelW + gap);
    const max = Math.max(...p.bars.map((b) => Math.abs(b.value)), 1);
    svg += `<text x="${x0 + panelW / 2}" y="24" font-size="14" font-weight="700" text-anchor="middle" fill="#17253D">${escHtml(p.title)}</text>`;
    svg += `<line x1="${x0}" y1="${baseY}" x2="${x0 + panelW}" y2="${baseY}" stroke="#17253D"/>`;
    const bw = 76;
    p.bars.forEach((b, bi) => {
      const bh = Math.max(2, (Math.abs(b.value) / max) * maxH);
      const bx = x0 + 30 + bi * (bw + 28);
      const fill = b.emphasis ? "url(#bars-h-accent)" : "#E4E9F1";
      const stroke = b.emphasis ? "#3D4AE8" : "#6B7A93";
      svg += `<rect x="${bx}" y="${baseY - bh}" width="${bw}" height="${bh}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
      svg += `<text x="${bx + bw / 2}" y="${baseY - bh - 7}" font-size="13" font-weight="700" text-anchor="middle" fill="#17253D">${escHtml(b.text)}</text>`;
      svg += `<text x="${bx + bw / 2}" y="${baseY + 18}" font-size="12" text-anchor="middle" fill="#4A5872">${escHtml(b.label)}</text>`;
    });
  });
  return `<figure class="chart-box">
    <figcaption class="result-tag">Dein Ergebnis als Diagramm</figcaption>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escHtml(chart.summary)}">
      <defs><pattern id="bars-h-accent" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#E3E6FD"/><line x1="0" y1="0" x2="0" y2="6" stroke="#3D4AE8" stroke-width="2"/></pattern></defs>
      ${svg}
    </svg>
    ${table(chart.table.head, chart.table.rows)}
  </figure>`;
}
