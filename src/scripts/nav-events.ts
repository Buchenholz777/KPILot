/**
 * Klickereignisse für Navigation zwischen Rechnern (ohne eigene Zustände).
 * Es wird nur die Rechnerkennung des Ziels gemeldet – siehe docs/MESSKONZEPT.md.
 */
import { track } from "../lib/analytics";
import { readJson } from "./ui";

interface KrData {
  topics: Record<string, { title: string; href: string }>;
}
const data = readJson<KrData>("kr-data");
const byHref = new Map(Object.entries(data?.topics ?? {}).map(([id, t]) => [t.href, id]));

function calcOf(a: HTMLAnchorElement): string | undefined {
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return undefined;
  return byHref.get(url.pathname);
}

document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
  if (!a) return;
  const calc = calcOf(a);
  if (!calc) return;
  if (a.closest(".related-list")) track("related_clicked", { calc });
  else if (a.closest(".tile, .quick-item")) track("calc_selected", { calc });
});
