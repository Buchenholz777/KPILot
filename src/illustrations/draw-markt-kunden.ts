import {
  C,
  HATCH,
  T,
  R,
  L,
  P,
  circle,
  person,
  check,
  cross,
  bracket,
  type Draw,
} from "./kit";

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

export const marktKunden: Record<string, Draw> = {
  conversion: (d) => {
    let g = "";
    const on = new Set([23, 67, 104, 141, 188]);
    for (let i = 0; i < 200; i++) {
      const x = 22 + (i % 20) * 9,
        y = 38 + Math.floor(i / 20) * 9;
      g += on.has(i) ? circle(x, y, 3.6, C.accent) : circle(x, y, 2.4, C.grey);
    }
    return (
      g +
      T(206, 58, "1.000 Besuche", { s: 11, c: C.muted }) +
      T(206, 86, "25 mit", { s: 13, w: 700, c: C.accent }) +
      T(206, 102, "Conversion", { s: 13, w: 700, c: C.accent }) +
      T(206, 136, "= 2,5 %", { s: 20, w: 700, c: C.accent }) +
      T(20, 140, "1 Punkt = 5 Besuche", { s: 9.5, c: C.muted }) +
      D(
        d,
        T(
          20,
          156,
          "Modell: besuchsbasiert (Besuche mit mind. einer Conversion)",
          { s: 9.5, c: C.muted },
        ),
      )
    );
  },

  ctr: (d) => {
    let g = "";
    for (let i = 0; i < 50; i++) {
      const x = 20 + (i % 10) * 26,
        y = 40 + Math.floor(i / 10) * 18;
      g += R(x, y, 22, 14, i === 23 ? HATCH.accent : C.white, {
        stroke: i === 23 ? C.accent : C.line,
        rx: 2,
        sw: 0.8,
      });
    }
    return (
      g +
      P("M101 79 l0 14 l3.5 -3.5 l3 6 l2.2 -1 l-3 -6 l5 0 z", C.ink) +
      T(20, 148, "10.000 Einblendungen", { s: 11, c: C.muted }) +
      T(20, 168, "200 Klicks = 2 %", { s: 15, w: 700, c: C.accent }) +
      D(
        d,
        T(300, 148, "1 Feld = 200 Einblendungen", {
          s: 9.5,
          c: C.muted,
          a: "end",
        }),
      )
    );
  },

  cpc: (d) => {
    let g = "";
    for (let i = 0; i < 200; i++) {
      const x = 126 + (i % 20) * 8.6,
        y = 46 + Math.floor(i / 20) * 7.8;
      g +=
        i === 0
          ? circle(x, y, 3.2, C.accent)
          : circle(x, y, 2.2, C.accentSoft, C.accent);
    }
    return (
      R(20, 60, 70, 50, C.amberSoft, { stroke: C.amber }) +
      T(55, 90, "100 €", { s: 15, w: 700, a: "middle" }) +
      T(55, 126, "Werbekosten", { s: 10, c: C.muted, a: "middle" }) +
      L(96, 85, 116, 85, { arrow: true }) +
      g +
      T(208, 142, "200 Klicks", { s: 11, c: C.muted, a: "middle" }) +
      T(208, 164, "0,50 € je Klick", {
        s: 15,
        w: 700,
        c: C.accent,
        a: "middle",
      }) +
      D(d, T(126, 36, "1 Punkt = 1 Klick", { s: 9, c: C.muted }))
    );
  },

  cpm: (d) => {
    let g = "";
    for (let i = 0; i < 50; i++) {
      const x = 20 + (i % 10) * 28,
        y = 48 + Math.floor(i / 10) * 20;
      g += R(x, y, 24, 16, i === 0 ? HATCH.accent : C.accentSoft, {
        stroke: C.accent,
        rx: 2,
        sw: 0.7,
      });
    }
    return (
      T(20, 38, "100 € gesamt", { s: 12, w: 700 }) +
      T(150, 38, "CPM = 2 €", { s: 13, w: 700, c: C.accent }) +
      g +
      T(20, 166, "1 Kästchen = 1.000 Einblendungen → 2 €", { s: 11, w: 600 }) +
      D(d, T(300, 166, "50.000 gesamt", { s: 9.5, c: C.muted, a: "end" }))
    );
  },

  cpa: (d) => {
    let g = "";
    for (let i = 0; i < 20; i++) {
      g += R(20 + i * 14, 70, 14, 40, i === 0 ? HATCH.teal : C.tealSoft, {
        rx: 0,
        stroke: C.teal,
        sw: 0.8,
      });
      g += check(27 + i * 14, 124, C.teal);
    }
    return (
      g +
      bracket(20, 300, 62, "Werbekosten 500 €", { w: 600, s: 12 }) +
      T(20, 150, "20 Conversions", { s: 11, c: C.muted }) +
      T(20, 168, "25 € je Conversion", { s: 15, w: 700, c: C.teal }) +
      D(
        d,
        T(300, 150, "1 Abschnitt = 25 €", { s: 9.5, c: C.muted, a: "end" }) +
          T(300, 166, "Conversion ≠ Neukunde", {
            s: 9.5,
            c: C.muted,
            a: "end",
          }),
      )
    );
  },

  roas: (d) =>
    R(20, 70, 40, 50, C.amberSoft, { stroke: C.amber }) +
    T(40, 64, "500 €", { s: 12, w: 700, a: "middle" }) +
    T(40, 136, "Werbe-", { s: 10, c: C.muted, a: "middle" }) +
    T(40, 148, "kosten", { s: 10, c: C.muted, a: "middle" }) +
    L(66, 95, 94, 95, { arrow: true }) +
    [102, 146, 190, 234]
      .map(
        (x) =>
          R(x, 70, 40, 50, C.accentSoft, { stroke: C.accent }) +
          T(x + 20, 99, "500 €", { s: 10, w: 600, a: "middle" }),
      )
      .join("") +
    bracket(102, 274, 62, "zugeordneter Umsatz 2.000 €", { w: 600, s: 11 }) +
    T(188, 142, "× 4 = ROAS 4,0", { s: 14, w: 700, c: C.accent, a: "middle" }) +
    T(188, 160, "Umsatz – kein Gewinn", {
      s: 11,
      w: 600,
      c: C.rose,
      a: "middle",
    }) +
    D(
      d,
      T(188, 175, "davon gehen noch Waren- und Betriebskosten ab", {
        s: 9,
        c: C.muted,
        a: "middle",
      }),
    ),

  cac: (d) => {
    let g = "";
    for (let i = 0; i < 30; i++)
      g += person(
        138 + (i % 10) * 16,
        34 + Math.floor(i / 10) * 26,
        18,
        C.accent,
      );
    return (
      R(16, 40, 80, 34, C.accentSoft, { stroke: C.accent }) +
      T(56, 55, "Marketing", { s: 10, a: "middle" }) +
      T(56, 68, "2.000 €", { s: 11, w: 700, a: "middle" }) +
      R(16, 80, 40, 34, C.tealSoft, { stroke: C.teal }) +
      T(36, 95, "Vertrieb", { s: 8.5, a: "middle" }) +
      T(36, 108, "1.000 €", { s: 9.5, w: 700, a: "middle" }) +
      L(102, 77, 122, 77, { arrow: true }) +
      g +
      T(214, 134, "30 Neukunden", { s: 11, c: C.muted, a: "middle" }) +
      T(214, 156, "100 € je Neukunde", {
        s: 15,
        w: 700,
        c: C.accent,
        a: "middle",
      }) +
      D(d, T(16, 134, "zusammen 3.000 €", { s: 10, c: C.muted }))
    );
  },

  arpu: (d) => {
    let g = "";
    for (let i = 0; i < 100; i++)
      g += R(
        122 + (i % 10) * 11,
        28 + Math.floor(i / 10) * 11,
        9,
        9,
        i === 0 ? C.accent : C.accentSoft,
        { rx: 1.5, stroke: C.accent, sw: 0.5 },
      );
    return (
      R(16, 60, 76, 50, C.accentSoft, { stroke: C.accent }) +
      T(54, 84, "5.000 €", { s: 13, w: 700, a: "middle" }) +
      T(54, 99, "im Monat", { s: 9.5, c: C.muted, a: "middle" }) +
      L(96, 85, 116, 85, { arrow: true }) +
      g +
      T(244, 70, "100", { s: 14, w: 700 }) +
      T(244, 84, "Accounts", { s: 10, c: C.muted }) +
      T(244, 116, "50 € je", { s: 13, w: 700, c: C.accent }) +
      T(244, 131, "Account", { s: 13, w: 700, c: C.accent }) +
      D(
        d,
        T(122, 156, "1 Feld = 1 aktiver Account (Durchschnitt)", {
          s: 9.5,
          c: C.muted,
        }),
      )
    );
  },

  clv: (d) => {
    let g = "";
    for (let y = 0; y < 3; y++) {
      g += R(20 + y * 62, 58, 58, 26, y % 2 ? C.white : C.soft, {
        stroke: C.line,
        rx: 3,
      });
      for (let k = 0; k < 4; k++)
        g += circle(30 + y * 62 + k * 12.5, 71, 4.6, C.accentSoft, C.accent);
      g += T(49 + y * 62, 98, `Jahr ${y + 1}`, {
        s: 10,
        c: C.muted,
        a: "middle",
      });
    }
    return (
      g +
      L(206, 71, 224, 71, { arrow: true }) +
      R(230, 30, 56, 72, C.greySoft, { stroke: C.grey }) +
      R(230, 30, 56, 48, HATCH.teal, { stroke: C.teal }) +
      R(230, 78, 56, 72, C.greySoft, { stroke: C.grey }) +
      pill(258, 54, 46, "240 €", C.teal, 11) +
      T(258, 118, "360 €", { s: 9.5, c: C.muted, a: "middle" }) +
      T(258, 166, "Umsatz 600 €", { s: 10, c: C.muted, a: "middle" }) +
      T(20, 128, "50 € × 4 × 3 = 600 € Umsatz", { s: 11, w: 600 }) +
      T(20, 150, "× 40 % DB = 240 € CLV", { s: 14, w: 700, c: C.teal }) +
      D(
        d,
        T(20, 50, "4 Käufe à 50 € pro Jahr", { s: 9.5, c: C.muted }) +
          T(20, 170, "Modellwert: konstante Annahmen, ohne Abzinsung", {
            s: 9.5,
            c: C.muted,
          }) +
          T(258, 132, "variable Kosten", { s: 8, c: C.muted, a: "middle" }),
      )
    );
  },

  churn: (d) => {
    let g = "";
    for (let i = 0; i < 100; i++) {
      const lost = i >= 90;
      g += person(
        22 + (i % 10) * 13,
        28 + Math.floor(i / 10) * 13,
        11,
        lost ? C.grey : C.teal,
      );
    }
    let neu = "";
    for (let i = 0; i < 5; i++) neu += person(182 + i * 16, 124, 14, C.accent);
    return (
      g +
      L(16, 151, 148, 151, { c: C.rose, sw: 1.6 }) +
      T(164, 48, "100 Anfangskunden", { s: 11, c: C.muted }) +
      T(164, 76, "10 % Churn", { s: 15, w: 700, c: C.rose }) +
      T(164, 98, "90 % Retention", { s: 15, w: 700, c: C.teal }) +
      R(170, 114, 132, 54, C.white, { stroke: C.grey, dash: true, rx: 6 }) +
      neu +
      T(236, 160, "+20 Neukunden – separat", {
        s: 9.5,
        c: C.muted,
        a: "middle",
      }) +
      D(
        d,
        T(16, 176, "graue Reihe: 10 verlorene Kunden der Anfangskohorte", {
          s: 9,
          c: C.muted,
        }),
      )
    );
  },

  mrr: (d) => {
    let g = "";
    for (let i = 0; i < 10; i++)
      g += R(16 + i * 14, 40, 11, 16, C.accentSoft, {
        stroke: C.accent,
        rx: 2,
        sw: 0.8,
      });
    for (let i = 0; i < 12; i++)
      g += R(16 + i * 13, 86, 10, 16, C.tealSoft, {
        stroke: C.teal,
        rx: 2,
        sw: 0.8,
      });
    return (
      T(16, 33, "10 Monatsabos à 20 €", { s: 10, c: C.muted }) +
      T(16, 79, "12 Jahresabos à 120 €", { s: 10, c: C.muted }) +
      g +
      T(172, 53, "= 200 € je Monat", { s: 11, w: 600 }) +
      T(186, 99, "÷ 12 = 120 € je Monat", { s: 11, w: 600 }) +
      L(16, 120, 304, 120, { c: C.line }) +
      T(16, 146, "MRR 320 €", { s: 16, w: 700, c: C.accent }) +
      T(112, 146, "→ × 12 =", { s: 11, c: C.muted }) +
      T(304, 146, "ARR 3.840 €", { s: 16, w: 700, c: C.teal, a: "end" }) +
      D(
        d,
        T(
          16,
          170,
          "ARR = hochgerechnete Run-Rate, kein verbuchter Jahresumsatz",
          { s: 9.5, c: C.muted },
        ),
      )
    );
  },

  nps: (d) =>
    R(20, 50, 168, 36, HATCH.accent, { stroke: C.accent, rx: 0 }) +
    R(188, 50, 28, 36, C.greySoft, { stroke: C.grey, rx: 0 }) +
    R(216, 50, 84, 36, HATCH.rose, { stroke: C.rose, rx: 0 }) +
    pill(104, 68, 50, "+ 60", C.accent) +
    pill(258, 68, 50, "− 30", C.rose) +
    T(202, 72, "10", { s: 10, w: 700, a: "middle" }) +
    T(20, 102, "Promotoren (9–10)", { s: 10, w: 600, c: C.accent }) +
    T(300, 102, "Detraktoren (0–6)", { s: 10, w: 600, c: C.rose, a: "end" }) +
    L(20, 142, 300, 142, { c: C.ink }) +
    L(160, 138, 160, 146, { c: C.ink }) +
    P("M202 137 l-5 -8 h10 z", C.accent) +
    T(202, 125, "NPS +30", { s: 14, w: 700, c: C.accent, a: "middle" }) +
    T(20, 158, "−100", { s: 9.5, c: C.muted }) +
    T(160, 158, "0", { s: 9.5, c: C.muted, a: "middle" }) +
    T(300, 158, "+100", { s: 9.5, c: C.muted, a: "end" }) +
    D(
      d,
      T(202, 40, "Passive", { s: 9, c: C.muted, a: "middle" }) +
        T(160, 174, "60 % − 30 % = +30 Punkte, keine Prozentquote", {
          s: 9.5,
          c: C.muted,
          a: "middle",
        }),
    ),

  "soll-ist": (d) =>
    L(40, 150, 212, 150, { c: C.ink }) +
    R(60, 50, 60, 100, C.greySoft, { stroke: C.grey }) +
    R(140, 50, 60, 100, C.accentSoft, { stroke: C.accent }) +
    R(140, 40, 60, 10, HATCH.accent, { stroke: C.accent }) +
    L(50, 50, 212, 50, { dash: true, c: C.grey }) +
    T(90, 44, "Soll 100", { s: 11, w: 700, a: "middle" }) +
    T(170, 34, "Ist 110", { s: 11, w: 700, a: "middle" }) +
    T(170, 104, "+10 / +10 %", { s: 11, w: 700, c: C.accent, a: "middle" }) +
    R(222, 70, 88, 32, C.tealSoft, { stroke: C.teal }) +
    check(234, 87, C.teal) +
    T(244, 83, "Ertragsziel:", { s: 9 }) +
    T(244, 95, "günstig", { s: 10, w: 700, c: C.teal }) +
    R(222, 110, 88, 32, C.roseSoft, { stroke: C.rose }) +
    cross(234, 126, C.rose) +
    T(244, 123, "Kostenziel:", { s: 9 }) +
    T(244, 135, "ungünstig", { s: 10, w: 700, c: C.rose }) +
    D(
      d,
      T(
        126,
        168,
        "gleiche Abweichung – Bewertung hängt von der Zielrichtung ab",
        { s: 9.5, c: C.muted, a: "middle" },
      ),
    ),

  auslastung: (d) =>
    R(110, 30, 100, 120, C.white, { stroke: C.ink }) +
    R(110, 60, 100, 90, HATCH.teal, { stroke: C.teal }) +
    L(104, 60, 216, 60, { dash: true, c: C.grey }) +
    T(222, 64, "75 h genutzt", { s: 11, w: 600, c: C.teal }) +
    T(222, 44, "25 h frei", { s: 10, c: C.muted }) +
    T(102, 36, "100 h", { s: 9.5, c: C.muted, a: "end" }) +
    T(102, 152, "0", { s: 9.5, c: C.muted, a: "end" }) +
    T(20, 106, "75 %", { s: 24, w: 700, c: C.teal }) +
    D(
      d,
      T(160, 170, "gleiche Einheit und Periode: Stunden im Monat", {
        s: 9.5,
        c: C.muted,
        a: "middle",
      }),
    ),

  lager: (d) => {
    let g = "";
    for (let i = 0; i < 6; i++)
      g += R(
        104 + i * (200 / 6),
        64,
        200 / 6,
        26,
        i % 2 ? C.white : C.accentSoft,
        { rx: 0, stroke: C.accent, sw: 0.8 },
      );
    return (
      R(16, 50, 70, 56, C.amberSoft, { stroke: C.amber }) +
      L(16, 68, 86, 68, { c: C.amber }) +
      L(16, 87, 86, 87, { c: C.amber }) +
      T(51, 122, "Ø Bestand", { s: 10, c: C.muted, a: "middle" }) +
      T(51, 136, "20.000 €", { s: 11, w: 700, a: "middle" }) +
      g +
      T(104, 58, "0", { s: 9, c: C.muted }) +
      T(304, 58, "360 Tage", { s: 9, c: C.muted, a: "end" }) +
      T(204, 106, "6 Umschläge à 60 Tage", { s: 11, w: 600, a: "middle" }) +
      T(104, 140, "120.000 € / 20.000 €", { s: 10.5 }) +
      T(104, 160, "= 6 Umschläge · 60 Tage", { s: 14, w: 700, c: C.accent }) +
      D(
        d,
        T(104, 176, "Wareneinsatz pro Jahr / Ø Bestand; 360 / 6 = 60", {
          s: 9,
          c: C.muted,
        }),
      )
    );
  },
};
