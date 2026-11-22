import type { CalcDef, CalcResult, Inputs, Out } from "../types";
import {
  D,
  val,
  opt,
  out,
  det,
  pct,
  num,
  toInput,
  periodField,
  periodName,
  formatValue,
  ceilQty,
} from "../helpers";
import type { Decimal } from "../../lib/decimal";

/** Euro mit optionalem Vorzeichen (+/−). */
const eur = (d: Decimal, signed = false) => formatValue(d, "money", undefined, signed);

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
  };
  return result;
}


const q0Pflicht = {
  ...q0,
  label: "Bisheriger Absatz im Zeitraum",
  min: "positive" as const,
  optional: false,
  help: "Einheiten, die du bisher im gewählten Zeitraum zum Ausgangspreis verkaufst.",
};
const preisNeu = {
  key: "neuerPreis",
  label: "Neuer Preis netto je Einheit",
  unit: "€ je Einheit",
  min: "nonneg" as const,
  help: "Preis nach der Änderung – darf höher oder niedriger sein als der Ausgangspreis.",
};
const q1 = {
  key: "q1",
  label: "Erwarteter Absatz zum neuen Preis",
  unit: "Einheiten",
  min: "nonneg" as const,
  integer: true,
  help: "Deine eigene Annahme für den Zeitraum. Der Rechner kennt keine Nachfragereaktion und schätzt sie nicht.",
};
const fixkosten = {
  key: "F",
  label: "Fixkosten im Zeitraum (optional)",
  unit: "€",
  min: "nonneg" as const,
  optional: true,
  help: "Nur nötig, wenn du Gewinn und Break-even-Menge sehen möchtest. Gleicher Zeitraum, gleiche Fixkosten vor und nach der Preisänderung.",
};

/** Preis-Absatz-Gewinn: Ausgangslage gegen Szenario mit eigener Absatzannahme (keine Nachfragefunktion). */
export function priceVolumeEconomics(i: Inputs): CalcResult {
  const p0 = val(i, "preis"),
    vk = val(i, "v"),
    p1 = val(i, "neuerPreis"),
    qa = val(i, "q0"),
    qb = val(i, "q1");
  const F = opt(i, "F");
  const d0 = p0.sub(vk),
    d1 = p1.sub(vk);
  const u0 = p0.mul(qa),
    u1 = p1.mul(qb);
  const db0 = d0.mul(qa),
    db1 = d1.mul(qb);
  const dDb = db1.sub(db0);
  const dir = p1.lt(p0) ? "niedrigeren" : p1.gt(p0) ? "höheren" : "unveränderten";
  const steps = [
    `Umsatz vorher = ${eur(p0)} × ${num(qa)} = ${eur(u0)} · nachher = ${eur(p1)} × ${num(qb)} = ${eur(u1)}`,
    `Stückdeckungsbeitrag vorher = ${eur(p0)} − ${eur(vk)} = ${eur(d0)} · nachher = ${eur(p1)} − ${eur(vk)} = ${eur(d1)}`,
    `Deckungsbeitrag vorher = ${eur(d0)} × ${num(qa)} = ${eur(db0)} · nachher = ${eur(d1)} × ${num(qb)} = ${eur(db1)}`,
    `Veränderung = ${eur(db1)} − ${eur(db0)} = ${eur(dDb, true)}`,
  ];
  const extra: Out[] = [
    out("Umsatz vorher", u0, "money"),
    out("Umsatz nachher", u1, "money"),
    out("Deckungsbeitrag vorher", db0, "money", undefined, true),
    out("Deckungsbeitrag nachher", db1, "money", undefined, true),
    out("Neuer Verkaufspreis", p1, "money", "je Einheit"),
  ];
  let meaning = `Mit ${eur(p1)} statt ${eur(p0)} und der von dir angenommenen Menge von ${num(qb)} statt ${num(qa)} Einheiten ${periodName(i)} ${dDb.isNegative() ? "sinkt" : dDb.isZero() ? "bleibt" : "steigt"} der Deckungsbeitrag von ${eur(db0)} auf ${eur(db1)}${dDb.isZero() ? "" : ` (${eur(dDb, true)})`}.`;
  // Menge, die den bisherigen Deckungsbeitrag hält (nur bei positiven Stückbeiträgen vorher und nachher)
  if (d0.gt(0) && d1.gt(0)) {
    const need = ceilQty(db0.div(d1));
    const gap = need.sub(qb);
    extra.push(out("Erforderliche neue Menge", need, "integer", "Einheiten"));
    extra.push(det(out("Mehrabsatz zum Halten des Deckungsbeitrags", need.div(qa).sub(1).mul(100), "percent", undefined, true)));
    steps.push(`Menge zum Halten des bisherigen Deckungsbeitrags = ${eur(db0)} / ${eur(d1)} = ${formatValue(db0.div(d1), "number")} → aufgerundet ${num(need)} Einheiten`);
    meaning += gap.gt(0)
      ? ` Um den bisherigen Deckungsbeitrag zu halten, wären mindestens ${num(need)} Einheiten nötig – deine Annahme liegt ${num(gap)} darunter.`
      : ` Dein erwarteter Absatz reicht aus, um den bisherigen Deckungsbeitrag zu halten (mindestens ${num(need)} Einheiten nötig).`;
  } else if (d1.lte(0)) {
    steps.push(`Der neue Stückdeckungsbeitrag ist ${eur(d1)}: Mehr Absatz zu diesem Preis erhöht den Deckungsbeitrag nicht${d1.isNegative() ? " und vergrößert den Verlust" : ""}.`);
    meaning += ` Der Preis deckt die variablen Kosten nicht (Stückdeckungsbeitrag ${eur(d1, true)}); es gibt keine Menge, die den bisherigen Deckungsbeitrag hält.`;
  } else {
    steps.push(`Schon vor der Änderung war der Stückdeckungsbeitrag ${eur(d0, true)}; ein „Halten“ des bisherigen Deckungsbeitrags ist nicht definiert.`);
  }
  // Gewinn und Break-even nur mit Fixkosten
  if (F) {
    const g0 = db0.sub(F),
      g1 = db1.sub(F);
    extra.push(out("Gewinn vorher", g0, "money", undefined, true), out("Gewinn nachher", g1, "money", undefined, true));
    steps.push(`Gewinn vorher = ${eur(db0)} − ${eur(F)} = ${eur(g0)} · nachher = ${eur(db1)} − ${eur(F)} = ${eur(g1)}`);
    const be = (d: Decimal) => (d.gt(0) ? ceilQty(F.div(d)) : undefined);
    const be0 = be(d0),
      be1 = be(d1);
    extra.push(be0 ? out("Break-even-Menge vorher", be0, "integer", "Einheiten") : out("Break-even-Menge vorher", D(0), "integer", "nicht erreichbar"));
    extra.push(be1 ? out("Break-even-Menge nachher", be1, "integer", "Einheiten") : out("Break-even-Menge nachher", D(0), "integer", "nicht erreichbar"));
    meaning += ` Nach Abzug von ${eur(F)} Fixkosten ergibt das ${g1.isNegative() ? "einen Verlust" : "einen Gewinn"} von ${eur(g1.abs())} (vorher ${eur(g0, true)}).`;
    if (!be1) steps.push("Break-even-Menge nachher: Der Preis deckt die variablen Kosten nicht – die Fixkosten werden bei keiner Menge gedeckt.");
  }
  const result: CalcResult = {
    status: "ok",
    main: out("Veränderung des Deckungsbeitrags", dDb, "money", undefined, true),
    extra,
    meaning,
    steps,
    notes: [
      `Die Menge ${num(qb)} ist deine Annahme zum ${dir} Preis. Der Rechner kennt keine Nachfragereaktion (Preiselastizität) und schätzt sie nicht; mit der Mengenlinie in der Grafik kannst du andere Annahmen vergleichen.`,
      "Annahme: Die variablen Kosten je Einheit und die Fixkosten bleiben gleich. Mengenrabatte, Kannibalisierung und Kapazitätsgrenzen sind nicht berücksichtigt.",
    ],
    tone: dDb.isNegative() ? "negative" : dDb.isZero() ? "neutral" : "positive",
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
    {
      id: "preis-absatz",
      label: "Preis & Absatz",
      favLabel: "Preisänderung mit erwartetem Absatz bewerten",
      question: "Lohnt sich ein anderer Preis, wenn ich mit einer bestimmten Absatzmenge rechne?",
      fields: [preis, v, preisNeu, q0Pflicht, q1, fixkosten, periodField("Betrachtungszeitraum des Absatzes")],
      example: { preis: "100", v: "60", neuerPreis: "90", q0: "100", q1: "130", F: "2000", zeitraum: "monat" },
      compute: (i) => priceVolumeEconomics(i),
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
