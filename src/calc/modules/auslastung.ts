import type { CalcDef } from "../types";
import { val, out, num, pct } from "../helpers";

const def: CalcDef = {
  id: "auslastung",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Kapazitätsauslastung",
      favLabel: "Auslastung berechnen",
      fields: [
        {
          key: "genutzt",
          label: "Genutzte Kapazität",
          min: "nonneg",
          help: "z. B. Stunden im Monat",
        },
        {
          key: "verfuegbar",
          label: "Verfügbare Kapazität",
          min: "positive",
          help: "gleiche Einheit und Periode",
        },
      ],
      example: { genutzt: "75", verfuegbar: "100" },
      compute(i) {
        const g = val(i, "genutzt"),
          v = val(i, "verfuegbar");
        const a = g.div(v).mul(100);
        return {
          status: "ok",
          main: out("Auslastung", a, "percent"),
          extra: [out("Freie Kapazität", v.sub(g), "number")],
          meaning: a.gt(100)
            ? `Die Kapazität ist um ${pct(a.sub(100))} überschritten – mehr genutzt als angegeben verfügbar war.`
            : `${pct(a)} der verfügbaren Kapazität wurden genutzt.`,
          steps: [
            `Auslastung = genutzt / verfügbar × 100 = ${num(g)} / ${num(v)} × 100 = ${pct(a)}`,
          ],
          notes: [
            "Personenstunden, Maschinenstunden und Kalenderzeit nicht mischen.",
          ],
          tone: a.gt(100) ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
