import type { CalcDef } from "../types";
import { val, out, eur, pct, undef } from "../helpers";

const def: CalcDef = {
  id: "ebit-marge",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "EBIT-Marge",
      favLabel: "EBIT-Marge berechnen",
      fields: [
        { key: "ebit", label: "EBIT", unit: "€", min: "any" },
        {
          key: "umsatz",
          label: "Nettoumsatz derselben Periode",
          unit: "€",
          min: "any",
        },
      ],
      example: { ebit: "20000", umsatz: "100000" },
      compute(i) {
        const e = val(i, "ebit"),
          u = val(i, "umsatz");
        if (u.isZero())
          return undef(
            "Bei einem Umsatz von 0 € ist die EBIT-Marge nicht definiert.",
          );
        const m = e.div(u).mul(100);
        return {
          status: "ok",
          main: out("EBIT-Marge", m, "percent", undefined, true),
          meaning: `Von jedem Euro Umsatz bleiben rechnerisch ${pct(m)} – also ${eur(m.div(100))} je Euro – als Ergebnis vor Zinsen und Ertragsteuern.`,
          steps: [
            `EBIT-Marge = EBIT / Nettoumsatz × 100 = ${eur(e)} / ${eur(u)} × 100 = ${pct(m)}`,
          ],
          notes: u.isNegative()
            ? [
                "Negativer Umsatz (z. B. durch Gutschriften): Die Marge ist kaum sinnvoll interpretierbar.",
              ]
            : [
                "Keine pauschale Bewertung: Übliche Margen unterscheiden sich stark nach Branche.",
              ],
          tone: e.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
