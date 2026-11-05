import { describe, expect, it } from "vitest";
import { CALCS } from "../src/calc/all";
import { run } from "../src/calc/engine";
import { TOPICS } from "../src/data/registry";
import { buildCharts, loadChartBuilders } from "../src/calc/charts";
import type { ChartOutcome, ChartSpec, LinesChart, BarsChart, BridgeChart } from "../src/calc/chart-types";
import type { RawInputs } from "../src/calc/types";

async function charts(id: string, variant: string | undefined, raw: RawInputs): Promise<ChartOutcome> {
  const cat = TOPICS.find((t) => t.id === id)!.category;
  const builders = await loadChartBuilders(cat);
  const v = CALCS[id].variants.find((x) => x.id === (variant ?? CALCS[id].variants[0].id))!;
  const { validation, result } = run(v, raw);
  if (!result) return { charts: [], note: "kein Ergebnis" };
  return buildCharts(builders, id, v.id, validation.inputs, result);
}

/** Prüft rekursiv, dass keine NaN/Infinity-Zahlen und keine „NaN“/„undefined“-Texte vorkommen. */
function clean(x: unknown, path = "spec"): void {
  if (typeof x === "number") expect(Number.isFinite(x), `${path} ist keine endliche Zahl`).toBe(true);
  else if (typeof x === "string") expect(x, path).not.toMatch(/NaN|Infinity|undefined|\[object/);
  else if (Array.isArray(x)) x.forEach((v, i) => clean(v, `${path}[${i}]`));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (typeof v !== "function") clean(v, `${path}.${k}`);
}

describe("Umsetzungsmatrix: jeder Rechner und jeder Modus liefert mit Beispielwerten eine Grafik", () => {
  for (const t of TOPICS)
    for (const v of CALCS[t.id].variants)
      it(`${t.id}/${v.id}`, async () => {
        const o = await charts(t.id, v.id, v.example);
        expect(o.charts.length, `${t.id}/${v.id}: keine Grafik`).toBeGreaterThan(0);
        for (const c of o.charts) {
          expect(c.title.length).toBeGreaterThan(5);
          expect(c.caption.length, "kurzer erklärender Satz").toBeGreaterThan(20);
          expect(c.summary.length).toBeGreaterThan(10);
          expect(c.table.rows.length, "Tabellenalternative").toBeGreaterThan(0);
          clean(c, `${t.id}/${v.id}`);
        }
      });
});

describe("Break-even als Referenzdiagramm", () => {
  const be = (p: string, v: string, F: string) => charts("break-even", undefined, { p, v, F, zeitraum: "monat" });
  const lines = (o: ChartOutcome) => o.charts[0] as LinesChart;
  it("Prüffall 1: p 80, v 50, F 6.000 → Schnittpunkt 200 Stück und 16.000 €; Gewinn bei 201 Stück 30 €", async () => {
    const c = lines(await be("80", "50", "6000"));
    const m = c.markers!.find((x) => x.kind === "intersection")!;
    expect(m.x).toBe(200);
    expect(m.y).toBe(16000);
    expect(m.label).toContain("200 Stück");
    expect(c.markers!.some((x) => x.label === "Fixkosten: 6.000,00 €")).toBe(true);
    expect(m.label).toContain("16.000,00 €");
    expect(c.explore!.stops.some((s) => s.x === 200)).toBe(true);
    expect(c.table.rows.some((r) => r[0] === "200 Stück" && r[1] === "16.000,00 €" && r[2] === "16.000,00 €")).toBe(true);
    // Ergebnis bei 201 Stück = 30 € (Rechenfunktion)
    const g = await charts("gewinn", "menge", { p: "80", v: "50", F: "6000", q: "201", zeitraum: "monat" });
    expect(((g.charts[0] as BridgeChart).steps.at(-1)!).text).toBe("+30,00 €");
  });
  it("Prüffall 2: nur Preis auf 100 → Schnittpunkt 120 Stück und 12.000 € ohne Berechnen-Klick", async () => {
    const m = lines(await be("100", "50", "6000")).markers!.find((x) => x.kind === "intersection")!;
    expect([m.x, m.y]).toEqual([120, 12000]);
  });
  it("Prüffall 3: F 3.001 → Schnittpunkt 150,05, Mindestmenge 151, Gewinn dort 19 €", async () => {
    const c = lines(await be("50", "30", "3001"));
    const m = c.markers!.find((x) => x.kind === "intersection")!;
    expect(m.x).toBeCloseTo(150.05, 10);
    expect(m.label).toContain("150,05 Stück");
    expect(c.caption).toContain("151 Stück");
    expect(c.caption).toContain("+19,00 €");
  });
  it("Prüffall 3b: exakt ganzzahliger Schnittpunkt – Kostendeckung bei 150, positiver Gewinn ab 151 (getrennt erklärt)", async () => {
    expect(lines(await be("50", "30", "3000")).caption).toMatch(/Kosten genau gedeckt, positiver Gewinn entsteht ab 151 Stück/);
  });
  it("Prüffall 4: p = v, F > 0 → kein Break-even erfunden, Linien mit Hinweis", async () => {
    const c = lines(await be("50", "50", "3000"));
    expect(c.markers!.filter((m) => m.kind === "intersection")).toEqual([]);
    expect(c.notice).toMatch(/Kein erreichbarer Break-even/);
    expect(c.caption).toMatch(/nicht bei positiver Menge/);
    expect(c.series).toHaveLength(2);
  });
  it("Prüffall 5: F = 0 (Ursprung), Preis unter variablen Kosten, F = 0 und p = v, sehr kleine/große Werte", async () => {
    const f0 = lines(await be("50", "30", "0"));
    expect(f0.markers![0]).toMatchObject({ x: 0, y: 0 });
    expect(f0.caption).toMatch(/Ursprung/);
    const under = lines(await be("20", "30", "100"));
    expect(under.markers!.filter((m) => m.kind === "intersection")).toEqual([]);
    const same = lines(await be("30", "30", "0"));
    expect(same.caption).toMatch(/aufeinander/);
    for (const [p, v, F] of [["0,01", "0,001", "0,5"], ["1000000000", "1", "1000000000000"], ["3", "0", "300,0000000003"]]) {
      const c = lines(await be(p, v, F));
      clean(c);
      expect(c.series[0].points).toHaveLength(2); // nie übermäßig große Datenreihen
      expect(c.explore ? c.explore.stops.length : 0).toBeLessThanOrEqual(14);
    }
  });
  it("Zeitraum steht in der Beschriftung", async () => {
    expect((await be("50", "30", "3000")).charts[0].title).toContain("Zeitraum: Monat");
  });
});

describe("Weitere Prüffälle aus dem Auftrag", () => {
  it("Marge: Kosten 70, Preis 120 → Differenz 50 €, Marge 41,67 %, Aufschlag 71,43 % mit Bezugsgrößen", async () => {
    const c = (await charts("marge", undefined, { k: "70", p: "120" })).charts[0] as BarsChart;
    const all = c.panels.flatMap((p) => p.bars);
    expect(all.find((b) => b.label === "Differenz")!.text).toBe("+50,00 €");
    const m = all.find((b) => b.label === "Marge")!;
    const a = all.find((b) => b.label === "Aufschlag")!;
    expect(m.text).toBe("+41,67 %");
    expect(m.sub).toBe("Differenz / Verkaufspreis");
    expect(a.text).toBe("+71,43 %");
    expect(a.sub).toBe("Differenz / Kostenbasis");
  });
  it("Marge: Kosten 0 und Preis > 0 → 100 % Marge, kein Aufschlag-Balken, Erklärung", async () => {
    const c = (await charts("marge", undefined, { k: "0", p: "100" })).charts[0] as BarsChart;
    const labels = c.panels.flatMap((p) => p.bars.map((b) => b.label));
    expect(labels).toContain("Marge");
    expect(labels).not.toContain("Aufschlag");
    expect(c.notice).toMatch(/100 %.*nicht definiert/);
  });
  it("ROAS: 3.600 € Umsatz, 900 € Kosten → ROAS 4,0-fach, Grafik zeigt genau diese zwei Geldbeträge", async () => {
    const c = (await charts("roas", "standard", { umsatz: "3600", kosten: "900" })).charts[0] as BarsChart;
    expect(c.panels).toHaveLength(1);
    expect(c.panels[0].bars.map((b) => b.text)).toEqual(["900,00 €", "3.600,00 €"]);
    expect(c.caption).toContain("4,0-fach");
  });
  it("ROAS Wirtschaftlichkeit: 30 % → 1.080 € vor Werbung, 180 € danach, kein „Unternehmensgewinn“", async () => {
    const c = (await charts("roas", "wirtschaftlichkeit", { umsatz: "3600", kosten: "900", quote: "30", alt: "" })).charts[0] as BridgeChart;
    expect(c.steps.map((s) => s.text)).toEqual(["3.600,00 €", "−2.520,00 €", "+1.080,00 €", "−900,00 €", "+180,00 €"]);
    expect(c.caption).toMatch(/kein Unternehmensgewinn/);
  });
  it("Negativer Deckungsbeitrag wird als Balken unter der Nulllinie dargestellt", async () => {
    const c = (await charts("deckungsbeitrag", undefined, { p: "20", v: "30", q: "" })).charts[0] as BridgeChart;
    expect(c.steps.at(-1)!.value).toBe(-10);
    expect(c.notice).toMatch(/Negativer Deckungsbeitrag/);
  });
});

describe("Fachliche Grenzfälle der übrigen Grafiken", () => {
  it("Rabatt-Mehrabsatz mit Beitrag ≤ 0: keine Ausgleichsmenge gezeichnet", async () => {
    const c = (await charts("rabatt-absatz", "prozent", { preis: "100", v: "80", rabatt: "20", q0: "100", zeitraum: "monat" })).charts[0] as BarsChart;
    expect(c.panels).toHaveLength(1);
    expect(c.notice).toMatch(/Keine erreichbare Ausgleichsmenge/);
  });
  it("Eigenkapitalquote: negatives Eigenkapital → keine Anteilsdarstellung", async () => {
    const c = (await charts("eigenkapital", undefined, { ek: "-5000", gk: "100000" })).charts[0];
    expect(c.kind).toBe("bars");
  });
  it("Churn und NPS: Teile bilden ein Ganzes; NPS-Skala fest von −100 bis +100", async () => {
    const ch = (await charts("churn", undefined, { anfang: "100", verloren: "10", neu: "20" })).charts[0];
    expect(ch.kind).toBe("composition");
    const n = await charts("nps", undefined, { pro: "60", pas: "10", det: "30" });
    const sc = n.charts.find((c) => c.kind === "scale")!;
    expect(sc).toMatchObject({ min: -100, max: 100, value: 30 });
  });
  it("Auslastung über 100 % bleibt sichtbar; Liquidität: Deckungsgrade getrennt mit 100-%-Linie", async () => {
    const a = (await charts("auslastung", undefined, { genutzt: "120", verfuegbar: "100" })).charts[0];
    expect(a.kind === "meter" && a.max).toBeGreaterThan(120);
    const l = (await charts("liquiditaet", undefined, { lm: "10000", ford: "15000", vorr: "20000", sonst: "5000", vb: "20000" })).charts[0];
    expect(l.kind === "meter" && l.rows.map((r) => r.text)).toEqual(["50 %", "125 %", "250 %"]);
  });
  it("Amortisation ohne ausreichende Rückflüsse: kein Schnittpunkt erfunden", async () => {
    const c = (await charts("amortisation", undefined, { inv: "10000", cf: "0", periode: "jahr" })).charts;
    if (c.length) expect((c[0] as LinesChart).markers).toEqual([]);
  });
  it("MRR: ARR und MRR nicht addiert (getrennte Panels)", async () => {
    const c = (await charts("mrr", undefined, { tarife: [["10", "20", "1"], ["12", "120", "12"]] })).charts[0] as BarsChart;
    expect(c.panels).toHaveLength(2);
    expect(c.panels[1].bars).toHaveLength(1);
  });
  it("Ungültige oder fehlende Eingaben: keine Grafik, Begründung oder gar kein Ergebnis", async () => {
    const o = await charts("break-even", undefined, { p: "", v: "30", F: "100", zeitraum: "monat" });
    expect(o.charts).toEqual([]);
  });
  it("jede Kategorie hat eine Aufbereitung und jeder Rechner einen Eintrag", async () => {
    for (const t of TOPICS) {
      const b = await loadChartBuilders(t.category);
      expect(b[t.id], t.id).toBeTypeOf("function");
    }
  });
});
