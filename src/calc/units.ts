/**
 * Mengeneinheit des Preis-/Kostenmodells (Stück, abrechenbare Stunde, Auftrag, Paket, Einheit).
 *
 * Die Rechenmodule formulieren ihre Texte mit „Stück“. Für andere Einheiten ersetzt `localize` die Fachwörter
 * ausdrücklich und nachvollziehbar (Tabelle unten) – Zahlen und Rechenregeln bleiben unverändert.
 * Rundung: Mengen werden unabhängig von der Einheit auf ganze Einheiten aufgerundet (bei Stunden: ganze abrechenbare
 * Stunden); die Berechnung selbst arbeitet mit den ungerundeten Werten.
 */
import type { FieldDef } from "./types";

export interface UnitDef {
  key: string;
  /** Anzeige im Auswahlfeld. */
  label: string;
  sg: string;
  pl: string;
  /** „je …“ (Dativ). */
  per: string;
  /** „jedes verkaufte Stück“ – Ersatz im Fließtext. */
  each: string;
}

export const UNITS: UnitDef[] = [
  { key: "stueck", label: "Stück", sg: "Stück", pl: "Stück", per: "Stück", each: "jedes verkaufte Stück" },
  { key: "stunde", label: "Abrechenbare Stunde", sg: "abrechenbare Stunde", pl: "abrechenbare Stunden", per: "abrechenbarer Stunde", each: "jede abgerechnete Stunde" },
  { key: "auftrag", label: "Auftrag", sg: "Auftrag", pl: "Aufträge", per: "Auftrag", each: "jeder verkaufte Auftrag" },
  { key: "paket", label: "Paket", sg: "Paket", pl: "Pakete", per: "Paket", each: "jedes verkaufte Paket" },
  { key: "einheit", label: "Einheit (allgemein)", sg: "Einheit", pl: "Einheiten", per: "Einheit", each: "jede verkaufte Einheit" },
];
export const UNIT_BY_KEY: Record<string, UnitDef> = Object.fromEntries(UNITS.map((u) => [u.key, u]));
export const UNIT_KEY = "einheit";
export const DEFAULT_UNIT = UNITS[0];

export const unitField = (): FieldDef => ({
  key: UNIT_KEY,
  label: "Einheit der Menge",
  type: "select",
  options: UNITS.map((u) => ({ value: u.key, label: u.label })),
  defaultValue: "stueck",
  help: "Was du verkaufst. Bezeichnungen, Einheiten und Grafiken passen sich an; gerechnet wird gleich.",
});

export const unitOf = (choices: Record<string, string> | undefined): UnitDef => UNIT_BY_KEY[choices?.[UNIT_KEY] ?? ""] ?? DEFAULT_UNIT;

/** Passt Fachwörter an die Einheit an. Für „Stück“ bleibt der Text unverändert. */
export function localize(text: string, u: UnitDef): string {
  if (u.key === "stueck") return text;
  return text
    .replace(/jedes verkaufte Stück|jedes Stück/g, u.each)
    .replace(/Mindeststückzahl/g, "Mindestmenge")
    .replace(/Stückdeckungsbeitrag/g, `Deckungsbeitrag je ${u.per}`)
    .replace(/Stückkosten/g, `Kosten je ${u.per}`)
    .replace(/Stückzahl/g, "Menge")
    .replace(/(je|pro) Stück/g, `je ${u.per}`)
    .replace(/(\d[\d.,]*) Stück/g, (_m, n: string) => `${n} ${n === "1" ? u.sg : u.pl}`)
    .replace(/ganze Stück/g, `ganze ${u.pl}`)
    .replace(/Stück/g, u.pl);
}

/** Wendet `localize` auf alle Texte einer Struktur an (Ergebnisse, Grafikdaten). Funktionen und Zahlen bleiben unberührt. */
export function localizeDeep<T>(v: T, u: UnitDef): T {
  if (u.key === "stueck") return v;
  const walk = (x: unknown): unknown => {
    if (typeof x === "string") return localize(x, u);
    if (Array.isArray(x)) return x.map(walk);
    if (x && typeof x === "object") {
      const proto = Object.getPrototypeOf(x);
      if (proto !== Object.prototype && proto !== null) return x; // Decimal u. Ä. nicht anfassen
      return Object.fromEntries(Object.entries(x as Record<string, unknown>).map(([k, val]) => [k, walk(val)]));
    }
    return x;
  };
  return walk(v) as T;
}
