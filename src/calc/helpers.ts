import { D, type Decimal } from "../lib/decimal";
import type { ValueFormat } from "../lib/number";
import type { CalcResult, FieldDef, Inputs, Out } from "./types";

export { D };
export { eur, pct, num, formatValue, toInput } from "../lib/number";

/** Pflichtwert lesen (Validierung hat ihn bereits geprüft). */
export const val = (i: Inputs, key: string): Decimal => {
  const v = i.values[key];
  if (!v) throw new Error(`Wert ${key} fehlt`);
  return v;
};
/** Optionalen Wert lesen. */
export const opt = (i: Inputs, key: string): Decimal | undefined =>
  i.values[key];

export const out = (
  label: string,
  value: Decimal,
  format: ValueFormat,
  unit?: string,
  signed?: boolean,
): Out => ({
  label,
  value,
  format,
  unit,
  signed,
});

/** Markiert ein Ergebnis als Detail (Ebene 3: aufklappbar). */
export const det = (o: Out): Out => ({ ...o, detail: true });

export const undef = (
  message: string,
  partial?: Out[],
  fieldErrors?: Record<string, string>,
): CalcResult => ({
  status: "undefined",
  message,
  partial,
  fieldErrors,
});

export const impossible = (
  message: string,
  partial?: Out[],
  fieldErrors?: Record<string, string>,
): CalcResult => ({
  status: "impossible",
  message,
  partial,
  fieldErrors,
});

export const invalid = (
  message: string,
  fieldErrors: Record<string, string>,
): CalcResult => ({
  status: "invalid",
  message,
  fieldErrors,
});

/* Häufige Felddefinitionen */
export const money = (
  key: string,
  label: string,
  extra: Partial<FieldDef> = {},
): FieldDef => ({
  key,
  label,
  unit: "€",
  min: "nonneg",
  ...extra,
});
export const count = (
  key: string,
  label: string,
  extra: Partial<FieldDef> = {},
): FieldDef => ({
  key,
  label,
  min: "nonneg",
  integer: true,
  ...extra,
});
export const percent = (
  key: string,
  label: string,
  extra: Partial<FieldDef> = {},
): FieldDef => ({
  key,
  label,
  unit: "%",
  min: "any",
  ...extra,
});

export const PERIOD_OPTIONS = [
  { value: "monat", label: "Monat" },
  { value: "quartal", label: "Quartal" },
  { value: "jahr", label: "Jahr" },
  { value: "anderer", label: "anderer Zeitraum" },
];
export const periodField = (label = "Betrachtungszeitraum"): FieldDef => ({
  key: "zeitraum",
  label,
  type: "select",
  options: PERIOD_OPTIONS,
  defaultValue: "monat",
  help: "Alle Beträge und Mengen müssen sich auf denselben Zeitraum beziehen.",
});
export const periodName = (i: Inputs): string =>
  ({
    monat: "im Monat",
    quartal: "im Quartal",
    jahr: "im Jahr",
    anderer: "im gewählten Zeitraum",
  })[i.choices.zeitraum ?? "anderer"] ?? "im gewählten Zeitraum";

/** Ganzzahlige Mindestmenge q mit q ≥ x (mathematisch aufrunden, nicht < 0). */
export const ceilQty = (x: Decimal): Decimal => {
  const c = x.ceil();
  return c.isNegative() ? D(0) : c;
};
