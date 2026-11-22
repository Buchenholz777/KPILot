/**
 * CLV und CAC – Beispiel = Rechnerbeispiel (CLV): Bestellwert 50 €, 4 Käufe pro Jahr, 3 Jahre, Deckungsbeitragsquote 40 % → CLV 240 €.
 * CAC: (2.000 € Marketing + 1.000 € Vertrieb) / 30 Neukunden = 100 €. CLV − CAC = 140 €, Verhältnis 2,4.
 * Zweite Annahme: 2 Käufe pro Jahr → CLV 120 € (geprüft). Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, text, textIn, p, easeOut, easeBack, kalle, bubble, coin, card, arrow, person, waterfall, stack,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "clv-cac")!;

function render(t: number) {
  let s = backdrop("CLV & CAC", "Kennzahl verstehen");

  /* Szene 1 – Problem */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Was kostet ein neuer Kunde – was bringt er?");
    r += kalle(420, 880, { mood: T < 6 ? "happy" : "thinking", arm: "point", t: T });
    r += person(1350, 880, 1.3, C.teal, p(T, 4.4, 5.0));
    for (let i = 0; i < 5; i++) {
      const k = p(T, 4.0 + i * 0.25, 4.9 + i * 0.25, easeOut);
      if (k > 0 && k < 1) r += coin(640 + k * 560, 640 - Math.sin(k * Math.PI) * 130, 28);
    }
    r += g(text(930, 500, "Werbung und Vertrieb", { size: 40, weight: 800, fill: C.muted, anchor: "middle" }), { o: p(T, 4.6, 5.2) });
    r += bubble(T, 6.0, 8.1, 1500, 360, 360, ["Lohnt sich", "das?"], { size: 46, tail: "left" });
    return r;
  });

  /* Szene 2 – CAC, dann CLV-Idee */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "CAC: Kosten je neuem Kunden" : "CLV: Beitrag über die ganze Beziehung");
    if (T < 14.0) {
      let c = text(50, 80, "Marketing 2.000 € + Vertrieb 1.000 € = 3.000 €", { size: 38, weight: 700, fill: C.ink });
      c += textIn(T, 9.6, 50, 220, "3.000 € ÷ 30 Neukunden", { size: 84, weight: 800, fill: C.navy });
      c += textIn(T, 11.2, 50, 350, "= 100 € CAC", { size: 120, weight: 800, fill: C.rose });
      r += g(card(0, 0, 1260, 420, c), { x: 330, y: 320, o: p(T, 8.8, 9.3) * (1 - p(T, 13.7, 14.0)) });
    } else {
      const yrs = [0, 1, 2];
      r += g(person(300, 800, 1.2, C.teal), { o: p(T, 14.4, 15.0) });
      yrs.forEach((i) => {
        const k = p(T, 15.2 + i * 1.2, 15.9 + i * 1.2, easeOut);
        r += g(card(0, 0, 340, 230, text(170, 70, `Jahr ${i + 1}`, { size: 40, weight: 800, fill: C.navy, anchor: "middle" }) + text(170, 150, "4 Käufe à 50 €", { size: 38, weight: 700, fill: C.ink, anchor: "middle" }) + text(170, 200, "Beitrag 40 %", { size: 30, weight: 600, fill: C.muted, anchor: "middle" })), { x: 560 + i * 400, y: 380, o: k });
      });
    }
    return r;
  });

  /* Szene 3 – CLV rechnen */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.1 ? "12 Käufe à 50 € = 600 € Umsatz" : T < 33.6 ? "40 % bleiben als Deckungsbeitrag" : "CLV minus CAC");
    if (T < 27.0) {
      for (let y = 0; y < 3; y++) for (let q = 0; q < 4; q++) {
        const i = y * 4 + q, k = p(T, 21.0 + i * 0.33, 21.5 + i * 0.33, easeBack);
        r += g(rect(0, 0, 150, 90, { fill: C.accentSoft, stroke: C.accent, sw: 5, rx: 14 }) + text(75, 62, "50 €", { size: 42, weight: 800, fill: C.accent, anchor: "middle" }), { x: 200 + q * 180, y: 320 + y * 130, o: k, s: 0.8 + 0.2 * k, ox: 275 + q * 180, oy: 365 + y * 130 });
      }
      for (let y = 0; y < 3; y++) r += g(text(950, 380 + y * 130, `Jahr ${y + 1}`, { size: 40, weight: 700, fill: C.muted }), { o: p(T, 21 + y * 1.3, 21.6 + y * 1.3) });
      r += g(text(1120, 470, "= 600 € Umsatz", { size: 76, weight: 800, fill: C.navy }), { o: p(T, 25.2, 25.9) });
    } else if (T < 33.5) {
      const sc = 0.5, base = 800;
      r += stack(360, base, 420, sc, [
        { v: 360, color: C.rose, fill: C.roseSoft, label: "60 % variable Kosten", o: p(T, 27.8, 28.4) },
        { v: 240, color: C.teal, fill: C.tealSoft, label: "40 % Beitrag", o: p(T, 28.6, 29.2) },
      ], { labelSize: 34 });
      r += g(text(570, base + 50, "600 € Umsatz", { size: 38, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 27.6, 28.2) });
      r += g(card(0, 0, 760, 260, textIn(T, 29.6, 40, 100, "600 € × 0,4", { size: 70, weight: 800, fill: C.navy }) + textIn(T, 30.8, 40, 220, "= 240 € CLV", { size: 100, weight: 800, fill: C.teal })), { x: 1000, y: 400, o: p(T, 29.4, 30.0) });
    } else {
      r += waterfall(T, 34.2, [
        { label: "CLV", value: 240, total: true, color: C.teal, fill: C.tealSoft },
        { label: "− CAC", value: -100, color: C.rose, fill: C.roseSoft },
        { label: "= Beitrag je Kunde", value: 140, total: true, color: C.amber, fill: C.goldSoft },
      ], { x: 300, y: 300, w: 1000, h: 460, max: 240, step: 1.4 });
      r += g(card(0, 0, 400, 220, text(200, 80, "CLV ÷ CAC", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }) + text(200, 180, "2,4", { size: 110, weight: 800, fill: C.accent, anchor: "middle" })), { x: 1400, y: 380, o: p(T, 37.4, 38.0) });
    }
    return r;
  });

  /* Szene 4a – Zeitpunkt */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Wichtig: Das Geld kommt später als die Kosten");
    r += g(card(0, 0, 520, 240, text(40, 80, "Heute", { size: 40, weight: 700, fill: C.muted }) + text(40, 180, "−100 € CAC", { size: 76, weight: 800, fill: C.rose }), C.roseSoft), { x: 200, y: 400, o: p(T, 41.0, 41.6) });
    r += arrow(750, 520, 1000, 520, p(T, 42.2, 43.0), { color: C.muted, sw: 8 });
    [0, 1, 2].forEach((i) => (r += g(coin(1130 + i * 150, 520, 46) + text(1130 + i * 150, 620, `Jahr ${i + 1}`, { size: 34, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 43.2 + i * 0.9, 43.8 + i * 0.9) })));
    r += g(text(1280, 360, "bis zu 240 € über drei Jahre", { size: 40, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 45.6, 46.2) });
    return r;
  });

  /* Szene 4b – Modell, andere Annahme */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Ein Modell: andere Annahmen, anderer Wert");
    const sc = 1.6, base = 820;
    r += stack(420, base, 300, sc, [{ v: 240, color: C.teal, fill: C.tealSoft, label: "240 €", o: p(T, 48.4, 49.0) }], { labelSize: 52 });
    r += g(text(570, base + 50, "4 Käufe pro Jahr", { size: 36, weight: 800, fill: C.ink, anchor: "middle" }), { o: p(T, 48.6, 49.2) });
    r += stack(1060, base, 300, sc, [{ v: 120, color: C.amber, fill: C.goldSoft, label: "120 €", o: p(T, 50.4, 51.0) }], { labelSize: 52 });
    r += g(text(1210, base + 50, "2 Käufe pro Jahr", { size: 36, weight: 800, fill: C.ink, anchor: "middle" }), { o: p(T, 50.6, 51.2) });
    r += g(text(1210, base - 120 * sc - 30, "CLV halbiert sich", { size: 38, weight: 800, fill: C.amber, anchor: "middle" }), { o: p(T, 52.0, 52.6) });
    return r;
  });

  /* Szene 5 – Irrtum */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: CLV = Umsatz");
    r += g(card(0, 0, 560, 240, text(280, 90, "Umsatz", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(280, 190, "600 €", { size: 100, weight: 800, fill: C.accent, anchor: "middle" })), { x: 200, y: 330, o: p(T, 55.9, 56.4) });
    r += g(text(960, 500, "≠", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 56.6, 57.2, easeBack) });
    r += g(card(0, 0, 560, 240, text(280, 90, "CLV (Beitrag)", { size: 44, weight: 800, fill: C.muted, anchor: "middle" }) + text(280, 190, "240 €", { size: 100, weight: 800, fill: C.teal, anchor: "middle" }), C.tealSoft), { x: 1160, y: 330, o: p(T, 57.0, 57.5) });
    r += g(text(960, 760, "Gemeint ist der Beitrag nach variablen Kosten.", { size: 44, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 58.0, 58.6) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["CLV und CAC:", "Lohnt sich ein neuer Kunde?"], 3.4);
  s += outroCard(t, 60.8, ["CLV = Beitrag über die Beziehung,", "CAC = Kosten der Gewinnung.", "Beide gehören zusammen."], "/clv-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "clv-cac", duration: V.duration, render };
