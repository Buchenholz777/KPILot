import {
  applyImport,
  addProject,
  backupFileName,
  buildBackup,
  duplicateSaved,
  getProjects,
  getSaved,
  getTrash,
  loadWorkspace,
  parseBackup,
  previewImport,
  purgeTrash,
  removeProject,
  removeSaved,
  restoreSaved,
  updateProject,
  updateSaved,
  type BackupFile,
  type Project,
  type SavedCalc,
  type Strategy,
} from "../lib/workspace";
import { storageAvailable } from "../lib/storage";
import { esc, readJson, toast } from "./ui";
import { previewFor, type Preview } from "./preview";

type Meta = Record<string, { title: string; url: string; schema: number; variants: Record<string, string> }>;
const meta = readJson<Meta>("kr-calcs") ?? {};
const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
const groupsEl = $("[data-ws-groups]");
const emptyEl = $("[data-ws-empty]");
const trashEl = $("[data-ws-trash]");
const trashList = $("[data-trash-list]");
const statusEl = $("[data-ws-status]");
const noStore = $("[data-ws-nostorage]");

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
};
const say = (t: string) => {
  statusEl.textContent = "";
  window.setTimeout(() => (statusEl.textContent = t), 50);
};

const previews = new Map<string, Preview>();
async function ensurePreviews(items: SavedCalc[]) {
  await Promise.all(
    items.map(async (it) => {
      const key = `${it.id}:${it.updatedAt}`;
      if (!previews.has(key)) previews.set(key, await previewFor(it, meta[it.calcId]?.schema ?? it.schema));
    }),
  );
}
const pv = (it: SavedCalc) => previews.get(`${it.id}:${it.updatedAt}`);

function itemHtml(it: SavedCalc): string {
  const m = meta[it.calcId];
  const variant = m?.variants[it.variantId];
  const p = pv(it);
  const prob = !m ? "Rechner nicht mehr vorhanden" : !variant ? "Rechenmodus nicht mehr vorhanden" : "";
  const typ = `${esc(m?.title ?? it.calcId)}${variant && Object.keys(m.variants).length > 1 ? ` · ${esc(variant)}` : ""}`;
  const preview = p
    ? `<p class="ws-preview" data-state="${p.state}"><span class="ws-pv-label">${esc(p.label || "Ergebnis")}</span> <strong class="ws-pv-value">${esc(p.value)}</strong>${p.context ? `<span class="ws-pv-ctx">${esc(p.context)}</span>` : ""}${p.warning ? `<span class="ws-pv-warn">${esc(p.warning)}</span>` : ""}</p>`
    : "";
  const saved = fmtDate(it.savedAt),
    upd = fmtDate(it.updatedAt);
  return `<li class="card saved-item" data-id="${esc(it.id)}">
    <div class="saved-main">
      <h3>${esc(it.name)}</h3>
      <p class="small muted">${typ}${prob ? ` · <strong>${esc(prob)}</strong>` : ""}</p>
      ${preview}
      <p class="small muted">Gespeichert: ${esc(saved)}${upd && upd !== saved ? ` · Zuletzt geändert: ${esc(upd)}` : ""}</p>
      ${it.note ? `<p class="ws-note small"><strong>Notiz:</strong> ${esc(it.note.length > 160 ? it.note.slice(0, 160) + " …" : it.note)}</p>` : ""}
    </div>
    <div class="saved-actions">
      ${m && variant ? `<a class="btn btn-primary" href="${esc(m.url)}#gespeichert=${encodeURIComponent(it.id)}" aria-label="„${esc(it.name)}“ öffnen">Öffnen</a>` : ""}
      <button type="button" class="btn btn-secondary" data-edit="${esc(it.id)}" aria-label="„${esc(it.name)}“ umbenennen oder bearbeiten">Bearbeiten</button>
      <button type="button" class="btn btn-secondary" data-dup="${esc(it.id)}" aria-label="„${esc(it.name)}“ duplizieren">Duplizieren</button>
      <button type="button" class="btn btn-danger" data-del="${esc(it.id)}" aria-label="„${esc(it.name)}“ löschen">Löschen</button>
    </div>
  </li>`;
}

async function render(focusSel?: string) {
  noStore.hidden = storageAvailable();
  const w = loadWorkspace();
  await ensurePreviews([...w.items, ...w.trash.map((t) => t.item)]);
  const hasAny = w.items.length > 0 || w.projects.length > 0;
  emptyEl.hidden = hasAny || !storageAvailable();
  const byProject = new Map<string, SavedCalc[]>();
  for (const it of w.items) {
    const k = it.projectId ?? "";
    byProject.set(k, [...(byProject.get(k) ?? []), it]);
  }
  const section = (p: Project | null, items: SavedCalc[]) => {
    const id = p?.id ?? "";
    const head = p
      ? `<div class="ws-proj-head"><div><h2>${esc(p.name)}</h2><p class="small muted">Vorhaben · ${items.length} ${items.length === 1 ? "Berechnung" : "Berechnungen"}${p.note ? ` · ${esc(p.note.length > 120 ? p.note.slice(0, 120) + " …" : p.note)}` : ""}</p></div>
          <div class="saved-actions">${items.length ? `<a class="btn btn-secondary" href="/gespeichert/zusammenfassung/#projekt=${encodeURIComponent(id)}">Zusammenfassung</a>` : ""}<button type="button" class="btn btn-secondary" data-edit-project="${esc(id)}" aria-label="Vorhaben „${esc(p.name)}“ bearbeiten">Vorhaben bearbeiten</button>${items.length ? "" : `<button type="button" class="btn btn-danger" data-del-project="${esc(id)}" aria-label="Leeres Vorhaben „${esc(p.name)}“ entfernen">Entfernen</button>`}</div></div>`
      : `<div class="ws-proj-head"><h2>Ohne Vorhaben</h2></div>`;
    return `<section class="ws-group" aria-label="${esc(p?.name ?? "Ohne Vorhaben")}">${head}${items.length ? `<ul class="saved-list">${items.map(itemHtml).join("")}</ul>` : '<p class="small muted">Noch keine Berechnung in diesem Vorhaben. Beim Speichern oder unter „Bearbeiten“ kannst du eine zuordnen.</p>'}</section>`;
  };
  groupsEl.innerHTML =
    w.projects.map((p) => section(p, byProject.get(p.id) ?? [])).join("") + ((byProject.get("") ?? []).length ? section(null, byProject.get("") ?? []) : "");

  // Papierkorb
  trashEl.hidden = w.trash.length === 0;
  trashList.innerHTML = w.trash
    .map(
      (t) => `<li class="card saved-item" data-trash-id="${esc(t.item.id)}"><div class="saved-main"><h3>${esc(t.item.name)}</h3>
        <p class="small muted">${esc(meta[t.item.calcId]?.title ?? t.item.calcId)} · gelöscht am ${esc(fmtDate(t.deletedAt))}${t.project ? ` · Vorhaben: ${esc(t.project.name)}` : ""}</p></div>
        <div class="saved-actions"><button type="button" class="btn btn-primary" data-restore="${esc(t.item.id)}" aria-label="„${esc(t.item.name)}“ wiederherstellen">Wiederherstellen</button><button type="button" class="btn btn-ghost" data-purge="${esc(t.item.id)}" aria-label="„${esc(t.item.name)}“ endgültig löschen">Endgültig löschen</button></div></li>`,
    )
    .join("");
  if (focusSel) (document.querySelector(focusSel) as HTMLElement | null)?.focus();
}

/* ---------- Löschen mit Rückgängig ---------- */
function afterRemoveFocus(): string | undefined {
  return "[data-del], [data-ws-groups] h2, #ws-tools-h";
}
async function doRemove(id: string, name: string) {
  const ok = removeSaved(id);
  if (!ok) return toast("Löschen ist fehlgeschlagen.");
  say(`„${name}“ wurde gelöscht. Wiederherstellen ist unter „Zuletzt gelöscht“ möglich.`);
  await render();
  (document.querySelector("[data-del]") as HTMLElement | null)?.focus();
  toast(`„${name}“ gelöscht.`, 12000, { label: "Rückgängig", onClick: () => void doRestore(id, name) });
  void afterRemoveFocus;
}
async function doRestore(id: string, name: string) {
  const r = restoreSaved(id);
  if (r.ok) {
    say(`„${name}“ wurde wiederhergestellt${r.projectRecreated ? " – das Vorhaben wurde dabei wieder angelegt" : ""}.`);
    toast(`„${name}“ wiederhergestellt${r.projectRecreated ? " (Vorhaben wieder angelegt)" : ""}.`);
    await render(`[data-id="${CSS.escape(id)}"] a, [data-id="${CSS.escape(id)}"] button`);
  } else
    toast(
      r.reason === "full"
        ? "Wiederherstellen nicht möglich: Es sind schon 100 Berechnungen gespeichert. Lösche zuerst eine."
        : r.reason === "not-found"
          ? "Dieser Eintrag ist nicht mehr im Papierkorb."
          : "Wiederherstellen ist fehlgeschlagen (Speicher).",
      6000,
    );
}

/* ---------- Bearbeiten ---------- */
const editDlg = $<HTMLDialogElement>("[data-edit-dialog]");
const eName = editDlg.querySelector<HTMLInputElement>('input[name="name"]')!;
const eNote = editDlg.querySelector<HTMLTextAreaElement>('textarea[name="note"]')!;
const eProj = editDlg.querySelector<HTMLSelectElement>('select[name="project"]')!;
const eNewWrap = editDlg.querySelector<HTMLElement>("[data-edit-newwrap]")!;
const eNew = editDlg.querySelector<HTMLInputElement>('input[name="newproject"]')!;
let editingId = "";
eProj.addEventListener("change", () => {
  eNewWrap.hidden = eProj.value !== "__new";
  if (!eNewWrap.hidden) eNew.focus();
});
function openEdit(id: string) {
  const it = getSaved().find((x) => x.id === id);
  if (!it) return;
  editingId = id;
  eName.value = it.name;
  eNote.value = it.note ?? "";
  eProj.replaceChildren(new Option("Ohne Vorhaben", ""), ...getProjects().map((p) => new Option(p.name, p.id)), new Option("Neues Vorhaben anlegen …", "__new"));
  eProj.value = it.projectId ?? "";
  eNewWrap.hidden = true;
  editDlg.showModal();
  eName.select();
}
editDlg.addEventListener("close", async () => {
  if (editDlg.returnValue !== "save") return;
  let projectId: string | undefined = eProj.value || undefined;
  if (eProj.value === "__new") projectId = addProject(eNew.value)?.id;
  const r = updateSaved(editingId, { name: eName.value.trim() || "Ohne Namen", note: eNote.value, projectId });
  toast(r ? `„${r.name}“ gespeichert.` : "Speichern ist fehlgeschlagen.");
  await render(`[data-id="${CSS.escape(editingId)}"] [data-edit]`);
});

/* ---------- Vorhaben ---------- */
const projDlg = $<HTMLDialogElement>("[data-project-dialog]");
const pName = projDlg.querySelector<HTMLInputElement>('input[name="name"]')!;
const pNote = projDlg.querySelector<HTMLTextAreaElement>('textarea[name="note"]')!;
let editingProject: string | null = null;
function openProject(id: string | null) {
  editingProject = id;
  const p = id ? getProjects().find((x) => x.id === id) : undefined;
  $("[data-project-dialog-title]").textContent = id ? "Vorhaben bearbeiten" : "Neues Vorhaben";
  pName.value = p?.name ?? "";
  pNote.value = p?.note ?? "";
  projDlg.showModal();
  pName.focus();
}
projDlg.addEventListener("close", async () => {
  if (projDlg.returnValue !== "save") return;
  if (!pName.value.trim()) return toast("Bitte einen Namen für das Vorhaben eingeben.");
  const p = editingProject ? updateProject(editingProject, { name: pName.value, note: pNote.value }) : addProject(pName.value, pNote.value);
  toast(p ? `Vorhaben „${p.name}“ gespeichert.` : "Das Vorhaben konnte nicht gespeichert werden (Speicher oder Höchstzahl).");
  await render();
});

/* ---------- Sicherung ---------- */
$("[data-export]").addEventListener("click", () => {
  const b = buildBackup();
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFileName();
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast(`Sicherung mit ${b.items.length} Berechnung(en), ${b.projects.length} Vorhaben und ${b.favorites.length} Favorit(en) heruntergeladen.`, 6000);
});

const impDlg = $<HTMLDialogElement>("[data-import-dialog]");
const impFile = impDlg.querySelector<HTMLInputElement>("[data-import-file]")!;
const impPrev = impDlg.querySelector<HTMLElement>("[data-import-preview]")!;
const impGo = impDlg.querySelector<HTMLButtonElement>("[data-import-go]")!;
let parsed: BackupFile | null = null;
$("[data-import-open]").addEventListener("click", () => {
  impFile.value = "";
  impPrev.innerHTML = "";
  impGo.disabled = true;
  parsed = null;
  impDlg.showModal();
  impFile.focus();
});
impFile.addEventListener("change", async () => {
  parsed = null;
  impGo.disabled = true;
  const f = impFile.files?.[0];
  if (!f) return void (impPrev.innerHTML = "");
  if (f.size > 2_000_000) return void (impPrev.innerHTML = '<p class="notice notice-danger" role="alert">Die Datei ist zu groß für eine KPILot-Sicherung.</p>');
  const text = await f.text();
  const r = parseBackup(text);
  if (!r.ok) return void (impPrev.innerHTML = `<p class="notice notice-danger" role="alert">${esc(r.error)}</p>`);
  parsed = r.backup;
  const pre = previewImport(r.backup);
  const list = (arr: string[]) => (arr.length ? `<ul class="bullets small">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
  impPrev.innerHTML = `<div class="import-preview">
    <h3>Das steht in der Sicherung${r.backup.exportedAt ? ` (erstellt ${esc(fmtDate(r.backup.exportedAt))})` : ""}</h3>
    <ul class="bullets">
      <li><strong>${pre.newItems.length}</strong> neue Berechnung(en)${pre.newItems.length ? `: ${esc(pre.newItems.slice(0, 5).map((x) => x.name).join(", "))}${pre.newItems.length > 5 ? " …" : ""}` : ""}</li>
      <li><strong>${pre.identical.length}</strong> bereits identisch vorhanden (werden übersprungen)</li>
      <li><strong>${pre.conflicts.length}</strong> mit gleicher Kennung, aber anderem Inhalt (Konflikt)</li>
      <li><strong>${pre.newProjects.length}</strong> neue(s) Vorhaben · <strong>${pre.newFavorites.length}</strong> neue(r) Favorit(en)</li>
      ${r.rejected ? `<li><strong>${r.rejected}</strong> beschädigte oder unbekannte Einträge werden nicht importiert</li>` : ""}
    </ul>
    ${list(r.warnings)}
    ${pre.newItems.length + pre.conflicts.length > pre.capacityLeft ? `<p class="notice notice-warn">Es ist Platz für ${pre.capacityLeft} weitere Berechnung(en) (Höchstzahl 100). Überzählige werden nicht importiert.</p>` : ""}
    ${pre.conflicts.length ? `<fieldset class="import-strategy"><legend>Was soll bei Konflikten passieren?</legend>
      <label><input type="radio" name="strategy" value="keep" checked /> Vorhandene behalten (die Sicherungsfassung wird übersprungen)</label>
      <label><input type="radio" name="strategy" value="copy" /> Als zusätzliche Kopie importieren („… (importiert)“)</label>
      <label><input type="radio" name="strategy" value="overwrite" /> Vorhandene überschreiben (die bisherige Fassung landet im Papierkorb)</label>
      ${list(pre.conflicts.slice(0, 5).map((c) => `„${c.existing.name}“ (lokal, geändert ${fmtDate(c.existing.updatedAt)}) ↔ „${c.incoming.name}“ (Sicherung, geändert ${fmtDate(c.incoming.updatedAt)})`))}
    </fieldset>` : ""}
    ${pre.newFavorites.length ? `<label class="import-fav"><input type="checkbox" name="favs" checked /> ${pre.newFavorites.length} Favorit(en) aus der Sicherung hinzufügen</label>` : ""}
    <p class="small muted">Nichts wird stillschweigend überschrieben. Deine Entscheidung zur Nutzungsmessung ist nicht Teil der Sicherung und wird nicht verändert.</p>
  </div>`;
  impGo.disabled = pre.newItems.length + pre.conflicts.length + pre.newProjects.length + pre.newFavorites.length === 0;
  if (impGo.disabled) impPrev.insertAdjacentHTML("beforeend", '<p class="notice notice-info">Es gibt nichts Neues zu importieren.</p>');
});
impDlg.addEventListener("close", async () => {
  if (impDlg.returnValue !== "import" || !parsed) return;
  const strategy = (impPrev.querySelector<HTMLInputElement>('input[name="strategy"]:checked')?.value ?? "keep") as Strategy;
  const favorites = impPrev.querySelector<HTMLInputElement>('input[name="favs"]')?.checked ?? false;
  const r = applyImport(parsed, { strategy, favorites });
  if (!r.ok) return toast(r.error, 8000);
  const x = r.report;
  const msg = `Import abgeschlossen: ${x.added} neu, ${x.copied} als Kopie, ${x.overwritten} überschrieben, ${x.keptExisting} vorhandene behalten, ${x.skippedIdentical} identisch übersprungen${x.notImported ? `, ${x.notImported} wegen Höchstzahl nicht importiert` : ""}.`;
  say(msg);
  toast(msg, 9000);
  document.dispatchEvent(new Event("kr:favorites"));
  await render();
});

/* ---------- Ereignisse ---------- */
$("[data-new-project]").addEventListener("click", () => openProject(null));
document.addEventListener("click", async (e) => {
  const t = e.target as HTMLElement;
  const del = t.closest<HTMLElement>("[data-del]");
  const dup = t.closest<HTMLElement>("[data-dup]");
  const ed = t.closest<HTMLElement>("[data-edit]");
  const edp = t.closest<HTMLElement>("[data-edit-project]");
  const delp = t.closest<HTMLElement>("[data-del-project]");
  const res = t.closest<HTMLElement>("[data-restore]");
  const pur = t.closest<HTMLElement>("[data-purge]");
  if (del) {
    const it = getSaved().find((x) => x.id === del.dataset.del);
    if (it) await doRemove(it.id, it.name);
  } else if (dup) {
    const c = duplicateSaved(dup.dataset.dup!);
    toast(c ? `Kopie „${c.name}“ angelegt – unabhängig vom Original.` : "Duplizieren ist fehlgeschlagen (Speicher oder Höchstzahl 100).");
    await render(c ? `[data-id="${CSS.escape(c.id)}"] [data-edit]` : undefined);
  } else if (ed) openEdit(ed.dataset.edit!);
  else if (edp) openProject(edp.dataset.editProject!);
  else if (delp) {
    const ok = removeProject(delp.dataset.delProject!);
    toast(ok ? "Leeres Vorhaben entfernt." : "Das Vorhaben enthält noch Berechnungen (auch im Papierkorb) und bleibt erhalten.");
    await render();
  } else if (res) {
    const it = getTrash().find((x) => x.item.id === res.dataset.restore);
    if (it) await doRestore(it.item.id, it.item.name);
  } else if (pur) {
    if (purgeTrash(pur.dataset.purge)) {
      say("Endgültig gelöscht.");
      await render();
    }
  }
});

window.addEventListener("storage", () => void render());
void render();
