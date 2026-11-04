import DecimalBase from "decimal.js";

/**
 * Zentrale Decimal-Instanz für alle Rechnungen.
 * Präzision: 40 signifikante Stellen, kaufmännisches Runden (ROUND_HALF_UP).
 * 40 Stellen reichen auch für CAGR-Potenzen (x^(1/n)) und Quotienten aus
 * sehr kleinen positiven Werten innerhalb des zulässigen Eingabebereichs
 * (|x| < 10^15, höchstens 10 Nachkommastellen).
 */
export const Decimal = DecimalBase.clone({
  precision: 40,
  rounding: DecimalBase.ROUND_HALF_UP,
  toExpNeg: -30,
  toExpPos: 40,
});
export type Decimal = DecimalBase;

export const D = (v: DecimalBase.Value): Decimal => new Decimal(v);
export const ZERO = D(0);
export const HUNDRED = D(100);
