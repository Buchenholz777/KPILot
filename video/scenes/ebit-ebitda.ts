/**
 * EBIT und EBITDA – Beispiel = Rechnerbeispiel: EBIT 20.000 €, Abschreibungen 10.000 € → EBITDA 30.000 €.
 * EBITDA ist ein Ergebnis, kein Geldbestand. Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, circle, path, line, text, textIn, p, easeOut, easeBack, kalle, bubble, card, arrow, person, waterfall, account,
  backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "ebit-ebitda")!;

/** Schlichte Maschine (Fußpunkt x, y). */
const machine = (x: number, y: number, s = 1, o = 1) =>
  g(
    rect(-150, -40, 300, 40, { fill: C.paper2, stroke: C.ink, sw: 6, rx: 8 }) +
      rect(-110, -190, 220, 150, { fill: C.accentSoft, stroke: C.ink, sw: 6, rx: 14 }) +
      rect(30, -260, 50, 70, { fill: C.white, stroke: C.ink, sw: 6 }) +
      circle(-40, -115, 46, { fill: C.white, stroke: C.ink, sw: 6 }) +
      line(-40, -115, -40 + 30, -115 - 22, { stroke: C.accent, sw: 8 }) +
      rect(40, -150, 50, 24, { fill: C.gold, stroke: C.ink, sw: 4, rx: 6 }),
    { x, y, s, ox: 0, oy: 0, o },
  );

function render(t: number) {
  let s = backdrop("EBIT & EBITDA", "Kennzahl verstehen");

  /* Szene 1 – Problem: zwei Zahlen */
  s += scene(t, 3.2, 8.2, (lt) => {
    const T = lt + 3.2;
    let r = sceneTitle(T, 3.5, "Zwei Zahlen – wer hat recht?");
    r += kalle(520, 880, { mood: T < 5.6 ? "happy" : "thinking", arm: "point", t: T });
    r += person(1400, 880, 1.15, C.teal, p(T, 4.0, 4.6));
    r += bubble(T, 4.4, 8.1, 780, 320, 440, ["20.000 €", "EBIT"], { size: 52, tail: "left", tone: "accent" });
    r += bubble(T, 5.6, 8.1, 1180, 480, 440, ["30.000 €", "EBITDA"], { size: 52, tail: "right", tone: "teal" });
    r += g(text(960, 760, "?", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 6.6, 7.2, easeBack) });
    return r;
  });

  /* Szene 2 – EBIT: Ergebnis vor Zinsen und Steuern, Abschreibung schon abgezogen */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.4, T < 14.2 ? "EBIT: Ergebnis vor Zinsen und Steuern" : "Im EBIT schon abgezogen: die Abschreibung");
    r += g(card(0, 0, 700, 330, text(40, 80, "EBIT", { size: 44, weight: 800, fill: C.muted }) + textIn(T, 9.2, 40, 220, "20.000 €", { size: 110, weight: 800, fill: C.accent }) + textIn(T, 10.2, 40, 290, "Ergebnis des laufenden Geschäfts", { size: 34, weight: 700, fill: C.ink })), { x: 140, y: 330, o: p(T, 8.8, 9.3) });
    r += g(machine(1300, 790, 1.2), { o: p(T, 10.6, 11.2) });
    r += g(text(1300, 845, "Maschine", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 11, 11.5) });
    const k = p(T, 14.4, 15.2, easeBack);
    r += g(card(0, 0, 460, 160, text(230, 70, "Abschreibung", { size: 40, weight: 800, fill: C.amber, anchor: "middle" }) + text(230, 130, "−10.000 €", { size: 60, weight: 800, fill: C.amber, anchor: "middle" }), C.goldSoft), { x: 1070, y: 330, o: k, s: 0.85 + 0.15 * k, ox: 1300, oy: 410 });
    r += arrow(1300, 500, 1300, 545, p(T, 15.2, 15.8), { color: C.amber, sw: 8 });
    r += g(text(140, 760, "Zinsen und Steuern kommen im EBIT noch nicht vor.", { size: 38, weight: 700, fill: C.muted }), { o: p(T, 16.6, 17.2) });
    return r;
  });

  /* Szene 3 – Rechnung: EBIT + Abschreibung = EBITDA */
  s += scene(t, 20.2, 40.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27.2 ? "Abschreibung: Kaufpreis auf Jahre verteilt" : T < 33.7 ? "EBITDA = EBIT + Abschreibung" : "Beide Zahlen stimmen");
    if (T < 27.0) {
      const k = (1 - p(T, 26.6, 27.2));
      ["Jahr 1", "Jahr 2", "Jahr 3", "…"].forEach((l, i) => {
        const kk = p(T, 21.0 + i * 0.6, 21.8 + i * 0.6, easeOut);
        r += g(card(0, 0, 330, 250, text(165, 60, l, { size: 40, weight: 800, fill: C.navy, anchor: "middle" }) + text(165, 150, "−10.000 €", { size: 50, weight: 800, fill: C.amber, anchor: "middle" }) + (i < 3 ? text(165, 205, "Abschreibung", { size: 28, weight: 600, fill: C.muted, anchor: "middle" }) : "")), { x: 150 + i * 420, y: 340, o: kk * k });
      });
      r += g(machine(280, 850, 0.7), { o: p(T, 22, 22.6) * k });
      r += g(text(520, 720, "Der Kaufpreis wurde einmal bezahlt.", { size: 42, weight: 800, fill: C.ink }) + text(520, 780, "In diesem Jahr fließt dafür kein Geld ab.", { size: 42, weight: 800, fill: C.amber }), { o: p(T, 23.6, 24.4) * k });
    } else if (T < 33.5) {
      r += waterfall(T, 27.4, [
        { label: "EBIT", value: 20000, total: true, color: C.accent, fill: C.accentSoft },
        { label: "+ Abschreibung", value: 10000, color: C.amber, fill: C.goldSoft },
        { label: "= EBITDA", value: 30000, total: true, color: C.teal, fill: C.tealSoft },
      ], { x: 360, y: 300, w: 1200, h: 460, max: 30000, step: 1.3 });
    } else {
      const k = p(T, 33.8, 34.4, easeOut);
      r += g(card(0, 0, 640, 380, text(40, 80, "EBIT", { size: 44, weight: 800, fill: C.accent }) + text(40, 190, "20.000 €", { size: 100, weight: 800, fill: C.accent }) + text(40, 270, "berücksichtigt den", { size: 36, weight: 700, fill: C.ink }) + text(40, 320, "Werteverbrauch der Maschine", { size: 36, weight: 700, fill: C.ink })), { x: 200, y: 330, o: k });
      r += g(card(0, 0, 640, 380, text(40, 80, "EBITDA", { size: 44, weight: 800, fill: C.teal }) + text(40, 190, "30.000 €", { size: 100, weight: 800, fill: C.teal }) + text(40, 270, "blendet die Abschreibung", { size: 36, weight: 700, fill: C.ink }) + text(40, 320, "bewusst aus", { size: 36, weight: 700, fill: C.ink })), { x: 1080, y: 330, o: p(T, 35.4, 36.0, easeOut) });
    }
    return r;
  });

  /* Szene 4a – Vergleich (Schema) */
  s += scene(t, 40.2, 47.7, (lt) => {
    const T = lt + 40.2;
    let r = sceneTitle(T, 40.4, "Vergleich: wenig oder viele Maschinen");
    const W0 = 1000;
    const row = (y: number, label: string, ebit: number, afa: number, k: number) => {
      const tot = ebit + afa;
      return (
        text(140, y - 26, label, { size: 40, weight: 800, fill: C.navy }) +
        rect(140, y, W0 * tot * k, 90, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 12 }) +
        g(text(140 + W0 * tot * k + 24, y + 62, "EBITDA", { size: 38, weight: 800, fill: C.teal }), { o: k }) +
        rect(140, y + 120, W0 * ebit * k, 90, { fill: C.accentSoft, stroke: C.accent, sw: 6, rx: 12 }) +
        g(rect(140 + W0 * ebit * k, y + 120, W0 * afa * k, 90, { fill: C.goldSoft, stroke: C.amber, sw: 6, rx: 12, dash: "14 10" }), { o: k }) +
        g(text(140 + W0 * tot * k + 24, y + 182, "EBIT + Abschreibung", { size: 34, weight: 700, fill: C.muted }), { o: k })
      );
    };
    r += row(330, "Firma A: wenig Maschinen", 0.5, 0.12, p(T, 41, 42.4, easeOut));
    r += row(620, "Firma B: viele Maschinen", 0.24, 0.38, p(T, 43.6, 45, easeOut));
    r += g(text(960, 858, "Schema ohne Maßstab – gleiches EBITDA, aber unterschiedliches EBIT", { size: 32, weight: 600, fill: C.muted, anchor: "middle" }), { o: p(T, 45.4, 46) });
    return r;
  });

  /* Szene 4b – Maschinen müssen ersetzt werden */
  s += scene(t, 47.7, 55.2, (lt) => {
    const T = lt + 47.7;
    let r = sceneTitle(T, 47.9, "Der Verschleiß bleibt trotzdem ein Kostenfaktor");
    const old = 1 - p(T, 51.0, 52.0);
    r += g(machine(480, 820, 1.2), { o: old, y: p(T, 51.0, 52.0) * 60 });
    r += g(machine(1380, 820, 1.2), { o: p(T, 51.8, 52.6, easeOut) });
    r += arrow(760, 640, 1100, 640, p(T, 50.6, 51.6), { color: C.muted, sw: 8 });
    r += g(text(480, 880, "alte Maschine", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 48.6, 49.2) });
    r += g(text(1380, 880, "Ersatz kostet Geld", { size: 38, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 52.4, 53) });
    r += g(card(0, 0, 700, 120, text(350, 76, "EBIT zeigt diese Kosten, EBITDA nicht", { size: 36, weight: 800, fill: C.navy, anchor: "middle" })), { x: 610, y: 250, o: p(T, 53.0, 53.6) });
    return r;
  });

  /* Szene 5 – Irrtum: EBITDA ≠ Kontostand */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum: EBITDA = Geld auf dem Konto");
    r += g(account(220, 360, "Konto", "?", { w: 520, tone: C.muted, sub: "Bestand an einem Tag" }), { o: p(T, 55.9, 56.4) });
    r += g(card(0, 0, 520, 200, text(40, 66, "EBITDA – ein Ergebnis", { size: 36, weight: 800, fill: C.teal }) + text(40, 150, "30.000 €", { size: 76, weight: 800, fill: C.teal }), C.tealSoft), { x: 1100, y: 360, o: p(T, 56.6, 57.1) });
    r += g(text(960, 500, "≠", { size: 200, weight: 800, fill: C.rose, anchor: "middle" }), { o: p(T, 57.4, 58.0, easeBack) });
    r += g(text(960, 760, "Ergebnis eines Zeitraums ≠ Kontostand", { size: 46, weight: 800, fill: C.navy, anchor: "middle" }), { o: p(T, 58.2, 58.8) });
    return r;
  }, 0.35);

  s += titleCard(t, "Kennzahl in 60 Sekunden", ["EBIT und EBITDA:", "Was ist der Unterschied?"], 3.4);
  s += outroCard(t, 60.8, ["EBITDA = EBIT + Abschreibungen –", "ein Ergebnis, kein Kontostand."], "/ebitda-rechner/");
  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "ebit-ebitda", duration: V.duration, render };
void path;
