import type { CalcDef } from "../types";
import { val, out, num } from "../helpers";

const fields = (bLabel: string) => [
  {
    key: "a",
    label: "Bekannte Menge a",
    min: "positive" as const,
    help: "z. B. 3 Artikel oder 3 Personen",
  },
  { key: "b", label: bLabel, min: "nonneg" as const },
  { key: "c", label: "Gesuchte Menge c", min: "positive" as const },
];

const def: CalcDef = {
  id: "dreisatz",
  schema: 1,
  variants: [
    {
      id: "direkt",
      label: "Direkt proportional",
      favLabel: "Dreisatz direkt proportional",
      question: "Mehr Menge, mehr Wert – z. B. Artikel und Preis",
      fields: fields("Zugehöriger Wert b (bei Menge a)"),
      example: { a: "3", b: "12", c: "5" },
      compute(i) {
        const a = val(i, "a"),
          b = val(i, "b"),
          c = val(i, "c");
        const per = b.div(a);
        const x = per.mul(c);
        return {
          status: "ok",
          main: out("Wert bei Menge c", x, "number"),
          extra: [out("Wert je Einheit", per, "number")],
          meaning: `Wenn ${num(a)} Einheiten ${num(b)} entsprechen, entsprechen ${num(c)} Einheiten ${num(x)}.`,
          steps: [
            `1 Einheit: ${num(b)} / ${num(a)} = ${num(per)}`,
            `${num(c)} Einheiten: ${num(per)} × ${num(c)} = ${num(x)}`,
          ],
          notes: [
            "Nur sinnvoll, wenn beide Größen wirklich im gleichen Verhältnis wachsen.",
          ],
        };
      },
    },
    {
      id: "umgekehrt",
      label: "Umgekehrt proportional",
      favLabel: "Dreisatz umgekehrt proportional",
      question: "Mehr Menge, weniger Wert – z. B. Personen und Arbeitszeit",
      fields: fields("Andere Größe b (bei Menge a)"),
      example: { a: "3", b: "6", c: "6" },
      compute(i) {
        const a = val(i, "a"),
          b = val(i, "b"),
          c = val(i, "c");
        const total = a.mul(b);
        const x = total.div(c);
        return {
          status: "ok",
          main: out("Andere Größe bei Menge c", x, "number"),
          extra: [out("Produkt a × b (bleibt gleich)", total, "number")],
          meaning: `Wenn bei ${num(a)} Einheiten ${num(b)} nötig sind, sind bei ${num(c)} Einheiten im idealisierten Modell ${num(x)} nötig.`,
          steps: [
            `Gesamtmenge: ${num(a)} × ${num(b)} = ${num(total)}`,
            `Bei ${num(c)}: ${num(total)} / ${num(c)} = ${num(x)}`,
          ],
          notes: [
            "Idealisiertes Modell: Es setzt voraus, dass sich die Arbeit beliebig gleichmäßig aufteilen lässt.",
          ],
        };
      },
    },
  ],
};
export default def;
