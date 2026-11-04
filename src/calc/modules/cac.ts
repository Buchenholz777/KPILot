import type { CalcDef } from "../types";
import { val, out, eur, num, undef, toInput } from "../helpers";

const def: CalcDef = {
  id: "cac",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "CAC",
      favLabel: "CAC berechnen",
      fields: [
        {
          key: "mkt",
          label: "Zugeordnete Marketingkosten",
          unit: "€",
          min: "nonneg",
        },
        {
          key: "vt",
          label: "Zugeordnete Vertriebskosten",
          unit: "€",
          min: "nonneg",
          help: "z. B. Provisionen, Vertriebspersonal – sonst 0",
        },
        {
          key: "kunden",
          label: "Neu gewonnene Kunden",
          min: "nonneg",
          integer: true,
          help: "echte Neukunden, keine Leads",
        },
      ],
      example: { mkt: "2000", vt: "1000", kunden: "30" },
      compute(i) {
        const m = val(i, "mkt"),
          v = val(i, "vt"),
          n = val(i, "kunden");
        const sum = m.add(v);
        if (n.isZero())
          return undef(
            "Bei 0 Neukunden sind keine Kosten je Neukunde definiert.",
            [out("Kosten gesamt", sum, "money")],
          );
        const r = sum.div(n);
        return {
          status: "ok",
          main: out("CAC", r, "money", "je Neukunde"),
          extra: [out("Kosten gesamt", sum, "money")],
          meaning: `Jeder neue Kunde hat im Durchschnitt ${eur(r)} Marketing- und Vertriebskosten verursacht.`,
          steps: [
            `CAC = (Marketing + Vertrieb) / Neukunden = (${eur(m)} + ${eur(v)}) / ${num(n)} = ${eur(r)}`,
          ],
          notes: [
            "Aufwand und Kundengewinnung liegen oft zeitlich auseinander – Zeitraum bewusst wählen.",
          ],
        };
      },
    },
  ],
  transfers: [
    {
      target: "clv",
      label: "CAC in den CLV-Rechner übernehmen",
      describe:
        "Akquisitionskosten je Neukunde (CAC), die vom CLV abgezogen werden können",
      values: (_i, r) => ({ cac: toInput(r.main.value) }),
    },
  ],
};
export default def;
