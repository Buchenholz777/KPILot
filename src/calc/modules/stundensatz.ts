import type { CalcDef } from "../types";
import { val, out, eur, num, undef } from "../helpers";

const def: CalcDef = {
  id: "stundensatz",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Stundenkostensatz",
      favLabel: "Stundenkostensatz berechnen",
      fields: [
        {
          key: "kosten",
          label: "Zugeordnete Kosten der Periode",
          unit: "€",
          min: "nonneg",
          help: "z. B. Lohn, Miete, Versicherung, Werkzeug eines Monats",
        },
        {
          key: "stunden",
          label: "Abrechenbare Stunden derselben Periode",
          unit: "h",
          min: "nonneg",
          help: "Nur produktiv nutzbare Stunden – ohne Urlaub, Leerlauf, Verwaltung",
        },
      ],
      example: { kosten: "1200", stunden: "60" },
      compute(i) {
        const k = val(i, "kosten"),
          h = val(i, "stunden");
        if (h.isZero())
          return undef(
            "Bei 0 abrechenbaren Stunden gibt es keinen definierten Stundensatz.",
          );
        const s = k.div(h);
        return {
          status: "ok",
          main: out("Kosten je Stunde", s, "money", "je Stunde"),
          meaning: `Jede abrechenbare Stunde muss ${eur(s)} einbringen, nur um die Kosten zu decken.`,
          steps: [
            `Kostensatz = Periodenkosten / abrechenbare Stunden = ${eur(k)} / ${num(h)} h = ${eur(s)}/h`,
          ],
          notes: [
            "Das ist ein Kostensatz, noch kein Verkaufspreis: Gewinn und Risiko kommen hinzu.",
          ],
        };
      },
    },
  ],
};
export default def;
