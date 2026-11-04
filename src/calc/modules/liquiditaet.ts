import type { CalcDef } from "../types";
import { val, out, eur, pct } from "../helpers";

const m = (key: string, label: string, help: string) => ({
  key,
  label,
  unit: "€",
  min: "nonneg" as const,
  help,
});

const def: CalcDef = {
  id: "liquiditaet",
  schema: 1,
  variants: [
    {
      id: "standard",
      label: "Liquiditätsgrade",
      favLabel: "Liquidität 1., 2. und 3. Grades",
      fields: [
        m(
          "lm",
          "Liquide Mittel",
          "Kasse, Bankguthaben, kurzfristig verfügbare Zahlungsmitteläquivalente",
        ),
        m(
          "ford",
          "Kurzfristige Forderungen",
          "offene Kundenrechnungen, die bald eingehen",
        ),
        m(
          "vorr",
          "Vorräte",
          "Material, Waren, unfertige und fertige Erzeugnisse",
        ),
        m(
          "sonst",
          "Sonstiges Umlaufvermögen",
          "nicht schon oben enthalten; sonst 0 eintragen",
        ),
        m(
          "vb",
          "Kurzfristige Verpflichtungen",
          "kurzfristige Verbindlichkeiten inkl. kurzfristiger Rückstellungen",
        ),
      ],
      example: {
        lm: "10000",
        ford: "15000",
        vorr: "20000",
        sonst: "5000",
        vb: "20000",
      },
      compute(i) {
        const lm = val(i, "lm"),
          f = val(i, "ford"),
          v = val(i, "vorr"),
          s = val(i, "sonst"),
          vb = val(i, "vb");
        const uv = lm.add(f).add(v).add(s);
        if (vb.isZero())
          return {
            status: "undefined",
            message:
              "Ohne kurzfristige Verpflichtungen (0 €) sind die Liquiditätsgrade nicht definiert – es gibt nichts, womit verglichen wird.",
            partial: [out("Umlaufvermögen", uv, "money")],
          };
        const l1 = lm.div(vb).mul(100),
          l2 = lm.add(f).div(vb).mul(100),
          l3 = uv.div(vb).mul(100);
        return {
          status: "ok",
          main: out("Liquidität 1. Grades", l1, "percent"),
          extra: [
            out("Liquidität 2. Grades", l2, "percent"),
            out("Liquidität 3. Grades", l3, "percent"),
            out("Umlaufvermögen", uv, "money"),
          ],
          meaning: `Die liquiden Mittel decken ${pct(l1)} der kurzfristigen Verpflichtungen; mit Forderungen ${pct(l2)}, mit dem gesamten Umlaufvermögen ${pct(l3)}.`,
          steps: [
            `L1 = liquide Mittel / Verpflichtungen × 100 = ${eur(lm)} / ${eur(vb)} × 100 = ${pct(l1)}`,
            `L2 = (liquide Mittel + Forderungen) / Verpflichtungen × 100 = ${eur(lm.add(f))} / ${eur(vb)} × 100 = ${pct(l2)}`,
            `L3 = Umlaufvermögen / Verpflichtungen × 100 = ${eur(uv)} / ${eur(vb)} × 100 = ${pct(l3)}`,
          ],
          notes: [
            "Stichtagsbetrachtung. Keine pauschale Ampel: Welche Werte angemessen sind, hängt von Branche und Zahlungszielen ab.",
          ],
        };
      },
    },
  ],
};
export default def;
