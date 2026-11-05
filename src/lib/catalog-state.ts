import { searchWithSuggestion, type SearchEntry } from "./search";

/**
 * Zustand von Suche und Kategoriefilter (ohne DOM, testbar).
 *
 * Regeln:
 *  A. Jede Änderung des Suchtexts sucht global: Kategorie → „alle“.
 *  B. Eine danach bewusst gewählte Kategorie grenzt die Treffer ein.
 *  C. Leeren/Zurücksetzen → Standardansicht, Kategorie „alle“.
 *  Ohne Suchtext filtern Kategorien wie gewohnt.
 */
export interface CatalogState {
  q: string;
  cat: string;
}

export const ALL = "alle";
export const initialState = (): CatalogState => ({ q: "", cat: ALL });

/** Neuer oder geänderter Suchtext (Tippen, Einfügen, Löschen). */
export function onQueryChange(s: CatalogState, q: string): CatalogState {
  if (q === s.q) return s;
  return { q, cat: ALL };
}

/** Bewusste Kategorieauswahl – mit oder ohne Suchtext. */
export function onCategory(s: CatalogState, cat: string): CatalogState {
  return { ...s, cat };
}

/** Suche leeren bzw. alles zurücksetzen. */
export function onClear(): CatalogState {
  return initialState();
}

/** Gespeicherten Sitzungszustand nur übernehmen, wenn er gültig ist. */
export function restore(
  saved: Partial<CatalogState> | null,
  validCats: string[],
): CatalogState {
  const q = typeof saved?.q === "string" ? saved.q.slice(0, 100) : "";
  const cat =
    typeof saved?.cat === "string" && validCats.includes(saved.cat)
      ? saved.cat
      : ALL;
  return { q, cat };
}

export interface CatalogView {
  /** Sichtbare IDs in Anzeigereihenfolge. */
  visible: string[];
  /** Alle globalen Treffer zum Suchtext (unabhängig von der Kategorie). */
  globalCount: number;
  /** Suchtext wird gerade durch eine Kategorie eingegrenzt. */
  narrowed: boolean;
  /** Vorschlag bei Tippfehler („Deckungsbeitrag“); die sichtbaren Treffer gehören dann zu diesem Vorschlag. */
  suggestion?: string;
}

export function computeView(
  s: CatalogState,
  entries: SearchEntry[],
): CatalogView {
  const q = s.q.trim();
  const found = q ? searchWithSuggestion(q, entries) : undefined;
  const ranked = found ? found.ids : entries.map((e) => e.id);
  const catOf = new Map(entries.map((e) => [e.id, e.category]));
  // Ohne bewusste Such- oder Filteraktion bleibt der vollständige Katalog sichtbar.
  const visible =
    s.cat === ALL ? ranked : ranked.filter((id) => catOf.get(id) === s.cat);
  return {
    visible,
    globalCount: q ? ranked.length : entries.length,
    narrowed: !!q && s.cat !== ALL,
    suggestion: found?.fuzzy ? found.suggestion : undefined,
  };
}
