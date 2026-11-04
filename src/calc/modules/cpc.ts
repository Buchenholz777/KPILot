import type { CalcDef } from "../types";
import { val, out, eur, num, undef } from "../helpers";

const def: CalcDef = {
  id: "cpc",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "CPC",
      favLabel: "CPC berechnen",
      fields: [
        { key: "kosten", label: "Werbekosten", unit: "€", min: "nonneg" },
        {
          key: "klicks",
          label: "Klicks",
          min: "nonneg",
          integer: true,
          help: "im selben Zeitraum",
        },
      ],
      example: { kosten: "100", klicks: "200" },
      compute(i) {
        const c = val(i, "kosten"),
          k = val(i, "klicks");
        if (k.isZero())
          return undef(
            "Bei 0 Klicks ist kein Preis je Klick definiert – auch nicht bei 0 € Kosten.",
          );
        const r = c.div(k);
        return {
          status: "ok",
          main: out("Durchschnittlicher CPC", r, "money", "je Klick"),
          meaning: `Jeder Klick hat im Durchschnitt ${eur(r)} gekostet.`,
          steps: [
            `CPC = Werbekosten / Klicks = ${eur(c)} / ${num(k)} = ${eur(r)}`,
          ],
        };
      },
    },
  ],
};
export default def;
