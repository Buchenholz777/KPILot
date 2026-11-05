/**
 * Szenariovergleich (A/B) ohne DOM – testbar.
 *
 * Fachliche Regeln:
 *  - Differenzen werden nur gebildet, wenn beide Szenarien dieselbe Bezugsgröße haben:
 *    gleicher Betrachtungszeitraum, gleiche Einheit, gleiches Format, gleiche Kennzahl.
 *  - Es wird nie automatisch auf einen anderen Zeitraum hochgerechnet. Eine Umrechnung (z. B. Jahr → Monat)
 *    würde Gleichverteilung und Saisonfreiheit unterstellen und ist deshalb Sache des Nutzers
 *    (er trägt Werte für den gemeinsamen Zeitraum ein).
 */
import { run } from "./engine";
import { formatValue, parseNumber } from "../lib/number";
import type { CalcResult, FieldDef, Out, RawInputs, VariantDef } from "./types";

export const PERIOD_KEY = "zeitraum";

export interface ScenarioRow {
  label: string;
  a?: string;
  b?: string;
  /** Formatierte Differenz B − A, oder undefined, wenn keine sinnvolle Differenz existiert. */
  diff?: string;
  /** Erklärung, warum keine Differenz gezeigt wird. */
  diffNote?: string;
}

export interface ScenarioComparison {
  state: "empty" | "one-side" | "ok";
  rows: ScenarioRow[];
  /** Gemeinsame Hinweise (z. B. unterschiedliche Zeiträume). */
  warnings: string[];
  /** Felder (Schlüssel), deren Eingaben zwischen A und B abweichen. */
  differingFields: string[];
  /** Beschriftungen der abweichenden Felder. */
  differingLabels: string[];
  /** Zeitraumbezeichnungen, falls das Modell einen Zeitraum kennt. */
  periodA?: string;
  periodB?: string;
  periodsMatch: boolean;
}

const fmt = (o: Out) => formatValue(o.value, o.format, o.unit, o.signed);

function periodLabel(v: VariantDef, raw: RawInputs): string | undefined {
  const f = v.fields.find((x) => x.key === PERIOD_KEY);
  if (!f) return undefined;
  const val = typeof raw[PERIOD_KEY] === "string" ? (raw[PERIOD_KEY] as string) : "";
  const value = val || f.defaultValue || "";
  return f.options?.find((o) => o.value === value)?.label;
}

function sameValue(f: FieldDef, a: unknown, b: unknown): boolean {
  const sa = typeof a === "string" ? a.trim() : "";
  const sb = typeof b === "string" ? b.trim() : "";
  if (sa === sb) return true;
  if (f.type === "select") return (sa || f.defaultValue) === (sb || f.defaultValue);
  const pa = parseNumber(sa),
    pb = parseNumber(sb);
  return pa.kind === "ok" && pb.kind === "ok" && pa.value.eq(pb.value);
}

/** Welche Eingaben unterscheiden sich zwischen A und B? */
export function differingInputs(v: VariantDef, a: RawInputs, b: RawInputs) {
  const fields = v.fields.filter((f) => !sameValue(f, a[f.key], b[f.key]));
  return { keys: fields.map((f) => f.key), labels: fields.map((f) => f.label) };
}

const list = (r: CalcResult | null): Out[] =>
  r && r.status === "ok" ? [r.main, ...(r.extra ?? [])] : [];

export function compareScenarios(
  v: VariantDef,
  rawA: RawInputs,
  rawB: RawInputs,
): ScenarioComparison {
  const a = run(v, rawA).result;
  const b = run(v, rawB).result;
  const pa = periodLabel(v, rawA),
    pb = periodLabel(v, rawB);
  const periodsMatch = pa === pb;
  const diffIn = differingInputs(v, rawA, rawB);
  const base: ScenarioComparison = {
    state: "empty",
    rows: [],
    warnings: [],
    differingFields: diffIn.keys,
    differingLabels: diffIn.labels,
    periodA: pa,
    periodB: pb,
    periodsMatch,
  };
  if (!a && !b) return base;
  if (!periodsMatch)
    base.warnings.push(
      `Die Szenarien beziehen sich auf unterschiedliche Zeiträume (A: ${pa}, B: ${pb}). Eine Differenz wäre nicht aussagekräftig und wird deshalb nicht gebildet. Wähle einen gemeinsamen Betrachtungszeitraum und trage die Werte dafür ein – KPILot rechnet nicht automatisch um, weil das eine gleichmäßige Verteilung ohne Saisoneffekte unterstellen würde.`,
    );

  const la = list(a),
    lb = list(b);
  // Hauptergebnis steht jeweils vorn; weitere Kennzahlen werden über ihre Bezeichnung zugeordnet.
  const pairs: [Out | undefined, Out | undefined][] = [];
  if (la.length || lb.length) pairs.push([la[0], lb[0]]);
  const restB = new Set(lb.slice(1));
  for (const oa of la.slice(1)) {
    const ob = lb.slice(1).find((x) => restB.has(x) && x.label === oa.label);
    if (ob) restB.delete(ob);
    pairs.push([oa, ob]);
  }
  for (const ob of restB) pairs.push([undefined, ob]);
  const rows: ScenarioRow[] = [];
  const missing = (r: CalcResult | null) =>
    r
      ? r.status === "invalid"
        ? "Eingabe prüfen"
        : "nicht bestimmbar"
      : "fehlt noch";
  for (const [oa, ob] of pairs) {
    const row: ScenarioRow = {
      label:
        oa && ob && oa.label !== ob.label
          ? `${oa.label} / ${ob.label}`
          : (oa ?? ob)!.label,
      a: oa ? fmt(oa) : a?.status === "ok" ? "–" : missing(a),
      b: ob ? fmt(ob) : b?.status === "ok" ? "–" : missing(b),
    };
    if (oa && ob) {
      const comparable =
        oa.format === ob.format &&
        oa.unit === ob.unit &&
        oa.format !== "factor" &&
        // gleiche Kennzahl: gleiche Bezeichnung oder beide vorzeichenbehafteter Geldwert (Gewinn/Verlust)
        (oa.label === ob.label || (oa.signed && ob.signed));
      if (!periodsMatch)
        row.diffNote = "Zeiträume verschieden – keine Differenz";
      else if (!comparable) row.diffNote = "nicht vergleichbar";
      else
        row.diff = formatValue(
          ob.value.sub(oa.value),
          oa.format,
          oa.unit,
          true,
        );
    }
    rows.push(row);
  }
  base.rows = rows;
  base.state = a?.status === "ok" && b?.status === "ok" ? "ok" : "one-side";
  return base;
}
