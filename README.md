# KPILot

**Orientierung durch Kennzahlen** – Prozente, Kosten und Kennzahlen einfach verstehen und berechnen.

Markenname, Claim und Kurzbeschreibung stehen zentral in `src/config/site.ts`. Der Projektordner heißt aus historischen Gründen weiterhin `klarrechnen`. Lokale Speicherschlüssel (`kr.*`) wurden bewusst nicht umbenannt, damit Favoriten und gespeicherte Rechnungen erhalten bleiben.

Statische, deutschsprachige Website mit 41 Rechnern in sechs Kategorien (die Zahl ergibt sich aus dem Register `src/data/registry.ts`; Anwendungsfälle zählen nicht mit): kurze Erklärung, eigene Erklärillustration, Rechner mit Rechenweg, Ergebnis in drei Ebenen, Folgeaktionen, Favoriten, zuletzt genutzte Rechner, „Meine Berechnungen“ (Vorschau, Notizen, Vorhaben, Papierkorb, Sicherung), Werteübernahme und Szenariovergleich. Dazu fünf Aufgabeneinstiege, der geführte Ablauf „Preis & Wirtschaftlichkeit“, Praxisfälle (aus einer gemeinsamen Falldatenquelle `src/data/cases.ts`) und Lernseiten. Alle Berechnungen laufen deterministisch im Browser. Es gibt keine Datenbank, kein Konto, keine KI-Aufrufe und keine Werbeskripte. Eine Nutzungsmessung mit Google Analytics läuft ausschließlich nach Einwilligung (`docs/MESSKONZEPT.md`).

Technik: Astro 7 (statische Generierung), TypeScript, normales CSS mit Design-Tokens, decimal.js, Vitest.

---

## Schnellstart

```bash
npm install
npm run dev          # Vorschau mit Live-Reload: http://localhost:4321
npm test             # Formeln, Randfälle, Suche, Arbeitsbereich, Sicherung, Ablauf, Praxisfälle, Messung
npm run check        # TypeScript- und Astro-Prüfung
npm run build        # statisches Build nach dist/
npm run check:site   # prüft dist/: Links, Titel, Descriptions, Canonicals, noindex, Sitemap
npm run preview      # fertiges Build lokal ansehen
NODE_PATH=$(npm root -g) node scripts/e2e-smoke.mjs   # Browserprüfung der Nutzerwege (Playwright, Preview muss laufen)
NODE_PATH=$(npm root -g) node scripts/e2e-charts.mjs  # alle Rechner und Modi: Grafik, kein NaN, kein Überlauf (Desktop + 375 px)
```

Benötigt Node.js ≥ 22.

## Verzeichnisstruktur

```
src/
  calc/
    modules/<id>.ts     Rechenmodul je Thema: Felder, Varianten, Beispieldaten, Formeln, Randfälle
    engine.ts           Validierung (fehlende Werte ≠ 0) und Ausführung
    types.ts            Typen für Felder, Varianten, Ergebnisse, Werteübernahmen, Folgeaktionen
    scenario.ts         A/B-Vergleich mit Zeitraumregel · workflow.ts: Ablauf „Preis & Wirtschaftlichkeit“
    all.ts / load.ts    alle Module (Build/Tests) bzw. Einzel-Laden im Browser
  config/operator.ts    Betreiberangaben mit Bestätigungsflags (Impressum, Datenschutz, Rückmeldung)
  data/
    tasks.ts            fünf Aufgabeneinstiege · cases.ts: Praxisfälle (Handel, Dienstleistung, Produktion, Werbung) mit Rechentext, Tabellen und Übernahmen aus denselben Falldaten · field-guides.ts: Eingabehilfen
    topics/*.ts         Texte je Thema: Titel, Kurztext, Nutzerfrage, Synonyme, Bildtexte, Formel …
    categories.ts       die sechs Kategorien inkl. „Häufig verwechselt“
    registry.ts         zentrales Rechnerverzeichnis (Reihenfolge 01–40)
  illustrations/        SVG-Erklärbilder (kit.ts = Zeichenwerkzeug, draw-*.ts = Motive)
  lib/
    decimal.ts          zentrale Präzision (40 Stellen, ROUND_HALF_UP)
    number.ts           Eingabe-Parser und deutsche Zahlenformatierung
    search.ts           Katalogsuche inkl. Tippfehlertoleranz („Meintest du …?“)
    workspace.ts        Meine Berechnungen (v2), Vorhaben, Papierkorb, Sicherung/Import, zuletzt genutzt, Einstellungen
    analytics.ts        einwilligungsabhängige Erfolgsmessung (nur Kennungen)
    storage.ts          Speicher-Grundlagen, Favoriten, Einwilligung, Sitzungsdaten (robust)
  components/           Kachel, Stern-Button, Katalog, Rechner, Felder …
  scripts/              Browser-Logik: favorites.ts, calculator.ts, ui.ts
  styles/               tokens.css (Design-Tokens), global.css, components.css
  pages/                Startseite, /rechner/, /kategorie/…, 41 Rechnerseiten, Aufgaben, Ablauf, Lernseiten, Praxisfälle, Favoriten, Meine Berechnungen (+ Zusammenfassung), Über, Impressum, Datenschutz, 404, sitemap.xml, robots.txt, /illustrationen/*.svg
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

Die 41 Themen stehen in `src/data/registry.ts` (Reihenfolge und Texte) und `src/calc/modules/` (Rechenlogik). ID, URL und Kategorie entsprechen dem verbindlichen Register. Die vollständige Liste mit Formeln steht in [`docs/FORMELN.md`](docs/FORMELN.md).

Kategorien: Prozent & Grundlagen · Kostenrechnung & Preise · Finanzen & Liquidität · Marketing & Vertrieb · Produkt & Kunden · Controlling & Planung.

Die Startseite zeigt standardmäßig den **vollständigen Katalog** (alle Rechner aus `src/data/registry.ts`, ohne Aufklappen oder „Mehr anzeigen“); Anzahl und Trefferzahlen werden aus dem Register abgeleitet. Ein neuer Rechner erscheint automatisch dort.

## Mengeneinheit

Break-even, Gewinn, Deckungsbeitrag, der Preisablauf und die Praxisfälle führen die Einheit der Menge mit (Stück, abrechenbare Stunde, Auftrag, Paket, Einheit; `src/calc/units.ts`). Die Rechenmodule formulieren mit „Stück“; `localize` ersetzt Fachwörter nach einer festen Tabelle, Zahlen und Rundung (aufrunden auf ganze Einheiten) bleiben identisch. Die Einheit ist Teil von Übernahmen, Speicherung, Szenariovergleich (gemeinsam) und Grafiken.

## Ergebnisgrafiken

Jeder Rechner und Modus zeigt direkt unter der Hauptzahl „Deine Berechnung als Diagramm“ (aus den aktuellen Eingaben, ohne Klick). Aufbau: Datenaufbereitung `src/calc/charts/<kategorie>.ts` (liefert `ChartSpec`, siehe `src/calc/chart-types.ts`), Zeichnung `src/scripts/charts.ts` (SVG, Tabellenalternative, Punktauswahl per Regler), Einbindung `src/scripts/calculator.ts`. Die Aufbereitung wird je Kategorie erst auf der Rechnerseite nachgeladen (nicht auf der Startseite). Matrix aller Modi: [`docs/DIAGRAMM-MATRIX.md`](docs/DIAGRAMM-MATRIX.md). Neuer Rechner → Eintrag in der passenden Kategoriedatei ergänzen (`tests/charts-data.test.ts` prüft, dass jeder Rechner und Modus eine Grafik liefert).

## Neuen Rechner ergänzen

Vorlage und Schritt-für-Schritt-Anleitung: [`docs/NEUER-RECHNER.md`](docs/NEUER-RECHNER.md). Kurzfassung:

1. `src/calc/modules/<id>.ts` anlegen: Felder mit Einheit und Grenzen, `example`, `compute()` mit allen Randfällen.
2. Thema in `src/data/topics/<kategorie>.ts` eintragen (ID = Dateiname).
3. Motiv in `src/illustrations/draw-*.ts` ergänzen.
4. Tests mit **unabhängig berechneten** Erwartungswerten schreiben.
5. `npm test && npm run check && npm run build && npm run check:site`

Die Tests prüfen automatisch: genau so viele Module wie Themen im Register, eindeutige IDs und URLs, gültige Beispiele, existierende verwandte Rechner, höchstens zwei Einstiegssätze und dass jedes Detailbild das Beispielergebnis zeigt. Bei einem weiteren Rechner die erwartete Anzahl in `tests/examples.test.ts` und `tests/search-storage.test.ts` anpassen; angezeigte Zahlen leiten sich aus dem Register ab.

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

## Meine Berechnungen, Sicherung und lokale Daten

- Gespeichert wird nur nach Klick auf „Speichern“: Name, Rechner-ID, Modus-ID, Schema-Version, Zeitpunkte (gespeichert/geändert), alle Rohwerte inkl. Auswahlfeldern, optionale Notiz und optionales Vorhaben (Projekt). Schlüssel `kr.workspace.v2` (`{ v: 2, items, projects, trash }`), höchstens 100 Berechnungen, 30 Vorhaben, Papierkorb 30 Einträge / 30 Tage.
- **Migration:** Daten aus `kr.saved.v1` (v1) werden beim ersten Lesen verlustfrei nach v2 übernommen; der alte Schlüssel bleibt unverändert als Sicherung liegen. Getestet in `tests/workspace.test.ts`.
- Ansicht `/gespeichert/` („Meine Berechnungen“): Ergebnisvorschau (immer live aus den Eingaben berechnet, nie als alter Wert gespeichert), Umbenennen/Bearbeiten, Duplizieren (eigenständige Kopie), Notizen, Gruppierung nach Vorhaben, Löschen mit „Rückgängig“ (auch per Tastatur) und Papierkorb „Zuletzt gelöscht“, Zusammenfassung je Vorhaben (`/gespeichert/zusammenfassung/#projekt=<id>`, Kopieren und Druckansicht/PDF).
- Rechnerseite: Speicherstatus („gespeichert“ / „Änderungen noch nicht gespeichert“), Öffnen über `/<rechner>/#gespeichert=<id>`.
- **Sicherung:** Datei `kpilot-sicherung-<Datum>.json` (`app: "KPILot"`, `version: 1`) mit Berechnungen, Vorhaben, Notizen, Favoriten – nie mit der Einwilligung. Import mit strukturierter Validierung, Vorschau und Konfliktstrategie (behalten / als Kopie / überschreiben; Überschriebenes landet im Papierkorb). Unbekannte (neuere) Versionen und beschädigte Dateien werden verständlich abgelehnt; importierte Texte werden bereinigt und nur als Text ausgegeben.
- „Zuletzt genutzt“: `kr.recent.v1`, nur Rechner-ID und Zeitpunkt. Ansicht des Katalogs: `kr.prefs.v1`.
- „Alle lokalen Daten löschen“ mit eigenem Bestätigungsschritt: `/ueber/#daten` (behält die Einwilligungsentscheidung).
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
| Rabatt-Mehrabsatz | Gewinn, Deckungsbeitrag | neuer Preis, variable Kosten, ggf. erforderliche Menge |
| ROAS | ROAS-Modus „Werbewirtschaftlichkeit“ (gleiche Seite) | Werbeumsatz, Werbekosten |

Der Zielrechner zeigt, was übernommen wurde, was noch fehlt und ob der Zeitraum zu prüfen ist. Fehlende Werte werden nie als 0 angenommen. Definiert ist das in `transfers` des jeweiligen Rechenmoduls. Break-even, Gewinn, Rabatt-Mehrabsatz, Werbewirtschaftlichkeit und CLV haben zusätzlich einen Szenariovergleich A/B mit **gemeinsamem Betrachtungszeitraum** (keine automatische Umrechnung; unterschiedliche Zeiträume erzeugen keine Differenz). Folgeaktionen beim Ergebnis stehen als `followUps` im Rechenmodul.

## Domain, SEO und Hosting

- **Domain:** `https://www.my-kpilot.de` (`PRODUCTION_URL` in `astro.config.mjs`). Der Cloudflare-Pages-Build des Branches `main` nutzt sie automatisch. Lokal oder für Tests lässt sie sich mit der Umgebungsvariable `SITE_URL` setzen:
  ```bash
  SITE_URL=https://www.deine-domain.de npm run build
  ```
  (PowerShell: `$env:SITE_URL='https://www.deine-domain.de'; npm run build`)
- **Ohne Domain (Vorschaumodus: lokale Builds ohne `SITE_URL`, Cloudflare-Vorschau-Branches):** alle Seiten `noindex`, keine Canonicals, kein JSON-LD mit Domain, leere Sitemap.
- **Mit Domain:** 60 indexierbare Seiten (Start, Katalog, Über, Aufgaben, Ablauf, Lernseiten, Praxisfälle, 6 Kategorien, 41 Rechner) mit Canonical, Open Graph, JSON-LD (WebSite, WebPage, BreadcrumbList) und Sitemap. Favoriten, Meine Berechnungen, Impressum, Datenschutz und 404 bleiben `noindex`.
- `robots.txt` erlaubt das Crawling, damit `noindex` gelesen wird, und nennt in Produktion die Sitemap.

### Veröffentlichen auf Cloudflare Pages

Das Pages-Projekt `kpilot` ist mit dem GitHub-Repository verbunden und baut bei jedem Push auf `main` neu. `wrangler.jsonc` legt `dist/` als Ausgabeordner fest, `.node-version` die Node-Version im Build. Pages liefert `404.html` mit echtem 404-Status aus und `/pfad/` passend zu den Canonicals.

Einstellungen im Pages-Projekt (Einstellungen → Build):

- Framework-Voreinstellung: Astro (oder keine)
- Build-Befehl: `npm run build`
- Build-Ausgabeverzeichnis: `dist`
- Keine Umgebungsvariable nötig: Builds von `main` verwenden automatisch `https://www.my-kpilot.de`

Manuell ohne GitHub: `npx wrangler login`, dann `npm run deploy`. Die eigene Domain verbindest du unter Workers und Pages → kpilot → Benutzerdefinierte Domains. Das Build in `dist/` ist portabel und läuft auch auf jedem anderen statischen Hoster.

### Google Search Console

1. In der Search Console „Property hinzufügen“ → Domain-Property → den angezeigten DNS-TXT-Eintrag bei Cloudflare DNS anlegen.
2. Nach der Bestätigung: Sitemaps → `https://www.deine-domain.de/sitemap.xml` einreichen.
3. Mit der URL-Prüfung Startseite und einen Rechner testen („Live-URL testen“).
4. Indexierung ist nicht garantiert. Es werden keine Rich Results versprochen.

## Weitere Dokumente

- [`docs/FORMELN.md`](docs/FORMELN.md): Formeln, Variablen und Beispielrechnung aller Rechner (aus dem Code erzeugt)
- [`docs/MODELLANNAHMEN.md`](docs/MODELLANNAHMEN.md): Annahmen und typische Missverständnisse je Thema
- [`docs/NEUER-RECHNER.md`](docs/NEUER-RECHNER.md): Vorlage für neue Rechner und Anleitung für Erklärillustrationen
- [`docs/QUELLEN.md`](docs/QUELLEN.md): fachliche Referenzquellen
- [`docs/VEROEFFENTLICHUNG.md`](docs/VEROEFFENTLICHUNG.md): Checkliste und fehlende Betreiberangaben
- [`docs/PRUEFUNGEN.md`](docs/PRUEFUNGEN.md): durchgeführte und nicht ausführbare Prüfungen
