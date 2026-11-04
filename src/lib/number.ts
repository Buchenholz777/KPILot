import { D, Decimal } from "./decimal";

/** Größter zulässiger Betrag einer Eingabe (Billiarde). */
export const MAX_ABS = D("1e15");
/** Höchstens so viele Zeichen je Eingabefeld. */
export const MAX_INPUT_LENGTH = 24;
/** Höchstens so viele Nachkommastellen in einer Eingabe. */
export const MAX_FRACTION_DIGITS = 10;

export type ParseResult =
  | { kind: "empty" }
  | { kind: "incomplete" }
  | { kind: "ok"; value: Decimal }
  | { kind: "error"; message: string };

export const FORMAT_HINT =
  "Schreibweise: 1234 oder 1234,56 oder 1.234,56 (Komma für Nachkommastellen).";

/**
 * Wandelt eine deutsch oder eindeutig mit Dezimalpunkt geschriebene Zahl um.
 * Akzeptiert: 1234 · 1234,56 · 1.234,56 · 1.234.567 · 1234.5 · -12,5 · −12,5
 * Mehrdeutig (Fehler): 1.234 · 12.345 (Tausenderpunkt oder Dezimalpunkt?)
 */
export function parseNumber(raw: string): ParseResult {
  let s = raw.replace(/[\s  ]/g, "").replace(/[€%]/g, "");
  if (s === "") return { kind: "empty" };
  if (raw.length > MAX_INPUT_LENGTH) {
    return { kind: "error", message: "Die Eingabe ist zu lang." };
  }
  s = s.replace(/^[−–]/, "-").replace(/^\+/, "");
  // Zwischenzustände während der Eingabe
  if (/^-?$/.test(s) || /^-?\d[\d.]*[,.]$/.test(s))
    return { kind: "incomplete" };

  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  let normalized: string | null = null;

  if (body.includes(",")) {
    if (/^\d+(,\d+)?$/.test(body)) normalized = body.replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(body))
      normalized = body.replace(/\./g, "").replace(",", ".");
    else
      return {
        kind: "error",
        message: `Diese Zahl kann nicht gelesen werden. ${FORMAT_HINT}`,
      };
  } else if (body.includes(".")) {
    const parts = body.split(".");
    if (parts.length > 2) {
      if (/^\d{1,3}(\.\d{3})+$/.test(body))
        normalized = body.replace(/\./g, "");
      else
        return {
          kind: "error",
          message: `Diese Zahl kann nicht gelesen werden. ${FORMAT_HINT}`,
        };
    } else if (/^\d+\.\d+$/.test(body)) {
      if (parts[1].length === 3 && /^[1-9]\d{0,2}$/.test(parts[0])) {
        return {
          kind: "error",
          message: `„${raw.trim()}“ ist mehrdeutig: Tausenderpunkt oder Dezimalpunkt? Bitte z. B. ${parts[0]}${parts[1]} oder ${parts[0]},${parts[1]} schreiben.`,
        };
      }
      normalized = body;
    } else {
      return {
        kind: "error",
        message: `Diese Zahl kann nicht gelesen werden. ${FORMAT_HINT}`,
      };
    }
  } else if (/^\d+$/.test(body)) {
    normalized = body;
  } else {
    return {
      kind: "error",
      message: `Bitte nur Ziffern eingeben. ${FORMAT_HINT}`,
    };
  }

  const frac = normalized.split(".")[1];
  if (frac && frac.length > MAX_FRACTION_DIGITS) {
    return {
      kind: "error",
      message: `Bitte höchstens ${MAX_FRACTION_DIGITS} Nachkommastellen eingeben.`,
    };
  }
  const value = D(neg ? `-${normalized}` : normalized);
  if (value.abs().gte(MAX_ABS)) {
    return {
      kind: "error",
      message:
        "Die Zahl ist zu groß für diesen Rechner (höchstens 999 Billionen).",
    };
  }
  return { kind: "ok", value: value.isZero() ? D(0) : value };
}

/** Gruppiert einen nichtnegativen Ganzzahl-String mit Tausenderpunkten. */
function group(int: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export interface FormatOptions {
  /** Feste Nachkommastellen (z. B. 2 bei Geld). */
  fixed?: number;
  /** Maximal so viele Nachkommastellen, nachfolgende Nullen werden entfernt. */
  max?: number;
  /** Pluszeichen bei positiven Werten anzeigen. */
  signed?: boolean;
}

/**
 * Formatiert eine Decimal deutsch (Dezimalkomma, Tausenderpunkt).
 * Nie NaN/Infinity, nie „−0,00“. Sehr kleine Werte ≠ 0, die auf 0 gerundet
 * würden, werden mit mehr Stellen bzw. als „< 0,01“ dargestellt.
 */
export function formatDecimal(
  value: Decimal,
  opts: FormatOptions = {},
): string {
  if (!value.isFinite()) return "–";
  const digits = opts.fixed ?? opts.max ?? 2;
  let rounded = value.toDecimalPlaces(digits, Decimal.ROUND_HALF_UP);

  if (rounded.isZero() && !value.isZero()) {
    // Mehr Stellen zeigen, statt eine echte Zahl als 0 auszugeben
    for (let d = digits + 1; d <= 8; d++) {
      const r = value.toDecimalPlaces(d, Decimal.ROUND_HALF_UP);
      if (!r.isZero())
        return formatDecimal(value, { max: d, signed: opts.signed });
    }
    const limit = `0,${"0".repeat(7)}1`;
    return value.isNegative() ? `> −${limit}` : `< ${limit}`;
  }

  if (rounded.isZero()) rounded = D(0);
  const neg = rounded.isNegative();
  let str = rounded.abs().toFixed(digits);
  let [int, frac = ""] = str.split(".");
  if (opts.fixed === undefined) frac = frac.replace(/0+$/, "");
  str = group(int) + (frac ? `,${frac}` : "");
  if (neg) return `−${str}`;
  if (opts.signed && !rounded.isZero()) return `+${str}`;
  return str;
}

export type ValueFormat =
  "money" | "percent" | "pp" | "number" | "integer" | "factor" | "score";

/** Formatiert einen Ergebniswert inklusive Einheit. */
export function formatValue(
  value: Decimal,
  format: ValueFormat,
  unit?: string,
  signed = false,
): string {
  let s: string;
  switch (format) {
    case "money": {
      if (!value.isZero() && value.abs().lt("0.005")) {
        s = value.isNegative() ? "> −0,01 €" : "< 0,01 €";
        if (signed && !value.isNegative()) s = s.replace("<", "< +");
        return unit ? `${s} ${unit}` : s;
      }
      s = `${formatDecimal(value, { fixed: 2, signed })} €`;
      break;
    }
    case "percent":
      s = `${formatDecimal(value, { max: 2, signed })} %`;
      break;
    case "pp": {
      const n = formatDecimal(value, { max: 2, signed });
      s = `${n} ${value.abs().eq(1) ? "Prozentpunkt" : "Prozentpunkte"}`;
      break;
    }
    case "factor": {
      const oneDecimal = value.toDecimalPlaces(1).eq(value.toDecimalPlaces(2));
      s = `${formatDecimal(value, oneDecimal ? { fixed: 1 } : { max: 2 })}-fach`;
      break;
    }
    case "integer":
      s = formatDecimal(value, { fixed: 0, signed });
      break;
    case "score":
      s = `${formatDecimal(value, { max: 1, signed: true })}`;
      break;
    default:
      s = formatDecimal(value, { max: 4, signed });
  }
  return unit ? `${s} ${unit}` : s;
}

/** Schreibt eine Zahl so, dass sie als Formulareingabe eindeutig lesbar ist (ohne Tausenderpunkte). */
export function toInput(v: Decimal): string {
  return v.toDecimalPlaces(MAX_FRACTION_DIGITS).toFixed().replace(".", ",");
}

/** Kurzform für Fließtext: Geldbetrag. */
export const eur = (v: Decimal) => formatValue(v, "money");
/** Kurzform für Fließtext: Prozent. */
export const pct = (v: Decimal, signed = false) =>
  formatValue(v, "percent", undefined, signed);
/** Kurzform für Fließtext: Zahl. */
export const num = (v: Decimal, signed = false) =>
  formatValue(v, "number", undefined, signed);
