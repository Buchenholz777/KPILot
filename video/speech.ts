/**
 * Sprechtext der Erklärvideos: Cue-Text → Teile für die Synthese (video/tts.py).
 * Zentrale Daten: video/voice.config.json (Stimme, Pausen, Tempo, Export) und video/pronunciation.json (Aussprache).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));

export interface VoiceConfig {
  model: string;
  synthesis: { length_scale: number; noise_scale: number; noise_w: number; volume: number };
  pauses: { sentence: number; colon: number; afterResult: number; afterTerm: number };
  timing: { lead: number; gap: number; maxLag: number; softLag: number; softTempo: number; maxTempo: number; endPad: number };
  selection: { candidates: number; termCandidates: number };
  export: { sampleRate: number; loudnormI: number; loudnormTP: number; loudnormLRA: number; highpassHz: number; masterBitrate: string; webBitrate: string };
}
export interface PronEntry { id: string; match: string; ipa: string; asr: string; note?: string }
export type Part = { text: string } | { ipa: string; punct: string; id: string } | { pause: number };

export const CONFIG: VoiceConfig = JSON.parse(readFileSync(resolve(DIR, "voice.config.json"), "utf8"));
export const DICTIONARY: PronEntry[] = JSON.parse(readFileSync(resolve(DIR, "pronunciation.json"), "utf8")).entries;

/** Ordinalzahlen, die die Stimme sonst als Kardinalzahl plus Satzende liest. */
const ORDINALS: [RegExp, string][] = [
  [/\bdem 150\. /g, "dem hundertfünfzigsten "],
  [/\bdas 151\. /g, "das hunderteinundfünfzigste "],
  [/\b1\. Grades\b/g, "ersten Grades"],
  [/\b2\. Grades\b/g, "zweiten Grades"],
  [/\b3\. Grades\b/g, "dritten Grades"],
];

const TERM_RE = new RegExp(`(${DICTIONARY.map((e) => `(?:${e.match})`).join("|")})(-?)([.,:;!?]?)`, "g");
const entryFor = (word: string) => DICTIONARY.find((e) => new RegExp(`^(?:${e.match})$`).test(word))!;

/** Cue-Text → lesbarer Sprechtext (Ordinalzahlen ausgeschrieben, Gedankenstrich als Komma); Fachbegriffe bleiben stehen. */
export function speechText(text: string): string {
  let s = text;
  for (const [re, rep] of ORDINALS) s = s.replace(re, rep);
  return s.replace(/\s+–\s+/g, ", ").replace(/ /g, " ");
}

const RESULT_END = /\d[\d.,]*(\s?(€|%|Stück|Jahre|Jahren|Cent|Euro))?[.!?]$/;

/** Teilt Text an Satzenden und Doppelpunkten auf und fügt die konfigurierten Pausen ein. */
function withPauses(text: string, last: boolean): Part[] {
  const out: Part[] = [];
  const pieces = text.split(/(?<=[.!?:])\s+(?=\S)/);
  pieces.forEach((piece, i) => {
    const t = piece.trim();
    if (t) out.push({ text: t });
    if (i < pieces.length - 1 || !last) {
      const end = t.slice(-1);
      if (i === pieces.length - 1 && !last && !/[.!?:]$/.test(t)) return;
      out.push({ pause: end === ":" ? CONFIG.pauses.colon : RESULT_END.test(t) ? CONFIG.pauses.afterResult : CONFIG.pauses.sentence });
    }
  });
  return out;
}

/** Sprechtext → Teile: deutscher Text, Wörterbuch-Aussprache (englische IPA), Pausen. */
export function speechParts(cue: string): Part[] {
  const s = speechText(cue);
  const parts: Part[] = [];
  let pos = 0;
  const pushText = (t: string, last: boolean) => {
    for (const p of withPauses(t.replace(/^[\s-]+/, ""), last)) parts.push(p);
  };
  for (const m of s.matchAll(TERM_RE)) {
    const before = s.slice(pos, m.index);
    if (before.trim()) pushText(before, false);
    const e = entryFor(m[1]);
    parts.push({ ipa: e.ipa, punct: m[3] ?? "", id: e.id });
    if (m[3] === ":" ) parts.push({ pause: CONFIG.pauses.colon });
    pos = m.index! + m[0].length;
  }
  const rest = s.slice(pos);
  if (rest.trim()) pushText(rest, true);
  // doppelte/nachlaufende Pausen bereinigen
  const clean: Part[] = [];
  for (const p of parts) {
    const prev = clean[clean.length - 1];
    if ("pause" in p && prev && "pause" in prev) prev.pause = Math.max(prev.pause, p.pause);
    else clean.push(p);
  }
  while (clean.length && "pause" in clean[clean.length - 1]) clean.pop();
  return clean;
}

/** Erwartete Erkennung eines Satzes (Fachbegriffe als §id), Grundlage der Aufnahmeauswahl in tts.py. */
export function expectText(parts: Part[]): string {
  return parts.map((p) => ("text" in p ? p.text : "ipa" in p ? `§${p.id}${p.punct}` : "")).filter(Boolean).join(" ");
}
