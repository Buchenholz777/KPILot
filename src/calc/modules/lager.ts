import type { CalcDef, CalcResult, Inputs } from "../types";
import { D, val, opt, out, eur, num, undef, invalid } from "../helpers";
import type { Decimal } from "../../lib/decimal";

const BASIS = [
  { value: "360", label: "360 Tage (kaufmännisch)" },
  { value: "365", label: "365 Tage (Kalenderjahr)" },
  { value: "eigene", label: "andere Periode – Tage selbst angeben" },
];
const basisFields = [
  {
    key: "basis",
    label: "Tagesbasis der Periode",
    type: "select" as const,
    options: BASIS,
    defaultValue: "360",
  },
  {
    key: "tage",
    label: "Tage der Periode (bei „andere Periode“)",
    unit: "Tage",
    min: "positive" as const,
    optional: true,
  },
];
const weField = {
  key: "we",
  label: "Wareneinsatz der Periode",
  unit: "€",
  min: "nonneg" as const,
  help: "zu Einstandskosten – nicht Umsatz",
};

function calc(i: Inputs, bestand: Decimal, bestandStep?: string): CalcResult {
  const we = val(i, "we");
  const b = i.choices.basis ?? "360";
  let tage: Decimal | undefined = b === "eigene" ? opt(i, "tage") : D(b);
  if (!tage)
    return invalid("Bitte die Anzahl Tage der Periode angeben.", {
      tage: "Bei „andere Periode“ bitte die Tage eintragen.",
    });
  if (bestand.isZero())
    return undef(
      "Bei einem durchschnittlichen Lagerbestand von 0 € ist der Lagerumschlag nicht definiert.",
    );
  const u = we.div(bestand);
  const steps = [
    ...(bestandStep ? [bestandStep] : []),
    `Lagerumschlag = Wareneinsatz / Ø Bestand = ${eur(we)} / ${eur(bestand)} = ${num(u)}`,
  ];
  if (u.isZero())
    return {
      status: "undefined",
      message:
        "Ohne Wareneinsatz ist der Umschlag 0 – eine endliche Lagerdauer lässt sich nicht bestimmen.",
      partial: [out("Lagerumschlag", u, "number", "Umschläge")],
    };
  const dauer = tage.div(u);
  steps.push(
    `Lagerdauer = Tage / Umschlag = ${num(tage)} / ${num(u)} = ${num(dauer)} Tage`,
  );
  return {
    status: "ok",
    main: out("Lagerumschlag", u, "number", "Umschläge"),
    extra: [
      out("Rechnerische Lagerdauer", dauer, "number", "Tage"),
      out("Durchschnittlicher Bestand", bestand, "money"),
    ],
    meaning: `Der Bestand wurde rechnerisch ${num(u)}-mal umgeschlagen; ein Artikel liegt im Durchschnitt ${num(dauer)} Tage.`,
    steps,
    notes: [
      "Durchschnittsmodell: keine Aussage über das Alter einzelner Artikel. Wareneinsatz und Bestand in derselben Bewertung.",
    ],
  };
}

const def: CalcDef = {
  id: "lager",
  schema: 1,
  variants: [
    {
      id: "durchschnitt",
      label: "Mit Ø-Bestand",
      favLabel: "Lagerumschlag (Ø-Bestand bekannt)",
      fields: [
        weField,
        {
          key: "bestand",
          label: "Durchschnittlicher Lagerbestand",
          unit: "€",
          min: "nonneg",
          help: "zu Einstandskosten",
        },
        ...basisFields,
      ],
      example: { we: "120000", bestand: "20000", basis: "360" },
      compute: (i) => calc(i, val(i, "bestand")),
    },
    {
      id: "anfang-ende",
      label: "Aus Anfangs- & Endbestand",
      favLabel: "Lagerumschlag (Anfangs- und Endbestand)",
      fields: [
        weField,
        { key: "anfang", label: "Anfangsbestand", unit: "€", min: "nonneg" },
        { key: "ende", label: "Endbestand", unit: "€", min: "nonneg" },
        ...basisFields,
      ],
      example: { we: "120000", anfang: "18000", ende: "22000", basis: "360" },
      compute(i) {
        const a = val(i, "anfang"),
          e = val(i, "ende");
        const b = a.add(e).div(2);
        return calc(
          i,
          b,
          `Ø Bestand = (Anfangsbestand + Endbestand) / 2 = (${eur(a)} + ${eur(e)}) / 2 = ${eur(b)}`,
        );
      },
    },
  ],
};
export default def;
