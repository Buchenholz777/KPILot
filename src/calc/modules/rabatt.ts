import type { CalcDef, Inputs, BarsChart } from "../types";
import type { Decimal } from "decimal.js";
import {
  D,
  val,
  opt,
  out,
  undef,
  impossible,
  invalid,
  eur,
  pct,
} from "../helpers";

const preis = {
  key: "preis",
  label: "Ausgangspreis",
  unit: "€",
  min: "nonneg",
} as const;
const endpreis = {
  key: "endpreis",
  label: "Endpreis",
  unit: "€",
  min: "nonneg",
} as const;
const rabatt = {
  key: "rabatt",
  label: "Rabatt",
  unit: "%",
  min: "nonneg",
  max: 100,
  help: "Zwischen 0 und 100 %.",
} as const;
const erhoehung = {
  key: "erhoehung",
  label: "Erhöhung",
  unit: "%",
  min: "nonneg",
  help: "Auch über 100 % möglich.",
} as const;
const ART = [
  { value: "rabatt", label: "Rabatt (minus)" },
  { value: "erhoehung", label: "Erhöhung (plus)" },
];

function factor(i: Inputs, n: 1 | 2) {
  const art = i.choices[`art${n}`];
  const s = val(i, `satz${n}`);
  return art === "rabatt" ? D(1).sub(s.div(100)) : D(1).add(s.div(100));
}

/** Zwei Preise nebeneinander (Ausgangs- und Endpreis) – zusätzliche Anzeige, keine neue Rechnung. */
function priceChart(from: Decimal, to: Decimal, fromLabel: string, toLabel: string, summary: string): BarsChart {
  return {
    kind: "bars",
    summary,
    panels: [
      {
        title: "Preis in Euro",
        bars: [
          { label: fromLabel, value: from.toNumber(), text: eur(from) },
          { label: toLabel, value: to.toNumber(), text: eur(to), emphasis: true },
        ],
      },
    ],
    table: {
      head: ["Preis", "Betrag"],
      rows: [
        [fromLabel, eur(from)],
        [toLabel, eur(to)],
        ["Differenz", eur(to.sub(from))],
      ],
    },
  };
}

const def: CalcDef = {
  id: "rabatt",
  schema: 1,
  variants: [
    {
      id: "rabatt",
      label: "Preis nach Rabatt",
      favLabel: "Preis nach Rabatt",
      fields: [preis, rabatt],
      example: { preis: "100", rabatt: "20" },
      compute(i) {
        const p = val(i, "preis"),
          r = val(i, "rabatt");
        const nachlass = p.mul(r).div(100);
        const end = p.sub(nachlass);
        return {
          status: "ok",
          main: out("Endpreis nach Rabatt", end, "money"),
          extra: [out("Ersparnis", nachlass, "money")],
          meaning: `${pct(r)} Rabatt auf ${eur(p)} ergeben ${eur(end)}; du sparst ${eur(nachlass)}.`,
          steps: [
            `Endpreis = Ausgangspreis × (1 − Rabatt / 100)`,
            `= ${eur(p)} × (1 − ${pct(r)}) = ${eur(end)}`,
          ],
          chart: priceChart(p, end, "Ausgangspreis", "Preis nach Rabatt", `Der Preis sinkt von ${eur(p)} auf ${eur(end)}.`),
        };
      },
    },
    {
      id: "erhoehung",
      label: "Preis nach Erhöhung",
      favLabel: "Preis nach Erhöhung",
      fields: [preis, erhoehung],
      example: { preis: "100", erhoehung: "10" },
      compute(i) {
        const p = val(i, "preis"),
          e = val(i, "erhoehung");
        const plus = p.mul(e).div(100);
        const end = p.add(plus);
        return {
          status: "ok",
          main: out("Endpreis nach Erhöhung", end, "money"),
          extra: [out("Aufschlag in Euro", plus, "money")],
          meaning: `${pct(e)} mehr auf ${eur(p)} ergeben ${eur(end)}.`,
          steps: [
            `Endpreis = Ausgangspreis × (1 + Erhöhung / 100)`,
            `= ${eur(p)} × (1 + ${pct(e)}) = ${eur(end)}`,
          ],
          chart: priceChart(p, end, "Ausgangspreis", "Preis nach Erhöhung", `Der Preis steigt von ${eur(p)} auf ${eur(end)}.`),
        };
      },
    },
    {
      id: "ursprung-rabatt",
      label: "Ursprungspreis (Rabatt)",
      favLabel: "Ursprünglichen Preis aus Rabatt berechnen",
      question: "Was hat es vor dem Rabatt gekostet?",
      fields: [endpreis, rabatt],
      example: { endpreis: "80", rabatt: "20" },
      compute(i) {
        const e = val(i, "endpreis"),
          r = val(i, "rabatt");
        if (r.eq(100)) {
          return e.isZero()
            ? {
                status: "ambiguous",
                message:
                  "Bei 100 % Rabatt ist jeder Ausgangspreis 0 €. Der ursprüngliche Preis lässt sich daraus nicht eindeutig zurückrechnen.",
              }
            : impossible(
                "Bei 100 % Rabatt ist der Endpreis immer 0 €. Ein Endpreis über 0 € passt nicht dazu – es gibt keine Lösung.",
              );
        }
        const f = D(1).sub(r.div(100));
        const p = e.div(f);
        return {
          status: "ok",
          main: out("Ursprünglicher Preis", p, "money"),
          extra: [out("Rabatt in Euro", p.sub(e), "money")],
          meaning: `Vor ${pct(r)} Rabatt hat es ${eur(p)} gekostet.`,
          steps: [
            `Ausgangspreis = Endpreis / (1 − Rabatt / 100)`,
            `= ${eur(e)} / ${f.toString().replace(".", ",")} = ${eur(p)}`,
          ],
        };
      },
    },
    {
      id: "ursprung-erhoehung",
      label: "Ursprungspreis (Erhöhung)",
      favLabel: "Ursprünglichen Preis aus Erhöhung berechnen",
      fields: [endpreis, erhoehung],
      example: { endpreis: "110", erhoehung: "10" },
      compute(i) {
        const e = val(i, "endpreis"),
          r = val(i, "erhoehung");
        const f = D(1).add(r.div(100));
        const p = e.div(f);
        return {
          status: "ok",
          main: out("Ursprünglicher Preis", p, "money"),
          extra: [out("Erhöhung in Euro", e.sub(p), "money")],
          meaning: `Vor der Erhöhung um ${pct(r)} hat es ${eur(p)} gekostet.`,
          steps: [
            `Ausgangspreis = Endpreis / (1 + Erhöhung / 100)`,
            `= ${eur(e)} / ${f.toString().replace(".", ",")} = ${eur(p)}`,
          ],
        };
      },
    },
    {
      id: "zwei-aenderungen",
      label: "Zwei Änderungen",
      favLabel: "Zwei aufeinanderfolgende Änderungen",
      question: "Was ergeben zwei Rabatte oder Erhöhungen nacheinander?",
      fields: [
        {
          key: "art1",
          label: "1. Änderung",
          type: "select",
          options: ART,
          defaultValue: "rabatt",
        },
        { key: "satz1", label: "1. Satz", unit: "%", min: "nonneg" },
        {
          key: "art2",
          label: "2. Änderung",
          type: "select",
          options: ART,
          defaultValue: "rabatt",
        },
        { key: "satz2", label: "2. Satz", unit: "%", min: "nonneg" },
        {
          key: "preis",
          label: "Ausgangspreis (optional)",
          unit: "€",
          min: "nonneg",
          optional: true,
        },
      ],
      example: {
        art1: "rabatt",
        satz1: "20",
        art2: "rabatt",
        satz2: "10",
        preis: "100",
      },
      compute(i) {
        const errs: Record<string, string> = {};
        for (const n of [1, 2] as const) {
          if (i.choices[`art${n}`] === "rabatt" && val(i, `satz${n}`).gt(100))
            errs[`satz${n}`] = "Ein Rabatt kann höchstens 100 % betragen.";
        }
        if (Object.keys(errs).length)
          return invalid("Bitte die markierten Sätze prüfen.", errs);
        const f1 = factor(i, 1),
          f2 = factor(i, 2);
        const f = f1.mul(f2);
        const change = f.sub(1).mul(100);
        const p = opt(i, "preis");
        const extra = [out("Gesamtfaktor", f, "number")];
        if (p) extra.push(out("Endpreis", p.mul(f), "money"));
        const word = change.isNegative()
          ? `insgesamt ${pct(change.abs())} Rabatt`
          : change.isZero()
            ? "insgesamt keine Veränderung"
            : `insgesamt ${pct(change)} Erhöhung`;
        return {
          status: "ok",
          main: out("Gesamtveränderung", change, "percent", undefined, true),
          extra,
          meaning: `Beide Änderungen nacheinander ergeben ${word} – nicht einfach die Summe der Sätze.`,
          steps: [
            `Faktor 1 = ${f1.toString().replace(".", ",")}, Faktor 2 = ${f2.toString().replace(".", ",")}`,
            `Gesamtfaktor = ${f1.toString().replace(".", ",")} × ${f2.toString().replace(".", ",")} = ${f.toString().replace(".", ",")}`,
            `Gesamtveränderung = (Gesamtfaktor − 1) × 100 = ${pct(change, true)}`,
            ...(p
              ? [
                  `Endpreis = ${eur(p)} × ${f.toString().replace(".", ",")} = ${eur(p.mul(f))}`,
                ]
              : []),
          ],
        };
      },
    },
  ],
};
export default def;
void undef;
