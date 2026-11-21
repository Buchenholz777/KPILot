import type { Builder } from "./kit";
import { niceMax, bars, bridge, composition, eur, int, isPartOfWhole, meter, none, num, outOf, pct, val, one } from "./kit";
import type { LinesChart } from "../chart-types";
import { D } from "../../lib/decimal";
import { formatDecimal, formatValue } from "../../lib/number";

const PER: Record<string, string> = { jahr: "Jahre", quartal: "Quartale", monat: "Monate" };
const PER1: Record<string, string> = { jahr: "Jahr", quartal: "Quartal", monat: "Monat" };

const ebit: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const u = val(i, "umsatz")!,
    so = val(i, "sonstige")!,
    au = val(i, "aufwand")!,
    af = val(i, "afa")!;
  const steps = [
    { label: "Umsatzerlöse", value: num(u), text: eur(u), type: "total" as const },
    ...(so.isZero() ? [] : [{ label: "Sonstige Erträge", value: num(so), text: eur(so, true), type: "delta" as const }]),
    { label: "Betriebs-aufwand", value: -num(au), text: eur(au.neg()), type: "delta" as const },
    { label: "Abschreibungen", value: -num(af), text: eur(af.neg()), type: "delta" as const },
    { label: "EBIT", value: num(r.main.value), text: eur(r.main.value, true), type: "total" as const },
  ].map((s) => ({ ...s, label: s.label.replace("-", "") }));
  return { charts: [bridge({ title: "Von den Erlösen zum EBIT", unit: "€", steps, caption: `Aus ${eur(u)} Umsatzerlösen ergibt sich nach Aufwand und Abschreibungen ein EBIT von ${eur(r.main.value, true)} – vor Zinsen und Steuern.` })] };
};

const ebitda: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const e = val(i, "ebit")!,
    a = val(i, "afa")!;
  return {
    charts: [
      bridge({
        title: "Von EBIT zu EBITDA",
        unit: "€",
        steps: [
          { label: "EBIT", value: num(e), text: eur(e, true), type: "total" },
          { label: "Abschreibungen", value: num(a), text: eur(a, true), type: "delta" },
          { label: "EBITDA", value: num(r.main.value), text: eur(r.main.value, true), type: "total" },
        ],
        caption: `Zum EBIT (${eur(e, true)}) werden die Abschreibungen (${eur(a)}) addiert: EBITDA ${eur(r.main.value, true)}.`,
      }),
    ],
  };
};

const ratioEur = (a: { label: string; key: string }, b: { label: string; key: string }, rLabel: string, title: string, caption: (x: string, y: string, m: string) => string): Builder => (i, r) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben (oder bei Umsatz 0 €) ist keine Quote definiert – es gibt keine Grafik.");
  const x = val(i, a.key)!,
    y = val(i, b.key)!;
  return {
    charts: [
      bars({
        title,
        panels: [
          { title: "Euro", bars: [{ label: a.label, value: num(x), text: eur(x, true) }, { label: b.label, value: num(y), text: eur(y) }] },
          { title: `${rLabel} (%)`, bars: [{ label: rLabel, sub: `${a.label} / ${b.label}`, value: num(r.main.value), text: pct(r.main.value, true), emphasis: true }] },
        ],
        caption: caption(eur(x, true), eur(y), pct(r.main.value, true)),
      }),
    ],
  };
};

const cashflow: Builder = (i, r, variantId) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const mk = (label: string, key: string, sign: 1 | -1) => {
    const x = val(i, key);
    return x && !x.isZero() ? [{ label, value: sign * num(x), text: eur(sign === 1 ? x : x.neg(), true), type: "delta" as const }] : [];
  };
  const steps = [
    ...mk("Einzahlungen operativ", "ein", 1),
    ...mk("Auszahlungen operativ", "aus", -1),
    ...(variantId === "erweitert" ? [...mk("Einzahlungen Investition", "invEin", 1), ...mk("Auszahlungen Investition", "invAus", -1), ...mk("Einzahlungen Finanzierung", "finEin", 1), ...mk("Auszahlungen Finanzierung", "finAus", -1)] : []),
    { label: "Netto-Cashflow", value: num(r.main.value), text: eur(r.main.value, true), type: "total" as const },
  ];
  return {
    charts: [
      bridge({
        title: "Ein- und Auszahlungen bis zum Netto-Cashflow",
        unit: "€",
        steps,
        caption: `Die erfassten Zahlungen ergeben einen Netto-Cashflow von ${eur(r.main.value, true)} im Zeitraum. Der Kontostand bleibt offen, weil kein Anfangsbestand eingegeben ist.`,
      }),
    ],
  };
};

const workingCapital: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const uv = val(i, "uv")!,
    vb = val(i, "vb")!;
  return {
    charts: [
      bars({
        title: "Umlaufvermögen und kurzfristige Verbindlichkeiten",
        panels: [{ title: "Euro", bars: [{ label: "Umlaufvermögen", value: num(uv), text: eur(uv) }, { label: "Kurzfristige Verbindlichkeiten", value: num(vb), text: eur(vb) }, { label: "Working Capital", value: num(r.main.value), text: eur(r.main.value, true), emphasis: true }] }],
        caption: `${eur(uv)} Umlaufvermögen abzüglich ${eur(vb)} kurzfristiger Verbindlichkeiten ergeben ${eur(r.main.value, true)} Working Capital.`,
      }),
    ],
  };
};

const liquiditaet: Builder = (_i, r) => {
  if (r.status !== "ok") return none("Ohne kurzfristige Verbindlichkeiten > 0 € sind die Deckungsgrade nicht definiert – es gibt keine Grafik.");
  const rows = ["Liquidität 1. Grades", "Liquidität 2. Grades", "Liquidität 3. Grades"].map((l) => {
    const o = outOf(r, l)!;
    return { label: l, value: num(o.value), text: pct(o.value), ref: { value: 100, label: "100 % = Verbindlichkeiten genau gedeckt" } };
  });
  const max = Math.max(100, ...rows.map((x) => x.value));
  return {
    charts: [
      meter({
        title: "Drei Deckungsgrade der kurzfristigen Verbindlichkeiten",
        rows,
        max: niceMax(max * 1.1),
        axisFormat: (v) => `${formatDecimal(D(v), { max: 0 })} %`,
        caption: "Jeder Balken zeigt für sich, wie viel Prozent der kurzfristigen Verbindlichkeiten durch die jeweils einbezogenen Mittel gedeckt sind (die Grade überlappen sich und werden nicht addiert). Die 100-%-Linie ist die rechnerische Deckung, keine allgemeine Gesundheitsschwelle.",
      }),
    ],
  };
};

const eigenkapital: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne Gesamtkapital > 0 € ist keine Quote definiert – es gibt keine Grafik.");
  const ek = val(i, "ek")!,
    gk = val(i, "gk")!;
  const fk = outOf(r, "Fremdkapital")?.value ?? gk.sub(ek);
  if (isPartOfWhole(ek, gk))
    return {
      charts: [
        composition({ title: "Zusammensetzung des Gesamtkapitals", parts: [{ label: "Eigenkapital", value: num(ek), text: `${eur(ek)} (${pct(r.main.value)})` }, { label: "Fremdkapital (Rest)", value: num(fk), text: eur(fk) }], totalLabel: eur(gk), caption: `Vom Gesamtkapital (${eur(gk)}) sind ${eur(ek)} Eigenkapital – das ist eine Eigenkapitalquote von ${pct(r.main.value)}.` }),
      ],
    };
  return {
    charts: [
      bars({ title: "Eigenkapital, Fremdkapital und Gesamtkapital", panels: [{ title: "Euro", bars: [{ label: "Eigenkapital", value: num(ek), text: eur(ek, true) }, { label: "Fremdkapital (Rest)", value: num(fk), text: eur(fk, true) }, { label: "Gesamtkapital", value: num(gk), text: eur(gk) }] }], caption: `Eigenkapital (${eur(ek, true)}) und Gesamtkapital (${eur(gk)}) ergeben ${pct(r.main.value, true)} Eigenkapitalquote. Bei negativem Eigenkapital oder Eigenkapital über dem Gesamtkapital wird keine Anteilsdarstellung gezeigt.`, notice: "Keine Anteilsdarstellung: Werte bilden kein gemeinsames Ganzes." }),
    ],
  };
};

const roi: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne eingesetztes Kapital > 0 € ist keine Rendite definiert – es gibt keine Grafik.");
  const g = val(i, "gewinn")!,
    k = val(i, "kapital")!;
  return {
    charts: [
      bars({
        title: "Gewinn im Verhältnis zum eingesetzten Kapital",
        panels: [
          { title: "Euro", bars: [{ label: "Zurechenbarer Gewinn", value: num(g), text: eur(g, true) }, { label: "Eingesetztes Kapital", value: num(k), text: eur(k) }] },
          { title: "Rendite (%)", bars: [{ label: "ROI", sub: "Gewinn / Kapital", value: num(r.main.value), text: pct(r.main.value, true), emphasis: true }] },
        ],
        caption: `${eur(g, true)} Gewinn auf ${eur(k)} eingesetztes Kapital ergeben ${pct(r.main.value, true)} im betrachteten Zeitraum. Gewinn und Kapital ergänzen sich nicht zu einem Ganzen.`,
      }),
    ],
  };
};

const amortisation: Builder = (i, r) => {
  const inv = val(i, "inv")!,
    cf = val(i, "cf")!;
  const pk = i.choices.periode ?? "jahr";
  const unitPl = PER[pk] ?? "Perioden",
    unit1 = PER1[pk] ?? "Periode";
  const reached = r.status === "ok";
  const t = reached ? r.main.value : undefined;
  const xMax = reached ? Math.max(2, Math.ceil(num(t!) * 1.4)) : 5;
  const cum = (x: number) => num(cf) * x;
  const chart: LinesChart = {
    kind: "lines",
    title: "Investition und kumulierte Rückflüsse (Modell)",
    caption: "",
    summary: "",
    table: { head: [unit1, "Kumulierter Rückfluss", "Investition"], rows: [] },
    xLabel: `Zeit (${unitPl})`,
    yLabel: "Euro",
    xMax,
    xFormat: (x) => formatDecimal(D(x), { max: 1 }),
    yFormat: (y) => (Math.abs(y) >= 1e6 ? `${formatDecimal(D(y / 1e6), { max: 2 })} Mio.` : formatDecimal(D(y), { max: 0 })),
    series: [
      { id: "i", label: "Investition", style: "solid", tone: "ink", points: [{ x: 0, y: num(inv) }, { x: xMax, y: num(inv) }] },
      { id: "c", label: "Kumulierte Rückflüsse (gleichbleibend angenommen)", style: "dashed", tone: "accent", points: [{ x: 0, y: 0 }, { x: xMax, y: cum(xMax) }] },
    ],
    markers: [],
    notice: "Modellannahme: Der Rückfluss je Periode bleibt gleich; keine Zinsen, Steuern oder Risiken.",
  };
  const row = (x: number) => [formatDecimal(D(x), { max: 2 }), eur(cf.mul(x)), eur(inv)];
  if (reached) {
    chart.markers!.push({ x: num(t!), y: num(inv), kind: "intersection", label: `Rückfluss nach ${formatValue(t!, "number")} ${unitPl}` });
    chart.caption = `Die gestrichelte Linie zeigt die kumulierten Rückflüsse von ${eur(cf)} je ${unit1}; sie erreicht die Investition (${eur(inv)}) nach ${formatValue(t!, "number")} ${unitPl}. Das ist eine Modellrechnung mit gleichbleibenden Rückflüssen.`;
    chart.table.rows = [row(0), row(num(t!)), row(xMax)];
  } else {
    chart.caption = `Mit ${eur(cf)} Rückfluss je ${unit1} erreichen die kumulierten Rückflüsse die Investition (${eur(inv)}) nicht – es gibt keinen Rückflusszeitpunkt. Dargestellt sind beispielhaft ${xMax} ${unitPl}.`;
    chart.notice = "Kein Schnittpunkt: Die Rückflüsse reichen in diesem Modell nicht aus.";
    chart.table.rows = [row(0), row(xMax)];
  }
  chart.summary = chart.caption;
  return one(chart);
};

export const finanzenCharts: Record<string, Builder> = {
  ebit,
  ebitda,
  "ebit-marge": ratioEur({ label: "EBIT", key: "ebit" }, { label: "Umsatz", key: "umsatz" }, "EBIT-Marge", "EBIT im Verhältnis zum Umsatz", (a, b, m) => `${a} EBIT bezogen auf ${b} Umsatz ergeben eine EBIT-Marge von ${m}. Das Vorzeichen bleibt sichtbar.`),
  umsatzrendite: ratioEur({ label: "Ergebnis", key: "ergebnis" }, { label: "Umsatz", key: "umsatz" }, "Umsatzrendite", "Ergebnis im Verhältnis zum Umsatz", (a, b, m) => `${a} Ergebnis bezogen auf ${b} Umsatz ergeben eine Umsatzrendite von ${m}.`),
  cashflow,
  "working-capital": workingCapital,
  liquiditaet,
  eigenkapital,
  roi,
  amortisation,
};
void int;
