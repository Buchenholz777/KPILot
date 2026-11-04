/**
 * Lokale Speicherung im Browser – robust gegen gesperrten, vollen oder
 * beschädigten Speicher. Die Website rechnet immer weiter, auch wenn
 * nichts gespeichert werden kann.
 *
 * Schlüssel:
 *  kr.favorites.v1   localStorage   { v: 1, ids: string[] }   (Rechner-ID oder „rechnerId#variantenId“)
 *  kr.saved.v1       localStorage   { v: 1, items: SavedCalc[] }
 *  kr.transfer       sessionStorage Werteübernahme (nur aktuelle Sitzung)
 *  kr.catalog        sessionStorage Suche + Kategorie der Übersicht (ohne Zahlen)
 */

export const FAV_KEY = "kr.favorites.v1";
export const SAVED_KEY = "kr.saved.v1";
export const TRANSFER_KEY = "kr.transfer";
export const CATALOG_KEY = "kr.catalog";
/** Ältere Schlüssel, aus denen Favoriten übernommen werden. */
export const LEGACY_FAV_KEYS = [
  "klarrechnen-favoriten",
  "klarrechnen.favorites",
  "kr.favorites",
];

export interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function store(kind: "local" | "session"): StorageLike | null {
  try {
    const s =
      kind === "local" ? globalThis.localStorage : globalThis.sessionStorage;
    if (!s) return null;
    const probe = "__kr_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

let localOverride: StorageLike | null | undefined;
let sessionOverride: StorageLike | null | undefined;
/** Für Tests: eigenen Speicher einsetzen. */
export function setStorages(
  local: StorageLike | null,
  session: StorageLike | null,
) {
  localOverride = local;
  sessionOverride = session;
}
const local = () =>
  localOverride !== undefined ? localOverride : store("local");
const session = () =>
  sessionOverride !== undefined ? sessionOverride : store("session");

function readJson<T>(s: StorageLike | null, key: string): T | null {
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJson(
  s: StorageLike | null,
  key: string,
  value: unknown,
): boolean {
  if (!s) return false;
  try {
    s.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = () => local() !== null;

/* ---------------- Favoriten ---------------- */

const ID_RE = /^[a-z0-9-]+(#[a-z0-9-]+)?$/;
let knownIds: Set<string> | null = null;
/** Bekannte Rechner- und Varianten-IDs setzen, damit fremde Einträge ignoriert werden. */
export function setKnownFavoriteIds(ids: string[]) {
  knownIds = new Set(ids);
}
const validFav = (x: unknown): x is string =>
  typeof x === "string" && ID_RE.test(x) && (!knownIds || knownIds.has(x));

export function getFavorites(): string[] {
  const s = local();
  const data = readJson<{ v: number; ids: unknown }>(s, FAV_KEY);
  if (data && Array.isArray(data.ids))
    return [...new Set(data.ids.filter(validFav))];
  // Migration aus älteren Versionen (einfaches Array oder {ids})
  for (const k of LEGACY_FAV_KEYS) {
    const old = readJson<unknown>(s, k);
    const arr = Array.isArray(old)
      ? old
      : old &&
          typeof old === "object" &&
          Array.isArray((old as { ids?: unknown }).ids)
        ? (old as { ids: unknown[] }).ids
        : null;
    if (arr) {
      const ids = [
        ...new Set(
          arr
            .map((x) => (typeof x === "string" ? x.replace(":", "#") : x))
            .filter(validFav),
        ),
      ];
      writeJson(s, FAV_KEY, { v: 1, ids });
      return ids;
    }
  }
  return [];
}

/** Speichert Favoriten. Gibt false zurück, wenn der Browser nicht speichern kann. */
export function setFavorites(ids: string[]): boolean {
  return writeJson(local(), FAV_KEY, {
    v: 1,
    ids: [...new Set(ids.filter(validFav))],
  });
}

export function toggleFavorite(id: string): {
  ids: string[];
  saved: boolean;
  active: boolean;
} {
  const ids = getFavorites();
  const active = !ids.includes(id);
  const next = active ? [...ids, id] : ids.filter((x) => x !== id);
  return { ids: next, saved: setFavorites(next), active };
}

/* ---------------- Gespeicherte Rechnungen ---------------- */

export interface SavedCalc {
  id: string;
  name: string;
  calcId: string;
  variantId: string;
  schema: number;
  savedAt: string;
  /** Rohwerte wie im Formular, inklusive Auswahlfeldern (Einheiten, Zeitraum). */
  inputs: Record<string, string | string[][]>;
}

const validSaved = (x: unknown): x is SavedCalc => {
  const o = x as SavedCalc;
  return (
    !!o &&
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.calcId === "string" &&
    typeof o.variantId === "string" &&
    typeof o.schema === "number" &&
    !!o.inputs &&
    typeof o.inputs === "object"
  );
};

export function getSaved(): SavedCalc[] {
  const data = readJson<{ v: number; items: unknown }>(local(), SAVED_KEY);
  return data && Array.isArray(data.items) ? data.items.filter(validSaved) : [];
}

export function addSaved(
  item: Omit<SavedCalc, "id" | "savedAt">,
): SavedCalc | null {
  const full: SavedCalc = {
    ...item,
    name: item.name.slice(0, 60),
    id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    savedAt: new Date().toISOString(),
  };
  const items = [full, ...getSaved()].slice(0, 100);
  return writeJson(local(), SAVED_KEY, { v: 1, items }) ? full : null;
}

export function removeSaved(id: string): boolean {
  return writeJson(local(), SAVED_KEY, {
    v: 1,
    items: getSaved().filter((x) => x.id !== id),
  });
}

/** Löscht alle lokal gespeicherten Daten dieser Website. */
export function clearAll(): boolean {
  const l = local(),
    s = session();
  try {
    for (const k of [FAV_KEY, SAVED_KEY, ...LEGACY_FAV_KEYS]) l?.removeItem(k);
    for (const k of [TRANSFER_KEY, CATALOG_KEY]) s?.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/* ---------------- Sitzung: Werteübernahme, Katalogzustand ---------------- */

export interface Transfer {
  from: string;
  fromTitle: string;
  target: string;
  values: Record<string, string>;
  describe: string;
}

export function setTransfer(t: Transfer): boolean {
  return writeJson(session(), TRANSFER_KEY, t);
}
/** Liest eine Übernahme für den Zielrechner und entfernt sie danach. */
export function takeTransfer(target: string): Transfer | null {
  const s = session();
  const t = readJson<Transfer>(s, TRANSFER_KEY);
  if (!t || t.target !== target || typeof t.values !== "object") return null;
  try {
    s?.removeItem(TRANSFER_KEY);
  } catch {
    /* ignorieren */
  }
  return t;
}

export interface CatalogState {
  q: string;
  cat: string;
}
export const getCatalogState = (): CatalogState | null =>
  readJson<CatalogState>(session(), CATALOG_KEY);
export const setCatalogState = (st: CatalogState) =>
  writeJson(session(), CATALOG_KEY, { q: st.q.slice(0, 100), cat: st.cat });
