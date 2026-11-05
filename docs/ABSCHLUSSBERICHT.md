# Abschlussbericht der Überarbeitung (05.11.2026)

Branch `claude/lucid-galileo-nauvjo` · **nicht veröffentlicht** (keine ausdrückliche Freigabe) · Ausgangsstand: 258 Tests, jetzt 348.

## 1. Zusammenfassung

Umgesetzt wurden: zentrale Betreiberkonfiguration mit ehrlicher Offen-Liste und einheitlichen Analytics-Aussagen; korrigierte Margenerklärung; A/B-Vergleich mit gemeinsamem Zeitraum und Sperre der Differenz bei ungleichen Zeiträumen; Löschen mit Rückgängig und Papierkorb; fehlertolerante Suche („Meintest du Deckungsbeitrag?“); neue Startseite mit fünf Aufgabeneinstiegen; Katalogansichten „Mit Erklärungen“/„Kompakt“; „Meine Berechnungen“ (Vorschau, Umbenennen, Duplizieren, Notizen, Vorhaben, Papierkorb, Sicherung/Import, Zusammenfassung mit Druckansicht); neues Rechnerlayout mit Ergebnis in drei Ebenen, Folgeaktionen, Kapazitätsabgleich; neuer Rechner „Rabatt: nötiger Mehrabsatz“ (41. Rechner) mit Grafik; ROAS-Modus „Werbewirtschaftlichkeit“ mit Mindest-ROAS; geführter Ablauf „Preis & Wirtschaftlichkeit“; Auswahlhilfe, Lernseite zu Unsicherheit, drei Praxisfälle; Eingabehilfen, Quellen/Stand-Block, Rückmeldung je Rechner; Hilfe/FAQ; einwilligungsabhängige Erfolgsmessung; Mobil- und Zugänglichkeitsprüfung.

## 2. Zuordnung der Abschnitte

| Abschnitt | Status |
|---|---|
| 3.1 Impressum/Datenschutz | **umgesetzt, Prüfung konkret eingeschränkt** – technisch vollständig, Fakten blockiert (siehe `docs/BETREIBER-OFFEN.md`); Entwurfshinweis bleibt absichtlich, bis der Betreiber bestätigt |
| 3.2 Nutzungsmessung/Datenverarbeitung | umgesetzt und geprüft (Browser-Netzwerkprüfung; Texte angeglichen) |
| 4.1 Zeiträume im Vergleich | umgesetzt und geprüft (Tests + Browser) |
| 4.2 Margenerklärung | umgesetzt und geprüft |
| 4.3 Löschen rückgängig | umgesetzt und geprüft (Tastatur im Browser; Text statt nur Farbe) |
| 4.4 Fehlertolerante Suche | umgesetzt und geprüft |
| 5 Startseite, Aufgaben | umgesetzt und geprüft (Aufgabenseiten `/aufgaben/<slug>/`) |
| 6 Ablauf Preis & Wirtschaftlichkeit | umgesetzt und geprüft (Modul-Tests + Browser) |
| 7 Folgeaktionen | umgesetzt und geprüft (Tests für Zuordnung; CLV-Szenario, Kapazitätsabgleich) |
| 8 Rechnerlayout/Ergebnisebenen | umgesetzt und geprüft (Desktop/Mobil per Screenshot und Skript) |
| 9 Katalog, Navigation, leere Zustände, zuletzt genutzt | umgesetzt und geprüft |
| 10.1 Auswahlhilfe · 10.3 Praxisfälle · 10.4 Unsicherheit | umgesetzt und geprüft (Fallzahlen unabhängig getestet) |
| 10.2 Eingabehilfen | **umgesetzt, Abdeckung eingeschränkt** – strukturierte Hilfen für Preis-/Kostenmodell, Marge, Zielpreis, ROAS, Rabatt, CLV, CAC-Neukunden; übrige Rechner haben weiter die kurzen Feldhilfen |
| 10.5 Quellen/Verantwortung | umgesetzt – nur vorhandene Quellen; Verantwortung = Betreiber, Prüfung durch Dritte „nicht dokumentiert“, Datum = technische Änderung |
| 10.6 Verdichtung | teilweise: doppelte Netto-/Zeitraumhinweise entfernt, Hinweise am Ergebnis gebündelt; keine vollständige redaktionelle Überarbeitung aller 41 Seiten |
| 10.7 Rückmeldung | **umgesetzt, Empfänger zu bestätigen** (E-Mail aus Entwurf, `mailto:`; nur Rechnername/URL, keine Werte) |
| 11 Rabattwirtschaftlichkeit · 12 Werbewirtschaftlichkeit | umgesetzt und geprüft (alle Prüf- und Grenzfälle) |
| 13 Arbeitsbereich, Migration, Sicherung, Ausgabe | umgesetzt und geprüft (Unit-Tests, Browser-Export); **Import-Dialog nur per Unit-Test, nicht im Browser durchgespielt**; PDF-Druckansicht nicht visuell geprüft |
| 14 Hilfe/FAQ | umgesetzt |
| 15 Mobil/Zugänglichkeit | umgesetzt, **Prüfung eingeschränkt**: Skript (360–1280 px), axe-core, Tastatur-Stichprobe; kein Screenreader, keine echten Geräte, keine Zoom-/Performance-Messung |
| 16 Messung/Nutzertest | Messung umgesetzt und geprüft; Nutzertest nur als Verfahren (`docs/MESSKONZEPT.md`), nicht durchgeführt |
| 17 Abnahmefälle | umgesetzt (siehe `tests/*.test.ts`, 21 Fälle der Tabelle) |

## 3. Wichtige Dateien

Neu: `src/config/operator.ts`, `src/calc/{scenario,workflow}.ts`, `src/calc/modules/rabatt-absatz.ts`, `src/lib/{workspace,analytics,content-meta}.ts`, `src/data/{tasks,cases,field-guides,home}.ts`, `src/scripts/{flow,workspace-page,summary-page,preview,charts}.ts`, Seiten `aufgaben/`, `ablauf/`, `lernen/`, `praxisfaelle/`, `gespeichert/zusammenfassung/`, `src/styles/features.css`, `scripts/e2e-smoke.mjs`, `docs/{BETREIBER-OFFEN,MESSKONZEPT,FORTSCHRITT}.md`.
Geändert (zentral): `Calculator.astro`, `calculator.ts`, `[slug].astro`, `Catalog.astro`, `storage.ts`, `search.ts`, `catalog-state.ts`, `break-even.ts` (Hauptergebnis = Mindeststückzahl), `roas.ts`, `consent.ts`, Impressum/Datenschutz/Über, Header/Footer, Tests.

## 4. Vorschau und Testanleitung

```bash
npm install && npm run build && npm run preview     # http://localhost:4321
npm test && npm run check && npm run check:site && npm run check:contrast
NODE_PATH=$(npm root -g) node scripts/e2e-smoke.mjs  # Browserprüfung (Playwright)
```

## 5. Ausgeführte Prüfungen

Siehe `docs/PRUEFUNGEN.md` (Abschnitt 05.11.2026). Nicht ausgeführt: Screenreader, echte Mobilgeräte, andere Browser, Performance-Messung, Nutzertests, visuelle Druck-/PDF-Prüfung, Import-Dialog im Browser.

## 6. Offene Betreiberangaben

`docs/BETREIBER-OFFEN.md` (9 Punkte: Name/Anschrift bestätigen, E-Mail, Telefon optional, Rechtsform/Register/USt-IdNr., tatsächlicher Hosting-Anbieter, GA-Speicherdauer, Drittlandgrundlage, Aufsichtsbehörde, rechtliche Prüfung).

## 7. Migration und Wiederaufnahme

- Alte `kr.saved.v1`-Daten werden beim ersten Öffnen verlustfrei nach `kr.workspace.v2` migriert; der alte Schlüssel bleibt unverändert. Favoriten-Schlüssel sind unverändert. URLs bleiben erhalten (`/gespeichert/` heißt jetzt „Meine Berechnungen“); `#gespeichert=<id>` funktioniert weiter. Neue Hash-Kurzformen: `#beispiel`, `#<modus>:beispiel`.
- Eine alte Break-even-Ansicht zeigt jetzt die Mindeststückzahl als Hauptergebnis (statt der theoretischen Menge, die unter „Details“ steht).
- Weiterarbeit: `docs/FORTSCHRITT.md`; offene Ideen: Eingabehilfen für weitere Rechner, Browser-Test des Import-Dialogs, Tests mit Personen.
