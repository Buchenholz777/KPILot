import type { CalcDef } from "../types";
import { val, out, pct, formatValue } from "../helpers";

const def: CalcDef = {
  id: "prozentpunkte",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Prozentpunkte",
      favLabel: "Prozentpunkte berechnen",
      fields: [
        {
          key: "alt",
          label: "Alter Prozentwert",
          unit: "%",
          min: "any",
          help: "z. B. eine Quote, ein Zinssatz oder ein Marktanteil",
        },
        { key: "neu", label: "Neuer Prozentwert", unit: "%", min: "any" },
      ],
      example: { alt: "5", neu: "6" },
      compute(i) {
        const a = val(i, "alt"),
          b = val(i, "neu");
        const pp = b.sub(a);
        const ppOut = out(
          "Differenz in Prozentpunkten",
          pp,
          "pp",
          undefined,
          true,
        );
        if (a.isZero()) {
          return {
            status: "undefined",
            message:
              "Der alte Prozentwert ist 0 %. Die Differenz in Prozentpunkten ist bestimmbar, eine relative Veränderung in Prozent nicht.",
            partial: [ppOut],
          };
        }
        const rel = pp.div(a).mul(100);
        return {
          status: "ok",
          main: ppOut,
          extra: [out("Relative Veränderung", rel, "percent", undefined, true)],
          meaning: `Von ${pct(a)} auf ${pct(b)} sind es ${formatValue(pp, "pp", undefined, true)} – relativ zum alten Wert ${pct(rel, true)}.`,
          steps: [
            `Prozentpunkte = neuer Wert − alter Wert = ${pct(b)} − ${pct(a)} = ${formatValue(pp, "pp", undefined, true)}`,
            `Relative Veränderung = Differenz / alter Wert × 100 = ${pct(pp)} / ${pct(a)} × 100 = ${pct(rel, true)}`,
          ],
          notes: a.isNegative()
            ? [
                "Negativer Ausgangswert: Die relative Veränderung ist nur eingeschränkt interpretierbar.",
              ]
            : undefined,
        };
      },
    },
  ],
};
export default def;
