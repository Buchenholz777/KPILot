/**
 * „Meine Berechnungen“: lokaler Arbeitsbereich (Datenmodell v2) ohne DOM – testbar.
 *
 *  - Berechnungen mit Name, Notiz, Vorhaben (Projekt), Eingaben, Zeitpunkten
 *  - Papierkorb: gelöschte Berechnungen lassen sich vollständig (inkl. Vorhaben) wiederherstellen
 *  - Sicherungsdatei (Export/Import) mit Validierung, Vorschau und Konfliktstrategie
 *  - Migration der Version 1 (`kr.saved.v1`) ohne Verlust; die alten Daten bleiben unverändert liegen
 *  - zuletzt genutzte Rechner (nur Rechnerkennung + Zeitpunkt) und lokale Einstellungen
 *
 * Die Einwilligung zur Nutzungsmessung ist bewusst nicht Bestandteil einer Sicherung.
 */
import {
  FAV_KEY,
  PREFS_KEY,
  RECENT_KEY,
  SAVED_KEY,
  WORKSPACE_KEY,
  getFavorites,
  localStore,
  readJson,
  setFavorites,
  writeJson,
} from "./storage";

export type RawValue = string | string[][];

export interface SavedCalc {
  id: string;
  name: string;
  calcId: string;
  variantId: string;
  schema: number;
  savedAt: string;
  updatedAt: string;
  /** Rohwerte wie im Formular, inklusive Auswahlfeldern (Einheiten, Zeitraum). */
  inputs: Record<string, RawValue>;
  /** Notizen zu Annahmen (nur Text). */
  note?: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
}

export interface TrashEntry {
  item: SavedCalc;
  deletedAt: string;
  /** Vorhaben zum Zeitpunkt des Löschens – wird bei der Wiederherstellung bei Bedarf neu angelegt. */
  project?: Project;
}

export interface Workspace {
  v: 2;
  items: SavedCalc[];
  projects: Project[];
  trash: TrashEntry[];
}

export const LIMITS = {
  items: 100,
  trash: 30,
  trashDays: 30,
  projects: 30,
  name: 80,
  note: 2000,
  backupBytes: 2_000_000,
  inputKeyLength: 40,
  inputValueLength: 64,
  rows: 40,
};

/* ---------------- Bereinigung ---------------- */

/** Entfernt Steuerzeichen und kürzt. Importierte Texte werden nie als HTML interpretiert, hier wird zusätzlich bereinigt. */
export function cleanText(v: unknown, max: number, multiline = false): string {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const re = multiline ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return v.replace(re, " ").trim().slice(0, max);
}

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const SLUG_RE = /^[a-z0-9-]{1,60}$/;

function cleanInputs(x: unknown): Record<string, RawValue> | null {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const out: Record<string, RawValue> = {};
  for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
    if (!SLUG_RE.test(k) && !/^[A-Za-z0-9_]{1,40}$/.test(k)) continue;
    if (k.length > LIMITS.inputKeyLength) continue;
    if (typeof v === "string") out[k] = v.slice(0, LIMITS.inputValueLength);
    else if (Array.isArray(v) && v.length <= LIMITS.rows) {
      const rows: string[][] = [];
      for (const row of v) {
        if (!Array.isArray(row) || row.length > 12) return null;
        rows.push(row.map((c) => (typeof c === "string" ? c.slice(0, LIMITS.inputValueLength) : "")));
      }
      out[k] = rows;
    }
  }
  return out;
}

function iso(v: unknown, fallback: string): string {
  if (typeof v === "string" && !isNaN(Date.parse(v))) return new Date(v).toISOString();
  return fallback;
}

/** Prüft und bereinigt eine Berechnung. Gibt null zurück, wenn sie unbrauchbar ist. */
export function sanitizeItem(x: unknown, now = new Date().toISOString()): SavedCalc | null {
  const o = x as Partial<SavedCalc> | null;
  if (!o || typeof o !== "object") return null;
  if (typeof o.id !== "string" || !ID_RE.test(o.id)) return null;
  if (typeof o.calcId !== "string" || !SLUG_RE.test(o.calcId)) return null;
  if (typeof o.variantId !== "string" || !SLUG_RE.test(o.variantId)) return null;
  if (typeof o.schema !== "number" || !Number.isFinite(o.schema)) return null;
  const inputs = cleanInputs(o.inputs);
  if (!inputs) return null;
  const name = cleanText(o.name, LIMITS.name);
  const savedAt = iso(o.savedAt, now);
  const item: SavedCalc = {
    id: o.id,
    name: name || "Ohne Namen",
    calcId: o.calcId,
    variantId: o.variantId,
    schema: o.schema,
    savedAt,
    updatedAt: iso(o.updatedAt, savedAt),
    inputs,
  };
  const note = cleanText(o.note, LIMITS.note, true);
  if (note) item.note = note;
  if (typeof o.projectId === "string" && ID_RE.test(o.projectId)) item.projectId = o.projectId;
  return item;
}

export function sanitizeProject(x: unknown, now = new Date().toISOString()): Project | null {
  const o = x as Partial<Project> | null;
  if (!o || typeof o !== "object" || typeof o.id !== "string" || !ID_RE.test(o.id)) return null;
  const name = cleanText(o.name, LIMITS.name);
  if (!name) return null;
  const p: Project = { id: o.id, name, createdAt: iso(o.createdAt, now) };
  const note = cleanText(o.note, LIMITS.note, true);
  if (note) p.note = note;
  return p;
}

/* ---------------- Laden, Migration, Speichern ---------------- */

const empty = (): Workspace => ({ v: 2, items: [], projects: [], trash: [] });
export const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function normalize(raw: unknown): Workspace {
  const w = empty();
  const r = raw as Partial<Workspace> | null;
  if (!r || typeof r !== "object") return w;
  const seen = new Set<string>();
  for (const x of Array.isArray(r.items) ? r.items : []) {
    const it = sanitizeItem(x);
    if (it && !seen.has(it.id)) {
      seen.add(it.id);
      w.items.push(it);
    }
  }
  const pids = new Set<string>();
  for (const x of Array.isArray(r.projects) ? r.projects : []) {
    const p = sanitizeProject(x);
    if (p && !pids.has(p.id)) {
      pids.add(p.id);
      w.projects.push(p);
    }
  }
  for (const t of Array.isArray(r.trash) ? r.trash : []) {
    const e = t as Partial<TrashEntry> | null;
    const item = sanitizeItem(e?.item);
    if (!item || seen.has(item.id)) continue;
    const entry: TrashEntry = { item, deletedAt: iso(e?.deletedAt, new Date().toISOString()) };
    const p = e?.project ? sanitizeProject(e.project) : null;
    if (p) entry.project = p;
    w.trash.push(entry);
  }
  // Verweise auf nicht vorhandene Vorhaben entfernen
  for (const it of w.items) if (it.projectId && !pids.has(it.projectId)) delete it.projectId;
  return w;
}

/** Version 1 → 2. Unbekannte Felder gehen nicht verloren, weil v1 unverändert im Speicher bleibt. */
export function migrateV1(raw: unknown): Workspace {
  const items = (raw as { items?: unknown })?.items;
  return normalize({ v: 2, items: Array.isArray(items) ? items : [], projects: [], trash: [] });
}

export function loadWorkspace(): Workspace {
  const l = localStore();
  const v2 = readJson<unknown>(l, WORKSPACE_KEY);
  if (v2 && typeof v2 === "object" && (v2 as { v?: unknown }).v === 2) return pruneTrash(normalize(v2));
  const v1 = readJson<{ v?: number; items?: unknown }>(l, SAVED_KEY);
  if (v1 && v1.v === 1) {
    const w = migrateV1(v1);
    writeJson(l, WORKSPACE_KEY, w); // Alt-Schlüssel bleibt als Sicherung bestehen
    return w;
  }
  return empty();
}

function pruneTrash(w: Workspace, now = Date.now()): Workspace {
  const limit = LIMITS.trashDays * 86_400_000;
  w.trash = w.trash
    .filter((t) => now - Date.parse(t.deletedAt) <= limit)
    .slice(0, LIMITS.trash);
  return w;
}

export function saveWorkspace(w: Workspace): boolean {
  return writeJson(localStore(), WORKSPACE_KEY, { ...pruneTrash(w), v: 2 });
}

/* ---------------- Berechnungen ---------------- */

export const getSaved = () => loadWorkspace().items;
export const getSavedItem = (id: string) => getSaved().find((x) => x.id === id);

export type NewSaved = Omit<SavedCalc, "id" | "savedAt" | "updatedAt"> & Partial<Pick<SavedCalc, "id">>;

export function addSaved(item: NewSaved): SavedCalc | null {
  const w = loadWorkspace();
  if (w.items.length >= LIMITS.items) return null;
  const now = new Date().toISOString();
  const full = sanitizeItem({ ...item, id: item.id ?? newId("s"), savedAt: now, updatedAt: now }, now);
  if (!full) return null;
  if (full.projectId && !w.projects.some((p) => p.id === full.projectId)) delete full.projectId;
  w.items.unshift(full);
  return saveWorkspace(w) ? full : null;
}

export function updateSaved(
  id: string,
  patch: Partial<Pick<SavedCalc, "name" | "note" | "projectId" | "inputs" | "variantId" | "schema">>,
): SavedCalc | null {
  const w = loadWorkspace();
  const it = w.items.find((x) => x.id === id);
  if (!it) return null;
  const next = sanitizeItem(
    {
      ...it,
      ...patch,
      projectId: "projectId" in patch ? patch.projectId : it.projectId,
      updatedAt: new Date().toISOString(),
    },
    it.savedAt,
  );
  if (!next) return null;
  if (next.projectId && !w.projects.some((p) => p.id === next.projectId)) delete next.projectId;
  if (patch.note === "" || patch.note === undefined) {
    if ("note" in patch) delete next.note;
  }
  if ("projectId" in patch && !patch.projectId) delete next.projectId;
  w.items[w.items.indexOf(it)] = next;
  return saveWorkspace(w) ? next : null;
}

/** Eigenständige Kopie (neue ID, neue Zeitpunkte, gleiche Werte, Notiz und Vorhaben). */
export function duplicateSaved(id: string): SavedCalc | null {
  const w = loadWorkspace();
  const it = w.items.find((x) => x.id === id);
  if (!it || w.items.length >= LIMITS.items) return null;
  const now = new Date().toISOString();
  const copy: SavedCalc = structuredCloneSafe({
    ...it,
    id: newId("s"),
    name: cleanText(`${it.name} (Kopie)`, LIMITS.name),
    savedAt: now,
    updatedAt: now,
  });
  w.items.splice(w.items.indexOf(it), 0, copy);
  return saveWorkspace(w) ? copy : null;
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Löschen = in den Papierkorb legen. */
export function removeSaved(id: string): boolean {
  const w = loadWorkspace();
  const it = w.items.find((x) => x.id === id);
  if (!it) return false;
  w.items = w.items.filter((x) => x.id !== id);
  const entry: TrashEntry = { item: it, deletedAt: new Date().toISOString() };
  const project = it.projectId ? w.projects.find((p) => p.id === it.projectId) : undefined;
  if (project) entry.project = project;
  w.trash.unshift(entry);
  return saveWorkspace(w);
}

export const getTrash = () => loadWorkspace().trash;

export type RestoreResult =
  | { ok: true; item: SavedCalc; projectRecreated: boolean }
  | { ok: false; reason: "not-found" | "full" | "storage" };

/** Stellt eine gelöschte Berechnung vollständig wieder her – inklusive Name, Werten, Notizen und Vorhaben. */
export function restoreSaved(id: string): RestoreResult {
  const w = loadWorkspace();
  const t = w.trash.find((x) => x.item.id === id);
  if (!t) return { ok: false, reason: "not-found" };
  if (w.items.length >= LIMITS.items) return { ok: false, reason: "full" };
  let projectRecreated = false;
  const item = { ...t.item };
  if (item.projectId && !w.projects.some((p) => p.id === item.projectId)) {
    if (t.project) {
      w.projects.push(t.project);
      projectRecreated = true;
    } else delete item.projectId;
  }
  w.trash = w.trash.filter((x) => x !== t);
  w.items.unshift(item);
  return saveWorkspace(w) ? { ok: true, item, projectRecreated } : { ok: false, reason: "storage" };
}

export function purgeTrash(id?: string): boolean {
  const w = loadWorkspace();
  w.trash = id ? w.trash.filter((x) => x.item.id !== id) : [];
  return saveWorkspace(w);
}

/* ---------------- Vorhaben ---------------- */

export const getProjects = () => loadWorkspace().projects;

export function addProject(name: string, note?: string): Project | null {
  const w = loadWorkspace();
  const clean = cleanText(name, LIMITS.name);
  if (!clean || w.projects.length >= LIMITS.projects) return null;
  const existing = w.projects.find((p) => p.name.toLowerCase() === clean.toLowerCase());
  if (existing) return existing;
  const p: Project = { id: newId("p"), name: clean, createdAt: new Date().toISOString() };
  const n = cleanText(note, LIMITS.note, true);
  if (n) p.note = n;
  w.projects.push(p);
  return saveWorkspace(w) ? p : null;
}

export function updateProject(id: string, patch: { name?: string; note?: string }): Project | null {
  const w = loadWorkspace();
  const p = w.projects.find((x) => x.id === id);
  if (!p) return null;
  if (patch.name !== undefined) {
    const n = cleanText(patch.name, LIMITS.name);
    if (n) p.name = n;
  }
  if (patch.note !== undefined) {
    const n = cleanText(patch.note, LIMITS.note, true);
    if (n) p.note = n;
    else delete p.note;
  }
  return saveWorkspace(w) ? p : null;
}

/** Ein Vorhaben lässt sich nur entfernen, wenn keine Berechnung (auch nicht im Papierkorb) darauf verweist. */
export function removeProject(id: string): boolean {
  const w = loadWorkspace();
  if (w.items.some((x) => x.projectId === id) || w.trash.some((x) => x.item.projectId === id)) return false;
  w.projects = w.projects.filter((p) => p.id !== id);
  return saveWorkspace(w);
}

/* ---------------- Sicherungsdatei ---------------- */

export const BACKUP_VERSION = 1;
export interface BackupFile {
  app: "KPILot";
  kind: "backup";
  version: number;
  exportedAt: string;
  favorites: string[];
  projects: Project[];
  items: SavedCalc[];
}

/** Erzeugt die Sicherung. Enthalten: Berechnungen, Vorhaben, Notizen, Favoriten. Nicht enthalten: Einwilligung, Papierkorb, Sitzungsdaten. */
export function buildBackup(now = new Date()): BackupFile {
  const w = loadWorkspace();
  return {
    app: "KPILot",
    kind: "backup",
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    favorites: getFavorites(),
    projects: w.projects,
    items: w.items,
  };
}

export const backupFileName = (now = new Date()) =>
  `kpilot-sicherung-${now.toISOString().slice(0, 10)}.json`;

export type ParseResult =
  | { ok: true; backup: BackupFile; rejected: number; warnings: string[] }
  | { ok: false; error: string };

/** Validiert eine Sicherungsdatei strukturiert. Fremde, beschädigte oder neuere Dateien werden verständlich abgelehnt. */
export function parseBackup(text: string): ParseResult {
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "Die Datei ist leer." };
  if (text.length > LIMITS.backupBytes)
    return { ok: false, error: "Die Datei ist zu groß für eine KPILot-Sicherung." };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "Die Datei ist keine gültige Sicherungsdatei (kein lesbares JSON)." };
  }
  const o = data as Partial<BackupFile> | null;
  if (!o || typeof o !== "object" || Array.isArray(o) || o.app !== "KPILot" || o.kind !== "backup")
    return { ok: false, error: "Das ist keine KPILot-Sicherung. Bitte eine Datei wählen, die über „Sicherung herunterladen“ erstellt wurde." };
  if (typeof o.version !== "number" || !Number.isInteger(o.version) || o.version < 1)
    return { ok: false, error: "Die Version der Sicherung ist nicht lesbar." };
  if (o.version > BACKUP_VERSION)
    return {
      ok: false,
      error: `Die Sicherung hat die Version ${o.version} und stammt aus einer neueren KPILot-Fassung. Diese Fassung kennt nur Version ${BACKUP_VERSION}. Es wurde nichts importiert.`,
    };
  if (!Array.isArray(o.items) || !Array.isArray(o.projects))
    return { ok: false, error: "Die Sicherung ist unvollständig (Berechnungen oder Vorhaben fehlen)." };
  if (o.items.length > 500 || o.projects.length > 100)
    return { ok: false, error: "Die Sicherung enthält ungewöhnlich viele Einträge und wird nicht gelesen." };
  const warnings: string[] = [];
  let rejected = 0;
  const projects: Project[] = [];
  const pids = new Set<string>();
  for (const x of o.projects) {
    const p = sanitizeProject(x);
    if (p && !pids.has(p.id)) {
      pids.add(p.id);
      projects.push(p);
    } else rejected++;
  }
  const items: SavedCalc[] = [];
  const ids = new Set<string>();
  for (const x of o.items) {
    const it = sanitizeItem(x);
    if (it && !ids.has(it.id)) {
      ids.add(it.id);
      if (it.projectId && !pids.has(it.projectId)) {
        delete it.projectId;
        warnings.push(`„${it.name}“ verwies auf ein Vorhaben, das in der Datei fehlt – ohne Vorhaben importiert.`);
      }
      items.push(it);
    } else rejected++;
  }
  const favorites = Array.isArray(o.favorites)
    ? [...new Set(o.favorites.filter((f): f is string => typeof f === "string" && /^[a-z0-9-]+(#[a-z0-9-]+)?$/.test(f)))].slice(0, 200)
    : [];
  return {
    ok: true,
    rejected,
    warnings,
    backup: { app: "KPILot", kind: "backup", version: o.version, exportedAt: iso(o.exportedAt, ""), favorites, projects, items },
  };
}

export type Strategy = "keep" | "copy" | "overwrite";
export interface ImportPreview {
  newItems: SavedCalc[];
  identical: SavedCalc[];
  conflicts: { existing: SavedCalc; incoming: SavedCalc }[];
  newProjects: Project[];
  newFavorites: string[];
  capacityLeft: number;
}

const sameContent = (a: SavedCalc, b: SavedCalc) =>
  a.name === b.name &&
  a.calcId === b.calcId &&
  a.variantId === b.variantId &&
  (a.note ?? "") === (b.note ?? "") &&
  (a.projectId ?? "") === (b.projectId ?? "") &&
  JSON.stringify(a.inputs) === JSON.stringify(b.inputs);

export function previewImport(b: BackupFile, w = loadWorkspace(), favs = getFavorites()): ImportPreview {
  const byId = new Map(w.items.map((i) => [i.id, i]));
  const pre: ImportPreview = {
    newItems: [],
    identical: [],
    conflicts: [],
    newProjects: b.projects.filter((p) => !w.projects.some((q) => q.id === p.id)),
    newFavorites: b.favorites.filter((f) => !favs.includes(f)),
    capacityLeft: Math.max(0, LIMITS.items - w.items.length),
  };
  for (const inc of b.items) {
    const ex = byId.get(inc.id);
    if (!ex) pre.newItems.push(inc);
    else if (sameContent(ex, inc)) pre.identical.push(inc);
    else pre.conflicts.push({ existing: ex, incoming: inc });
  }
  return pre;
}

export interface ImportReport {
  added: number;
  copied: number;
  overwritten: number;
  keptExisting: number;
  skippedIdentical: number;
  notImported: number;
  projectsAdded: number;
  favoritesAdded: number;
}

/** Wendet die Sicherung an. Es gibt keine stillschweigende Überschreibung: Konflikte folgen der gewählten Strategie, Überschriebenes landet im Papierkorb. */
export function applyImport(
  b: BackupFile,
  opts: { strategy: Strategy; favorites: boolean },
): { ok: true; report: ImportReport } | { ok: false; error: string } {
  const w = loadWorkspace();
  const pre = previewImport(b, w);
  const rep: ImportReport = {
    added: 0, copied: 0, overwritten: 0, keptExisting: 0, skippedIdentical: pre.identical.length,
    notImported: 0, projectsAdded: 0, favoritesAdded: 0,
  };
  for (const p of pre.newProjects) {
    if (w.projects.length >= LIMITS.projects) break;
    w.projects.push(p);
    rep.projectsAdded++;
  }
  const hasRoom = () => w.items.length < LIMITS.items;
  const now = new Date().toISOString();
  for (const it of pre.newItems) {
    if (!hasRoom()) { rep.notImported++; continue; }
    w.items.push(projectOk(it, w));
    rep.added++;
  }
  for (const { existing, incoming } of pre.conflicts) {
    if (opts.strategy === "keep") { rep.keptExisting++; continue; }
    if (opts.strategy === "overwrite") {
      const project = existing.projectId ? w.projects.find((p) => p.id === existing.projectId) : undefined;
      // Neue ID, weil die eingespielte Berechnung die alte ID übernimmt; so bleibt die überschriebene Fassung wiederherstellbar.
      w.trash.unshift({ item: { ...existing, id: newId("s") }, deletedAt: now, ...(project ? { project } : {}) });
      w.items[w.items.indexOf(existing)] = projectOk(incoming, w);
      rep.overwritten++;
    } else {
      if (!hasRoom()) { rep.notImported++; continue; }
      w.items.push(projectOk({ ...incoming, id: newId("s"), name: cleanText(`${incoming.name} (importiert)`, LIMITS.name) }, w));
      rep.copied++;
    }
  }
  if (!saveWorkspace(w)) return { ok: false, error: "Der Browser konnte die importierten Daten nicht speichern (Speicher gesperrt oder voll). Es wurde nichts verändert." };
  if (opts.favorites && pre.newFavorites.length) {
    const cur = getFavorites();
    const next = [...new Set([...cur, ...pre.newFavorites])];
    if (setFavorites(next)) rep.favoritesAdded = getFavorites().length - cur.length;
  }
  return { ok: true, report: rep };
}

function projectOk(it: SavedCalc, w: Workspace): SavedCalc {
  const copy = { ...it };
  if (copy.projectId && !w.projects.some((p) => p.id === copy.projectId)) delete copy.projectId;
  return copy;
}

/* ---------------- Zuletzt genutzt ---------------- */

export interface RecentEntry {
  id: string;
  at: string;
}
const RECENT_MAX = 8;

export function getRecent(): RecentEntry[] {
  const d = readJson<{ v?: number; items?: unknown }>(localStore(), RECENT_KEY);
  if (!d || d.v !== 1 || !Array.isArray(d.items)) return [];
  const out: RecentEntry[] = [];
  for (const x of d.items) {
    const e = x as Partial<RecentEntry>;
    if (typeof e?.id === "string" && SLUG_RE.test(e.id) && typeof e.at === "string" && !isNaN(Date.parse(e.at)))
      out.push({ id: e.id, at: e.at });
  }
  return out.slice(0, RECENT_MAX);
}

/** Merkt sich nur Rechnerkennung und Zeitpunkt – keine Eingaben. */
export function touchRecent(id: string, at = new Date()): boolean {
  if (!SLUG_RE.test(id)) return false;
  const next = [{ id, at: at.toISOString() }, ...getRecent().filter((e) => e.id !== id)].slice(0, RECENT_MAX);
  return writeJson(localStore(), RECENT_KEY, { v: 1, items: next });
}

/* ---------------- Einstellungen ---------------- */

export type CatalogView = "explain" | "compact";
export interface Prefs {
  catalogView: CatalogView;
}
export function getPrefs(): Prefs {
  const d = readJson<{ v?: number; catalogView?: unknown }>(localStore(), PREFS_KEY);
  return { catalogView: d?.v === 1 && d.catalogView === "compact" ? "compact" : "explain" };
}
export function setPrefs(p: Partial<Prefs>): boolean {
  return writeJson(localStore(), PREFS_KEY, { v: 1, ...getPrefs(), ...p });
}

void FAV_KEY;
