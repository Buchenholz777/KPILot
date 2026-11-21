import type { Builder } from "./kit";
import { bars, bridge, composition, eur, int, isPartOfWhole, none, num, outOf, pct, scale, val } from "./kit";
import { D } from "../../lib/decimal";
import { formatDecimal, formatValue } from "../../lib/number";

const arpu: Builder = (i, r) => {
  const u = val(i, "umsatz")!,
    a = val(i, "accounts")!;
  const per = i.choices.periode === "jahr" ? "Jahr" : i.choices.periode === "quartal" ? "Quartal" : "Monat";
  return {
    charts: [
      bars({
        title: "Umsatz, Accounts und Umsatz je Account",
        panels: [
          { title: "Umsatz (€)", bars: [{ label: "Umsatz", value: num(u), text: eur(u) }] },
          { title: "Accounts", bars: [{ label: "Accounts", value: num(a), text: int(a) }] },
          ...(r.status === "ok" ? [{ title: `Umsatz je Account (€ je ${per})`, bars: [{ label: "ARPU", value: num(r.main.value), text: eur(r.main.value), emphasis: true }] }] : []),
        ],
        caption: r.status === "ok" ? `${eur(u)} Umsatz im ${per} bei ${int(a)} Accounts ergeben ${eur(r.main.value)} je Account. Umsatz und Accounts haben getrennte Achsen.` : "Ohne Accounts ist der ARPU nicht definiert.",
      }),
    ],
  };
};

const clv: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const u = outOf(r, "Lebenszeit-Umsatz")!.value;
  const clvV = r.main.value;
  const after = outOf(r, "Modellbeitrag nach");
  const cac = val(i, "cac");
  return {
    charts: [
      bridge({
        title: "Vom angenommenen Lebenszeit-Umsatz zum Kundenwert (Modell)",
        unit: "€ je Kunde",
        steps: [
          { label: "Lebenszeit-Umsatz (Modell)", value: num(u), text: eur(u), type: "total" },
          { label: "Variable Kosten", value: -num(u.sub(clvV)), text: eur(u.sub(clvV).neg()), type: "delta" },
          { label: "CLV (Deckungsbeitrag)", value: num(clvV), text: eur(clvV, true), type: after ? "subtotal" : "total" },
          ...(after && cac ? [{ label: "Akquisitionskosten", value: -num(cac), text: eur(cac.neg()), type: "delta" as const }, { label: "Beitrag nach Akquisition", value: num(after.value), text: eur(after.value, true), type: "total" as const }] : []),
        ],
        caption: `Käufe, Bestellwert und Beziehungsdauer sind Annahmen: ${eur(u)} Lebenszeit-Umsatz ergeben im Modell ${eur(clvV, true)} Deckungsbeitrag je Kunde${after ? `, nach Akquisition ${eur(after.value, true)}` : ""}. Das sind Modellwerte, keine beobachteten Kohortendaten.`,
        notice: "Modellwerte aus angenommenen Eingaben – keine beobachteten Kundendaten.",
      }),
    ],
  };
};

const churn: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne Anfangskunden ist keine Churn-Rate definiert – es gibt keine Grafik.");
  const a = val(i, "anfang")!,
    lost = val(i, "verloren")!;
  const stay = a.sub(lost);
  const neu = val(i, "neu");
  if (!isPartOfWhole(lost, a)) return none("Die verlorenen Kunden übersteigen die Anfangskunden – kein gemeinsames Ganzes für eine Grafik.");
  return {
    charts: [
      composition({
        title: "Kohorte der Anfangskunden",
        parts: [{ label: "Verblieben", value: num(stay), text: `${int(stay)} (${pct(outOf(r, "Retention")!.value)})` }, { label: "Verloren", value: num(lost), text: `${int(lost)} (${pct(r.main.value)})` }],
        totalLabel: `${int(a)} Anfangskunden`,
        caption: `Von ${int(a)} Kunden zu Beginn sind ${int(lost)} verloren gegangen: Churn-Rate ${pct(r.main.value)}.${neu && !neu.isZero() ? ` ${int(neu)} Neukunden gehören nicht zur Anfangskohorte und sind hier nicht eingerechnet.` : ""}`,
      }),
    ],
  };
};

const mrr: Builder = (_i, r) => {
  if (r.status !== "ok") return none("Ohne vollständige Tarifzeile gibt es keine Grafik.");
  const parts = r.breakdown ?? [];
  const arr = outOf(r, "ARR")!.value;
  return {
    charts: [
      bars({
        title: "Monatliche Umsatzbeiträge der Tarife und Jahreshochrechnung",
        panels: [
          { title: "MRR je Tarif (€ je Monat)", bars: [...parts.map((p) => ({ label: p.label, value: num(p.value), text: eur(p.value) })), { label: "MRR gesamt", value: num(r.main.value), text: eur(r.main.value), emphasis: true }] },
          { title: "ARR (€ je Jahr)", bars: [{ label: "ARR = MRR × 12", value: num(arr), text: eur(arr), emphasis: true }] },
        ],
        caption: `Die Tarife ergeben ${eur(r.main.value)} MRR je Monat; hochgerechnet (× 12) sind das ${eur(arr)} ARR je Jahr. ARR ist eine Run-Rate, keine Prognose und kein Anteil von MRR – beide stehen auf getrennten Achsen.`,
      }),
    ],
  };
};

const nps: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne Antworten ist kein Score definiert – es gibt keine Grafik.");
  const pro = val(i, "pro")!,
    pas = val(i, "pas")!,
    det = val(i, "det")!;
  const total = pro.add(pas).add(det);
  return {
    charts: [
      composition({
        title: "Antwortverteilung",
        parts: [{ label: "Promotoren", value: num(pro), text: `${int(pro)} (${pct(outOf(r, "Anteil Promotoren")!.value)})` }, { label: "Passive", value: num(pas), text: int(pas) }, { label: "Detraktoren", value: num(det), text: `${int(det)} (${pct(outOf(r, "Anteil Detraktoren")!.value)})` }],
        totalLabel: `${int(total)} Antworten`,
        caption: `${int(total)} Antworten verteilen sich auf Promotoren, Passive und Detraktoren.`,
      }),
      scale({
        title: "Net Promoter Score auf der Skala von −100 bis +100",
        min: -100,
        max: 100,
        value: num(r.main.value),
        text: `${formatValue(r.main.value, "score")} Punkte`,
        axisFormat: (v) => (v > 0 ? `+${v}` : `${v}`).replace("-", "−"),
        caption: `Score = Anteil Promotoren − Anteil Detraktoren = ${formatValue(r.main.value, "score")} Punkte (Passive zählen nicht mit).`,
      }),
    ],
  };
};

export const produktCharts: Record<string, Builder> = { arpu, clv, churn, mrr, nps };
void D;
void formatDecimal;
