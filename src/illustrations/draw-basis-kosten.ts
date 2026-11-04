import { C, HATCH, T, R, L, P, circle, bracket, type Draw } from "./kit";

const D = (d: boolean, s: string) => (d ? s : "");
const pill = (cx: number, cy: number, w: number, text: string, c: string) =>
  R(cx - w / 2, cy - 9, w, 18, C.white, { rx: 9 }) +
  T(cx, cy + 4.5, text, { s: 12, w: 700, c, a: "middle" });

export const basisKosten: Record<string, Draw> = {
  prozent: (d) => {
    let g = "";
    const x0 = 22,
      y0 = 22,
      c = 13.2,
      gap = 1.8;
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10),
        col = i % 10,
        on = i < 20;
      g += R(
        x0 + col * (c + gap),
        y0 + row * (c + gap),
        c,
        c,
        on ? HATCH.accent : C.white,
        { rx: 2, stroke: on ? C.accent : C.line, sw: 0.8 },
      );
    }
    return (
      g +
      T(196, 64, "20 %", { s: 30, w: 700, c: C.accent }) +
      T(196, 88, "von 250 €", { s: 14, c: C.muted }) +
      T(196, 120, "= 50 €", { s: 22, w: 700 }) +
      D(
        d,
        T(196, 146, "20 von 100 Teilen", { s: 11, c: C.muted }) +
          T(196, 162, "W = 250 × 20 / 100", { s: 11, c: C.muted }),
      )
    );
  },

  veraenderung: (d) =>
    L(50, 62, 226, 62, { dash: true, c: C.grey }) +
    R(60, 62, 64, 88, C.greySoft, { stroke: C.grey }) +
    R(150, 62, 64, 88, C.accentSoft, { stroke: C.accent }) +
    R(150, 40, 64, 22, HATCH.accent, { stroke: C.accent }) +
    T(92, 55, "80", { s: 15, w: 700, a: "middle" }) +
    T(182, 33, "100", { s: 15, w: 700, a: "middle" }) +
    T(220, 56, "+20", { s: 13, w: 700, c: C.accent }) +
    L(30, 150, 236, 150, { c: C.ink }) +
    T(92, 166, "vorher", { s: 11, c: C.muted, a: "middle" }) +
    T(182, 166, "nachher", { s: 11, c: C.muted, a: "middle" }) +
    T(246, 104, "+25 %", { s: 22, w: 700, c: C.accent }) +
    D(
      d,
      T(246, 124, "= 20 / 80", { s: 11, c: C.muted }) +
        T(246, 140, "Bezug: alter Wert", { s: 10, c: C.muted }),
    ),

  rabatt: (d) =>
    R(30, 78, 184, 40, C.tealSoft, { stroke: C.teal }) +
    circle(44, 98, 4, C.white, C.teal) +
    R(222, 78, 46, 40, HATCH.rose, { stroke: C.rose }) +
    L(218, 68, 218, 128, { dash: true, c: C.rose }) +
    bracket(30, 268, 70, "vorher 100 €", { w: 600, s: 12 }) +
    T(126, 104, "80 €", { s: 18, w: 700, c: C.teal, a: "middle" }) +
    T(245, 138, "−20 €", { s: 14, w: 700, c: C.rose, a: "middle" }) +
    D(
      d,
      T(126, 138, "neuer Preis nach Rabatt", {
        s: 11,
        c: C.muted,
        a: "middle",
      }) +
        T(245, 154, "20 % Rabatt", { s: 11, c: C.muted, a: "middle" }) +
        T(160, 172, "100 € × (1 − 0,20) = 80 €", {
          s: 11,
          w: 600,
          a: "middle",
        }),
    ),

  prozentpunkte: (d) =>
    R(60, 30, 44, 120, C.white, { stroke: C.line }) +
    R(60, 90, 44, 60, C.accentSoft, { stroke: C.accent }) +
    R(130, 30, 44, 120, C.white, { stroke: C.line }) +
    R(130, 90, 44, 60, C.accentSoft, { stroke: C.accent }) +
    R(130, 78, 44, 12, HATCH.accent, { stroke: C.accent }) +
    L(56, 90, 178, 90, { dash: true, c: C.grey }) +
    T(82, 168, "5 %", { s: 14, w: 700, a: "middle" }) +
    T(152, 168, "6 %", { s: 14, w: 700, a: "middle" }) +
    P("M180 90 h5 V78 h-5", "none", C.accent, 1.4) +
    T(196, 62, "+1 Prozentpunkt", { s: 13, w: 700, c: C.accent }) +
    T(196, 118, "+20 % relativ", { s: 13, w: 700, c: C.teal }) +
    D(
      d,
      T(196, 80, "Abstand von 5 % zu 6 %", { s: 10, c: C.muted }) +
        T(196, 136, "1 / 5 = 20 %", { s: 10, c: C.muted }) +
        T(54, 34, "10 %", { s: 9, c: C.muted, a: "end" }) +
        T(54, 152, "0 %", { s: 9, c: C.muted, a: "end" }),
    ),

  dreisatz: (d) => {
    const box = (
      x: number,
      fill: string = C.accentSoft,
      stroke: string = C.accent,
    ) => R(x, 70, 16, 16, fill, { stroke, rx: 3 });
    return (
      box(20) +
      box(40) +
      box(60) +
      T(48, 110, "12 €", { s: 15, w: 700, a: "middle" }) +
      L(86, 78, 116, 78, { arrow: true }) +
      T(101, 68, "÷ 3", { s: 11, w: 600, c: C.muted, a: "middle" }) +
      box(128, HATCH.teal, C.teal) +
      T(136, 110, "4 €", { s: 15, w: 700, a: "middle", c: C.teal }) +
      L(152, 78, 182, 78, { arrow: true }) +
      T(167, 68, "× 5", { s: 11, w: 600, c: C.muted, a: "middle" }) +
      box(194) +
      box(214) +
      box(234) +
      box(254) +
      box(274) +
      T(242, 110, "20 €", { s: 15, w: 700, a: "middle", c: C.accent }) +
      T(48, 58, "3 Artikel", { s: 11, c: C.muted, a: "middle" }) +
      T(136, 58, "1 Artikel", { s: 11, c: C.muted, a: "middle" }) +
      T(242, 58, "5 Artikel", { s: 11, c: C.muted, a: "middle" }) +
      D(
        d,
        T(160, 150, "erst auf 1 Einheit, dann auf die gesuchte Menge", {
          s: 11,
          c: C.muted,
          a: "middle",
        }),
      )
    );
  },

  durchschnitt: (d) =>
    L(40, 140, 280, 140, { c: C.ink }) +
    R(28, 116, 24, 24, C.greySoft, { stroke: C.grey }) +
    T(40, 132, "10", { s: 11, w: 700, a: "middle" }) +
    [116, 92, 68]
      .map(
        (y) =>
          R(268, y, 24, 24, C.accentSoft, { stroke: C.accent }) +
          T(280, y + 16, "20", { s: 11, w: 700, a: "middle" }),
      )
      .join("") +
    P("M220 145 l-6 10 h12 z", C.accent) +
    T(220, 170, "Ø 17,5", { s: 14, w: 700, c: C.accent, a: "middle" }) +
    T(40, 106, "Gewicht 1", { s: 10, c: C.muted, a: "middle" }) +
    T(280, 60, "Gewicht 3", { s: 10, c: C.muted, a: "middle" }) +
    D(
      d,
      L(160, 66, 160, 140, { dash: true, c: C.grey }) +
        T(160, 60, "einfacher Mittelwert: 15", {
          s: 10,
          c: C.muted,
          a: "middle",
        }) +
        T(40, 156, "10", { s: 9, c: C.muted, a: "middle" }) +
        T(160, 156, "15", { s: 9, c: C.muted, a: "middle" }) +
        T(280, 156, "20", { s: 9, c: C.muted, a: "middle" }),
    ),

  cagr: (d) =>
    L(30, 148, 296, 148, { c: C.ink }) +
    R(50, 68, 46, 80, C.greySoft, { stroke: C.grey }) +
    R(137, 60, 46, 88, C.accentSoft, { stroke: C.accent }) +
    R(224, 51.2, 46, 96.8, C.accent) +
    T(73, 61, "100", { s: 14, w: 700, a: "middle" }) +
    T(160, 53, "110", { s: 14, w: 700, a: "middle" }) +
    T(247, 44, "121", { s: 14, w: 700, a: "middle" }) +
    L(100, 104, 132, 104, { arrow: true }) +
    T(116, 96, "+10 %", { s: 11, w: 700, c: C.accent, a: "middle" }) +
    L(187, 104, 219, 104, { arrow: true }) +
    T(203, 96, "+10 %", { s: 11, w: 700, c: C.accent, a: "middle" }) +
    T(73, 164, "Jahr 0", { s: 10.5, c: C.muted, a: "middle" }) +
    T(160, 164, "Jahr 1", { s: 10.5, c: C.muted, a: "middle" }) +
    T(247, 164, "Jahr 2", { s: 10.5, c: C.muted, a: "middle" }) +
    D(
      d,
      T(20, 30, "gleichmäßiger Modellpfad – echte Jahre können abweichen", {
        s: 10,
        c: C.muted,
      }),
    ),

  deckungsbeitrag: (d) =>
    R(35, 70, 150, 44, C.greySoft, { stroke: C.grey }) +
    R(185, 70, 100, 44, HATCH.teal, { stroke: C.teal }) +
    bracket(35, 285, 62, "Verkaufspreis 50 € je Stück", { w: 600, s: 12 }) +
    T(110, 97, "30 €", { s: 16, w: 700, a: "middle" }) +
    pill(235, 92, 54, "20 €", C.teal) +
    T(110, 132, "variable Kosten", { s: 11, c: C.muted, a: "middle" }) +
    T(235, 132, "Deckungsbeitrag", { s: 11, w: 700, c: C.teal, a: "middle" }) +
    D(
      d,
      L(235, 138, 235, 156, { arrow: true }) +
        T(235, 170, "deckt Fixkosten, dann Gewinn", {
          s: 10,
          c: C.muted,
          a: "middle",
        }),
    ),

  "break-even": (d) => {
    // x(q) = 40 + q · 0,8667 (0–300 Stück) · y(v) = 150 − v · 130 / 15.000 €
    return (
      P("M40 150 L40 124 L170 85 Z", C.roseSoft) +
      P("M170 85 L300 20 L300 46 Z", C.tealSoft) +
      L(40, 150, 302, 150, { c: C.ink }) +
      L(40, 150, 40, 24, { c: C.ink }) +
      L(40, 124, 300, 46, { c: C.ink, sw: 2 }) +
      L(40, 150, 300, 20, { c: C.accent, sw: 2.6 }) +
      L(170, 85, 170, 150, { dash: true, c: C.ink }) +
      circle(170, 85, 4.5, C.white, C.ink) +
      T(170, 165, "150 Stück", { s: 12, w: 700, a: "middle" }) +
      T(45, 133, "Verlust", { s: 9, w: 700, c: C.rose }) +
      T(266, 51, "Gewinn", { s: 10, w: 700, c: C.teal, a: "middle" }) +
      L(52, 30, 66, 30, { c: C.accent, sw: 2.6 }) +
      T(70, 34, "Umsatz", { s: 10 }) +
      L(116, 30, 130, 30, { c: C.ink, sw: 2 }) +
      T(134, 34, "Gesamtkosten", { s: 10 }) +
      D(
        d,
        L(40, 124, 300, 124, { dash: true, c: C.grey }) +
          T(298, 120, "Fixkosten 3.000 €", { s: 9, c: C.muted, a: "end" }) +
          T(178, 101, "7.500 €", { s: 9.5, w: 600 }) +
          T(300, 172, "Stück", { s: 9, c: C.muted, a: "end" }),
      )
    );
  },

  gewinn: (d) =>
    L(36, 150, 210, 150, { c: C.ink }) +
    R(50, 30, 64, 120, C.accentSoft, { stroke: C.accent }) +
    T(82, 88, "Erlös", { s: 11, w: 600, c: C.accent, a: "middle" }) +
    T(82, 104, "10.000 €", { s: 12, w: 700, a: "middle" }) +
    R(140, 78, 64, 72, C.greySoft, { stroke: C.grey }) +
    R(140, 42, 64, 36, C.amberSoft, { stroke: C.amber }) +
    R(140, 30, 64, 12, HATCH.teal, { stroke: C.teal }) +
    T(212, 40, "Gewinn 1.000 €", { s: 12, w: 700, c: C.teal }) +
    T(212, 64, "fix 3.000 €", { s: 11 }) +
    T(212, 118, "variabel 6.000 €", { s: 11 }) +
    D(
      d,
      T(82, 166, "200 Stück × 50 €", { s: 10, c: C.muted, a: "middle" }) +
        T(172, 166, "Kosten + Gewinn", { s: 10, c: C.muted, a: "middle" }) +
        T(212, 132, "200 × 30 €", { s: 10, c: C.muted }),
    ),

  marge: (d) =>
    R(40, 80, 192, 36, C.greySoft, { stroke: C.grey }) +
    R(232, 80, 48, 36, HATCH.accent, { stroke: C.accent }) +
    T(136, 103, "Kosten 80 €", { s: 14, w: 700, a: "middle" }) +
    pill(256, 98, 40, "20 €", C.accent) +
    bracket(40, 280, 72, "Marge: 20 € von 100 € = 20 %", { w: 600, s: 12 }) +
    bracket(40, 232, 124, "Aufschlag: 20 € auf 80 € = 25 %", {
      up: false,
      w: 600,
      s: 12,
    }) +
    D(
      d,
      T(160, 168, "gleiche Differenz – unterschiedliche Bezugsgröße", {
        s: 10,
        c: C.muted,
        a: "middle",
      }),
    ),

  zielpreis: (d) =>
    R(40, 70, 192, 40, C.greySoft, { stroke: C.grey }) +
    R(232, 70, 48, 40, HATCH.accent, { stroke: C.accent }) +
    bracket(40, 280, 62, "Verkaufspreis 100 € = 100 %", { w: 600, s: 12 }) +
    T(136, 89, "80 € Kosten", { s: 13, w: 700, a: "middle" }) +
    T(136, 103, "= 80 % des Preises", { s: 10, c: C.muted, a: "middle" }) +
    pill(256, 90, 42, "20 %", C.accent) +
    T(256, 126, "Marge", { s: 11, w: 700, c: C.accent, a: "middle" }) +
    T(160, 156, "80 € / (1 − 0,20) = 100 €", { s: 12, w: 600, a: "middle" }) +
    D(
      d,
      T(160, 172, "nicht: 80 € + 20 % = 96 €", {
        s: 10,
        c: C.rose,
        a: "middle",
      }),
    ),

  stueckkosten: (d) =>
    R(16, 50, 84, 70, C.amberSoft, { stroke: C.amber }) +
    T(58, 80, "Fixkosten", { s: 11, a: "middle" }) +
    T(58, 98, "1.000 €", { s: 14, w: 700, a: "middle" }) +
    L(104, 85, 124, 85, { arrow: true }) +
    [130, 158, 186, 214, 242]
      .map(
        (x) =>
          R(x, 60, 22, 30, C.amberSoft, { stroke: C.amber }) +
          R(x, 90, 22, 30, C.tealSoft, { stroke: C.teal }),
      )
      .join("") +
    T(276, 79, "10 € fix", { s: 9.5, c: C.amber }) +
    T(276, 109, "10 € var.", { s: 9.5, c: C.teal }) +
    T(197, 140, "je Stück: 10 € + 10 €", { s: 11, a: "middle" }) +
    T(197, 160, "= 20 € Stückkosten", {
      s: 14,
      w: 700,
      c: C.accent,
      a: "middle",
    }) +
    D(
      d,
      T(186, 50, "je Stück bei 100 Stück (5 von 100 gezeigt)", {
        s: 9,
        c: C.muted,
        a: "middle",
      }) +
        T(58, 138, "+ 10 € variable", { s: 9.5, c: C.muted, a: "middle" }) +
        T(58, 151, "Kosten je Stück", { s: 9.5, c: C.muted, a: "middle" }),
    ),

  zuschlag: (d) =>
    L(14, 150, 300, 150, { c: C.ink }) +
    R(20, 95, 50, 55, C.tealSoft, { stroke: C.teal }) +
    R(20, 89.5, 50, 5.5, HATCH.teal, { stroke: C.teal }) +
    T(45, 82, "110 €", { s: 12, w: 700, a: "middle" }) +
    T(81, 126, "+", { s: 14, w: 700, c: C.muted, a: "middle" }) +
    R(92, 122.5, 50, 27.5, C.accentSoft, { stroke: C.accent }) +
    R(92, 117, 50, 5.5, HATCH.accent, { stroke: C.accent }) +
    T(117, 110, "60 €", { s: 12, w: 700, a: "middle" }) +
    T(153, 126, "=", { s: 14, w: 700, c: C.muted, a: "middle" }) +
    R(164, 89.5, 50, 60.5, C.tealSoft, { stroke: C.teal }) +
    R(164, 56.5, 50, 33, C.accentSoft, { stroke: C.accent }) +
    T(189, 49, "170 €", { s: 12, w: 700, a: "middle" }) +
    T(225, 126, "→", { s: 14, w: 700, c: C.muted, a: "middle" }) +
    R(236, 56.5, 50, 93.5, C.greySoft, { stroke: C.grey }) +
    R(236, 51.8, 50, 4.7, HATCH.amber, { stroke: C.amber, sw: 0.8 }) +
    R(236, 42.5, 50, 9.3, HATCH.rose, { stroke: C.rose, sw: 0.8 }) +
    T(261, 35, "195,50 €", { s: 12, w: 700, a: "middle", c: C.accent }) +
    T(45, 165, "Material", { s: 10, c: C.muted, a: "middle" }) +
    T(117, 165, "Fertigung", { s: 10, c: C.muted, a: "middle" }) +
    T(189, 165, "Herstellkosten", { s: 9.5, c: C.muted, a: "middle" }) +
    T(261, 165, "Selbstkosten", { s: 9.5, w: 700, a: "middle" }) +
    D(
      d,
      R(16, 22, 10, 8, HATCH.accent) +
        T(30, 29.5, "schraffiert = Gemeinkosten-Zuschlag", {
          s: 9,
          c: C.muted,
        }) +
        T(300, 72, "+ 17 € Vertrieb", { s: 8.5, c: C.rose, a: "end" }) +
        T(300, 84, "+ 8,50 € Verw.", { s: 8.5, c: C.amber, a: "end" }),
    ),

  stundensatz: (d) => {
    let g = "";
    for (let i = 0; i < 60; i++) {
      const col = i % 12,
        row = Math.floor(i / 12);
      g += R(
        128 + col * 15,
        50 + row * 15,
        13,
        13,
        i === 0 ? HATCH.accent : C.accentSoft,
        { rx: 2, stroke: C.accent, sw: 0.6 },
      );
    }
    return (
      R(16, 56, 80, 60, C.amberSoft, { stroke: C.amber }) +
      T(56, 84, "1.200 €", { s: 14, w: 700, a: "middle" }) +
      T(56, 100, "im Monat", { s: 10, c: C.muted, a: "middle" }) +
      L(100, 86, 120, 86, { arrow: true }) +
      g +
      T(217, 144, "60 abrechenbare Stunden", {
        s: 11,
        c: C.muted,
        a: "middle",
      }) +
      T(217, 164, "je Stunde 20 €", {
        s: 14,
        w: 700,
        c: C.accent,
        a: "middle",
      }) +
      D(
        d,
        T(128, 42, "1 Feld = 1 Stunde", { s: 9.5, c: C.muted }) +
          R(16, 130, 80, 16, C.white, { stroke: C.grey, dash: true }) +
          T(56, 141.5, "Urlaub, Leerlauf", {
            s: 8.5,
            c: C.muted,
            a: "middle",
          }) +
          T(56, 158, "tragen keine Kosten", {
            s: 8.5,
            c: C.muted,
            a: "middle",
          }),
      )
    );
  },
};
