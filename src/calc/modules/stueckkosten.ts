import type { CalcDef } from "../types";
import { val, out, eur, num } from "../helpers";

const def: CalcDef = {
  id: "stueckkosten",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Gesamt- & Stückkosten",
      favLabel: "Gesamt- und Stückkosten",
      fields: [
        { key: "F", label: "Fixkosten im Zeitraum", unit: "€", min: "nonneg" },
        {
          key: "v",
          label: "Variable Kosten je Stück",
          unit: "€ je Stück",
          min: "nonneg",
        },
        {
          key: "q",
          label: "Produzierte Menge",
          unit: "Stück",
          min: "nonneg",
          integer: true,
          help: "Menge im selben Zeitraum wie die Fixkosten",
        },
      ],
      example: { F: "1000", v: "10", q: "100" },
      compute(i) {
        const F = val(i, "F"),
          v = val(i, "v"),
          q = val(i, "q");
        const K = F.add(v.mul(q));
        const kOut = out("Gesamtkosten", K, "money");
        if (q.isZero())
          return {
            status: "undefined",
            message:
              "Bei 0 Stück sind die Gesamtkosten bekannt (nur Fixkosten), Stückkosten aber nicht definiert.",
            partial: [kOut],
          };
        const k = K.div(q);
        return {
          status: "ok",
          main: out("Stückkosten", k, "money", "je Stück"),
          extra: [
            kOut,
            out("Fixkostenanteil je Stück", F.div(q), "money"),
            out("Variabler Anteil je Stück", v, "money"),
          ],
          meaning: `Bei ${num(q)} Stück kostet jedes Stück im Durchschnitt ${eur(k)}; mit mehr Stück sinkt der Fixkostenanteil.`,
          steps: [
            `Gesamtkosten K = F + v × q = ${eur(F)} + ${eur(v)} × ${num(q)} = ${eur(K)}`,
            `Stückkosten = K / q = ${eur(K)} / ${num(q)} = ${eur(k)}`,
          ],
          notes: [
            "Einfache Divisionskalkulation für eine gleichartige Leistung. Produzierte und verkaufte Menge sind nicht automatisch gleich.",
          ],
        };
      },
    },
  ],
};
export default def;
