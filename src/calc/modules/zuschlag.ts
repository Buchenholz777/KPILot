import type { CalcDef } from "../types";
import { val, opt, out, eur, pct, undef } from "../helpers";

const pctField = (key: string, label: string, help: string) => ({
  key,
  label,
  unit: "%",
  min: "nonneg" as const,
  help,
});
const eurField = (key: string, label: string, help?: string) => ({
  key,
  label,
  unit: "€",
  min: "nonneg" as const,
  help,
});

const def: CalcDef = {
  id: "zuschlag",
  schema: 1,
  variants: [
    {
      id: "schema",
      label: "Kalkulationsschema",
      favLabel: "Zuschlagskalkulation (Schema)",
      question: "Was kostet eine Leistung vollständig?",
      fields: [
        eurField(
          "mek",
          "Materialeinzelkosten (MEK)",
          "direkt zurechenbares Material",
        ),
        pctField(
          "mgk",
          "Materialgemeinkosten-Zuschlag (MGK)",
          "z. B. Lager, Einkauf – bezogen auf MEK",
        ),
        eurField(
          "fek",
          "Fertigungseinzelkosten (FEK)",
          "direkt zurechenbare Fertigungslöhne",
        ),
        pctField(
          "fgk",
          "Fertigungsgemeinkosten-Zuschlag (FGK)",
          "z. B. Maschinen, Hallen – bezogen auf FEK",
        ),
        eurField(
          "sekf",
          "Sondereinzelkosten der Fertigung",
          "z. B. Spezialwerkzeug für diesen Auftrag",
        ),
        pctField(
          "vwgk",
          "Verwaltungsgemeinkosten-Zuschlag (VwGK)",
          "bezogen auf die Herstellkosten",
        ),
        pctField(
          "vtgk",
          "Vertriebsgemeinkosten-Zuschlag (VtGK)",
          "bezogen auf die Herstellkosten",
        ),
        eurField(
          "sekv",
          "Sondereinzelkosten des Vertriebs",
          "z. B. Spezialverpackung, Provision",
        ),
      ],
      example: {
        mek: "100",
        mgk: "10",
        fek: "50",
        fgk: "20",
        sekf: "0",
        vwgk: "5",
        vtgk: "10",
        sekv: "0",
      },
      compute(i) {
        const [mek, mgk, fek, fgk, sekf, vwgk, vtgk, sekv] = [
          "mek",
          "mgk",
          "fek",
          "fgk",
          "sekf",
          "vwgk",
          "vtgk",
          "sekv",
        ].map((k) => val(i, k));
        const mgkE = mek.mul(mgk).div(100),
          mk = mek.add(mgkE);
        const fgkE = fek.mul(fgk).div(100),
          fk = fek.add(fgkE).add(sekf);
        const hk = mk.add(fk);
        const vw = hk.mul(vwgk).div(100),
          vt = hk.mul(vtgk).div(100);
        const sk = hk.add(vw).add(vt).add(sekv);
        return {
          status: "ok",
          main: out("Selbstkosten", sk, "money"),
          extra: [
            out("Materialkosten", mk, "money"),
            out("Fertigungskosten", fk, "money"),
            out("Herstellkosten", hk, "money"),
            out("Verwaltungsgemeinkosten", vw, "money"),
            out("Vertriebsgemeinkosten", vt, "money"),
          ],
          meaning: `Die Leistung verursacht im Modell ${eur(sk)} Selbstkosten – darin ist noch kein Gewinn enthalten.`,
          steps: [
            `Materialkosten = ${eur(mek)} + ${pct(mgk)} = ${eur(mek)} + ${eur(mgkE)} = ${eur(mk)}`,
            `Fertigungskosten = ${eur(fek)} + ${pct(fgk)} + ${eur(sekf)} = ${eur(fek)} + ${eur(fgkE)} + ${eur(sekf)} = ${eur(fk)}`,
            `Herstellkosten = ${eur(mk)} + ${eur(fk)} = ${eur(hk)}`,
            `Verwaltung ${pct(vwgk)} von ${eur(hk)} = ${eur(vw)}; Vertrieb ${pct(vtgk)} von ${eur(hk)} = ${eur(vt)}`,
            `Selbstkosten = ${eur(hk)} + ${eur(vw)} + ${eur(vt)} + ${eur(sekv)} = ${eur(sk)}`,
          ],
          notes: [
            "Vereinfachtes Schema: Zuschlagssätze und Bezugsbasen stammen aus deiner Kostenstellenrechnung.",
          ],
        };
      },
    },
    {
      id: "satz",
      label: "Zuschlagssatz ermitteln",
      favLabel: "Zuschlagssatz ermitteln",
      question: "Wie hoch ist mein Gemeinkostenzuschlag?",
      fields: [
        eurField(
          "gk",
          "Gemeinkosten der Periode",
          "Summe der nicht direkt zurechenbaren Kosten",
        ),
        eurField(
          "basis",
          "Bezugsbasis der Periode",
          "z. B. Summe der Fertigungslöhne derselben Periode",
        ),
        {
          ...eurField(
            "leistung",
            "Bezugsbasis einer einzelnen Leistung (optional)",
            "z. B. Fertigungslohn dieses Auftrags",
          ),
          optional: true,
        },
      ],
      example: { gk: "20000", basis: "100000", leistung: "50" },
      compute(i) {
        const gk = val(i, "gk"),
          basis = val(i, "basis"),
          l = opt(i, "leistung");
        if (basis.isZero())
          return undef(
            "Die Bezugsbasis ist 0 €. Ein Zuschlagssatz ist dann nicht definiert – bitte eine passende Bezugsbasis wählen.",
          );
        const satz = gk.div(basis).mul(100);
        const extra = l
          ? [out("Zuschlag für diese Leistung", l.mul(satz).div(100), "money")]
          : [];
        return {
          status: "ok",
          main: out("Zuschlagssatz", satz, "percent"),
          extra,
          meaning: `Auf jeden Euro Bezugsbasis kommen ${pct(satz)} Gemeinkosten hinzu.`,
          steps: [
            `Zuschlagssatz = Gemeinkosten / Bezugsbasis × 100 = ${eur(gk)} / ${eur(basis)} × 100 = ${pct(satz)}`,
            ...(l
              ? [
                  `Zuschlag der Leistung = ${eur(l)} × ${pct(satz)} = ${eur(l.mul(satz).div(100))}`,
                ]
              : []),
          ],
          notes: [
            "Periodensummen (Satzermittlung) und Beträge einer einzelnen Leistung nicht vermischen.",
          ],
        };
      },
    },
  ],
};
export default def;
