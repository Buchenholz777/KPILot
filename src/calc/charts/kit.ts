/** Gemeinsame Bausteine der Diagrammaufbereitung. Rechnet nicht fachlich – formatiert und ordnet vorhandene Ergebnisse. */
import type { CalcResult, Inputs, Out } from "../types";
import type {
  BarItem,
  BarsChart,
  BridgeChart,
  BridgeStep,
  ChartOutcome,
  ChartSpec,
  CompositionChart,
  MeterChart,
  ScaleChart,
} from "../chart-types";
import { D, type Decimal } from "../../lib/decimal";
import { formatDecimal, formatValue } from "../../lib/number";

export type Ok = Extract<CalcResult, { status: "ok" }>;
export type Builder = (i: Inputs, r: CalcResult, variantId: string) => ChartOutcome;

export const num = (d: Decimal) => d.toNumber();
export const eur = (d: Decimal, signed = false) => formatValue(d, "money", undefined, signed);
export const pct = (d: Decimal, signed = false) => formatValue(d, "percent", undefined, signed);
export const plain = (d: Decimal, signed = false) => formatValue(d, "number", undefined, signed);
export const int = (d: Decimal) => formatValue(d, "integer");
export const withUnit = (d: Decimal, unit: string) => `${formatValue(d, "number")} ${unit}`;

/** Achsenzahlen kompakt: 1.500.000 → „1,5 Mio.“. */
export function compact(v: number, suffix = ""): string {
  const a = Math.abs(v);
  const s = (x: number) => formatDecimal(D(x), { max: 2 });
  let t: string;
  if (a >= 1e9) t = `${s(v / 1e9)} Mrd.`;
  else if (a >= 1e6) t = `${s(v / 1e6)} Mio.`;
  else t = s(v);
  return suffix ? `${t} ${suffix}` : t;
}
export const compactEur = (v: number) => compact(v, "€");

export const none = (note: string): ChartOutcome => ({ charts: [], note });
export const one = (c: ChartSpec): ChartOutcome => ({ charts: [c] });

/** Ergebnis eines Ergebnisfeldes (Hauptwert oder Zusatzwert) anhand des Labelanfangs, auch aus „partial“. */
export function outOf(r: CalcResult, start: string): Out | undefined {
  const list: Out[] =
    r.status === "ok"
      ? [r.main, ...(r.extra ?? [])]
      : "partial" in r && r.partial
        ? r.partial
        : [];
  return list.find((o) => o.label.startsWith(start));
}
export const val = (i: Inputs, k: string): Decimal | undefined => i.values[k];

const PERIODS: Record<string, string> = { monat: "Monat", quartal: "Quartal", jahr: "Jahr", anderer: "gewählter Zeitraum" };
export const periodOf = (i: Inputs): string | undefined => (i.choices.zeitraum ? PERIODS[i.choices.zeitraum] : undefined);

interface Panel {
  title: string;
  bars: BarItem[];
  ref?: { value: number; label: string };
}

const base = (title: string, caption: string, summary: string, rows: string[][], head = ["Größe", "Wert"]) => ({
  title,
  caption,
  summary,
  table: { head, rows },
});

export function bars(o: { title: string; caption: string; panels: Panel[]; notice?: string }): BarsChart {
  const rows = o.panels.flatMap((p) => p.bars.map((b) => [`${p.title}: ${b.label}${b.sub ? ` (${b.sub})` : ""}`, b.text]));
  const summary = `${o.title}. ${o.panels.map((p) => `${p.title}: ${p.bars.map((b) => `${b.label} ${b.text}`).join(", ")}`).join(". ")}.`;
  return { kind: "bars", ...base(o.title, o.caption, summary, rows), panels: o.panels, notice: o.notice };
}

export function bridge(o: { title: string; caption: string; unit: string; steps: BridgeStep[]; notice?: string }): BridgeChart {
  const rows = o.steps.map((s) => [s.label, s.text, s.type === "delta" ? "Veränderung" : s.type === "subtotal" ? "Zwischensumme" : "Summe/Ausgang"]);
  const summary = `${o.title}. ${o.steps.map((s) => `${s.label} ${s.text}`).join(", ")}.`;
  return { kind: "bridge", ...base(o.title, o.caption, summary, rows, ["Position", "Betrag", "Art"]), unit: o.unit, steps: o.steps, notice: o.notice };
}

export function composition(o: { title: string; caption: string; parts: { label: string; value: number; text: string }[]; totalLabel: string; notice?: string }): CompositionChart {
  const rows = o.parts.map((p) => [p.label, p.text]);
  const summary = `${o.title}. ${o.parts.map((p) => `${p.label} ${p.text}`).join(", ")}; zusammen ${o.totalLabel}.`;
  return { kind: "composition", ...base(o.title, o.caption, summary, rows), parts: o.parts, totalLabel: o.totalLabel, notice: o.notice };
}

export function meter(o: { title: string; caption: string; rows: MeterChart["rows"]; max: number; axisFormat: (v: number) => string; notice?: string }): MeterChart {
  const rows = o.rows.map((r) => [r.label, r.text]);
  const summary = `${o.title}. ${o.rows.map((r) => `${r.label} ${r.text}`).join(", ")}.`;
  return { kind: "meter", ...base(o.title, o.caption, summary, rows), rows: o.rows, max: o.max, axisFormat: o.axisFormat, notice: o.notice };
}

export function scale(o: { title: string; caption: string; min: number; max: number; value: number; text: string; axisFormat: (v: number) => string; notice?: string }): ScaleChart {
  const summary = `${o.title}. Wert ${o.text} auf einer Skala von ${o.axisFormat(o.min)} bis ${o.axisFormat(o.max)}.`;
  return { kind: "scale", ...base(o.title, o.caption, summary, [[o.title, o.text]]), min: o.min, max: o.max, value: o.value, text: o.text, axisFormat: o.axisFormat, notice: o.notice };
}

/** Teil und Ganzes: nur, wenn beide ≥ 0 und der Teil nicht größer ist als das Ganze. */
export const isPartOfWhole = (part: Decimal, whole: Decimal) => !part.isNegative() && whole.gt(0) && part.lte(whole);

/** Rundet eine Obergrenze auf einen „glatten“ Wert (1, 2, 2,5, 5 · 10ⁿ). */
export function niceMax(v: number): number {
  if (!(v > 0) || !isFinite(v)) return 10;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / e;
  const f = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return f * e;
}
