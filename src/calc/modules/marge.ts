import type { CalcDef, Out } from "../types";
import { val, out, eur, pct } from "../helpers";

const def: CalcDef = {
  id: "marge",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Marge & Aufschlag",
      favLabel: "Marge und Aufschlag berechnen",
      fields: [
        {
          key: "k",
          label: "Kostenbasis (z. B. Einstandspreis)",
          unit: "€",
          min: "nonneg",
          help: "Einkaufspreis inkl. Bezugskosten, netto",
        },
        { key: "p", label: "Nettoverkaufspreis", unit: "€", min: "nonneg" },
      ],
      example: { k: "80", p: "100" },
      compute(i) {
        const k = val(i, "k"),
          p = val(i, "p");
        const diff = p.sub(k);
        const diffOut = out(
          "Differenz (Rohertrag)",
          diff,
          "money",
          undefined,
          true,
        );
        const steps = [
          `Differenz = Verkaufspreis − Kostenbasis = ${eur(p)} − ${eur(k)} = ${eur(diff)}`,
        ];
        const notes: string[] = [
          "Die Rohmarge berücksichtigt weitere Betriebskosten (Miete, Personal …) noch nicht.",
        ];
        let marge: Out | undefined;
        let auf: Out | undefined;
        if (!p.isZero()) {
          const m = diff.div(p).mul(100);
          marge = out("Marge (Handelsspanne)", m, "percent", undefined, true);
          steps.push(
            `Marge = Differenz / Verkaufspreis × 100 = ${eur(diff)} / ${eur(p)} × 100 = ${pct(m)}`,
          );
        } else
          notes.unshift(
            "Verkaufspreis 0 €: Eine Marge in Prozent ist nicht definiert.",
          );
        if (!k.isZero()) {
          const a = diff.div(k).mul(100);
          auf = out("Aufschlag", a, "percent", undefined, true);
          steps.push(
            `Aufschlag = Differenz / Kostenbasis × 100 = ${eur(diff)} / ${eur(k)} × 100 = ${pct(a)}`,
          );
        } else
          notes.unshift(
            p.isZero()
              ? "Kostenbasis 0 €: Ein Aufschlag in Prozent ist nicht definiert."
              : "Kostenbasis 0 € bei positivem Verkaufspreis: Die Marge beträgt 100 %. Ein Aufschlag auf Kosten von 0 € ist nicht definiert.",
          );
        if (!marge && !auf)
          return {
            status: "undefined",
            message:
              "Kostenbasis und Verkaufspreis sind 0 €: Weder Marge noch Aufschlag sind definiert.",
            partial: [diffOut],
          };
        if (diff.isNegative())
          notes.unshift(
            "Verkauf unter Kosten: Marge und Aufschlag sind negativ.",
          );
        const main = marge ?? auf!;
        const extra = [marge ? auf : undefined, diffOut].filter(
          Boolean,
        ) as Out[];
        return {
          status: "ok",
          main,
          extra,
          meaning:
            marge && auf
              ? `Vom Verkaufspreis bleiben ${pct(marge.value)} als Rohertrag; bezogen auf die Kosten sind das ${pct(auf.value)} Aufschlag.`
              : `Die Differenz beträgt ${eur(diff)}.`,
          steps,
          notes,
          tone: diff.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
