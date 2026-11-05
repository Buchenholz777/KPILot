/** Kleine gemeinsame Hilfen für die Browserskripte. */

let toastTimer: number | undefined;
export interface ToastAction {
  label: string;
  onClick: () => void;
}
/**
 * Kurze sichtbare und vorgelesene Statusmeldung. Optional mit Aktion (z. B. „Rückgängig“):
 * Die Schaltfläche ist per Tastatur erreichbar; Meldungen mit Aktion bleiben länger stehen.
 */
export function toast(message: string, ms = 3800, action?: ToastAction) {
  const el = document.querySelector<HTMLElement>("[data-toast]");
  if (!el) return;
  el.hidden = false;
  el.textContent = "";
  const text = document.createElement("span");
  // erneutes Setzen, damit Screenreader gleiche Meldungen erneut vorlesen
  requestAnimationFrame(() => (text.textContent = message));
  el.append(text);
  if (action) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "toast-action";
    b.textContent = action.label;
    b.addEventListener("click", () => {
      window.clearTimeout(toastTimer);
      el.hidden = true;
      action.onClick();
    });
    el.append(b);
  }
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (el.hidden = true), action ? Math.max(ms, 12000) : ms);
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
