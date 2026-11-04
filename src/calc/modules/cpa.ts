import type { CalcDef } from "../types";
import { val, out, eur, num, undef } from "../helpers";

const def: CalcDef = {
  id: "cpa",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "CPA",
      favLabel: "CPA berechnen",
      fields: [
        {
          key: "kosten",
          label: "Zugeordnete Werbekosten",
          unit: "€",
          min: "nonneg",
        },
        {
          key: "conv",
          label: "Conversions",
          min: "nonneg",
          integer: true,
          help: "definiertes Ziel, z. B. Kauf oder Lead – im selben Zeitraum",
        },
      ],
      example: { kosten: "500", conv: "20" },
      compute(i) {
        const c = val(i, "kosten"),
          n = val(i, "conv");
        if (n.isZero())
          return undef(
            "Bei 0 Conversions sind keine Kosten je Conversion definiert.",
          );
        const r = c.div(n);
        return {
          status: "ok",
          main: out("CPA", r, "money", "je Conversion"),
          meaning: `Jede Conversion hat im Durchschnitt ${eur(r)} Werbekosten verursacht.`,
          steps: [
            `CPA = Werbekosten / Conversions = ${eur(c)} / ${num(n)} = ${eur(r)}`,
          ],
          notes: [
            "Eine Conversion ist nicht automatisch ein Neukunde – dafür gibt es den CAC.",
          ],
        };
      },
    },
  ],
};
export default def;
