import { expect } from "vitest";
import { run } from "../src/calc/engine";
import { getVariant } from "../src/calc/all";
import type { CalcResult, RawInputs } from "../src/calc/types";

export type Ok = Extract<CalcResult, { status: "ok" }>;

export function calc(
  id: string,
  variant: string | undefined,
  raw: RawInputs,
): CalcResult | null {
  return run(getVariant(id, variant), raw).result;
}

/** Erwartet ein gültiges Ergebnis und liefert es typisiert zurück. */
export function okCalc(
  id: string,
  variant: string | undefined,
  raw: RawInputs,
): Ok {
  const r = calc(id, variant, raw);
  expect(r, `${id}/${variant}: kein Ergebnis`).not.toBeNull();
  if (r!.status !== "ok")
    throw new Error(
      `${id}/${variant}: ${r!.status} – ${"message" in r! ? r!.message : ""}`,
    );
  return r as Ok;
}

/** Wert eines Neben-Ergebnisses anhand des Labelanfangs. */
export function extra(r: Ok, labelStart: string): string {
  const o = r.extra?.find((e) => e.label.startsWith(labelStart));
  if (!o)
    throw new Error(
      `Kein Ergebnis „${labelStart}“ in ${r.extra?.map((e) => e.label).join(", ")}`,
    );
  return o.value.toString();
}

/** Vergleich mit dokumentierter Toleranz (für Potenzen wie CAGR). */
export function near(actual: string, expected: string, tol = "1e-20") {
  const a = Number(actual),
    e = Number(expected);
  expect(Math.abs(a - e)).toBeLessThanOrEqual(
    Number(tol) * Math.max(1, Math.abs(e)),
  );
}
