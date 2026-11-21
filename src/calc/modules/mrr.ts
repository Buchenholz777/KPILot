import type { CalcDef } from "../types";
import { D, out, eur, num } from "../helpers";

const def: CalcDef = {
  id: "mrr",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "MRR & ARR",
      favLabel: "MRR und ARR berechnen",
      fields: [],
      rows: {
        key: "tarife",
        label: "Tarife",
        minRows: 1,
        maxRows: 15,
        addLabel: "Tarif hinzufügen",
        columns: [
          { key: "anzahl", label: "Aktive Abos", min: "nonneg", integer: true },
          {
            key: "preis",
            label: "Wiederkehrender Nettopreis",
            unit: "€",
            min: "nonneg",
            help: "tatsächlicher Preis nach Rabatt",
          },
          {
            key: "monate",
            label: "Abrechnungsintervall",
            unit: "Monate",
            min: "positive",
            integer: true,
            help: "1 = monatlich, 12 = jährlich",
          },
        ],
      },
      example: {
        tarife: [
          ["10", "20", "1"],
          ["12", "120", "12"],
        ],
      },
      compute(i) {
        const rows = i.rows.tarife ?? [];
        const parts = rows.map((r) => r[0].mul(r[1]).div(r[2]));
        const mrr = parts.reduce((s, x) => s.add(x), D(0));
        const arr = mrr.mul(12);
        return {
          status: "ok",
          main: out("MRR", mrr, "money", "je Monat"),
          extra: [out("ARR (MRR × 12)", arr, "money", "je Jahr")],
          breakdown: parts.map((x, k) => out(`Tarif ${k + 1}`, x, "money", "je Monat")),
          meaning: `Die aktiven Abos entsprechen ${eur(mrr)} wiederkehrendem Umsatz pro Monat – hochgerechnet ${eur(arr)} pro Jahr.`,
          steps: [
            ...rows.map(
              (r, k) =>
                `Tarif ${k + 1}: ${num(r[0])} × ${eur(r[1])} / ${num(r[2])} Monate = ${eur(parts[k])} MRR`,
            ),
            `MRR = ${parts.map((p) => eur(p)).join(" + ")} = ${eur(mrr)}`,
            `ARR = MRR × 12 = ${eur(arr)}`,
          ],
          notes: [
            "ARR ist eine Run-Rate, kein verbuchter Jahresumsatz und keine Prognose. Einmalgebühren, Steuern und Nutzungsentgelte sind nicht enthalten.",
          ],
        };
      },
    },
  ],
};
export default def;
