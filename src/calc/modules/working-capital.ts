import type { CalcDef } from "../types";
import { val, out, eur } from "../helpers";

const def: CalcDef = {
  id: "working-capital",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Working Capital",
      favLabel: "Working Capital berechnen",
      fields: [
        {
          key: "uv",
          label: "Umlaufvermögen am Stichtag",
          unit: "€",
          min: "nonneg",
          help: "liquide Mittel, Forderungen, Vorräte, sonstiges kurzfristiges Vermögen",
        },
        {
          key: "vb",
          label: "Kurzfristige Verpflichtungen am Stichtag",
          unit: "€",
          min: "nonneg",
          help: "kurzfristige Verbindlichkeiten inkl. kurzfristiger Rückstellungen",
        },
      ],
      example: { uv: "50000", vb: "30000" },
      compute(i) {
        const uv = val(i, "uv"),
          vb = val(i, "vb");
        const wc = uv.sub(vb);
        return {
          status: "ok",
          main: out("Working Capital", wc, "money", undefined, true),
          meaning: wc.isNegative()
            ? `Die kurzfristigen Verpflichtungen übersteigen das Umlaufvermögen um ${eur(wc.abs())}.`
            : `Das Umlaufvermögen übersteigt die kurzfristigen Verpflichtungen um ${eur(wc)}.`,
          steps: [
            `Working Capital = Umlaufvermögen − kurzfristige Verpflichtungen = ${eur(uv)} − ${eur(vb)} = ${eur(wc)}`,
          ],
          notes: [
            "Stichtagsgröße – nicht dasselbe wie freies Bankguthaben oder Cashflow.",
          ],
          tone: wc.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
