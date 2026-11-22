import { describe, expect, it } from "vitest";
import { calc } from "./helpers";
import { run as runEngine } from "../src/calc/engine";
import { getVariant } from "../src/calc/all";

/** Erwartungswerte unabhängig von Hand gerechnet (siehe Kommentare), nicht aus der Implementierung. */
const run = (values: Record<string, string>) => calc("rabatt-absatz", "preis-absatz", { zeitraum: "monat", ...values });
const txt = (r: any, label: string) => {
  const o = [r.main, ...(r.extra ?? [])].find((e: any) => e.label === label);
  return o && o.value.toString();
};

describe("Preis & Absatz (Rabatt-Rechner)", () => {
  const base = { preis: "100", v: "60", neuerPreis: "90", q0: "100", q1: "130", F: "2000" };

  it("Beispiel: 10 € Preisnachlass bei 30 % mehr Absatz verliert trotzdem 100 €", () => {
    const r: any = run(base);
    expect(r.status).toBe("ok");
    // vorher (100−60)·100 = 4.000 · nachher (90−60)·130 = 3.900 · Δ = −100
    expect(txt(r, "Veränderung des Deckungsbeitrags")).toBe("-100");
    expect(txt(r, "Umsatz vorher")).toBe("10000");
    expect(txt(r, "Umsatz nachher")).toBe("11700");
    expect(txt(r, "Gewinn vorher")).toBe("2000");
    expect(txt(r, "Gewinn nachher")).toBe("1900");
    // 4.000 / 30 = 133,33 → 134 Einheiten
    expect(txt(r, "Erforderliche neue Menge")).toBe("134");
    // Break-even: 2.000/40 = 50 · 2.000/30 = 66,67 → 67
    expect(txt(r, "Break-even-Menge vorher")).toBe("50");
    expect(txt(r, "Break-even-Menge nachher")).toBe("67");
    expect(r.tone).toBe("negative");
    expect(r.meaning).toContain("sinkt");
    expect(r.notes.join(" ")).toContain("Nachfragereaktion");
  });

  it("Preiserhöhung mit weniger Absatz kann den Deckungsbeitrag steigern", () => {
    const r: any = run({ ...base, neuerPreis: "110", q1: "80" });
    // (110−60)·80 = 4.000 = bisher → Δ 0; Menge zum Halten = 4.000/50 = 80
    expect(txt(r, "Veränderung des Deckungsbeitrags")).toBe("0");
    expect(txt(r, "Erforderliche neue Menge")).toBe("80");
    const r2: any = run({ ...base, neuerPreis: "110", q1: "90" });
    expect(txt(r2, "Veränderung des Deckungsbeitrags")).toBe("500"); // 50·90 − 4.000
    expect(r2.tone).toBe("positive");
  });

  it("ohne Fixkosten gibt es weder Gewinn noch Break-even", () => {
    const r: any = run({ ...base, F: "" });
    expect(r.status).toBe("ok");
    expect(txt(r, "Gewinn nachher")).toBeUndefined();
    expect(txt(r, "Break-even-Menge nachher")).toBeUndefined();
  });

  it("Preis unter den variablen Kosten: keine Halte-Menge, Verlust je Einheit, kein Break-even", () => {
    const r: any = run({ ...base, neuerPreis: "55" });
    expect(r.status).toBe("ok");
    expect(txt(r, "Erforderliche neue Menge")).toBeUndefined();
    expect(txt(r, "Deckungsbeitrag nachher")).toBe("-650"); // (55−60)·130
    expect(txt(r, "Break-even-Menge nachher")).toBe("0");
    expect(r.extra.find((e: any) => e.label === "Break-even-Menge nachher").unit).toBe("nicht erreichbar");
    expect(r.meaning).toContain("deckt die variablen Kosten nicht");
  });

  it("Preis gleich variable Kosten: Stückbeitrag 0, ebenfalls keine Halte-Menge", () => {
    const r: any = run({ ...base, neuerPreis: "60" });
    expect(txt(r, "Deckungsbeitrag nachher")).toBe("0");
    expect(txt(r, "Erforderliche neue Menge")).toBeUndefined();
  });

  it("Ausgangspreis unter variablen Kosten: Halten nicht definiert, kein Absturz", () => {
    const r: any = run({ ...base, preis: "50", neuerPreis: "45" });
    expect(r.status).toBe("ok");
    expect(txt(r, "Erforderliche neue Menge")).toBeUndefined();
  });

  it("bisheriger Absatz 0 wird als ungültig abgelehnt (keine Division durch null)", () => {
    const e = runEngine(getVariant("rabatt-absatz", "preis-absatz"), { zeitraum: "monat", ...base, q0: "0" });
    expect(e.result).toBeNull();
    expect(Object.keys(e.validation.fieldErrors)).toContain("q0");
  });

  it("Dezimaleingaben: Preis 99,90 bei 60,40 Kosten", () => {
    const r: any = run({ ...base, neuerPreis: "99,90", v: "60,40", preis: "100", q1: "100" });
    // (100−60,40)·100 = 3.960 · (99,90−60,40)·100 = 3.950 · Δ −10
    expect(txt(r, "Veränderung des Deckungsbeitrags")).toBe("-10");
  });
});
