import type { CalcDef } from "../types";
import { D, val, out, eur, pct } from "../helpers";
import { Decimal } from "../../lib/decimal";

const def: CalcDef = {
  id: "zielpreis",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Verkaufspreis aus Zielmarge",
      favLabel: "Verkaufspreis aus Zielmarge",
      fields: [
        {
          key: "k",
          label: "Kostenbasis",
          unit: "€",
          min: "positive",
          help: "z. B. Einstandspreis netto",
        },
        {
          key: "m",
          label: "Gewünschte Rohmarge",
          unit: "%",
          min: "nonneg",
          maxExclusive: 100,
          help: "Anteil am Verkaufspreis, mindestens 0 und unter 100 %",
        },
      ],
      example: { k: "80", m: "20" },
      compute(i) {
        const k = val(i, "k"),
          m = val(i, "m");
        const f = D(1).sub(m.div(100));
        const theo = k.div(f);
        const cent = theo.toDecimalPlaces(2, Decimal.ROUND_UP);
        const actual = cent.sub(k).div(cent).mul(100);
        return {
          status: "ok",
          main: out(
            "Mindest-Verkaufspreis (auf Cent aufgerundet)",
            cent,
            "money",
          ),
          extra: [
            out("Theoretischer Nettoverkaufspreis", theo, "number", "€"),
            out("Tatsächliche Marge bei diesem Preis", actual, "percent"),
          ],
          meaning: `Bei ${eur(cent)} bleiben mindestens ${pct(m)} des Preises als Rohertrag übrig.`,
          steps: [
            `Verkaufspreis = Kostenbasis / (1 − Zielmarge / 100)`,
            `= ${eur(k)} / (1 − ${pct(m)}) = ${eur(k)} / ${f.toString().replace(".", ",")} = ${theo.toDecimalPlaces(6).toString().replace(".", ",")} €`,
            `Auf volle Cent aufgerundet: ${eur(cent)}; Marge = (${eur(cent)} − ${eur(k)}) / ${eur(cent)} × 100 = ${pct(actual)}`,
          ],
          notes: [
            "Nicht einfach die Marge auf die Kosten aufschlagen: 20 % Aufschlag auf 80 € ergäben nur 96 € und 16,67 % Marge.",
          ],
        };
      },
    },
  ],
};
export default def;
