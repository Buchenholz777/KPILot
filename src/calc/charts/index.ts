import type { Builder } from "./kit";
import type { CalcResult, Inputs } from "../types";
import type { ChartOutcome } from "../chart-types";
import { none } from "./kit";

/** Kategorie je Rechner → Datei. Lädt im Browser nur die Aufbereitung der aktuellen Kategorie. */
const loaders: Record<string, () => Promise<Record<string, Builder>>> = {
  prozent: async () => (await import("./prozent")).prozentCharts,
  kosten: async () => (await import("./kosten")).kostenCharts,
  finanzen: async () => (await import("./finanzen")).finanzenCharts,
  marketing: async () => (await import("./marketing")).marketingCharts,
  produkt: async () => (await import("./produkt")).produktCharts,
  controlling: async () => (await import("./controlling")).controllingCharts,
};

export type ChartBuilders = Record<string, Builder>;
export async function loadChartBuilders(category: string): Promise<ChartBuilders> {
  const l = loaders[category];
  if (!l) throw new Error(`Unbekannte Kategorie: ${category}`);
  return l();
}

/** Baut die Ergebnisgrafik(en) aus demselben validierten Eingabe- und Ergebnisstand. Fehler bleiben lokal. */
export function buildCharts(builders: ChartBuilders, calcId: string, variantId: string, input: Inputs | undefined, result: CalcResult): ChartOutcome {
  const b = builders[calcId];
  if (!b || !input) return none("Für diesen Rechner gibt es keine Ergebnisgrafik.");
  try {
    return b(input, result, variantId);
  } catch {
    return none("Die Grafik konnte nicht erstellt werden. Die Zahlen oben sind davon nicht betroffen.");
  }
}
