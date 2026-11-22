/**
 * Rabatt und Mehrabsatz – Beispiel = Rechnerbeispiel (Modus „Rabatt in Prozent“): Preis 100 €, variable Kosten 80 €, Rabatt 10 %
 * → Beitrag 20 € auf 10 €, Absatzfaktor 2, Mehrabsatz 100 % (100 auf 200 Stück). Gegenprobe: 60 € Kosten → 33,3 % (geprüft).
 * Die Rechtecke zeigen Menge × Beitrag je Stück maßstäblich als Fläche. Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, text, textIn, p, easeOut, easeBack, kalle, bubble, card, arrow, product, stack, person,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "rabatt-mehrabsatz")!;

/** Flächenvergleich: bisherige Menge × Beitrag (links) und neue Menge × neuer Beitrag (rechts) – gleiche Fläche = gleicher Gesamtbeitrag. */
function areaPair(T: number, at: number, d0: number, d1: number, q0: number, q1: number, l0: string, l1: string) {
  const PXE = 9, PXQ = 4, base = 800;
  const k0 = p(T, at, at + 0.8, easeOut), k1 = p(T, at + 1.4, at + 4.2, (x) => x);
  let r = "";
  r += rect(160, base - d0 * PXE, q0 * PXQ * k0, d0 * PXE, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 6 });
  r += rect(800, base - d1 * PXE, q1 * PXQ * k1, d1 * PXE, { fill: C.goldSoft, stroke: C.amber, sw: 6, rx: 6 });
  r += g(text(160 + q0 * PXQ / 2, base + 56, l0, { size: 36, weight: 800, fill: C.teal, anchor: "middle" }), { o: k0 });
  r += g(text(800 + q1 * PXQ / 2, base + 56, l1, { size: 36, weight: 800, fill: C.amber, anchor: "middle" }), { o: p(T, at + 3.4, at + 4.2) });
  return r;
}

function render(t: number) {
  let s = backdrop("Rabatt & Mehrabsatz", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "10 % Rabatt – lohnt sich das?");
    r += kalle(480, 880, { mood: "happy", arm: "point", t: T });
    r += product(1150, 800, 2.1, C.teal, "100 €");
    r += g(text(1150, 560, "Preis 100 €, Kosten 80 €", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 4.4, 5) });
    r += g(g(rect(-110, -60, 220, 120, { fill: C.rose, stroke: C.ink, sw: 5, rx: 60 }) + text(0, 24, "−10 %", { size: 64, weight: 800, fill: C.white, anchor: "middle" }), { r: -8 }), { x: 1450, y: 400, o: p(T, 5.4, 6.0, easeBack) });
    return r;
  });

  /* Szene 2 – Preis, Kosten, Beitrag */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "Der Rabatt kommt aus dem Beitrag" : "Vom Beitrag bleibt die Hälfte");
    const sc = 5, base = 820;
    r += stack(260, base, 300, sc, [{ v: 80, color: C.rose, fill: C.roseSoft, label: "Kosten 80 €", o: p(T, 8.8, 9.4) }, { v: 20, color: C.teal, fill: C.tealSoft, label: "20 €", o: p(T, 9.6, 10.2) }], { labelSize: 36 });
    r += g(text(410, base + 50, "Preis 100 €", { size: 38, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 9.0, 9.6) });
    const kb = p(T, 11.0, 12.0, easeOut);
    r += g(text(560, base - 80 * sc - 20 * sc / 2 + 12, "Beitrag 20 €", { size: 40, weight: 800, fill: C.teal }), { o: p(T, 10.2, 10.8) });
    r += g(text(1100, 330, "−10 € Rabatt", { size: 56, weight: 800, fill: C.rose, anchor: "middle" }), { o: kb });
    r += arrow(760, 400, 960, 400, kb, { color: C.rose, sw: 8 });
    r += stack(1060, base, 300, sc, [{ v: 80, color: C.rose, fill: C.roseSoft, label: "Kosten 80 €", o: p(T, 12.0, 12.6) }, { v: 10, color: C.teal, fill: C.tealSoft, label: "10 €", o: p(T, 12.6, 13.2) }], { labelSize: 36 });
    r += g(text(1210, base + 50, "Preis 90 €", { size: 38, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 12.2, 12.8) });
    r += g(text(1520, base - 80 * sc - 10 * sc / 2 + 12, "Beitrag 10 €", { size: 40, weight: 800, fill: C.teal }), { o: p(T, 13.0, 13.6) });
    r += g(text(1520, 300, "halb so groß", { size: 50, weight: 800, fill: C.amber }), { o: p(T, 15.0, 15.8, easeBack) });
    return r;
  });

  /* Szene 3 – Flächen: Mehrabsatz */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 33.6 ? "Gleicher Gesamtbeitrag: doppelt so viele Stück" : "Gegenprobe: nur 60 € Kosten");
    if (T < 33.6) {
      r += areaPair(T, 21.0, 20, 10, 100, 200, "100 Stück × 20 € = 2.000 €", "200 Stück × 10 € = 2.000 €");
      r += g(card(0, 0, 640, 170, textIn(T, 27.6, 40, 80, "100 → 200 Stück", { size: 64, weight: 800, fill: C.navy }) + textIn(T, 29.4, 40, 142, "= 100 % Mehrabsatz", { size: 44, weight: 800, fill: C.rose })), { x: 1100, y: 300, o: p(T, 27.4, 28.0) });
    } else {
      r += areaPair(T, 34.0, 40, 30, 100, 400 / 3, "100 Stück × 40 € = 4.000 €", "133,3 Stück × 30 € = 4.000 €");
      r += g(card(0, 0, 640, 170, textIn(T, 38.0, 40, 80, "100 → 133,3 Stück", { size: 56, weight: 800, fill: C.navy }) + textIn(T, 38.6, 40, 142, "= 33,3 % Mehrabsatz", { size: 44, weight: 800, fill: C.rose })), { x: 1100, y: 300, o: p(T, 37.8, 38.4) });
    }
    return r;
  });

  /* Szene 4a – kleiner Beitrag, mehr Mehrabsatz */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Je kleiner der Beitrag, desto mehr Mehrabsatz");
    const rows: [string, number, string, string, number][] = [["Kosten 80 €: Beitrag 20 €", 100, "+100 %", C.rose, 41.2], ["Kosten 60 €: Beitrag 40 €", 100 / 3, "+33,3 %", C.teal, 43.4]];
    rows.forEach(([l, v, lab, col, at], i) => {
      const y = 380 + i * 200, k = p(T, at, at + 1.4, easeOut);
      r += text(140, y - 24, l, { size: 40, weight: 800, fill: C.navy });
      r += rect(140, y, v * 11 * k, 100, { fill: col === C.rose ? C.roseSoft : C.tealSoft, stroke: col, sw: 6, rx: 12 });
      r += g(text(140 + v * 11 * k + 28, y + 72, lab, { size: 62, weight: 800, fill: col }), { o: k });
    });
    r += g(text(140, 880, "Rabatt jeweils 10 % auf 100 €", { size: 34, weight: 600, fill: C.muted }), { o: p(T, 45.4, 46) });
    return r;
  });

  /* Szene 4b – Nachfrage ist Annahme */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Ob die Kunden kommen, ist deine Annahme");
    r += kalle(420, 880, { mood: "thinking", arm: "think", t: T });
    for (let i = 0; i < 5; i++) r += person(900 + i * 190, 800, 1.1, C.teal, 0.35 * p(T, 48.6 + i * 0.4, 49.2 + i * 0.4));
    r += g(text(1150, 560, "? ? ? ? ?", { size: 90, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 50.6, 51.2) });
    r += bubble(T, 51.6, 55.0, 1000, 260, 780, ["Der Rechner kennt deine", "Nachfrage nicht."], { size: 44, tail: "left" });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: 10 % Rabatt = 10 % mehr Absatz");
    r += g(card(0, 0, 560, 240, text(280, 90, "Rabatt", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(280, 190, "−10 %", { size: 100, weight: 800, fill: C.rose, anchor: "middle" })), { x: 200, y: 330, o: p(T, 55.9, 56.4) });
    r += g(text(960, 500, "≠", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 56.6, 57.2, easeBack) });
    r += g(card(0, 0, 560, 240, text(280, 90, "nötiger Absatz", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(280, 190, "+10 %", { size: 100, weight: 800, fill: C.teal, anchor: "middle" }), C.tealSoft), { x: 1160, y: 330, o: p(T, 57.0, 57.5) });
    r += g(text(960, 760, "Es ist immer mehr als 10 %.", { size: 46, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Rabatt und Mehrabsatz:", "Wie viel mehr musst du verkaufen?"], 3.4);
  s += outroCard(t, 60.8, ["Ein Rabatt senkt den Beitrag je Stück.", "Der Mehrabsatz muss den Beitrag", "ausgleichen – und zwar mehr als der Rabatt."], "/rabatt-mehrabsatz-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "rabatt-mehrabsatz", duration: V.duration, render };
