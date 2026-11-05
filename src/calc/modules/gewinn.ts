import type { CalcDef } from "../types";
import {
  D,
  val,
  out,
  eur,
  num,
  toInput,
  periodField,
  periodName,
  ceilQty,
} from "../helpers";

const base = [
  {
    key: "p",
    label: "Nettoverkaufspreis je Stück",
    unit: "€ je Stück",
    min: "nonneg" as const,
  },
  {
    key: "v",
    label: "Variable Kosten je Stück",
    unit: "€ je Stück",
    min: "nonneg" as const,
  },
  {
    key: "F",
    label: "Fixkosten im Zeitraum",
    unit: "€",
    min: "nonneg" as const,
  },
];

const def: CalcDef = {
  id: "gewinn",
  schema: 1,
  scenario: { variantId: "menge" },
  variants: [
    {
      id: "menge",
      label: "Gewinn bei Stückzahl",
      favLabel: "Gewinn bei gegebener Stückzahl",
      fields: [
        ...base,
        {
          key: "q",
          label: "Verkaufte Stückzahl",
          unit: "Stück",
          min: "nonneg",
          integer: true,
        },
        periodField(),
      ],
      example: { p: "50", v: "30", F: "3000", q: "200", zeitraum: "monat" },
      compute(i) {
        const p = val(i, "p"),
          v = val(i, "v"),
          F = val(i, "F"),
          q = val(i, "q");
        const umsatz = p.mul(q),
          varK = v.mul(q),
          ges = F.add(varK);
        const erg = umsatz.sub(ges);
        return {
          status: "ok",
          main: out(
            erg.isNegative() ? "Verlust" : "Gewinn",
            erg,
            "money",
            undefined,
            true,
          ),
          extra: [
            out("Umsatz", umsatz, "money"),
            out("Variable Gesamtkosten", varK, "money"),
            out("Gesamtkosten", ges, "money"),
          ],
          meaning: erg.isNegative()
            ? `Bei ${num(q)} Stück ${periodName(i)} entsteht ein Verlust von ${eur(erg.abs())}.`
            : erg.isZero()
              ? `Bei ${num(q)} Stück sind die Kosten genau gedeckt – Gewinn 0 €.`
              : `Bei ${num(q)} Stück ${periodName(i)} bleibt ein Gewinn von ${eur(erg)}.`,
          steps: [
            `Umsatz = p × q = ${eur(p)} × ${num(q)} = ${eur(umsatz)}`,
            `Gesamtkosten = F + v × q = ${eur(F)} + ${eur(v)} × ${num(q)} = ${eur(ges)}`,
            `Ergebnis = Umsatz − Gesamtkosten = ${eur(umsatz)} − ${eur(ges)} = ${eur(erg)}`,
          ],
          tone: erg.isNegative()
            ? "negative"
            : erg.isZero()
              ? "neutral"
              : "positive",
        };
      },
    },
    {
      id: "zielgewinn",
      label: "Stückzahl für Zielgewinn",
      favLabel: "Stückzahl für Zielgewinn",
      question: "Wie viel muss ich verkaufen, um X € Gewinn zu machen?",
      fields: [
        ...base,
        {
          key: "Z",
          label: "Gewünschter Gewinn",
          unit: "€",
          min: "nonneg",
          help: "0 € bedeutet: nur Kostendeckung",
        },
        periodField(),
      ],
      example: { p: "50", v: "30", F: "3000", Z: "1000", zeitraum: "monat" },
      compute(i) {
        const p = val(i, "p"),
          v = val(i, "v"),
          F = val(i, "F"),
          Z = val(i, "Z");
        const d = p.sub(v);
        const need = F.add(Z);
        if (d.lte(0)) {
          if (need.isZero() && d.isZero())
            return {
              status: "ambiguous",
              message:
                "Ohne Fixkosten, ohne Zielgewinn und mit 0 € Stückdeckungsbeitrag ist das Ergebnis bei jeder Menge 0 € – jede Menge erfüllt das Ziel.",
            };
          if (need.isZero())
            return {
              status: "ok",
              main: out("Benötigte Stückzahl", D(0), "integer", "Stück"),
              meaning:
                "Das Ziel (0 € Ergebnis) ist nur bei 0 Stück erreicht; jedes verkaufte Stück erzeugt Verlust, weil der Stückdeckungsbeitrag negativ ist.",
              steps: [`d = ${eur(p)} − ${eur(v)} = ${eur(d)}`],
            };
          return {
            status: "impossible",
            message: `Der Zielgewinn ist nicht erreichbar: Der Stückdeckungsbeitrag ist ${d.isZero() ? "0 €" : `negativ (${eur(d)})`}.`,
          };
        }
        const qTheo = need.div(d);
        const qMin = ceilQty(qTheo);
        const erg = d.mul(qMin).sub(F);
        return {
          status: "ok",
          main: out(
            "Benötigte Stückzahl (aufgerundet)",
            qMin,
            "integer",
            "Stück",
          ),
          extra: [
            out("Theoretisch benötigte Menge", qTheo, "number", "Stück"),
            out("Ergebnis bei dieser Stückzahl", erg, "money", undefined, true),
          ],
          meaning: Z.isZero()
            ? `Bei ${num(qMin)} Stück ${periodName(i)} sind die Kosten gedeckt (Ergebnis ${eur(erg)}). Zielgewinn 0 € heißt Kostendeckung, nicht positiver Gewinn.`
            : `Mit ${num(qMin)} Stück ${periodName(i)} erreichst du mindestens ${eur(Z)} Gewinn (genau: ${eur(erg)}).`,
          steps: [
            `d = p − v = ${eur(p)} − ${eur(v)} = ${eur(d)}`,
            `Menge = (F + Z) / d = (${eur(F)} + ${eur(Z)}) / ${eur(d)} = ${num(qTheo)} Stück`,
            `Aufgerundet: ${num(qMin)} Stück → Ergebnis ${eur(d)} × ${num(qMin)} − ${eur(F)} = ${eur(erg)}`,
          ],
        };
      },
    },
  ],
  followUps: [
    {
      id: "gewinn-kapazitaet",
      variantId: "zielgewinn",
      when: (_i, r) => r.status === "ok",
      text: "Die berechnete Menge muss auch herstellbar oder lieferbar sein.",
      label: "Erforderliche Menge mit verfügbarer Kapazität abgleichen",
      action: {
        kind: "capacity",
        unit: "Stück",
        quantity: (_i, r) => (r.status === "ok" ? r.main.value : undefined),
      },
    },
    {
      id: "gewinn-preis-pruefen",
      variantId: "menge",
      when: (i, r) => r.status === "ok" && r.tone === "negative" && !!i && i.values.p !== undefined && i.values.v !== undefined && i.values.p.lte(i.values.v),
      text: "Der Preis deckt die variablen Stückkosten nicht.",
      label: "Preis oder Kostenannahmen prüfen",
      action: { kind: "focus", fields: ["p", "v"] },
    },
  ],
  transfers: [
    {
      target: "break-even",
      label: "In Break-even übernehmen",
      describe:
        "Nettoverkaufspreis, variable Kosten je Stück, Fixkosten und Zeitraum",
      values: (i) => ({
        p: toInput(val(i, "p")),
        v: toInput(val(i, "v")),
        F: toInput(val(i, "F")),
        zeitraum: i.choices.zeitraum ?? "monat",
      }),
    },
  ],
};
export default def;
