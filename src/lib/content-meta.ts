import { execSync } from "node:child_process";

/**
 * Technisches Änderungsdatum einer Inhaltsdatei aus der Git-Historie (Build-Zeit).
 * Das ist ausdrücklich KEIN Datum einer fachlichen Prüfung. Ohne Git-Historie liefert die Funktion undefined.
 */
const cache = new Map<string, string | undefined>();
export function technicalChangeDate(path: string): string | undefined {
  if (cache.has(path)) return cache.get(path);
  let out: string | undefined;
  try {
    const s = execSync(`git log -1 --format=%cs -- ${JSON.stringify(path)}`, {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    })
      .toString()
      .trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) out = s;
  } catch {
    out = undefined;
  }
  cache.set(path, out);
  return out;
}

export const formatIsoDe = (iso: string) => iso.split("-").reverse().join(".");

/** Inhaltsdatei, in der das Thema einer Kategorie steht. */
export const topicFile = (category: string) =>
  ({
    prozent: "src/data/topics/prozent.ts",
    kosten: "src/data/topics/kosten.ts",
    finanzen: "src/data/topics/finanzen.ts",
    marketing: "src/data/topics/marketing.ts",
    produkt: "src/data/topics/produkt-controlling.ts",
    controlling: "src/data/topics/produkt-controlling.ts",
  })[category] ?? "src/data/registry.ts";
