# Prüfprotokoll

## Überarbeitung KPILot (Design und Suche), 04.11.2026

**Vorher:** Screenshots von Startseite, `/rechner/` und `/cashflow-rechner/` bei 1440 px. Fehler reproduziert: Kategorie „Marketing“ aktiv, dann „Cashflow“ gesucht ergab 0 Treffer. „Cashflow-Berechnung“ ergab ebenfalls 0 Treffer.

**Automatisiert:**

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Alle Tests inkl. 27 neuer Regressionstests für Suche/Kategorien | `npm test` | 253 bestanden |
| Kontraste von 35 Farbpaaren | `npm run check:contrast` | alle erfüllen ihr Ziel (Text ≥ 4,5:1, Bedienelemente ≥ 3:1) |
| TypeScript / Astro | `npm run check` | 0 Fehler, 0 Warnungen |
| Build und Seitenprüfung | `npm run build` + `npm run check:site` | Produktion: 49 indexierbar = 49 Sitemap-URLs, keine Probleme · Vorschau: alles noindex, keine Probleme |

**Im Browser (eingebauter Browser, Dev-Server):**

1. „Marketing“ gewählt, dann „Cashflow“ getippt: Kategorie springt auf „Alle“, Cashflow wird gefunden ✔
2. „Controlling“ gewählt, dann „ROAS“ getippt: global gefunden ✔
3. „Cashflow-Berechnung“ und „  cashflow  “ getippt: Cashflow-Rechner ✔
4. Nach der Suche „Kostenrechnung & Preise“ gewählt: „Eingegrenzt auf … · 0 von 1 Treffern“, Hinweis und „In allen Kategorien suchen“, das den Suchbegriff behält ✔
5. Suche über ✕ geleert: Standardansicht mit „Alle“, Fokus im Suchfeld, kein versteckter Filter ✔
6. Kategorie ohne Suchtext: filtert wie zuvor (Controlling: 3 Rechner) ✔
7. Bestand: Favorit auf Kachel setzen und entfernen (ohne Navigation), Zustand nach Seitenwechsel, Favoriten-Seite, Variantenfavorit, „Beispiel einsetzen“ und Ergebnis (Cashflow), gespeicherte Rechnung aus der Zeit vor der Überarbeitung geöffnet (Werte erhalten) ✔
8. Layout bei 375, 768 und 1440 px angesehen. Horizontaler Überlauf per Skript auf 10 Seiten bei 320, 375 und 768 px geprüft: keiner (zwei Fehler gefunden und behoben: Rechner mit Zeilentabellen, Header bei 320 px) ✔
9. Tastatur: Fokusring im dunklen Header sichtbar, Reihenfolge Header → Suche ✔ (Stichprobe)

**Nicht geprüft:** Screenreader, echte Mobilgeräte, andere Browser als der eingebaute Chromium-Browser, Druckvorschau.

Stand: 04.11.2026. Unterschieden wird zwischen technischer Selbstprüfung und Tests mit Personen. **Nutzertests mit Personen wurden nicht durchgeführt.**

## Automatisiert (wiederholbar)

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Rechenfunktionen, Randfälle, Pflichtbeispiele aus dem Auftrag, Zahlenformat, Suche, Favoriten/Speicher (inkl. Migration, voller und fehlender Speicher), Werteübernahme, Register, Illustrationen | `npm test` | 226 Tests bestanden |
| TypeScript / Astro | `npm run check` | 0 Fehler, 0 Warnungen |
| Build | `npm run build` | 54 HTML-Seiten, 80 SVG-Illustrationen, Sitemap, robots.txt |
| Interne Links, Titel, Description, `lang="de"`, genau eine h1, Canonicals, noindex, Sitemap | `npm run check:site` | Produktion (Test-`SITE_URL`): 49 indexierbare Seiten = 49 Sitemap-URLs, keine Probleme. Vorschau: 0 indexierbar, leere Sitemap, keine Probleme |

Erwartungswerte in den Tests sind fest vorgegeben (aus dem Auftrag bzw. von Hand berechnet) und rufen nicht dieselbe Implementierung erneut auf. Geprüft wird auch: Die Mindeststückzahl erreicht das Ziel, eine Stück weniger nicht (Break-even, Zielgewinn), und Zielpreise in Cent halten die Marge ein.

## Im Browser durchgespielt (eingebauter Browser der Entwicklungsumgebung, Dev-Server)

Breiten: 375 px (Smartphone), 768 px (Tablet), 1440 px (Desktop).

1. „Gewinnschwelle“ suchen → genau ein Treffer: Break-even ✔
2. Break-even per Stern auf der Kachel favorisieren → keine Navigation, Favoritenkachel oben, Zähler im Kopf, nach Neuladen erhalten ✔
3. Prozentrechner-Modus „Prozentsatz“ als Favorit → eigene Kachel „Prozentsatz berechnen“ → öffnet direkt diesen Modus ✔
4. Kategorie „Marketing & Vertrieb“ filtern (7 Treffer) → CPC berechnen ✔
5. EBIT und Cashflow: Kurztexte und Bilder unterscheiden Ergebnis und Zahlungen; EBITDA-Bild mit Hinweis „kein Kontostand“ ✔ (inhaltliche Selbstprüfung)
6. Mehrdeutige Eingabe „2.500“ → Fehler am Feld, übrige Eingabe erhalten, altes Ergebnis entfernt; Korrektur per Tastatur, Enter rechnet ✔
7. Tastaturbedienung: Tab/Shift+Tab durch Felder, Enter zum Berechnen, Dialog „Rechnung speichern“ mit Enter, Fokus kehrt zurück ✔ (Stichprobe, keine vollständige Prüfung aller Seiten)

Außerdem geprüft: „Beispiel einsetzen“, Ergebnisdiagramm Break-even, Werteübernahme Deckungsbeitrag → Break-even (übernommene und fehlende Felder angezeigt, Fokus auf fehlendem Feld), Rechnung speichern → `/gespeichert/` → wieder öffnen (Werte und Zeitraum wiederhergestellt), Szenariovergleich A/B, Wiederherstellen von Suche und Filter in der Sitzung, keine Konsolenfehler.

## Nicht ausgeführt / Grenzen

- **Screenreader-Test** (NVDA, VoiceOver): nicht durchgeführt. ARIA-Struktur (Buttons mit `aria-pressed`, Live-Regionen, Labels, `aria-describedby`) ist umgesetzt, aber nur technisch geprüft.
- **Echte Mobilgeräte** (iOS Safari, Android Chrome, Bildschirmtastatur): nur per Viewport-Emulation getestet.
- **Andere Browser** (Firefox, Safari): nicht getestet.
- **Automatisierte Oberflächentests** (Playwright o. ä.): nicht eingerichtet. Die Bedienabläufe wurden manuell im Browser geprüft (siehe oben).
- **Druckansicht:** Druck-CSS vorhanden, Druckvorschau nicht geprüft.
- **Cloudflare-Deploy und 404-Status beim Hoster:** nicht ausgeführt (kein Konto, keine Domain). Konfiguration nach aktueller Doku vorbereitet.
- **Kontraste:** rechnerisch für die Tokens geprüft (siehe `tokens.css`), kein Prüfwerkzeug über alle Seiten.
- **Fachliche Prüfung durch Expertinnen oder Experten:** nicht erfolgt. Die Definitionen folgen den in `QUELLEN.md` genannten Quellen.

## Dokumentation neu erzeugen

`docs/FORMELN.md` und `docs/MODELLANNAHMEN.md` werden aus dem Code erzeugt. Nach Änderungen an Formeln oder Texten: `npm run docs`.

## Überarbeitung „Vollständige Verbesserung“, 05.11.2026

Selbstprüfung durch den Entwickler; **keine Tests mit Personen, keine Screenreader-Prüfung, keine echten Mobilgeräte, nur Chromium (Playwright)**.

| Prüfung | Befehl / Methode | Ergebnis |
|---|---|---|
| Rechen-, Speicher-, Such-, Ablauf-, Fall- und Messtests | `npm test` | 348 Tests in 15 Dateien bestanden (vorher 258) |
| TypeScript / Astro | `npm run check` | 0 Fehler |
| Build und Seitenprüfung (Produktions-`SITE_URL`) | `npm run build` + `npm run check:site` | 66 Seiten, 60 indexierbar = 60 Sitemap-URLs, keine Probleme |
| Kontraste (35 Paare, keine neuen Farben) | `npm run check:contrast` | alle erfüllen ihr Ziel |
| Browser-Nutzerwege (Erstbesuch, Zustimmung/Ablehnung, Suche mit Tippfehler, Beispiel, A/B, Speichern, Duplizieren, Löschen + Rückgängig per Tastatur, Export, Rabatt, Werbung, Ablauf, Netzwerk) | `node scripts/e2e-smoke.mjs` | alle Prüfungen bestanden |
| Horizontaler Seitenüberlauf, 12 Seiten × 360/414/768/1280 px | `scripts/e2e-smoke.mjs` | keiner (Befunde auf Rechnerseiten wurden behoben) |
| Automatisierte Zugänglichkeitsprüfung axe-core 4.10 (WCAG 2.0/2.1 A/AA + Best Practice), 15 Seiten × 1280/375 px | Playwright + axe | 0 Verstöße nach Korrekturen (Kontrast Cookie-Link auf Über-Seite, Schrittnavigation ohne Namen bei 375 px) |
| Netzwerk: vor Zustimmung und nach Ablehnung keine Anfrage an Google; nach Zustimmung nur `gtag/js`; Rechenwerte weder in `dataLayer` noch in Anfrage-URLs; `calc_result` einmal | Playwright | bestanden |

**Nicht ausgeführt / eingeschränkt:** Screenreader (NVDA/VoiceOver), echte iOS/Android-Geräte, Firefox/Safari, Druckvorschau und PDF-Export (Druck-CSS vorhanden, nicht visuell geprüft), Lighthouse-/Performance-Messung, Nutzertests (Verfahren in `docs/MESSKONZEPT.md`). Es wird keine vollständige Barrierefreiheit behauptet: axe findet nur einen Teil möglicher Probleme.

## Live-Ergebnisgrafiken und vollständiger Startseitenkatalog, 05.11.2026

Selbstprüfung (Chromium/Playwright); keine Screenreader-, Geräte- oder Nutzertests.

| Prüfung | Methode | Ergebnis |
|---|---|---|
| Diagrammdaten für **alle 41 Rechner / 55 Modi** mit Beispielwerten (Titel, erklärender Satz, Tabelle, keine NaN/Infinity) | `tests/charts-data.test.ts` | 55 Matrixfälle bestanden |
| Break-even-Prüffälle (80/50/6.000 → 200 Stück · 16.000 €, Gewinn bei 201: 30 €; Preis 100 → 120 · 12.000 €; F 3.001 → 150,05 / 151 / 19 €; p = v; F = 0; Preis < v; sehr kleine/große Werte) | Unit-Test + Browser | bestanden |
| Marge 70/120 (50 €, 41,67 %, 71,43 %), Marge bei Kosten 0, ROAS 3.600/900 (4,0-fach), Wirtschaftlichkeit 30 % (1.080 € / 180 €), negativer Deckungsbeitrag, Rabatt ≤ 0, Eigenkapital negativ, Churn/NPS/Auslastung/Liquidität/Amortisation/MRR | Unit-Test (+ Browser für Marge/ROAS) | bestanden |
| Live-Aktualisierung ohne Klick, Leerzustand, Entfernen bei fehlendem Wert, Reset, Beispiel, Übernahme in Gewinnrechner, A/B-Grafik, Tabelle aufklappbar, Punktauswahl per Tastatur, Druckansicht (Grafik sichtbar, Regler aus) | `scripts/e2e-smoke.mjs` | bestanden |
| Durchlauf aller Rechner und Modi im Browser (Desktop 1280 px und 375 px): Grafik + Tabelle vorhanden, kein NaN/Infinity/undefined, keine Skriptfehler, kein horizontales Seitenscrollen | `scripts/e2e-charts.mjs` | 110 Aufrufe, 0 Befunde |
| Startseite: eindeutige Rechner-IDs = Katalog (41), alle sichtbar ohne Interaktion, kein „Mehr anzeigen“, keine Diagramme/Charts-Code, Trefferzahl „N von 41“, Suche, Kategorie, Zurücksetzen, Kompaktansicht, frischer Aufruf leer | `scripts/e2e-smoke.mjs` | bestanden |
| axe-core (WCAG A/AA + Best Practice), 9 Rechnerseiten mit Grafik × 1280/375 px | Playwright + axe | 0 Verstöße |
| Gesamt | `npm test` / `npm run check` / `npm run check:site` | 423 Tests · 0 Fehler · 66 Seiten ohne Befund |

**Nicht geprüft:** Screenreader-Ausgabe der Grafiken (nur aria-Label, Tabelle und Tastaturregler technisch vorhanden), Firefox/Safari, echte Touch-Geräte, Browser-Zoom über 200 %, visuelle Druck-/PDF-Qualität über die Sichtbarkeitsprüfung hinaus, Leistungsmessung. Die Grenzfall-Spalte der Matrix beschreibt die Behandlung im Code; getestet sind die mit „G“ markierten Fälle.

## Folgeauftrag „Qualität und Nutzerführung“, 05.11.2026

Selbstprüfung (Chromium/Playwright, axe-core); keine Screenreader-, Geräte- oder Nutzertests.

| Prüfung | Methode | Ergebnis |
|---|---|---|
| Praxisfälle (Handel 100/80/100/1.500 mit Rabattvariante; Dienstleistung in Stunden; Produktion mit Kapazität; Werbung 3.600/900/30 %/20 %) mit unabhängig berechneten Erwartungswerten, alle Schritt-/Fall-Übernahmen berechenbar, Fall → Preisablauf | `tests/cases.test.ts` | 12 Tests bestanden |
| Einheit „Stunde“: Zahlen unverändert, Texte/Grafik ohne „Stück“; alte Daten ohne Einheit unverändert | `tests/neue-rechner.test.ts` | bestanden |
| ROAS-Vergleich (1.080/720, +180/−180, −360, 3,3333/5,0-fach); ohne Alternative keine zweite Berechnung | Unit-Test + Browser (Kopierausgabe) | bestanden |
| Sensitivität (Preis +5 € → +1.000 €; Kosten +2 € → −400 €; Absatz −10 % auf 180 → −400 €), Szenariobeispiel 1.000/0/3.250 € | `tests/workflow.test.ts` + Browser | bestanden |
| Suchmodus (Aufgaben ausgeblendet, Treffer direkt unter dem Suchfeld, „Deckungsbeitrg“ → Deckungsbeitrag), kompakte Ansicht als Standard, kompakte Aufgabenkacheln | `scripts/e2e-smoke.mjs` | bestanden |
| Dynamischer Übernahmehinweis (fehlt/vorhanden/fehlt wieder), Praxisfall-Übernahmen im Browser, Stunden-Rechner, Entwurfsschutz im Preisablauf, Abschlussreihenfolge, Druckansicht mit Grafik | `scripts/e2e-smoke.mjs` | bestanden |
| Alle 55 Modi: Grafik + Tabelle, kein NaN, kein Überlauf (Desktop/375 px) | `scripts/e2e-charts.mjs` | 110 Aufrufe, 0 Befunde |
| axe-core, 8 Seiten × 1280/375 px | Playwright + axe | 0 Verstöße |
| Gesamt | `npm test`, `npm run check`, `check:site` (66 Seiten), `check:contrast` | 439 Tests · 0 Fehler · ohne Befund |

Gefundene und behobene Fehler: Klicks auf Weiterrechnen-Buttons gingen verloren, wenn ein Eingabefeld gleichzeitig den Fokus verlor (Liste wurde neu aufgebaut); Muster-Kennungen der Ablauf-Grafiken doppelt vergeben (Flächen unsichtbar); Beschriftungskollisionen in Balkendiagrammen mit negativen Werten.

**Nicht geprüft:** Screenreader, Firefox/Safari, echte Touch-Geräte, Zoom über 200 %, PDF-Seitenumbrüche visuell, Leistungsmessung, fachliche/rechtliche Inhaltsprüfung.
