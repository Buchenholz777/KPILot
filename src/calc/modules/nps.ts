import type { CalcDef } from "../types";
import { val, out, num, pct, undef, formatValue } from "../helpers";

const def: CalcDef = {
  id: "nps",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "NPS",
      favLabel: "NPS berechnen",
      fields: [
        {
          key: "pro",
          label: "Promotoren (Bewertung 9–10)",
          min: "nonneg",
          integer: true,
        },
        {
          key: "pas",
          label: "Passive (Bewertung 7–8)",
          min: "nonneg",
          integer: true,
        },
        {
          key: "det",
          label: "Detraktoren (Bewertung 0–6)",
          min: "nonneg",
          integer: true,
        },
      ],
      example: { pro: "60", pas: "10", det: "30" },
      compute(i) {
        const p = val(i, "pro"),
          s = val(i, "pas"),
          d = val(i, "det");
        const n = p.add(s).add(d);
        if (n.isZero()) return undef("Ohne Antworten ist kein NPS definiert.");
        const nps = p.sub(d).div(n).mul(100);
        const notes = [
          "Ein Score zwischen −100 und +100, keine Erfolgsquote in Prozent.",
        ];
        if (n.lt(30))
          notes.push(
            `Nur ${num(n)} Antworten: Kleine Stichproben schwanken stark.`,
          );
        return {
          status: "ok",
          main: out("Net Promoter Score", nps, "score", "Punkte"),
          extra: [
            out("Anteil Promotoren", p.div(n).mul(100), "percent"),
            out("Anteil Detraktoren", d.div(n).mul(100), "percent"),
            out("Antworten gesamt", n, "integer"),
          ],
          meaning: `${pct(p.div(n).mul(100))} Promotoren minus ${pct(d.div(n).mul(100))} Detraktoren ergeben einen NPS von ${formatValue(nps, "score")}.`,
          steps: [
            `NPS = (Promotoren − Detraktoren) / alle Antworten × 100 = (${num(p)} − ${num(d)}) / ${num(n)} × 100 = ${formatValue(nps, "score")}`,
          ],
          notes,
        };
      },
    },
  ],
};
export default def;
