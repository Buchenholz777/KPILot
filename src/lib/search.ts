/** Suchindex-Eintrag (wird als JSON in die Seite eingebettet). */
export interface SearchEntry {
  id: string;
  category: string;
  /** Titel, Abkürzung, Fachbegriff – stärker gewichtet. */
  t: string;
  /** Synonyme, Nutzerfrage, Kurztext, Kategorie. */
  s: string;
}

/** Füllwörter und Wörter, die nur „rechnen“ bedeuten und nichts eingrenzen. */
const STOP = new Set(
  (
    "was wie wieviel viel viele ist sind der die das den dem des ein eine einen einem einer darf kann soll muss vom von auf mit " +
    "mein meine meinen meiner ich mir mich wir und oder im in zu zum zur fur fuer bei es sein hat habe wird noch " +
    "berechnen berechne berechnet berechnung berechnungen rechner rechnern rechnen rechnung ausrechnen ermitteln ermittlung " +
    "kalkulator calculator calc online tool formel kostenlos"
  ).split(" "),
);

/** Endungen, die an zusammengeschriebene Suchwörter angehängt werden („cashflowrechner“). */
const ACTION_SUFFIX = /(berechnungen|berechnung|berechnen|rechner|rechnung)$/;

/** Kleinschreibung, Umlaute vereinheitlichen, Bindestriche/Satzzeichen → Leerzeichen. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

export function tokens(q: string): string[] {
  const all = normalize(q)
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      const stripped = w.replace(ACTION_SUFFIX, "");
      return stripped.length >= 3 && stripped !== w ? stripped : w;
    });
  const sig = all.filter((w) => !STOP.has(w));
  return sig.length ? sig : all;
}

/** Einfache Wortvarianten: Plural- und Beugungsendungen kappen. */
function variants(tok: string): string[] {
  const out = [tok];
  for (const end of ["en", "er", "es", "e", "n", "s"]) {
    if (tok.length - end.length >= 4 && tok.endsWith(end))
      out.push(tok.slice(0, -end.length));
  }
  // Umlaut-Plural: „beitraege“ → „beitrag“, „spannen“ bleibt unberührt
  for (const v of [...out]) {
    const plain = v.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
    if (plain !== v && plain.length >= 4) out.push(plain);
  }
  return out;
}

function wordMatch(hayWords: string[], hay: string, tok: string): boolean {
  return variants(tok).some(
    (v) =>
      hayWords.some((w) => w.startsWith(v)) ||
      // Teilwörter in Komposita, z. B. „schwelle“ in „gewinnschwelle“
      (v.length >= 5 && hay.includes(v)),
  );
}

/**
 * Durchsucht den vollständigen Katalog. Ein Eintrag passt, wenn jedes
 * bedeutungstragende Suchwort in Titel oder Suchbegriffen vorkommt.
 * Rückgabe: IDs nach Relevanz.
 */
export function search(query: string, entries: SearchEntry[]): string[] {
  const toks = tokens(query);
  if (!toks.length) return entries.map((e) => e.id);
  const phrase = toks.join(" ");
  const scored: { id: string; score: number; i: number }[] = [];
  entries.forEach((e, i) => {
    const t = normalize(e.t),
      s = normalize(e.s);
    const tw = t.split(" "),
      sw = s.split(" ");
    let score = 0;
    for (const tok of toks) {
      if (wordMatch(tw, t, tok)) score += tw.includes(tok) ? 6 : 4;
      else if (wordMatch(sw, s, tok)) score += sw.includes(tok) ? 2 : 1;
      else return;
    }
    if (phrase.length > 3 && (t.includes(phrase) || s.includes(phrase)))
      score += 5;
    if (t === phrase || tw[0] === phrase) score += 10;
    scored.push({ id: e.id, score, i });
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((x) => x.id);
}

/* ---------------- Fehlertolerante Suche ---------------- */

/** Optimal-String-Alignment-Abstand: Einfügen, Löschen, Ersetzen und Vertauschen benachbarter Buchstaben kosten je 1. */
export function osaDistance(a: string, b: string): number {
  const n = a.length,
    m = b.length;
  if (!n) return m;
  if (!m) return n;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => {
    const row = new Array<number>(m + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[n][m];
}

interface VocabWord {
  norm: string;
  display: string;
  /** Titelwörter vor Synonymen. */
  rank: number;
}
const vocabCache = new WeakMap<SearchEntry[], VocabWord[]>();

function vocabulary(entries: SearchEntry[]): VocabWord[] {
  const hit = vocabCache.get(entries);
  if (hit) return hit;
  const map = new Map<string, VocabWord>();
  const add = (text: string, rank: number) => {
    for (const raw of text.split(/[\s·,;:/()?!„“"']+/)) {
      const display = raw.replace(/^[-–]+|[-–]+$/g, "");
      const norm = normalize(display);
      if (norm.length < 5 || norm.includes(" ")) continue;
      if (STOP.has(norm)) continue;
      const known = map.get(norm);
      if (!known || rank < known.rank) map.set(norm, { norm, display, rank });
    }
  };
  for (const e of entries) {
    add(e.t, 0);
    add(e.s, 1);
  }
  const list = [...map.values()];
  vocabCache.set(entries, list);
  return list;
}

/** Erlaubter Abstand je Wortlänge: kurze Wörter bleiben streng, um falsche Vorschläge zu vermeiden. */
const maxDistance = (len: number) => (len < 5 ? 0 : len < 10 ? 1 : 2);

function distanceToWord(tok: string, w: string): number {
  // Tippfehler am Wortanfang eines längeren Wortes („deckungsbeitar“) gelten ebenfalls
  return Math.min(osaDistance(tok, w), osaDistance(tok, w.slice(0, tok.length)));
}

export interface SearchOutcome {
  ids: string[];
  /** Vorschlag in Schreibweise der Katalogbegriffe, z. B. „Deckungsbeitrag“. */
  suggestion?: string;
  /** Die Treffer stammen aus dem korrigierten Suchbegriff, nicht aus dem eingegebenen. */
  fuzzy: boolean;
}

/**
 * Suche mit Tippfehlertoleranz. Exakte Treffer haben immer Vorrang: Nur wenn die normale Suche nichts findet,
 * werden unbekannte Wörter durch das nächstliegende Katalogwort ersetzt (z. B. Buchstabendreher). Ein Vorschlag erscheint
 * nur, wenn der korrigierte Begriff tatsächlich Treffer liefert.
 */
export function searchWithSuggestion(
  query: string,
  entries: SearchEntry[],
): SearchOutcome {
  const exact = search(query, entries);
  const toks = tokens(query);
  if (!toks.length || exact.length) return { ids: exact, fuzzy: false };

  const vocab = vocabulary(entries);
  const corrected: string[] = [];
  const shown: string[] = [];
  let changed = false;
  for (const tok of toks) {
    const known = entries.some((e) => {
      const t = normalize(e.t),
        s = normalize(e.s);
      return wordMatch(t.split(" "), t, tok) || wordMatch(s.split(" "), s, tok);
    });
    if (known || tok.length < 5) {
      corrected.push(tok);
      shown.push(tok);
      continue;
    }
    const limit = maxDistance(tok.length);
    let best: { w: VocabWord; d: number } | undefined;
    for (const w of vocab) {
      if (Math.abs(w.norm.length - tok.length) > limit + 3) continue;
      const d = distanceToWord(tok, w.norm);
      if (d > limit) continue;
      if (!best || d < best.d || (d === best.d && w.rank < best.w.rank))
        best = { w, d };
    }
    if (!best) return { ids: [], fuzzy: false };
    changed = true;
    corrected.push(best.w.norm);
    shown.push(best.w.display);
  }
  if (!changed) return { ids: [], fuzzy: false };
  const ids = search(corrected.join(" "), entries);
  if (!ids.length) return { ids: [], fuzzy: false };
  return { ids, suggestion: shown.join(" "), fuzzy: true };
}
