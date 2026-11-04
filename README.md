# KPILot

**Orientierung durch Kennzahlen** – Prozente, Kosten und Kennzahlen einfach verstehen und berechnen.

Markenname, Claim und Kurzbeschreibung stehen zentral in `src/config/site.ts`. Der Projektordner heißt aus historischen Gründen weiterhin `klarrechnen`. Lokale Speicherschlüssel (`kr.*`) wurden bewusst nicht umbenannt, damit Favoriten und gespeicherte Rechnungen erhalten bleiben.

Statische, deutschsprachige Website mit 40 Rechnern in sechs Kategorien: kurze Erklärung, eigene Erklärillustration, Rechner mit Rechenweg, Favoriten, gespeicherte Rechnungen, Werteübernahme und Szenariovergleich. Alle Berechnungen laufen deterministisch im Browser. Es gibt keine Datenbank, kein Konto, keine KI-Aufrufe und keine Tracking-Skripte.

Technik: Astro 7 (statische Generierung), TypeScript, normales CSS mit Design-Tokens, decimal.js, Vitest.

---

## Schnellstart

```bash
npm install
npm run dev          # Vorschau mit Live-Reload: http://localhost:4321
npm test             # 226 Tests: Formeln, Randfälle, Suche, Speicher, Illustrationen
npm run check        # TypeScript- und Astro-Prüfung
npm run build        # statisches Build nach dist/
npm run check:site   # prüft dist/: Links, Titel, Descriptions, Canonicals, noindex, Sitemap
npm run preview      # fertiges Build lokal ansehen
```

Benötigt Node.js ≥ 22.

## Verzeichnisstruktur

```
src/
  calc/
    modules/<id>.ts     Rechenmodul je Thema: Felder, Varianten, Beispieldaten, Formeln, Randfälle
    engine.ts           Validierung (fehlende Werte ≠ 0) und Ausführung
    types.ts            Typen für Felder, Varianten, Ergebnisse, Werteübernahmen
    all.ts / load.ts    alle Module (Build/Tests) bzw. Einzel-Laden im Browser
  data/
    topics/*.ts         Texte je Thema: Titel, Kurztext, Nutzerfrage, Synonyme, Bildtexte, Formel …
    categories.ts       die sechs Kategorien inkl. „Häufig verwechselt“
    registry.ts         zentrales Rechnerverzeichnis (Reihenfolge 01–40)
  illustrations/        SVG-Erklärbilder (kit.ts = Zeichenwerkzeug, draw-*.ts = Motive)
  lib/
    decimal.ts          zentrale Präzision (40 Stellen, ROUND_HALF_UP)
    number.ts           Eingabe-Parser und deutsche Zahlenformatierung
    search.ts           Katalogsuche
    storage.ts          Favoriten, gespeicherte Rechnungen, Sitzungsdaten (robust)
  components/           Kachel, Stern-Button, Katalog, Rechner, Felder …
  scripts/              Browser-Logik: favorites.ts, calculator.ts, ui.ts
  styles/               tokens.css (Design-Tokens), global.css, components.css
  pages/                Startseite, /rechner/, /kategorie/…, 40 Rechnerseiten, Favoriten, Gespeichert, Über, Impressum, Datenschutz, 404, sitemap.xml, robots.txt, /illustrationen/*.svg
tests/                  Vitest-Tests mit unabhängig festgelegten Erwartungswerten
scripts/check-site.mjs  Prüfung des Builds
docs/                   Formeln, Modellannahmen, Vorlagen, Quellen, Checklisten, Prüfprotokoll
wrangler.jsonc          Cloudflare Pages (Ausgabe dist/)
```

## Design-System

- **Richtung:** kompakter dunkelblauer Markenbereich (`#0B1730`) für Header, Einführung und Seitentitel, mit dezentem Verlauf, feinem Koordinatenraster und Diagrammlinien (`components/BandLines.astro`). Darunter eine helle, blaugraue Arbeitsfläche (`#EEF2F8`) mit weißen Karten, 1-px-Konturen und geschichteten Schatten. Indigo (`#4338CA`) ist die einzige Aktionsfarbe, Türkis (`#0F766E`) wird sparsam eingesetzt.
- **Tokens:** alle Farben, Schriftgrößen, Abstände, Rundungen, Rahmen, Schatten und Übergänge in `src/styles/tokens.css`. Komponenten-Styles in `src/styles/components.css`.
- **Kontraste:** `npm run check:contrast` berechnet alle relevanten Farbpaare (Text ≥ 4,5:1, Bedienelemente und Zustände ≥ 3:1). Bei neuen Farben dort ergänzen.
- **Marke:** Logo „KPILot“ (Rakete über steigenden Balken + Wortmarke) aus der Vorlage `kpilot-logo-v2.png`. Varianten in `public/brand/`: `kpilot-logo.png` (Original für helle Flächen), `kpilot-logo-dark.png` (für den dunklen Markenbereich: Navy → Weiß, Indigo → #A5B4FC, Türkis → #5EEAD4), `kpilot-emblem.png` sowie App-Icons `kpilot-icon-32/180/512.png`. Dazu `public/favicon.ico` und das Social-Bild `public/og-image.png`. Alles wird neu erzeugt mit `powershell -ExecutionPolicy Bypass -File scripts\brand-assets.ps1 -Source <pfad zur Vorlage>`. Eingebunden wird das Logo über `components/Logo.astro` (`variant="dark" | "light"`). Das Symbol-Ensemble auf der Startseite nutzt die Icons `percent`, `calc`, `chart`, `compass` aus `components/Icon.astro`.
- **Bewegung:** Hover hebt Kacheln um höchstens 2 px an. Bei `prefers-reduced-motion` entfallen Übergänge und Bewegung (`--transition`, `--lift`).

## Suche und Kategorien

Logik ohne DOM in `src/lib/catalog-state.ts`, getestet in `tests/catalog-state.test.ts`:

- **Neue oder geänderte Texteingabe** (Tippen, Einfügen, Löschen) durchsucht immer den ganzen Katalog und setzt die Kategorie sichtbar auf „Alle“.
- **Eine danach gewählte Kategorie** grenzt die Treffer ein. Angezeigt wird „Eingegrenzt auf … · n von m Treffern“. Bei null Treffern in der Kategorie, aber globalen Treffern, erscheint „In allen Kategorien suchen“, der Suchbegriff bleibt.
- **Leeren** (✕-Button, Escape oder „Zurücksetzen“) stellt die Standardansicht mit „Alle“ her.
- **Begriffe** (`src/lib/search.ts`): Groß-/Kleinschreibung, Umlaute, Leerzeichen, Bindestriche, Wörter wie „berechnen/Rechner/Berechnung“ (auch angehängt, z. B. „Cashflowrechner“) und einfache Plural- und Umlautvarianten („Deckungsbeiträge“).
- Suche und Filter erzeugen keine URLs. Der Zustand liegt nur für die Sitzung im `sessionStorage`.

## Texte bearbeiten

- **Texte eines Themas** (Kurztext, Nutzerfrage, „Kurz erklärt“, Formel, Missverständnisse, Annahmen, SEO-Titel): `src/data/topics/<kategorie>.ts`.
- **Feldbeschriftungen, Hilfetexte, Einheiten, Ergebnissätze:** im Rechenmodul `src/calc/modules/<id>.ts`.
- **Kategorietexte:** `src/data/categories.ts`.
- **Illustrationen:** `src/illustrations/draw-*.ts`. Beschriftungen sind normaler SVG-Text und direkt im Code korrigierbar.

## Rechnerverzeichnis und Kategorien

Die 40 Themen stehen in `src/data/registry.ts` (Reihenfolge und Texte) und `src/calc/modules/` (Rechenlogik). ID, URL und Kategorie entsprechen dem verbindlichen Register. Die vollständige Liste mit Formeln steht in [`docs/FORMELN.md`](docs/FORMELN.md).

Kategorien: Prozent & Grundlagen · Kostenrechnung & Preise · Finanzen & Liquidität · Marketing & Vertrieb · Produkt & Kunden · Controlling & Planung.

„Empfohlen“ auf der Startseite ist eine redaktionelle Auswahl (`recommended: true` im Thema), keine gemessene Beliebtheit.

## Neuen Rechner ergänzen

Vorlage und Schritt-für-Schritt-Anleitung: [`docs/NEUER-RECHNER.md`](docs/NEUER-RECHNER.md). Kurzfassung:

1. `src/calc/modules/<id>.ts` anlegen: Felder mit Einheit und Grenzen, `example`, `compute()` mit allen Randfällen.
2. Thema in `src/data/topics/<kategorie>.ts` eintragen (ID = Dateiname).
3. Motiv in `src/illustrations/draw-*.ts` ergänzen.
4. Tests mit **unabhängig berechneten** Erwartungswerten schreiben.
5. `npm test && npm run check && npm run build && npm run check:site`

Die Tests prüfen automatisch: genau 40 Module, eindeutige IDs und URLs, gültige Beispiele, existierende verwandte Rechner, höchstens zwei Einstiegssätze und dass jedes Detailbild das Beispielergebnis zeigt. Bei einem 41. Rechner die erwartete Anzahl in `tests/examples.test.ts` und `tests/search-storage.test.ts` anpassen.

## Zahlen und Rundung

- Gerechnet wird mit decimal.js (40 signifikante Stellen), ohne Zwischenrundungen.
- **Eingabe:** `1234`, `1234,56`, `1.234,56`, `1.234.567`. Ein eindeutiger Dezimalpunkt (`1234.5`, `0.123`) wird verstanden. **Mehrdeutig** und daher abgelehnt mit Hinweis: `1.234`, `12.345`. Höchstens 24 Zeichen, 10 Nachkommastellen, Betrag < 10¹⁵. Zwischenzustände wie `12,` oder `-` erzeugen noch keinen Fehler.
- **Ausgabe:** Geld mit 2 Nachkommastellen, Prozent mit bis zu 2, sonst bis zu 4 (ohne Nullen am Ende). Benötigte Stückzahlen werden aufgerundet, Zielpreise auf volle Cent **auf**gerundet. Beides wird zusätzlich gegen die ungerundeten Werte geprüft.
- Nie `NaN`, `Infinity` oder `−0,00`. Sehr kleine Werte ≠ 0 erscheinen mit mehr Stellen oder als `< 0,01 €`.
- Fehlende Angaben sind nie 0. Nicht definierte, unmögliche und mehrdeutige Fälle werden getrennt erklärt.

## Favoriten, Variantenfavoriten und Migration

- Gespeichert in `localStorage` unter `kr.favorites.v1` als `{ v: 1, ids: [...] }`.
- Ein Rechner hat die ID `break-even`, eine konkrete Variante `prozent#prozentsatz` (Rechner-ID + `#` + Varianten-ID). Variantenfavoriten öffnen die Seite mit `#variante`, ohne neue indexierbare URLs.
- Gespeichert werden nur IDs, keine Zahlen. Unbekannte oder beschädigte Einträge werden ignoriert.
- **Migration:** Liegt `kr.favorites.v1` nicht vor, werden ältere Schlüssel (`klarrechnen-favoriten`, `klarrechnen.favorites`, `kr.favorites`) gelesen (Array oder `{ids}`, `:` wird zu `#`) und übernommen. Ändert sich künftig eine ID, eine Zuordnung in `getFavorites()` in `src/lib/storage.ts` ergänzen.
- Synchronisation: alle Sterne einer Seite, über Tabs hinweg (`storage`-Ereignis) und nach dem Zurück-Button.

## Gespeicherte Rechnungen und lokale Daten löschen

- Nur per Klick auf „Rechnung speichern“: Name, Rechner-ID, Varianten-ID, Schema-Version, Zeitpunkt und alle Rohwerte inklusive Auswahlfeldern (Zeitraum, Tagesbasis). Schlüssel `kr.saved.v1`, höchstens 100 Einträge.
- Ansicht `/gespeichert/`: öffnen (`/<rechner>/#gespeichert=<id>`) und einzeln löschen. Bei abweichender Schema-Version erscheint ein Prüfhinweis.
- „Alle lokalen Daten löschen“ mit eigenem Bestätigungsschritt: `/ueber/#daten`.
- Ist kein Speicher verfügbar, wird weitergerechnet, und Speichern wird nie als erfolgreich gemeldet.

## Werteübernahme und Einheiten

Übergänge (nur per Button, nur für die laufende Sitzung in `sessionStorage`):

| Von | Nach | Übernommen |
|---|---|---|
| Deckungsbeitrag | Break-even | Preis, variable Stückkosten |
| Deckungsbeitrag | Gewinn | Preis, variable Stückkosten, ggf. Menge |
| Break-even ↔ Gewinn | | Preis, variable Stückkosten, Fixkosten, Zeitraum |
| EBIT | EBITDA | EBIT, Abschreibungen |
| EBIT | EBIT-Marge | EBIT, Umsatzerlöse |
| CAC | CLV | CAC als optionaler Abzug |

Der Zielrechner zeigt, was übernommen wurde, was noch fehlt und ob der Zeitraum zu prüfen ist. Fehlende Werte werden nie als 0 angenommen. Definiert ist das in `transfers` des jeweiligen Rechenmoduls. Break-even und Gewinn haben zusätzlich einen Szenariovergleich A/B.

## Domain, SEO und Hosting

- **Domain** zentral über die Umgebungsvariable `SITE_URL`:
  ```bash
  SITE_URL=https://www.deine-domain.de npm run build
  ```
  (PowerShell: `$env:SITE_URL='https://www.deine-domain.de'; npm run build`)
- **Ohne `SITE_URL` (Vorschaumodus):** alle Seiten `noindex`, keine Canonicals, kein JSON-LD mit Domain, leere Sitemap. Es gibt keine erfundene Domain.
- **Mit `SITE_URL`:** 49 indexierbare Seiten (Start, Katalog, Über, 6 Kategorien, 40 Rechner) mit Canonical, Open Graph, JSON-LD (WebSite, WebPage, BreadcrumbList) und Sitemap. Favoriten, Gespeichert, Impressum, Datenschutz und 404 bleiben `noindex`.
- `robots.txt` erlaubt das Crawling, damit `noindex` gelesen wird, und nennt in Produktion die Sitemap.

### Veröffentlichen auf Cloudflare Pages

Das Pages-Projekt `kpilot` ist mit dem GitHub-Repository verbunden und baut bei jedem Push auf `main` neu. `wrangler.jsonc` legt `dist/` als Ausgabeordner fest, `.node-version` die Node-Version im Build. Pages liefert `404.html` mit echtem 404-Status aus und `/pfad/` passend zu den Canonicals.

Einstellungen im Pages-Projekt (Einstellungen → Build):

- Framework-Voreinstellung: Astro (oder keine)
- Build-Befehl: `npm run build`
- Build-Ausgabeverzeichnis: `dist`
- Umgebungsvariable `SITE_URL=https://www.deine-domain.de`, sobald die Domain feststeht (ohne sie bleibt die Seite noindex)

Manuell ohne GitHub: `npx wrangler login`, dann `npm run deploy`. Die eigene Domain verbindest du unter Workers und Pages → kpilot → Benutzerdefinierte Domains. Das Build in `dist/` ist portabel und läuft auch auf jedem anderen statischen Hoster.

### Google Search Console

1. In der Search Console „Property hinzufügen“ → Domain-Property → den angezeigten DNS-TXT-Eintrag bei Cloudflare DNS anlegen.
2. Nach der Bestätigung: Sitemaps → `https://www.deine-domain.de/sitemap.xml` einreichen.
3. Mit der URL-Prüfung Startseite und einen Rechner testen („Live-URL testen“).
4. Indexierung ist nicht garantiert. Es werden keine Rich Results versprochen.

## Weitere Dokumente

- [`docs/FORMELN.md`](docs/FORMELN.md): Formeln, Variablen und Beispielrechnung aller 40 Themen (aus dem Code erzeugt)
- [`docs/MODELLANNAHMEN.md`](docs/MODELLANNAHMEN.md): Annahmen und typische Missverständnisse je Thema
- [`docs/NEUER-RECHNER.md`](docs/NEUER-RECHNER.md): Vorlage für neue Rechner und Anleitung für Erklärillustrationen
- [`docs/QUELLEN.md`](docs/QUELLEN.md): fachliche Referenzquellen
- [`docs/VEROEFFENTLICHUNG.md`](docs/VEROEFFENTLICHUNG.md): Checkliste und fehlende Betreiberangaben
- [`docs/PRUEFUNGEN.md`](docs/PRUEFUNGEN.md): durchgeführte und nicht ausführbare Prüfungen
