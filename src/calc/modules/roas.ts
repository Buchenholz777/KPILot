import type { CalcDef, CalcResult, Out } from "../types";
import { D, val, opt, out, det, eur, pct, undef, formatValue, toInput } from "../helpers";
import type { Decimal } from "../../lib/decimal";

const umsatz = {
  key: "umsatz",
  label: "Zugeordneter Werbeumsatz",
  unit: "€",
  min: "nonneg" as const,
  help: "Nettoumsatz, den die Messung dieser Werbung zuordnet",
};
const kosten = {
  key: "kosten",
  label: "Werbekosten",
  unit: "€",
  min: "nonneg" as const,
  help: "im selben Zeitraum und derselben Messung",
};

/** Bausteine der Werbewirtschaftlichkeit (vereinfachtes Modell, siehe docs/MODELLANNAHMEN.md). */
export function adEconomics(u: Decimal, k: Decimal, quotePct: Decimal) {
  const q = quotePct.div(100);
  const dbBefore = u.mul(q);
  const after = dbBefore.sub(k);
  const roas = k.isZero() ? undefined : u.div(k);
  const minRoas = q.gt(0) ? D(1).div(q) : undefined;
  return { dbBefore, after, roas, minRoas };
}

const def: CalcDef = {
  id: "roas",
  schema: 1,
  scenario: { variantId: "wirtschaftlichkeit" },
  variants: [
    {
      id: "standard",
      label: "ROAS",
      favLabel: "ROAS berechnen",
      fields: [umsatz, kosten],
      example: { umsatz: "2000", kosten: "500" },
      compute(i) {
        const u = val(i, "umsatz"),
          k = val(i, "kosten");
        if (k.isZero())
          return undef(
            "Bei 0 € Werbekosten ist der ROAS mathematisch nicht definiert (keine Division durch 0).",
          );
        const f = u.div(k);
        return {
          status: "ok",
          main: out("ROAS", f, "factor"),
          extra: [out("ROAS in Prozent", f.mul(100), "percent")],
          meaning: `Pro eingesetztem Werbe-Euro wurden ${eur(f)} Umsatz zugeordnet (${formatValue(f, "factor")}). Das ist Umsatz, kein Gewinn.`,
          steps: [
            `ROAS = Werbeumsatz / Werbekosten = ${eur(u)} / ${eur(k)} = ${formatValue(f, "factor")} = ${pct(f.mul(100))}`,
          ],
          notes: [
            "ROAS ist keine Gewinnkennzahl. Attribution und Umsatzdefinition beeinflussen das Ergebnis stark.",
          ],
        };
      },
    },
    {
      id: "wirtschaftlichkeit",
      label: "Werbewirtschaftlichkeit",
      favLabel: "Werbewirtschaftlichkeit und Mindest-ROAS",
      question: "Bleibt nach den Werbekosten noch ein Beitrag übrig – und wie hoch müsste der ROAS mindestens sein?",
      fields: [
        umsatz,
        kosten,
        {
          key: "quote",
          label: "Deckungsbeitragsquote vor Werbekosten",
          unit: "%",
          min: "any",
          max: 100,
          help: "Anteil des zugeordneten Umsatzes, der nach den variablen Kosten (Ware, Material, Versand, Gebühren …) bleibt – aber noch vor Abzug der Werbekosten. So wird Werbung nicht doppelt abgezogen.",
        },
        {
          key: "alt",
          label: "Alternative Deckungsbeitragsquote (optional)",
          unit: "%",
          min: "any",
          max: 100,
          optional: true,
          help: "Zum Vergleich: Was ändert sich bei höheren oder niedrigeren variablen Kosten? Wähle eine Quote, die du begründen kannst.",
        },
      ],
      example: { umsatz: "2000", kosten: "500", quote: "30", alt: "" },
      compute(i) {
        const u = val(i, "umsatz"),
          k = val(i, "kosten"),
          qp = val(i, "quote"),
          altp = opt(i, "alt");
        const m = adEconomics(u, k, qp);
        const notes: string[] = [
          "Weitere Fixkosten (Personal, Miete, Software …) sind damit nicht automatisch gedeckt. Umsatz, Deckungsbeitrag und Gewinn sind verschiedene Größen.",
          "Achte auf übereinstimmende Messzeiträume und die Attribution: Welcher Umsatz der Werbung zugerechnet wird, bestimmt das Ergebnis. Leads, Bestellungen und Neukunden sind nicht dasselbe.",
        ];
        const steps = [
          `Deckungsbeitrag vor Werbung = Umsatz × Quote = ${eur(u)} × ${pct(qp)} = ${eur(m.dbBefore)}`,
          `Beitrag nach Werbung = ${eur(m.dbBefore)} − ${eur(k)} = ${eur(m.after)}`,
        ];
        const extra: Out[] = [out("Deckungsbeitrag vor Werbekosten", m.dbBefore, "money")];
        if (m.roas) {
          extra.push(out("ROAS", m.roas, "factor"));
          steps.push(`ROAS = ${eur(u)} / ${eur(k)} = ${formatValue(m.roas, "factor")}`);
        } else {
          notes.unshift("Bei 0 € Werbekosten ist der ROAS nicht definiert. Die übrigen Werte sind trotzdem berechnet.");
        }
        if (m.minRoas) {
          extra.push(out("Mindest-ROAS zur Deckung der Werbekosten", m.minRoas, "factor"));
          steps.push(`Mindest-ROAS = 1 / Quote = 1 / ${formatValue(qp.div(100), "number")} = ${formatValue(m.minRoas, "number")}`);
          if (m.roas) {
            const gap = m.roas.sub(m.minRoas);
            extra.push(det(out(gap.isNegative() ? "Abstand zum Mindest-ROAS (darunter)" : "Abstand zum Mindest-ROAS (darüber)", gap, "number", undefined, true)));
          }
        } else {
          notes.unshift(
            qp.isNegative()
              ? "Bei negativer Deckungsbeitragsquote liegen schon die variablen Kosten über dem Umsatz: Kein ROAS kann die Werbung decken."
              : "Bei 0 % Deckungsbeitragsquote bleibt vom Umsatz nichts übrig, um Werbung zu bezahlen: Ein Mindest-ROAS ist nicht definiert.",
          );
        }
        if (altp) {
          const a = adEconomics(u, k, altp);
          extra.push(
            det(out(`Beitrag nach Werbung bei ${pct(altp)} Quote`, a.after, "money", undefined, true)),
            det(out("Veränderung gegenüber deiner Quote", a.after.sub(m.after), "money", undefined, true)),
          );
          if (a.minRoas) extra.push(det(out(`Mindest-ROAS bei ${pct(altp)} Quote`, a.minRoas, "factor")));
          steps.push(
            `Alternative Quote ${pct(altp)}: Beitrag nach Werbung = ${eur(u)} × ${pct(altp)} − ${eur(k)} = ${eur(a.after)}`,
          );
        }
        const positive = m.after.gt(0);
        const result: CalcResult = {
          status: "ok",
          main: out("Beitrag nach Werbekosten", m.after, "money", undefined, true),
          extra,
          meaning: positive
            ? `Nach den variablen Kosten bleiben ${eur(m.dbBefore)}; davon gehen ${eur(k)} Werbekosten ab. Es bleiben ${eur(m.after)} zur Deckung weiterer Fixkosten – das ist noch kein Gewinn.`
            : m.after.isZero()
              ? `Der Deckungsbeitrag (${eur(m.dbBefore)}) deckt die Werbekosten genau. Für weitere Fixkosten bleibt nichts übrig.`
              : `Der Deckungsbeitrag (${eur(m.dbBefore)}) deckt die Werbekosten (${eur(k)}) nicht: Die Werbung kostet ${eur(m.after.abs())} mehr, als sie in diesem einfachen Modell einbringt.`,
          steps,
          notes,
          tone: positive ? "positive" : m.after.isZero() ? "neutral" : "negative",
        };
        return result;
      },
    },
  ],
  followUps: [
    {
      id: "roas-wirtschaftlichkeit",
      variantId: "standard",
      when: (_i, r) => r.status === "ok",
      text: "Der ROAS ist Umsatz, kein Gewinn.",
      label: "Deckungsbeitragsquote ergänzen und Werbewirtschaftlichkeit prüfen",
      action: {
        kind: "variant",
        variantId: "wirtschaftlichkeit",
        describe: "Zugeordneter Werbeumsatz und Werbekosten",
        values: (i) => ({ umsatz: toInput(val(i, "umsatz")), kosten: toInput(val(i, "kosten")) }),
      },
    },
    {
      id: "roas-quote-fehlt",
      variantId: "wirtschaftlichkeit",
      when: (_i, r) => r.status === "ok" && r.main.value.isNegative(),
      text: "Die Werbung deckt sich in diesem Modell nicht.",
      label: "Quote und Kostenannahmen prüfen",
      action: { kind: "focus", fields: ["quote", "alt"] },
    },
  ],
};
export default def;
