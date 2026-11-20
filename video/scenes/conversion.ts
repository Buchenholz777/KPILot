/**
 * Conversion Rate – Beispiel = Rechnerbeispiel (besuchsbasiert): 25 Besuche mit Conversion von 1.000 Besuchen → 2,5 %.
 * Besuche ≠ Personen. Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, circle, path, line, text, textIn, p, easeOut, lerp, num, kalle, bubble, card, arrow, backdrop,
  titleCard, outroCard, sceneTitle, scene, narration, person, browser, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "conversion")!;

/* Deterministische Auswahl der 25 „Kauf“-Besuche (reproduzierbar). */
const BUY = (() => {
  const set = new Set<number>();
  let a = 20261120; // mulberry32, fester Startwert
  const rnd = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  while (set.size < 25) set.add(Math.floor(rnd() * 1000));
  return [...set];
})();

/* 1.000 Punkte, je einer pro Besuch (40 × 25). */
function dots(x: number, y: number, kAppear: number, kGreen: number) {
  let s = "";
  const nShow = Math.floor(1000 * kAppear);
  const nGreen = Math.floor(25 * kGreen);
  const green = new Set(BUY.slice(0, nGreen));
  for (let i = 0; i < nShow; i++) {
    const cx = x + (i % 40) * 22, cy = y + Math.floor(i / 40) * 22;
    s += green.has(i) ? circle(cx, cy, 9.5, { fill: C.teal, stroke: C.ink, sw: 2 }) : circle(cx, cy, 6.5, { fill: "#B9C3D6" });
  }
  return s;
}

function render(t: number) {
  let s = backdrop("Conversion Rate", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "1.000 Besuche – wie viele Käufe?");
    const inner = text(60, 170, "Kalles Shop", { size: 48, weight: 800, fill: C.navy }) + text(60, 250, "Besuche diesen Monat", { size: 34, weight: 600, fill: C.muted }) +
      text(60, 360, num(Math.round(1000 * p(T, 4.0, 5.6, easeOut))), { size: 110, weight: 800, fill: C.accent }) +
      g(rect(560, 300, 160, 70, { fill: C.tealSoft, stroke: C.teal, sw: 5, rx: 35 }) + text(640, 348, "Kaufen", { size: 30, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 4.4, 4.8) });
    r += g(browser(0, 0, 800, 440, "kalles-shop.example", inner), { x: 160, y: 300, o: p(T, 3.6, 4.1) });
    r += kalle(1300, 880, { mood: "thinking", arm: "think", t: T, look: -1 });
    r += bubble(T, 5.8, 8.1, 1120, 300, 600, ["Und wie viele", "haben gekauft?"], { size: 48, tail: "right" });
    return r;
  });

  /* Szene 2 – Intuition: Anteil der Besuche mit Ziel */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Anteil der Besuche, die zum Ziel führen" : "Jeder Besuch ein Punkt");
    const kf = p(T, 8.6, 9.2) * (1 - p(T, 13.9, 14.3));
    let fn = "";
    fn += path("M 0 0 L 900 0 L 600 300 L 300 300 Z", { fill: C.accentSoft, stroke: C.accent, sw: 6 });
    fn += text(450, 90, "alle Besuche", { size: 44, weight: 800, fill: C.accent, anchor: "middle" });
    fn += rect(330, 320, 240, 110, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 20 }) + text(450, 390, "Ziel: Kauf", { size: 40, weight: 800, fill: C.teal, anchor: "middle" });
    fn += g(arrow(450, 300, 450, 316, 1, { color: C.teal }), { o: p(T, 10.4, 10.8) });
    for (let i = 0; i < 6; i++) {
      const ph = (T * 0.6 + i / 6) % 1;
      fn += circle(lerp(150 + i * 120, 450, ph), lerp(30, 360, ph), 10, { fill: i === 2 ? C.teal : "#B9C3D6", o: Math.min(1, (1 - ph) * 5) });
    }
    r += g(fn, { x: 300, y: 300, o: kf });
    r += g(text(1340, 600, "Conversion", { size: 46, weight: 800, fill: C.teal }) + text(1340, 650, "= Ziel erreicht", { size: 40, weight: 700, fill: C.ink }), { o: p(T, 11.0, 11.5) * (1 - p(T, 13.9, 14.3)) });
    if (T > 14.2) {
      r += dots(300, 300, p(T, 14.4, 17.4, (x) => x), 0);
      r += g(text(1240, 420, "1.000 Besuche", { size: 52, weight: 800, fill: C.navy }) + text(1240, 470, "= 1.000 Punkte", { size: 36, weight: 700, fill: C.muted }), { o: p(T, 16.4, 16.9) });
    }
    return r;
  });

  /* Szene 3 – 25 von 1.000, Rechnung, 2,5 von 100 */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.2 ? "25 Besuche endeten mit Kauf" : T < 33.7 ? "Conversion Rate berechnen" : "Pro 100 Besuche: 2,5 Käufe");
    const kd = 1 - p(T, 33.4, 33.8);
    const kgr = p(T, 20.8, 24.0, (x) => x);
    r += g(dots(300, 300, 1, kgr), { o: kd });
    r += g(text(1240, 420, `${Math.floor(25 * kgr)} Käufe`, { size: 64, weight: 800, fill: C.teal }) + text(1240, 480, "bei 1.000 Besuchen", { size: 36, weight: 700, fill: C.muted }), { o: p(T, 20.8, 21.2) * (1 - p(T, 26.9, 27.3)) });
    const kf = p(T, 27.2, 27.8, easeOut) * (1 - p(T, 33.4, 33.8));
    let fc = text(40, 70, "Conversion Rate", { size: 38, weight: 800, fill: C.muted });
    fc += textIn(T, 27.6, 40, 170, "25 ÷ 1.000", { size: 80, weight: 800, fill: C.navy });
    fc += textIn(T, 28.6, 40, 270, "= 0,025", { size: 80, weight: 800, fill: C.ink });
    fc += textIn(T, 29.6, 40, 400, "= 2,5 %", { size: 120, weight: 800, fill: C.teal });
    r += g(card(0, 0, 640, 460, fc), { x: 1200, y: 290, o: kf });
    // 10×10 Ausschnitt: 2,5 grüne Punkte
    const kz = p(T, 33.7, 34.3);
    if (kz > 0) {
      let z = "";
      for (let i = 0; i < 100; i++) {
        const cx = 360 + (i % 10) * 56, cy = 300 + Math.floor(i / 10) * 52;
        const k = p(T, 34.0 + i * 0.008, 34.3 + i * 0.008);
        if (i < 2) z += g(circle(cx, cy, 20, { fill: C.teal, stroke: C.ink, sw: 3 }), { o: p(T, 35.2, 35.6) }) + circle(cx, cy, 14, { fill: "#B9C3D6", o: k * (1 - p(T, 35.2, 35.6)) });
        else if (i === 2) z += circle(cx, cy, 20, { fill: "#B9C3D6", o: k }) + g(path(`M ${cx} ${cy - 20} A 20 20 0 0 0 ${cx} ${cy + 20} Z`, { fill: C.teal, stroke: C.ink, sw: 3 }), { o: p(T, 35.8, 36.2) });
        else z += circle(cx, cy, 14, { fill: "#B9C3D6", o: k });
      }
      z += g(text(1020, 420, "100 Besuche", { size: 52, weight: 800, fill: C.navy }) + text(1020, 490, "→ im Schnitt 2,5 Käufe", { size: 44, weight: 800, fill: C.teal }), { o: p(T, 36.2, 36.7) });
      z += g(text(1020, 570, "(ein „halber Kauf“ ist ein Durchschnitt)", { size: 30, weight: 600, fill: C.muted }), { o: p(T, 37, 37.5) });
      r += g(z, { o: kz });
    }
    return r;
  });

  /* Szene 4a – Besuche ≠ Personen */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Besuche sind keine Personen");
    r += person(360, 640, 1.6, C.accent, p(T, 40.6, 41.1));
    r += g(text(360, 720, "1 Person", { size: 40, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 40.8, 41.2) });
    for (let i = 0; i < 3; i++) {
      const k = p(T, 41.6 + i * 0.9, 42.4 + i * 0.9, easeOut);
      r += arrow(480, 520, 800, 340 + i * 170, k, { color: C.accent, sw: 6, bend: 0.05 * (1 - i) });
      r += g(browser(0, 0, 320, 130, `Besuch ${i + 1}`, text(30, 108, ["Montag", "Mittwoch", "Freitag"][i], { size: 30, weight: 700, fill: C.ink })), { x: 830, y: 270 + i * 170, o: k });
    }
    r += g(card(0, 0, 500, 200, text(40, 90, "= 3 Besuche", { size: 64, weight: 800, fill: C.accent }) + text(40, 150, "in der Statistik", { size: 36, weight: 700, fill: C.muted })), { x: 1260, y: 420, o: p(T, 44.6, 45.2) });
    return r;
  });

  /* Szene 4b – Gleiche Definition */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Nur Gleiches mit Gleichem vergleichen");
    const row = (y: number, a: string, b: string, at: number, same: boolean) =>
      g(text(160, y, a, { size: 40, weight: 700, fill: C.ink }) + text(1000, y, b, { size: 40, weight: 700, fill: C.ink }) + text(1700, y, same ? "✓" : "≠", { size: 56, weight: 800, fill: same ? C.teal : C.rose, anchor: "end" }), { o: p(T, at, at + 0.4) });
    r += g(text(160, 300, "Shop A", { size: 46, weight: 800, fill: C.accent }) + text(1000, 300, "Shop B", { size: 46, weight: 800, fill: C.amber }), { o: p(T, 48.1, 48.5) });
    r += line(140, 330, 1720, 330, { stroke: C.line, sw: 3 });
    r += row(410, "Ziel: Kauf", "Ziel: Newsletter", 48.8, false);
    r += row(500, "Zeitraum: Monat", "Zeitraum: Woche", 49.8, false);
    r += row(590, "Basis: Besuche", "Basis: Personen", 50.8, false);
    r += g(text(160, 720, "Unterschiedliche Definition → Raten nicht vergleichbar.", { size: 46, weight: 800, fill: C.rose }), { o: p(T, 52, 52.6) });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: höhere Rate = mehr Umsatz");
    const col = (x: number, title: string, visits: string, rate: string, sales: string, color: string, at: number) =>
      g(card(0, 0, 640, 360, text(40, 76, title, { size: 46, weight: 800, fill: color }) + text(40, 156, visits, { size: 42, weight: 700, fill: C.ink }) + text(40, 220, rate, { size: 42, weight: 700, fill: C.ink }) + line(40, 250, 600, 250, { stroke: C.ink, sw: 4 }) + text(40, 320, sales, { size: 54, weight: 800, fill: C.navy })), { x, y: 290, o: p(T, at, at + 0.5) });
    r += col(160, "Variante A", "1.000 Besuche", "× 2,5 %", "= 25 Käufe", C.accent, 55.7);
    r += col(1100, "Variante B", "400 Besuche", "× 5 %", "= 20 Käufe", C.amber, 56.6);
    r += g(text(960, 760, "Doppelte Rate – trotzdem weniger Käufe.", { size: 50, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 57.8, 58.4) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Conversion Rate:", "Wie viele Besuche führen zum Ziel?"], 3.4);
  s += outroCard(t, 60.8, ["Conversion Rate = Besuche mit Ziel", "÷ alle Besuche.", "Besuche sind keine Personen."], "/conversion-rate-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "conversion", duration: V.duration, render };
