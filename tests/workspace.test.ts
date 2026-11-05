import { beforeEach, describe, expect, it } from "vitest";
import * as st from "../src/lib/storage";
import * as ws from "../src/lib/workspace";

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
let local: Mem;
beforeEach(() => {
  local = new Mem();
  st.setStorages(local, new Mem());
  st.setKnownFavoriteIds(["break-even", "marge", "gewinn", "roi"]);
});

const be = { p: "50", v: "30", F: "3000", zeitraum: "monat" };
const mk = (name = "Sommeraktion", extra: Partial<ws.NewSaved> = {}) =>
  ws.addSaved({ name, calcId: "break-even", variantId: "standard", schema: 1, inputs: be, ...extra })!;

describe("Speichern und Wiederöffnen", () => {
  it("Name, Eingaben, Zeitraum und Notiz bleiben erhalten", () => {
    const a = mk("Sommeraktion", { note: "Fixkosten geschätzt" });
    const back = ws.getSavedItem(a.id)!;
    expect(back.name).toBe("Sommeraktion");
    expect(back.inputs).toEqual(be);
    expect(back.inputs.zeitraum).toBe("monat");
    expect(back.note).toBe("Fixkosten geschätzt");
    expect(back.updatedAt).toBeTruthy();
  });
  it("Umbenennen ändert nur den gewünschten Eintrag", () => {
    const a = mk("A"),
      b = mk("B");
    ws.updateSaved(a.id, { name: "Neu" });
    expect(ws.getSavedItem(a.id)!.name).toBe("Neu");
    expect(ws.getSavedItem(b.id)!.name).toBe("B");
  });
  it("Duplizieren erzeugt eine unabhängige Kopie; Bearbeiten der Kopie überschreibt das Original nicht", () => {
    const a = mk("Original", { note: "n" });
    const c = ws.duplicateSaved(a.id)!;
    expect(c.id).not.toBe(a.id);
    expect(c.name).toBe("Original (Kopie)");
    ws.updateSaved(c.id, { inputs: { ...be, p: "55" } });
    expect(ws.getSavedItem(a.id)!.inputs.p).toBe("50");
    expect(ws.getSavedItem(c.id)!.inputs.p).toBe("55");
    expect(ws.getSaved()).toHaveLength(2);
  });
  it("Notiz lässt sich leeren", () => {
    const a = mk("A", { note: "x" });
    ws.updateSaved(a.id, { note: "" });
    expect(ws.getSavedItem(a.id)!.note).toBeUndefined();
  });
  it("Texte werden bereinigt und gekürzt, aber nicht als HTML interpretiert (bleiben Text)", () => {
    const a = mk("<img src=x onerror=alert(1)>" + "x".repeat(200));
    expect(a.name.length).toBeLessThanOrEqual(ws.LIMITS.name);
    expect(a.name.startsWith("<img")).toBe(true); // wird bei der Anzeige mit esc()/textContent ausgegeben
  });
});

describe("Vorhaben", () => {
  it("Gruppierung, Umbenennen, Entfernen nur ohne Verweise", () => {
    const p = ws.addProject("Angebot Müller")!;
    const a = mk("A", { projectId: p.id });
    expect(ws.getSavedItem(a.id)!.projectId).toBe(p.id);
    expect(ws.removeProject(p.id)).toBe(false);
    ws.updateProject(p.id, { name: "Angebot Müller GmbH" });
    expect(ws.getProjects()[0].name).toBe("Angebot Müller GmbH");
    ws.updateSaved(a.id, { projectId: undefined });
    expect(ws.getSavedItem(a.id)!.projectId).toBeUndefined();
    expect(ws.removeProject(p.id)).toBe(true);
  });
  it("gleicher Name ergibt dasselbe Vorhaben statt eines Duplikats", () => {
    const p1 = ws.addProject("Kampagne")!;
    const p2 = ws.addProject("kampagne")!;
    expect(p2.id).toBe(p1.id);
  });
});

describe("Löschen und Wiederherstellen", () => {
  it("stellt Name, Werte, Notiz und Projektbezug vollständig wieder her", () => {
    const p = ws.addProject("Produkt X")!;
    const a = mk("Mit Projekt", { note: "wichtig", projectId: p.id });
    expect(ws.removeSaved(a.id)).toBe(true);
    expect(ws.getSaved()).toHaveLength(0);
    expect(ws.getTrash()).toHaveLength(1);
    const r = ws.restoreSaved(a.id);
    expect(r.ok).toBe(true);
    const back = ws.getSavedItem(a.id)!;
    expect(back).toEqual(a);
    expect(back.projectId).toBe(p.id);
    expect(ws.getTrash()).toHaveLength(0);
  });
  it("auch wenn das Vorhaben inzwischen fehlt, wird es mit der Berechnung wieder angelegt", () => {
    const p = ws.addProject("Kurzzeitig")!;
    const a = mk("A", { projectId: p.id });
    ws.removeSaved(a.id);
    // Vorhaben ist durch Papierkorbverweis geschützt …
    expect(ws.removeProject(p.id)).toBe(false);
    // … sollte der Eintrag trotzdem fehlen (z. B. nach Import), wird er aus dem Schnappschuss rekonstruiert:
    const w = ws.loadWorkspace();
    w.projects = [];
    ws.saveWorkspace(w);
    const r = ws.restoreSaved(a.id);
    expect(r.ok && r.projectRecreated).toBe(true);
    expect(ws.getProjects().map((x) => x.name)).toEqual(["Kurzzeitig"]);
    expect(ws.getSavedItem(a.id)!.projectId).toBe(p.id);
  });
  it("Papierkorb ist begrenzt und überalterte Einträge verfallen", () => {
    for (let i = 0; i < ws.LIMITS.trash + 5; i++) {
      const a = mk(`E${i}`);
      ws.removeSaved(a.id);
    }
    expect(ws.getTrash().length).toBe(ws.LIMITS.trash);
    const w = ws.loadWorkspace();
    w.trash[0].deletedAt = new Date(Date.now() - 40 * 86_400_000).toISOString();
    ws.saveWorkspace(w);
    expect(ws.getTrash().length).toBe(ws.LIMITS.trash - 1);
  });
  it("Wiederherstellen eines unbekannten Eintrags schlägt verständlich fehl", () => {
    expect(ws.restoreSaved("gibt-es-nicht")).toEqual({ ok: false, reason: "not-found" });
  });
});

describe("Migration alter Daten", () => {
  const v1 = {
    v: 1,
    items: [
      { id: "sabc", name: "Alt", calcId: "break-even", variantId: "standard", schema: 1, savedAt: "2026-01-02T10:00:00.000Z", inputs: { p: "50", v: "30", F: "3000", zeitraum: "monat" } },
      { id: "sdef", name: "Zeilen", calcId: "durchschnitt", variantId: "standard", schema: 1, savedAt: "2026-02-02T10:00:00.000Z", inputs: { zeilen: [["1", "2"], ["3", "4"]] } },
      { id: "kaputt", name: 5 },
    ],
  };
  it("übernimmt gültige v1-Daten ohne Verlust, ignoriert Beschädigtes und lässt den Alt-Schlüssel unverändert", () => {
    local.setItem(st.SAVED_KEY, JSON.stringify(v1));
    const items = ws.getSaved();
    expect(items.map((i) => i.id)).toEqual(["sabc", "sdef"]);
    expect(items[0].inputs).toEqual(v1.items[0].inputs);
    expect(items[1].inputs.zeilen).toEqual([["1", "2"], ["3", "4"]]);
    expect(items[0].savedAt).toBe("2026-01-02T10:00:00.000Z");
    expect(items[0].updatedAt).toBe("2026-01-02T10:00:00.000Z");
    expect(JSON.parse(local.getItem(st.SAVED_KEY)!)).toEqual(v1);
    expect(JSON.parse(local.getItem(st.WORKSPACE_KEY)!).v).toBe(2);
  });
  it("nach der Migration funktionieren Löschen und Wiederherstellen für alte Einträge", () => {
    local.setItem(st.SAVED_KEY, JSON.stringify(v1));
    expect(ws.removeSaved("sabc")).toBe(true);
    expect(ws.restoreSaved("sabc").ok).toBe(true);
    expect(ws.getSavedItem("sabc")!.inputs.F).toBe("3000");
  });
  it("beschädigter Speicher führt zu leerem Arbeitsbereich statt Absturz", () => {
    local.setItem(st.WORKSPACE_KEY, "{kaputt");
    expect(ws.getSaved()).toEqual([]);
  });
});

describe("Speicher nicht verfügbar", () => {
  it("Speichern meldet Fehlschlag, nichts stürzt ab", () => {
    st.setStorages(null, null);
    expect(ws.addSaved({ name: "x", calcId: "marge", variantId: "standard", schema: 1, inputs: {} })).toBeNull();
    expect(ws.getSaved()).toEqual([]);
    expect(ws.removeSaved("x")).toBe(false);
    expect(ws.touchRecent("marge")).toBe(false);
    expect(ws.getPrefs().catalogView).toBe("compact");
  });
});

describe("Export und Import", () => {
  const seed = () => {
    const p = ws.addProject("Angebot")!;
    const a = mk("Preis A", { note: "Annahme", projectId: p.id });
    const b = mk("Preis B");
    st.toggleFavorite("marge");
    st.setConsent("granted");
    return { p, a, b };
  };
  it("Sicherung enthält Berechnungen, Vorhaben, Notizen, Favoriten – aber keine Einwilligung", () => {
    seed();
    const text = JSON.stringify(ws.buildBackup());
    const r = ws.parseBackup(text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.backup.items).toHaveLength(2);
    expect(r.backup.projects).toHaveLength(1);
    expect(r.backup.favorites).toEqual(["marge"]);
    expect(text).not.toMatch(/consent|granted|analytics/i);
  });
  it("Wiederherstellung auf einem leeren Gerät, Einwilligung wird nicht übertragen", () => {
    const { a } = seed();
    const text = JSON.stringify(ws.buildBackup());
    st.setStorages(new Mem(), new Mem());
    st.setKnownFavoriteIds(["marge"]);
    const parsed = ws.parseBackup(text);
    if (!parsed.ok) throw new Error("parse");
    const res = ws.applyImport(parsed.backup, { strategy: "keep", favorites: true });
    expect(res.ok && res.report.added).toBe(2);
    expect(ws.getSavedItem(a.id)!.note).toBe("Annahme");
    expect(ws.getProjects()).toHaveLength(1);
    expect(st.getFavorites()).toEqual(["marge"]);
    expect(st.getConsent()).toBeNull();
  });
  it("Konflikt: Vorschau zeigt ihn, Strategien keep/copy/overwrite verhalten sich wie beschrieben – nichts verschwindet still", () => {
    const { a } = seed();
    const parsed = ws.parseBackup(JSON.stringify(ws.buildBackup()));
    if (!parsed.ok) throw new Error("parse");
    ws.updateSaved(a.id, { name: "Lokal geändert" });
    const pre = ws.previewImport(parsed.backup);
    expect(pre.conflicts).toHaveLength(1);
    expect(pre.identical).toHaveLength(1);
    expect(pre.newItems).toHaveLength(0);

    ws.applyImport(parsed.backup, { strategy: "keep", favorites: false });
    expect(ws.getSavedItem(a.id)!.name).toBe("Lokal geändert");

    ws.applyImport(parsed.backup, { strategy: "copy", favorites: false });
    expect(ws.getSaved().filter((i) => i.name === "Preis A (importiert)")).toHaveLength(1);
    expect(ws.getSavedItem(a.id)!.name).toBe("Lokal geändert");

    const res = ws.applyImport(parsed.backup, { strategy: "overwrite", favorites: false });
    expect(res.ok && res.report.overwritten).toBe(1);
    expect(ws.getSavedItem(a.id)!.name).toBe("Preis A");
    // Überschriebenes ist im Papierkorb und wiederherstellbar:
    expect(ws.getTrash().some((t) => t.item.name === "Lokal geändert")).toBe(true);
  });
  it("ungültige Dateien werden verständlich abgelehnt", () => {
    const bad = (t: string) => {
      const r = ws.parseBackup(t);
      expect(r.ok).toBe(false);
      return r.ok ? "" : r.error;
    };
    expect(bad("")).toMatch(/leer/);
    expect(bad("{kaputt")).toMatch(/kein lesbares JSON/);
    expect(bad('{"app":"Anderes"}')).toMatch(/keine KPILot-Sicherung/);
    expect(bad('{"app":"KPILot","kind":"backup","version":99,"items":[],"projects":[]}')).toMatch(/neueren/);
    expect(bad('{"app":"KPILot","kind":"backup","version":1}')).toMatch(/unvollständig/);
    expect(bad("x".repeat(ws.LIMITS.backupBytes + 1))).toMatch(/zu groß/);
  });
  it("einzelne beschädigte Einträge werden gezählt und übersprungen, gültige importiert", () => {
    const file = {
      app: "KPILot", kind: "backup", version: 1, exportedAt: "2026-11-05T10:00:00.000Z", favorites: ["marge", "<script>"],
      projects: [{ id: "p1", name: "Ok", createdAt: "2026-11-05T10:00:00.000Z" }, { id: "p2" }],
      items: [
        { id: "s1", name: "Gut", calcId: "marge", variantId: "standard", schema: 1, inputs: { k: "80", p: "100" }, projectId: "p1" },
        { id: "s2", name: "Schlecht", calcId: "../etc", variantId: "standard", schema: 1, inputs: {} },
        { id: "s3", name: "Verweis ins Leere", calcId: "marge", variantId: "standard", schema: 1, inputs: {}, projectId: "gibtsnicht" },
      ],
    };
    const r = ws.parseBackup(JSON.stringify(file));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rejected).toBe(2);
    expect(r.backup.items.map((i) => i.id)).toEqual(["s1", "s3"]);
    expect(r.backup.favorites).toEqual(["marge"]);
    expect(r.warnings.join(" ")).toMatch(/Verweis ins Leere/);
  });
  it("Kapazität: mehr als 100 Berechnungen werden nicht stillschweigend verworfen, sondern gemeldet", () => {
    const items = Array.from({ length: 110 }, (_, i) => ({ id: `s${i}`, name: `E${i}`, calcId: "marge", variantId: "standard", schema: 1, inputs: {} }));
    const r = ws.parseBackup(JSON.stringify({ app: "KPILot", kind: "backup", version: 1, favorites: [], projects: [], items }));
    if (!r.ok) throw new Error("parse");
    const res = ws.applyImport(r.backup, { strategy: "keep", favorites: false });
    expect(res.ok && res.report.added).toBe(100);
    expect(res.ok && res.report.notImported).toBe(10);
  });
});

describe("Zuletzt genutzt und Einstellungen", () => {
  it("speichert nur Rechnerkennung und Zeitpunkt, neueste zuerst, ohne Doppelte, begrenzt", () => {
    for (const id of ["a", "b", "c", "a"]) ws.touchRecent(id);
    expect(ws.getRecent().map((e) => e.id)).toEqual(["a", "c", "b"]);
    for (let i = 0; i < 12; i++) ws.touchRecent(`r${i}`);
    expect(ws.getRecent()).toHaveLength(8);
    expect(Object.keys(ws.getRecent()[0]).sort()).toEqual(["at", "id"]);
    expect(ws.touchRecent("../x")).toBe(false);
  });
  it("Katalogansicht wird gemerkt, unbekannte Werte fallen auf den Standard zurück", () => {
    expect(ws.getPrefs().catalogView).toBe("compact"); // Standard für Erstbesucher
    ws.setPrefs({ catalogView: "explain" });
    expect(ws.getPrefs().catalogView).toBe("explain"); // bewusst gespeicherte Wahl wird berücksichtigt
    local.setItem(st.PREFS_KEY, '{"v":1,"catalogView":"quatsch"}');
    expect(ws.getPrefs().catalogView).toBe("compact");
  });
  it("„Alles löschen“ entfernt auch Arbeitsbereich, Zuletzt-Liste und Einstellungen, behält die Einwilligung", () => {
    mk("x");
    ws.touchRecent("marge");
    ws.setPrefs({ catalogView: "compact" });
    st.setConsent("denied");
    st.clearAll();
    expect(ws.getSaved()).toEqual([]);
    expect(ws.getRecent()).toEqual([]);
    expect(local.getItem(st.WORKSPACE_KEY)).toBeNull();
    expect(st.getConsent()).toBe("denied");
  });
});
