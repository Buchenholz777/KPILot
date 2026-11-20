import { describe, expect, it } from "vitest";
import { getCalc } from "../src/calc/all";
import { run } from "../src/calc/engine";
import { D } from "../src/lib/decimal";
import { VIDEOS, toVtt, isoDuration, displayDuration, type VideoCheck } from "../src/data/videos";
import { TOPIC_BY_ID } from "../src/data/registry";

/** Rechnet einen Video-Check mit dem echten Rechner nach. „Label~n“ = auf n Nachkommastellen gerundet vergleichen. */
function verify(calcId: string, c: VideoCheck) {
  const variant = getCalc(calcId).variants.find((v) => v.id === c.variant);
  expect(variant, `${calcId}/${c.variant}`).toBeDefined();
  const r = run(variant!, c.values).result;
  expect(r?.status).toBe("ok");
  if (!r || r.status !== "ok") return;
  const outs = [r.main, ...(r.extra ?? [])];
  for (const [key, want] of Object.entries(c.expect)) {
    const [label, digits] = key.split("~");
    const o = outs.find((x) => x.label === label);
    expect(o, `${calcId}: Ergebnis „${label}“ fehlt`).toBeDefined();
    const got = digits ? o!.value.toDecimalPlaces(Number(digits)) : o!.value;
    expect(got.equals(D(want)), `${calcId}: ${label} = ${o!.value.toString()}, Video zeigt ${want}`).toBe(true);
  }
}

describe("Erklärvideos: Konfiguration", () => {
  it("genau sechs Videos mit eindeutigen IDs", () => {
    expect(VIDEOS.map((v) => v.id)).toEqual(["break-even", "cashflow", "deckungsbeitrag", "marge", "roi", "conversion"]);
  });
  for (const v of VIDEOS) {
    describe(v.id, () => {
      it("gehört zu einem vorhandenen Rechner", () => expect(TOPIC_BY_ID[v.calcId]).toBeDefined());
      it("Dauer 45–70 Sekunden, Vorschaubild innerhalb", () => {
        expect(v.duration).toBeGreaterThanOrEqual(45);
        expect(v.duration).toBeLessThanOrEqual(70);
        expect(v.posterTime).toBeGreaterThan(0);
        expect(v.posterTime).toBeLessThan(v.duration);
      });
      it("Erzähltexte sind zeitlich geordnet, überlappen nicht und liegen im Video", () => {
        let last = 0;
        for (const c of v.cues) {
          expect(c.start).toBeGreaterThanOrEqual(last);
          expect(c.end).toBeGreaterThan(c.start);
          expect(c.end).toBeLessThanOrEqual(v.duration);
          // Lesbarkeit: höchstens 17 Zeichen pro Sekunde
          expect(c.text.length / (c.end - c.start)).toBeLessThanOrEqual(17);
          last = c.end;
        }
      });
      it("Dramaturgie: Abschluss mit Aufforderung zum Selbstrechnen", () => {
        expect(v.cues.at(-1)!.text).toMatch(/Rechne jetzt/);
        expect(v.cues.some((c) => /Typischer Irrtum/.test(c.text))).toBe(true);
      });
      it("Beispielwerte = Beispiel des Rechners", () => {
        const variant = getCalc(v.calcId).variants.find((x) => x.id === v.example.variant)!;
        for (const [k, val] of Object.entries(v.example.values)) expect(variant.example[k], k).toBe(val);
      });
      it("alle gezeigten Zahlen stimmen mit dem Rechner überein", () => {
        verify(v.calcId, v.example);
        for (const c of v.checks ?? []) verify(v.calcId, c);
      });
      it("WebVTT ist gültig", () => {
        const vtt = toVtt(v);
        expect(vtt.startsWith("WEBVTT\n\n")).toBe(true);
        expect(vtt).toMatch(/00:00:00\.300 --> 00:00:03\.400/);
        expect(vtt.match(/-->/g)).toHaveLength(v.cues.length);
      });
    });
  }
  it("Dauer-Formate", () => {
    expect(isoDuration(66)).toBe("PT1M6S");
    expect(isoDuration(45)).toBe("PT45S");
    expect(displayDuration(66)).toBe("1:06 Min.");
  });
});
