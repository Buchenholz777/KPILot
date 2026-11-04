# Neuen Rechner ergänzen

## 1. Rechenmodul – `src/calc/modules/<id>.ts`

Die Dateiname muss der ID entsprechen (Kleinbuchstaben, Ziffern, Bindestrich).

```ts
import type { CalcDef } from '../types';
import { val, out, eur, pct, undef } from '../helpers';

const def: CalcDef = {
  id: 'beispiel-quote',
  schema: 1, // erhöhen, wenn sich Felder so ändern, dass alte gespeicherte Rechnungen nicht mehr passen
  variants: [
    {
      id: 'standard',
      label: 'Beispielquote',
      favLabel: 'Beispielquote berechnen',
      fields: [
        { key: 'teil', label: 'Teilbetrag', unit: '€', min: 'nonneg', help: 'Kurze Erklärung des Fachbegriffs' },
        { key: 'ganzes', label: 'Gesamtbetrag', unit: '€', min: 'nonneg' },
      ],
      // Dieselben Werte nutzen „Beispiel einsetzen“, der Abschnitt „Beispiel und Rechenweg“ und das Bild
      example: { teil: '25', ganzes: '100' },
      compute(i) {
        const t = val(i, 'teil'), g = val(i, 'ganzes');
        if (g.isZero()) return undef('Bei einem Gesamtbetrag von 0 € ist die Quote nicht definiert.');
        const q = t.div(g).mul(100); // keine Zwischenrundung
        return {
          status: 'ok',
          main: out('Quote', q, 'percent'),
          meaning: `${pct(q)} des Gesamtbetrags entfallen auf den Teil.`,
          steps: [`Quote = Teil / Ganzes × 100 = ${eur(t)} / ${eur(g)} × 100 = ${pct(q)}`],
          notes: ['Interpretationsgrenze knapp neben dem Ergebnis.'],
        };
      },
    },
  ],
};
export default def;
```

Feldregeln: `min: 'nonneg' | 'positive' | 'any'`, `integer` für echte Zählgrößen (Stück, Personen, Ereignisse), `max`/`maxExclusive`, `optional`, `type: 'select'` mit `options` und `defaultValue`. Für Tabellen mit Zeilen gibt es `rows` (siehe `durchschnitt.ts`, `mrr.ts`).

Ergebnisarten: `ok` · `undefined` (z. B. Division durch 0) · `impossible` (keine Lösung im Modell) · `ambiguous` (nicht eindeutig) · `invalid` (fachlich unzulässige Kombination mit `fieldErrors`). Teilergebnisse gehen in `partial`.

## 2. Thema – `src/data/topics/<kategorie>.ts`

Neuen Eintrag mit derselben `id` anlegen: `slug` (URL), `title`, ggf. `abbr`/`fullTerm`, `short` (1–2 Sätze), `question`, `intro` (höchstens 2 Sätze), `synonyms` (Abkürzungen, Alltagsfragen), `image` (`alt`, `caption`, `description`), `formula`, `variables`, `interpretation`, `misconceptions`, `assumptions`, `related`, `seoTitle`, `seoDescription`, optional `sources`.

## 3. Erklärillustration – `src/illustrations/draw-*.ts`

Im passenden Objekt eine Funktion `'<id>': (d) => …` ergänzen. Es wird im Raster **320 × 180** gezeichnet:

- `d = false` ist die Kachelversion: nur Hauptbeschriftungen, Schrift ab 11, wenige Elemente.
- `d = true` ist die Detailversion: zusätzlich Rechenhinweise und Nebenbeschriftungen (Schrift ab 9) über `D(d, …)`.
- Werkzeuge aus `kit.ts`: `R` (Rechteck), `T` (Text), `L` (Linie, mit `arrow`), `P` (Pfad), `circle`, `person`, `bracket` (Klammer mit Beschriftung), `check`/`cross`, `HATCH.*` (Schraffur).

Regeln:

- Die Zahlen müssen exakt dem `example` des Moduls entsprechen. Der Test prüft, ob das Hauptergebnis im Detailbild vorkommt.
- Bei quantitativen Vergleichen maßstäblich zeichnen. Schemaskizzen ohne Maßstab ausdrücklich beschriften.
- Farbe immer durch Schraffur, Symbol oder Text ergänzen.
- Ergebnisgrößen (EBIT, EBITDA) nicht als Geldbestand zeigen, Umsatz nicht als Gewinn.
- Oben rechts bleibt der Bereich für den automatischen Hinweis „Beispiel“ frei (x > 250, y < 22).
- Kontrolle: `npm run dev` öffnen, dann `/illustrationen/<id>.svg` und `/illustrationen/<id>-kachel.svg` ansehen.

## 4. Tests

In `tests/` mit **unabhängig berechneten** Erwartungswerten testen (nicht die Implementierung erneut aufrufen): Beispiel, Randfälle (0, negative Werte, fehlende Angaben, Grenzen) und gegebenenfalls Aufrundungseigenschaften. Danach:

```bash
npm test && npm run check && npm run build && npm run check:site
```

Bei einem 41. Rechner die erwartete Anzahl in `tests/examples.test.ts` und `tests/search-storage.test.ts` anpassen. `docs/FORMELN.md` wird aus dem Code erzeugt und muss danach neu generiert werden (siehe `docs/PRUEFUNGEN.md`).
