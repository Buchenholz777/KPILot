import type { CalcDef } from "../types";
import { val, opt, out, eur, num, pct } from "../helpers";

const def: CalcDef = {
  id: "clv",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Customer Lifetime Value",
      favLabel: "CLV berechnen",
      fields: [
        {
          key: "aov",
          label: "Durchschnittlicher Nettobestellwert",
          unit: "€ je Kauf",
          min: "nonneg",
        },
        {
          key: "kaeufe",
          label: "Käufe pro Jahr",
          unit: "je Jahr",
          min: "nonneg",
          help: "Durchschnitt, auch z. B. 2,5",
        },
        {
          key: "jahre",
          label: "Angenommene Beziehungsdauer",
          unit: "Jahre",
          min: "nonneg",
        },
        {
          key: "db",
          label: "Deckungsbeitragsquote",
          unit: "%",
          min: "any",
          max: 100,
          help: "Anteil des Umsatzes, der nach variablen Kosten bleibt",
        },
        {
          key: "cac",
          label: "Akquisitionskosten je Kunde (optional)",
          unit: "€",
          min: "nonneg",
          optional: true,
          help: "nur, wenn du sie abziehen möchtest",
        },
      ],
      example: { aov: "50", kaeufe: "4", jahre: "3", db: "40", cac: "" },
      compute(i) {
        const aov = val(i, "aov"),
          k = val(i, "kaeufe"),
          j = val(i, "jahre"),
          db = val(i, "db"),
          cac = opt(i, "cac");
        const umsatz = aov.mul(k).mul(j);
        const clv = umsatz.mul(db).div(100);
        const extra = [out("Lebenszeit-Umsatz (Modell)", umsatz, "money")];
        const steps = [
          `Lebenszeit-Umsatz = ${eur(aov)} × ${num(k)} Käufe/Jahr × ${num(j)} Jahre = ${eur(umsatz)}`,
          `CLV = Lebenszeit-Umsatz × DB-Quote = ${eur(umsatz)} × ${pct(db)} = ${eur(clv)}`,
        ];
        if (cac) {
          extra.unshift(
            out(
              "Modellbeitrag nach Akquisitionskosten",
              clv.sub(cac),
              "money",
              undefined,
              true,
            ),
          );
          steps.push(
            `Nach Akquisitionskosten: ${eur(clv)} − ${eur(cac)} = ${eur(clv.sub(cac))}`,
          );
        }
        return {
          status: "ok",
          main: out("CLV (deckungsbeitragsbasiert)", clv, "money", "je Kunde"),
          extra,
          meaning: `Ein durchschnittlicher Kunde trägt im Modell ${eur(clv)} Deckungsbeitrag über die gesamte Beziehung bei${cac ? ` – nach Akquisitionskosten ${eur(clv.sub(cac))}` : ""}.`,
          steps,
          notes: [
            "Modellwert, keine Vorhersage: konstante Werte, keine Abzinsung, keine Kohortenanalyse.",
          ],
          tone: clv.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
