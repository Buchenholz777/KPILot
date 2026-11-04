import type { CalcDef } from "../types";
import { val, out, eur, num, undef } from "../helpers";

const def: CalcDef = {
  id: "cpm",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "CPM",
      favLabel: "CPM berechnen",
      fields: [
        { key: "kosten", label: "Werbekosten", unit: "€", min: "nonneg" },
        {
          key: "imp",
          label: "Impressionen",
          min: "nonneg",
          integer: true,
          help: "Anzahl der Einblendungen im selben Zeitraum",
        },
      ],
      example: { kosten: "100", imp: "50000" },
      compute(i) {
        const c = val(i, "kosten"),
          m = val(i, "imp");
        if (m.isZero())
          return undef(
            "Bei 0 Impressionen ist kein Tausenderkontaktpreis definiert.",
          );
        const r = c.div(m).mul(1000);
        return {
          status: "ok",
          main: out("CPM", r, "money", "je 1.000 Impressionen"),
          meaning: `1.000 Einblendungen haben im Durchschnitt ${eur(r)} gekostet.`,
          steps: [
            `CPM = Werbekosten / Impressionen × 1.000 = ${eur(c)} / ${num(m)} × 1.000 = ${eur(r)}`,
          ],
        };
      },
    },
  ],
};
export default def;
