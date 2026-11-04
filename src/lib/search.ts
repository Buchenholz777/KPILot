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
