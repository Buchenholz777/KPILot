import { describe, expect, it } from "vitest";
import { VIDEOS } from "../src/data/videos.ts";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { planVoice, speechText, speechParts } from "../video/voice.ts";
import { CONFIG, DICTIONARY } from "../video/speech.ts";

describe("Erklärstimme: Sprechtext", () => {
  const ipas = (t: string) => speechParts(t).flatMap((p) => ("ipa" in p ? [p.id] : []));

  it("erkennt englische Fachbegriffe im Aussprachewörterbuch", () => {
    expect(ipas("Die Break-even-Menge")).toEqual(["break-even"]);
    expect(ipas("Netto-Cashflow")).toEqual(["cashflow"]);
    expect(ipas("im Conversion-Rate-Rechner")).toEqual(["conversion-rate"]);
    expect(ipas("10 % ROI")).toEqual(["roi"]);
    expect(ipas("CLV minus CAC")).toEqual(["clv", "cac"]);
    expect(ipas("EBITDA und EBIT")).toEqual(["ebitda", "ebit"]);
    expect(ipas("Return on Investment, Key Performance Indicator, Operating Cashflow")).toEqual(["return-on-investment", "key-performance-indicator", "operating-cashflow"]);
    expect(ipas("im Rechner von KPILot")).toEqual(["kpilot"]);
  });

  it("lässt Satzzeichen hinter Fachbegriffen als Pause/Satzzeichen erhalten", () => {
    const p = speechParts("Break-even: Ab welcher Menge?");
    expect(p[0]).toMatchObject({ id: "break-even", punct: ":" });
    expect(p[1]).toMatchObject({ pause: expect.any(Number) });
  });

  it("setzt Pausen nach Sätzen und längere Pausen nach Rechenergebnissen", () => {
    const p = speechParts("3.000 € geteilt durch 20 € ergibt 150 Stück. Das ist die Menge.");
    const pause = p.find((x) => "pause" in x) as { pause: number };
    expect(pause.pause).toBe(CONFIG.pauses.afterResult);
    const q = speechParts("Kalle verkauft sein Produkt heute. Das ist wirklich gut.").find((x) => "pause" in x) as { pause: number };
    expect(q.pause).toBe(CONFIG.pauses.sentence);
  });

  it("endet nie mit einer Pause", () => {
    for (const v of VIDEOS) for (const c of v.cues) expect("pause" in speechParts(c.text).slice(-1)[0], c.text).toBe(false);
  });

  it("liest Ordinalzahlen als Ordinalzahlen", () => {
    expect(speechText("Mit dem 150. Stück sind … Erst das 151. Stück bringt")).toBe("Mit dem hundertfünfzigsten Stück sind … Erst das hunderteinundfünfzigste Stück bringt");
  });

  it("liest „1. Grades“ als „ersten Grades“", () => {
    expect(speechText("Bei Liquidität 1. Grades von 50 %")).toBe("Bei Liquidität ersten Grades von 50 %");
    expect(speechText("Grad 2 zählt Forderungen")).toBe("Grad 2 zählt Forderungen");
  });

  it("lässt in keinem Cue Ordinalpunkt oder Gedankenstrich übrig", () => {
    for (const v of VIDEOS)
      for (const c of v.cues) {
        const s = speechText(c.text);
        expect(s, `${v.id}: ${c.text}`).not.toMatch(/\d+\. [a-zäöüß]|\d+\. Stück|\d\. Grades|–/);
      }
  });

  it.skipIf(!existsSync(resolve("video/voices/de_DE-thorsten-medium.onnx.json")))("jeder Wörterbuch-Eintrag besteht nur aus Phonemen der Stimme", () => {
    const map = JSON.parse(readFileSync(resolve("video/voices/de_DE-thorsten-medium.onnx.json"), "utf8")).phoneme_id_map as Record<string, number[]>;
    const keys = Object.keys(map).sort((a, b) => b.length - a.length);
    for (const e of DICTIONARY) {
      let rest = e.ipa.replace(/ /g, "");
      while (rest) {
        const k = keys.find((x) => rest.startsWith(x));
        expect(k, `${e.id}: Zeichen „${rest[0]}“ fehlt im Phonemvorrat`).toBeTruthy();
        rest = rest.slice(k!.length);
      }
    }
  });

  it("deckt alle englischen Fachbegriffe der Videos ab", () => {
    for (const v of VIDEOS)
      for (const c of v.cues) {
        const rest = speechParts(c.text).flatMap((p) => ("text" in p ? [p.text] : [])).join(" ");
        expect(rest, `${v.id}: ${c.text}`).not.toMatch(/Break-even|Cashflow|Conversion|\bROI\b|\bCAC\b|\bCLV\b|\bROAS\b|EBIT|KPI/);
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
