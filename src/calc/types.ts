import type { Decimal } from "../lib/decimal";
import type { ValueFormat } from "../lib/number";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  /** Kurze Erläuterung direkt am Feld (Fachbegriff, Zeitraum, Bezugsgröße). */
  help?: string;
  /** Einheit, die neben dem Feld steht, z. B. „€ je Stück“. */
  unit?: string;
  type?: "number" | "select";
  /** nonneg: ≥ 0 · positive: > 0 · any: auch negativ */
  min?: "any" | "nonneg" | "positive";
  /** Obergrenze (inklusive), z. B. 100 bei Rabatt in %. */
  max?: number;
  /** Obergrenze exklusiv, z. B. Zielmarge < 100 %. */
  maxExclusive?: number;
  integer?: boolean;
  optional?: boolean;
  options?: SelectOption[];
  /** Vorauswahl nur für Auswahlfelder. */
  defaultValue?: string;
}

export interface RowsDef {
  key: string;
  label: string;
  columns: FieldDef[];
  minRows: number;
  maxRows: number;
  addLabel: string;
}

/** Rohwerte wie im Formular (Strings), auch für Beispiele und Speicherstände. */
export type RawInputs = Record<string, string | string[][]>;

/** Validierte Werte für die Rechenfunktion. */
export interface Inputs {
  values: Record<string, Decimal | undefined>;
  choices: Record<string, string>;
  rows: Record<string, Decimal[][]>;
}

export interface Out {
  label: string;
  value: Decimal;
  format: ValueFormat;
  unit?: string;
  signed?: boolean;
}

export interface ChartPoint {
  q: number;
  revenue: number;
  cost: number;
}

export type CalcResult =
  | {
      status: "ok";
      main: Out;
      extra?: Out[];
      /** Ein kurzer Satz zur Bedeutung des Ergebnisses. */
      meaning: string;
      /** Rechenweg mit eingesetzten Werten. */
      steps: string[];
      /** Interpretationsgrenzen direkt am Ergebnis. */
      notes?: string[];
      tone?: "neutral" | "positive" | "negative";
      chart?: { kind: "break-even"; points: ChartPoint[]; breakEven?: number };
    }
  | {
      status: "undefined" | "impossible" | "ambiguous";
      message: string;
      /** Werte, die trotzdem bestimmbar sind (z. B. absolute Veränderung). */
      partial?: Out[];
      fieldErrors?: Record<string, string>;
    }
  | {
      status: "invalid";
      message: string;
      fieldErrors: Record<string, string>;
    };

export interface VariantDef {
  id: string;
  /** Kurzname des Modus, z. B. „Prozentwert“. */
  label: string;
  /** Name für Favoriten, z. B. „Prozentwert berechnen“. */
  favLabel: string;
  question?: string;
  fields: FieldDef[];
  rows?: RowsDef;
  /** Dokumentierte Beispielwerte (Formularschreibweise). */
  example: RawInputs;
  compute(input: Inputs): CalcResult;
}

export interface TransferDef {
  target: string;
  label: string;
  /** Liefert Formularwerte für den Zielrechner (Feld-Key → String). */
  values(
    input: Inputs,
    result: Extract<CalcResult, { status: "ok" }>,
  ): Record<string, string>;
  /** Welche Bedeutung die übernommenen Werte haben. */
  describe: string;
}

export interface CalcDef {
  id: string;
  variants: VariantDef[];
  transfers?: TransferDef[];
  /** Szenariovergleich A/B für die angegebene Variante. */
  scenario?: { variantId: string };
  /** Schema-Version für gespeicherte Rechnungen. */
  schema: number;
}
