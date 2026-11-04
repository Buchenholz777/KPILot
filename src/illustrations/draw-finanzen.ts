import { C, HATCH, T, R, L, P, check, bracket, type Draw } from "./kit";

const D = (d: boolean, s: string) => (d ? s : "");
const pill = (
  cx: number,
  cy: number,
  w: number,
  text: string,
  c: string,
  s = 12,
) =>
  R(cx - w / 2, cy - 9, w, 18, C.white, { rx: 9 }) +
  T(cx, cy + 4.5, text, { s, w: 700, c, a: "middle" });

export const finanzen: Record<string, Draw> = {
  ebit: (d) =>
    R(30, 70, 182, 40, C.greySoft, { stroke: C.grey }) +
    R(212, 70, 26, 40, HATCH.amber, { stroke: C.amber }) +
    R(238, 70, 52, 40, HATCH.accent, { stroke: C.accent }) +
    bracket(30, 290, 62, "Umsatz 100.000 €", { w: 600, s: 12 }) +
    T(121, 88, "übriger Betriebsaufwand", { s: 10.5, a: "middle" }) +
    T(121, 103, "70.000 €", { s: 12, w: 700, a: "middle" }) +
    T(264, 128, "EBIT", { s: 12, w: 700, c: C.accent, a: "middle" }) +
    T(264, 142, "20.000 €", { s: 12, w: 700, c: C.accent, a: "middle" }) +
    L(225, 112, 225, 150, { c: C.amber, sw: 1 }) +
    T(231, 160, "Abschreibungen 10.000 €", {
      s: 9.5,
      w: 600,
      c: C.amber,
      a: "end",
    }) +
    D(
      d,
      R(30, 120, 56, 18, C.white, { stroke: C.grey, dash: true }) +
        T(58, 132.5, "Zinsen", { s: 9.5, c: C.muted, a: "middle" }) +
        R(92, 120, 56, 18, C.white, { stroke: C.grey, dash: true }) +
        T(120, 132.5, "Steuern", { s: 9.5, c: C.muted, a: "middle" }) +
        T(30, 174, "Zinsen und Ertragsteuern: im EBIT noch nicht abgezogen", {
          s: 9.5,
          c: C.muted,
        }),
    ),

  ebitda: (d) =>
    L(30, 150, 290, 150, { c: C.ink }) +
    R(40, 90, 60, 60, C.accentSoft, { stroke: C.accent }) +
    T(70, 84, "EBIT", { s: 11, w: 600, c: C.muted, a: "middle" }) +
    T(70, 124, "20.000 €", { s: 11.5, w: 700, a: "middle" }) +
    L(100, 90, 130, 90, { dash: true, c: C.grey }) +
    R(130, 60, 60, 30, HATCH.amber, { stroke: C.amber }) +
    pill(160, 75, 54, "10.000 €", C.amber, 10.5) +
    T(160, 52, "+ Abschreibungen", {
      s: 10.5,
      w: 600,
      c: C.amber,
      a: "middle",
    }) +
    L(190, 60, 220, 60, { dash: true, c: C.grey }) +
    R(220, 60, 60, 90, C.accent) +
    T(250, 52, "EBITDA", { s: 11, w: 700, c: C.accent, a: "middle" }) +
    T(250, 110, "30.000 €", { s: 11.5, w: 700, c: C.white, a: "middle" }) +
    T(160, 170, "Rechengröße – kein Kontostand, kein Cashflow", {
      s: 10,
      w: 600,
      c: C.rose,
      a: "middle",
    }) +
    D(
      d,
      T(30, 30, "Ergebnisbrücke: Abschreibungen werden wieder hinzugerechnet", {
        s: 9.5,
        c: C.muted,
      }),
    ),

  "ebit-marge": (d) => {
    let g = "";
    for (let i = 0; i < 10; i++)
      g += R(30 + i * 26, 70, 26, 40, i >= 8 ? HATCH.accent : C.greySoft, {
        rx: 0,
        stroke: i >= 8 ? C.accent : C.grey,
        sw: 0.8,
      });
    return (
      g +
      bracket(30, 290, 62, "Umsatz 100.000 €", { w: 600, s: 12 }) +
      bracket(238, 290, 118, "EBIT 20.000 €", { up: false, w: 600, s: 11 }) +
      T(30, 152, "EBIT-Marge 20 %", { s: 18, w: 700, c: C.accent }) +
      D(d, T(30, 170, "1 Feld = 10 % des Umsatzes", { s: 9.5, c: C.muted }))
    );
  },

  umsatzrendite: (d) =>
    R(30, 70, 239.2, 40, C.greySoft, { stroke: C.grey }) +
    R(269.2, 70, 20.8, 40, HATCH.teal, { stroke: C.teal }) +
    bracket(30, 290, 62, "Umsatz 100.000 € = 100 %", { w: 600, s: 12 }) +
    T(150, 94, "Aufwendungen, Zinsen, Steuern", { s: 10.5, a: "middle" }) +
    L(280, 112, 280, 124, { c: C.teal, sw: 1.2 }) +
    T(290, 138, "Jahresüberschuss", { s: 11, w: 700, c: C.teal, a: "end" }) +
    T(290, 154, "8.000 € = 8 %", { s: 13, w: 700, c: C.teal, a: "end" }) +
    D(
      d,
      T(150, 106, "92.000 €", { s: 10, c: C.muted, a: "middle" }) +
        T(30, 124, "0 %", { s: 9, c: C.muted }) +
        T(30, 172, "nach Zinsen und Ertragsteuern", { s: 9.5, c: C.muted }),
    ),

  cashflow: (d) =>
    R(120, 58, 80, 56, C.white, { stroke: C.ink, rx: 8 }) +
    P("M140 76 l20 -9 l20 9 z", C.soft, C.ink, 1.2) +
    L(145, 79, 145, 96, { c: C.ink, sw: 1.6 }) +
    L(160, 79, 160, 96, { c: C.ink, sw: 1.6 }) +
    L(175, 79, 175, 96, { c: C.ink, sw: 1.6 }) +
    T(160, 109, "Konto", { s: 10, w: 700, a: "middle" }) +
    L(22, 86, 114, 86, { arrow: true, c: C.teal, sw: 2.4 }) +
    T(66, 74, "+30.000 €", { s: 12, w: 700, c: C.teal, a: "middle" }) +
    T(66, 104, "Einzahlungen", { s: 10, c: C.muted, a: "middle" }) +
    L(206, 86, 298, 86, { arrow: true, c: C.rose, sw: 2.4 }) +
    T(252, 74, "−22.000 €", { s: 12, w: 700, c: C.rose, a: "middle" }) +
    T(252, 104, "Auszahlungen", { s: 10, c: C.muted, a: "middle" }) +
    T(160, 140, "= +8.000 €", { s: 16, w: 700, c: C.accent, a: "middle" }) +
    T(160, 156, "operativer Cashflow", { s: 10, c: C.muted, a: "middle" }) +
    D(
      d,
      R(16, 122, 66, 48, C.white, { stroke: C.grey, dash: true }) +
        T(49, 136, "Rechnung", { s: 9, c: C.muted, a: "middle" }) +
        T(49, 149, "5.000 € offen", { s: 9, w: 600, a: "middle" }) +
        T(49, 162, "kein Zufluss", { s: 9, w: 600, c: C.rose, a: "middle" }) +
        T(304, 172, "nur tatsächliche Zahlungen", {
          s: 9,
          c: C.muted,
          a: "end",
        }),
    ),

  "working-capital": (d) =>
    L(50, 150, 270, 150, { c: C.ink }) +
    R(70, 30, 70, 120, C.accentSoft, { stroke: C.accent }) +
    R(70, 30, 70, 48, HATCH.accent, { stroke: C.accent }) +
    R(180, 78, 70, 72, C.roseSoft, { stroke: C.rose }) +
    L(60, 78, 262, 78, { dash: true, c: C.grey }) +
    pill(105, 54, 60, "20.000 €", C.accent, 11) +
    T(148, 50, "Working Capital", { s: 11, w: 700, c: C.accent }) +
    T(105, 118, "50.000 €", { s: 12, w: 700, a: "middle" }) +
    T(215, 118, "30.000 €", { s: 12, w: 700, a: "middle" }) +
    T(105, 166, "Umlaufvermögen", { s: 10, c: C.muted, a: "middle" }) +
    T(215, 166, "kurzfr. Verpflichtungen", {
      s: 9.5,
      c: C.muted,
      a: "middle",
    }) +
    D(
      d,
      T(148, 64, "= Überschuss am Stichtag, kein Bankguthaben", {
        s: 9,
        c: C.muted,
      }),
    ),

  liquiditaet: (d) => {
    const rows = [
      {
        y: 40,
        label: "1. Grad",
        pct: "50 %",
        bars: [[28, C.accent]] as [number, string][],
      },
      {
        y: 85,
        label: "2. Grad",
        pct: "125 %",
        bars: [
          [28, C.accent],
          [42, C.teal],
        ] as [number, string][],
      },
      {
        y: 130,
        label: "3. Grad",
        pct: "250 %",
        bars: [
          [28, C.accent],
          [42, C.teal],
          [70, HATCH.amber],
        ] as [number, string][],
      },
    ];
    let g = "";
    for (const row of rows) {
      let x = 96;
      for (const [w, f] of row.bars) {
        g += R(x, row.y, w, 24, f, { rx: 0, stroke: C.white, sw: 1 });
        x += w;
      }
      g += R(250, row.y, 56, 24, C.roseSoft, { stroke: C.rose });
      g += T(278, row.y + 16, "20.000 €", { s: 9.5, w: 600, a: "middle" });
      g += T(14, row.y + 11, row.label, { s: 11, w: 700 });
      g += T(14, row.y + 25, row.pct, { s: 11, w: 700, c: C.accent });
      g += T(243, row.y + 16, "vs.", { s: 9, c: C.muted, a: "end" });
    }
    return (
      g +
      D(
        d,
        T(96, 36, "liquide Mittel 10.000 €", { s: 8.5, c: C.muted }) +
          T(96, 81, "+ Forderungen 15.000 €", { s: 8.5, c: C.muted }) +
          T(96, 126, "+ Vorräte und Sonstiges 25.000 €", {
            s: 8.5,
            c: C.muted,
          }) +
          T(278, 36, "Verpflichtungen", { s: 8.5, c: C.muted, a: "middle" }),
      )
    );
  },

  eigenkapital: (d) =>
    R(30, 72, 78, 40, HATCH.accent, { stroke: C.accent }) +
    R(108, 72, 182, 40, C.greySoft, { stroke: C.grey }) +
    bracket(30, 290, 64, "Gesamtkapital 100.000 €", { w: 600, s: 12 }) +
    pill(69, 92, 44, "30 %", C.accent) +
    T(199, 97, "Fremdkapital 70.000 €", { s: 12, w: 600, a: "middle" }) +
    T(69, 130, "Eigenkapital", { s: 11, w: 700, c: C.accent, a: "middle" }) +
    T(69, 145, "30.000 €", { s: 11, w: 700, a: "middle" }) +
    D(
      d,
      T(199, 130, "70 %", { s: 11, c: C.muted, a: "middle" }) +
        T(160, 172, "Bilanzwerte vom selben Stichtag", {
          s: 9.5,
          c: C.muted,
          a: "middle",
        }),
    ),

  roi: (d) =>
    R(40, 40, 100, 100, C.accentSoft, { stroke: C.accent }) +
    T(90, 86, "Kapital", { s: 11, c: C.muted, a: "middle" }) +
    T(90, 102, "50.000 €", { s: 13, w: 700, a: "middle" }) +
    L(146, 90, 194, 90, { arrow: true }) +
    R(200, 74, 31.6, 31.6, HATCH.teal, { stroke: C.teal }) +
    T(240, 86, "Gewinn", { s: 11, w: 600, c: C.teal }) +
    T(240, 101, "5.000 €", { s: 12, w: 700 }) +
    T(160, 164, "5.000 / 50.000 = 10 %", {
      s: 14,
      w: 700,
      c: C.accent,
      a: "middle",
    }) +
    D(
      d,
      T(170, 82, "Periode", { s: 9.5, c: C.muted, a: "middle" }) +
        T(160, 32, "Flächen maßstäblich: Gewinn = 1/10 des Kapitals", {
          s: 9.5,
          c: C.muted,
          a: "middle",
        }),
    ),

  amortisation: (d) => {
    const bars = [27, 54, 81, 108].map((h, i) => {
      const x = 80 + i * 56;
      return (
        R(x, 150 - h, 40, h, i === 3 ? C.accent : C.accentSoft, {
          stroke: C.accent,
        }) +
        T(x + 20, 164, `Jahr ${i + 1}`, { s: 10, c: C.muted, a: "middle" }) +
        D(
          d,
          T(x + 20, 146 - h, ["2.500", "5.000", "7.500", "10.000"][i], {
            s: 9,
            w: 600,
            a: "middle",
          }),
        )
      );
    });
    return (
      L(60, 150, 304, 150, { c: C.ink }) +
      L(60, 42, 304, 42, { dash: true, c: C.rose }) +
      T(62, 36, "Investition 10.000 €", { s: 11, w: 600, c: C.rose }) +
      bars.join("") +
      check(300, 30, C.teal) +
      T(16, 104, "4 Jahre", { s: 16, w: 700, c: C.accent }) +
      D(
        d,
        T(16, 120, "+2.500 €", { s: 9.5, c: C.muted }) +
          T(16, 132, "pro Jahr", { s: 9.5, c: C.muted }),
      )
    );
  },
};
