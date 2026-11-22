import { describe, expect, it } from "vitest";
import { calc, type Ok } from "./helpers";
import { liquidityPlan } from "../src/calc/modules/cashflow";
import { D } from "../src/lib/decimal";
import { loadChartBuilders, buildCharts } from "../src/calc/charts";
import { run } from "../src/calc/engine";
import { getVariant } from "../src/calc/all";

/** Alle Erwartungswerte von Hand gerechnet (Beispiel siehe Modul): Start 5.000 €, 6 Monate. */
const rows = [["12000", "11000"], ["9000", "16000"], ["15000", "12000"], ["8000", "13500"], ["16000", "11000"], ["12000", "11500"]];
const go = (extra: Record<string, unknown> = {}, r = rows) => calc("cashflow", "plan", { start: "5000", periode: "monat", verzug: "", perioden: r, ...extra } as any) as any;
const ex = (r: Ok, l: string): any => [r.main, ...(r.extra ?? [])].find((e) => e.label.startsWith(l));

describe("Liquiditätsplan (Cashflow-Rechner, Modus „Liquiditätsplan“)", () => {
  it("Beispiel: Endbestände 6.000 / −1.000 / 2.000 / −3.500 / 1.500 / 2.000", () => {
    const r = go();
    expect(r.status).toBe("ok");
    expect(r.breakdown.map((b: any) => b.value.toString())).toEqual(["6000", "-1000", "2000", "-3500", "1500", "2000"]);
    expect(r.main.value.toString()).toBe("2000");
    expect(ex(r, "Niedrigster Endbestand").value.toString()).toBe("-3500");
    expect(ex(r, "Niedrigster Endbestand").unit).toBe("in Monat 4");
    expect(ex(r, "Perioden mit negativem").value.toString()).toBe("2");
    expect(ex(r, "Erste Monat mit negativem").value.toString()).toBe("2");
    expect(ex(r, "Einzahlungen im Planzeitraum").value.toString()).toBe("72000");
    expect(ex(r, "Auszahlungen im Planzeitraum").value.toString()).toBe("75000");
    expect(r.tone).toBe("negative");
    expect(r.comparison).toBeUndefined();
  });

  it("Summenkontrolle: Endbestand = Anfang + Einzahlungen − Auszahlungen", () => {
    expect(5000 + 72000 - 75000).toBe(2000);
  });

  it("Zahlungsverzug 1 Periode: Einzahlungen rutschen, die letzte bleibt offen", () => {
    const r = go({ verzug: "1" });
    // Einzahlungen 0 / 12.000 / 9.000 / 15.000 / 8.000 / 16.000 → −6.000 / −10.000 / −13.000 / −11.500 / −14.500 / −10.000
    expect(r.breakdown.map((b: any) => b.value.toString())).toEqual(["-6000", "-10000", "-13000", "-11500", "-14500", "-10000"]);
    expect(ex(r, "Einzahlungen, die erst nach Planende").value.toString()).toBe("12000");
    expect(ex(r, "Perioden mit negativem").value.toString()).toBe("6");
    const row0 = r.comparison.rows[0];
    expect(row0[0]).toBe("Endbestand Monat 6");
    expect(row0[1]).toContain("2.000,00"); // ohne Verzug
    expect(row0[2]).toContain("10.000,00"); // mit Verzug (negativ)
    expect(row0[3]).toContain("12.000,00"); // Unterschied −12.000 €
    expect(r.comparison.rows[2].slice(1)).toEqual(["2", "6", "4"]);
    expect(r.comparison.rows[2][0]).toBe("Monate unter 0 €");
  });

  it("Verzug größer als der Plan: nichts geht ein, alles bleibt offen", () => {
    const r = go({ verzug: "12" });
    expect(r.breakdown.map((b: any) => b.value.toString())).toEqual(["-6000", "-22000", "-34000", "-47500", "-58500", "-70000"]);
    expect(ex(r, "Einzahlungen, die erst nach Planende").value.toString()).toBe("72000");
  });

  it("Ausreichende Mittel: kein negativer Bestand, positiver Ton", () => {
    const r = go({ start: "50000" });
    expect(ex(r, "Perioden mit negativem").value.toString()).toBe("0");
    expect(ex(r, "Erste Monat mit negativem")).toBeUndefined();
    expect(r.tone).toBe("positive");
  });

  it("Negativer Anfangsbestand (Überziehung) ist erlaubt", () => {
    const r = go({ start: "-2000" });
    expect(r.breakdown[0].value.toString()).toBe("-1000"); // −2.000 + 12.000 − 11.000
  });

  it("Wochenplan: Beschriftung in Wochen", () => {
    const r = go({ periode: "woche" });
    expect(ex(r, "Niedrigster Endbestand").unit).toBe("in Woche 4");
    expect(r.main.label).toBe("Endbestand nach Woche 6");
  });

  it("liquidityPlan ist reine Fortschreibung (Randfälle)", () => {
    const p = liquidityPlan(D(0), [[D(100), D(100)], [D(0), D(0)]], 0);
    expect(p.plan.map((x) => x.end.toString())).toEqual(["0", "0"]);
    expect(p.offen.toString()).toBe("0");
  });

  it("verlangt mindestens zwei Perioden und Beträge ≥ 0", () => {
    const v = getVariant("cashflow", "plan");
    const one = run(v, { start: "0", periode: "monat", verzug: "", perioden: [["1", "1"]] } as any);
    expect(one.result).toBeNull();
    const neg = run(v, { start: "0", periode: "monat", verzug: "", perioden: [["-1", "1"], ["1", "1"]] } as any);
    expect(neg.result).toBeNull();
  });

  it("Grafik: Linie je Periode samt Nulllinie, mit Verzug zweite Linie", async () => {
    const b = await loadChartBuilders("finanzen");
    const v = getVariant("cashflow", "plan");
    for (const [verzug, lines] of [["", 1], ["2", 2]] as const) {
      const raw = { start: "5000", periode: "monat", verzug, perioden: rows } as any;
      const e = run(v, raw);
      const o = buildCharts(b, "cashflow", "plan", e.validation.inputs, e.result!);
      expect(o.charts).toHaveLength(1);
      const c: any = o.charts[0];
      expect(c.kind).toBe("lines");
      expect(c.series).toHaveLength(lines);
      expect(c.series[0].points).toHaveLength(7); // Start + 6 Perioden
      expect(c.hlines[0].y).toBe(0);
      expect(c.explore.stops).toHaveLength(6);
      expect(c.table.rows).toHaveLength(6);
    }
  });
});
