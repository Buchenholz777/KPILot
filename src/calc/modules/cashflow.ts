import type { CalcDef, CalcResult, Inputs, Out } from "../types";
import { D, val, opt, out, formatValue } from "../helpers";
import type { Decimal } from "../../lib/decimal";

/** Euro mit optionalem Vorzeichen (+/−). */
const eur = (d: Decimal, signed = false) => formatValue(d, "money", undefined, signed);

const m = (key: string, label: string, help?: string) => ({
  key,
  label,
  unit: "€",
  min: "nonneg" as const,
  help,
});


const PERIODEN: Record<string, { one: string; many: string }> = {
  woche: { one: "Woche", many: "Wochen" },
  monat: { one: "Monat", many: "Monate" },
};

export interface PlanRow {
  k: number;
  start: Decimal;
  ein: Decimal;
  aus: Decimal;
  end: Decimal;
}

/** Fortschreibung des Zahlungsmittelbestands. Einzahlungen können um `verzug` Perioden später eingehen; was hinter das Planende fällt, bleibt offen. */
export function liquidityPlan(startBestand: Decimal, rows: Decimal[][], verzug: number) {
  const n = rows.length;
  const plan: PlanRow[] = [];
  let bal = startBestand;
  for (let k = 0; k < n; k++) {
    const ein = k >= verzug ? rows[k - verzug][0] : D(0);
    const aus = rows[k][1];
    const end = bal.add(ein).sub(aus);
    plan.push({ k: k + 1, start: bal, ein, aus, end });
    bal = end;
  }
  const offen = rows.slice(Math.max(0, n - verzug)).reduce((s, r) => s.add(r[0]), D(0));
  return { plan, offen: verzug > 0 ? offen : D(0) };
}

const planStats = (plan: PlanRow[]) => {
  let min = plan[0];
  for (const r of plan) if (r.end.lt(min.end)) min = r;
  return { min, negative: plan.filter((r) => r.end.isNegative()), first: plan.find((r) => r.end.isNegative()) };
};

function computePlan(i: Inputs): CalcResult {
  const startB = val(i, "start");
  const rows = i.rows.perioden ?? [];
  const verzug = Number((opt(i, "verzug") ?? D(0)).toString());
  const pk = PERIODEN[i.choices.periode ?? "monat"] ?? PERIODEN.monat;
  const { plan, offen } = liquidityPlan(startB, rows, verzug);
  const last = plan[plan.length - 1];
  const { min, negative, first } = planStats(plan);
  const sumEin = plan.reduce((s, r) => s.add(r.ein), D(0));
  const sumAus = plan.reduce((s, r) => s.add(r.aus), D(0));
  const extra: Out[] = [
    out(`Niedrigster Endbestand`, min.end, "money", `in ${pk.one} ${min.k}`, true),
    out("Perioden mit negativem Endbestand", D(negative.length), "integer", `von ${plan.length}`),
    out("Einzahlungen im Planzeitraum", sumEin, "money"),
    out("Auszahlungen im Planzeitraum", sumAus, "money"),
  ];
  if (first) extra.splice(1, 0, out(`Erste ${pk.one} mit negativem Endbestand`, D(first.k), "integer", `(Nr. ${first.k})`));
  if (verzug > 0) extra.push(out("Einzahlungen, die erst nach Planende eingehen", offen, "money"));
  const steps = plan.map((r) => `${pk.one} ${r.k}: ${eur(r.start)} + ${eur(r.ein)} − ${eur(r.aus)} = ${eur(r.end)}`);
  if (verzug > 0) steps.unshift(`Alle Einzahlungen gehen ${verzug} ${verzug === 1 ? pk.one : pk.many} später ein; in den ersten ${verzug} ${verzug === 1 ? pk.one : pk.many} kommt keine Einzahlung an.`);
  steps.unshift(`Endbestand = Anfangsbestand + Einzahlungen − Auszahlungen, je ${pk.one} fortgeschrieben, Start: ${eur(startB)}`);

  let meaning = `Nach ${plan.length} ${pk.many} liegt der geplante Bestand bei ${eur(last.end, true)} (Anfang: ${eur(startB, true)}). `;
  meaning += first
    ? `In ${negative.length} von ${plan.length} ${pk.many} ist der Endbestand negativ – erstmals in ${pk.one} ${first.k}, am niedrigsten in ${pk.one} ${min.k} mit ${eur(min.end, true)}. In dieser Höhe fehlen ohne zusätzliche Mittel (z. B. Kontokorrent) Zahlungsmittel.`
    : `Der Endbestand bleibt in allen ${plan.length} ${pk.many} bei mindestens ${eur(min.end, true)} (Minimum in ${pk.one} ${min.k}).`;
  const result: CalcResult = {
    status: "ok",
    main: out(`Endbestand nach ${pk.one} ${plan.length}`, last.end, "money", undefined, true),
    extra,
    breakdown: plan.map((r) => out(`${pk.one} ${r.k}`, r.end, "money", undefined, true)),
    meaning,
    steps,
    notes: [
      "Ein Plan aus deinen Annahmen, keine Prognose: Er ist nur so gut wie die eingegebenen Zahlungszeitpunkte. Maßgeblich ist, wann Geld ein- und ausgeht – nicht, wann Rechnungen gestellt oder verbucht werden.",
      "Ein negativer Endbestand heißt: Die geplanten Mittel reichen in dieser Periode nicht. Er sagt nichts darüber, ob eine Finanzierung (z. B. Kontokorrent) vorhanden ist – und ist keine Aussage zur rechtlichen Zahlungsunfähigkeit.",
      "Steuern, Kreditraten und Investitionen gehören als Auszahlung in die Periode, in der sie fällig sind.",
    ],
    tone: negative.length ? "negative" : "positive",
  };
  if (verzug > 0) {
    const base = liquidityPlan(startB, rows, 0);
    const bs = planStats(base.plan);
    result.comparison = {
      title: "Ohne und mit Zahlungsverzug",
      head: ["", "Ohne Verzug", "Mit Verzug", "Differenz"],
      rows: [
        [`Endbestand ${pk.one} ${plan.length}`, eur(base.plan[base.plan.length - 1].end, true), eur(last.end, true), eur(last.end.sub(base.plan[base.plan.length - 1].end), true)],
        ["Niedrigster Stand", eur(bs.min.end, true), eur(min.end, true), eur(min.end.sub(bs.min.end), true)],
        [`${pk.many} unter 0 €`, String(bs.negative.length), String(negative.length), String(negative.length - bs.negative.length)],
      ],
      summary: `Der Verzug von ${verzug} ${verzug === 1 ? pk.one : pk.many} verschiebt Einzahlungen, ändert aber ${offen.isZero() ? "keine Gesamtsumme im Plan" : `die Summe im Planzeitraum: ${eur(offen)} gehen erst nach dem Planende ein`}.`,
    };
  }
  return result;
}

const PERIODEN_OPTIONS = [
  { value: "monat", label: "Monate" },
  { value: "woche", label: "Wochen" },
];

const def: CalcDef = {
  id: "cashflow",
  schema: 1,
  variants: [
    {
      id: "operativ",
      label: "Operativer Cashflow",
      favLabel: "Operativer Cashflow",
      fields: [
        m(
          "ein",
          "Betriebliche Einzahlungen",
          "tatsächlich eingegangene Zahlungen aus dem laufenden Geschäft",
        ),
        m(
          "aus",
          "Betriebliche Auszahlungen",
          "tatsächlich geleistete Zahlungen, z. B. Löhne, Miete, Lieferanten",
        ),
      ],
      example: { ein: "30000", aus: "22000" },
      compute(i) {
        const e = val(i, "ein"),
          a = val(i, "aus");
        const cf = e.sub(a);
        return {
          status: "ok",
          main: out("Operativer Cashflow", cf, "money", undefined, true),
          meaning: cf.isNegative()
            ? `Aus dem laufenden Geschäft ist ${eur(cf.abs())} mehr abgeflossen als zugeflossen.`
            : `Aus dem laufenden Geschäft sind netto ${eur(cf)} zugeflossen.`,
          steps: [
            `Operativer Cashflow = Einzahlungen − Auszahlungen = ${eur(e)} − ${eur(a)} = ${eur(cf)}`,
          ],
          notes: [
            "Nur tatsächliche Zahlungen zählen: Unbezahlte Rechnungen und Abschreibungen bewegen kein Geld.",
          ],
          tone: cf.isNegative() ? "negative" : "positive",
        };
      },
    },
    {
      id: "erweitert",
      label: "Erweiterte Übersicht",
      favLabel: "Cashflow mit Investition und Finanzierung",
      fields: [
        m("ein", "Betriebliche Einzahlungen"),
        m("aus", "Betriebliche Auszahlungen"),
        m("invEin", "Investive Einzahlungen", "z. B. Verkauf einer Maschine"),
        m("invAus", "Investive Auszahlungen", "z. B. Kauf einer Maschine"),
        m(
          "finEin",
          "Finanzierungs-Einzahlungen",
          "z. B. Kreditaufnahme, Einlage",
        ),
        m("finAus", "Finanzierungs-Auszahlungen", "z. B. Tilgung, Entnahme"),
      ],
      example: {
        ein: "30000",
        aus: "22000",
        invEin: "0",
        invAus: "5000",
        finEin: "2000",
        finAus: "0",
      },
      compute(i) {
        const op = val(i, "ein").sub(val(i, "aus"));
        const inv = val(i, "invEin").sub(val(i, "invAus"));
        const fin = val(i, "finEin").sub(val(i, "finAus"));
        const net = op.add(inv).add(fin);
        return {
          status: "ok",
          main: out("Erfasster Netto-Cashflow", net, "money", undefined, true),
          extra: [
            out("Operativer Cashflow", op, "money", undefined, true),
            out("Investitions-Cashflow", inv, "money", undefined, true),
            out("Finanzierungs-Cashflow", fin, "money", undefined, true),
          ],
          meaning: `Über alle drei erfassten Bereiche hat sich der Zahlungsmittelbestand um ${eur(net)} verändert.`,
          steps: [
            `Operativ = ${eur(val(i, "ein"))} − ${eur(val(i, "aus"))} = ${eur(op)}`,
            `Investiv = ${eur(val(i, "invEin"))} − ${eur(val(i, "invAus"))} = ${eur(inv)}`,
            `Finanzierung = ${eur(val(i, "finEin"))} − ${eur(val(i, "finAus"))} = ${eur(fin)}`,
            `Netto = ${eur(op)} + ${eur(inv)} + ${eur(fin)} = ${eur(net)}`,
          ],
          notes: [
            "Vereinfachte, direkte Zahlungsübersicht – keine gesetzliche Kapitalflussrechnung. Zinsen und Steuern hier dem operativen Bereich zuordnen.",
          ],
          tone: net.isNegative() ? "negative" : "neutral",
        };
      },
    },
    {
      id: "plan",
      label: "Liquiditätsplan",
      favLabel: "Liquiditätsplan über mehrere Perioden",
      question: "Reicht mein Geld über die nächsten Wochen oder Monate – und wann wird es knapp?",
      fields: [
        { key: "start", label: "Anfangsbestand liquide Mittel", unit: "€", min: "any", help: "Kontostand und Kasse zu Beginn der ersten Periode. Negativ, wenn du ein Konto überzogen hast." },
        { key: "periode", label: "Länge einer Periode", type: "select", options: PERIODEN_OPTIONS, defaultValue: "monat", help: "Übliche Pläne: 13 Wochen oder 12 Monate." },
        { key: "verzug", label: "Zahlungsverzug der Einzahlungen (optional)", unit: "Perioden", min: "nonneg", integer: true, max: 12, optional: true, help: "Szenario: Alle Kundenzahlungen kommen so viele Perioden später an. Leer lassen = Einzahlungen wie geplant." },
      ],
      rows: {
        key: "perioden",
        label: "Zahlungen je Periode",
        minRows: 2,
        maxRows: 13,
        addLabel: "Periode hinzufügen",
        columns: [
          { key: "ein", label: "Einzahlungen", unit: "€", min: "nonneg", help: "Geld, das in dieser Periode auf dem Konto ankommt (nicht: Rechnungen, die du stellst)." },
          { key: "aus", label: "Auszahlungen", unit: "€", min: "nonneg", help: "Geld, das in dieser Periode abfließt – inkl. Steuern, Kreditraten, Investitionen." },
        ],
      },
      example: {
        start: "5000",
        periode: "monat",
        verzug: "",
        perioden: [
          ["12000", "11000"],
          ["9000", "16000"],
          ["15000", "12000"],
          ["8000", "13500"],
          ["16000", "11000"],
          ["12000", "11500"],
        ],
      },
      compute: (i) => computePlan(i),
    },
  ],
};
export default def;
