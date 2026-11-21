/**
 * Break-even – Referenzvideo (Qualitätsmaßstab für alle weiteren Videos).
 * Beispiel = Rechnerbeispiel: Preis 50 €, variable Kosten 30 €, Fixkosten 3.000 €/Monat → DB 20 €, 150 Stück.
 * Storyboard: docs/VIDEOS.md
 */
import { VIDEOS } from "../../src/data/videos.ts";
import {
  C, g, rect, circle, path, line, text, textIn, p, vis, easeOut, easeBack, clamp, lerp, eur, num, kalle, bubble,
  coin, product, card, arrow, backdrop, titleCard, outroCard, sceneTitle, scene, narration, type VideoDef,
} from "../engine.ts";

const V = VIDEOS.find((v) => v.id === "break-even")!;
const P = 50, VC = 30, F = 3000, DB = P - VC, Q = F / DB; // 20 €, 150 Stück

/* Behälter „Fixkosten-Topf“ – wird mit 20-€-Beiträgen gefüllt. */
function pot(x: number, y: number, w: number, h: number, fill: number, label = true) {
  let s = rect(x, y, w, h, { fill: C.white, stroke: C.ink, sw: 6, rx: 30 });
  const fh = (h - 16) * clamp(fill);
  s += rect(x + 8, y + h - 8 - fh, w - 16, fh, { fill: "url(#hatchTeal)", rx: 22 });
  for (let i = 1; i < 6; i++) s += line(x + w - 46, y + (h * i) / 6, x + w - 14, y + (h * i) / 6, { stroke: C.line, sw: 4 });
  if (label) {
    s += text(x + w / 2, y - 82, "Fixkosten pro Monat", { size: 36, weight: 700, fill: C.muted, anchor: "middle" });
    s += text(x + w / 2, y - 22, eur(F), { size: 60, weight: 800, fill: C.navy, anchor: "middle" });
  }
  return s;
}

/* Rechnungszettel (Fixkostenposten). */
const bill = (x: number, y: number, label: string, amount: string, o = 1) =>
  g(card(0, 0, 440, 96, text(28, 60, label, { size: 36, weight: 700 }) + text(412, 60, amount, { size: 36, weight: 800, fill: C.rose, anchor: "end" })), { x, y, o });

/* Diagramm Umsatz vs. Gesamtkosten (Stück 0…250). */
const X0 = 300, X1 = 1460, Y0 = 740, Y1 = 270, QMAX = 250, EMAX = 12500;
const sx = (q: number) => X0 + (q / QMAX) * (X1 - X0);
const sy = (e: number) => Y0 - (e / EMAX) * (Y0 - Y1);

function chart(t: number, price: number) {
  const qBe = F / (price - VC);
  let s = "";
  // Achsen & Raster
  for (let e = 0; e <= EMAX; e += 2500) {
    s += line(X0, sy(e), X1, sy(e), { stroke: e ? "#DCE2EE" : C.ink, sw: e ? 2 : 5 });
    s += text(X0 - 20, sy(e) + 12, e ? `${num(e)} €` : "0 €", { size: 30, weight: 600, fill: C.muted, anchor: "end" });
  }
  for (let q = 0; q <= QMAX; q += 50) {
    s += line(sx(q), Y0, sx(q), Y0 + 14, { stroke: C.ink, sw: 4 });
    s += text(sx(q), Y0 + 50, num(q), { size: 32, weight: 600, fill: C.muted, anchor: "middle" });
  }
  s += text(X1, Y0 + 98, "verkaufte Stück pro Monat", { size: 30, weight: 600, fill: C.muted, anchor: "end" });

  // Flächen Verlust / Gewinn (ab 40 s)
  const kz = p(t, 40.4, 41.6);
  if (kz > 0) {
    const cost = (q: number) => F + VC * q, rev = (q: number) => price * q;
    const loss = `M ${sx(0)} ${sy(cost(0))} L ${sx(qBe)} ${sy(cost(qBe))} L ${sx(0)} ${sy(rev(0))} Z`;
    const gain = `M ${sx(qBe)} ${sy(cost(qBe))} L ${sx(QMAX)} ${sy(rev(QMAX))} L ${sx(QMAX)} ${sy(cost(QMAX))} Z`;
    s += path(loss, { fill: "url(#hatchRose)", o: kz * 0.9 });
    s += path(gain, { fill: "url(#hatchTeal)", o: kz * 0.95 });
    s += g(text(sx(qBe * 0.42), sy(cost(qBe * 0.42)) - 30, "Verlust", { size: 44, weight: 800, fill: C.rose, anchor: "middle", halo: C.white }), { o: kz });
    s += g(text(sx(QMAX - 22), sy(cost(QMAX - 22)) - 120, "Gewinn", { size: 44, weight: 800, fill: C.teal, anchor: "end" }), { o: kz });
  }

  // Linien, progressiv gezeichnet
  const kc = p(t, 33.4, 35.2), kr = p(t, 34.0, 35.8);
  const qc = QMAX * kc, qr = QMAX * kr;
  s += path(`M ${sx(0)} ${sy(F)} L ${sx(qc)} ${sy(F + VC * qc)}`, { stroke: C.rose, sw: 10 });
  s += path(`M ${sx(0)} ${sy(F)} L ${sx(QMAX)} ${sy(F)}`, { stroke: C.rose, sw: 4, dash: "14 12", o: 0.7 * kc });
  if (kr > 0) s += path(`M ${sx(0)} ${sy(0)} L ${sx(qr)} ${sy(price * qr)}`, { stroke: C.accent, sw: 10 });
  s += g(text(sx(250) + 18, sy(F + VC * 250) + 30, "Kosten", { size: 36, weight: 800, fill: C.rose }), { o: p(t, 35, 35.6) });
  s += g(text(sx(250) + 18, sy(price * 250) - 4, "Umsatz", { size: 36, weight: 800, fill: C.accent }), { o: p(t, 35.6, 36.2) });
  s += g(text(sx(250), sy(F) - 16, "Fixkosten 3.000 €", { size: 30, weight: 700, fill: C.rose, anchor: "end", halo: C.white }), { o: p(t, 34.4, 35) });

  // Break-even-Punkt
  const kb = p(t, 36.0, 36.7, easeBack) * (1 - p(t, 48.2, 48.5)) + p(t, 50.5, 51.0, easeBack);
  if (kb > 0) {
    const bx = sx(qBe), by = sy(price * qBe);
    s += line(bx, by, bx, Y0, { stroke: C.navy, sw: 4, dash: "10 10" });
    s += circle(bx, by, 18 * kb, { fill: C.gold, stroke: C.ink, sw: 5 });
    const lbl = `Break-even: ${num(qBe)} Stück`;
    s += g(card(40, 50, 460, 84, text(270, 106, lbl, { size: 38, weight: 800, fill: C.navy, anchor: "middle" })), { x: bx, y: by, o: kb });
  }
  return s;
}

function render(t: number) {
  let s = backdrop("Break-even", "Kennzahl verstehen");

  /* Szene 1 – Problem (3,2–8,2 s) */
  s += scene(t, 3.2, 8.2, (lt) => {
    let r = sceneTitle(lt + 3.2, 3.5, "Verdient Kalle schon Geld?");
    r += kalle(620, 880, { mood: lt < 2.5 ? "happy" : "thinking", arm: lt < 2.5 ? "hold" : "think", t: lt, s: 1.05 });
    r += rect(860, 700, 520, 30, { fill: C.navy2, rx: 12 }) + rect(900, 730, 30, 150, { fill: C.navy2 }) + rect(1310, 730, 30, 150, { fill: C.navy2 });
    r += g(product(0, 0, 1.7, C.teal, "50 €"), { x: 1110, y: 700, o: p(lt + 3.2, 3.6, 4.1) , s: 0.9 + 0.1 * p(lt + 3.2, 3.6, 4.1, easeBack), ox: 1110, oy: 700 });
    for (let i = 0; i < 3; i++) {
      const k = p(lt, 0.8 + i * 0.45, 1.5 + i * 0.45, easeOut);
      r += coin(1500 + i * 30, lerp(760, 560 - i * 70, k), 40, k * (1 - p(lt, 4.2, 4.8)));
    }
    r += bubble(lt + 3.2, 5.6, 8.1, 770, 260, 620, ["Und – bleibt", "da was übrig?"], { size: 52 });
    return r;
  });

  /* Szene 2 – Intuition: Fixkosten-Topf füllen (8,2–20,2 s) */
  s += scene(t, 8.2, 20.2, (lt) => {
    const T = lt + 8.2;
    let r = sceneTitle(T, 8.5, T < 13.6 ? "Erst müssen die Fixkosten rein" : "Jeder Verkauf füllt den Topf");
    const potFill = T < 13.6 ? 0 : clamp((T - 17.4) / (23 / 9)) * (24 / Q);
    r += g(pot(1300, 380, 380, 420, potFill), { o: p(T, 8.4, 9.0) });
    const bills: [string, string][] = [["Miete", "1.800 €"], ["Software", "700 €"], ["Versicherung", "500 €"]];
    bills.forEach(([l, a], i) => {
      const k = p(T, 9.2 + i * 0.7, 9.9 + i * 0.7, easeOut);
      const into = p(T, 12.3, 13.3);
      r += bill(lerp(260, 1320, into), lerp(330 + i * 140, 680, into) + (1 - k) * 40, l, a, k * (1 - into));
    });
    r += g(text(260, 790, "Kosten, die jeden Monat anfallen –", { size: 40, weight: 600, fill: C.muted }) + text(260, 846, "auch wenn nichts verkauft wird.", { size: 40, weight: 600, fill: C.muted }), { o: vis(T, 10.8, 13.4) });

    // Verkauf: 50 € teilt sich in 30 € (weg) und 20 € (in den Topf)
    if (T > 13.6) {
      const k1 = p(T, 13.8, 14.4, easeBack);
      r += g(product(0, 0, 1.1, C.teal, "50 €"), { x: 340, y: 560, o: k1 });
      r += g(text(340, 650, "1 Verkauf", { size: 38, weight: 700, fill: C.muted, anchor: "middle" }), { o: k1 });
      const ks = p(T, 14.6, 15.4);
      // 30-€-Block geht zu Material & Versand
      const mx = lerp(560, 640, ks), my = lerp(420, 640, ks);
      r += g(rect(0, 0, 300, 110, { fill: C.roseSoft, stroke: C.rose, sw: 6, rx: 18 }) + text(150, 72, "30 €", { size: 54, weight: 800, fill: C.rose, anchor: "middle" }), { x: mx, y: my, o: p(T, 14.4, 14.8) });
      r += g(text(790, 810, "Material & Versand", { size: 36, weight: 700, fill: C.rose, anchor: "middle" }), { o: p(T, 15.2, 15.7) });
      // 20-€-Block wandert in den Topf
      const kd = p(T, 15.6, 17.0);
      const dx = lerp(560, 1390, kd), dy = lerp(420 - Math.sin(kd * Math.PI) * 120, 700, kd);
      r += g(rect(0, 0, 200, 110, { fill: C.tealSoft, stroke: C.teal, sw: 6, rx: 18 }) + text(100, 72, "20 €", { size: 54, weight: 800, fill: C.teal, anchor: "middle" }), { x: dx, y: dy, o: p(T, 14.4, 14.8) * (1 - p(T, 17.0, 17.4)) });
      r += g(text(560, 380, "50 € = 30 € + 20 €", { size: 48, weight: 800, fill: C.navy }), { o: p(T, 14.6, 15.1) });
      // Zähler weiterer Verkäufe
      const n = T < 17.4 ? 1 : Math.min(24, 1 + Math.floor((T - 17.4) * 9));
      r += g(text(1490, 862, `${n} × 20 € = ${eur(n * DB)}`, { size: 38, weight: 800, fill: C.teal, anchor: "middle" }), { o: p(T, 17.4, 17.8) });
      for (let i = 0; i < 6; i++) {
        const kk = p(T, 17.5 + i * 0.35, 18.0 + i * 0.35);
        if (kk > 0 && kk < 1) r += g(rect(0, 0, 120, 60, { fill: C.tealSoft, stroke: C.teal, sw: 4, rx: 12 }) + text(60, 42, "20 €", { size: 30, weight: 800, fill: C.teal, anchor: "middle" }), { x: lerp(520, 1430, kk), y: lerp(460, 700, kk) - Math.sin(kk * Math.PI) * 100, o: 1 - p(kk, 0.85, 1) });
      }
    }
    return r;
  });

  /* Szene 3a – Deckungsbeitrag & Division (20,2–33,2 s) */
  s += scene(t, 20.2, 33.2, (lt) => {
    const T = lt + 20.2;
    let r = sceneTitle(T, 20.4, T < 27 ? "20 € pro Stück decken die Fixkosten" : "Die Break-even-Menge");
    // Rechenkarte DB
    const kdb = p(T, 20.6, 21.2, easeOut);
    let dbc = text(60, 100, "Deckungsbeitrag pro Stück", { size: 40, weight: 700, fill: C.muted });
    dbc += textIn(T, 21.0, 60, 210, "50 €", { size: 96, weight: 800, fill: C.accent });
    dbc += textIn(T, 21.5, 330, 210, "−", { size: 96, weight: 800, fill: C.ink });
    dbc += textIn(T, 21.7, 420, 210, "30 €", { size: 96, weight: 800, fill: C.rose });
    dbc += textIn(T, 22.3, 650, 210, "=", { size: 96, weight: 800, fill: C.ink });
    dbc += textIn(T, 22.6, 740, 210, "20 €", { size: 96, weight: 800, fill: C.teal });
    dbc += textIn(T, 23.0, 60, 272, "Preis", { size: 30, weight: 600, fill: C.muted });
    dbc += textIn(T, 23.0, 420, 272, "variable Kosten", { size: 30, weight: 600, fill: C.muted });
    dbc += textIn(T, 23.0, 740, 272, "Deckungsbeitrag", { size: 30, weight: 600, fill: C.muted });
    r += g(card(0, 0, 1020, 320, dbc), { x: 140, y: 250, o: kdb * (1 - p(T, 26.6, 27.2)) });

    // Topf mit 150 Scheiben (ab 24 s)
    const fillK = lerp(24 / Q, 1, p(T, 24.6, 32.0, (x) => x));
    r += g(pot(1300, 380, 380, 420, fillK), { o: p(T, 23.4, 24.0) });
    const n = Math.round(Q * fillK);
    r += g(text(1490, 862, `${n} × 20 € = ${eur(n * DB)}`, { size: 38, weight: 800, fill: n >= Q ? C.teal : C.navy, anchor: "middle" }), { o: p(T, 24.6, 25) });
    r += bubble(T, 23.8, 26.9, 280, 640, 760, ["Wie oft passen 20 €", "in 3.000 €?"], { size: 50, tone: "accent" });

    // Formel 3.000 € ÷ 20 € = 150 Stück
    const kf = p(T, 27.0, 27.6, easeOut);
    let fc = text(60, 100, "Break-even-Menge = Fixkosten ÷ Deckungsbeitrag", { size: 38, weight: 700, fill: C.muted });
    fc += textIn(T, 27.4, 60, 230, "3.000 €  ÷  20 €", { size: 100, weight: 800, fill: C.navy });
    fc += textIn(T, 28.6, 60, 380, "=", { size: 100, weight: 800, fill: C.ink });
    const kq = p(T, 28.8, 30.6, easeOut);
    fc += kq > 0 ? text(150, 380, `${Math.round(Q * kq)} Stück`, { size: 120, weight: 800, fill: C.teal }) : "";
    r += g(card(0, 0, 1020, 450, fc), { x: 140, y: 250, o: kf });
    const kk = p(T, 31, 31.6, easeBack);
    r += g(rect(0, 0, 420, 70, { fill: C.goldSoft, stroke: C.ink, sw: 4, rx: 35 }) + text(210, 48, "Break-even-Menge", { size: 36, weight: 800, fill: C.amber, anchor: "middle" }), { x: 140, y: 730, o: kk, s: 0.9 + 0.1 * kk, ox: 350, oy: 765 });
    r += kalle(1222, 890, { s: 0.45, mood: T > 30.6 ? "happy" : "thinking", arm: T > 30.6 ? "point" : "think", t: T, look: 1 });
    return r;
  });

  /* Szene 3b + 4 – Diagramm, 151. Stück, Interpretation, Preis sinkt (33,2–55,2 s) */
  s += scene(t, 33.2, 55.2, (lt) => {
    const T = lt + 33.2;
    let r = sceneTitle(T, 33.4, T < 40.2 ? "Genau gedeckt – dann Gewinn" : T < 47.2 ? "Verlust links, Gewinn rechts" : "Weniger Preis, mehr Stück nötig");
    // Preis animiert 50 → 45 (ab 48 s)
    const price = lerp(P, 45, p(T, 48.4, 50.4));
    r += chart(T, price);
    // 151. Stück: Lupe
    const kz = vis(T, 37.2, 40.2);
    if (kz > 0) {
      const bx = sx(151), by = sy(P * 151);
      r += g(card(0, 0, 470, 210, text(32, 70, "150. Stück: Gewinn 0 €", { size: 36, weight: 700, fill: C.navy }) + text(32, 130, "151. Stück:", { size: 40, weight: 800, fill: C.navy }) + text(270, 132, "+20 €", { size: 52, weight: 800, fill: C.teal }) + text(32, 184, "erster Gewinn", { size: 32, weight: 600, fill: C.muted })), { x: 330, y: 280, o: kz });
      r += g(arrow(800, 400, bx - 22, by - 22, p(T, 37.6, 38.4), { color: C.navy, sw: 6, bend: -0.12 }), { o: kz });
    }
    // 200 Stück: +1.000 €
    const k2 = vis(T, 43.0, 47.4);
    if (k2 > 0) {
      const x = sx(200);
      r += line(x, sy(P * 200), x, sy(F + VC * 200), { stroke: C.teal, sw: 8 });
      r += g(card(0, 0, 470, 150, text(30, 64, "Bei 200 Stück", { size: 36, weight: 700, fill: C.muted }) + text(30, 126, "+1.000 € Gewinn", { size: 46, weight: 800, fill: C.teal })), { x: 330, y: 280, o: k2 });
      r += g(text(x + 18, (sy(P * 200) + sy(F + VC * 200)) / 2 + 12, "1.000 €", { size: 34, weight: 800, fill: C.teal, halo: C.white }), { o: k2 });
    }
    // Preissenkung
    const kp = p(T, 50.4, 51.0, easeOut);
    if (kp > 0) {
      const be2 = F / (price - VC);
      r += g(card(0, 0, 580, 220, text(30, 66, "Preis 45 € statt 50 €", { size: 40, weight: 800, fill: C.navy }) + text(30, 130, "Deckungsbeitrag 15 €", { size: 38, weight: 700, fill: C.muted }) + text(30, 196, "Break-even 200 Stück", { size: 44, weight: 800, fill: C.amber })), { x: 320, y: 262, o: kp });
      const k3 = p(T, 50.6, 51.4);
      r += g(circle(sx(150), sy(P * 150), 16, { fill: "none", stroke: C.muted, sw: 4, dash: "6 6" }), { o: p(T, 48.4, 49) });
      r += arrow(sx(150), Y0 - 34, sx(be2) - 12, Y0 - 34, k3, { color: C.amber, sw: 8 });
      r += g(text((sx(150) + sx(be2)) / 2, Y0 - 60, `+${num(Math.round(be2) - 150)} Stück`, { size: 36, weight: 800, fill: C.amber, anchor: "middle", halo: C.white }), { o: p(T, 51.2, 51.8) });
    }
    r += kalle(1740, 900, { s: 0.62, mood: T > 47.6 && T < 52 ? "worried" : "happy", arm: T > 36 && T < 47 ? "point" : "down", t: T, look: -1 });
    return r;
  });

  /* Szene 5 – Irrtum (55,2–60,8 s) */
  s += scene(t, 55.2, 61.0, (lt) => {
    const T = lt + 55.2;
    let r = sceneTitle(T, 55.4, "Typischer Irrtum");
    const k1 = p(T, 55.6, 56.2, easeOut);
    let a = text(50, 90, "„Break-even erreicht –", { size: 52, weight: 800, fill: C.navy }) + text(50, 160, "Ziel geschafft!“", { size: 52, weight: 800, fill: C.navy });
    const ks = p(T, 56.8, 57.4);
    a += path(`M 40 110 L ${40 + 640 * ks} ${110 - 10 * ks}`, { stroke: C.rose, sw: 12 });
    a += g(text(740, 160, "✕", { size: 90, weight: 800, fill: C.rose, anchor: "end" }), { o: ks });
    r += g(card(0, 0, 780, 220, a, C.roseSoft), { x: 140, y: 260, o: k1 });
    const k2 = p(T, 57.8, 58.4, easeOut);
    let b = text(50, 90, "Break-even = Gewinn 0 €", { size: 52, weight: 800, fill: C.teal }) + text(50, 160, "Das ist die Untergrenze.", { size: 44, weight: 700, fill: C.ink });
    b += text(50, 215, "Gewinn beginnt erst danach.", { size: 44, weight: 700, fill: C.ink });
    r += g(card(0, 0, 780, 260, b, C.tealSoft), { x: 140, y: 540, o: k2 });
    // Waage: Umsatz = Kosten (bei 150 Stück je 7.500 €)
    const tilt = Math.sin(T * 1.6) * 3 * (1 - p(T, 58, 59.2));
    const pan = (x: number, label: string, color: string, fill: string) =>
      line(x, -300, x - 110, -170, { stroke: C.ink, sw: 4 }) + line(x, -300, x + 110, -170, { stroke: C.ink, sw: 4 }) +
      path(`M ${x - 140} -170 L ${x + 140} -170 Q ${x + 120} -120 ${x} -118 Q ${x - 120} -120 ${x - 140} -170 Z`, { fill, stroke: C.ink, sw: 5 }) +
      rect(x - 120, -262, 240, 76, { fill: C.white, stroke: color, sw: 5, rx: 14 }) + text(x, -208, "7.500 €", { size: 44, weight: 800, fill: C.navy, anchor: "middle" }) +
      text(x, -66, label, { size: 36, weight: 800, fill: color, anchor: "middle" });
    let sc = rect(-12, -300, 24, 300, { fill: C.ink, rx: 8 }) + rect(-140, -8, 280, 30, { fill: C.navy, rx: 14 });
    const beam = line(-270, -300, 270, -300, { stroke: C.ink, sw: 12 }) + circle(0, -300, 16, { fill: C.gold, stroke: C.ink, sw: 4 });
    const lx = -270, rx = 270, dy = Math.sin((tilt * Math.PI) / 180) * 270;
    sc += g(beam, { r: tilt, ox: 0, oy: -300 });
    sc += g(pan(lx, "Umsatz", C.accent, C.accentSoft), { y: -dy });
    sc += g(pan(rx, "Kosten", C.rose, C.roseSoft), { y: dy });
    r += g(sc, { x: 1400, y: 840, o: p(T, 56, 56.6) });
    r += g(text(1400, 330, "bei 150 Stück", { size: 40, weight: 700, fill: C.muted, anchor: "middle" }), { o: p(T, 56.4, 57) });
    return r;
  }, 0.35);

  /* Titel und Abschluss */
  s += titleCard(t, "Kennzahl in 60 Sekunden", ["Break-even:", "Ab wann verdienst du Geld?"], 3.4);
  s += outroCard(t, 60.8, ["Break-even = Fixkosten", "÷ Deckungsbeitrag pro Stück.", "Gewinn beginnt erst danach."], "/break-even-rechner/");

  s += narration(t, V.cues, t < 3.4 || t > 60.8);
  return s;
}

export const video: VideoDef = { id: "break-even", duration: V.duration, render };
