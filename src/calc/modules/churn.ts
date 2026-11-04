import type { CalcDef } from "../types";
import { val, opt, out, num, pct, undef, invalid } from "../helpers";

const def: CalcDef = {
  id: "churn",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Churn & Retention",
      favLabel: "Churn-Rate berechnen",
      fields: [
        {
          key: "anfang",
          label: "Kunden zu Periodenbeginn",
          min: "nonneg",
          integer: true,
        },
        {
          key: "verloren",
          label: "Davon im Zeitraum verloren",
          min: "nonneg",
          integer: true,
          help: "nur Kunden aus dem Anfangsbestand",
        },
        {
          key: "neu",
          label: "Neukunden im Zeitraum (optional)",
          min: "nonneg",
          integer: true,
          optional: true,
          help: "werden getrennt gezeigt, verändern die Quote nicht",
        },
      ],
      example: { anfang: "100", verloren: "10", neu: "20" },
      compute(i) {
        const a = val(i, "anfang"),
          v = val(i, "verloren"),
          n = opt(i, "neu");
        if (a.isZero())
          return undef(
            "Ohne Kunden zu Periodenbeginn ist keine Churn-Rate definiert.",
          );
        if (v.gt(a))
          return invalid(
            "Es können nicht mehr Kunden verloren gehen, als zu Beginn da waren.",
            { verloren: "Höchstens so viele wie zu Periodenbeginn." },
          );
        const bleiben = a.sub(v);
        const churn = v.div(a).mul(100),
          ret = bleiben.div(a).mul(100);
        const extra = [
          out("Retention (Kundenbindung)", ret, "percent"),
          out("Verbliebene Kunden der Anfangskohorte", bleiben, "integer"),
        ];
        if (n)
          extra.push(
            out(
              "Kundenbestand am Ende inkl. Neukunden",
              bleiben.add(n),
              "integer",
            ),
          );
        return {
          status: "ok",
          main: out("Churn-Rate", churn, "percent"),
          extra,
          meaning: `${pct(churn)} der Anfangskunden sind gegangen, ${pct(ret)} geblieben.`,
          steps: [
            `Churn = verlorene / Anfangsbestand × 100 = ${num(v)} / ${num(a)} × 100 = ${pct(churn)}`,
            `Retention = (${num(a)} − ${num(v)}) / ${num(a)} × 100 = ${pct(ret)}`,
          ],
          notes: [
            "Neukunden gehören nicht zur Anfangskohorte und verbessern die Retention nicht.",
          ],
        };
      },
    },
  ],
};
export default def;
