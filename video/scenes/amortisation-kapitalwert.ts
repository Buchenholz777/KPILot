/**
 * Amortisation und Kapitalwert – Beispiel = Rechnerbeispiel: Investition 10.000 €, Rückfluss 2.500 € je Jahr → Amortisationsdauer 4 Jahre.
 * Kapitalwert (Modell): Zinssatz 10 % als Beispielannahme, Zahlungen jeweils am Jahresende, kein Restwert →
 * Barwerte 2.273 / 2.066 / 1.878 / 1.708 € = 7.925 €, Kapitalwert −2.075 € (unabhängig nachgerechnet in tests/videos-rechnungen.test.ts).
 * Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, circle, line, text, textIn, p, easeOut, easeBack, kalle, card, arrow, coin,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "amortisation-kapitalwert")!;

const machine = (x: number, y: number, s = 1, o = 1) =>
  g(
    rect(-150, -40, 300, 40, { fill: C.paper2, stroke: C.ink, sw: 6, rx: 8 }) + rect(-110, -190, 220, 150, { fill: C.accentSoft, stroke: C.ink, sw: 6, rx: 14 }) +
      rect(30, -260, 50, 70, { fill: C.white, stroke: C.ink, sw: 6 }) + circle(-40, -115, 46, { fill: C.white, stroke: C.ink, sw: 6 }) +
      line(-40, -115, -10, -137, { stroke: C.accent, sw: 8 }) + rect(40, -150, 50, 24, { fill: C.gold, stroke: C.ink, sw: 4, rx: 6 }),
    { x, y, s, ox: 0, oy: 0, o },
  );

function render(t: number) {
  let s = backdrop("Amortisation & Kapitalwert", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Eine Maschine für 10.000 € – rechnet sich das?");
    r += kalle(380, 880, { mood: "thinking", arm: "think", t: T });
    r += g(machine(1050, 860, 1.4), { o: p(T, 4.2, 4.8) });
    r += g(card(0, 0, 360, 130, text(180, 84, "10.000 €", { size: 68, weight: 800, fill: C.rose, anchor: "middle" }), C.roseSoft), { x: 1300, y: 340, o: p(T, 4.8, 5.4) });
    r += arrow(1480, 480, 1480, 560, p(T, 5.6, 6.2), { color: C.teal, sw: 8 });
    r += g(card(0, 0, 400, 130, text(200, 82, "2.500 € / Jahr", { size: 44, weight: 800, fill: C.teal, anchor: "middle" }), C.tealSoft), { x: 1280, y: 580, o: p(T, 6.2, 6.8) });
    return r;
  });

  /* Szene 2 – Amortisation */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Amortisation: Wann ist das Geld zurück?" : "Nach vier Jahren ist es zurück");
    if (T < 14.0) {
      r += g(card(0, 0, 1260, 360, textIn(T, 9.0, 60, 140, "10.000 € ÷ 2.500 €", { size: 100, weight: 800, fill: C.navy }) + textIn(T, 11.0, 60, 290, "= 4 Jahre", { size: 130, weight: 800, fill: C.teal })), { x: 330, y: 320, o: p(T, 8.8, 9.3) * (1 - p(T, 13.7, 14.0)) });
    } else {
      const PXE = 0.036, base = 800;
      r += line(220, base - 10000 * PXE, 1700, base - 10000 * PXE, { stroke: C.rose, sw: 5, dash: "16 12" });
      r += text(1700, base - 10000 * PXE - 16, "Investition 10.000 €", { size: 34, weight: 800, fill: C.rose, anchor: "end" });
      for (let i = 0; i < 4; i++) {
        const k = p(T, 14.6 + i * 1.0, 15.4 + i * 1.0, easeOut), v = 2500 * (i + 1);
        r += rect(300 + i * 360, base - v * PXE * k, 260, v * PXE * k, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 10 });
        r += g(text(430 + i * 360, base + 50, `Jahr ${i + 1}`, { size: 36, weight: 700, fill: C.ink, anchor: "middle" }) + text(430 + i * 360, base - v * PXE - 16, `${(v).toLocaleString("de-DE")} €`, { size: 40, weight: 800, fill: C.teal, anchor: "middle" }), { o: k });
      }
      r += g(text(430 + 3 * 360, 330, "zurückverdient", { size: 44, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 18.4, 19.0, easeBack) });
    }
    return r;
  });

  /* Szene 3 – Kapitalwert */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.1 ? "Geld von morgen ist heute weniger wert" : T < 33.6 ? "Barwert bei 10 % Zins (Beispielannahme)" : "Kapitalwert = Barwerte − Investition");
    if (T < 27.0) {
      r += g(coin(400, 560, 90) + text(400, 720, "2.500 € heute", { size: 40, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 21.0, 21.6) });
      r += arrow(560, 560, 960, 560, p(T, 22.4, 23.4), { color: C.muted, sw: 8 });
      r += g(coin(1160, 560, 62) + text(1160, 720, "2.500 € in vier Jahren", { size: 40, weight: 800, fill: C.muted, anchor: "middle" }), { o: p(T, 23.4, 24.2) });
      r += g(text(1160, 440, "weniger wert", { size: 48, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 24.8, 25.4, easeBack) });
    } else if (T < 33.5) {
      const vals = [2273, 2066, 1878, 1708];
      vals.forEach((v, i) => {
        const k = p(T, 27.6 + i * 0.9, 28.4 + i * 0.9, easeOut);
        r += g(card(0, 0, 340, 330, text(170, 66, `Jahr ${i + 1}`, { size: 38, weight: 800, fill: C.navy, anchor: "middle" }) + coin(170, 170, 70 - i * 6) + text(170, 296, `${v.toLocaleString("de-DE")} €`, { size: 50, weight: 800, fill: C.teal, anchor: "middle" })), { x: 160 + i * 430, y: 350, o: k });
      });
      r += g(text(960, 840, "Rückfluss je 2.500 € – heute gerechnet", { size: 36, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 31.5, 32.1) });
    } else {
      const PX = 0.036, base = 660;
      const bars: [string, number, string, string, string, number][] = [
        ["Barwerte", 7925, "7.925 €", C.teal, C.tealSoft, 34.2],
        ["Investition", 10000, "− 10.000 €", C.rose, C.roseSoft, 35.8],
        ["Kapitalwert", -2075, "−2.075 €", C.rose, C.roseSoft, 37.4],
      ];
      r += line(300, base, 1620, base, { stroke: C.ink, sw: 5 });
      bars.forEach(([lab, v, txt, col, fill, at], i) => {
        const k = p(T, at, at + 0.9, easeOut), x = 400 + i * 400, h = Math.abs(v) * PX * k;
        r += rect(x, v >= 0 ? base - h : base, 260, h, { fill, stroke: col, sw: 6, rx: 10 });
        r += g(text(x + 130, v >= 0 ? base - Math.abs(v) * PX - 20 : base + Math.abs(v) * PX + 56, txt, { size: 46, weight: 800, fill: col, anchor: "middle" }), { o: p(T, at + 0.5, at + 1.1) });
        r += g(text(x + 130, v >= 0 ? base + 52 : base - 20 - 0, lab, { size: 36, weight: 800, fill: C.ink, anchor: "middle" }), { o: p(T, at, at + 0.5) * (v >= 0 ? 1 : 0) });
        if (v < 0) r += g(text(x + 130, base + Math.abs(v) * PX + 110, lab, { size: 36, weight: 800, fill: C.ink, anchor: "middle" }), { o: p(T, at, at + 0.5) });
      });
    }
    return r;
  });

  /* Szene 4a – zwei Fragen */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Zwei Kennzahlen, zwei Fragen");
    r += g(card(0, 0, 780, 400, text(40, 80, "Amortisationsdauer", { size: 46, weight: 800, fill: C.teal }) + text(40, 150, "Wann ist das Geld zurück?", { size: 36, weight: 700, fill: C.ink }) + text(40, 310, "4 Jahre", { size: 120, weight: 800, fill: C.teal }), C.tealSoft), { x: 140, y: 330, o: p(T, 41.0, 41.6) });
    r += g(card(0, 0, 780, 400, text(40, 80, "Kapitalwert", { size: 46, weight: 800, fill: C.rose }) + text(40, 150, "Was bleibt nach Zins?", { size: 36, weight: 700, fill: C.ink }) + text(40, 310, "−2.075 €", { size: 120, weight: 800, fill: C.rose }), C.roseSoft), { x: 1000, y: 330, o: p(T, 43.4, 44.0) });
    return r;
  });

  /* Szene 4b – Annahme */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Der Zinssatz ist eine Annahme");
    r += kalle(420, 880, { mood: "thinking", arm: "think", t: T });
    const items = ["Zinssatz 10 % – nur ein Beispiel", "Was brächte das Kapital woanders?", "Zahlungen am Jahresende, kein Restwert"];
    items.forEach((l, i) => (r += g(card(0, 0, 1000, 110, text(40, 72, l, { size: 42, weight: 800, fill: C.navy })), { x: 760, y: 330 + i * 150, o: p(T, 48.6 + i * 1.2, 49.2 + i * 1.2, easeOut) })));
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: kurze Amortisation = gute Investition");
    r += g(card(0, 0, 560, 240, text(280, 90, "Amortisation", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(280, 190, "kurz", { size: 100, weight: 800, fill: C.teal, anchor: "middle" }), C.tealSoft), { x: 200, y: 330, o: p(T, 55.9, 56.4) });
    r += g(text(960, 500, "≠", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 56.6, 57.2, easeBack) });
    r += g(card(0, 0, 560, 240, text(280, 90, "Gewinn danach", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(280, 190, "offen", { size: 100, weight: 800, fill: C.rose, anchor: "middle" })), { x: 1160, y: 330, o: p(T, 57.0, 57.5) });
    r += g(text(960, 760, "Die Amortisation sagt nichts über den Gewinn.", { size: 44, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Amortisation und Kapitalwert:", "Rechnet sich das?"], 3.4);
  s += outroCard(t, 60.8, ["Amortisation: Wann ist das Geld zurück?", "Kapitalwert: Was bleibt nach Zins?"], "/amortisationsrechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "amortisation-kapitalwert", duration: V.duration, render };
