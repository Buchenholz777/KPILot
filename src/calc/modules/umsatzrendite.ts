import type { CalcDef } from "../types";
import { val, out, eur, pct, undef } from "../helpers";

const def: CalcDef = {
  id: "umsatzrendite",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Nettoumsatzrendite",
      favLabel: "Umsatzrendite berechnen",
      fields: [
        {
          key: "ergebnis",
          label: "Jahresüberschuss bzw. Periodenergebnis",
          unit: "€",
          min: "any",
          help: "Ergebnis nach Zinsen und Ertragsteuern",
        },
        {
          key: "umsatz",
          label: "Nettoumsatz derselben Periode",
          unit: "€",
          min: "any",
        },
      ],
      example: { ergebnis: "8000", umsatz: "100000" },
      compute(i) {
        const e = val(i, "ergebnis"),
          u = val(i, "umsatz");
        if (u.isZero())
          return undef(
            "Bei einem Umsatz von 0 € ist die Umsatzrendite nicht definiert.",
          );
        const r = e.div(u).mul(100);
        return {
          status: "ok",
          main: out("Nettoumsatzrendite", r, "percent", undefined, true),
          meaning: `Nach allen Aufwendungen, Zinsen und Ertragsteuern bleiben ${pct(r)} des Umsatzes als Ergebnis.`,
          steps: [
            `Umsatzrendite = Jahresüberschuss / Nettoumsatz × 100 = ${eur(e)} / ${eur(u)} × 100 = ${pct(r)}`,
          ],
          notes: [
            "Nicht verwechseln mit Rohmarge, Deckungsbeitragsquote oder EBIT-Marge – dort ist weniger abgezogen.",
          ],
          tone: e.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
