/**
 * ROI – Beispiel = Rechnerbeispiel: zurechenbarer Gewinn 5.000 €, eingesetztes Kapital 50.000 € → 10 % für den Zeitraum.
 * Nicht annualisiert; Risiko und Zahlungszeitpunkte sind nicht enthalten. Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, circle, path, line, text, textIn, p, easeOut, easeBack, lerp, kalle, bubble, coin, card, arrow,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "roi")!;

/* Laden-Gebäude. */
const shop = (x: number, y: number, label: string) =>
  g(
    rect(-200, -300, 400, 300, { fill: C.white, stroke: C.ink, sw: 6, rx: 10 }) +
      path("M -230 -300 L -200 -380 L 200 -380 L 230 -300 Z", { fill: C.accent, stroke: C.ink, sw: 6 }) +
      [0, 1, 2, 3, 4].map((i) => rect(-230 + i * 92, -300, 92, 36, { fill: i % 2 ? C.white : C.accentSoft, stroke: C.ink, sw: 4 })).join("") +
      rect(-150, -220, 120, 220, { fill: C.paper2, stroke: C.ink, sw: 5 }) + rect(10, -220, 150, 120, { fill: C.accentSoft, stroke: C.ink, sw: 5 }) +
      text(0, -330, label, { size: 34, weight: 800, fill: C.white, anchor: "middle" }),
    { x, y },
  );

/* Kapitalstapel: n Blöcke à 5.000 €. */
function capital(x: number, base: number, k: number, gain: number) {
  let s = "";
  for (let i = 0; i < 10; i++) {
    const kk = p(k, i / 10, (i + 0.9) / 10, easeOut);
    if (kk > 0) s += g(rect(x, base - (i + 1) * 46, 300, 40, { fill: C.accentSoft, stroke: C.accent, sw: 4, rx: 8 }), { o: kk, y: (1 - kk) * -30 });
  }
  if (gain > 0) s += g(rect(x, base - 10 * 46 - 46, 300, 40, { fill: C.goldSoft, stroke: C.amber, sw: 5, rx: 8 }) + text(x + 150, base - 10 * 46 - 14, "+5.000 €", { size: 30, weight: 800, fill: C.amber, anchor: "middle" }), { o: gain, y: (1 - gain) * -40 });
  return s;
}

function render(t: number) {
  let s = backdrop("ROI", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Hat sich die Investition gelohnt?");
    r += g(shop(0, 0, "Laden 2"), { x: 1150, y: 860, o: p(T, 3.6, 4.2), s: 0.9 + 0.1 * p(T, 3.6, 4.2, easeBack), ox: 1150, oy: 860 });
    r += kalle(500, 880, { mood: T < 6 ? "happy" : "thinking", arm: T < 6 ? "point" : "think", t: T });
    for (let i = 0; i < 6; i++) {
      const k = p(T, 4.2 + i * 0.25, 5.0 + i * 0.25, easeOut);
      if (k > 0 && k < 1) r += coin(lerp(680, 1080, k), lerp(600, 640, k) - Math.sin(k * Math.PI) * 140, 30);
    }
    r += g(text(880, 420, "50.000 €", { size: 64, weight: 800, fill: C.accent, anchor: "middle" }) + text(880, 470, "eingesetzt", { size: 34, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 4.6, 5.1) });
    r += bubble(T, 6.0, 8.1, 1400, 300, 440, ["Lohnt sich das?"], { size: 50, tail: "left" });
    return r;
  });

  /* Szene 2 – Intuition: Gewinn im Verhältnis zum Kapital */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Gewinn im Verhältnis zum Kapital" : "Was im Zeitraum dazukommt");
    const k1 = p(T, 8.6, 9.2, easeOut) * (1 - p(T, 13.9, 14.3));
    let fr = "";
    fr += rect(0, 0, 520, 130, { fill: C.goldSoft, stroke: C.amber, sw: 6, rx: 20 }) + text(260, 85, "Gewinn", { size: 56, weight: 800, fill: C.amber, anchor: "middle" });
    fr += line(-30, 180, 550, 180, { stroke: C.ink, sw: 8 });
    fr += rect(0, 230, 520, 130, { fill: C.accentSoft, stroke: C.accent, sw: 6, rx: 20 }) + text(260, 315, "eingesetztes Kapital", { size: 48, weight: 800, fill: C.accent, anchor: "middle" });
    r += g(fr, { x: 420, y: 330, o: k1 });
    r += g(text(1100, 530, "= ROI", { size: 96, weight: 800, fill: C.navy }), { o: p(T, 10.2, 10.8) * (1 - p(T, 13.9, 14.3)) });
    if (T > 14.2) {
      r += capital(500, 820, p(T, 14.4, 16.0, (x) => x), p(T, 17.0, 17.8, easeBack));
      r += g(text(460, 600, "50.000 €", { size: 52, weight: 800, fill: C.accent, anchor: "end" }) + text(460, 650, "Kapital", { size: 34, weight: 700, fill: C.muted, anchor: "end" }), { o: p(T, 15.6, 16.1) });
      r += g(text(860, 350, "Gewinn im Zeitraum", { size: 40, weight: 800, fill: C.amber }), { o: p(T, 17.6, 18.1) });
      // Kalender/Uhr: Zeitraum
      const kc = p(T, 15.0, 15.6);
      let cal = rect(0, 0, 300, 260, { fill: C.white, stroke: C.ink, sw: 6, rx: 20 }) + rect(0, 0, 300, 70, { fill: C.navy, rx: 20 }) + rect(0, 40, 300, 30, { fill: C.navy });
      cal += text(150, 50, "Zeitraum", { size: 34, weight: 800, fill: C.white, anchor: "middle" });
      const sweep = p(T, 15.6, 19.6, (x) => x);
      cal += circle(150, 165, 70, { fill: C.paper2, stroke: C.ink, sw: 5 });
      const a = -Math.PI / 2 + sweep * Math.PI * 2;
      cal += line(150, 165, 150 + Math.cos(a) * 56, 165 + Math.sin(a) * 56, { stroke: C.accent, sw: 8 });
      r += g(cal, { x: 1300, y: 420, o: kc });
    }
    return r;
  });

  /* Szene 3 – Rechnung */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.2 ? "Der Gewinn des Ladens" : T < 33.7 ? "ROI = Gewinn ÷ Kapital" : "Pro 100 € kamen 10 € zurück");
    r += capital(160, 820, 1, p(T, 20.8, 21.6, easeBack));
    r += g(text(310, 870, "Kapital 50.000 €", { size: 32, weight: 700, fill: C.muted, anchor: "middle" }), { o: 1 });
    const kg = p(T, 21.4, 22.0, easeOut) * (1 - p(T, 26.9, 27.3));
    let gc = text(40, 70, "Zurechenbarer Gewinn", { size: 38, weight: 700, fill: C.muted });
    gc += textIn(T, 22.0, 40, 190, "5.000 €", { size: 120, weight: 800, fill: C.amber });
    gc += textIn(T, 22.8, 40, 260, "im betrachteten Zeitraum", { size: 38, weight: 700, fill: C.ink });
    r += g(card(0, 0, 900, 310, gc), { x: 700, y: 320, o: kg });
    const kf = p(T, 27.2, 27.8, easeOut) * (1 - p(T, 33.4, 33.8));
    let fc = text(40, 70, "ROI", { size: 40, weight: 800, fill: C.muted });
    fc += textIn(T, 27.6, 40, 190, "5.000 € ÷ 50.000 €", { size: 88, weight: 800, fill: C.navy });
    fc += textIn(T, 28.8, 40, 320, "= 0,1", { size: 100, weight: 800, fill: C.ink });
    fc += textIn(T, 29.8, 420, 320, "= 10 %", { size: 120, weight: 800, fill: C.teal });
    fc += textIn(T, 30.8, 40, 400, "für diesen Zeitraum", { size: 40, weight: 700, fill: C.teal });
    r += g(card(0, 0, 960, 450, fc), { x: 680, y: 290, o: kf });
    const kc = p(T, 33.7, 34.2);
    if (kc > 0) {
      let c = "";
      for (let i = 0; i < 10; i++) c += g(coin(0, 0, 34), { x: 760 + (i % 5) * 84, y: 400 + Math.floor(i / 5) * 84, o: p(T, 34.0 + i * 0.08, 34.3 + i * 0.08) });
      c += g(text(760 - 34, 560, "100 € eingesetzt", { size: 40, weight: 800, fill: C.accent }), { o: p(T, 34.6, 35) });
      c += arrow(1200, 440, 1360, 440, p(T, 35.4, 36.2), { color: C.teal, sw: 8 });
      c += g(coin(1440, 440, 44), { o: p(T, 36.0, 36.5) });
      c += g(text(1400, 560, "10 € Gewinn", { size: 40, weight: 800, fill: C.amber, anchor: "middle" }), { o: p(T, 36.4, 36.8) });
      c += g(text(760 - 34, 680, "je 10 € pro Münze", { size: 30, weight: 600, fill: C.muted }), { o: p(T, 35, 35.4) });
      r += g(c, { o: kc });
    }
    return r;
  });

  /* Szene 4a – Ist 10 % gut? */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Sind 10 % gut? Erst der Vergleich zeigt es");
    r += g(card(0, 0, 360, 260, text(180, 150, "10 %", { size: 120, weight: 800, fill: C.teal, anchor: "middle" }) + text(180, 215, "ROI", { size: 36, weight: 700, fill: C.muted, anchor: "middle" })), { x: 160, y: 380, o: p(T, 40.6, 41.0) });
    const qs: [string, string][] = [
      ["Was kostet das Kapital?", "Zinsen, Finanzierung"],
      ["Was brächte die Alternative?", "anderes Projekt, Anlage"],
      ["Wie sicher ist der Gewinn?", "Risiko, Schwankung"],
    ];
    qs.forEach(([q, sub], i) => {
      const k = p(T, 41.4 + i * 1.3, 42.0 + i * 1.3, easeOut);
      r += g(card(0, 0, 820, 150, text(40, 64, q, { size: 44, weight: 800, fill: C.navy }) + text(40, 116, sub, { size: 32, weight: 600, fill: C.muted })), { x: 700, y: 270 + i * 180, o: k, s: 0.96 + 0.04 * k, ox: 700, oy: 340 + i * 180 });
      r += arrow(540, 510, 690, 345 + i * 180, k, { color: C.muted, sw: 4 });
    });
    return r;
  });

  /* Szene 4b – Zeitraum */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Der ROI gilt für den gewählten Zeitraum");
    const yr = 340;
    const k1 = p(T, 48.3, 49.5, easeOut), k2 = p(T, 50.0, 51.8, easeOut);
    r += text(160, yr - 20, "Projekt A", { size: 40, weight: 800, fill: C.navy });
    r += rect(160, yr, 400 * k1, 90, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 14 });
    r += g(text(180 + 400 * k1, yr + 62, "10 % in 1 Jahr", { size: 44, weight: 800, fill: C.teal }), { o: k1 });
    r += g(text(160, yr + 160, "Projekt B", { size: 40, weight: 800, fill: C.navy }), { o: p(T, 49.6, 50) });
    r += rect(160, yr + 180, 1200 * k2, 90, { fill: C.amberSoft, stroke: C.amber, sw: 6, rx: 14 });
    r += g(text(180 + 1200 * k2, yr + 242, "10 % in 3 Jahren", { size: 44, weight: 800, fill: C.amber }), { o: k2 });
    for (let i = 0; i <= 3; i++) r += g(line(160 + i * 400, yr + 300, 160 + i * 400, yr + 330, { stroke: C.ink, sw: 4 }) + text(160 + i * 400, yr + 372, i === 1 ? "1 Jahr" : `${i} Jahre`, { size: 30, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 48.2, 48.7) });
    r += g(line(160, yr + 300, 1360, yr + 300, { stroke: C.ink, sw: 4 }), { o: p(T, 48.2, 48.7) });
    r += g(text(160, yr + 480, "Gleicher ROI, aber B braucht dreimal so lange – pro Jahr nur ≈ 3,2 %.", { size: 40, weight: 800, fill: C.navy }), { o: p(T, 52.2, 52.8) });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: 10 % = gute Investition");
    let c = textIn(T, 55.8, 50, 90, "Was die 10 % nicht zeigen:", { size: 46, weight: 800, fill: C.navy });
    ["Risiko – wie sicher ist der Gewinn?", "Zahlungszeitpunkte – wann fließt Geld?", "Dauer – über welchen Zeitraum?"].forEach((l, i) => {
      c += textIn(T, 56.6 + i * 0.6, 50, 180 + i * 80, "✕", { size: 50, weight: 800, fill: C.rose });
      c += textIn(T, 56.6 + i * 0.6, 120, 180 + i * 80, l, { size: 44, weight: 700, fill: C.ink });
    });
    r += g(card(0, 0, 1000, 400, c), { x: 140, y: 300, o: p(T, 55.6, 56.1) });
    r += kalle(1520, 820, { s: 0.85, mood: "thinking", arm: "think", t: T, look: -1 });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["ROI:", "Was bringt eingesetztes Kapital?"], 3.4);
  s += outroCard(t, 60.8, ["ROI = Gewinn ÷ Kapital –", "für einen bestimmten Zeitraum.", "Risiko und Timing extra prüfen."], "/roi-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "roi", duration: V.duration, render };
