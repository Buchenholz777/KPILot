import { describe, expect, it } from "vitest";
import { parseNumber, formatValue, formatDecimal } from "../src/lib/number";
import { D } from "../src/lib/decimal";

const ok = (s: string) => {
  const r = parseNumber(s);
  if (r.kind !== "ok") throw new Error(`${s} → ${JSON.stringify(r)}`);
  return r.value.toString();
};

describe("parseNumber", () => {
  it("liest die geforderten Schreibweisen", () => {
    expect(ok("1234")).toBe("1234");
    expect(ok("1234,56")).toBe("1234.56");
    expect(ok("1.234,56")).toBe("1234.56");
    expect(ok("1.234.567")).toBe("1234567");
    expect(ok("-12,5")).toBe("-12.5");
    expect(ok("−12,5")).toBe("-12.5");
    expect(ok("0,5")).toBe("0.5");
    expect(ok("1234.5")).toBe("1234.5");
    expect(ok("12 %")).toBe("12");
    expect(ok("50 €")).toBe("50");
  });
  it("rät mehrdeutige Eingaben nicht", () => {
    expect(parseNumber("1.234").kind).toBe("error");
    expect(parseNumber("12.345").kind).toBe("error");
  });
  it("erkennt leer, Zwischenzustände und Unsinn", () => {
    expect(parseNumber("").kind).toBe("empty");
    expect(parseNumber("  ").kind).toBe("empty");
    expect(parseNumber("-").kind).toBe("incomplete");
    expect(parseNumber("12,").kind).toBe("incomplete");
    expect(parseNumber("abc").kind).toBe("error");
    expect(parseNumber("1,2,3").kind).toBe("error");
    expect(parseNumber("12.34.5").kind).toBe("error");
  });
  it("begrenzt Länge und Zahlenumfang", () => {
    expect(parseNumber("1".repeat(30)).kind).toBe("error");
    expect(parseNumber("1000000000000000").kind).toBe("error");
    expect(parseNumber("0,12345678901").kind).toBe("error");
  });
});

describe("Formatierung", () => {
  it("nutzt Dezimalkomma und Tausenderpunkt", () => {
    expect(formatValue(D("1234.5"), "money")).toBe("1.234,50 €");
    expect(formatValue(D("2.5"), "percent")).toBe("2,5 %");
    expect(formatValue(D("17.5"), "number")).toBe("17,5");
  });
  it("zeigt nie −0,00", () => {
    expect(formatValue(D("-0.001"), "money")).toBe("> −0,01 €");
    expect(formatDecimal(D("-0.0000"), { fixed: 2 })).toBe("0,00");
    expect(formatValue(D("-0.004"), "percent")).not.toMatch(/^−0 %$/);
  });
  it("stellt sehr kleine Werte nicht als exakt 0 dar", () => {
    expect(formatValue(D("0.0004"), "percent")).toBe("0,0004 %");
    expect(formatValue(D("0.001"), "money")).toBe("< 0,01 €");
  });
  it("ROAS als Faktor", () => {
    expect(formatValue(D(4), "factor")).toBe("4,0-fach");
    expect(formatValue(D("2.25"), "factor")).toBe("2,25-fach");
  });
  it("Prozentpunkte Einzahl/Mehrzahl", () => {
    expect(formatValue(D(1), "pp", undefined, true)).toBe("+1 Prozentpunkt");
    expect(formatValue(D(2), "pp")).toBe("2 Prozentpunkte");
  });
});
