import { describe, expect, it } from "vitest";
import { TOPICS, topicUrl } from "../src/data/registry";
import { getCalc } from "../src/calc/all";
import { runExample } from "../src/calc/engine";

/**
 * Regressionsschutz: Stand des Rechnerportfolios (siehe docs/RECHNER-INVENTAR.md).
 * Fällt ein Rechner, eine URL oder ein Rechenmodus weg oder ändert sich eine URL, schlägt dieser Test fehl.
 * Bei bewusster Erweiterung die Liste ergänzen (nicht kürzen) – bestehende URLs sollen für Rankings und Links stabil bleiben.
 */
const EXPECTED: [string, string, string[]][] = [
  ["prozent", "prozentrechner", ["prozentwert", "prozentsatz", "grundwert"]],
  ["veraenderung", "prozentuale-veraenderung", ["standard"]],
  [
    "rabatt",
    "rabattrechner",
    [
      "rabatt",
      "erhoehung",
      "ursprung-rabatt",
      "ursprung-erhoehung",
      "zwei-aenderungen",
    ],
  ],
  ["prozentpunkte", "prozentpunkte-rechner", ["standard"]],
  ["dreisatz", "dreisatz-rechner", ["direkt", "umgekehrt"]],
  ["durchschnitt", "gewichteter-durchschnitt", ["standard"]],
  ["cagr", "cagr-rechner", ["standard"]],
  ["deckungsbeitrag", "deckungsbeitragsrechner", ["standard"]],
  ["break-even", "break-even-rechner", ["standard"]],
  ["gewinn", "gewinnrechner", ["menge", "zielgewinn"]],
  ["marge", "margenrechner", ["standard"]],
  ["zielpreis", "verkaufspreis-berechnen", ["standard"]],
  ["stueckkosten", "stueckkosten-rechner", ["standard"]],
  ["zuschlag", "zuschlagskalkulation", ["schema", "satz"]],
  ["stundensatz", "stundenkostensatz-rechner", ["standard"]],
  ["rabatt-absatz", "rabatt-mehrabsatz-rechner", ["prozent", "neuer-preis"]],
  ["ebit", "ebit-rechner", ["standard"]],
  ["ebitda", "ebitda-rechner", ["standard"]],
  ["ebit-marge", "ebit-marge-rechner", ["standard"]],
  ["umsatzrendite", "umsatzrendite-rechner", ["standard"]],
  ["cashflow", "cashflow-rechner", ["operativ", "erweitert"]],
  ["working-capital", "working-capital-rechner", ["standard"]],
  ["liquiditaet", "liquiditaetsrechner", ["standard"]],
  ["eigenkapital", "eigenkapitalquote-rechner", ["standard"]],
  ["roi", "roi-rechner", ["standard"]],
  ["amortisation", "amortisationsrechner", ["standard"]],
  ["conversion", "conversion-rate-rechner", ["besuche", "ereignisse"]],
  ["ctr", "ctr-rechner", ["standard"]],
  ["cpc", "cpc-rechner", ["standard"]],
  ["cpm", "cpm-rechner", ["standard"]],
  ["cpa", "cpa-rechner", ["standard"]],
  ["roas", "roas-rechner", ["standard", "wirtschaftlichkeit"]],
  ["cac", "cac-rechner", ["standard"]],
  ["arpu", "arpu-rechner", ["standard"]],
  ["clv", "clv-rechner", ["standard"]],
  ["churn", "churn-rechner", ["standard"]],
  ["mrr", "mrr-arr-rechner", ["standard"]],
  ["nps", "nps-rechner", ["standard"]],
  ["soll-ist", "soll-ist-rechner", ["standard"]],
  ["auslastung", "auslastung-rechner", ["standard"]],
  ["lager", "lagerkennzahlen-rechner", ["durchschnitt", "anfang-ende"]],
];

describe("Rechner-Inventar", () => {
  it("alle bisherigen Rechner sind mit unveränderter URL und allen Modi vorhanden", () => {
    for (const [id, slug, variants] of EXPECTED) {
      const t = TOPICS.find((x) => x.id === id);
      expect(t, `Rechner ${id} fehlt`).toBeDefined();
      expect(topicUrl(t!), id).toBe(`/${slug}/`);
      const have = getCalc(id).variants.map((v) => v.id);
      for (const v of variants)
        expect(have, `${id}: Modus ${v} fehlt`).toContain(v);
    }
  });
  it("es sind mindestens 41 Rechner vorhanden", () => {
    expect(EXPECTED).toHaveLength(41);
    expect(TOPICS.length).toBeGreaterThanOrEqual(EXPECTED.length);
  });
  it("jeder Rechner liefert mit seinem dokumentierten Beispiel in jedem Modus ein gültiges Ergebnis", () => {
    for (const t of TOPICS)
      for (const v of getCalc(t.id).variants)
        expect(runExample(v).status, `${t.id}/${v.id}`).toBe("ok");
  });
});
