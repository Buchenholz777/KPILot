import type { CalcDef } from "../types";
import { D, val, out, undef, num, pct } from "../helpers";
import { impossible } from "../helpers";
import { formatDecimal } from "../../lib/number";

const G = {
  key: "g",
  label: "Grundwert (das Ganze)",
  help: "Die Bezugsgröße, die 100 % entspricht, z. B. der ursprüngliche Preis.",
  min: "any",
} as const;
const P = {
  key: "p",
  label: "Prozentsatz (der Anteil in %)",
  unit: "%",
  help: "Werte über 100 % sind möglich.",
  min: "any",
} as const;
const W = {
  key: "w",
  label: "Prozentwert (der Teil)",
  help: "Der Betrag, der dem Prozentsatz entspricht.",
  min: "any",
} as const;

const n = (x: ReturnType<typeof D>) => formatDecimal(x, { max: 4 });

const def: CalcDef = {
  id: "prozent",
  schema: 1,
  variants: [
    {
      id: "prozentwert",
      label: "Prozentwert",
      favLabel: "Prozentwert berechnen",
      question: "Wie viel sind p Prozent von G?",
      fields: [G, P],
      example: { g: "250", p: "20" },
      compute(i) {
        const g = val(i, "g"),
          p = val(i, "p");
        const w = g.mul(p).div(100);
        return {
          status: "ok",
          main: out("Prozentwert W", w, "number"),
          meaning: `${pct(p)} von ${n(g)} sind ${n(w)}.`,
          steps: [`W = G × p / 100`, `W = ${n(g)} × ${n(p)} / 100 = ${n(w)}`],
        };
      },
    },
    {
      id: "prozentsatz",
      label: "Prozentsatz",
      favLabel: "Prozentsatz berechnen",
      question: "Wie viel Prozent sind W von G?",
      fields: [W, G],
      example: { w: "50", g: "250" },
      compute(i) {
        const w = val(i, "w"),
          g = val(i, "g");
        if (g.isZero())
          return undef(
            "Der Grundwert ist 0. Durch 0 kann nicht geteilt werden, daher ist kein Prozentsatz definiert.",
          );
        const p = w.div(g).mul(100);
        return {
          status: "ok",
          main: out("Prozentsatz p", p, "percent"),
          meaning: `${n(w)} sind ${pct(p)} von ${n(g)}.`,
          steps: [
            `p = W / G × 100`,
            `p = ${n(w)} / ${n(g)} × 100 = ${formatDecimal(p, { max: 4 })} %`,
          ],
          notes: p.gt(100)
            ? [
                "Über 100 %: Der Teil ist größer als das Ganze, z. B. bei Wachstum.",
              ]
            : undefined,
        };
      },
    },
    {
      id: "grundwert",
      label: "Grundwert",
      favLabel: "Grundwert berechnen",
      question: "W sind p Prozent – wie groß ist das Ganze?",
      fields: [W, P],
      example: { w: "50", p: "20" },
      compute(i) {
        const w = val(i, "w"),
          p = val(i, "p");
        if (p.isZero()) {
          return w.isZero()
            ? {
                status: "ambiguous",
                message:
                  "0 sind 0 % von jedem beliebigen Grundwert. Der Grundwert ist nicht eindeutig bestimmbar.",
              }
            : impossible(
                "Ein Prozentwert ungleich 0 kann nicht 0 % eines Grundwerts sein. Es gibt keine Lösung.",
              );
        }
        const g = w.mul(100).div(p);
        return {
          status: "ok",
          main: out("Grundwert G", g, "number"),
          meaning: `${n(w)} sind ${pct(p)} von ${n(g)}.`,
          steps: [`G = W × 100 / p`, `G = ${n(w)} × 100 / ${n(p)} = ${n(g)}`],
        };
      },
    },
  ],
};
export default def;
void num;
