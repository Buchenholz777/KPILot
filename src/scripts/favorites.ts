import {
  getFavorites,
  setKnownFavoriteIds,
  toggleFavorite,
  FAV_KEY,
  storageAvailable,
} from "../lib/storage";
import { toast, readJson } from "./ui";
import { track } from "../lib/analytics";
import { getRecent } from "../lib/workspace";

interface KrData {
  ids: string[];
  variants: Record<string, { title: string; href: string; parent: string }>;
  topics: Record<string, { title: string; href: string }>;
}

const data = readJson<KrData>("kr-data") ?? {
  ids: [],
  variants: {},
  topics: {},
};
setKnownFavoriteIds(data.ids);

let current: string[] = [];

/** Setzt aria-pressed aller Sterne, Zähler und Favoritenraster. */
function render() {
  current = getFavorites();
  const set = new Set(current);
  document.querySelectorAll<HTMLButtonElement>("[data-fav-id]").forEach((b) => {
    b.setAttribute("aria-pressed", String(set.has(b.dataset.favId!)));
  });
  document.querySelectorAll<HTMLElement>("[data-fav-count]").forEach((c) => {
    c.textContent = String(current.length);
    c.hidden = current.length === 0;
    c.setAttribute("aria-label", `${current.length} gespeichert`);
  });
  document.querySelectorAll<HTMLElement>("[data-fav-grid]").forEach(renderGrid);
  document
    .querySelectorAll<HTMLElement>("[data-fav-links]")
    .forEach(renderLinks);
  document
    .querySelectorAll<HTMLElement>("[data-recent-links]")
    .forEach(renderRecent);
}

/** Zuletzt genutzte Rechner: nur Rechnerkennung und Zeitpunkt, keine Eingaben. */
function renderRecent(list: HTMLElement) {
  const wrap = list.closest<HTMLElement>("[data-recent]");
  const items = getRecent()
    .map((e) => data.topics[e.id])
    .filter(Boolean)
    .slice(0, 5)
    .map((meta) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "fav-link";
      a.href = meta.href;
      a.textContent = meta.title;
      li.appendChild(a);
      return li;
    });
  list.replaceChildren(...items);
  if (wrap) wrap.hidden = items.length === 0;
}

/** Kompakte Favoritenleiste (Startseite): nur Links, damit Suche, Filter und Kacheln sichtbar bleiben. */
function renderLinks(list: HTMLElement) {
  const section = list.closest("section");
  const items = current
    .map((id) => {
      const meta = data.variants[id] ?? data.topics[id];
      if (!meta) return null;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "fav-link";
      a.href = meta.href;
      a.textContent = meta.title;
      li.appendChild(a);
      return li;
    })
    .filter((x): x is HTMLLIElement => !!x);
  list.replaceChildren(...items);
  const empty = section?.querySelector<HTMLElement>("[data-fav-empty]");
  if (empty) empty.hidden = items.length > 0;
  const manage = section?.querySelector<HTMLElement>("[data-fav-manage]");
  if (manage) manage.hidden = items.length === 0;
}

function buildTile(id: string): HTMLElement | null {
  const tpl = document.getElementById("kr-tiles") as HTMLTemplateElement | null;
  if (!tpl) return null;
  const [calcId, variantId] = id.split("#");
  const src = tpl.content.querySelector<HTMLElement>(
    `.tile[data-id="${calcId}"]`,
  );
  if (!src) return null;
  const tile = src.cloneNode(true) as HTMLElement;
  tile.dataset.favTile = id;
  const fav = tile.querySelector<HTMLButtonElement>("[data-fav-id]")!;
  if (variantId) {
    const meta = data.variants[id];
    if (!meta) return null;
    tile.querySelector("[data-tile-title]")!.textContent = meta.title;
    tile.querySelector<HTMLAnchorElement>(".tile-link")!.href = meta.href;
    tile.querySelector(".abbr")?.remove();
    const v = tile.querySelector<HTMLElement>("[data-tile-variant]")!;
    v.hidden = false;
    v.textContent = `Gespeicherte Variante von „${meta.parent}“`;
    fav.dataset.favId = id;
    fav.setAttribute("aria-label", `Favorit: ${meta.title}`);
    fav.title = `Favorit: ${meta.title}`;
  }
  fav.setAttribute("aria-pressed", "true");
  tile.querySelector("img")?.setAttribute("loading", "eager");
  return tile;
}

function renderGrid(grid: HTMLElement) {
  const key = current.join("|");
  if (grid.dataset.rendered === key) return; // unverändert: Fokus bleibt stabil
  const focusedFav = (
    document.activeElement as HTMLElement | null
  )?.closest<HTMLElement>("[data-fav-id]");
  const focusInGrid =
    focusedFav && grid.contains(focusedFav)
      ? focusedFav.dataset.favId
      : undefined;
  const prevIds = (grid.dataset.rendered ?? "").split("|").filter(Boolean);

  grid.replaceChildren(
    ...current.map(buildTile).filter((t): t is HTMLElement => !!t),
  );
  grid.dataset.rendered = key;
  const section = grid.closest("section");
  const empty = section?.querySelector<HTMLElement>("[data-fav-empty]");
  if (empty) empty.hidden = current.length > 0;

  // Fokus sinnvoll halten, wenn ein Favorit in diesem Raster entfernt wurde
  if (focusInGrid && !current.includes(focusInGrid)) {
    const idx = prevIds.indexOf(focusInGrid);
    const next = current[Math.min(idx, current.length - 1)];
    const target = next
      ? grid.querySelector<HTMLElement>(`[data-fav-id="${CSS.escape(next)}"]`)
      : section?.querySelector<HTMLElement>("h2, h1");
    target?.focus({ preventScroll: true });
  }
}

document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
    "[data-fav-id]",
  );
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const id = btn.dataset.favId!;
  const name = (btn.getAttribute("aria-label") ?? btn.textContent ?? "")
    .replace(/^Favorit:\s*/, "")
    .replace(/\s+–.*$/s, "")
    .trim();
  const res = toggleFavorite(id);
  if (!res.saved) {
    toast(
      storageAvailable()
        ? "Der Favorit konnte nicht gespeichert werden (Speicher voll). Bitte später erneut versuchen."
        : "Favoriten können nicht gespeichert werden: Dein Browser erlaubt hier keine lokale Speicherung. Rechnen funktioniert trotzdem.",
      6000,
    );
    return;
  }
  render();
  if (res.active) track("favorite_added", { calc: id.split("#")[0] });
  toast(
    res.active
      ? `„${name}“ zu deinen Favoriten hinzugefügt.`
      : `„${name}“ aus deinen Favoriten entfernt.`,
  );
});

// Andere Tabs desselben Browsers
window.addEventListener("storage", (e) => {
  if (e.key === FAV_KEY || e.key === null) render();
});
// Rückkehr über den Zurück-Button (bfcache)
window.addEventListener("pageshow", (e) => {
  if (e.persisted) render();
});
document.addEventListener("kr:favorites", render);

render();
