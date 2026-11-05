/**
 * Schlanke, einwilligungsabhängige Erfolgsmessung (siehe docs/MESSKONZEPT.md).
 *
 * Grundsätze:
 *  - Es wird nur gesendet, wenn die Einwilligung „granted“ vorliegt und gtag.js geladen wurde.
 *  - Übertragen werden ausschließlich: Ereignisname, Rechnerkennung (Slug-ID), Rechenmodus-ID, Aufgaben-ID.
 *    Niemals Zahlen, Suchtexte, Projektnamen, Notizen oder importierte Inhalte.
 *  - Jedes Ereignis zählt je Seitenaufruf, Rechner und Modus höchstens einmal – nicht je Tastendruck oder Neuberechnung.
 */
import { getConsent } from "./storage";

export type EventName =
  /** Ein Aufgabeneinstieg (Startseite) wurde gewählt. */
  | "task_selected"
  /** In einem Rechner wurde erstmals ein Wert eingegeben (nicht schon der Seitenaufruf). */
  | "calc_started"
  /** Erstmals ein gültiges Ergebnis (Status ok) erreicht. */
  | "calc_result"
  /** Eine Suche ohne Treffer (ohne Suchtext). */
  | "search_no_results"
  /** Der A/B-Szenariovergleich enthielt erstmals zwei auswertbare Szenarien. */
  | "scenario_used"
  /** Werte wurden per Button an einen anderen Rechner übergeben. */
  | "values_transferred"
  /** Eine Berechnung wurde ausdrücklich gespeichert. */
  | "calc_saved"
  /** Eine gespeicherte Berechnung wurde wieder geöffnet. */
  | "saved_reopened";

export interface EventParams {
  calc?: string;
  variant?: string;
  task?: string;
}

const ID = /^[a-z0-9-]{1,60}$/;
const ALLOWED: (keyof EventParams)[] = ["calc", "variant", "task"];

type Sender = (name: string, params: Record<string, string>) => void;

let ready = false;
let sender: Sender | null = null;
const seen = new Set<string>();

/** Nach dem Laden von gtag.js (nur nach Einwilligung) aufrufen. */
export function enableAnalytics(send?: Sender) {
  ready = true;
  sender =
    send ??
    ((name, params) => {
      window.gtag?.("event", name, params);
    });
}
export function disableAnalytics() {
  ready = false;
  sender = null;
}

/** Nur für Tests. */
export function resetAnalyticsForTests() {
  ready = false;
  sender = null;
  seen.clear();
}

/** Bereinigt Parameter: nur erlaubte Schlüssel, nur Kennungen aus [a-z0-9-]. */
export function cleanParams(p: EventParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ALLOWED) {
    const v = p[k];
    if (typeof v === "string" && ID.test(v)) out[k] = v;
  }
  return out;
}

/**
 * Meldet ein Ereignis. Gibt true zurück, wenn es tatsächlich gesendet wurde.
 * Doppelte Ereignisse (gleicher Name, Rechner, Modus, Aufgabe) werden je Seitenaufruf unterdrückt.
 */
export function track(name: EventName, params: EventParams = {}): boolean {
  if (!ready || !sender || getConsent() !== "granted") return false;
  const clean = cleanParams(params);
  const key = [name, clean.calc, clean.variant, clean.task].join("|");
  if (seen.has(key)) return false;
  seen.add(key);
  try {
    sender(name, clean);
  } catch {
    /* Messung darf nie die Anwendung stören */
  }
  return true;
}
