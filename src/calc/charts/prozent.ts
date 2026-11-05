import type { Builder } from "./kit";
import { niceMax, bars, meter, none, num, one, outOf, pct, plain, val } from "./kit";
import type { LinesChart } from "../chart-types";
import { D } from "../../lib/decimal";
import { formatDecimal, formatValue } from "../../lib/number";

const eurT = (d: ReturnType<typeof D>, s = false) => formatValue(d, "money", undefined, s);

const prozent: Builder = (i, r, variantId) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben (oder bei Grundwert 0) ist der Anteil nicht definiert – es gibt keine Grafik.");
  let G: ReturnType<typeof D>, W: ReturnType<typeof D>, p: ReturnType<typeof D>;
  if (variantId === "prozentwert") { G = val(i, "g")!; p = val(i, "p")!; W = r.main.value; }
  else if (variantId === "prozentsatz") { W = val(i, "w")!; G = val(i, "g")!; p = r.main.value; }
  else { W = val(i, "w")!; p = val(i, "p")!; G = r.main.value; }
  const inRange = p.gte(0) && p.lte(100) && G.gt(0);
  if (inRange)
    return {
      charts: [
        meter({
          title: "Anteil am Grundwert",
          rows: [
            { label: "Grundwert (100 %)", value: 100, text: plain(G) },
            { label: `Prozentwert (${pct(p)})`, value: num(p), text: plain(W) },
          ],
          max: 100,
          axisFormat: (v) => `${formatDecimal(D(v), { max: 0 })} %`,
          caption: `${pct(p)} von ${plain(G)} sind ${plain(W)}. Der obere Balken ist der ganze Grundwert (100 %), der untere der Anteil.`,
        }),
      ],
    };
  return {
    charts: [
      bars({
        title: "Grundwert und Prozentwert im Vergleich",
        panels: [{ title: "Werte (gleiche Einheit)", bars: [{ label: "Grundwert", value: num(G), text: plain(G, true) }, { label: `Prozentwert (${pct(p, true)})`, value: num(W), text: plain(W, true), emphasis: true }] }],
        caption: `${pct(p, true)} von ${plain(G, true)} sind ${plain(W, true)}. Der Satz liegt außerhalb von 0–100 % bzw. der Grundwert ist nicht positiv – deshalb keine Anteilsdarstellung.`,
      }),
    ],
  };
};

const veraenderung: Builder = (i, r) => {
  const a = val(i, "alt")!,
    n = val(i, "neu")!;
  const abs = outOf(r, "Absolute Veränderung")?.value ?? n.sub(a);
  const rel = outOf(r, "Relative Veränderung");
  return {
    charts: [
      bars({
        title: "Ausgangswert, Endwert und Veränderung",
        panels: [{ title: "Werte (gleiche Einheit)", bars: [{ label: "Ausgangswert", value: num(a), text: plain(a, true) }, { label: "Neuer Wert", value: num(n), text: plain(n, true) }, { label: "Veränderung absolut", value: num(abs), text: plain(abs, true), emphasis: true }] }],
        caption: rel ? `Von ${plain(a, true)} auf ${plain(n, true)}: ${plain(abs, true)} absolut, ${pct(rel.value, true)} relativ (bezogen auf den Ausgangswert).` : `Von ${plain(a, true)} auf ${plain(n, true)}: ${plain(abs, true)} absolut. Eine relative Veränderung ist bei Ausgangswert 0 nicht definiert.`,
        notice: !rel ? "Relative Veränderung nicht definiert (Ausgangswert 0)." : a.isNegative() ? "Bei negativem Ausgangswert ist die relative Veränderung nur eingeschränkt aussagekräftig." : undefined,
      }),
    ],
  };
};

const rabatt: Builder = (i, r, variantId) => {
  if (r.status !== "ok") return none("Ohne gültige Eingaben gibt es keine Grafik.");
  if (variantId === "zwei-aenderungen") {
    const f = outOf(r, "Gesamtfaktor")!.value;
    const end = D(100).mul(f);
    return {
      charts: [
        bars({
          title: "Preisindex nach zwei Änderungen",
          panels: [{ title: "Index (Ausgangspreis = 100)", bars: [{ label: "Ausgangspreis", value: 100, text: "100" }, { label: "Nach beiden Änderungen", value: num(end), text: formatValue(end, "number"), emphasis: true }] }],
          caption: `Beide Änderungen nacheinander ergeben den Faktor ${formatValue(f, "number")} – ${pct(r.main.value, true)} insgesamt, nicht die Summe der Sätze.${val(i, "preis") ? ` Endpreis: ${eurT(outOf(r, "Endpreis")!.value)}.` : ""}`,
        }),
      ],
    };
  }
  let orig: ReturnType<typeof D>, fin: ReturnType<typeof D>;
  if (variantId === "rabatt" || variantId === "erhoehung") { orig = val(i, "preis")!; fin = r.main.value; }
  else { fin = val(i, "endpreis")!; orig = r.main.value; }
  const diff = fin.sub(orig);
  const rab = variantId === "rabatt" || variantId === "ursprung-rabatt";
  return {
    charts: [
      bars({
        title: rab ? "Preis vor und nach Rabatt" : "Preis vor und nach Erhöhung",
        panels: [{ title: "Euro", bars: [{ label: "Ursprünglicher Preis", value: num(orig), text: eurT(orig) }, { label: rab ? "Preis nach Rabatt" : "Preis nach Erhöhung", value: num(fin), text: eurT(fin), emphasis: true }, { label: rab ? "Ersparnis" : "Aufschlag", value: num(diff.abs()), text: eurT(diff.abs()) }] }],
        caption: `${eurT(orig)} ${rab ? "abzüglich" : "zuzüglich"} ${eurT(diff.abs())} ergeben ${eurT(fin)}.`,
      }),
    ],
  };
};

const prozentpunkte: Builder = (i, r) => {
  const a = val(i, "alt")!,
    n = val(i, "neu")!;
  const pp = r.status === "ok" ? r.main.value : n.sub(a);
  const rel = outOf(r, "Relative Veränderung");
  return {
    charts: [
      bars({
        title: "Zwei Prozentwerte im Vergleich",
        panels: [{ title: "Prozent", bars: [{ label: "Alt", value: num(a), text: pct(a, true) }, { label: "Neu", value: num(n), text: pct(n, true), emphasis: true }] }],
        caption: `Die Differenz beträgt ${formatValue(pp, "pp", undefined, true)}${rel ? `; relativ zum alten Wert sind das ${pct(rel.value, true)}` : "; eine relative Veränderung ist bei altem Wert 0 nicht definiert"}. Prozentpunkte und relative Veränderung sind verschiedene Aussagen.`,
      }),
    ],
  };
};

const dreisatz: Builder = (i, r, variantId) => {
  if (r.status !== "ok") return none("Bei Ausgangsmenge 0 ist keine Beziehung bestimmbar – es gibt keine Grafik.");
  const a = val(i, "a")!,
    b = val(i, "b")!,
    c = val(i, "c")!;
  const x = r.main.value;
  const direct = variantId === "direkt";
  const xMax = niceMax(Math.max(num(a), num(c)) * 1.3);
  const pts = direct
    ? [{ x: 0, y: 0 }, { x: xMax, y: (num(b) / num(a)) * xMax }]
    : Array.from({ length: 25 }, (_, k) => {
        const xx = (xMax * (k + 1)) / 25;
        return { x: xx, y: (num(a) * num(b)) / xx };
      });
  const chart: LinesChart = {
    kind: "lines",
    title: direct ? "Proportionale Beziehung (je mehr, desto mehr)" : "Antiproportionale Beziehung (je mehr, desto weniger)",
    caption: direct ? `Pro Einheit gilt ${plain(b.div(a))}; deshalb liegen alle Wertepaare auf einer Geraden durch den Ursprung. Bei Menge ${plain(c)} ergibt sich ${plain(x)}.` : `Das Produkt aus Menge und Wert bleibt ${plain(a.mul(b))}; die Wertepaare liegen auf einer fallenden Kurve. Bei Menge ${plain(c)} ergibt sich ${plain(x)}.`,
    summary: `${direct ? "Proportional" : "Antiproportional"}: gegebenes Paar (${plain(a)} | ${plain(b)}), gesuchtes Paar (${plain(c)} | ${plain(x)}).`,
    table: { head: ["Paar", "Menge", "Wert"], rows: [["gegeben", plain(a), plain(b)], ["gesucht", plain(c), plain(x)]] },
    xLabel: "Menge (Einheit je nach Aufgabe)",
    yLabel: "Wert (andere Einheit)",
    xMax,
    xFormat: (v) => formatDecimal(D(v), { max: 2 }),
    yFormat: (v) => formatDecimal(D(v), { max: 2 }),
    series: [{ id: "l", label: direct ? "Proportionale Gerade" : "Antiproportionale Kurve", style: "dashed", tone: "accent", points: pts }],
    markers: [
      { x: num(a), y: num(b), kind: "point", pos: direct ? undefined : "tr", label: `gegeben: ${plain(a)} | ${plain(b)}` },
      { x: num(c), y: num(x), kind: "target", pos: direct ? undefined : "bl", label: `gesucht: ${plain(c)} | ${plain(x)}` },
    ],
    notice: "Menge und Wert haben verschiedene Einheiten und stehen deshalb auf getrennten Achsen.",
  };
  return one(chart);
};

const durchschnitt: Builder = (i, r) => {
  if (r.status !== "ok") return none("Bei Gewichtssumme 0 ist kein gewichteter Durchschnitt definiert – es gibt keine Grafik.");
  const rows = i.rows.zeilen ?? [];
  if (!rows.length) return none("Ohne vollständige Zeilen gibt es keine Grafik.");
  const mean = r.main.value;
  return {
    charts: [
      bars({
        title: "Einzelwerte, Gewichte und gewichtetes Mittel",
        panels: [
          { title: "Werte", bars: rows.map((x, k) => ({ label: `Zeile ${k + 1}`, sub: `Gewicht ${plain(x[1])}`, value: num(x[0]), text: plain(x[0], true) })), ref: { value: num(mean), label: `Gewichtetes Mittel ${plain(mean)}` } },
          { title: "Gewichte", bars: rows.map((x, k) => ({ label: `Zeile ${k + 1}`, value: num(x[1]), text: plain(x[1]) })) },
        ],
        caption: `Jede Zeile zählt mit ihrem Gewicht. Das gewichtete Mittel ${plain(mean)} (gestrichelte Linie) liegt näher an den Werten mit größerem Gewicht.`,
      }),
    ],
  };
};

const cagr: Builder = (i, r) => {
  if (r.status !== "ok") return none("Bei Anfangswert ≤ 0 oder Laufzeit 0 ist kein durchschnittliches Wachstum definiert – es gibt keine Grafik.");
  const a = val(i, "a")!,
    e = val(i, "e")!,
    n = val(i, "n")!;
  const steps = Math.min(24, Math.max(2, Math.ceil(num(n))));
  const pts = Array.from({ length: steps + 1 }, (_, k) => {
    const t = (num(n) * k) / steps;
    return { x: t, y: num(a) * Math.pow(num(e) / num(a), t / num(n)) };
  });
  const chart: LinesChart = {
    kind: "lines",
    title: "Modellpfad bei gleichmäßigem Wachstum",
    caption: `Von ${plain(a)} auf ${plain(e)} in ${plain(n)} Jahren ergibt ${pct(r.main.value, true)} pro Jahr. Die Linie ist ein Modellpfad bei gleichmäßigem Wachstum – keine tatsächlichen Zwischenwerte.`,
    summary: `Modellpfad von ${plain(a)} auf ${plain(e)} in ${plain(n)} Jahren.`,
    table: { head: ["Zeitpunkt (Jahre)", "Modellwert"], rows: [[ "0", plain(a)], [plain(n), plain(e)]] },
    xLabel: "Zeit (Jahre)",
    yLabel: "Wert",
    xMax: num(n),
    xFormat: (v) => formatDecimal(D(v), { max: 1 }),
    yFormat: (v) => formatDecimal(D(v), { max: 2 }),
    series: [{ id: "m", label: "Modellpfad (gleichmäßiges Wachstum)", style: "dashed", tone: "accent", points: pts }],
    markers: [{ x: 0, y: num(a), kind: "point", label: `Anfang ${plain(a)}` }, { x: num(n), y: num(e), kind: "point", label: `Ende ${plain(e)}` }],
    notice: "Modellpfad, keine beobachteten Zwischenwerte.",
  };
  return one(chart);
};

export const prozentCharts: Record<string, Builder> = {
  prozent,
  veraenderung,
  rabatt,
  prozentpunkte,
  dreisatz,
  durchschnitt,
  cagr,
};
