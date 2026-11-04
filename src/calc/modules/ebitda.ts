import type { CalcDef } from "../types";
import { val, out, eur } from "../helpers";

const def: CalcDef = {
  id: "ebitda",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "EBITDA",
      favLabel: "EBITDA berechnen",
      fields: [
        {
          key: "ebit",
          label: "EBIT",
          unit: "€",
          min: "any",
          help: "Ergebnis vor Zinsen und Ertragsteuern",
        },
        {
          key: "afa",
          label: "Im EBIT abgezogene Abschreibungen",
          unit: "€",
          min: "nonneg",
          help: "auf Sachanlagen und immaterielle Vermögenswerte – nicht auf Finanzanlagen",
        },
      ],
      example: { ebit: "20000", afa: "10000" },
      compute(i) {
        const e = val(i, "ebit"),
          a = val(i, "afa");
        const r = e.add(a);
        return {
          status: "ok",
          main: out("EBITDA", r, "money", undefined, true),
          meaning: `Vor Zinsen, Steuern und Abschreibungen beträgt das operative Ergebnis ${eur(r)}. Das ist weder Cashflow noch frei verfügbares Geld.`,
          steps: [
            `EBITDA = EBIT + Abschreibungen = ${eur(e)} + ${eur(a)} = ${eur(r)}`,
          ],
          notes: [
            "Ein positives EBITDA kann mit negativem Cashflow einhergehen, z. B. bei unbezahlten Rechnungen oder Lageraufbau.",
          ],
        };
      },
    },
  ],
};
export default def;
