import { describe, expect, it } from "vitest";
import { buildSearchIndex } from "../src/data/index-data";
import { TOPICS } from "../src/data/registry";
import { search } from "../src/lib/search";
import {
  computeView,
  initialState,
  onCategory,
  onClear,
  onQueryChange,
  restore,
  ALL,
  type CatalogState,
} from "../src/lib/catalog-state";

const entries = buildSearchIndex();
const recommended = new Set(
  TOPICS.filter((t) => t.recommended).map((t) => t.id),
);
const view = (s: CatalogState, mode: "home" | "all" = "all") =>
  computeView(s, entries, { mode, recommended });
const type = (s: CatalogState, q: string) => onQueryChange(s, q);

describe("Regression: Suche ist nach Kategorieauswahl global", () => {
  it("1. Marketing wählen, dann „Cashflow“: Kategorie → Alle, Cashflow gefunden", () => {
    let s = onCategory(initialState(), "marketing");
    expect(view(s).visible).not.toContain("cashflow");
    s = type(s, "Cashflow");
    expect(s.cat).toBe(ALL);
    expect(view(s).visible[0]).toBe("cashflow");
  });
  it("2. andere Kategorie wählen, dann „ROAS“: global gefunden", () => {
    let s = onCategory(initialState(), "controlling");
    s = type(s, "ROAS");
    expect(s.cat).toBe(ALL);
    expect(view(s).visible[0]).toBe("roas");
  });
  it("auch beim Einfügen und beim Ändern eines bestehenden Suchtexts", () => {
    let s = type(initialState(), "marge");
    s = onCategory(s, "kosten");
    s = type(s, "marge ");
    expect(s.cat).toBe(ALL);
    s = onCategory(s, "produkt");
    s = type(s, "Cashflow-Berechnung"); // Einfügen eines ganzen Begriffs
    expect(s.cat).toBe(ALL);
    expect(view(s).visible).toContain("cashflow");
  });
  it("unveränderter Suchtext setzt die Kategorie nicht zurück", () => {
    const s = onCategory(type(initialState(), "marge"), "kosten");
    expect(type(s, "marge")).toBe(s);
  });
});

describe("Bewusste Eingrenzung nach der Suche", () => {
  it("4. Kategorie nach Suche grenzt ein und ist erkennbar", () => {
    let s = type(initialState(), "marge");
    const global = view(s);
    s = onCategory(s, "finanzen");
    const v = view(s);
    expect(v.narrowed).toBe(true);
    expect(v.visible.length).toBeGreaterThan(0);
    expect(v.visible.length).toBeLessThan(global.visible.length);
    expect(
      v.visible.every(
        (id) => TOPICS.find((t) => t.id === id)!.category === "finanzen",
      ),
    ).toBe(true);
    expect(s.q).toBe("marge");
  });
  it("Null Treffer in Kategorie, aber globale Treffer → globalCount > 0, Suchbegriff bleibt", () => {
    let s = type(initialState(), "Cashflow");
    s = onCategory(s, "marketing");
    const v = view(s);
    expect(v.visible).toHaveLength(0);
    expect(v.globalCount).toBeGreaterThan(0);
    expect(s.q).toBe("Cashflow");
    // „In allen Kategorien suchen“
    s = onCategory(s, ALL);
    expect(view(s).visible).toContain("cashflow");
  });
  it("erneute Texteingabe beginnt wieder global", () => {
    let s = onCategory(type(initialState(), "cash"), "marketing");
    s = type(s, "cashflow");
    expect(s.cat).toBe(ALL);
  });
});

describe("Leeren und Kategorien ohne Suchtext", () => {
  it("5. Suche leeren → Standardansicht, Kategorie Alle", () => {
    let s = onCategory(type(initialState(), "roi"), "finanzen");
    s = onClear();
    expect(s).toEqual({ q: "", cat: ALL });
    expect(view(s).visible).toHaveLength(entries.length);
    expect(view(s, "home").homeDefault).toBe(true);
  });
  it("Text vollständig löschen → Kategorie Alle (kein versteckter Filter)", () => {
    let s = onCategory(type(initialState(), "roi"), "finanzen");
    s = type(s, "");
    expect(s.cat).toBe(ALL);
    expect(view(s).visible).toHaveLength(entries.length);
  });
  it("6. Kategorie ohne Suchtext filtert weiterhin", () => {
    const v = view(onCategory(initialState(), "marketing"));
    expect(v.visible).toEqual([
      "conversion",
      "ctr",
      "cpc",
      "cpm",
      "cpa",
      "roas",
      "cac",
    ]);
    expect(v.narrowed).toBe(false);
  });
  it("ungültiger gespeicherter Zustand wird verworfen", () => {
    expect(
      restore({ q: "x", cat: "gibt-es-nicht" }, ["alle", "marketing"]),
    ).toEqual({ q: "x", cat: ALL });
    expect(restore(null, ["alle"])).toEqual({ q: "", cat: ALL });
  });
});

describe("3. Robuste Suchbegriffe", () => {
  const first = (q: string) => search(q, entries)[0];
  it.each([
    "Cashflow",
    "cashflow",
    "CASHFLOW",
    "  Cashflow  ",
    "Cashflow-Berechnung",
    "Cashflow berechnen",
    "Cashflow Rechner",
    "Cashflowrechner",
    "Cash-Flow",
    "cash flow",
  ])("„%s“ findet den Cashflow-Rechner", (q) =>
    expect(first(q)).toBe("cashflow"),
  );
  it.each([
    ["ROAS", "roas"],
    ["Return on Ad Spend", "roas"],
    ["Break-even-Rechner", "break-even"],
    ["Deckungsbeiträge berechnen", "deckungsbeitrag"],
    ["Stückkosten", "stueckkosten"],
    ["Margen", "marge"],
  ])("„%s“ → %s", (q, id) => expect(first(q)).toBe(id));
});
