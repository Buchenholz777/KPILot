import type { CalcDef } from "../types";
import { val, out, eur } from "../helpers";

const m = (key: string, label: string, help?: string) => ({
  key,
  label,
  unit: "€",
  min: "nonneg" as const,
  help,
});

const def: CalcDef = {
  id: "cashflow",
  schema: 1,
  variants: [
    {
      id: "operativ",
      label: "Operativer Cashflow",
      favLabel: "Operativer Cashflow",
      fields: [
        m(
          "ein",
          "Betriebliche Einzahlungen",
          "tatsächlich eingegangene Zahlungen aus dem laufenden Geschäft",
        ),
        m(
          "aus",
          "Betriebliche Auszahlungen",
          "tatsächlich geleistete Zahlungen, z. B. Löhne, Miete, Lieferanten",
        ),
      ],
      example: { ein: "30000", aus: "22000" },
      compute(i) {
        const e = val(i, "ein"),
          a = val(i, "aus");
        const cf = e.sub(a);
        return {
          status: "ok",
          main: out("Operativer Cashflow", cf, "money", undefined, true),
          meaning: cf.isNegative()
            ? `Aus dem laufenden Geschäft ist ${eur(cf.abs())} mehr abgeflossen als zugeflossen.`
            : `Aus dem laufenden Geschäft sind netto ${eur(cf)} zugeflossen.`,
          steps: [
            `Operativer Cashflow = Einzahlungen − Auszahlungen = ${eur(e)} − ${eur(a)} = ${eur(cf)}`,
          ],
          notes: [
            "Nur tatsächliche Zahlungen zählen: Unbezahlte Rechnungen und Abschreibungen bewegen kein Geld.",
          ],
          tone: cf.isNegative() ? "negative" : "positive",
        };
      },
    },
    {
      id: "erweitert",
      label: "Erweiterte Übersicht",
      favLabel: "Cashflow mit Investition und Finanzierung",
      fields: [
        m("ein", "Betriebliche Einzahlungen"),
        m("aus", "Betriebliche Auszahlungen"),
        m("invEin", "Investive Einzahlungen", "z. B. Verkauf einer Maschine"),
        m("invAus", "Investive Auszahlungen", "z. B. Kauf einer Maschine"),
        m(
          "finEin",
          "Finanzierungs-Einzahlungen",
          "z. B. Kreditaufnahme, Einlage",
        ),
        m("finAus", "Finanzierungs-Auszahlungen", "z. B. Tilgung, Entnahme"),
      ],
      example: {
        ein: "30000",
        aus: "22000",
        invEin: "0",
        invAus: "5000",
        finEin: "2000",
        finAus: "0",
      },
      compute(i) {
        const op = val(i, "ein").sub(val(i, "aus"));
        const inv = val(i, "invEin").sub(val(i, "invAus"));
        const fin = val(i, "finEin").sub(val(i, "finAus"));
        const net = op.add(inv).add(fin);
        return {
          status: "ok",
          main: out("Erfasster Netto-Cashflow", net, "money", undefined, true),
          extra: [
            out("Operativer Cashflow", op, "money", undefined, true),
            out("Investitions-Cashflow", inv, "money", undefined, true),
            out("Finanzierungs-Cashflow", fin, "money", undefined, true),
          ],
          meaning: `Über alle drei erfassten Bereiche hat sich der Zahlungsmittelbestand um ${eur(net)} verändert.`,
          steps: [
            `Operativ = ${eur(val(i, "ein"))} − ${eur(val(i, "aus"))} = ${eur(op)}`,
            `Investiv = ${eur(val(i, "invEin"))} − ${eur(val(i, "invAus"))} = ${eur(inv)}`,
            `Finanzierung = ${eur(val(i, "finEin"))} − ${eur(val(i, "finAus"))} = ${eur(fin)}`,
            `Netto = ${eur(op)} + ${eur(inv)} + ${eur(fin)} = ${eur(net)}`,
          ],
          notes: [
            "Vereinfachte, direkte Zahlungsübersicht – keine gesetzliche Kapitalflussrechnung. Zinsen und Steuern hier dem operativen Bereich zuordnen.",
          ],
          tone: net.isNegative() ? "negative" : "neutral",
        };
      },
    },
  ],
};
export default def;
