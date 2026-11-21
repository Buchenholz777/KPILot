import { describe, expect, it } from "vitest";
import { compareScenarios } from "../src/calc/scenario";
import { getVariant } from "../src/calc/all";
import { okCalc, extra, calc } from "./helpers";

const be = getVariant("break-even");
const gw = getVariant("gewinn", "menge");
const base = { p: "50", v: "30", F: "3000", zeitraum: "monat" };

describe("Break-even: Prüffälle aus dem Auftrag", () => {
  it("Fixkosten 3.001: theoretisch 150,05, Mindestmenge 151, Gewinn dort 19 €", () => {
    const r = okCalc("break-even", undefined, { ...base, F: "3001" });
    expect(extra(r, "Theoretische Gewinnschwelle")).toBe("150.05");
    expect(r.main.value.toString()).toBe("151");
    expect(extra(r, "Gewinn bei dieser")).toBe("19");
  });
  it("Preis = variable Kosten und positive Fixkosten: keine erreichbare Gewinnschwelle, verständliche Erklärung", () => {
    const r = calc("break-even", undefined, { p: "50", v: "50", F: "1000", zeitraum: "monat" });
    expect(r?.status).toBe("impossible");
    expect(r && "message" in r ? r.message : "").toMatch(/Keine erreichbare Gewinnschwelle/);
  });
});

describe("A/B-Vergleich", () => {
  it("gleicher Zeitraum: Gewinnschwelle A 150, B 120, Differenz −30 Stück", () => {
    const c = compareScenarios(be, base, { ...base, p: "55" });
    expect(c.state).toBe("ok");
    expect(c.periodsMatch).toBe(true);
    const main = c.rows[0];
    expect(main.a).toBe("150 Stück");
    expect(main.b).toBe("120 Stück");
    expect(main.diff).toBe("−30 Stück");
    expect(c.differingLabels).toEqual(["Nettoverkaufspreis je Stück"]);
  });
  it("Reproduktionsfall: 3.000 € je Monat vs. 3.000 € je Jahr erzeugt KEINE Differenz 0", () => {
    const c = compareScenarios(be, base, { ...base, zeitraum: "jahr" });
    expect(c.periodsMatch).toBe(false);
    expect(c.warnings.join(" ")).toMatch(/unterschiedliche Zeiträume/);
    expect(c.warnings.join(" ")).toMatch(/nicht automatisch um/);
    for (const row of c.rows) {
      expect(row.diff).toBeUndefined();
      expect(row.diffNote).toMatch(/Zeiträume verschieden/);
    }
    expect(c.differingLabels).toContain("Betrachtungszeitraum");
  });
  it("Gewinn/Verlust verschiedener Szenarien bleiben vergleichbar (gleiche Größe, anderes Vorzeichen)", () => {
    const g = { p: "50", v: "30", F: "3000", zeitraum: "monat" };
    const c = compareScenarios(gw, { ...g, q: "100" }, { ...g, q: "200" });
    expect(c.rows[0].a).toBe("−1.000,00 €");
    expect(c.rows[0].b).toBe("+1.000,00 €");
    expect(c.rows[0].diff).toBe("+2.000,00 €");
  });
  it("nur ein Szenario ausgefüllt: keine Differenz, B als fehlend gekennzeichnet", () => {
    const c = compareScenarios(be, base, { zeitraum: "monat" });
    expect(c.state).toBe("one-side");
    expect(c.rows[0].b).toBe("fehlt noch");
    expect(c.rows[0].diff).toBeUndefined();
  });
  it("Zahlenschreibweisen gelten als gleich (3000 = 3.000,00)", () => {
    const c = compareScenarios(be, base, { ...base, F: "3.000,00" });
    expect(c.differingFields).toEqual([]);
  });
});

describe("Übernahme Break-even → Gewinn", () => {
  it("die Übernahme liefert Preis, variable Kosten, Fixkosten und Zeitraum; mit Menge 200 ergibt sich 1.000 € Gewinn", async () => {
    const { CALCS } = await import("../src/calc/all");
    const { validate } = await import("../src/calc/engine");
    const v = validate(be, base).inputs!;
    const t = CALCS["break-even"].transfers!.find((x) => x.target === "gewinn")!;
    const r = okCalc("break-even", undefined, base);
    const values = t.values(v, r);
    expect(values).toEqual({ p: "50", v: "30", F: "3000", zeitraum: "monat", einheit: "stueck" });
    const g = okCalc("gewinn", "menge", { ...values, q: "200" });
    expect(g.main.value.toString()).toBe("1000");
  });
  it("ohne Menge entsteht kein Ergebnis (kein stillschweigender Nullwert)", async () => {
    const { run } = await import("../src/calc/engine");
    const { validation, result } = run(gw, { ...base, q: "" });
    expect(result).toBeNull();
    expect(validation.missing).toContain("q");
  });
});
