import type { CalcDef } from "../types";
import { val, out, num, pct, undef, invalid } from "../helpers";

const def: CalcDef = {
  id: "conversion",
  schema: 1,
  variants: [
    {
      id: "besuche",
      label: "Besuchsbasiert",
      favLabel: "Conversion Rate (Besuche)",
      question: "Wie viele Besuche führten zu mindestens einer Conversion?",
      fields: [
        {
          key: "conv",
          label: "Besuche mit mindestens einer Conversion",
          min: "nonneg",
          integer: true,
          help: "Conversion = definiertes Ziel, z. B. Kauf oder Anfrage",
        },
        {
          key: "total",
          label: "Besuche insgesamt",
          min: "nonneg",
          integer: true,
          help: "im selben Zeitraum",
        },
      ],
      example: { conv: "25", total: "1000" },
      compute(i) {
        const c = val(i, "conv"),
          t = val(i, "total");
        if (t.isZero())
          return undef("Bei 0 Besuchen ist keine Conversion Rate definiert.");
        if (c.gt(t))
          return invalid(
            "Es können nicht mehr Besuche konvertieren, als es Besuche gab.",
            { conv: "Höchstens so viele wie Besuche insgesamt." },
          );
        const r = c.div(t).mul(100);
        return {
          status: "ok",
          main: out("Conversion Rate", r, "percent"),
          meaning: `${pct(r)} der Besuche haben mindestens einmal das Ziel erreicht – ${num(c)} von ${num(t)}.`,
          steps: [
            `Conversion Rate = konvertierte Besuche / Besuche × 100 = ${num(c)} / ${num(t)} × 100 = ${pct(r)}`,
          ],
          notes: [
            "Besuche, Besucher (Personen) und Interaktionen sind unterschiedliche Zählweisen – nicht mischen.",
          ],
        };
      },
    },
    {
      id: "ereignisse",
      label: "Ereignisbasiert",
      favLabel: "Conversion Rate (Ereignisse)",
      question: "Wie viele Conversion-Ereignisse kamen auf die Interaktionen?",
      fields: [
        {
          key: "conv",
          label: "Conversion-Ereignisse",
          min: "nonneg",
          integer: true,
          help: "jede einzelne Conversion zählt",
        },
        {
          key: "total",
          label: "Interaktionen",
          min: "nonneg",
          integer: true,
          help: "z. B. Klicks auf eine Anzeige, im selben Zeitraum",
        },
      ],
      example: { conv: "25", total: "1000" },
      compute(i) {
        const c = val(i, "conv"),
          t = val(i, "total");
        if (t.isZero())
          return undef(
            "Bei 0 Interaktionen ist keine Conversion Rate definiert.",
          );
        const r = c.div(t).mul(100);
        return {
          status: "ok",
          main: out("Conversion Rate (Ereignisse)", r, "percent"),
          meaning: `Auf 100 Interaktionen kamen ${num(r)} Conversion-Ereignisse.`,
          steps: [
            `Rate = Ereignisse / Interaktionen × 100 = ${num(c)} / ${num(t)} × 100 = ${pct(r)}`,
          ],
          notes: r.gt(100)
            ? [
                "Über 100 % ist hier möglich, weil eine Interaktion mehrere Conversions auslösen kann.",
              ]
            : [
                "Mehrere Conversions je Interaktion zählen einzeln; Werte über 100 % sind daher möglich.",
              ],
        };
      },
    },
  ],
};
export default def;
