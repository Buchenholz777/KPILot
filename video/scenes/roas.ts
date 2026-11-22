/**
 * ROAS und Gewinn – Beispiel = Rechnerbeispiel (Modus „Werbewirtschaftlichkeit“): Werbeumsatz 2.000 €, Werbekosten 500 €,
 * Deckungsbeitragsquote 30 % → ROAS 4, Deckungsbeitrag vor Werbung 600 €, Beitrag nach Werbung 100 €, Mindest-ROAS 1/0,3 ≈ 3,33.
 * Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, line, text, textIn, p, easeOut, easeBack, kalle, bubble, coin, card, arrow, waterfall, stack,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "roas")!;

/** Skala für ROAS 0…5: x(roas) in Pixeln. */
const X0 = 260, PX = 280;
const rx = (v: number) => X0 + v * PX;

function render(t: number) {
  let s = backdrop("ROAS & Gewinn", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Werbung kostet – und bringt Umsatz");
    r += kalle(420, 880, { mood: "happy", arm: "point", t: T });
    r += g(card(0, 0, 420, 220, text(40, 70, "Werbekosten", { size: 38, weight: 700, fill: C.muted }) + text(40, 160, "500 €", { size: 96, weight: 800, fill: C.rose })), { x: 720, y: 330, o: p(T, 4.2, 4.8) });
    r += arrow(1160, 440, 1340, 440, p(T, 5.0, 5.8), { color: C.muted, sw: 8 });
    r += g(card(0, 0, 460, 220, text(40, 70, "Werbeumsatz", { size: 38, weight: 700, fill: C.muted }) + text(40, 160, "2.000 €", { size: 96, weight: 800, fill: C.accent })), { x: 1380, y: 330, o: p(T, 5.8, 6.4) });
    for (let i = 0; i < 4; i++) {
      const k = p(T, 4.6 + i * 0.2, 5.4 + i * 0.2, easeOut);
      if (k > 0 && k < 1) r += coin(900 + k * 400, 600 - Math.sin(k * Math.PI) * 120, 28);
    }
    return r;
  });

  /* Szene 2 – ROAS-Definition, dann: Umsatz ist nicht Gewinn */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "ROAS = Werbeumsatz ÷ Werbekosten" : "Ein ROAS von 4 klingt gut – aber Umsatz ist kein Gewinn");
    if (T < 14.0) {
      r += g(card(0, 0, 1200, 360, textIn(T, 9.0, 60, 130, "2.000 € ÷ 500 €", { size: 110, weight: 800, fill: C.navy }) + textIn(T, 11.0, 60, 270, "= ROAS 4", { size: 130, weight: 800, fill: C.accent }) + textIn(T, 12.4, 640, 270, "je 1 € Werbung 4 € Umsatz", { size: 40, weight: 700, fill: C.teal })), { x: 360, y: 320, o: p(T, 8.8, 9.3) * (1 - p(T, 13.7, 14.0)) });
    } else {
      const sc = 0.22, base = 790;
      r += stack(330, base, 380, sc, [
        { v: 1400, color: C.rose, fill: C.roseSoft, label: "variable Kosten", o: p(T, 15.0, 15.8), dy: (1 - p(T, 15.0, 15.8, easeOut)) * -40 },
        { v: 600, color: C.teal, fill: C.tealSoft, label: "Deckungsbeitrag", o: p(T, 16.0, 16.8), dy: (1 - p(T, 16.0, 16.8, easeOut)) * -40 },
      ], { labelSize: 34 });
      r += g(text(520, base + 50, "2.000 € Werbeumsatz", { size: 36, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 14.6, 15.2) });
      r += g(text(740, base - 1400 * sc / 2 + 12, "1.400 €", { size: 44, weight: 800, fill: C.rose }), { o: p(T, 15.4, 16) });
      r += g(text(740, base - 1400 * sc - 600 * sc / 2 + 12, "600 €", { size: 44, weight: 800, fill: C.teal }), { o: p(T, 16.4, 17) });
      r += g(card(0, 0, 640, 200, text(40, 70, "Quote 30 %", { size: 44, weight: 800, fill: C.navy }) + text(40, 140, "von 2.000 € bleiben 600 €", { size: 40, weight: 700, fill: C.ink })), { x: 1020, y: 400, o: p(T, 17.4, 18.0) });
    }
    return r;
  });

  /* Szene 3 – Rechnung bis zum Beitrag nach Werbung, dann Mindest-ROAS */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 33.5 ? "Vom Umsatz zum Beitrag nach Werbung" : "Mindest-ROAS = 1 ÷ Quote");
    if (T < 33.4) {
      r += waterfall(T, 21.0, [
        { label: "Umsatz", value: 2000, total: true, color: C.accent, fill: C.accentSoft },
        { label: "variable Kosten", value: -1400, color: C.rose, fill: C.roseSoft },
        { label: "Deckungsbeitrag", value: 600, total: true, color: C.teal, fill: C.tealSoft },
        { label: "Werbekosten", value: -500, color: C.rose, fill: C.roseSoft },
        { label: "Beitrag danach", value: 100, total: true, color: C.amber, fill: C.goldSoft },
      ], { x: 260, y: 290, w: 1400, h: 440, max: 2000, step: 1.6 });
    } else {
      const k = 1 - p(T, 39.6, 40.2);
      const y = 560;
      r += g(rect(rx(0), y, rx(10 / 3) - rx(0), 60, { fill: C.roseSoft, stroke: C.rose, sw: 5, rx: 8 }) + rect(rx(10 / 3), y, rx(5) - rx(10 / 3), 60, { fill: C.tealSoft, stroke: C.teal, sw: 5, rx: 8 }), { o: p(T, 33.8, 34.4) * k });
      for (let i = 0; i <= 5; i++) r += g(line(rx(i), y + 60, rx(i), y + 80, { stroke: C.ink, sw: 4 }) + text(rx(i), y + 122, String(i), { size: 34, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 33.8, 34.4) * k });
      r += g(text(rx(5 / 3), y - 24, "Werbung deckt sich nicht", { size: 34, weight: 800, fill: C.rose, anchor: "middle" }) + text(rx(4.2), y - 24, "über der Schwelle", { size: 34, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 35.4, 36.0) * k });
      const km = p(T, 34.6, 35.4, easeBack);
      r += g(line(rx(10 / 3), y - 90, rx(10 / 3), y + 70, { stroke: C.navy, sw: 6 }) + text(rx(10 / 3), y - 120, "Mindest-ROAS 3,33", { size: 40, weight: 800, fill: C.navy, anchor: "middle" }), { o: km * k });
      r += g(card(0, 0, 640, 130, text(40, 56, "1 ÷ 0,3 ≈ 3,33", { size: 60, weight: 800, fill: C.navy }) + text(40, 104, "je 1 € Werbung mindestens 3,33 € Umsatz", { size: 30, weight: 600, fill: C.muted })), { x: 640, y: 300, o: p(T, 36.4, 37.0) * k });
      r += g(text(rx(4), y + 200, "Kalle: ROAS 4", { size: 38, weight: 800, fill: C.accent, anchor: "middle" }) + line(rx(4), y + 150, rx(4), y + 90, { stroke: C.accent, sw: 6 }), { o: p(T, 37.6, 38.2) * k });
    }
    return r;
  });

  /* Szene 4a – ROAS 3: Draufzahlen */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Bei ROAS 3 zahlt Kalle drauf");
    const items: [string, string, string, string, number][] = [
      ["Umsatz", "1.500 €", C.accent, C.accentSoft, 41.0],
      ["30 % Beitrag", "450 €", C.teal, C.tealSoft, 42.6],
      ["Werbekosten", "−500 €", C.rose, C.roseSoft, 44.2],
      ["Ergebnis", "−50 €", C.rose, C.roseSoft, 45.6],
    ];
    items.forEach(([l, v, col, fill, at], i) => {
      const k = p(T, at, at + 0.6, easeOut);
      r += g(card(0, 0, 340, 230, text(170, 76, l, { size: 36, weight: 700, fill: C.muted, anchor: "middle" }) + text(170, 170, v, { size: 62, weight: 800, fill: col, anchor: "middle" }), fill), { x: 150 + i * 430, y: 380, o: k, s: 0.95 + 0.05 * k, ox: 320 + i * 430, oy: 495 });
      if (i < 3) r += arrow(150 + i * 430 + 350, 495, 150 + i * 430 + 420, 495, p(T, at + 0.4, at + 1.0), { color: C.muted, sw: 6 });
    });
    return r;
  });

  /* Szene 4b – Quote und Mindest-ROAS */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Je kleiner die Quote, desto höher der Mindest-ROAS");
    const rows: [string, number, string, number][] = [["Quote 50 %", 2, "2", 48.6], ["Quote 30 %", 10 / 3, "3,33", 50.0], ["Quote 20 %", 5, "5", 51.4]];
    rows.forEach(([l, v, lab, at], i) => {
      const y = 330 + i * 160, k = p(T, at, at + 1.2, easeOut);
      r += text(140, y + 62, l, { size: 42, weight: 800, fill: C.navy });
      r += rect(520, y, v * 260 * k, 90, { fill: C.accentSoft, stroke: C.accent, sw: 6, rx: 12 });
      r += g(text(520 + v * 260 * k + 24, y + 64, `Mindest-ROAS ${lab}`, { size: 42, weight: 800, fill: C.accent }), { o: k });
    });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: hoher ROAS = Gewinn");
    r += g(card(0, 0, 440, 240, text(220, 90, "ROAS", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(220, 190, "4", { size: 120, weight: 800, fill: C.accent, anchor: "middle" })), { x: 260, y: 330, o: p(T, 55.9, 56.4) });
    r += g(text(960, 500, "≠", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 56.6, 57.2, easeBack) });
    r += g(card(0, 0, 440, 240, text(220, 90, "Gewinn", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(220, 190, "offen", { size: 88, weight: 800, fill: C.rose, anchor: "middle" })), { x: 1220, y: 330, o: p(T, 57.0, 57.5) });
    r += g(text(960, 760, "Fixkosten sind noch nicht gedeckt.", { size: 46, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["ROAS und Gewinn:", "Wann lohnt sich Werbung?"], 3.4);
  s += outroCard(t, 60.8, ["ROAS = Werbeumsatz ÷ Werbekosten.", "Entscheidend ist der Mindest-ROAS", "aus deiner Deckungsbeitragsquote."], "/roas-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "roas", duration: V.duration, render };
void bubble;
