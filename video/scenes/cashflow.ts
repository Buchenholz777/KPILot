/**
 * Cashflow – Beispiel = Rechnerbeispiel: Einzahlungen 30.000 €, Auszahlungen 22.000 € → operativer Cashflow 8.000 €.
 * Erweiterte Übersicht (Rechnerbeispiel „erweitert“): Investition −5.000 €, Finanzierung +2.000 € → Netto 5.000 €.
 * Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, circle, path, line, text, textIn, p, easeOut, easeBack, lerp, kalle, bubble, coin, card, arrow,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, waterfall, account, invoice, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "cashflow")!;

/* Konto als Tank mit Zu- und Abfluss. */
function tank(T: number, level: number) {
  let s = "";
  // Zuflussrohr links
  s += rect(250, 420, 620, 60, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 30 });
  s += text(260, 400, "Einzahlungen", { size: 40, weight: 800, fill: C.teal });
  s += text(260, 540, "Kunden bezahlen", { size: 32, weight: 600, fill: C.muted });
  // Abflussrohr rechts unten
  s += rect(1170, 700, 520, 60, { fill: C.roseSoft, stroke: C.rose, sw: 6, rx: 30 });
  s += text(1690, 680, "Auszahlungen", { size: 40, weight: 800, fill: C.rose, anchor: "end" });
  s += text(1690, 812, "Ware, Miete, Löhne", { size: 32, weight: 600, fill: C.muted, anchor: "end" });
  // Tank
  s += rect(860, 330, 320, 470, { fill: C.white, stroke: C.ink, sw: 6, rx: 36 });
  const lh = 440 * level;
  s += rect(874, 786 - lh, 292, lh, { fill: C.accentSoft, rx: 26 });
  s += path(`M 874 ${786 - lh} q 36 ${-10 * Math.sin(T * 3)} 73 0 t 73 0 t 73 0 t 73 0`, { stroke: C.accent, sw: 5 });
  s += text(1020, 300, "Konto", { size: 44, weight: 800, fill: C.navy, anchor: "middle" });
  // fließende Münzen
  for (let i = 0; i < 5; i++) {
    const ph = ((T * 0.55 + i / 5) % 1);
    s += coin(lerp(280, 850, ph), 450, 22, Math.min(1, ph * 6, (1 - ph) * 6));
    const ph2 = ((T * 0.5 + i / 5 + 0.1) % 1);
    s += coin(lerp(1190, 1670, ph2), 730, 22, Math.min(1, ph2 * 6, (1 - ph2) * 6) * 0.9);
  }
  return s;
}

function render(t: number) {
  let s = backdrop("Cashflow", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Gewinn – aber kein Geld?");
    let rep = text(36, 66, "Auswertung des Monats", { size: 34, weight: 700, fill: C.muted });
    [120, 170, 150, 230, 260].forEach((h, i) => {
      const k = p(T, 3.8 + i * 0.15, 4.4 + i * 0.15, easeOut);
      rep += rect(50 + i * 92, 330 - h * k, 60, h * k, { fill: C.tealSoft, stroke: C.teal, sw: 4, rx: 8 });
    });
    rep += line(36, 334, 524, 334, { stroke: C.ink, sw: 4 });
    rep += textIn(T, 4.8, 36, 400, "Gewinn ✓", { size: 56, weight: 800, fill: C.teal });
    r += g(card(0, 0, 560, 440, rep), { x: 160, y: 270, o: p(T, 3.5, 4.0) });
    r += kalle(960, 880, { mood: T < 5.4 ? "happy" : "worried", arm: T < 5.4 ? "down" : "think", t: T, look: T < 5.4 ? -1 : 1 });
    const ka = p(T, 5.2, 5.8, easeBack);
    r += g(account(0, 0, "Geschäftskonto", "fast leer", { tone: C.rose, sub: "die Miete ist bald fällig" }), { x: 1260, y: 360, o: ka });
    r += bubble(T, 5.9, 8.1, 1150, 640, 600, ["Wo ist das Geld?"], { size: 50, tail: "left" });
    return r;
  });

  /* Szene 2 – Intuition: Zufluss und Abfluss, Forderung wartet */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Cashflow = echtes Geld rein und raus" : "Eine offene Rechnung ist noch kein Geld");
    r += g(tank(T, 0.42 + 0.06 * p(T, 9, 14)), { o: p(T, 8.4, 9.0) });
    if (T > 14.2) {
      // Rechnung fliegt in Richtung Konto und bleibt in „Wartet“-Ablage
      const k = p(T, 14.5, 16.0, easeOut);
      const x = lerp(160, 540, k), y = lerp(260, 690, k) - Math.sin(k * Math.PI) * 60;
      r += g(rect(380, 770, 320, 40, { fill: C.amberSoft, stroke: C.amber, sw: 5, rx: 12 }) + text(540, 862, "Forderung: wartet", { size: 36, weight: 800, fill: C.amber, anchor: "middle" }), { o: p(T, 14.6, 15.1) });
      r += invoice(x, y, "5.000 €", { s: 0.8, r: lerp(-12, 0, k), stamp: T > 16.2 ? "OFFEN" : undefined });
      const kx = p(T, 16.8, 17.4);
      r += g(path("M 660 640 L 820 520", { stroke: C.rose, sw: 8, dash: "14 12" }) + text(760, 650, "✕", { size: 70, weight: 800, fill: C.rose }), { o: kx });
      r += g(text(1180, 270, "kein Zufluss – das Konto merkt nichts", { size: 34, weight: 700, fill: C.rose }), { o: p(T, 17.4, 17.9) });
    }
    return r;
  });

  /* Szene 3 – Rechnung: 30.000 − 22.000 = 8.000 */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 33.7 ? "Operativer Cashflow im Monat" : "Die offene Rechnung zählt später");
    r += waterfall(T, 20.8, [
      { label: "Einzahlungen", value: 30000, total: true, color: C.teal, fill: C.tealSoft },
      { label: "Auszahlungen", value: -22000, color: C.rose, fill: C.roseSoft },
      { label: "Operativer", sub: "Cashflow", value: 8000, total: true, color: C.accent, fill: C.accentSoft },
    ], { x: 180, y: 270, w: 1000, h: 440, max: 30000, step: 3.0 });
    const kf = p(T, 27.4, 28.0, easeOut) * (1 - p(T, 33.4, 33.9));
    let fc = text(40, 70, "Operativer Cashflow", { size: 36, weight: 700, fill: C.muted });
    fc += textIn(T, 27.8, 40, 160, "30.000 €", { size: 76, weight: 800, fill: C.teal });
    fc += textIn(T, 28.4, 40, 250, "− 22.000 €", { size: 76, weight: 800, fill: C.rose });
    fc += g(line(40, 285, 480, 285, { stroke: C.ink, sw: 5 }), { o: p(T, 28.9, 29.2) });
    fc += textIn(T, 29.2, 40, 380, "= 8.000 €", { size: 92, weight: 800, fill: C.accent });
    r += g(card(0, 0, 540, 430, fc), { x: 1280, y: 260, o: kf });
    // offene Rechnung: kommt erst im nächsten Zeitraum
    const ko = p(T, 33.9, 34.5, easeOut);
    if (ko > 0) {
      r += invoice(1420, 450, "5.000 €", { s: 0.85, stamp: "OFFEN" });
      r += g(arrow(1550, 450, 1720, 450, p(T, 35.2, 36.2), { color: C.amber, sw: 8 }), { o: ko });
      r += g(text(1730, 390, "später", { size: 38, weight: 800, fill: C.amber, anchor: "end" }), { o: p(T, 36, 36.5) });
      r += g(text(1300, 650, "Forderung, kein Zufluss.", { size: 40, weight: 800, fill: C.amber }) + text(1300, 700, "Zählt erst, wenn das", { size: 36, weight: 600, fill: C.ink }) + text(1300, 745, "Geld eingeht.", { size: 36, weight: 600, fill: C.ink }), { o: p(T, 36.4, 37) });
    }
    return r;
  });

  /* Szene 4a – Netto-Cashflow */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Mit Investition und Kredit: Netto-Cashflow");
    r += waterfall(T, 40.6, [
      { label: "Operativ", value: 8000, total: true, color: C.accent, fill: C.accentSoft },
      { label: "Maschine", sub: "Investition", value: -5000, color: C.rose, fill: C.roseSoft },
      { label: "Kredit", sub: "Finanzierung", value: 2000, color: C.teal, fill: C.tealSoft },
      { label: "Netto", sub: "Cashflow", value: 5000, total: true, color: C.navy, fill: C.paper2 },
    ], { x: 200, y: 290, w: 1300, h: 420, max: 10000, step: 1.3 });
    r += kalle(1740, 880, { s: 0.62, mood: "thinking", arm: "think", t: T, look: -1 });
    return r;
  });

  /* Szene 4b – Kontostand (Bestand) vs. Cashflow (Fluss) */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Kontostand ist ein Bestand, Cashflow ein Fluss");
    r += g(account(0, 0, "Monatsanfang", "12.000 €"), { x: 160, y: 330, o: p(T, 48.1, 48.6) });
    r += g(account(0, 0, "Monatsende", "17.000 €", { tone: C.teal }), { x: 1180, y: 330, o: p(T, 50.2, 50.7) });
    r += arrow(620, 430, 1160, 430, p(T, 49.0, 50.2), { color: C.accent, sw: 10 });
    r += g(text(890, 400, "+5.000 € Cashflow", { size: 46, weight: 800, fill: C.accent, anchor: "middle", halo: C.paper }), { o: p(T, 49.6, 50.1) });
    r += line(220, 640, 1560, 640, { stroke: C.ink, sw: 5 });
    r += g(circle(370, 640, 16, { fill: C.navy }) + circle(1390, 640, 16, { fill: C.navy }) + rect(380, 626, 1000, 28, { fill: C.accentSoft, rx: 14 }), { o: p(T, 50.6, 51.2) });
    r += g(text(370, 710, "Zeitpunkt", { size: 34, weight: 700, fill: C.muted, anchor: "middle" }) + text(1390, 710, "Zeitpunkt", { size: 34, weight: 700, fill: C.muted, anchor: "middle" }) + text(880, 710, "Zeitraum", { size: 34, weight: 800, fill: C.accent, anchor: "middle" }), { o: p(T, 51.0, 51.5) });
    r += kalle(1740, 880, { s: 0.62, mood: "happy", arm: "point", t: T, look: -1 });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: Gewinn = Cashflow");
    r += invoice(960, 470, "5.000 €", { s: 0.9, stamp: "OFFEN" });
    const k1 = p(T, 55.8, 56.4, easeOut), k2 = p(T, 57.0, 57.6, easeOut);
    r += g(card(0, 0, 560, 300, text(40, 80, "Gewinn", { size: 56, weight: 800, fill: C.navy }) + text(40, 150, "Rechnung zählt", { size: 42, weight: 700, fill: C.ink }) + text(40, 205, "schon als Ertrag.", { size: 42, weight: 700, fill: C.ink }) + text(500, 90, "✓", { size: 80, weight: 800, fill: C.teal, anchor: "end" })), { x: 170, y: 330, o: k1 });
    r += g(card(0, 0, 560, 300, text(40, 80, "Cashflow", { size: 56, weight: 800, fill: C.navy }) + text(40, 150, "Zählt erst, wenn", { size: 42, weight: 700, fill: C.ink }) + text(40, 205, "das Geld da ist.", { size: 42, weight: 700, fill: C.ink }) + text(500, 90, "…", { size: 80, weight: 800, fill: C.amber, anchor: "end" })), { x: 1190, y: 330, o: k2 });
    r += g(text(960, 780, "Gewinn ≠ Geld auf dem Konto", { size: 56, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Cashflow:", "Wie viel Geld fließt wirklich?"], 3.4);
  s += outroCard(t, 60.8, ["Cashflow = Einzahlungen", "− Auszahlungen im Zeitraum.", "Gewinn ist nicht gleich Geld."], "/cashflow-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "cashflow", duration: V.duration, render };
