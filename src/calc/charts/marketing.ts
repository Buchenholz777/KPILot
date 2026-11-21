import type { Builder } from "./kit";
import type { ChartSpec } from "../chart-types";
import { bars, bridge, composition, eur, int, isPartOfWhole, none, num, outOf, pct, val } from "./kit";
import { D } from "../../lib/decimal";
import { formatValue } from "../../lib/number";

/** Anteil an einer Grundgesamtheit: Zusammensetzung, wenn der Teil ≤ Ganzes; sonst Mengenvergleich. */
const share = (a: { key: string; label: string; rest: string }, b: { key: string; label: string }, title: string, sentence: (p: string, w: string, q: string) => string): Builder => (i, r) => {
  if (r.status !== "ok") return none("Ohne Grundgesamtheit > 0 ist keine Quote definiert – es gibt keine Grafik.");
  const part = val(i, a.key)!,
    whole = val(i, b.key)!;
  if (isPartOfWhole(part, whole))
    return {
      charts: [
        composition({
          title,
          parts: [{ label: a.label, value: num(part), text: `${int(part)} (${pct(r.main.value)})` }, { label: a.rest, value: num(whole.sub(part)), text: int(whole.sub(part)) }],
          totalLabel: `${int(whole)} ${b.label}`,
          caption: sentence(int(part), int(whole), pct(r.main.value)),
        }),
      ],
    };
  return {
    charts: [
      bars({ title, panels: [{ title: "Anzahl", bars: [{ label: b.label, value: num(whole), text: int(whole) }, { label: a.label, value: num(part), text: int(part), emphasis: true }] }], caption: `${sentence(int(part), int(whole), pct(r.main.value))} Die Zahl der ${a.label} übersteigt die Grundgesamtheit – deshalb wird kein Anteil des Ganzen gezeichnet.` }),
    ],
  };
};

/** Kosten ÷ Menge: drei getrennte Achsen (Euro, Menge, Euro je Einheit). */
const costPer = (c: { costKey: string; costLabel: string; qtyKey: string; qtyLabel: string; resultLabel: string; resultUnit: string; title: string; sentence: (k: string, q: string, r: string) => string }): Builder => (i, r) => {
  const k = val(i, c.costKey)!,
    q = val(i, c.qtyKey)!;
  const res = r.status === "ok" ? r.main.value : undefined;
  return {
    charts: [
      bars({
        title: c.title,
        panels: [
          { title: `${c.costLabel} (€)`, bars: [{ label: c.costLabel, value: num(k), text: eur(k) }] },
          { title: c.qtyLabel, bars: [{ label: c.qtyLabel, value: num(q), text: int(q) }] },
          ...(res ? [{ title: `${c.resultLabel} (${c.resultUnit})`, bars: [{ label: c.resultLabel, value: num(res), text: formatValue(res, "money", c.resultUnit), emphasis: true }] }] : []),
        ],
        caption: res ? c.sentence(eur(k), int(q), formatValue(res, "money")) : `Bei ${int(q)} ${c.qtyLabel} ist ${c.resultLabel} nicht definiert.`,
      }),
    ],
  };
};

const roas: Builder = (i, r, variantId) => {
  const u = val(i, "umsatz")!,
    k = val(i, "kosten")!;
  if (variantId === "standard") {
    return {
      charts: [
        bars({
          title: "Werbekosten und zugeordneter Umsatz",
          panels: [{ title: "Euro", bars: [{ label: "Werbekosten", value: num(k), text: eur(k) }, { label: "Zugeordneter Umsatz", value: num(u), text: eur(u), emphasis: true }] }],
          caption: r.status === "ok" ? `${eur(u)} zugeordneter Umsatz auf ${eur(k)} Werbekosten ergeben einen ROAS von ${formatValue(r.main.value, "factor")}. Das ist Umsatz, kein Gewinn.` : "Bei 0 € Werbekosten ist der ROAS nicht definiert; die beiden Beträge sind trotzdem dargestellt.",
        }),
      ],
    };
  }
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  const db = outOf(r, "Deckungsbeitrag vor")!.value;
  const min = outOf(r, "Mindest-ROAS zur");
  const altDb = outOf(r, "Alternative Quote: Deckungsbeitrag vor");
  const altAfter = outOf(r, "Alternative Quote: Beitrag nach");
  const qNow = val(i, "quote")!,
    qAlt = val(i, "alt");
  const compare = altDb && altAfter && qAlt
    ? bars({
        title: "Aktuelle Quote und Alternative im Vergleich",
        panels: [
          {
            title: "Euro – gemeinsame Skala mit Nulllinie",
            bars: [
              { label: `DB vor Werbung ${pct(qNow)}`, value: num(db), text: eur(db) },
              { label: `DB vor Werbung ${pct(qAlt)}`, value: num(altDb.value), text: eur(altDb.value) },
              { label: "Werbekosten", value: num(k), text: eur(k) },
              { label: `Beitrag nach Werbung ${pct(qNow)}`, value: num(r.main.value), text: eur(r.main.value, true), emphasis: true },
              { label: `Beitrag nach Werbung ${pct(qAlt)}`, value: num(altAfter.value), text: eur(altAfter.value, true), emphasis: true },
            ],
          },
        ],
        caption: r.status === "ok" && r.comparison ? r.comparison.summary : "",
      })
    : undefined;
  return {
    charts: [
      bridge({
        title: "Vom zugeordneten Umsatz zum Beitrag nach Werbekosten",
        unit: "€",
        steps: [
          { label: "Zugeordneter Umsatz", value: num(u), text: eur(u), type: "total" },
          { label: "Variable Kosten", value: -num(u.sub(db)), text: eur(u.sub(db).neg()), type: "delta" },
          { label: "Deckungsbeitrag vor Werbung", value: num(db), text: eur(db, true), type: "subtotal" },
          { label: "Werbekosten", value: -num(k), text: eur(k.neg()), type: "delta" },
          { label: "Beitrag nach Werbung", value: num(r.main.value), text: eur(r.main.value, true), type: "total" },
        ],
        caption: `Vom Umsatz bleiben nach variablen Kosten ${eur(db)}; nach ${eur(k)} Werbekosten ${eur(r.main.value, true)}${min ? ` (Mindest-ROAS ${formatValue(min.value, "factor4")})` : ""}. Das ist ein Beitrag, kein Unternehmensgewinn: Weitere Fixkosten sind nicht gedeckt.`,
      }),
      ...(compare ? [compare] : []),
    ],
  };
};

const cac: Builder = (i, r) => {
  const m = val(i, "mkt")!,
    v = val(i, "vt")!,
    n = val(i, "kunden")!;
  const total = m.add(v);
  const charts: ChartSpec[] = [
    bridge({ title: "Marketing- und Vertriebskosten", unit: "€", steps: [{ label: "Marketingkosten", value: num(m), text: eur(m), type: "total" }, { label: "Vertriebskosten", value: num(v), text: eur(v), type: "delta" }, { label: "Kosten gesamt", value: num(total), text: eur(total), type: "total" }], caption: `${eur(m)} Marketing und ${eur(v)} Vertrieb ergeben ${eur(total)} Kosten.` }),
  ];
  const res = r.status === "ok" ? r.main.value : undefined;
  charts.push(
    bars({
      title: "Bezug auf gewonnene Neukunden",
      panels: [{ title: "Neukunden", bars: [{ label: "Neukunden", value: num(n), text: int(n) }] }, ...(res ? [{ title: "Kosten je Neukunde (€)", bars: [{ label: "CAC", value: num(res), text: eur(res), emphasis: true }] }] : [])],
      caption: res ? `${eur(total)} auf ${int(n)} Neukunden ergeben ${eur(res)} je Neukunde.` : "Ohne Neukunden ist der CAC nicht definiert.",
    }),
  );
  return { charts };
};

export const marketingCharts: Record<string, Builder> = {
  conversion: share({ key: "conv", label: "Conversions", rest: "ohne Conversion" }, { key: "total", label: "Besuche/Ereignisse" }, "Conversions an der Grundgesamtheit", (p, w, q) => `${p} Conversions bei ${w} Besuchen bzw. Ereignissen ergeben eine Conversion Rate von ${q}.`),
  ctr: share({ key: "klicks", label: "Klicks", rest: "ohne Klick" }, { key: "imp", label: "Impressionen" }, "Klicks an den Impressionen", (p, w, q) => `${p} Klicks bei ${w} Impressionen ergeben eine Klickrate von ${q}.`),
  cpc: costPer({ costKey: "kosten", costLabel: "Werbekosten", qtyKey: "klicks", qtyLabel: "Klicks", resultLabel: "CPC", resultUnit: "je Klick", title: "Werbekosten, Klicks und Kosten je Klick", sentence: (k, q, r) => `${k} Werbekosten auf ${q} Klicks ergeben ${r} je Klick. Euro und Klicks stehen auf getrennten Achsen.` }),
  cpm: costPer({ costKey: "kosten", costLabel: "Werbekosten", qtyKey: "imp", qtyLabel: "Impressionen", resultLabel: "CPM", resultUnit: "je 1.000 Impressionen", title: "Werbekosten, Impressionen und Kosten je 1.000 Impressionen", sentence: (k, q, r) => `${k} Werbekosten bei ${q} Impressionen entsprechen ${r} je 1.000 Impressionen (normierte Bezugsgröße, nicht die Kampagnengröße).` }),
  cpa: costPer({ costKey: "kosten", costLabel: "Werbekosten", qtyKey: "conv", qtyLabel: "Conversions", resultLabel: "CPA", resultUnit: "je Conversion", title: "Werbekosten, Conversions und Kosten je Conversion", sentence: (k, q, r) => `${k} Werbekosten bei ${q} Conversions ergeben ${r} je Conversion. Eine Conversion ist nicht automatisch ein Neukunde.` }),
  roas,
  cac,
};
void D;
