/** Ergebnisvorschau für gespeicherte Berechnungen – immer live aus den Eingaben berechnet, nie als alter Wert gespeichert. */
import { loadCalc } from "../calc/load";
import { run } from "../calc/engine";
import { FLOW_ID, evaluate, fromRaw, outText, periodLabel } from "../calc/workflow";
import { formatValue } from "../lib/number";
import type { SavedCalc } from "../lib/workspace";
import type { CalcResult, Out } from "../calc/types";

export interface Preview {
  state: "ok" | "incomplete" | "info" | "unknown";
  label: string;
  value: string;
  /** Zeitraum und Einheit. */
  context: string;
  /** Hinweis, z. B. ältere Modellversion. */
  warning?: string;
  result?: CalcResult | null;
  outs?: Out[];
}

export async function previewFor(item: SavedCalc, schemaNow: number): Promise<Preview> {
  if (item.calcId === FLOW_ID) {
    const f = fromRaw(item.inputs);
    const s = evaluate(f);
    const ctx = `Zeitraum: ${periodLabel(f.zeitraum)} · Einheit: ${f.unit}`;
    if (s.blocked) return { state: "info", label: "Ablauf", value: "Vollkosten gewählt – Auswertung gesperrt", context: ctx };
    if (s.base.profit) return { state: "ok", label: s.base.profit.main.label, value: outText(s.base.profit.main), context: ctx };
    if (s.base.qMin) return { state: "incomplete", label: "Mindestabsatz zur Kostendeckung", value: outText(s.base.qMin), context: `${ctx} · geplante Menge fehlt` };
    return { state: "incomplete", label: "Ablauf", value: "noch unvollständig", context: ctx };
  }
  try {
    const def = await loadCalc(item.calcId);
    const v = def.variants.find((x) => x.id === item.variantId);
    if (!v) return { state: "unknown", label: "", value: "Rechenmodus nicht mehr vorhanden", context: "" };
    const { result } = run(v, item.inputs);
    const warning = item.schema !== schemaNow ? "mit der aktuellen Modellversion neu berechnet – bitte Werte prüfen" : undefined;
    const pf = v.fields.find((f) => f.key === "zeitraum");
    const pv = typeof item.inputs.zeitraum === "string" && item.inputs.zeitraum ? item.inputs.zeitraum : pf?.defaultValue;
    const period = pf?.options?.find((o) => o.value === pv)?.label;
    if (result && result.status === "ok") {
      const ctx = [period ? `Zeitraum: ${period}` : "", result.main.unit ? `Einheit: ${result.main.unit}` : ""].filter(Boolean).join(" · ");
      return { state: "ok", label: result.main.label, value: formatValue(result.main.value, result.main.format, result.main.unit, result.main.signed), context: ctx, warning, result, outs: [result.main, ...(result.extra ?? [])] };
    }
    if (result) return { state: "info", label: "", value: "message" in result ? result.message : "kein Ergebnis", context: period ? `Zeitraum: ${period}` : "", warning, result };
    return { state: "incomplete", label: "", value: "Angaben unvollständig", context: "", warning, result };
  } catch {
    return { state: "unknown", label: "", value: "Vorschau nicht verfügbar", context: "" };
  }
}
