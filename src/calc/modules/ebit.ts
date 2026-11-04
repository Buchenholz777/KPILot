import type { CalcDef } from "../types";
import { val, out, eur, toInput } from "../helpers";

const def: CalcDef = {
  id: "ebit",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "EBIT",
      favLabel: "EBIT berechnen",
      fields: [
        {
          key: "umsatz",
          label: "Umsatzerlöse",
          unit: "€",
          min: "nonneg",
          help: "Nettoumsatz der Periode",
        },
        {
          key: "sonstige",
          label: "Sonstige betriebliche Erträge",
          unit: "€",
          min: "nonneg",
          help: "z. B. Mieteinnahmen, Erstattungen; sonst 0 eintragen",
        },
        {
          key: "aufwand",
          label: "Betriebliche Aufwendungen ohne Abschreibungen",
          unit: "€",
          min: "nonneg",
          help: "Material-, Personal- und sonstige Betriebsaufwendungen",
        },
        {
          key: "afa",
          label: "Betriebliche Abschreibungen",
          unit: "€",
          min: "nonneg",
          help: "Wertverlust von Maschinen, Fahrzeugen, Software usw.",
        },
      ],
      example: {
        umsatz: "100000",
        sonstige: "0",
        aufwand: "70000",
        afa: "10000",
      },
      compute(i) {
        const u = val(i, "umsatz"),
          s = val(i, "sonstige"),
          a = val(i, "aufwand"),
          afa = val(i, "afa");
        const ebit = u.add(s).sub(a).sub(afa);
        return {
          status: "ok",
          main: out("EBIT", ebit, "money", undefined, true),
          meaning: ebit.isNegative()
            ? `Das operative Geschäft erwirtschaftet vor Zinsen und Steuern einen Verlust von ${eur(ebit.abs())}.`
            : `Vor Zinsen und Ertragsteuern bleibt ein operatives Ergebnis von ${eur(ebit)} – das ist kein Kontostand.`,
          steps: [
            `EBIT = Umsatzerlöse + sonstige Erträge − Aufwendungen ohne Abschreibungen − Abschreibungen`,
            `= ${eur(u)} + ${eur(s)} − ${eur(a)} − ${eur(afa)} = ${eur(ebit)}`,
          ],
          notes: [
            "Zinsergebnis und Ertragsteuern sind in diesem vereinfachten Modell nicht enthalten.",
          ],
          tone: ebit.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
  transfers: [
    {
      target: "ebitda",
      label: "EBIT und Abschreibungen in EBITDA übernehmen",
      describe: "EBIT und die darin abgezogenen betrieblichen Abschreibungen",
      values: (i, r) => ({
        ebit: toInput(r.main.value),
        afa: toInput(val(i, "afa")),
      }),
    },
    {
      target: "ebit-marge",
      label: "EBIT und Umsatz in EBIT-Marge übernehmen",
      describe: "EBIT und Umsatzerlöse (Nettoumsatz) derselben Periode",
      values: (i, r) => ({
        ebit: toInput(r.main.value),
        umsatz: toInput(val(i, "umsatz")),
      }),
    },
  ],
};
export default def;
