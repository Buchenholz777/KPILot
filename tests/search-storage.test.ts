import { beforeEach, describe, expect, it } from "vitest";
import { search } from "../src/lib/search";
import { buildSearchIndex, favoriteIds } from "../src/data/index-data";
import { TOPICS } from "../src/data/registry";
import { CALCS } from "../src/calc/all";
import * as st from "../src/lib/storage";

const idx = buildSearchIndex();
const find = (q: string) => search(q, idx);

describe("Register", () => {
  it("40 eindeutige IDs und URLs, jede mit Rechenmodul", () => {
    expect(TOPICS).toHaveLength(40);
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(40);
    expect(new Set(TOPICS.map((t) => t.slug)).size).toBe(40);
    for (const t of TOPICS) expect(CALCS[t.id], t.id).toBeDefined();
  });
  it("verwandte Rechner existieren", () => {
    const ids = new Set(TOPICS.map((t) => t.id));
    for (const t of TOPICS)
      for (const r of t.related)
        expect(ids.has(r), `${t.id} → ${r}`).toBe(true);
  });
  it("höchstens zwei Einstiegssätze", () => {
    for (const t of TOPICS)
      expect(
        t.intro.split(/(?<=[a-zäöüß)“"][.!?])\s+/).filter(Boolean).length,
        t.id,
      ).toBeLessThanOrEqual(2);
  });
});

describe("Suche", () => {
  it("„Gewinnschwelle“ findet Break-even", () =>
    expect(find("Gewinnschwelle")[0]).toBe("break-even"));
  it("„Was bleibt vom Umsatz?“ findet Ergebniskennzahlen", () => {
    const r = find("Was bleibt vom Umsatz?");
    for (const id of [
      "marge",
      "ebit-marge",
      "umsatzrendite",
      "deckungsbeitrag",
    ])
      expect(r).toContain(id);
    expect(r).not.toContain("roas");
  });
  it("„Geld auf dem Konto“ findet Cashflow und Liquidität", () => {
    const r = find("Geld auf dem Konto");
    expect(r).toContain("cashflow");
    expect(r).toContain("liquiditaet");
  });
  it("„Wie teuer darf ein Kunde sein?“ findet CAC und CLV", () => {
    const r = find("Wie teuer darf ein Kunde sein?");
    expect(r.slice(0, 2).sort()).toEqual(["cac", "clv"]);
  });
  it("Abkürzungen und ausgeschriebene Namen", () => {
    expect(find("CPC")[0]).toBe("cpc");
    expect(find("cost per click")[0]).toBe("cpc");
    expect(find("TKP")[0]).toBe("cpm");
    expect(find("ebitda")[0]).toBe("ebitda");
    expect(
      find("Kundenabwanderung").length + find("churn").length,
    ).toBeGreaterThan(0);
  });
  it("Umlaute und Groß-/Kleinschreibung", () =>
    expect(find("LIQUIDITAET")).toContain("liquiditaet"));
  it("Unsinn findet nichts", () => expect(find("xyzzy")).toHaveLength(0));
});

class Mem implements st.StorageLike {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}
class Full extends Mem {
  setItem() {
    throw new Error("QuotaExceeded");
  }
}

describe("Favoriten und gespeicherte Rechnungen", () => {
  let l: Mem, s: Mem;
  beforeEach(() => {
    l = new Mem();
    s = new Mem();
    st.setStorages(l, s);
    st.setKnownFavoriteIds(favoriteIds());
  });
  it("Favorit setzen, entfernen, nach „Neuladen“ erhalten", () => {
    expect(st.toggleFavorite("break-even").active).toBe(true);
    expect(st.toggleFavorite("prozent#prozentwert").active).toBe(true);
    expect(st.getFavorites()).toEqual(["break-even", "prozent#prozentwert"]);
    // Neuladen = neuer Lesevorgang aus demselben Speicher
    expect(JSON.parse(l.getItem(st.FAV_KEY)!).ids).toEqual([
      "break-even",
      "prozent#prozentwert",
    ]);
    expect(st.toggleFavorite("break-even").active).toBe(false);
    expect(st.getFavorites()).toEqual(["prozent#prozentwert"]);
  });
  it("unbekannte und beschädigte Einträge blockieren nichts", () => {
    l.setItem(st.FAV_KEY, "{kaputt");
    expect(st.getFavorites()).toEqual([]);
    l.setItem(
      st.FAV_KEY,
      JSON.stringify({
        v: 1,
        ids: ["break-even", "gibt-es-nicht", 42, "<script>"],
      }),
    );
    expect(st.getFavorites()).toEqual(["break-even"]);
  });
  it("Migration aus älterem Schlüssel", () => {
    l.setItem(
      "klarrechnen-favoriten",
      JSON.stringify(["marge", "prozent:grundwert"]),
    );
    expect(st.getFavorites()).toEqual(["marge", "prozent#grundwert"]);
    expect(JSON.parse(l.getItem(st.FAV_KEY)!).ids).toEqual([
      "marge",
      "prozent#grundwert",
    ]);
  });
  it("voller Speicher meldet keinen Erfolg", () => {
    st.setStorages(new Full(), s);
    const r = st.toggleFavorite("marge");
    expect(r.saved).toBe(false);
  });
  it("kein Speicher verfügbar: weiterrechnen möglich", () => {
    st.setStorages(null, null);
    expect(st.getFavorites()).toEqual([]);
    expect(st.toggleFavorite("marge").saved).toBe(false);
    expect(
      st.addSaved({
        name: "x",
        calcId: "marge",
        variantId: "standard",
        schema: 1,
        inputs: {},
      }),
    ).toBeNull();
  });
  it("Rechnung speichern, lesen, löschen", () => {
    const a = st.addSaved({
      name: "Sommeraktion",
      calcId: "break-even",
      variantId: "standard",
      schema: 1,
      inputs: { p: "50", v: "30", F: "3000", zeitraum: "monat" },
    })!;
    expect(st.getSaved()[0].inputs.zeitraum).toBe("monat");
    expect(st.removeSaved(a.id)).toBe(true);
    expect(st.getSaved()).toHaveLength(0);
  });
  it("Werteübernahme nur für das richtige Ziel und nur einmal", () => {
    st.setTransfer({
      from: "deckungsbeitrag",
      fromTitle: "Deckungsbeitrag",
      target: "break-even",
      values: { p: "50", v: "30" },
      describe: "",
    });
    expect(st.takeTransfer("gewinn")).toBeNull();
    expect(st.takeTransfer("break-even")?.values).toEqual({ p: "50", v: "30" });
    expect(st.takeTransfer("break-even")).toBeNull();
  });
  it("Alles löschen", () => {
    st.toggleFavorite("marge");
    st.addSaved({
      name: "x",
      calcId: "marge",
      variantId: "standard",
      schema: 1,
      inputs: {},
    });
    st.clearAll();
    expect(st.getFavorites()).toEqual([]);
    expect(st.getSaved()).toEqual([]);
  });
});
