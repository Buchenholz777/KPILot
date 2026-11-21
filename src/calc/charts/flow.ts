/** Grafiken des geführten Ablaufs „Preis & Wirtschaftlichkeit“ – aus derselben Auswertung (`evaluate`) wie alle Zahlen. */
import type { CaseResult, FlowSummary } from "../workflow";
import type { ChartOutcome, ChartSpec } from "../chart-types";
import { bars, bridge, eur, hbars, int, num, outOf } from "./kit";
import type { Decimal } from "../../lib/decimal";
import { formatValue } from "../../lib/number";

const profitOf = (c: CaseResult): Decimal | undefined => c.profit?.main.value;

/** Ergebnisvergleich der vorhandenen Varianten (gemeinsame Euro-Skala mit Nulllinie, Mengen auf eigener Achse). */
export function scenarioChart(s: FlowSummary): ChartSpec | null {
  const cases = [s.base, ...s.scenarios].filter((c) => profitOf(c) || c.qMin);
  if (s.scenarios.length === 0 || cases.length < 2) return null;
  const withProfit = cases.filter((c) => profitOf(c));
  const withQty = cases.filter((c) => c.qMin);
  const panels = [
    ...(withProfit.length >= 2 ? [{ title: `Ergebnis bei geplanter Menge (€, ${s.period})`, bars: withProfit.map((c, k) => ({ label: c.name, value: num(profitOf(c)!), text: eur(profitOf(c)!, true), emphasis: k === 0 })) }] : []),
    ...(withQty.length >= 2 ? [{ title: `Mindestmenge zur Kostendeckung (${s.unit})`, bars: withQty.map((c, k) => ({ label: c.name, value: num(c.qMin!.value), text: formatValue(c.qMin!.value, "integer"), emphasis: k === 0 })) }] : []),
  ];
  if (!panels.length) return null;
  return bars({
    title: `Varianten im Vergleich (gemeinsamer Zeitraum: ${s.period})`,
    panels,
    caption: `Alle Varianten gelten für denselben Zeitraum und dieselbe Einheit (${s.unit}); leere Felder einer Variante übernehmen die Basis. Ergebnis (Euro) und Menge stehen auf getrennten Achsen.`,
  });
}

/** Wirkung einzelner Änderungen auf das Ergebnis: jeweils nur eine Größe ändert sich, die übrigen bleiben konstant. */
export function sensitivityChart(s: FlowSummary): ChartSpec | null {
  const base = profitOf(s.base);
  if (!base) return null;
  const rows: { label: string; sub: string; value: number; text: string }[] = [];
  const add = (label: string, after: CaseResult | undefined) => {
    const a = after && profitOf(after);
    if (!a) return;
    const d = a.sub(base);
    rows.push({ label, value: num(d), text: eur(d, true), sub: `Ergebnis danach: ${eur(a, true)} (Basis ${eur(base, true)})` });
  };
  if (s.priceEffect) add(`Nur Verkaufspreis ${formatValue(s.priceEffect.delta, "money", "je " + s.unitSg, true)}`, s.priceEffect.after);
  if (s.costEffect) add(`Nur variable Kosten ${formatValue(s.costEffect.delta, "money", "je " + s.unitSg, true)}`, s.costEffect.after);
  if (s.qEffect) add(`Nur Absatz ${formatValue(s.qEffect.pct, "percent", undefined, true)} (auf ${int(s.qEffect.qNew)} ${s.unit})`, s.qEffect.after);
  if (!rows.length) return null;
  return hbars({
    title: "Welche Annahme beeinflusst mein Ergebnis am stärksten?",
    rows,
    zeroLabel: `Basisergebnis ${eur(base, true)} = Nulllinie`,
    caption: "Die Darstellung zeigt, wie sich das Ergebnis im gewählten Modell verändert. Pro Balken ändert sich nur eine Größe, alle anderen bleiben konstant; Preisänderungen lassen die Absatzmenge unverändert. Die Änderungen hast du selbst gewählt (Euro bzw. Prozent) – die Balken sind keine allgemeine Einflussrangfolge und keine Prognose.",
  });
}

/** Ergebnisbrücke der Basis (wenn keine Varianten vorhanden sind). */
export function baseBridge(s: FlowSummary, fixed: Decimal | undefined): ChartSpec | null {
  const g = s.base.profit;
  if (!g || !fixed) return null;
  const U = outOf(g, "Umsatz")!.value,
    V = outOf(g, "Variable Gesamtkosten")!.value;
  return bridge({
    title: `Von den Erlösen zum Ergebnis (Zeitraum: ${s.period})`,
    unit: "€",
    steps: [
      { label: "Umsatz", value: num(U), text: eur(U), type: "total" },
      { label: "Variable Kosten", value: -num(V), text: eur(V.neg()), type: "delta" },
      { label: "Fixkosten", value: -num(fixed), text: eur(fixed.neg()), type: "delta" },
      { label: g.main.value.isNegative() ? "Verlust" : "Gewinn", value: num(g.main.value), text: eur(g.main.value, true), type: "total" },
    ],
    caption: `${eur(U)} Umsatz abzüglich variabler Kosten und Fixkosten ergeben ${eur(g.main.value, true)}.`,
  });
}

export function flowCharts(s: FlowSummary, fixed: Decimal | undefined): ChartOutcome {
  const charts = [scenarioChart(s) ?? baseBridge(s, fixed), sensitivityChart(s)].filter((c): c is ChartSpec => !!c);
  return charts.length ? { charts } : { charts: [], note: "Sobald Basiswerte und Menge vorhanden sind, erscheint hier die Grafik." };
}
