import type { CalcDef } from "../types";
import { val, out, eur, pct } from "../helpers";

const def: CalcDef = {
  id: "roi",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "ROI",
      favLabel: "ROI berechnen",
      fields: [
        {
          key: "gewinn",
          label: "Zurechenbarer Gewinn der Periode",
          unit: "€",
          min: "any",
          help: "Gewinn – nicht Umsatz und nicht bloßer Rückfluss",
        },
        {
          key: "kapital",
          label: "Eingesetztes Kapital",
          unit: "€",
          min: "positive",
        },
      ],
      example: { gewinn: "5000", kapital: "50000" },
      compute(i) {
        const g = val(i, "gewinn"),
          k = val(i, "kapital");
        const r = g.div(k).mul(100);
        return {
          status: "ok",
          main: out(
            "ROI im betrachteten Zeitraum",
            r,
            "percent",
            undefined,
            true,
          ),
          meaning: `Jeder eingesetzte Euro hat im betrachteten Zeitraum ${pct(r)} Gewinn erbracht.`,
          steps: [
            `ROI = Gewinn / eingesetztes Kapital × 100 = ${eur(g)} / ${eur(k)} × 100 = ${pct(r)}`,
          ],
          notes: [
            "Keine automatische Hochrechnung auf ein Jahr. Nicht mit ROAS verwechseln (dort steht Umsatz im Zähler).",
          ],
          tone: g.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
