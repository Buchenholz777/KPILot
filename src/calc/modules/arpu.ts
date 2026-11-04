import type { CalcDef } from "../types";
import { val, out, eur, num } from "../helpers";

const PERIODS = [
  { value: "monat", label: "Monat" },
  { value: "quartal", label: "Quartal" },
  { value: "jahr", label: "Jahr" },
];
const label: Record<string, string> = {
  monat: "und Monat",
  quartal: "und Quartal",
  jahr: "und Jahr",
};

const def: CalcDef = {
  id: "arpu",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "ARPU",
      favLabel: "ARPU berechnen",
      fields: [
        {
          key: "umsatz",
          label: "Zugeordneter Umsatz der Periode",
          unit: "€",
          min: "nonneg",
        },
        {
          key: "accounts",
          label: "Durchschnittlich aktive Accounts",
          min: "positive",
          help: "Abrechnungseinheiten; als Durchschnitt auch mit Nachkommastellen",
        },
        {
          key: "periode",
          label: "Periode",
          type: "select",
          options: PERIODS,
          defaultValue: "monat",
        },
      ],
      example: { umsatz: "5000", accounts: "100", periode: "monat" },
      compute(i) {
        const u = val(i, "umsatz"),
          a = val(i, "accounts");
        const r = u.div(a);
        const per = label[i.choices.periode ?? "monat"];
        return {
          status: "ok",
          main: out("ARPU", r, "money", `je Account ${per}`),
          meaning: `Jeder aktive Account bringt im Durchschnitt ${eur(r)} Umsatz je ${per.replace("und ", "")}.`,
          steps: [
            `ARPU = Umsatz / durchschnittlich aktive Accounts = ${eur(u)} / ${num(a)} = ${eur(r)}`,
          ],
          notes: [
            "„Account“ meint hier die Abrechnungseinheit – nicht Besucher oder Personen.",
          ],
        };
      },
    },
  ],
};
export default def;
