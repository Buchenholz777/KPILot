import { describe, expect, it } from "vitest";
import { buildCases } from "../src/data/cases";
import { run } from "../src/calc/engine";
import { getVariant, CALCS } from "../src/calc/all";

const cases = buildCases();
const by = (id: string) => cases.find((c) => c.id === id)!;

describe("Praxisfälle – unabhängig von Hand gerechnete Erwartungswerte", () => {
  it("es gibt je einen Fall für Handel, Dienstleistung und Produktion", () => {
    expect(cases.map((c) => c.id)).toEqual(["handel", "dienstleistung", "produktion"]);
  });
  it("Handel: Beitrag 20 €, Gewinn heute 500 €, Rabatt 10 % → Faktor 2, +100 %, 200 Stück; mit 140 Stück −100 €; Gewinnschwelle 150", () => {
    expect(by("handel").check).toEqual({ dbPerUnit: "20", profitToday: "500", mehrabsatz: "100", qNeu: "200", profitRabatt: "-100", beRabatt: "150" });
  });
  it("Dienstleistung: 40 €/h Kosten, Beitrag 60 €/h, 80 h Gewinnschwelle, 1.200 € bei 100 h (600 € / 1.800 € bei 90 / 110 h)", () => {
    expect(by("dienstleistung").check).toEqual({ kostenJeStunde: "40", dbJeStunde: "60", beStunden: "80", profit100: "1200", profit90: "600", profit110: "1800" });
  });
  it("Produktion: Beitrag 5 €, Schwelle 3.000 Stück, 3.000 € bei 3.600 Stück, Zielgewinn 5.000 € → 4.000 Stück (= Kapazität), Preis 13 € → 6.600 €", () => {
    expect(by("produktion").check).toEqual({ dbPerUnit: "5", beQty: "3000", profit3600: "3000", qTarget: "4000", profit13: "6600" });
  });
  it("jeder Fall enthält Frage, ausdrücklich fiktive Annahmen, Schritte, Ergebnis, Vergleich und nächsten Prüfschritt", () => {
    for (const c of cases) {
      expect(c.question.length).toBeGreaterThan(20);
      expect(c.assumptions.join(" ")).toMatch(/Fiktiv/i);
      expect(c.steps.length).toBeGreaterThanOrEqual(4);
      expect(c.result).toMatch(/\d/);
      expect(c.compare.comparison.state).toBe("ok");
      expect(c.compare.comparison.periodsMatch).toBe(true);
      expect(c.next.length).toBeGreaterThan(20);
    }
  });
  it("Variantenvergleich der Fälle nennt die Differenzen", () => {
    expect(by("handel").compare.comparison.rows[0].diff).toBe("−600,00 €"); // −100 € − 500 €
  });
  it("Übernahmewerte sind in den Zielrechnern berechenbar (Beispiele lassen sich in geeignete Rechner übernehmen)", () => {
    for (const c of cases)
      for (const t of c.transfers) {
        const keys = Object.keys(t.values);
        const v = CALCS[t.target].variants.find((x) => keys.every((k) => x.fields.some((f) => f.key === k)));
        expect(v, `${c.id} → ${t.target}`).toBeDefined();
        expect(run(v!, t.values).result?.status, `${c.id} → ${t.target}`).toBe("ok");
      }
  });
});
