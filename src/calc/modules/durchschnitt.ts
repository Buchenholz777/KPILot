import type { CalcDef } from "../types";
import { D, out, undef, num } from "../helpers";

const def: CalcDef = {
  id: "durchschnitt",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Gewichteter Durchschnitt",
      favLabel: "Gewichteter Durchschnitt",
      fields: [],
      rows: {
        key: "zeilen",
        label: "Werte und Gewichte",
        minRows: 1,
        maxRows: 20,
        addLabel: "Zeile hinzufügen",
        columns: [
          { key: "x", label: "Wert", min: "any" },
          {
            key: "w",
            label: "Gewicht",
            min: "nonneg",
            help: "z. B. Anzahl, Menge oder Anteil",
          },
        ],
      },
      example: {
        zeilen: [
          ["10", "1"],
          ["20", "3"],
        ],
      },
      compute(i) {
        const rows = i.rows.zeilen ?? [];
        const sumW = rows.reduce((s, r) => s.add(r[1]), D(0));
        if (sumW.isZero())
          return undef(
            "Alle Gewichte sind 0. Mindestens ein Gewicht muss größer als 0 sein.",
          );
        const sumXW = rows.reduce((s, r) => s.add(r[0].mul(r[1])), D(0));
        const avg = sumXW.div(sumW);
        const simple = rows
          .reduce((s, r) => s.add(r[0]), D(0))
          .div(rows.length);
        return {
          status: "ok",
          main: out("Gewichteter Durchschnitt", avg, "number"),
          extra: [
            out("Summe der Gewichte", sumW, "number"),
            out("Einfacher Mittelwert (zum Vergleich)", simple, "number"),
          ],
          meaning: `Werte mit größerem Gewicht zählen stärker: Der gewichtete Durchschnitt beträgt ${num(avg)}.`,
          steps: [
            `Summe(Wert × Gewicht) = ${rows.map((r) => `${num(r[0])} × ${num(r[1])}`).join(" + ")} = ${num(sumXW)}`,
            `Summe(Gewichte) = ${rows.map((r) => num(r[1])).join(" + ")} = ${num(sumW)}`,
            `Durchschnitt = ${num(sumXW)} / ${num(sumW)} = ${num(avg)}`,
          ],
        };
      },
    },
  ],
};
export default def;
