import { describe, expect, it } from "vitest";
import { VIDEOS } from "../src/data/videos.ts";
import { planVoice, speechText } from "../video/voice.ts";

describe("Erklärstimme: Sprechtext", () => {
  it("spricht englische Fachbegriffe deutsch lesbar aus", () => {
    expect(speechText("Die Break-even-Menge")).toBe("Die Bräjk-iewen-Menge");
    expect(speechText("Netto-Cashflow")).toBe("Netto-Käschfloh");
    expect(speechText("im Conversion-Rate-Rechner")).toBe("im Konwörschen-Räjt-Rechner");
    expect(speechText("10 % ROI")).toBe("10 % Er-O-I");
  });

  it("liest Ordinalzahlen als Ordinalzahlen", () => {
    expect(speechText("Mit dem 150. Stück sind … Erst das 151. Stück bringt")).toBe("Mit dem hundertfünfzigsten Stück sind … Erst das hunderteinundfünfzigste Stück bringt");
  });

  it("lässt in keinem Cue Ordinalpunkt oder englische Schreibweise übrig", () => {
    for (const v of VIDEOS)
      for (const c of v.cues) {
        const s = speechText(c.text);
        expect(s, `${v.id}: ${c.text}`).not.toMatch(/\d+\. [a-zäöüß]|\d+\. Stück|Break-even|Cashflow|Conversion|\bROI\b|–/);
      }
  });
});

describe("Erklärstimme: Zeitplan", () => {
  const v = { id: "t", duration: 20, cues: [{ start: 0.3, end: 3, text: "" }, { start: 3.2, end: 8, text: "" }, { start: 8.2, end: 19, text: "" }] };

  it("setzt jeden Satz kurz nach seinem Cue, ohne Beschleunigung, wenn Platz ist", () => {
    const p = planVoice(v, [2, 3, 5]);
    expect(p.map((x) => x.start)).toEqual([0.4, 3.3, 8.3]);
    expect(p.every((x) => x.tempo === 1)).toBe(true);
  });

  it("lässt einen langen Satz in die Pause des nächsten laufen und holt dort auf", () => {
    const p = planVoice(v, [3.5, 3, 5]);
    expect(p[1].start).toBeGreaterThan(3.3);
    expect(p[1].start - v.cues[1].start).toBeLessThanOrEqual(2);
    expect(p[2].start).toBeCloseTo(8.3, 5);
  });

  it("beschleunigt höchstens um 12 % und verlangt sonst kürzeren Text", () => {
    expect(() => planVoice(v, [9, 3, 5])).toThrow(/Text kürzen/);
    for (const x of planVoice(v, [4.4, 3, 5])) expect(x.tempo).toBeLessThanOrEqual(1.12);
  });

  it("endet vor dem Videoende", () => {
    const p = planVoice(v, [2, 3, 11]);
    const last = p[p.length - 1];
    expect(last.start + last.seconds).toBeLessThanOrEqual(v.duration);
  });
});
