import type { CalcDef, Out } from "../types";
import { val, opt, out, eur, pct, num, toInput } from "../helpers";

const def: CalcDef = {
  id: "deckungsbeitrag",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Deckungsbeitrag",
      favLabel: "Deckungsbeitrag berechnen",
      fields: [
        {
          key: "p",
          label: "Nettoverkaufspreis je Stück",
          unit: "€ je Stück",
          min: "nonneg",
          help: "Preis ohne Umsatzsteuer",
        },
        {
          key: "v",
          label: "Variable Kosten je Stück",
          unit: "€ je Stück",
          min: "nonneg",
          help: "Kosten, die mit jedem Stück zusätzlich entstehen, z. B. Material",
        },
        {
          key: "q",
          label: "Verkaufte Stückzahl (optional)",
          unit: "Stück",
          min: "nonneg",
          integer: true,
          optional: true,
        },
      ],
      example: { p: "50", v: "30", q: "100" },
      compute(i) {
        const p = val(i, "p"),
          v = val(i, "v"),
          q = opt(i, "q");
        const d = p.sub(v);
        const extra: Out[] = [];
        const steps = [
          `Stückdeckungsbeitrag d = p − v = ${eur(p)} − ${eur(v)} = ${eur(d)}`,
        ];
        const notes: string[] = [];
        if (p.isZero())
          notes.push(
            "Bei einem Verkaufspreis von 0 € ist die Deckungsbeitragsquote nicht definiert.",
          );
        else {
          const quote = d.div(p).mul(100);
          extra.push(out("Deckungsbeitragsquote", quote, "percent"));
          steps.push(
            `Deckungsbeitragsquote = d / p × 100 = ${eur(d)} / ${eur(p)} × 100 = ${pct(quote)}`,
          );
        }
        if (q) {
          extra.push(
            out("Gesamtdeckungsbeitrag", d.mul(q), "money"),
            out("Umsatz", p.mul(q), "money"),
          );
          steps.push(
            `Gesamtdeckungsbeitrag = d × q = ${eur(d)} × ${num(q)} = ${eur(d.mul(q))}`,
            `Umsatz = p × q = ${eur(p)} × ${num(q)} = ${eur(p.mul(q))}`,
          );
        }
        if (d.isNegative())
          notes.push(
            "Negativer Deckungsbeitrag: Jedes verkaufte Stück vergrößert den Verlust.",
          );
        return {
          status: "ok",
          main: out("Stückdeckungsbeitrag", d, "money", "je Stück"),
          extra,
          meaning: d.isNegative()
            ? `Der Preis deckt nicht einmal die variablen Kosten: Jedes Stück kostet ${eur(d.abs())} mehr, als es einbringt.`
            : `Jedes Stück trägt ${eur(d)} zur Deckung der Fixkosten bei – das ist noch nicht der Gewinn.`,
          steps,
          notes: notes.length ? notes : undefined,
          tone: d.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
  transfers: [
    {
      target: "break-even",
      label: "Preis und variable Kosten in Break-even übernehmen",
      describe: "Nettoverkaufspreis je Stück und variable Kosten je Stück",
      values: (i) => ({ p: toInput(val(i, "p")), v: toInput(val(i, "v")) }),
    },
    {
      target: "gewinn",
      label: "In Gewinnrechner übernehmen",
      describe:
        "Nettoverkaufspreis je Stück, variable Kosten je Stück und – falls angegeben – Stückzahl",
      values: (i) => {
        const r: Record<string, string> = {
          p: toInput(val(i, "p")),
          v: toInput(val(i, "v")),
        };
        const q = opt(i, "q");
        if (q) r.q = toInput(q);
        return r;
      },
    },
  ],
};
export default def;
