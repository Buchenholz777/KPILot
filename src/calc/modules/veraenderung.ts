import type { CalcDef } from "../types";
import { val, out, num, pct } from "../helpers";

const def: CalcDef = {
  id: "veraenderung",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Veränderung",
      favLabel: "Prozentuale Veränderung",
      fields: [
        { key: "alt", label: "Alter Wert (vorher)", min: "any" },
        { key: "neu", label: "Neuer Wert (nachher)", min: "any" },
      ],
      example: { alt: "80", neu: "100" },
      compute(i) {
        const a = val(i, "alt"),
          b = val(i, "neu");
        const diff = b.sub(a);
        const absOut = out(
          "Absolute Veränderung",
          diff,
          "number",
          undefined,
          true,
        );
        if (a.isZero()) {
          return {
            status: "undefined",
            message:
              "Der alte Wert ist 0. Eine relative Veränderung in Prozent ist dann nicht definiert – die absolute Veränderung schon.",
            partial: [absOut],
          };
        }
        const rel = diff.div(a).mul(100);
        const notes: string[] = [];
        if (a.isNegative())
          notes.push(
            "Der alte Wert ist negativ. Die Prozentzahl ist rechnerisch korrekt, lässt sich aber nicht wie eine gewöhnliche Wachstumsrate lesen (das Vorzeichen kann irreführen).",
          );
        return {
          status: "ok",
          main: out("Relative Veränderung", rel, "percent", undefined, true),
          extra: [absOut],
          meaning: `Von ${num(a)} auf ${num(b)}: ${num(diff, true)} absolut, das sind ${pct(rel, true)} bezogen auf den alten Wert.`,
          steps: [
            `Differenz = neuer Wert − alter Wert = ${num(b)} − ${num(a)} = ${num(diff, true)}`,
            `Veränderung = Differenz / alter Wert × 100 = ${num(diff)} / ${num(a)} × 100 = ${pct(rel, true)}`,
          ],
          notes: notes.length ? notes : undefined,
          tone: a.isNegative()
            ? "neutral"
            : rel.isNegative()
              ? "negative"
              : rel.isZero()
                ? "neutral"
                : "positive",
        };
      },
    },
  ],
};
export default def;
