import type { CalcDef, CalcResult, Inputs, Out } from "../types";
import {
  D,
  val,
  opt,
  out,
  det,
  eur,
  pct,
  num,
  toInput,
  periodField,
  periodName,
  formatValue,
  ceilQty,
} from "../helpers";
import type { Decimal } from "../../lib/decimal";

const preis = {
  key: "preis",
  label: "Ausgangspreis netto je Einheit",
  unit: "€ je Einheit",
  min: "positive" as const,
  help: "Bisheriger Verkaufspreis ohne Umsatzsteuer.",
};
const v = {
  key: "v",
  label: "Variable Kosten je Einheit",
  unit: "€ je Einheit",
  min: "nonneg" as const,
  help: "Kosten, die mit jeder verkauften Einheit zusätzlich entstehen (z. B. Wareneinsatz). Fixkosten gehören nicht dazu.",
};
const rabatt = {
  key: "rabatt",
  label: "Rabatt",
  unit: "%",
  min: "nonneg" as const,
  max: 100,
  help: "Nachlass auf den Ausgangspreis, zwischen 0 und 100 %.",
};
const neuerPreis = {
  key: "neuerPreis",
  label: "Neuer Preis netto je Einheit",
  unit: "€ je Einheit",
  min: "nonneg" as const,
  help: "Preis nach dem Nachlass – nicht höher als der Ausgangspreis.",
};
const q0 = {
  key: "q0",
  label: "Bisheriger Absatz im Zeitraum (optional)",
  unit: "Einheiten",
  min: "nonneg" as const,
  integer: true,
  optional: true,
  help: "Nur nötig, wenn du eine konkrete Zielmenge sehen möchtest. Gleicher Zeitraum wie unten gewählt.",
};

interface Calc {
  p: Decimal;
  v: Decimal;
  p1: Decimal;
  q0?: Decimal;
}

/** Gemeinsame Rechenfunktion beider Modi. */
export function discountEconomics(c: Calc, i: Inputs, rabattPct?: Decimal): CalcResult {
  const { p, v: vk, p1, q0: q } = c;
  const d0 = p.sub(vk);
  const d1 = p1.sub(vk);
  const dDelta = d1.sub(d0);
  const r = rabattPct ?? D(1).sub(p1.div(p)).mul(100);
  const partial: Out[] = [
    out("Neuer Verkaufspreis", p1, "money", "je Einheit"),
    out("Stückdeckungsbeitrag vorher", d0, "money", "je Einheit", true),
    out("Stückdeckungsbeitrag nachher", d1, "money", "je Einheit", true),
    out("Veränderung des Stückdeckungsbeitrags", dDelta, "money", "je Einheit", true),
  ];
  if (d0.lte(0))
    return {
      status: "impossible",
      message: `Schon vor dem Rabatt deckt der Preis die variablen Kosten nicht: Der Stückdeckungsbeitrag beträgt ${eur(d0)}. Es gibt keinen positiven Gesamtdeckungsbeitrag, den der Rabatt-Absatz erreichen könnte. Prüfe zuerst Preis und Kosten.`,
      partial,
    };
  if (d1.lte(0))
    return {
      status: "impossible",
      message: `Nach ${pct(r)} Rabatt (Preis ${eur(p1)}) bleibt je Einheit ${d1.isZero() ? "nichts" : `ein Verlust von ${eur(d1.abs())}`} über den variablen Kosten (${eur(vk)}). Der Stückdeckungsbeitrag ist ${eur(d1)}: Mehr Absatz bringt keinen zusätzlichen Beitrag${d1.isNegative() ? " und vergrößert den Verlust" : ""}. Es gibt deshalb keine Menge, die den bisherigen Gesamtdeckungsbeitrag wieder erreicht – weder eine endliche noch eine „unendliche“ Zielmenge.`,
      partial,
    };
  const factor = d0.div(d1);
  const more = factor.sub(1).mul(100);
  const extra: Out[] = [];
  const steps = [
    `Neuer Preis = Ausgangspreis − Rabatt = ${eur(p)} × (1 − ${pct(r)}) = ${eur(p1)}`,
    `Stückdeckungsbeitrag vorher = ${eur(p)} − ${eur(vk)} = ${eur(d0)}`,
    `Stückdeckungsbeitrag nachher = ${eur(p1)} − ${eur(vk)} = ${eur(d1)}`,
    `Absatzfaktor = vorher / nachher = ${eur(d0)} / ${eur(d1)} = ${formatValue(factor, "number")}`,
    `Mehrabsatz = (Absatzfaktor − 1) × 100 = ${pct(more)}`,
  ];
  let meaning = `Bei ${pct(r)} Rabatt sinkt der Beitrag je Einheit von ${eur(d0)} auf ${eur(d1)}. Für denselben Gesamtdeckungsbeitrag musst du das ${formatValue(factor, "number")}-Fache absetzen, also ${pct(more)} mehr.`;
  let qNew: Decimal | undefined;
  if (q !== undefined) {
    if (q.isZero()) {
      qNew = D(0);
      steps.push("Bisheriger Absatz 0 → es gibt keinen Gesamtdeckungsbeitrag, den du halten müsstest; die erforderliche Menge ist 0.");
      meaning += " Bei einem bisherigen Absatz von 0 gibt es nichts zu halten.";
      extra.push(out("Erforderliche neue Menge", qNew, "integer", "Einheiten"));
    } else {
      const theo = q.mul(d0).div(d1); // erst multiplizieren, dann teilen: keine Rundung vor dem Aufrunden
      qNew = ceilQty(theo);
      const total0 = d0.mul(q);
      const total1 = d1.mul(qNew);
      steps.push(
        `Neue Menge = bisherige Menge × Absatzfaktor = ${num(q)} × ${formatValue(factor, "number")} = ${num(theo)} → aufgerundet ${num(qNew)} Stück`,
        `Kontrolle mit ungerundeten Werten: ${eur(d1)} × ${num(qNew)} = ${eur(total1)} ≥ ${eur(d0)} × ${num(q)} = ${eur(total0)}`,
      );
      meaning += ` Bei bisher ${num(q)} Einheiten ${periodName(i)} wären das mindestens ${num(qNew)} Einheiten.`;
      extra.push(out("Erforderliche neue Menge", qNew, "integer", "Einheiten"));
      extra.push(det(out("Theoretische Menge (ungerundet)", theo, "number", "Einheiten")));
      extra.push(det(out("Gesamtdeckungsbeitrag bisher", total0, "money")));
      extra.push(det(out("Gesamtdeckungsbeitrag mit neuer Menge", total1, "money")));
    }
  }
  extra.unshift(
    out("Absatzfaktor", factor, "number", "×"),
    out("Neuer Verkaufspreis", p1, "money", "je Einheit"),
    out("Stückdeckungsbeitrag vorher", d0, "money", "je Einheit"),
    out("Stückdeckungsbeitrag nachher", d1, "money", "je Einheit"),
  );
  extra.push(det(out("Veränderung des Stückdeckungsbeitrags", dDelta, "money", "je Einheit", true)));

  const bars1 = [
    { label: "vorher", value: d0.toNumber(), text: eur(d0) },
    { label: "nach Rabatt", value: d1.toNumber(), text: eur(d1), emphasis: true },
  ];
  const baseQ = q && !q.isZero() ? q : D(100);
  const reqQ = q && !q.isZero() && qNew ? qNew : baseQ.mul(factor);
  const bars2 = [
    { label: q && !q.isZero() ? "bisher" : "bisher (Beispiel 100)", value: baseQ.toNumber(), text: num(baseQ) },
    {
      label: "erforderlich",
      value: reqQ.toNumber(),
      text: q && !q.isZero() ? num(reqQ) : `${formatValue(factor, "number")}-fach`,
      emphasis: true,
    },
  ];
  const result: CalcResult = {
    status: "ok",
    main: out("Erforderlicher Mehrabsatz", more, "percent"),
    extra,
    meaning,
    steps,
    notes: [
      "Annahme: Die variablen Kosten je Einheit bleiben gleich, die Fixkosten sind vergleichbar. Ob die zusätzliche Nachfrage tatsächlich erreichbar ist, sagt der Rechner nicht.",
    ],
    tone: "neutral",
    chart: {
      kind: "bars",
      summary: `Beitrag je Einheit sinkt von ${eur(d0)} auf ${eur(d1)}; erforderlicher Absatz steigt auf das ${formatValue(factor, "number")}-Fache.`,
      panels: [
        { title: "Beitrag je Einheit (€)", bars: bars1 },
        { title: q && !q.isZero() ? "Absatz (Einheiten)" : "Absatz (relativ, bisher = 100)", bars: bars2 },
      ],
      table: {
        head: ["Größe", "vorher", "nach Rabatt"],
        rows: [
          ["Preis je Einheit", eur(p), eur(p1)],
          ["Stückdeckungsbeitrag", eur(d0), eur(d1)],
          [
            q && !q.isZero() ? "Absatz (Einheiten)" : "Absatz (bisher = 100)",
            num(baseQ),
            q && !q.isZero() ? `${num(reqQ)} (mindestens)` : `${num(reqQ)} (${formatValue(factor, "number")}-fach)`,
          ],
        ],
      },
    },
  };
  return result;
}

const transfers: CalcDef["transfers"] = [
  {
    target: "gewinn",
    label: "Neuen Preis und Menge in den Gewinnrechner übernehmen",
    describe: "Neuer Preis, variable Kosten je Einheit, Zeitraum und – falls angegeben – die erforderliche Menge",
    values: (i, r) => {
      const o: Record<string, string> = {
        v: toInput(val(i, "v")),
        zeitraum: i.choices.zeitraum ?? "monat",
      };
      const p1 = r.extra?.find((e) => e.label === "Neuer Verkaufspreis");
      if (p1) o.p = toInput(p1.value);
      const q = r.extra?.find((e) => e.label === "Erforderliche neue Menge");
      if (q) o.q = toInput(q.value);
      return o;
    },
  },
  {
    target: "deckungsbeitrag",
    label: "Neuen Preis im Deckungsbeitragsrechner prüfen",
    describe: "Neuer Preis und variable Kosten je Einheit",
    values: (i, r) => {
      const p1 = r.extra?.find((e) => e.label === "Neuer Verkaufspreis");
      return { v: toInput(val(i, "v")), ...(p1 ? { p: toInput(p1.value) } : {}) };
    },
  },
];

const def: CalcDef = {
  id: "rabatt-absatz",
  schema: 1,
  scenario: { variantId: "prozent" },
  variants: [
    {
      id: "prozent",
      label: "Rabatt in Prozent",
      favLabel: "Mehrabsatz bei Rabatt in Prozent",
      question: "Wie viel mehr muss ich verkaufen, damit ein Rabatt denselben Deckungsbeitrag bringt?",
      fields: [preis, v, rabatt, q0, periodField("Betrachtungszeitraum des Absatzes")],
      example: { preis: "100", v: "80", rabatt: "10", q0: "100", zeitraum: "monat" },
      compute(i) {
        const p = val(i, "preis");
        const r = val(i, "rabatt");
        const p1 = p.mul(D(1).sub(r.div(100)));
        return discountEconomics({ p, v: val(i, "v"), p1, q0: opt(i, "q0") }, i, r);
      },
    },
    {
      id: "neuer-preis",
      label: "Neuer Preis",
      favLabel: "Mehrabsatz bei neuem Preis",
      fields: [preis, v, neuerPreis, q0, periodField("Betrachtungszeitraum des Absatzes")],
      example: { preis: "100", v: "80", neuerPreis: "90", q0: "100", zeitraum: "monat" },
      compute(i) {
        const p = val(i, "preis");
        const p1 = val(i, "neuerPreis");
        if (p1.gt(p))
          return {
            status: "invalid",
            message: "Der neue Preis liegt über dem Ausgangspreis – das ist kein Rabatt.",
            fieldErrors: { neuerPreis: "Bitte einen Preis nicht über dem Ausgangspreis eingeben." },
          };
        return discountEconomics({ p, v: val(i, "v"), p1, q0: opt(i, "q0") }, i);
      },
    },
  ],
  transfers,
  followUps: [
    {
      id: "rabatt-kapazitaet",
      when: (_i, r) => r.status === "ok" && !!r.extra?.some((e) => e.label === "Erforderliche neue Menge"),
      text: "Die erforderliche Menge muss auch lieferbar sein.",
      label: "Menge mit verfügbarer Kapazität abgleichen",
      action: {
        kind: "capacity",
        unit: "Einheiten",
        quantity: (_i, r) => (r.status === "ok" ? r.extra?.find((e) => e.label === "Erforderliche neue Menge")?.value : undefined),
      },
    },
    {
      id: "rabatt-preis-pruefen",
      when: (_i, r) => r.status === "impossible",
      text: "Preis oder Kostenannahmen prüfen.",
      label: "Zu Preis und Kosten springen",
      action: { kind: "focus", fields: ["preis", "v"] },
    },
  ],
};
export default def;
