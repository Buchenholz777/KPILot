/** Kleine gemeinsame Hilfen für die Browserskripte. */

let toastTimer: number | undefined;
/** Kurze sichtbare und vorgelesene Statusmeldung. */
export function toast(message: string, ms = 3800) {
  const el = document.querySelector<HTMLElement>("[data-toast]");
  if (!el) return;
  el.hidden = false;
  el.textContent = "";
  // erneutes Setzen, damit Screenreader gleiche Meldungen erneut vorlesen
  requestAnimationFrame(() => (el.textContent = message));
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (el.hidden = true), ms);
}

export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function readJson<T>(id: string): T | null {
  const el = document.getElementById(id);
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as T;
  } catch {
    return null;
  }
}
