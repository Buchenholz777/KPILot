import { describe, expect, it } from "vitest";
import { TOPICS, TOPIC_BY_ID } from "../src/data/registry";
import { SEO, seoPageTitle } from "../src/data/seo";
import { getCalc } from "../src/calc/all";
import { runExample } from "../src/calc/engine";

describe("SEO-Konfiguration der Rechnerseiten", () => {
  it("jeder Rechner hat genau einen Eintrag, keine verwaisten Einträge", () => {
    expect(Object.keys(SEO).sort()).toEqual(TOPICS.map((t) => t.id).sort());
  });

  it("Titel: ca. 45–62 Zeichen inklusive „| KPILot“, eindeutig", () => {
    const titles = TOPICS.map((t) => seoPageTitle(t.id));
    for (const t of titles) {
      expect(t.length, t).toBeGreaterThanOrEqual(45);
      expect(t.length, t).toBeLessThanOrEqual(62);
    }
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("Descriptions: 120–165 Zeichen, eindeutig", () => {
    const ds = TOPICS.map((t) => SEO[t.id].description);
    for (const d of ds) {
      expect(d.length, d).toBeGreaterThanOrEqual(120);
      expect(d.length, d).toBeLessThanOrEqual(165);
    }
    expect(new Set(ds).size).toBe(ds.length);
  });

  it("H1 und Hauptkeywords sind eindeutig – keine zwei Seiten konkurrieren um dieselbe Suchintention", () => {
    const h1 = TOPICS.map((t) => SEO[t.id].h1);
    expect(new Set(h1).size).toBe(h1.length);
    const primary = TOPICS.map((t) => SEO[t.id].primary.toLowerCase());
    expect(new Set(primary).size).toBe(primary.length);
    for (const t of TOPICS) {
      expect(SEO[t.id].secondary.length, t.id).toBeGreaterThanOrEqual(2);
      expect(SEO[t.id].intent.length, t.id).toBeGreaterThan(10);
    }
  });

  it("„Szenariovergleich“ wird nur bei Rechnern mit Szenariofunktion versprochen", () => {
    for (const t of TOPICS) {
      if (/Szenario/i.test(SEO[t.id].description))
        expect(getCalc(t.id).scenario, t.id).toBeDefined();
    }
  });

  it("„Grafik“ bzw. „Diagramm“ wird nur bei Rechnern versprochen, die im Ergebnis ein Diagramm zeigen", () => {
    for (const t of TOPICS) {
      if (!/Grafik|Diagramm/i.test(SEO[t.id].description + SEO[t.id].title))
        continue;
      const hasChart = getCalc(t.id).variants.some((v) => {
        const r = runExample(v);
        return r.status === "ok" && !!r.chart;
      });
      expect(hasChart, t.id).toBe(true);
    }
  });

  it("verwandte Rechner existieren und die wichtigsten Pfade sind verlinkt", () => {
    for (const t of TOPICS)
      for (const r of t.related)
        expect(TOPIC_BY_ID[r], `${t.id} → ${r}`).toBeDefined();
    const chains: [string, string][] = [
      ["deckungsbeitrag", "break-even"],
      ["break-even", "gewinn"],
      ["marge", "zielpreis"],
      ["ctr", "cpc"],
      ["cpc", "cpa"],
      ["cpa", "roas"],
      ["cac", "clv"],
      ["ebit", "ebitda"],
      ["ebitda", "ebit-marge"],
    ];
    for (const [a, b] of chains)
      expect(TOPIC_BY_ID[a].related, `${a} → ${b}`).toContain(b);
  });
});
