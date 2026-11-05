import type { Builder } from "./kit";
import { bars, bridge, compactEur, eur, int, niceMax, none, num, one, outOf, pct, periodOf, plain, val } from "./kit";
import type { LinesChart, LinePoint } from "../chart-types";
import { D, type Decimal } from "../../lib/decimal";
import { formatDecimal, formatValue } from "../../lib/number";

const stk = (v: Decimal) => `${formatValue(v, "number")} Stück`;

/** Break-even: Umsatz U(q)=p·q, Gesamtkosten K(q)=F+v·q, Ergebnis G(q)=U−K. Der Schnittpunkt kommt aus der Rechenfunktion. */
const breakEven: Builder = (i, r) => {
  const p = val(i, "p")!,
    v = val(i, "v")!,
    F = val(i, "F")!;
  const d = p.sub(v);
  const zr = periodOf(i);
  const pn = num(p),
    vn = num(v),
    Fn = num(F);
  const qTheoOut = outOf(r, "Theoretische Gewinnschwelle");
  const qTheo = r.status === "ok" ? (qTheoOut?.value ?? D(0)) : undefined;
  const has = r.status === "ok" && F.gt(0) && d.gt(0) && qTheo !== undefined;
  const Y = (q: number, which: "u" | "k") => (which === "u" ? pn * q : Fn + vn * q);
  let xMax: number;
  if (has) xMax = Math.max(10, niceMax(num(qTheo!) * 1.6));
  else xMax = 100;
  const rev: LinePoint[] = [{ x: 0, y: 0 }, { x: xMax, y: Y(xMax, "u") }];
  const cost: LinePoint[] = [{ x: 0, y: Fn }, { x: xMax, y: Y(xMax, "k") }];
  const chart: LinesChart = {
    kind: "lines",
    title: `Umsatz und Gesamtkosten nach Absatzmenge${zr ? ` (Zeitraum: ${zr})` : ""}`,
    caption: "",
    summary: "",
    table: { head: ["Menge", "Umsatz", "Gesamtkosten", "Ergebnis"], rows: [] },
    xLabel: "Absatzmenge (Stück)",
    yLabel: "Euro",
    xMax,
    xFormat: (x) => `${compactEur(x).replace(" €", "")}`,
    yFormat: compactEur,
    series: [
      { id: "u", label: "Umsatz", style: "dashed", tone: "accent", points: rev },
      { id: "k", label: "Gesamtkosten", style: "solid", tone: "ink", points: cost },
    ],
    regions: [],
    markers: [],
  };
  const rowFor = (q: Decimal) => {
    const U = p.mul(q),
      K = F.add(v.mul(q));
    return [stk(q), eur(U), eur(K), eur(U.sub(K), true)];
  };
  const tableQs: Decimal[] = [D(0)];
  if (has) {
    const q = qTheo!;
    const qMin = outOf(r, "Mindeststückzahl")!.value;
    const from = outOf(r, "Positiver Gewinn ab")!.value;
    const y = pn * num(q);
    chart.markers!.push({ x: num(q), y, kind: "intersection", label: `Schnittpunkt: ${stk(q)} · ${eur(p.mul(q))}` });
    chart.regions!.push(
      { points: [{ x: 0, y: 0 }, { x: 0, y: Fn }, { x: num(q), y }], label: "Verlust (Kosten > Umsatz)", pattern: "loss", labelAt: { x: num(q) * 0.3, y: Fn * 0.5 } },
      { points: [{ x: num(q), y }, { x: xMax, y: Y(xMax, "u") }, { x: xMax, y: Y(xMax, "k") }], label: "Gewinn (Umsatz > Kosten)", pattern: "gain", labelAt: { x: num(q) + (xMax - num(q)) * 0.6, y: (Y(xMax, "u") + Y(xMax, "k")) / 2 + (Y(xMax, "u") - Y(xMax, "k")) * 0.0 } },
    );
    tableQs.push(q, qMin, from);
    chart.caption = `Die Linien schneiden sich rechnerisch bei ${stk(q)} (${eur(p.mul(q))} Umsatz). Links davon liegen die Gesamtkosten über dem Umsatz (Verlust), rechts davon darüber der Umsatz (Gewinn). Verkauft werden nur ganze Stück: ${q.isInteger() ? `Bei ${stk(qMin)} sind die Kosten genau gedeckt, positiver Gewinn entsteht ab ${stk(from)}.` : `Die Mindestmenge zur Kostendeckung ist ${stk(qMin)} (Gewinn dort ${eur(p.mul(qMin).sub(F.add(v.mul(qMin))), true)}).`}`;
    chart.summary = `Schnittpunkt von Umsatz und Gesamtkosten bei ${stk(q)} und ${eur(p.mul(q))}. Mindestmenge zur Kostendeckung ${stk(qMin)}.`;
    // bedienbare Punktauswahl
    const xs = new Set<number>([0, num(q), num(qMin), xMax]);
    for (let k = 1; k <= 8; k++) xs.add(Math.round((xMax * k) / 9));
    chart.explore = {
      label: "Absatzmenge wählen",
      stops: [...xs].sort((a, b) => a - b).map((x) => {
        const row = rowFor(D(x));
        return { x, lines: [{ label: "Menge", text: row[0] }, { label: "Umsatz", text: row[1] }, { label: "Gesamtkosten", text: row[2] }, { label: "Ergebnis", text: row[3] }] };
      }),
    };
  } else if (F.isZero() && d.gt(0)) {
    chart.markers!.push({ x: 0, y: 0, kind: "intersection", label: "Ursprung: bei 0 Stück sind die Kosten gedeckt" });
    chart.regions!.push({ points: [{ x: 0, y: 0 }, { x: xMax, y: Y(xMax, "u") }, { x: xMax, y: Y(xMax, "k") }], label: "Gewinn (Umsatz > Kosten)", pattern: "gain", labelAt: { x: xMax * 0.7, y: (Y(xMax, "u") + Y(xMax, "k")) / 2 } });
    chart.caption = "Ohne Fixkosten starten beide Linien im Ursprung. Der Umsatz liegt ab der ersten verkauften Einheit über den Gesamtkosten – es gibt keine Mindestmenge zur Kostendeckung über 0 Stück. Die Mengenachse ist eine Beispielskala.";
    chart.summary = "Ohne Fixkosten liegt der Umsatz ab der ersten Einheit über den Gesamtkosten.";
    tableQs.push(D(xMax));
  } else {
    const same = F.isZero() && d.isZero();
    if (!same)
      chart.regions!.push({ points: [{ x: 0, y: 0 }, { x: 0, y: Fn }, { x: xMax, y: Y(xMax, "k") }, { x: xMax, y: Y(xMax, "u") }], label: "Verlust (Kosten > Umsatz)", pattern: "loss", labelAt: { x: xMax * 0.5, y: (Y(xMax / 2, "u") + Y(xMax / 2, "k")) / 2 } });
    chart.caption = same
      ? "Ohne Fixkosten und mit gleichem Preis und variablen Kosten liegen beide Linien aufeinander: Das Ergebnis ist bei jeder Menge 0 €, es gibt keinen einzelnen Schnittpunkt. Die Mengenachse ist eine Beispielskala."
      : `Die Umsatzlinie schneidet die Kostenlinie nicht bei positiver Menge: ${d.isZero() ? "Preis und variable Kosten sind gleich" : "der Preis liegt unter den variablen Kosten"}, deshalb werden die ${F.gt(0) ? "Fixkosten" : "Kosten"} durch mehr Absatz nie gedeckt. Die Mengenachse ist eine Beispielskala.`;
    chart.summary = chart.caption;
    chart.notice = "Kein erreichbarer Break-even in diesem Modell.";
    tableQs.push(D(xMax));
  }
  const seenQ = new Set<string>();
  chart.table.rows = tableQs.filter((q) => !seenQ.has(q.toString()) && !!seenQ.add(q.toString())).map(rowFor);
  return one(chart);
};

const dbBridge: Builder = (i, r) => {
  const p = val(i, "p")!,
    v = val(i, "v")!;
  const d = outOf(r, "Stückdeckungsbeitrag")?.value ?? p.sub(v);
  const q = val(i, "q");
  return {
    charts: [
      bridge({
        title: "Vom Preis zum Deckungsbeitrag je Stück",
        unit: "€ je Stück",
        steps: [
          { label: "Nettopreis", value: num(p), text: eur(p), type: "total" },
          { label: "Variable Kosten", value: -num(v), text: eur(v.neg()), type: "delta" },
          { label: "Deckungsbeitrag", value: num(d), text: eur(d, true), type: "total" },
        ],
        caption: `Vom Preis (${eur(p)}) gehen die variablen Kosten (${eur(v)}) ab; es bleiben ${eur(d, true)} je Stück${d.isNegative() ? " – der Preis deckt die variablen Kosten nicht" : " zur Deckung der Fixkosten (noch kein Gewinn)"}.${q ? ` Bei ${int(q)} Stück ergibt das ${eur(d.mul(q), true)} Gesamtdeckungsbeitrag.` : ""}`,
        notice: d.isNegative() ? "Negativer Deckungsbeitrag: Jedes Stück vergrößert den Verlust." : undefined,
      }),
    ],
  };
};

const gewinn: Builder = (i, r, variantId) => {
  const p = val(i, "p")!,
    v = val(i, "v")!,
    F = val(i, "F")!;
  const zr = periodOf(i);
  if (variantId === "menge") {
    if (r.status !== "ok") return none("Ohne vollständige Eingaben gibt es keine Grafik.");
    const U = outOf(r, "Umsatz")!.value,
      V = outOf(r, "Variable Gesamtkosten")!.value;
    const G = r.main.value;
    return {
      charts: [
        bridge({
          title: `Von den Erlösen zum Ergebnis${zr ? ` (Zeitraum: ${zr})` : ""}`,
          unit: "€",
          steps: [
            { label: "Umsatz", value: num(U), text: eur(U), type: "total" },
            { label: "Variable Kosten", value: -num(V), text: eur(V.neg()), type: "delta" },
            { label: "Fixkosten", value: -num(F), text: eur(F.neg()), type: "delta" },
            { label: G.isNegative() ? "Verlust" : "Gewinn", value: num(G), text: eur(G, true), type: "total" },
          ],
          caption: `${eur(U)} Umsatz abzüglich ${eur(V)} variabler Kosten und ${eur(F)} Fixkosten ergeben ${eur(G, true)}.`,
        }),
      ],
    };
  }
  // Zielgewinn: Ergebnis über der Menge, Ziel markiert
  const Z = val(i, "Z")!;
  const d = p.sub(v);
  if (r.status !== "ok" || d.lte(0)) return none("Der Stückdeckungsbeitrag ist null oder negativ: Das Ziel ist in diesem Modell nicht durch mehr Absatz erreichbar; die Erklärung steht im Ergebnis.");
  const qNeed = r.main.value;
  const xMax = Math.max(10, niceMax(num(qNeed) * 1.5));
  const G = (x: number) => num(d) * x - num(F);
  const chart: LinesChart = {
    kind: "lines",
    title: `Ergebnis nach Absatzmenge mit Zielgewinn${zr ? ` (Zeitraum: ${zr})` : ""}`,
    caption: `Das Ergebnis steigt mit jedem Stück um ${eur(d)}. Das Ziel von ${eur(Z)} wird bei ${int(qNeed)} Stück erreicht (genau: ${eur(outOf(r, "Ergebnis bei dieser")!.value, true)}).`,
    summary: `Ergebnis über der Menge; Zielgewinn ${eur(Z)} bei ${int(qNeed)} Stück erreicht.`,
    table: { head: ["Menge", "Ergebnis"], rows: [D(0), qNeed, D(xMax)].map((q) => [`${int(q)} Stück`, eur(d.mul(q).sub(F), true)]) },
    xLabel: "Absatzmenge (Stück)",
    yLabel: "Ergebnis in Euro",
    xMax,
    xFormat: (x) => compactEur(x).replace(" €", ""),
    yFormat: compactEur,
    series: [{ id: "g", label: "Ergebnis (Gewinn/Verlust)", style: "solid", tone: "accent", points: [{ x: 0, y: G(0) }, { x: xMax, y: G(xMax) }] }],
    hlines: [{ y: 0, label: "Kostendeckung" }, { y: num(Z), label: `Zielgewinn ${eur(Z)}` }],
    markers: [{ x: num(qNeed), y: num(d.mul(qNeed).sub(F)), kind: "target", label: `${int(qNeed)} Stück` }],
  };
  return one(chart);
};

const marge: Builder = (i, r) => {
  const k = val(i, "k")!,
    p = val(i, "p")!;
  const diff = p.sub(k);
  const m = outOf(r, "Marge");
  const a = outOf(r, "Aufschlag");
  const panels = [
    {
      title: "Euro",
      bars: [
        { label: "Kostenbasis", value: num(k), text: eur(k) },
        { label: "Verkaufspreis", value: num(p), text: eur(p) },
        { label: "Differenz", value: num(diff), text: eur(diff, true), emphasis: true },
      ],
    },
    {
      title: "Prozent – gleiche Differenz, anderer Nenner",
      bars: [
        ...(m ? [{ label: "Marge", sub: "Differenz / Verkaufspreis", value: num(m.value), text: pct(m.value, true), emphasis: true }] : []),
        ...(a ? [{ label: "Aufschlag", sub: "Differenz / Kostenbasis", value: num(a.value), text: pct(a.value, true), emphasis: true }] : []),
      ],
    },
  ].filter((x) => x.bars.length);
  return {
    charts: [
      bars({
        title: "Differenz, Marge und Aufschlag",
        panels,
        caption: `Dieselbe Differenz von ${eur(diff, true)} wird zweimal bezogen: auf den Verkaufspreis ergibt das${m ? ` ${pct(m.value)} Marge` : " keine definierte Marge"}, auf die Kostenbasis${a ? ` ${pct(a.value)} Aufschlag` : " keinen definierten Aufschlag (Kostenbasis 0 €)"}.`,
        notice: !a && m ? "Bei Kostenbasis 0 € und positivem Verkaufspreis beträgt die Marge 100 %; ein Aufschlag auf 0 € ist nicht definiert." : undefined,
      }),
    ],
  };
};

const zielpreis: Builder = (i, r) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const k = val(i, "k")!;
  const price = r.main.value;
  const profit = price.sub(k);
  return {
    charts: [
      bridge({
        title: "Von der Kostenbasis zum Verkaufspreis",
        unit: "€",
        steps: [
          { label: "Kostenbasis", value: num(k), text: eur(k), type: "total" },
          { label: "Rohertrag", value: num(profit), text: eur(profit, true), type: "delta" },
          { label: "Verkaufspreis", value: num(price), text: eur(price), type: "total" },
        ],
        caption: `Zur Kostenbasis ${eur(k)} kommt ein Rohertrag von ${eur(profit, true)}. Die Zielmarge bezieht sich auf den Verkaufspreis: ${pct(outOf(r, "Tatsächliche Marge")!.value)} von ${eur(price)} bleiben als Rohertrag.`,
      }),
    ],
  };
};

const stueckkosten: Builder = (i, r) => {
  const F = val(i, "F")!;
  const total = outOf(r, "Gesamtkosten");
  const unit = outOf(r, "Stückkosten");
  const fa = outOf(r, "Fixkostenanteil");
  const va = outOf(r, "Variabler Anteil");
  const v = val(i, "v")!,
    q = val(i, "q")!;
  const panels = [
    {
      title: "Euro gesamt",
      bars: [
        { label: "Fixkosten", value: num(F), text: eur(F) },
        { label: "Variable Kosten", value: num(v.mul(q)), text: eur(v.mul(q)) },
        ...(total ? [{ label: "Gesamtkosten", value: num(total.value), text: eur(total.value), emphasis: true }] : []),
      ],
    },
  ];
  if (unit && fa && va)
    panels.push({
      title: "Euro je Stück",
      bars: [
        { label: "Fixkostenanteil", value: num(fa.value), text: eur(fa.value) },
        { label: "Variabler Anteil", value: num(va.value), text: eur(va.value) },
        { label: "Stückkosten", value: num(unit.value), text: eur(unit.value), emphasis: true },
      ],
    });
  return {
    charts: [
      bars({
        title: "Gesamtkosten und Stückkosten",
        panels,
        caption: unit ? `Fixkosten (${eur(F)}) und variable Kosten (${eur(v.mul(q))}) ergeben ${eur(total!.value)}; verteilt auf ${int(q)} Stück sind das ${eur(unit.value)} je Stück. Gesamtbeträge und Stückkosten haben getrennte Achsen.` : `Bei 0 Stück sind nur die Fixkosten (${eur(F)}) bekannt; Stückkosten sind nicht definiert.`,
      }),
    ],
  };
};

const zuschlag: Builder = (i, r, variantId) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  if (variantId === "satz") {
    const gk = val(i, "gk")!,
      basis = val(i, "basis")!;
    const lei = val(i, "leistung");
    const z = r.main.value;
    const zl = outOf(r, "Zuschlag für diese Leistung");
    return {
      charts: [
        bars({
          title: "Gemeinkosten im Verhältnis zur Zuschlagsbasis",
          panels: [
            { title: "Euro", bars: [{ label: "Gemeinkosten", value: num(gk), text: eur(gk) }, { label: "Zuschlagsbasis", value: num(basis), text: eur(basis) }] },
            ...(lei && zl ? [{ title: "Für diese Leistung", bars: [{ label: "Basis der Leistung", value: num(lei), text: eur(lei) }, { label: "Zuschlag", value: num(zl.value), text: eur(zl.value), emphasis: true }] }] : []),
          ],
          caption: `${eur(gk)} Gemeinkosten bezogen auf ${eur(basis)} Basis ergeben einen Zuschlagssatz von ${pct(z)}.`,
        }),
      ],
    };
  }
  const g = (l: string) => outOf(r, l)!.value;
  const sekv = val(i, "sekv") ?? D(0);
  const steps = [
    { label: "Materialkosten", value: num(g("Materialkosten")), text: eur(g("Materialkosten")), type: "delta" as const },
    { label: "Fertigungskosten", value: num(g("Fertigungskosten")), text: eur(g("Fertigungskosten")), type: "delta" as const },
    { label: "Herstellkosten", value: num(g("Herstellkosten")), text: eur(g("Herstellkosten")), type: "subtotal" as const },
    { label: "Verwaltungsgemeinkosten", value: num(g("Verwaltungsgemeinkosten")), text: eur(g("Verwaltungsgemeinkosten")), type: "delta" as const },
    { label: "Vertriebsgemeinkosten", value: num(g("Vertriebsgemeinkosten")), text: eur(g("Vertriebsgemeinkosten")), type: "delta" as const },
    ...(sekv.gt(0) ? [{ label: "Sondereinzelkosten Vertrieb", value: num(sekv), text: eur(sekv), type: "delta" as const }] : []),
    { label: "Selbstkosten", value: num(r.main.value), text: eur(r.main.value), type: "total" as const },
  ];
  return {
    charts: [
      bridge({
        title: "Kostenbrücke der Zuschlagskalkulation",
        unit: "€",
        steps,
        caption: `Material- und Fertigungskosten ergeben ${eur(g("Herstellkosten"))} Herstellkosten; darauf kommen Verwaltungs- und Vertriebsgemeinkosten. Zwischensummen werden nicht doppelt addiert. Selbstkosten: ${eur(r.main.value)} – ohne Gewinn.`,
      }),
    ],
  };
};

const stundensatz: Builder = (i, r) => {
  const k = val(i, "kosten")!,
    h = val(i, "stunden")!;
  const s = r.status === "ok" ? r.main.value : undefined;
  return {
    charts: [
      bars({
        title: "Kosten, abrechenbare Stunden und Kosten je Stunde",
        panels: [
          { title: "Kosten der Periode (€)", bars: [{ label: "Kosten", value: num(k), text: eur(k) }] },
          { title: "Abrechenbare Stunden", bars: [{ label: "Stunden", value: num(h), text: `${formatValue(h, "number")} h` }] },
          ...(s ? [{ title: "Kosten je Stunde (€/h)", bars: [{ label: "Stundensatz", value: num(s), text: `${eur(s)} je Stunde`, emphasis: true }] }] : []),
        ],
        caption: s ? `${eur(k)} Kosten verteilt auf ${formatValue(h, "number")} abrechenbare Stunden ergeben ${eur(s)} je Stunde. Euro und Stunden stehen auf getrennten Achsen.` : "Ohne abrechenbare Stunden ist kein Stundensatz definiert.",
      }),
    ],
  };
};

const rabattAbsatz: Builder = (i, r) => {
  const d0 = outOf(r, "Stückdeckungsbeitrag vorher");
  const d1 = outOf(r, "Stückdeckungsbeitrag nachher");
  if (!d0 || !d1) return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const panels = [
    { title: "Beitrag je Einheit (€)", bars: [{ label: "vorher", value: num(d0.value), text: eur(d0.value, true) }, { label: "nach Rabatt", value: num(d1.value), text: eur(d1.value, true), emphasis: true }] },
  ];
  if (r.status !== "ok")
    return { charts: [bars({ title: "Rabatt: Beitrag je Einheit", panels, caption: `Der Beitrag je Einheit ${d1.value.lte(0) ? `fällt auf ${eur(d1.value, true)}` : "ist schon vor dem Rabatt nicht positiv"}. Es gibt keine Absatzmenge, die den bisherigen Gesamtdeckungsbeitrag wieder erreicht – deshalb zeigt die Grafik keine Ausgleichsmenge.`, notice: "Keine erreichbare Ausgleichsmenge." })] };
  const factor = outOf(r, "Absatzfaktor")!.value;
  const qNew = outOf(r, "Erforderliche neue Menge");
  const q0 = val(i, "q0");
  const hasQ = q0 && !q0.isZero() && qNew;
  const base = hasQ ? q0! : D(100);
  const req = hasQ ? qNew!.value : base.mul(factor);
  panels.push({
    title: hasQ ? "Absatz (Einheiten)" : "Absatz (relativ, bisher = 100)",
    bars: [
      { label: "bisher", value: num(base), text: formatValue(base, "number") },
      { label: "erforderlich", value: num(req), text: hasQ ? `${int(req)} (mind.)` : `${formatValue(factor, "number")}-fach`, emphasis: true },
    ],
  });
  return {
    charts: [
      bars({
        title: "Rabatt: Beitrag je Einheit und erforderlicher Absatz",
        panels,
        caption: `Der Beitrag sinkt von ${eur(d0.value)} auf ${eur(d1.value)}. Für denselben Gesamtdeckungsbeitrag muss der Absatz das ${formatValue(factor, "number")}-Fache erreichen (${pct(r.main.value)} mehr). Ob diese Nachfrage erreichbar ist, zeigt die Grafik nicht.`,
      }),
    ],
  };
};

export { niceMax };
export const kostenCharts: Record<string, Builder> = {
  deckungsbeitrag: dbBridge,
  "break-even": breakEven,
  gewinn,
  marge,
  zielpreis,
  stueckkosten,
  zuschlag,
  stundensatz,
  "rabatt-absatz": rabattAbsatz,
};
void formatDecimal;
