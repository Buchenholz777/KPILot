import type { CalcDef } from "../types";
import { val, out, num, pct, undef } from "../helpers";

const def: CalcDef = {
  id: "ctr",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "CTR",
      favLabel: "CTR berechnen",
      fields: [
        { key: "klicks", label: "Klicks", min: "nonneg", integer: true },
        {
          key: "imp",
          label: "Impressionen (Einblendungen)",
          min: "nonneg",
          integer: true,
          help: "gleiche Kampagne, gleicher Zeitraum",
        },
      ],
      example: { klicks: "200", imp: "10000" },
      compute(i) {
        const k = val(i, "klicks"),
          m = val(i, "imp");
        if (m.isZero())
          return undef("Bei 0 Impressionen ist keine Klickrate definiert.");
        const r = k.div(m).mul(100);
        return {
          status: "ok",
          main: out("Klickrate (CTR)", r, "percent"),
          meaning: `${pct(r)} der Einblendungen wurden angeklickt – ${num(k)} von ${num(m)}.`,
          steps: [
            `CTR = Klicks / Impressionen × 100 = ${num(k)} / ${num(m)} × 100 = ${pct(r)}`,
          ],
          notes: r.gt(100)
            ? [
                "Über 100 %: Vermutlich werden Mehrfachklicks gezählt oder Klicks und Impressionen unterschiedlich gemessen.",
              ]
            : undefined,
        };
      },
    },
  ],
};
export default def;
