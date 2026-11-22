/**
 * Liquiditätsgrade – Beispiel = Rechnerbeispiel: liquide Mittel 10.000 €, Forderungen 15.000 €, Vorräte 20.000 €,
 * Sonstiges 5.000 €, kurzfristige Verpflichtungen 20.000 € → Grad 1: 50 %, Grad 2: 125 %, Grad 3: 250 %.
 * Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, line, text, textIn, p, easeOut, easeBack, kalle, coin, card, arrow, stack,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "liquiditaet")!;

function render(t: number) {
  let s = backdrop("Liquiditätsgrade", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Viel Vermögen – reicht das Geld?");
    r += kalle(380, 880, { mood: T < 6 ? "neutral" : "worried", arm: "think", t: T });
    r += g(card(0, 0, 520, 230, text(40, 70, "Umlaufvermögen", { size: 38, weight: 700, fill: C.muted }) + text(40, 160, "50.000 €", { size: 92, weight: 800, fill: C.accent })), { x: 640, y: 330, o: p(T, 4.2, 4.8) });
    r += g(text(1230, 480, "?", { size: 160, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 6.0, 6.6, easeBack) });
    r += g(card(0, 0, 520, 230, text(40, 70, "Schulden, jetzt fällig", { size: 38, weight: 700, fill: C.muted }) + text(40, 160, "20.000 €", { size: 92, weight: 800, fill: C.rose }), C.roseSoft), { x: 1300, y: 330, o: p(T, 5.2, 5.8) });
    return r;
  });

  /* Szene 2 – Vermögen ist nicht gleich Geld */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Entscheidend: Wie schnell wird daraus Geld?" : "Drei Stufen: von sofort bis später");
    const sc = 0.0115, base = 850;
    const segs = [
      { v: 10000, color: C.teal, fill: C.tealSoft, label: "Kasse, Bank", o: p(T, 9.0, 9.6), dy: (1 - p(T, 9.0, 9.6, easeOut)) * -50 },
      { v: 15000, color: C.accent, fill: C.accentSoft, label: "Forderungen", o: p(T, 9.8, 10.4), dy: (1 - p(T, 9.8, 10.4, easeOut)) * -50 },
      { v: 20000, color: C.amber, fill: C.goldSoft, label: "Vorräte", o: p(T, 10.6, 11.2), dy: (1 - p(T, 10.6, 11.2, easeOut)) * -50 },
      { v: 5000, color: C.muted, fill: C.paper2, label: "Sonstiges", o: p(T, 11.4, 12.0), dy: (1 - p(T, 11.4, 12.0, easeOut)) * -50 },
    ];
    r += stack(260, base, 380, sc, segs, { labelSize: 34 });
    const vals: [string, number, string][] = [["10.000 €", 5000, C.teal], ["15.000 €", 17500, C.accent], ["20.000 €", 35000, C.amber], ["5.000 €", 47500, C.muted]];
    vals.forEach(([l, mid, col], i) => (r += g(text(670, base - mid * sc + 14, l, { size: 42, weight: 800, fill: col }), { o: p(T, 9.4 + i * 0.8, 10.0 + i * 0.8) })));
    if (T > 14.2) {
      const rows: [string, string, string][] = [["sofort verfügbar", "Kasse, Bank", C.teal], ["wenn der Kunde zahlt", "Forderungen", C.accent], ["erst nach dem Verkauf", "Vorräte", C.amber]];
      rows.forEach(([a, b, col], i) => {
        const k = p(T, 14.6 + i * 1.2, 15.2 + i * 1.2, easeOut);
        r += g(card(0, 0, 760, 130, text(36, 58, a, { size: 40, weight: 800, fill: col }) + text(36, 104, b, { size: 32, weight: 600, fill: C.muted })), { x: 900, y: 330 + i * 170, o: k });
      });
    }
    return r;
  });

  /* Szene 3 – drei Liquiditätsgrade */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.1 ? "Liquidität 1. Grades: nur Kasse und Bank" : T < 33.6 ? "Liquidität 2. Grades: plus Forderungen" : "Liquidität 3. Grades: plus Vorräte und Sonstiges");
    const X = 700, PXP = 3.4; // 1 % = 3,4 px
    const rows: [string, string, number, string, string, string, number][] = [
      ["Grad 1", "10.000 € ÷ 20.000 €", 50, C.teal, C.tealSoft, "50 %", 21.0],
      ["Grad 2", "25.000 € ÷ 20.000 €", 125, C.accent, C.accentSoft, "125 %", 27.6],
      ["Grad 3", "50.000 € ÷ 20.000 €", 250, C.amber, C.goldSoft, "250 %", 33.9],
    ];
    r += g(line(X + 100 * PXP, 300, X + 100 * PXP, 800, { stroke: C.navy, sw: 5, dash: "12 10" }) + text(X + 100 * PXP, 270, "100 % = Schulden genau gedeckt", { size: 32, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 20.8, 21.4) });
    rows.forEach(([l, f, v, col, fill, lab, at], i) => {
      const y = 330 + i * 190, k = p(T, at, at + 1.4, easeOut);
      r += g(text(140, y + 40, l, { size: 46, weight: 800, fill: col }) + text(140, y + 90, f, { size: 34, weight: 700, fill: C.ink }), { o: p(T, at - 0.2, at + 0.4) });
      r += rect(X, y, v * PXP * k, 100, { fill, stroke: col, sw: 6, rx: 12 });
      r += g(text(X + v * PXP * k + 24, y + 70, lab, { size: 56, weight: 800, fill: col }), { o: k });
    });
    return r;
  });

  /* Szene 4a – Weg zum Geld */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Je weiter rechts, desto länger bis zum Geld");
    r += arrow(200, 560, 1720, 560, p(T, 41.0, 42.4), { color: C.ink, sw: 10 });
    const st: [number, string, string, string][] = [[300, "Kasse, Bank", "sofort", C.teal], [960, "Forderungen", "wenn der Kunde zahlt", C.accent], [1560, "Vorräte", "erst verkaufen, dann kassieren", C.amber]];
    st.forEach(([x, a, b, col], i) => {
      const k = p(T, 42.0 + i * 1.2, 42.6 + i * 1.2, easeBack);
      r += g(coin(x, 560, 46) + text(x, 400, a, { size: 46, weight: 800, fill: col, anchor: "middle" }) + text(x, 700, b, { size: 34, weight: 700, fill: C.muted, anchor: "middle" }), { o: k });
    });
    return r;
  });

  /* Szene 4b – Grad 1: Kasse deckt die Hälfte */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Liquidität 1. Grades von 50 %: Kasse deckt die Hälfte");
    for (let i = 0; i < 20; i++) {
      const x = 260 + i * 70, filled = i < 10;
      const k = p(T, 48.6 + i * 0.1, 49.0 + i * 0.1, easeOut);
      r += g(rect(x, 470, 60, 120, { fill: filled ? C.tealSoft : C.roseSoft, stroke: filled ? C.teal : C.rose, sw: 4, rx: 8, dash: filled ? undefined : "10 8" }), { o: k });
    }
    r += g(text(260, 440, "Fällige Schulden 20.000 € (je Kästchen 1.000 €)", { size: 38, weight: 800, fill: C.navy }), { o: p(T, 48.4, 49) });
    r += g(text(260 + 5 * 70 - 5, 660, "Kasse und Bank: 10.000 €", { size: 40, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 51.0, 51.6) });
    r += g(text(260 + 15 * 70 - 5, 660, "Noch offen: 10.000 €", { size: 40, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 52.4, 53.0) });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: viel Vermögen = zahlungsfähig");
    r += g(card(0, 0, 560, 240, text(280, 100, "Viel Vermögen", { size: 52, weight: 800, fill: C.accent, anchor: "middle" }) + text(280, 180, "50.000 €", { size: 64, weight: 800, fill: C.accent, anchor: "middle" })), { x: 200, y: 330, o: p(T, 55.9, 56.4) });
    r += g(text(960, 500, "≠", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 56.6, 57.2, easeBack) });
    r += g(card(0, 0, 560, 240, text(280, 100, "Zahlungsfähig", { size: 52, weight: 800, fill: C.teal, anchor: "middle" }) + text(280, 180, "= Geld da", { size: 64, weight: 800, fill: C.teal, anchor: "middle" }), C.tealSoft), { x: 1160, y: 330, o: p(T, 57.0, 57.5) });
    r += g(text(960, 760, "Entscheidend ist verfügbares Geld.", { size: 46, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Liquiditätsgrade:", "Reicht das Geld für die Schulden?"], 3.4);
  s += outroCard(t, 60.8, ["Drei Grade zeigen, wie schnell", "Vermögen zu Geld wird –", "nicht, wie viel Vermögen da ist."], "/liquiditaetsrechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "liquiditaet", duration: V.duration, render };
void textIn;
