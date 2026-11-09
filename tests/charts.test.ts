import { describe, expect, it } from "vitest";
import { okCalc, calc } from "./helpers";
import { barsChart, breakEvenChart } from "../src/scripts/charts";
import { TOPICS } from "../src/data/registry";
import { CALCS } from "../src/calc/all";
import { runExample } from "../src/calc/engine";
import type { BarsChart } from "../src/calc/types";

const bars = (r: { chart?: unknown }) => {
  const c = r.chart as BarsChart | undefined;
  expect(c?.kind).toBe("bars");
  return c!;
};

describe("Diagramme stimmen mit den Ergebniswerten überein", () => {
  it("Deckungsbeitrag: Preis = variable Kosten + Deckungsbeitrag", () => {
    const r = okCalc("deckungsbeitrag", "standard", {
      p: "50",
      v: "30",
      q: "100",
    });
    const b = bars(r).panels[0].bars;
    expect(b.map((x) => x.value)).toEqual([50, 30, 20]);
    expect(r.main.value.toString()).toBe("20");
    expect(b[2].emphasis).toBe(true);
  });
  it("Deckungsbeitrag: bei negativem Beitrag kein Diagramm (Ergebnis unverändert)", () => {
    const r = okCalc("deckungsbeitrag", "standard", {
      p: "10",
      v: "12",
      q: "",
    });
    expect(r.chart).toBeUndefined();
    expect(r.main.value.toString()).toBe("-2");
  });
  it("Marge: Kosten 80, Preis 100 → Marge 20 %, Aufschlag 25 %", () => {
    const r = okCalc("marge", "standard", { k: "80", p: "100" });
    const c = bars(r);
    expect(c.panels[0].bars.map((x) => x.value)).toEqual([80, 20]);
    expect(c.panels[1].bars.map((x) => x.value)).toEqual([20, 25]);
    expect(r.main.value.toString()).toBe("20");
  });
  it("Marge: Verkauf unter Kosten wird als negativ markiert", () => {
    const c = bars(okCalc("marge", "standard", { k: "100", p: "80" }));
    expect(c.panels[0].bars[1].negative).toBe(true);
    expect(c.panels[1].bars[0].negative).toBe(true);
  });
  it("Rabatt: Ausgangs- und Endpreis", () => {
    const r = okCalc("rabatt", "rabatt", { preis: "100", rabatt: "20" });
    expect(bars(r).panels[0].bars.map((x) => x.value)).toEqual([100, 80]);
    const e = okCalc("rabatt", "erhoehung", { preis: "100", erhoehung: "10" });
    expect(bars(e).panels[0].bars.map((x) => x.value)).toEqual([100, 110]);
  });
  it("Cashflow operativ und erweitert", () => {
    const r = okCalc("cashflow", "operativ", { ein: "30000", aus: "22000" });
    expect(bars(r).panels[0].bars.map((x) => x.value)).toEqual([
      30000, 22000, 8000,
    ]);
    const neg = okCalc("cashflow", "operativ", { ein: "1000", aus: "4000" });
    expect(bars(neg).panels[0].bars[2].negative).toBe(true);
    const x = okCalc("cashflow", "erweitert", {
      ein: "30000",
      aus: "22000",
      invEin: "0",
      invAus: "5000",
      finEin: "2000",
      finAus: "0",
    });
    expect(bars(x).panels[0].bars.map((b) => b.value)).toEqual([
      8000, 5000, 2000, 5000,
    ]);
    expect(bars(x).panels[0].bars[1].negative).toBe(true);
  });
  it("Eigenkapitalquote: Eigenkapital + Fremdkapital = Gesamtkapital", () => {
    const r = okCalc("eigenkapital", "standard", { ek: "30000", gk: "100000" });
    const b = bars(r).panels[0].bars.map((x) => x.value);
    expect(b).toEqual([30000, 70000, 100000]);
    expect(b[0] + b[1]).toBe(b[2]);
  });
  it("Soll-Ist und ROI", () => {
    expect(
      bars(
        okCalc("soll-ist", "standard", {
          soll: "100",
          ist: "110",
          richtung: "hoeher",
        }),
      ).panels[0].bars.map((x) => x.value),
    ).toEqual([100, 110]);
    expect(
      bars(
        okCalc("roi", "standard", { gewinn: "5000", kapital: "50000" }),
      ).panels[0].bars.map((x) => x.value),
    ).toEqual([50000, 5000]);
    expect(
      bars(okCalc("roi", "standard", { gewinn: "-500", kapital: "50000" }))
        .panels[0].bars[1].negative,
    ).toBe(true);
  });
  it("Amortisation: Linien treffen sich bei der berechneten Dauer", () => {
    const r = okCalc("amortisation", "standard", {
      inv: "10000",
      cf: "2500",
      periode: "jahr",
    });
    const c = r.chart as {
      kind: string;
      points: { q: number; revenue: number; cost: number }[];
      breakEven: number;
    };
    expect(c.kind).toBe("break-even");
    expect(c.breakEven).toBe(4);
    expect(r.main.value.toString()).toBe("4");
    const [a, b] = c.points;
    expect(a).toEqual({ q: 0, revenue: 0, cost: 10000 });
    // Rückflusslinie erreicht die Investition genau bei q = breakEven
    expect((b.revenue / b.q) * c.breakEven).toBeCloseTo(10000, 6);
    expect(breakEvenChart(c as never)).toContain("Jahre");
  });
  it("Nicht amortisierende Investition: weiterhin ‚unmöglich‘, kein Diagramm", () => {
    const r = calc("amortisation", "standard", {
      inv: "10000",
      cf: "0",
      periode: "jahr",
    });
    expect(r?.status).toBe("impossible");
  });
});

describe("SVG-Ausgabe", () => {
  const withChart = TOPICS.flatMap((t) =>
    CALCS[t.id].variants.map((v) => ({ id: t.id, v })),
  ).filter(({ v }) => {
    const r = runExample(v);
    return r.status === "ok" && !!r.chart;
  });

  it("mindestens zehn Rechner liefern im Beispiel ein Diagramm", () => {
    expect(new Set(withChart.map((x) => x.id)).size).toBeGreaterThanOrEqual(10);
  });

  it("jedes Beispiel-Diagramm ist gültiges SVG ohne NaN/Infinity und hat eine Tabellenalternative und Textbeschreibung", () => {
    for (const { id, v } of withChart) {
      const r = runExample(v);
      if (r.status !== "ok" || !r.chart) continue;
      const svg =
        r.chart.kind === "bars" ? barsChart(r.chart) : breakEvenChart(r.chart);
      expect(svg, `${id}/${v.id}`).not.toMatch(/NaN|Infinity|undefined/);
      expect(svg, `${id}/${v.id}`).toContain("<svg");
      expect(svg, `${id}/${v.id}`).toContain("<table>");
      expect(svg, `${id}/${v.id}`).toMatch(/aria-label="[^"]{15,}"/);
    }
  });
});
