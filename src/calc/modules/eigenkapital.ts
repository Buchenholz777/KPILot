import type { CalcDef } from "../types";
import { val, out, eur, pct } from "../helpers";

const def: CalcDef = {
  id: "eigenkapital",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Eigenkapitalquote",
      favLabel: "Eigenkapitalquote berechnen",
      fields: [
        {
          key: "ek",
          label: "Eigenkapital am Stichtag",
          unit: "€",
          min: "any",
          help: "Kann bei Überschuldung negativ sein",
        },
        {
          key: "gk",
          label: "Gesamtkapital (Bilanzsumme) am selben Stichtag",
          unit: "€",
          min: "positive",
        },
      ],
      example: { ek: "30000", gk: "100000" },
      compute(i) {
        const ek = val(i, "ek"),
          gk = val(i, "gk");
        const q = ek.div(gk).mul(100);
        const fk = gk.sub(ek);
        const notes = [
          "Keine pauschale Bonitätsbewertung: Angemessene Quoten unterscheiden sich nach Branche und Geschäftsmodell.",
        ];
        if (ek.isNegative())
          notes.unshift(
            "Negatives Eigenkapital: Die Schulden übersteigen das Vermögen (bilanzielle Überschuldung).",
          );
        if (ek.gt(gk))
          notes.unshift(
            "Eigenkapital größer als die Bilanzsumme ist unplausibel – bitte Stichtag und Bilanzbasis prüfen.",
          );
        return {
          status: "ok",
          main: out("Eigenkapitalquote", q, "percent"),
          extra: [out("Fremdkapital (Rest)", fk, "money")],
          meaning: `${pct(q)} des Gesamtkapitals stammen aus eigenen Mitteln, der Rest ist Fremdkapital.`,
          steps: [
            `Quote = Eigenkapital / Gesamtkapital × 100 = ${eur(ek)} / ${eur(gk)} × 100 = ${pct(q)}`,
          ],
          notes,
          chart: {
            kind: "bars",
            summary: `Von ${eur(gk)} Gesamtkapital sind ${eur(ek)} Eigenkapital und ${eur(fk)} Fremdkapital; die Eigenkapitalquote beträgt ${pct(q)}.`,
            panels: [
              {
                title: "Kapitalstruktur (€)",
                bars: [
                  { label: "Eigenkapital", value: ek.abs().toNumber(), text: eur(ek), emphasis: !ek.isNegative(), negative: ek.isNegative() },
                  { label: "Fremdkapital", value: fk.abs().toNumber(), text: eur(fk), negative: fk.isNegative() },
                  { label: "Gesamtkapital", value: gk.toNumber(), text: eur(gk) },
                ],
              },
            ],
            table: {
              head: ["Größe", "Betrag"],
              rows: [
                ["Eigenkapital", eur(ek)],
                ["Fremdkapital (Rest)", eur(fk)],
                ["Gesamtkapital (Bilanzsumme)", eur(gk)],
              ],
            },
          },
        };
      },
    },
  ],
};
export default def;
