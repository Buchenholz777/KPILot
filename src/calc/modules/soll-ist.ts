import type { CalcDef } from "../types";
import { val, out, num, pct } from "../helpers";

const DIR = [
  { value: "neutral", label: "neutral (keine Bewertung)" },
  { value: "hoeher", label: "höher ist günstiger (z. B. Umsatz)" },
  { value: "niedriger", label: "niedriger ist günstiger (z. B. Kosten)" },
];

const def: CalcDef = {
  id: "soll-ist",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Soll-Ist-Abweichung",
      favLabel: "Soll-Ist-Abweichung berechnen",
      fields: [
        { key: "soll", label: "Soll (Plan)", min: "any" },
        { key: "ist", label: "Ist (tatsächlich)", min: "any" },
        {
          key: "richtung",
          label: "Zielrichtung",
          type: "select",
          options: DIR,
          defaultValue: "neutral",
        },
      ],
      example: { soll: "100", ist: "110", richtung: "hoeher" },
      compute(i) {
        const s = val(i, "soll"),
          x = val(i, "ist");
        const diff = x.sub(s);
        const dir = i.choices.richtung ?? "neutral";
        const absOut = out(
          "Abweichung absolut",
          diff,
          "number",
          undefined,
          true,
        );
        const judge =
          diff.isZero() || dir === "neutral"
            ? ""
            : (diff.gt(0) && dir === "hoeher") ||
                (diff.lt(0) && dir === "niedriger")
              ? " Bei dieser Zielrichtung ist das günstig."
              : " Bei dieser Zielrichtung ist das ungünstig.";
        if (s.isZero())
          return {
            status: "undefined",
            message:
              "Das Soll ist 0. Die absolute Abweichung ist bestimmbar, eine relative Abweichung in Prozent nicht.",
            partial: [absOut],
          };
        const rel = diff.div(s).mul(100);
        const tone = judge.includes("ungünstig")
          ? "negative"
          : judge.includes("günstig")
            ? "positive"
            : "neutral";
        return {
          status: "ok",
          main: out("Abweichung relativ", rel, "percent", undefined, true),
          extra: [absOut],
          meaning: `Das Ist liegt ${num(diff.abs())} ${diff.isNegative() ? "unter" : "über"} dem Soll (${pct(rel, true)}).${judge}`,
          steps: [
            `Abweichung = Ist − Soll = ${num(x)} − ${num(s)} = ${num(diff, true)}`,
            `Relativ = Abweichung / Soll × 100 = ${num(diff)} / ${num(s)} × 100 = ${pct(rel, true)}`,
          ],
          notes: s.isNegative()
            ? [
                "Negatives Soll: Die Prozentzahl ist nur eingeschränkt interpretierbar.",
              ]
            : [
                "Ein Plus ist nicht automatisch gut – bei Kosten ist es eine Überschreitung.",
              ],
          tone,
          chart: {
            kind: "bars",
            summary: `Soll ${num(s)}, Ist ${num(x)}, Abweichung ${pct(rel, true)}.`,
            panels: [
              {
                title: "Soll und Ist im Vergleich",
                bars: [
                  { label: "Soll (Plan)", value: s.abs().toNumber(), text: num(s), negative: s.isNegative() },
                  { label: "Ist", value: x.abs().toNumber(), text: num(x), emphasis: !x.isNegative(), negative: x.isNegative() },
                ],
              },
            ],
            table: {
              head: ["Größe", "Wert"],
              rows: [
                ["Soll (Plan)", num(s)],
                ["Ist (tatsächlich)", num(x)],
                ["Abweichung absolut", num(diff, true)],
                ["Abweichung relativ", pct(rel, true)],
              ],
            },
          },
        };
      },
    },
  ],
};
export default def;
