import type { CalcDef, CalcResult, Inputs } from "../types";
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

export function breakEven(i: Inputs): CalcResult {
  const p = val(i, "p"),
    v = val(i, "v"),
    F = val(i, "F");
  const d = p.sub(v);
  const zr = periodName(i);
  const dStep = `Stückdeckungsbeitrag d = p − v = ${eur(p)} − ${eur(v)} = ${eur(d)}`;

  if (F.isZero()) {
    if (d.gt(0))
      return {
        status: "ok",
        main: out("Theoretische Gewinnschwelle", D(0), "integer", "Stück"),
        extra: [out("Ergebnis bei 1 Stück", d, "money")],
        meaning:
          "Ohne Fixkosten sind die Kosten schon bei 0 Stück gedeckt; jedes verkaufte Stück bringt Gewinn.",
        steps: [dStep, "Fixkosten = 0 € → Kostendeckung bei 0 Stück"],
        tone: "positive",
      };
    if (d.isZero())
      return {
        status: "ambiguous",
        message:
          "Ohne Fixkosten und mit einem Stückdeckungsbeitrag von 0 € ist das Ergebnis bei jeder Menge genau 0 €. Es gibt keine eindeutige Gewinnschwelle.",
      };
    return {
      status: "impossible",
      message: `Der Stückdeckungsbeitrag ist negativ (${eur(d)}). Bei 0 Stück ist das Ergebnis 0 €, jede verkaufte Menge erzeugt Verlust.`,
    };
  }
  if (d.lte(0)) {
    return {
      status: "impossible",
      message: `Keine erreichbare Gewinnschwelle: Der Stückdeckungsbeitrag ist ${d.isZero() ? "0 €" : `negativ (${eur(d)})`}, die Fixkosten können durch mehr Absatz nie gedeckt werden.`,
    };
  }
  const qTheo = F.div(d); // nicht vorher runden
  const qMin = ceilQty(qTheo);
  const resultAtMin = d.mul(qMin).sub(F);
  const profitFrom = qTheo.isInteger() ? qTheo.add(1) : qMin;
  const qMax = Math.max(10, Math.ceil(qTheo.mul(2).toNumber()));
  const pt = (q: number) => ({
    q,
    revenue: p.mul(q).toNumber(),
    cost: F.add(v.mul(q)).toNumber(),
  });

  return {
    status: "ok",
    main: out("Theoretische Gewinnschwelle", qTheo, "number", "Stück"),
    extra: [
      out("Mindeststückzahl zur Kostendeckung", qMin, "integer", "Stück"),
      out("Umsatz bei dieser Stückzahl", p.mul(qMin), "money"),
      out(
        resultAtMin.isZero()
          ? "Ergebnis bei dieser Stückzahl (Kostendeckung)"
          : "Gewinn bei dieser Stückzahl",
        resultAtMin,
        "money",
        undefined,
        true,
      ),
      out("Positiver Gewinn ab", profitFrom, "integer", "Stück"),
      out("Theoretischer Break-even-Umsatz", qTheo.mul(p), "money"),
    ],
    meaning: qTheo.isInteger()
      ? `Bei ${num(qMin)} Stück ${zr} sind alle Kosten genau gedeckt; ein Gewinn entsteht ab ${num(profitFrom)} Stück.`
      : `Ab ${num(qMin)} Stück ${zr} sind alle Kosten gedeckt (Gewinn ${eur(resultAtMin)}); darunter entsteht Verlust.`,
    steps: [
      dStep,
      `Theoretische Menge = F / d = ${eur(F)} / ${eur(d)} = ${num(qTheo)} Stück`,
      `Aufgerundet auf ganze Stück: ${num(qMin)} Stück`,
      `Ergebnis bei ${num(qMin)} Stück = d × q − F = ${eur(d)} × ${num(qMin)} − ${eur(F)} = ${eur(resultAtMin)}`,
    ],
    notes: [
      `Fixkosten, Preise und Mengen gelten ${zr}. Nettobeträge ohne Umsatzsteuer.`,
    ],
    chart: {
      kind: "break-even",
      points: [pt(0), pt(qMax)],
      breakEven: qTheo.toNumber(),
    },
  };
}

const def: CalcDef = {
  id: "break-even",
  schema: 1,
  scenario: { variantId: "standard" },
  variants: [
    {
      id: "standard",
      label: "Break-even",
      favLabel: "Break-even berechnen",
      fields: [
        {
          key: "p",
          label: "Nettoverkaufspreis je Stück",
          unit: "€ je Stück",
          min: "nonneg",
        },
        {
          key: "v",
          label: "Variable Kosten je Stück",
          unit: "€ je Stück",
          min: "nonneg",
        },
        {
          key: "F",
          label: "Fixkosten im Zeitraum",
          unit: "€",
          min: "nonneg",
          help: "Kosten, die unabhängig von der Menge anfallen, z. B. Miete",
        },
        periodField(),
      ],
      example: { p: "50", v: "30", F: "3000", zeitraum: "monat" },
      compute: breakEven,
    },
  ],
  transfers: [
    {
      target: "gewinn",
      label: "In Gewinnrechner übernehmen",
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
