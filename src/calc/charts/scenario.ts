/** Grafiken des A/B-Vergleichs: gleiche Skala, gleiche Einheiten, nur bei übereinstimmendem Zeitraum. */
import type { CalcResult, Inputs, RawInputs, VariantDef } from "../types";
import type { ChartOutcome, ChartSpec, LinesChart } from "../chart-types";
import type { ScenarioComparison } from "../scenario";
import { bars, compactEur, eur, int, niceMax, none, num, outOf, periodOf, val } from "./kit";
import { formatDecimal, formatValue } from "../../lib/number";
import { D } from "../../lib/decimal";

export interface Side {
  raw: RawInputs;
  inputs?: Inputs;
  result: CalcResult | null;
}

const stk = (v: number) => `${formatDecimal(D(v), { max: 2 })} Stück`;

function breakEvenCompare(a: Side, b: Side, names: [string, string]): ChartSpec | null {
  if (!a.inputs || !b.inputs || a.result?.status !== "ok" || b.result?.status !== "ok") return null;
  const qa = outOf(a.result, "Theoretische Gewinnschwelle")?.value,
    qb = outOf(b.result, "Theoretische Gewinnschwelle")?.value;
  const pA = val(a.inputs, "p")!, vA = val(a.inputs, "v")!, FA = val(a.inputs, "F")!;
  const pB = val(b.inputs, "p")!, vB = val(b.inputs, "v")!, FB = val(b.inputs, "F")!;
  if (!qa || !qb || FA.isZero() || FB.isZero()) return null;
  const xMax = Math.max(10, niceMax(Math.max(num(qa), num(qb)) * 1.6));
  const line = (p: number, f: number, k: number) => [{ x: 0, y: f }, { x: xMax, y: f + k * xMax }];
  const zr = periodOf(a.inputs);
  const rows = [
    [names[0], stk(num(qa)), eur(pA.mul(qa))],
    [names[1], stk(num(qb)), eur(pB.mul(qb))],
  ];
  return {
    kind: "lines",
    title: `Break-even im Vergleich${zr ? ` (gemeinsamer Zeitraum: ${zr})` : ""}`,
    caption: `Beide Szenarien auf derselben Skala: ${names[0]} erreicht die Gewinnschwelle bei ${stk(num(qa))}, ${names[1]} bei ${stk(num(qb))} (Differenz ${stk(num(qb.sub(qa)))}).`,
    summary: `Gewinnschwelle ${names[0]}: ${stk(num(qa))}, ${names[1]}: ${stk(num(qb))}.`,
    table: { head: ["Szenario", "Gewinnschwelle", "Umsatz dort"], rows },
    xLabel: "Absatzmenge (Stück)",
    yLabel: "Euro",
    xMax,
    xFormat: (x) => compactEur(x).replace(" €", ""),
    yFormat: compactEur,
    series: [
      { id: "ua", label: `${names[0]}: Umsatz`, style: "dashed", tone: "accent", points: line(0, 0, num(pA)) },
      { id: "ka", label: `${names[0]}: Gesamtkosten`, style: "solid", tone: "ink", points: line(0, num(FA), num(vA)) },
      { id: "ub", label: `${names[1]}: Umsatz`, style: "dotted", tone: "teal", points: line(0, 0, num(pB)) },
      { id: "kb", label: `${names[1]}: Gesamtkosten`, style: "solid", tone: "teal", points: line(0, num(FB), num(vB)) },
    ],
    markers: [
      { x: num(qa), y: num(pA.mul(qa)), kind: "intersection", label: `${names[0]}: ${stk(num(qa))}` },
      { x: num(qb), y: num(pB.mul(qb)), kind: "point", label: `${names[1]}: ${stk(num(qb))}` },
    ],
  };
}

/** Gemeinsame Balken je vergleichbarer Kennzahl (gleiche Achse je Panel für A und B). */
export function scenarioCharts(calcId: string, v: VariantDef, cmp: ScenarioComparison, a: Side, b: Side, names: [string, string]): ChartOutcome {
  void v;
  if (cmp.state !== "ok") return none("Sobald beide Szenarien ein Ergebnis haben, erscheint hier der grafische Vergleich.");
  if (!cmp.periodsMatch) return none("Bei unterschiedlichen Zeiträumen werden die Szenarien nicht gemeinsam gezeichnet.");
  const charts: ChartSpec[] = [];
  if (calcId === "break-even") {
    const c = breakEvenCompare(a, b, names);
    if (c) charts.push(c);
  }
  const rows = cmp.rows.filter((r) => r.av !== undefined && r.bv !== undefined && r.diff !== undefined && (r.format === "money" || r.format === "integer" || r.format === "number" || r.format === "percent")).slice(0, 3);
  if (rows.length)
    charts.push(
      bars({
        title: "Szenarien im Vergleich",
        panels: rows.map((r) => ({
          title: r.label.length > 38 ? r.label.slice(0, 36) + "…" : r.label,
          bars: [
            { label: names[0], value: r.av!, text: r.a! },
            { label: names[1], value: r.bv!, text: r.b!, emphasis: true },
          ],
        })),
        caption: `Gleiche Einheit, gleicher Zeitraum${cmp.periodA ? ` (${cmp.periodA})` : ""}: Jede Kennzahl hat ihre eigene Achse; Unterschiede stehen zusätzlich als Zahl am Balken.${cmp.differingLabels.length ? ` Abweichende Eingaben: ${cmp.differingLabels.join(", ")}.` : ""}`,
      }),
    );
  return charts.length ? { charts } : none("Für diesen Vergleich gibt es keine gemeinsam darstellbare Kennzahl.");
}
void int;
void formatValue;
