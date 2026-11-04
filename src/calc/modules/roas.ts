import type { CalcDef } from "../types";
import { val, out, eur, pct, undef, formatValue } from "../helpers";

const def: CalcDef = {
  id: "roas",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "ROAS",
      favLabel: "ROAS berechnen",
      fields: [
        {
          key: "umsatz",
          label: "Zugeordneter Werbeumsatz",
          unit: "€",
          min: "nonneg",
          help: "Umsatz, den die Messung dieser Werbung zuordnet",
        },
        {
          key: "kosten",
          label: "Werbekosten",
          unit: "€",
          min: "nonneg",
          help: "im selben Zeitraum",
        },
      ],
      example: { umsatz: "2000", kosten: "500" },
      compute(i) {
        const u = val(i, "umsatz"),
          k = val(i, "kosten");
        if (k.isZero())
          return undef(
            "Bei 0 € Werbekosten ist der ROAS mathematisch nicht definiert (keine Division durch 0).",
          );
        const f = u.div(k);
        return {
          status: "ok",
          main: out("ROAS", f, "factor"),
          extra: [out("ROAS in Prozent", f.mul(100), "percent")],
          meaning: `Pro eingesetztem Werbe-Euro wurden ${eur(f)} Umsatz zugeordnet (${formatValue(f, "factor")}). Das ist Umsatz, kein Gewinn.`,
          steps: [
            `ROAS = Werbeumsatz / Werbekosten = ${eur(u)} / ${eur(k)} = ${formatValue(f, "factor")} = ${pct(f.mul(100))}`,
          ],
          notes: [
            "ROAS ist keine Gewinnkennzahl. Attribution und Umsatzdefinition beeinflussen das Ergebnis stark.",
          ],
        };
      },
    },
  ],
};
export default def;
