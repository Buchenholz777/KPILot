import { describe, expect, it } from "vitest";
import { VIDEOS } from "../src/data/videos";

/** Zahlen aus den Videos, die der Rechner nicht liefert, unabhängig nachgerechnet und mit dem Erzähltext abgeglichen. */
const cue = (id: string) => VIDEOS.find((v) => v.id === id)!.cues.map((c) => c.text).join(" ");
const de = (n: number) => Math.round(n).toLocaleString("de-DE");

describe("Video Amortisation & Kapitalwert", () => {
  const inv = 10000, cf = 2500, years = 4, r = 0.1; // Zahlungen jeweils am Jahresende, Zins 10 % als Beispielannahme
  const pv = Array.from({ length: years }, (_, k) => cf / Math.pow(1 + r, k + 1));
  const sum = pv.reduce((a, b) => a + b, 0);

  it("Barwerte, Summe und Kapitalwert", () => {
    expect(pv.map((x) => x.toFixed(2))).toEqual(["2272.73", "2066.12", "1878.29", "1707.53"]);
    expect(sum.toFixed(2)).toBe("7924.66");
    expect((sum - inv).toFixed(2)).toBe("-2075.34");
  });
  it("Erzähltext nennt genau diese gerundeten Werte", () => {
    const t = cue("amortisation-kapitalwert");
    expect(t).toContain(`${de(sum)} €`); // die vier Einzelwerte stehen im Bild (Szene), nicht im Sprechtext
    expect(t).toContain(`minus ${de(inv - sum)} €`);
    // gerundete Einzelwerte (im Bild: 2.273 / 2.066 / 1.878 / 1.708) ergeben die gezeigte Summe
    expect(pv.map((x) => de(x))).toEqual(["2.273", "2.066", "1.878", "1.708"]);
    expect(pv.map(Math.round).reduce((a, b) => a + b, 0)).toBe(Math.round(sum));
  });
  it("Amortisation: 4 Jahre, Kapitalwert trotzdem negativ", () => {
    expect(inv / cf).toBe(4);
    expect(sum - inv).toBeLessThan(0);
  });
});

describe("Video CLV & CAC", () => {
  it("CLV/CAC = 240 / 100 = 2,4; Beitrag nach Akquisition 140", () => {
    const clv = 50 * 4 * 3 * 0.4, cac = (2000 + 1000) / 30;
    expect(clv).toBe(240);
    expect(cac).toBe(100);
    expect(clv / cac).toBeCloseTo(2.4, 10);
    expect(clv - cac).toBe(140);
    expect(cue("clv-cac")).toContain("Verhältnis: 2,4");
  });
});

describe("Video ROAS", () => {
  it("Mindest-ROAS 1/0,3 ≈ 3,33; bei ROAS 3 bleiben 450 € und es fehlen 50 €", () => {
    expect(1 / 0.3).toBeCloseTo(3.3333, 4);
    expect(500 * 3 * 0.3).toBeCloseTo(450, 10);
    expect(450 - 500).toBe(-50);
    const t = cue("roas");
    expect(t).toContain("3,33");
    expect(t).toContain("450 €");
  });
});

describe("Video Rabatt & Mehrabsatz", () => {
  it("v = 80: Faktor 2; v = 60: Faktor 4/3 → 33,3 %", () => {
    expect((100 - 80) / (90 - 80)).toBe(2);
    expect(((100 - 60) / (90 - 60) - 1) * 100).toBeCloseTo(33.3333, 4);
  });
  it("Mehrabsatz ist immer größer als der Rabatt in Prozent", () => {
    for (const v of [0, 20, 60, 80, 85, 89]) {
      const more = ((100 - v) / (90 - v) - 1) * 100;
      expect(more).toBeGreaterThan(10);
    }
  });
});

describe("Video Liquiditätsgrade", () => {
  it("Grade 1 bis 3 aus den Beispielwerten", () => {
    expect(10000 / 20000).toBe(0.5);
    expect((10000 + 15000) / 20000).toBe(1.25);
    expect((10000 + 15000 + 20000 + 5000) / 20000).toBe(2.5);
  });
});

describe("Video EBIT & EBITDA", () => {
  it("EBITDA = EBIT + Abschreibungen", () => expect(20000 + 10000).toBe(30000));
});

describe("Weitere im Video gezeigte Zwischenwerte", () => {
  it("ROAS: variable Kosten 1.400 €, Quoten 50/30/20 % → Mindest-ROAS 2 / 3,33 / 5", () => {
    expect(2000 * (1 - 0.3)).toBeCloseTo(1400, 10);
    expect([0.5, 0.3, 0.2].map((q) => Number((1 / q).toFixed(2)))).toEqual([2, 3.33, 5]);
  });
  it("CLV: 12 Käufe à 50 € = 600 €, 60 % davon variable Kosten, halbierte Kaufhäufigkeit halbiert den CLV", () => {
    expect(4 * 3).toBe(12);
    expect(12 * 50).toBe(600);
    expect(600 * 0.6).toBeCloseTo(360, 10);
    expect(50 * 2 * 3 * 0.4).toBe(120);
  });
});
