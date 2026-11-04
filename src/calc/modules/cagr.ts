import type { CalcDef } from "../types";
import { D, val, out, num, pct } from "../helpers";

const def: CalcDef = {
  id: "cagr",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "CAGR",
      favLabel: "Durchschnittliches Wachstum (CAGR)",
      fields: [
        {
          key: "a",
          label: "Anfangswert",
          min: "positive",
          help: "Muss größer als 0 sein.",
        },
        { key: "e", label: "Endwert", min: "nonneg" },
        {
          key: "n",
          label: "Anzahl Jahre",
          unit: "Jahre",
          min: "positive",
          help: "Abstand zwischen Anfangs- und Endwert, auch z. B. 2,5",
        },
      ],
      example: { a: "100", e: "121", n: "2" },
      compute(i) {
        const a = val(i, "a"),
          e = val(i, "e"),
          n = val(i, "n");
        const ratio = e.div(a);
        const factor = ratio.isZero() ? D(0) : ratio.pow(D(1).div(n));
        const cagr = factor.sub(1).mul(100);
        const total = ratio.sub(1).mul(100);
        return {
          status: "ok",
          main: out(
            "Durchschnittliches Wachstum pro Jahr",
            cagr,
            "percent",
            undefined,
            true,
          ),
          extra: [out("Gesamtveränderung", total, "percent", undefined, true)],
          meaning: `Ein gleichmäßiges Wachstum von ${pct(cagr, true)} pro Jahr führt in ${num(n)} Jahren von ${num(a)} auf ${num(e)}.`,
          steps: [
            `CAGR = ((Endwert / Anfangswert)^(1 / Jahre) − 1) × 100`,
            `= ((${num(e)} / ${num(a)})^(1 / ${num(n)}) − 1) × 100 = ${pct(cagr, true)}`,
          ],
          notes: [
            "Geglättete Modellrate: Die tatsächlichen Zwischenjahre können ganz anders verlaufen sein.",
          ],
        };
      },
    },
  ],
};
export default def;
