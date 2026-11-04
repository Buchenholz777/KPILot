import { D, type Decimal } from "../lib/decimal";
import { parseNumber } from "../lib/number";
import type {
  CalcResult,
  FieldDef,
  Inputs,
  RawInputs,
  VariantDef,
} from "./types";

export interface Validation {
  inputs?: Inputs;
  /** Fehler je Feld (Key bzw. „rows:<key>:<zeile>:<spalte>“). */
  fieldErrors: Record<string, string>;
  /** Pflichtfelder ohne Eingabe. */
  missing: string[];
  /** Felder in einem Zwischenzustand (z. B. „12,“). */
  incomplete: string[];
}

function checkField(
  f: FieldDef,
  raw: string | undefined,
): {
  value?: Decimal;
  error?: string;
  state: "ok" | "empty" | "incomplete" | "error";
} {
  const p = parseNumber(raw ?? "");
  if (p.kind === "empty") return { state: "empty" };
  if (p.kind === "incomplete") return { state: "incomplete" };
  if (p.kind === "error") return { state: "error", error: p.message };
  const v = p.value;
  if (f.integer && !v.isInteger())
    return { state: "error", error: "Bitte eine ganze Zahl eingeben." };
  if (f.min === "nonneg" && v.isNegative())
    return { state: "error", error: "Bitte keinen negativen Wert eingeben." };
  if (f.min === "positive" && v.lte(0))
    return { state: "error", error: "Bitte einen Wert größer als 0 eingeben." };
  if (f.max !== undefined && v.gt(f.max))
    return {
      state: "error",
      error: `Bitte höchstens ${String(f.max).replace(".", ",")} eingeben.`,
    };
  if (f.maxExclusive !== undefined && v.gte(f.maxExclusive))
    return {
      state: "error",
      error: `Bitte einen Wert kleiner als ${String(f.maxExclusive).replace(".", ",")} eingeben.`,
    };
  return { state: "ok", value: v };
}

/** Prüft alle Eingaben einer Variante. Fehlende Angaben werden nie als 0 behandelt. */
export function validate(variant: VariantDef, raw: RawInputs): Validation {
  const res: Validation = { fieldErrors: {}, missing: [], incomplete: [] };
  const inputs: Inputs = { values: {}, choices: {}, rows: {} };

  for (const f of variant.fields) {
    const r = raw[f.key];
    if (f.type === "select") {
      const val = typeof r === "string" && r ? r : (f.defaultValue ?? "");
      if (!f.options?.some((o) => o.value === val)) {
        if (!f.optional) res.missing.push(f.key);
      } else inputs.choices[f.key] = val;
      continue;
    }
    const c = checkField(f, typeof r === "string" ? r : "");
    if (c.state === "ok") inputs.values[f.key] = c.value;
    else if (c.state === "error") res.fieldErrors[f.key] = c.error!;
    else if (c.state === "incomplete") res.incomplete.push(f.key);
    else if (!f.optional) res.missing.push(f.key);
  }

  if (variant.rows) {
    const rd = variant.rows;
    const rows = Array.isArray(raw[rd.key]) ? (raw[rd.key] as string[][]) : [];
    const parsed: Decimal[][] = [];
    rows.forEach((row, ri) => {
      const allEmpty = rd.columns.every((_, ci) => !(row[ci] ?? "").trim());
      if (allEmpty) return;
      const vals: Decimal[] = [];
      let rowOk = true;
      rd.columns.forEach((col, ci) => {
        const key = `rows:${rd.key}:${ri}:${ci}`;
        const c = checkField(col, row[ci]);
        if (c.state === "ok") vals.push(c.value!);
        else {
          rowOk = false;
          if (c.state === "error") res.fieldErrors[key] = c.error!;
          else if (c.state === "incomplete") res.incomplete.push(key);
          else res.missing.push(key);
        }
      });
      if (rowOk) parsed.push(vals);
    });
    inputs.rows[rd.key] = parsed;
    if (parsed.length < rd.minRows && !Object.keys(res.fieldErrors).length) {
      res.missing.push(`rows:${rd.key}`);
    }
  }

  if (
    !Object.keys(res.fieldErrors).length &&
    !res.missing.length &&
    !res.incomplete.length
  ) {
    res.inputs = inputs;
  }
  return res;
}

/** Validiert und berechnet. Gibt null zurück, solange Angaben fehlen. */
export function run(
  variant: VariantDef,
  raw: RawInputs,
): { validation: Validation; result: CalcResult | null } {
  const validation = validate(variant, raw);
  if (!validation.inputs) return { validation, result: null };
  return { validation, result: variant.compute(validation.inputs) };
}

/** Für Tests und Build: Beispiel einer Variante berechnen (muss gültig sein). */
export function runExample(variant: VariantDef) {
  const { validation, result } = run(variant, variant.example);
  if (!result) {
    throw new Error(
      `Beispiel für ${variant.id} ist unvollständig: ${JSON.stringify({ ...validation, inputs: undefined })}`,
    );
  }
  return result;
}

export const dec = D;
