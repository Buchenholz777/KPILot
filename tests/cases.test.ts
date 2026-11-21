import { describe, expect, it } from "vitest";
import { buildCases, FLOW_URL } from "../src/data/cases";
import { run } from "../src/calc/engine";
import { getVariant, CALCS } from "../src/calc/all";
import { evaluate, fromRaw } from "../src/calc/workflow";

const cases = buildCases();
const by = (id: string) => cases.find((c) => c.id === id)!;

describe("Praxisfälle – unabhängig von Hand gerechnete Erwartungswerte", () => {
  it("vier Fälle aus der gemeinsamen Datenquelle: Handel, Dienstleistung, Produktion, Werbung", () => {
    expect(cases.map((c) => c.id)).toEqual(["handel", "dienstleistung", "produktion", "werbung"]);
  });
  it("Handel: Ausgangssituation 100/80/100/1.500 und Rabattvariante", () => {
    expect(by("handel").check).toEqual({
      dbPerUnit: "20", dbQuote: "20", revenue: "10000", totalDb: "2000", profitToday: "500",
      newPrice: "90", dbAfter: "10", factor: "2", mehrabsatz: "100", qNeu: "200", profitRabatt: "-100", beRabatt: "150",
    });
  });
  it("Dienstleistung: Stunden statt Stück (80 abrechenbare Stunden, 60 € je abrechenbarer Stunde), 40 € + 5 € = 45 € bei 120 Stunden", () => {
    const c = by("dienstleistung");
    expect(c.check).toMatchObject({ fixPerHour: "40", fullUse: "45", dbPerHour: "60", beHours: "80", profit100: "1200", profit90: "600", profit110: "1800" });
    expect(c.check.dbUnit).toBe("je abrechenbarer Stunde");
    expect(c.check.beText).toBe("80 abrechenbare Stunden");
    const text = JSON.stringify([c.steps, c.result, c.assumptions, c.compare, c.question]);
    expect(text).not.toMatch(/Stück/);
    expect(text).not.toMatch(/Stück abrechenbar/);
    expect(text).toContain("60,00 € je abrechenbarer Stunde");
    expect(text).toContain("80 abrechenbare Stunden");
  });
  it("Produktion: Gewinnschwelle 3.000, 3.000 € bei 3.600, Zielgewinn 5.000 € → 4.000 Stück, Reserve 0, Preis 13 € → 6.600 €", () => {
    expect(by("produktion").check).toEqual({ dbPerUnit: "5", beQty: "3000", profit3600: "3000", qTarget: "4000", reserve: "0", profit13: "6600" });
  });
  it("Werbung: 3.600 € / 900 € / 30 % / 20 % → ROAS 4, 1.080 € → +180 €, Alternative 720 € → −180 €, Differenz −360 €, Mindest-ROAS 3,33… und 5", () => {
    const c = by("werbung").check;
    expect(c).toMatchObject({ roas: "4", dbBefore: "1080", after: "180", dbBeforeAlt: "720", afterAlt: "-180", diff: "-360", minRoasAlt: "5", afterQ25: "0" });
    expect(Number(c.minRoas)).toBeCloseTo(3.3333333, 6);
    expect(by("werbung").compare.rows.at(-1)).toEqual(["Mindest-ROAS", "3,3333-fach", "5,0-fach"]);
    expect(by("werbung").notes.join(" ")).toMatch(/Umsatz ist kein Gewinn/);
    expect(by("werbung").notes.join(" ")).toMatch(/keine Vorhersage/);
  });
  it("jeder Fall enthält Frage, fiktive Annahmen, Schritte, Ergebnis, Vergleich, nächsten Prüfschritt", () => {
    for (const c of cases) {
      expect(c.question.length).toBeGreaterThan(20);
      expect(c.assumptions.join(" ")).toMatch(/Fiktiv/i);
      expect(c.steps.length).toBeGreaterThanOrEqual(4);
      expect(c.result).toMatch(/\d/);
      expect(c.compare.rows.length).toBeGreaterThan(0);
      expect(c.next.length).toBeGreaterThan(20);
      expect(c.primary.label).toBe("Diesen Fall mit meinen Zahlen durchrechnen");
    }
  });
});

describe("Übergänge: jeder Link öffnet den Rechner mit genau den Werten seines Schritts", () => {
  const targetVariant = (target: string, values: Record<string, string>) =>
    CALCS[target].variants.find((x) => Object.keys(values).every((k) => x.fields.some((f) => f.key === k)));
  it("Handel Schritt 1 (Deckungsbeitrag) übernimmt 100/80/100 – nicht das Standardbeispiel 50/30/100", () => {
    const t = by("handel").steps[0].transfer;
    expect(t.target).toBe("deckungsbeitrag");
    expect(t.values).toMatchObject({ p: "100", v: "80", q: "100" });
    expect(t.values.p).not.toBe("50");
    const r = run(getVariant("deckungsbeitrag"), t.values).result;
    expect(r?.status === "ok" && r.main.value.toString()).toBe("20");
  });
  it("Rabattschritte nutzen den Rabattpreis 90 €, Ausgangsschritte den Preis 100 €", () => {
    const h = by("handel").steps;
    expect(h[1].transfer.values).toMatchObject({ p: "100", q: "100" });
    expect(h[3].transfer.values).toMatchObject({ p: "90", q: "140" });
    expect(h[4].transfer.values).toMatchObject({ p: "90" });
  });
  it("alle Schritt- und Abschlussübernahmen sind berechenbar, tragen Einheit/Zeitraum und enthalten keine Ergebniswerte", () => {
    for (const c of cases)
      for (const t of [...c.steps.map((s) => s.transfer), ...c.more, c.primary]) {
        if (t.target === "preis-ablauf") {
          expect(t.url).toBe(FLOW_URL);
          continue;
        }
        const v = targetVariant(t.target, t.values);
        expect(v, `${c.id} → ${t.target}`).toBeDefined();
        const res = run(v!, t.values).result;
        expect(res?.status, `${c.id} → ${t.target}`).toBe("ok");
        expect(Object.keys(t.values).join()).not.toMatch(/ergebnis|gewinn|result/i);
        expect(t.label).toBe(t.label.length ? t.label : "");
        expect(t.describe).toContain("Praxisfall");
      }
  });
  it("Dienstleistungsübernahmen tragen die Einheit „Stunde“", () => {
    for (const s of by("dienstleistung").steps.filter((x) => ["deckungsbeitrag", "break-even", "gewinn"].includes(x.transfer.target))) expect(s.transfer.values.einheit).toBe("stunde");
  });
  it("„Diesen Fall durchrechnen“ übernimmt alle Werte in den Preisablauf; Ergebnisse stimmen mit dem Fall überein", () => {
    for (const id of ["handel", "dienstleistung", "produktion"] as const) {
      const c = by(id);
      const flow = fromRaw(JSON.parse(c.primary.values.flow));
      const s = evaluate(flow);
      expect(s.missing).toEqual([]);
      expect(s.base.profit?.main.value.toString()).toBe(c.check.profitToday ?? c.check.profit100 ?? c.check.profit3600);
    }
    const h = fromRaw(JSON.parse(by("handel").primary.values.flow));
    expect(evaluate(h).scenarios[0].profit?.main.value.toString()).toBe("-100");
    const d = evaluate(fromRaw(JSON.parse(by("dienstleistung").primary.values.flow)));
    expect(d.unit).toBe("abrechenbare Stunden");
    expect(d.capacity?.required.toString()).toBe("80");
    const p = evaluate(fromRaw(JSON.parse(by("produktion").primary.values.flow)));
    expect(p.targetQty?.main.value.toString()).toBe("4000");
    expect(p.capacity).toMatchObject({ enough: true });
    expect(p.capacity?.reserve.toString()).toBe("0");
    expect(p.scenarios[0].profit?.main.value.toString()).toBe("6600");
  });
  it("Marketingfall öffnet den ROAS-Rechner (Wirtschaftlichkeit) mit allen vier Werten", () => {
    const t = by("werbung").primary;
    expect(t.target).toBe("roas");
    expect(t.values).toEqual({ umsatz: "3600", kosten: "900", quote: "30", alt: "20" });
    expect(targetVariant("roas", t.values)?.id).toBe("wirtschaftlichkeit");
  });
});
