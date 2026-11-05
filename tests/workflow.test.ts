import { describe, expect, it } from "vitest";
import { emptyFlow, exampleFlow, evaluate, fromRaw, toRaw, priceForQuote, outText, type FlowState } from "../src/calc/workflow";

const base = (o: Partial<FlowState> = {}): FlowState => ({ ...exampleFlow(), scenarios: [], priceDelta: "", costDelta: "", ...o });

describe("Ablauf Preis & Wirtschaftlichkeit", () => {
  it("liefert dieselben Zahlen wie die Einzelrechner (150 Stück, 1.000 € Gewinn)", () => {
    const s = evaluate(base());
    expect(s.missing).toEqual([]);
    expect(outText(s.base.dbUnit)).toBe("20,00 € je Stück");
    expect(outText(s.base.dbQuote)).toBe("40 %");
    expect(outText(s.base.qMin)).toBe("150 Stück");
    expect(outText(s.base.profitFrom)).toBe("151 Stück");
    expect(s.base.profit?.main.value.toString()).toBe("1000");
    expect(s.period).toBe("Monat");
  });
  it("fehlende Menge bleibt unbekannt: kein Gewinn, kein stillschweigender Nullwert; Hinweis verschwindet nach Ergänzung", () => {
    const s = evaluate(base({ q: "" }));
    expect(s.base.profit).toBeUndefined();
    expect(s.missing.map((m) => m.key)).toEqual(["q"]);
    expect(s.missing[0].neededFor).toMatch(/Gewinn/);
    expect(s.base.qMin).toBeDefined(); // alles andere bleibt berechenbar
    expect(evaluate(base({ q: "200" })).missing).toEqual([]);
  });
  it("leerer Ablauf: alle vier Werte fehlen, nichts wird berechnet", () => {
    const s = evaluate(emptyFlow());
    expect(s.missing.map((m) => m.key).sort()).toEqual(["F", "p", "q", "v"]);
    expect(s.base.dbUnit).toBeUndefined();
    expect(s.base.qMin).toBeUndefined();
  });
  it("Vollkosten statt variabler Kosten werden nicht übernommen (keine Doppelzählung der Fixkosten)", () => {
    const s = evaluate(base({ costType: "voll" }));
    expect(s.blocked).toMatch(/doppelt/);
    expect(s.base.qMin).toBeUndefined();
  });
  it("Einstandspreis wird als variable Kosten akzeptiert", () => {
    expect(evaluate(base({ costType: "einstand" })).blocked).toBeUndefined();
  });
  it("Preis unter variablen Kosten: verständliche Grenze statt Zahl", () => {
    const s = evaluate(base({ p: "20" }));
    expect(s.base.qMin).toBeUndefined();
    expect(s.base.breakEvenProblem).toMatch(/Keine erreichbare Gewinnschwelle/);
    expect(s.base.profit?.main.value.toString()).toBe("-5000"); // 20·200 − (3000 + 30·200) = 4000 − 9000
  });
  it("Preis- und Kostenänderungen wirken auf Mindestabsatz und Gewinn", () => {
    const s = evaluate(base({ priceDelta: "5", costDelta: "2" }));
    expect(outText(s.priceEffect?.after.qMin)).toBe("120 Stück"); // 3000 / (55 − 30)
    expect(s.priceEffect?.after.profit?.main.value.toString()).toBe("2000"); // 25·200 − 3000
    expect(outText(s.costEffect?.after.qMin)).toBe("167 Stück"); // 3000 / 18 = 166,67 → 167
    expect(s.costEffect?.after.profit?.main.value.toString()).toBe("600"); // 18·200 − 3000
  });
  it("Varianten erben die Basis, benennen abweichende Eingaben und vergleichen im selben Zeitraum", () => {
    const s = evaluate(base({ scenarios: [{ name: "Vorsichtig", p: "", v: "", F: "", q: "150" }, { name: "Optimistisch", p: "55", v: "", F: "", q: "250" }] }));
    expect(s.scenarios.map((x) => x.name)).toEqual(["Vorsichtig", "Optimistisch"]);
    expect(s.differing["Vorsichtig"]).toEqual(["q"]);
    expect(s.differing["Optimistisch"]).toEqual(["p", "q"]);
    expect(s.scenarios[0].profit?.main.value.toString()).toBe("0"); // 20·150 − 3000
    expect(outText(s.scenarios[1].qMin)).toBe("120 Stück");
    expect(s.scenarios[1].profit?.main.value.toString()).toBe("3250"); // 25·250 − 3000
  });
  it("Zielgewinn und Kapazität: Zeitraum und Einheit gehören zusammen", () => {
    const s = evaluate(base({ z: "1000", cap: "180" }));
    expect(s.targetQty?.main.value.toString()).toBe("200");
    expect(s.capacity).toMatchObject({ enough: false });
    expect(s.capacity?.gap.toString()).toBe("20");
    const t = evaluate(base({ z: "1000", cap: "250" }));
    expect(t.capacity?.enough).toBe(true);
    expect(t.capacity?.reserve.toString()).toBe("50");
  });
  it("Kapazität ohne Zielgewinn prüft die Mindestmenge zur Kostendeckung", () => {
    expect(evaluate(base({ cap: "100" })).capacity?.required.toString()).toBe("150");
  });
  it("geschätzte Angaben erscheinen als unsichere Annahmen", () => {
    const s = evaluate(base());
    expect(s.uncertain.map((u) => u.key).sort()).toEqual(["p", "q"]);
  });
  it("Speicherformat: Rundreise ohne Verlust, ungültige Daten werden bereinigt", () => {
    const f = exampleFlow();
    expect(fromRaw(toRaw(f))).toEqual(f);
    const bad = fromRaw({ zeitraum: "x", costType: "hack", scenarios: [["<b>x</b>".repeat(20), "1", "", "", ""]] as string[][], origin: "p:geschaetzt,evil:beobachtet,q:wasauchimmer" });
    expect(bad.zeitraum).toBe("monat");
    expect(bad.costType).toBe("variabel");
    expect(bad.origin).toEqual({ p: "geschaetzt" });
    expect(bad.scenarios[0].name.length).toBeLessThanOrEqual(30);
  });
  it("Preis aus Ziel-Deckungsbeitragsquote nutzt die Zielpreis-Rechnung", () => {
    // v = 30, Quote 40 % vom Preis → 30 / 0,6 = 50
    expect(outText(priceForQuote("30", "40").price)).toBe("50,00 €");
    expect(priceForQuote("", "40").message).toBeDefined();
    expect(priceForQuote("30", "100").message).toBeDefined();
  });
});
