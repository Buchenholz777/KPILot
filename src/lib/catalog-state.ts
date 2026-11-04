import { search, type SearchEntry } from "./search";

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
  /** Startseite ohne Suche/Filter: nur Empfehlungen. */
  homeDefault: boolean;
}

export function computeView(
  s: CatalogState,
  entries: SearchEntry[],
  opts: { mode: "home" | "all"; recommended: Set<string> },
): CatalogView {
  const q = s.q.trim();
  const ranked = q ? search(q, entries) : entries.map((e) => e.id);
  const catOf = new Map(entries.map((e) => [e.id, e.category]));
  const homeDefault = opts.mode === "home" && !q && s.cat === ALL;
  let visible =
    s.cat === ALL ? ranked : ranked.filter((id) => catOf.get(id) === s.cat);
  if (homeDefault)
    visible = entries
      .filter((e) => opts.recommended.has(e.id))
      .map((e) => e.id);
  return {
    visible,
    globalCount: q ? ranked.length : entries.length,
    narrowed: !!q && s.cat !== ALL,
    homeDefault,
  };
}
