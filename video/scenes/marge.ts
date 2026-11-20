/**
 * Marge & Aufschlag – Beispiel = Rechnerbeispiel: Kostenbasis 80 €, Verkaufspreis 100 €
 * → Rohertrag 20 €, Marge 20 %, Aufschlag 25 %. Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, line, text, textIn, p, easeOut, easeBack, kalle, bubble, product, card, arrow, backdrop, titleCard,
  outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "marge")!;
const SC = 5; // 5 px je Euro
const BASE = 820;

/* Balken mit Unterteilung in 20-€-Blöcke. */
function blocks(x: number, w: number, total: number, k: number, highlight: number[], color: string, fill: string, lbl?: (i: number) => string) {
  let s = "";
  const n = Math.round(total / 20);
  for (let i = 0; i < n; i++) {
    const kk = p(k, i / n, (i + 0.8) / n);
    if (kk <= 0) continue;
    const hl = highlight.includes(i);
    const y = BASE - (i + 1) * 20 * SC;
    s += g(rect(x, y, w, 20 * SC, { fill: hl ? C.tealSoft : fill, stroke: hl ? C.teal : color, sw: 5, rx: 8 }) + (lbl ? text(x + w / 2, y + 64, lbl(i), { size: 40, weight: 800, fill: hl ? C.teal : color, anchor: "middle" }) : ""), { o: kk });
  }
  return s;
}

function render(t: number) {
  let s = backdrop("Marge & Aufschlag", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "20 % oder 25 %?");
    r += g(product(0, 0, 1.2, C.paper2, "80 €"), { x: 330, y: 700, o: p(T, 3.6, 4.1) });
    r += g(text(330, 780, "Einkauf", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 3.6, 4.1) });
    r += arrow(470, 620, 760, 620, p(T, 4.2, 5.0), { color: C.ink, sw: 7 });
    r += g(product(0, 0, 1.2, C.teal, "100 €"), { x: 900, y: 700, o: p(T, 4.8, 5.3) });
    r += g(text(900, 780, "Verkauf", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 4.8, 5.3) });
    r += kalle(1460, 880, { mood: "thinking", arm: "think", t: T, look: -1 });
    r += bubble(T, 5.6, 8.1, 1080, 260, 520, ["20 % oder 25 %?"], { size: 52, tail: "right" });
    return r;
  });

  /* Szene 2 – Intuition: gleiche 20 €, andere Blickrichtung */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Gleiche 20 € – andere Basis" : "Aufschlag von unten, Marge von oben");
    const k1 = p(T, 8.6, 9.6, easeOut), k2 = p(T, 9.2, 10.2, easeOut);
    r += rect(420, BASE - 80 * SC * k1, 240, 80 * SC * k1, { fill: C.paper2, stroke: C.ink, sw: 6, rx: 10 });
    r += g(text(540, BASE - 180, "80 €", { size: 52, weight: 800, fill: C.ink, anchor: "middle" }), { o: k1 });
    r += rect(900, BASE - 100 * SC * k2, 240, 100 * SC * k2, { fill: C.accentSoft, stroke: C.accent, sw: 6, rx: 10 });
    r += g(text(1020, BASE - 180, "100 €", { size: 52, weight: 800, fill: C.accent, anchor: "middle" }), { o: k2 });
    r += text(540, BASE + 50, "Einkauf", { size: 36, weight: 700, fill: C.muted, anchor: "middle" }) + text(1020, BASE + 50, "Verkaufspreis", { size: 36, weight: 700, fill: C.muted, anchor: "middle" });
    // 20-€-Differenz
    const kd = p(T, 10.8, 11.6, easeOut);
    r += g(rect(900, BASE - 500, 240, 100, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 10 }) + text(1020, BASE - 434, "20 €", { size: 52, weight: 800, fill: C.teal, anchor: "middle" }) + line(660, BASE - 400, 900, BASE - 400, { stroke: C.muted, sw: 3, dash: "10 8" }), { o: kd });
    // Blickrichtungen
    const ka = p(T, 14.6, 15.6);
    r += arrow(300, BASE - 10, 300, BASE - 390, ka, { color: C.amber, sw: 10 });
    r += g(text(260, BASE - 300, "Aufschlag", { size: 44, weight: 800, fill: C.amber, anchor: "end" }) + text(260, BASE - 250, "Basis: 80 €", { size: 34, weight: 700, fill: C.ink, anchor: "end" }), { o: p(T, 15.2, 15.7) });
    const km = p(T, 16.4, 17.4);
    r += arrow(1260, BASE - 500, 1260, BASE - 410, km, { color: C.teal, sw: 10 });
    r += g(line(1230, BASE - 500, 1290, BASE - 500, { stroke: C.teal, sw: 8 }), { o: km });
    r += g(text(1320, BASE - 470, "Marge", { size: 44, weight: 800, fill: C.teal }) + text(1320, BASE - 420, "Basis: 100 €", { size: 34, weight: 700, fill: C.ink }), { o: p(T, 17.0, 17.5) });
    return r;
  });

  /* Szene 3 – Rohertrag, Marge, Aufschlag */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.2 ? "Rohertrag je Stück" : T < 33.7 ? "Marge: 20 € von 100 €" : "Aufschlag: 20 € auf 80 €");
    // Rohertrag
    const kr = p(T, 20.6, 21.2) * (1 - p(T, 26.9, 27.3));
    let f = text(40, 70, "Rohertrag = Verkaufspreis − Einkauf", { size: 36, weight: 700, fill: C.muted });
    f += textIn(T, 21.2, 40, 200, "100 € − 80 € =", { size: 100, weight: 800, fill: C.navy });
    f += textIn(T, 22.4, 780, 200, "20 €", { size: 110, weight: 800, fill: C.teal });
    r += g(card(0, 0, 1100, 280, f), { x: 400, y: 330, o: kr });
    // Marge: 100 € in fünf 20-€-Blöcken
    const km = p(T, 27.2, 27.6) * (1 - p(T, 33.4, 33.8));
    if (km > 0) {
      let m = blocks(300, 260, 100, p(T, 27.4, 29.0, (x) => x), [4], C.accent, C.accentSoft, (i) => (i === 4 ? "20 €" : "20 €"));
      m += text(430, BASE + 50, "Verkaufspreis 100 €", { size: 34, weight: 700, fill: C.muted, anchor: "middle" });
      m += g(text(600, BASE - 440, "1 von 5 Blöcken", { size: 36, weight: 700, fill: C.teal }), { o: p(T, 29.2, 29.6) });
      let c = text(40, 70, "Marge", { size: 40, weight: 800, fill: C.teal });
      c += textIn(T, 29.6, 40, 180, "20 € ÷ 100 €", { size: 80, weight: 800, fill: C.navy });
      c += textIn(T, 30.6, 40, 300, "= 20 %", { size: 110, weight: 800, fill: C.teal });
      m += g(card(0, 0, 640, 350, c), { x: 1060, y: 320, o: p(T, 29.4, 29.9) });
      r += g(m, { o: km });
    }
    // Aufschlag: 80 € in vier Blöcken + 1 obendrauf
    const ka = p(T, 33.7, 34.1);
    if (ka > 0) {
      let m = blocks(300, 260, 80, p(T, 33.9, 35.2, (x) => x), [], C.ink, C.paper2, () => "20 €");
      const kt = p(T, 35.4, 36.2, easeBack);
      m += g(rect(300, BASE - 500, 260, 100, { fill: C.amberSoft, stroke: C.amber, sw: 5, rx: 8 }) + text(430, BASE - 436, "+20 €", { size: 40, weight: 800, fill: C.amber, anchor: "middle" }), { o: kt, y: (1 - kt) * -40 });
      m += text(430, BASE + 50, "Einkauf 80 €", { size: 34, weight: 700, fill: C.muted, anchor: "middle" });
      m += g(text(600, BASE - 440, "+1 Block auf 4", { size: 36, weight: 700, fill: C.amber }), { o: p(T, 36.0, 36.4) });
      let c = text(40, 70, "Aufschlag", { size: 40, weight: 800, fill: C.amber });
      c += textIn(T, 36.2, 40, 180, "20 € ÷ 80 €", { size: 80, weight: 800, fill: C.navy });
      c += textIn(T, 37.0, 40, 300, "= 25 %", { size: 110, weight: 800, fill: C.amber });
      m += g(card(0, 0, 640, 350, c), { x: 1060, y: 320, o: p(T, 36.0, 36.5) });
      r += g(m, { o: ka });
    }
    return r;
  });

  /* Szene 4a – Marge immer kleiner als Aufschlag */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Die Marge ist kleiner als der Aufschlag");
    const rows: [string, string, string][] = [
      ["Aufschlag", "Marge", ""],
      ["25 %", "20 %", "unser Beispiel"],
      ["50 %", "33,3 %", ""],
      ["100 %", "50 %", ""],
    ];
    let tb = "";
    rows.forEach(([a, m, n], i) => {
      const k = p(T, 40.8 + i * 0.7, 41.3 + i * 0.7, easeOut);
      const y = 80 + i * 110;
      const head = i === 0;
      tb += g(
        (i === 1 ? rect(20, y - 70, 1060, 100, { fill: C.goldSoft, rx: 16 }) : "") +
          text(60, y, a, { size: head ? 40 : 64, weight: 800, fill: head ? C.muted : C.amber }) +
          text(420, y, m, { size: head ? 40 : 64, weight: 800, fill: head ? C.muted : C.teal }) +
          (n ? text(760, y, n, { size: 34, weight: 700, fill: C.ink }) : ""),
        { o: k },
      );
    });
    r += g(card(0, 0, 1100, 470, tb), { x: 140, y: 280, o: p(T, 40.6, 41.1) });
    r += g(text(140, 830, "Gleiche Euro, größere Basis → kleinere Prozentzahl.", { size: 44, weight: 800, fill: C.navy }), { o: p(T, 43.8, 44.4) });
    r += kalle(1560, 820, { s: 0.85, mood: "happy", arm: "point", t: T, look: -1 });
    return r;
  });

  /* Szene 4b – Verwechslung kostet Marge */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Ziel 20 % Marge – aber 20 % aufgeschlagen");
    const k1 = p(T, 48.2, 49.0, easeOut);
    r += rect(300, BASE - 80 * SC, 260, 80 * SC, { fill: C.paper2, stroke: C.ink, sw: 6, rx: 10, o: k1 });
    r += g(text(430, BASE - 180, "80 €", { size: 52, weight: 800, fill: C.ink, anchor: "middle" }), { o: k1 });
    const k2 = p(T, 49.2, 50.0, easeOut);
    r += g(rect(300, BASE - 96 * SC, 260, 16 * SC, { fill: C.amberSoft, stroke: C.amber, sw: 6, rx: 10 }) + text(600, BASE - 88 * SC + 14, "+16 € (20 % von 80 €)", { size: 36, weight: 800, fill: C.amber }), { o: k2 });
    r += g(line(260, BASE - 100 * SC, 600, BASE - 100 * SC, { stroke: C.teal, sw: 5, dash: "12 10" }) + text(600, BASE - 100 * SC - 14, "100 € wären nötig", { size: 34, weight: 800, fill: C.teal }), { o: p(T, 50.4, 50.9) });
    r += text(430, BASE + 50, "Preis 96 €", { size: 38, weight: 800, fill: C.navy, anchor: "middle" });
    let c = text(40, 70, "Tatsächliche Marge", { size: 38, weight: 700, fill: C.muted });
    c += textIn(T, 51.2, 40, 170, "16 € ÷ 96 €", { size: 72, weight: 800, fill: C.navy });
    c += textIn(T, 52.0, 40, 280, "≈ 16,7 %", { size: 100, weight: 800, fill: C.rose });
    c += textIn(T, 52.8, 40, 340, "statt 20 % – Ziel verfehlt", { size: 36, weight: 700, fill: C.rose });
    r += g(card(0, 0, 640, 380, c), { x: 1100, y: 300, o: p(T, 51.0, 51.5) });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: Marge = Aufschlag");
    const k1 = p(T, 55.7, 56.2, easeOut);
    r += g(card(0, 0, 560, 240, text(280, 110, "20 % Marge", { size: 64, weight: 800, fill: C.teal, anchor: "middle" }) + text(280, 180, "vom Verkaufspreis", { size: 36, weight: 700, fill: C.muted, anchor: "middle" })), { x: 160, y: 360, o: k1 });
    r += g(card(0, 0, 560, 240, text(280, 110, "20 % Aufschlag", { size: 64, weight: 800, fill: C.amber, anchor: "middle" }) + text(280, 180, "auf den Einkauf", { size: 36, weight: 700, fill: C.muted, anchor: "middle" })), { x: 1200, y: 360, o: k1 });
    const ke = p(T, 56.4, 56.9, easeBack);
    r += g(text(960, 520, "=", { size: 160, weight: 800, fill: C.navy, anchor: "middle" }), { o: ke });
    const kx = p(T, 57.2, 57.7);
    r += g(line(880, 560, 1040, 400, { stroke: C.rose, sw: 14 }), { o: kx });
    r += g(text(960, 760, "Wer verwechselt, kalkuliert zu knapp.", { size: 50, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Marge und Aufschlag:", "Gleiche 20 €, zwei Prozentsätze"], 3.4);
  s += outroCard(t, 60.8, ["Marge = Rohertrag ÷ Verkaufspreis.", "Aufschlag = Rohertrag ÷ Einkauf.", "Gleiche Euro, andere Basis."], "/margenrechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "marge", duration: V.duration, render };
