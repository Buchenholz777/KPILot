// Erzeugt docs/FORMELN.md, docs/MODELLANNAHMEN.md und docs/RECHNER-INVENTAR.md aus Register und Rechenmodulen.
// Aufruf: npm run docs
import { it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { TOPICS, topicUrl, displayTitle } from "../src/data/registry";
import { CATEGORY_BY_ID } from "../src/data/categories";
import { CALCS } from "../src/calc/all";
import { runExample } from "../src/calc/engine";
import { formatValue } from "../src/lib/number";
import { SEO, seoPageTitle } from "../src/data/seo";

it("erzeugt docs/FORMELN.md und docs/MODELLANNAHMEN.md", () => {
  mkdirSync("docs", { recursive: true });
  let f =
    "# Formeldokumentation – alle " +
    TOPICS.length +
    " Rechner\n\n> Automatisch erzeugt mit `npm run docs` aus `src/data/topics/*` und `src/calc/modules/*`.\n\n";
  let a =
    "# Modellannahmen und verwendete Definitionen\n\n> Automatisch erzeugt mit `npm run docs`. Allgemeine Regeln: `README.md` → „Zahlen und Rundung“.\n\n";
  TOPICS.forEach((t, i) => {
    const c = CALCS[t.id];
    f += `## ${String(i + 1).padStart(2, "0")}. ${displayTitle(t)}\n\n`;
    f += `- ID: \`${t.id}\` · URL: \`${topicUrl(t)}\` · Kategorie: ${CATEGORY_BY_ID[t.category].title}\n`;
    f += `- Varianten: ${c.variants.map((v) => `\`${v.id}\` (${v.label})`).join(", ")}\n\n`;
    f += t.formula.map((x) => `    ${x}`).join("\n") + "\n\n";
    f += t.variables.map(([k, v]) => `- **${k}**: ${v}`).join("\n") + "\n\n";
    for (const v of c.variants) {
      const r = runExample(v);
      if (r.status === "ok")
        f += `Beispiel${c.variants.length > 1 ? ` (${v.label})` : ""}: ${r.steps.join(" → ")} ⇒ **${r.main.label}: ${formatValue(r.main.value, r.main.format, r.main.unit, r.main.signed)}**\n\n`;
    }
    a += `## ${displayTitle(t)}\n\n${t.assumptions.map((x) => `- ${x}`).join("\n")}\n\n**Typische Missverständnisse**\n\n${t.misconceptions.map((x) => `- ${x}`).join("\n")}\n\n`;
  });
  a += `## Herleitung der neuen Modelle

### Rabatt: nötiger Mehrabsatz (\`rabatt-absatz\`)

Gleicher Gesamtdeckungsbeitrag vorher und nachher: d₀ · q₀ = d₁ · q₁ mit d₀ = p₀ − v und d₁ = p₁ − v. Umgestellt: q₁ = q₀ · d₀ / d₁, Absatzfaktor = d₀ / d₁, Mehrabsatz = (Faktor − 1) · 100 %.
Voraussetzungen: konstante variable Stückkosten v, vergleichbare Fixkostenbasis, d₀ > 0 und d₁ > 0. Ist d₁ ≤ 0, gibt es keine Menge, die den Beitrag erreicht (kein endlicher und kein „unendlicher“ Wert). Ganze Stückzahlen werden erst am Ende aufgerundet (q₀ · d₀ wird vor der Division multipliziert) und gegen die ungerundeten Werte geprüft.
Das Modell sagt nichts darüber, ob die Nachfrage erreichbar ist. Es ist eine Standardumformung der Deckungsbeitragsrechnung (Lehrbuchdarstellung); eine externe Primärquelle ist dafür nicht hinterlegt.

### Werbewirtschaftlichkeit und Mindest-ROAS (\`roas\`, Modus „Werbewirtschaftlichkeit“)

Mit der Deckungsbeitragsquote u vor Werbekosten (variable Kosten bereits abgezogen): DB vor Werbung = Umsatz · u; Beitrag nach Werbung = DB vor Werbung − Werbekosten. Der Beitrag ist ≥ 0, wenn Umsatz · u ≥ Werbekosten, also ROAS = Umsatz / Werbekosten ≥ 1 / u. Daraus Mindest-ROAS = 1 / u (nur für u > 0).
Weitere Fixkosten sind nicht berücksichtigt; Attribution und Messzeitraum bestimmen den Umsatz. Bei Werbekosten 0 ist der ROAS nicht definiert, bei u = 0 ist der Mindest-ROAS nicht definiert.

### Ablauf „Preis und Wirtschaftlichkeit“

Der Ablauf verwendet ausschließlich die Rechenfunktionen von Deckungsbeitrag, Break-even, Gewinn und Verkaufspreis aus Zielmarge; er enthält keine eigene Formel. Eine Vollkostenangabe wird nicht als variable Kosten übernommen, damit Fixkosten nicht doppelt zählen.
`;
  writeFileSync("docs/FORMELN.md", f);
  writeFileSync("docs/MODELLANNAHMEN.md", a);

  // Rechner-Inventar: Referenz, um nach Änderungen zu prüfen, dass nichts verloren ging
  let inv = `# Rechner-Inventar – alle ${TOPICS.length} Rechner

> Automatisch erzeugt mit \`npm run docs\`. Zweck: Referenz für Regressionsprüfungen (tests/inventar.test.ts erwartet genau diese Rechner, URLs und Modi).

| # | Rechner | URL | Kategorie | Modi | Eingabefelder | Diagramm | Szenariovergleich | Weiterverwendung | Verwandte Rechner |
|---|---|---|---|---|---|---|---|---|---|
`;
  TOPICS.forEach((t, i) => {
    const c = CALCS[t.id];
    const charts = c.variants
      .filter((v) => {
        const r = runExample(v);
        return r.status === "ok" && !!r.chart;
      })
      .map((v) => v.label);
    const fields = new Set<string>();
    c.variants.forEach((v) => {
      v.fields.forEach((fl) => fields.add(fl.label));
      v.rows?.columns.forEach((col) => fields.add(col.label));
    });
    const chartCell = charts.length
      ? charts.length === c.variants.length
        ? "ja"
        : "ja: " + charts.join("; ")
      : "nein";
    inv += `| ${String(i + 1).padStart(2, "0")} | ${displayTitle(t)} | \`${topicUrl(t)}\` | ${CATEGORY_BY_ID[t.category].title} | ${c.variants.map((v) => v.label).join("; ")} | ${[...fields].join("; ")} | ${chartCell} | ${c.scenario ? "ja" : "nein"} | ${(c.transfers ?? []).map((x) => x.target).join(", ") || "–"} | ${t.related.join(", ")} |\n`;
  });
  inv +=
    "\n## SEO-Daten je Rechner\n\n| Rechner | Seitentitel | H1 | Hauptkeyword |\n|---|---|---|---|\n";
  for (const t of TOPICS)
    inv += `| ${t.id} | ${seoPageTitle(t.id).replace(/\|/g, "&#124;")} | ${SEO[t.id].h1} | ${SEO[t.id].primary} |\n`;
  writeFileSync("docs/RECHNER-INVENTAR.md", inv);
});
