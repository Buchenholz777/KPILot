/**
 * Hörproben für die Fachbegriffe des Aussprachewörterbuchs (video/pronunciation.json).
 *
 *   node video/pronounce-test.ts [ausgabeverzeichnis]      # Standard: docs/audio/aussprache
 *
 * Je Eintrag: ein Trägersatz in deutscher Umgebung (so klingt der Begriff im Video) und der Begriff einzeln.
 * Dazu eine Gesamtdatei „alle.wav“ (alle Sätze mit Pausen). Mit video/voice-eval.py lassen sich die Proben
 * automatisch erkennen (Spracherkennung) – das ersetzt kein Anhören.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DICTIONARY, speechParts } from "./speech.ts";
import { synthesize } from "./voice.ts";

/** Beispielsätze je Wörterbuch-Eintrag (so oder ähnlich kommen sie in den Videos vor). */
export const SAMPLES: Record<string, string> = {
  "return-on-investment": "Der Return on Investment misst den Erfolg einer Investition.",
  "key-performance-indicator": "Ein Key Performance Indicator ist eine Kennzahl.",
  "operating-cashflow": "Der Operating Cashflow zeigt den Geldfluss aus dem laufenden Geschäft.",
  "break-even-point": "Am Break-even-Point ist der Gewinn genau null.",
  "break-even": "Das ist die Break-even-Menge.",
  cashflow: "Der Cashflow zählt nur echtes Geld.",
  "conversion-rate": "Die Conversion Rate beträgt 2,5 %.",
  revenue: "Der Revenue ist der Umsatz.",
  ebitda: "EBITDA rechnet die Abschreibung wieder dazu.",
  ebit: "EBIT ist das Ergebnis vor Zinsen und Steuern.",
  roas: "Ein ROAS von 4 klingt gut.",
  roi: "Der ROI beträgt 10 %.",
  clv: "240 € CLV, 100 € CAC.",
  cac: "CAC: Kosten je neuem Kunden.",
  kpi: "Jede KPI braucht eine klare Definition.",
  kpilot: "Rechne jetzt mit deinen eigenen Zahlen – im Rechner von KPILot.",
  onlineshop: "Kalles Onlineshop hatte 1.000 Besuche.",
};
/** Deutsche Fachwörter, die die Standardphonemisierung treffen soll (Kontrolle). */
export const GERMAN_CHECK = ["Deckungsbeitrag", "Marge", "Aufschlag", "Rohertrag", "Fixkosten", "Liquiditätsgrade", "Abschreibung", "Kapitalwert"];

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const out = resolve(process.argv[2] ?? "docs/audio/aussprache");
  mkdirSync(out, { recursive: true });
  const items = [
    ...DICTIONARY.filter((e) => SAMPLES[e.id]).map((e) => ({ out: resolve(out, `${e.id}.wav`), parts: speechParts(SAMPLES[e.id]) })),
    ...GERMAN_CHECK.map((w) => ({ out: resolve(out, `de-${w}.wav`), parts: speechParts(`Das Wort lautet ${w}.`) })),
  ];
  synthesize(items);
  writeFileSync(resolve(out, "proben.json"), JSON.stringify(Object.fromEntries([...DICTIONARY.filter((e) => SAMPLES[e.id]).map((e) => [`${e.id}.wav`, SAMPLES[e.id]]), ...GERMAN_CHECK.map((w) => [`de-${w}.wav`, `Das Wort lautet ${w}.`])]), null, 1));
  console.log(`${items.length} Hörproben in ${out}`);
}
