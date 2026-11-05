/**
 * Lokale Speicherung im Browser – robust gegen gesperrten, vollen oder
 * beschädigten Speicher. Die Website rechnet immer weiter, auch wenn
 * nichts gespeichert werden kann.
 *
 * Schlüssel:
 *  kr.favorites.v1   localStorage   { v: 1, ids: string[] }   (Rechner-ID oder „rechnerId#variantenId“)
 *  kr.saved.v1       localStorage   ALT (v1): { v: 1, items } – wird beim ersten Lesen nach kr.workspace.v2 migriert und bleibt unverändert als Sicherung liegen
 *  kr.workspace.v2   localStorage   { v: 2, items, projects, trash } – siehe workspace.ts
 *  kr.recent.v1      localStorage   { v: 1, items: [{ id, at }] } – zuletzt genutzte Rechner (nur Kennung und Zeitpunkt)
 *  kr.prefs.v1       localStorage   { v: 1, catalogView } – lokale Einstellungen
 *  kr.flow.v1        sessionStorage Entwurf des Ablaufs „Preis und Wirtschaftlichkeit“
 *  kr.transfer       sessionStorage Werteübernahme (nur aktuelle Sitzung)
 *  kr.catalog        sessionStorage Suche + Kategorie der Übersicht (ohne Zahlen)
 *  kr.consent.v1     localStorage   { v: 1, analytics: "granted" | "denied", at }
 */

export const FAV_KEY = "kr.favorites.v1";
export const SAVED_KEY = "kr.saved.v1";
export const WORKSPACE_KEY = "kr.workspace.v2";
export const RECENT_KEY = "kr.recent.v1";
export const PREFS_KEY = "kr.prefs.v1";
export const FLOW_KEY = "kr.flow.v1";
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

export const localStore = local;
export const sessionStore = session;

export function readJson<T>(s: StorageLike | null, key: string): T | null {
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
export function writeJson(
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

/* ---------------- Einwilligung (Google Analytics) ---------------- */

export const CONSENT_KEY = "kr.consent.v1";
export type Consent = "granted" | "denied";

/** Gespeicherte Entscheidung oder null, wenn noch keine getroffen wurde. */
export function getConsent(): Consent | null {
  const d = readJson<{ v: number; analytics: unknown }>(local(), CONSENT_KEY);
  return d?.v === 1 && (d.analytics === "granted" || d.analytics === "denied")
    ? d.analytics
    : null;
}
export function setConsent(c: Consent): boolean {
  return writeJson(local(), CONSENT_KEY, {
    v: 1,
    analytics: c,
    at: Date.now(),
  });
}

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

/** Löscht alle lokal gespeicherten Daten dieser Website. */
export function clearAll(): boolean {
  const l = local(),
    s = session();
  try {
    for (const k of [
      FAV_KEY,
      SAVED_KEY,
      WORKSPACE_KEY,
      RECENT_KEY,
      PREFS_KEY,
      ...LEGACY_FAV_KEYS,
    ])
      l?.removeItem(k);
    for (const k of [TRANSFER_KEY, CATALOG_KEY, FLOW_KEY]) s?.removeItem(k);
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
