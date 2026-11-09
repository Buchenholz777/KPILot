import type { CalcDef } from "../types";
import { val, out, eur, num, impossible } from "../helpers";

const PERIODS = [
  { value: "jahr", label: "Jahr" },
  { value: "quartal", label: "Quartal" },
  { value: "monat", label: "Monat" },
];
const plural: Record<string, [string, string]> = {
  jahr: ["Jahr", "Jahre"],
  quartal: ["Quartal", "Quartale"],
  monat: ["Monat", "Monate"],
};

const def: CalcDef = {
  id: "amortisation",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Amortisationsdauer",
      favLabel: "Amortisationsdauer berechnen",
      fields: [
        {
          key: "inv",
          label: "Anfänglicher Investitionsbetrag",
          unit: "€",
          min: "positive",
        },
        {
          key: "cf",
          label: "Netto-Zahlungsüberschuss je Periode",
          unit: "€",
          min: "any",
          help: "Einzahlungen minus Auszahlungen, die durch die Investition entstehen",
        },
        {
          key: "periode",
          label: "Periode",
          type: "select",
          options: PERIODS,
          defaultValue: "jahr",
        },
      ],
      example: { inv: "10000", cf: "2500", periode: "jahr" },
      compute(i) {
        const inv = val(i, "inv"),
          cf = val(i, "cf");
        const [one, many] = plural[i.choices.periode ?? "jahr"];
        if (cf.lte(0))
          return impossible(
            "Mit einem Zahlungsüberschuss von 0 € oder weniger amortisiert sich die Investition in diesem Modell nie.",
          );
        const t = inv.div(cf);
        const whole = t.ceil();
        return {
          status: "ok",
          main: out("Amortisationsdauer", t, "number", t.eq(1) ? one : many),
          extra: [
            out(
              "Benötigte ganze Perioden",
              whole,
              "integer",
              whole.eq(1) ? one : many,
            ),
          ],
          meaning: `Nach rechnerisch ${num(t)} ${t.eq(1) ? one : many} ist der Investitionsbetrag durch die Rückflüsse wieder eingespielt.`,
          steps: [
            `Amortisationsdauer = Investition / Überschuss je Periode = ${eur(inv)} / ${eur(cf)} = ${num(t)} ${many}`,
          ],
          notes: [
            "Statisches Modell: konstante Rückflüsse, keine Abzinsung. Bruchteile setzen gleichmäßige Zahlungen innerhalb der Periode voraus.",
            "Fließt das Geld nur am Periodenende, gilt die Zahl der ganzen Perioden.",
          ],
          // Zeitachse bis zum 1,5-Fachen der Amortisationsdauer: kumulierte Rückflüsse treffen den Investitionsbetrag
          chart: {
            kind: "break-even",
            points: [
              { q: 0, revenue: 0, cost: inv.toNumber() },
              { q: t.mul(1.5).toNumber(), revenue: cf.mul(t).mul(1.5).toNumber(), cost: inv.toNumber() },
            ],
            breakEven: t.toNumber(),
            labels: {
              xUnit: many,
              rising: "Kumulierte Rückflüsse (gestrichelt)",
              fixed: "Investition (durchgezogen)",
              aria: "Kumulierte Rückflüsse und Investitionsbetrag deiner Eingaben; sie treffen sich nach {x}.",
              head: [many, "Kumulierte Rückflüsse", "Investition", "Saldo"],
            },
          },
        };
      },
    },
  ],
};
export default def;
