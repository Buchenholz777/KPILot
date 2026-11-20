/**
 * Deckungsbeitrag – Beispiel = Rechnerbeispiel: Preis 50 €, variable Kosten 30 €, 100 Stück
 * → 20 € je Stück, 2.000 € gesamt, Quote 40 %. Aufteilung der 30 € in Material/Verpackung ist illustrativ.
 * Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, path, line, text, textIn, p, easeOut, lerp, eur, num, kalle, bubble, coin, product, card, arrow,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, stack, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "deckungsbeitrag")!;
const SC = 10; // 10 px je Euro
const BASE = 820;

function render(t: number) {
  let s = backdrop("Deckungsbeitrag", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Was bleibt von 50 € übrig?");
    r += kalle(560, 880, { mood: T < 5.6 ? "happy" : "thinking", arm: T < 5.6 ? "hold" : "think", t: T });
    r += g(product(0, 0, 1.4, C.teal, "50 €"), { x: 760, y: 790, o: p(T, 3.6, 4.1) });
    const k = p(T, 4.6, 5.4, easeOut);
    r += stack(1150, BASE, 220, SC * k, [{ v: 50, color: C.accent, fill: C.accentSoft, label: "50 €" }], { labelSize: 60 });
    r += g(text(1260, 870, "Preis je Stück", { size: 34, weight: 700, fill: C.muted, anchor: "middle" }), { o: k });
    r += bubble(T, 5.8, 8.1, 1430, 330, 400, ["Alles meins?"], { size: 50, tail: "left" });
    return r;
  });

  /* Szene 2 – Intuition: variable Kosten fallen weg, der Rest deckt Fixkosten */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Jedes Stück kostet variabel Geld" : "Der Rest hilft, die Fixkosten zu zahlen");
    const kOff = p(T, 9.6, 11.2, easeOut);
    const kTo = p(T, 15.0, 16.6, easeOut);
    r += stack(560, BASE, 220, SC, [
      { v: 22, color: C.rose, fill: C.roseSoft, label: "22 €", dx: kOff * 360, dy: 0 },
      { v: 8, color: C.rose, fill: C.roseSoft, label: "8 €", dx: kOff * 360, dy: -kOff * 40 },
      { v: 20, color: C.teal, fill: C.tealSoft, label: "20 €", dx: kTo * 760, dy: lerp(0, 300, kTo) - Math.sin(kTo * Math.PI) * 80, o: 1 - p(T, 16.6, 17.0) },
    ]);
    r += g(text(670, 870, "Preis 50 €", { size: 34, weight: 700, fill: C.muted, anchor: "middle" }), { o: 1 - kOff });
    r += g(text(1150, 640, "Material", { size: 34, weight: 700, fill: C.rose }) + text(1150, 535, "Verpackung", { size: 34, weight: 700, fill: C.rose }) + text(920, 400, "variable Kosten: 30 €", { size: 44, weight: 800, fill: C.rose }) + text(920, 445, "(Aufteilung als Beispiel)", { size: 28, weight: 600, fill: C.muted }), { o: p(T, 11.0, 11.6) * (1 - p(T, 14.0, 14.4)) });
    // Fixkostenblock rechts
    const kf = p(T, 14.4, 15.0);
    let fx = text(30, 60, "Fixkosten", { size: 40, weight: 800, fill: C.navy });
    ["Miete", "Software", "Gehälter"].forEach((l, i) => (fx += rect(30, 90 + i * 70, 300, 54, { fill: C.paper2, stroke: C.line, sw: 3, rx: 10 }) + text(50, 128 + i * 70, l, { size: 32, weight: 700, fill: C.ink })));
    r += g(card(0, 0, 360, 330, fx), { x: 1360, y: 300, o: kf });
    r += g(rect(1330, 650, 420, 130, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 18 }) + text(1540, 735, "+20 € Beitrag", { size: 46, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 16.6, 17.1) });
    r += g(arrow(1540, 650, 1540, 640, 1, { color: C.teal }) + text(1540, 860, "„Deckungsbeitrag“", { size: 36, weight: 700, fill: C.teal, anchor: "middle" }), { o: p(T, 17.2, 17.8) });
    return r;
  });

  /* Szene 3 – Rechnung, Menge, Quote */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 26.7 ? "Deckungsbeitrag pro Stück" : T < 33.2 ? "100 Stück, 100 Beiträge" : "Als Quote: 40 % vom Preis");
    // Säule links (bleibt die ganze Szene)
    r += stack(220, BASE, 200, SC, [
      { v: 30, color: C.rose, fill: C.roseSoft, label: "30 €" },
      { v: 20, color: C.teal, fill: C.tealSoft, label: "20 €" },
    ]);
    r += g(path(`M 440 ${BASE - 500} l 26 0 l 0 500 l -26 0`, { stroke: C.ink, sw: 4 }) + text(480, BASE - 240, "50 €", { size: 40, weight: 800, fill: C.accent }), { o: p(T, 20.6, 21.2) });
    // Formel
    const kf = p(T, 20.8, 21.4) * (1 - p(T, 26.5, 26.9));
    let f = text(40, 70, "Deckungsbeitrag je Stück", { size: 36, weight: 700, fill: C.muted });
    f += textIn(T, 21.4, 40, 190, "50 € − 30 € = ", { size: 96, weight: 800, fill: C.navy });
    f += textIn(T, 22.6, 700, 190, "20 €", { size: 110, weight: 800, fill: C.teal });
    f += textIn(T, 23.2, 40, 260, "Preis − variable Kosten", { size: 32, weight: 600, fill: C.muted });
    r += g(card(0, 0, 1000, 300, f), { x: 680, y: 300, o: kf });
    // 100 Stück als 10×10 Raster
    const kg = p(T, 26.7, 27.2) * (1 - p(T, 32.9, 33.3));
    if (kg > 0) {
      let gr = "";
      const n = Math.min(100, Math.floor(p(T, 27.0, 30.0, (x) => x) * 100));
      for (let i = 0; i < 100; i++) {
        const cx = 700 + (i % 10) * 52, cy = 300 + Math.floor(i / 10) * 52;
        gr += rect(cx, cy, 44, 44, { fill: i < n ? C.tealSoft : C.white, stroke: i < n ? C.teal : C.line, sw: 3, rx: 8 });
      }
      gr += text(1300, 400, "je Kästchen 20 €", { size: 34, weight: 700, fill: C.muted });
      gr += text(1300, 490, `${num(n)} × 20 €`, { size: 60, weight: 800, fill: C.navy });
      gr += text(1300, 580, `= ${eur(n * 20)}`, { size: 72, weight: 800, fill: C.teal });
      gr += g(text(1300, 650, "Gesamtdeckungsbeitrag", { size: 34, weight: 700, fill: C.teal }), { o: p(T, 30.0, 30.5) });
      r += g(gr, { o: kg });
    }
    // Quote
    const kq = p(T, 33.2, 33.8);
    if (kq > 0) {
      let q = "";
      q += rect(700, 360, 1000, 90, { fill: C.roseSoft, stroke: C.rose, sw: 5, rx: 14 });
      const w = 400 * p(T, 34.0, 35.2, easeOut);
      q += rect(1300 + (400 - w), 360, w, 90, { fill: C.tealSoft, stroke: C.teal, sw: 5, rx: 14 });
      q += text(1000, 420, "60 % variable Kosten", { size: 36, weight: 800, fill: C.rose, anchor: "middle" });
      q += g(text(1500, 420, "40 %", { size: 44, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 35, 35.4) });
      q += textIn(T, 35.6, 700, 560, "20 € ÷ 50 € = 40 %", { size: 76, weight: 800, fill: C.navy });
      q += textIn(T, 36.6, 700, 650, "Von jedem Euro Umsatz bleiben", { size: 40, weight: 600, fill: C.ink });
      q += textIn(T, 36.8, 700, 705, "40 Cent zur Deckung.", { size: 40, weight: 800, fill: C.teal });
      q += g(coin(1600, 640, 60), { o: p(T, 37, 37.5) });
      r += g(q, { o: kq });
    }
    return r;
  });

  /* Szene 4a – Höhe des Deckungsbeitrags */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Wie viel trägt ein Verkauf bei?");
    const items: [number, string, string][] = [
      [30, "+20 €", "füllt schnell"],
      [45, "+5 €", "füllt langsam"],
      [55, "−5 €", "Verlust wächst"],
    ];
    const base = 760, S = 8;
    r += line(200, base - 50 * S, 1560, base - 50 * S, { stroke: C.accent, sw: 4, dash: "12 10" });
    r += text(1560, base - 50 * S - 16, "Preis 50 €", { size: 32, weight: 800, fill: C.accent, anchor: "end" });
    items.forEach(([v, lbl, sub], i) => {
      const k = p(T, 40.8 + i * 1.2, 41.6 + i * 1.2, easeOut);
      const x = 300 + i * 440;
      r += g(rect(x, base - v * S, 200, v * S, { fill: C.roseSoft, stroke: C.rose, sw: 6, rx: 10 }) + text(x + 100, base - 40, `${v} €`, { size: 40, weight: 800, fill: C.rose, anchor: "middle" }) + text(x + 100, base - 90, "variabel", { size: 28, weight: 700, fill: C.rose, anchor: "middle" }), { o: k });
      const db = 50 - v;
      if (db > 0) r += g(rect(x, base - 50 * S, 200, db * S, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 10 }), { o: k });
      else r += g(rect(x - 12, base - v * S, 224, -db * S, { fill: "url(#hatchRose)", stroke: C.rose, sw: 6, rx: 6 }), { o: k });
      r += g(text(x + 100, base + 60, `DB ${lbl}`, { size: 44, weight: 800, fill: db > 0 ? C.teal : C.rose, anchor: "middle" }) + text(x + 100, base + 104, sub, { size: 32, weight: 700, fill: C.muted, anchor: "middle" }), { o: k });
    });
    return r;
  });

  /* Szene 4b – Rabatt halbiert den Deckungsbeitrag */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "10 € Rabatt: halber Deckungsbeitrag");
    const kr = p(T, 49.2, 50.6, easeOut);
    r += stack(300, BASE, 220, SC, [{ v: 30, color: C.rose, fill: C.roseSoft, label: "30 €" }, { v: 20, color: C.teal, fill: C.tealSoft, label: "20 €" }]);
    r += text(410, 870, "vorher", { size: 34, weight: 700, fill: C.muted, anchor: "middle" });
    r += stack(800, BASE, 220, SC, [
      { v: 30, color: C.rose, fill: C.roseSoft, label: "30 €" },
      { v: 20 - 10 * kr, color: C.teal, fill: C.tealSoft, label: kr > 0.98 ? "10 €" : "" },
      { v: 10 * kr, color: C.amber, fill: C.amberSoft, label: kr > 0.7 ? "−10 €" : "", dx: kr * 60, o: 0.9 },
    ]);
    r += text(910, 870, "mit Rabatt", { size: 34, weight: 700, fill: C.muted, anchor: "middle" });
    const kt = p(T, 50.8, 51.4, easeOut);
    let c = text(40, 70, "Preis 40 € statt 50 €", { size: 40, weight: 800, fill: C.navy });
    c += text(40, 140, "Deckungsbeitrag 10 € statt 20 €", { size: 40, weight: 700, fill: C.ink });
    c += text(40, 220, "−20 % Preis = −50 % Beitrag", { size: 46, weight: 800, fill: C.amber });
    r += g(card(0, 0, 760, 270, c), { x: 1100, y: 320, o: kt });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: Deckungsbeitrag = Gewinn");
    const rows: [string, string, string, number][] = [
      ["Deckungsbeitrag (100 Stück)", "2.000 €", C.teal, 55.8],
      ["− Fixkosten im Monat", "3.000 €", C.rose, 56.8],
      ["= Gewinn", "−1.000 €", C.rose, 57.9],
    ];
    let c = "";
    rows.forEach(([l, v, col, at], i) => {
      c += textIn(T, at, 50, 110 + i * 110, l, { size: 46, weight: i === 2 ? 800 : 700, fill: C.ink });
      c += textIn(T, at, 1010, 110 + i * 110, v, { size: 56, weight: 800, fill: col, anchor: "end" });
    });
    c += g(line(50, 250, 1010, 250, { stroke: C.ink, sw: 5 }), { o: p(T, 57.6, 57.9) });
    r += g(card(0, 0, 1060, 380, c), { x: 140, y: 300, o: p(T, 55.6, 56.1) });
    r += g(text(140, 790, "Erst nach den Fixkosten zeigt sich, ob Gewinn bleibt.", { size: 44, weight: 800, fill: C.navy }), { o: p(T, 58.6, 59.2) });
    r += kalle(1560, 760, { s: 0.85, mood: T > 58 ? "surprised" : "thinking", arm: "think", t: T, look: -1 });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Deckungsbeitrag:", "Was bleibt pro Verkauf übrig?"], 3.4);
  s += outroCard(t, 60.8, ["Deckungsbeitrag = Preis", "− variable Kosten.", "Gewinn erst nach Fixkosten."], "/deckungsbeitragsrechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "deckungsbeitrag", duration: V.duration, render };
