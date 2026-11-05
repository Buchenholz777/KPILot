# Umsetzungsmatrix Folgeauftrag „Qualität und Nutzerführung“ (05.11.2026)

Status: ✔ umgesetzt und geprüft · ◐ umgesetzt, Prüfung eingeschränkt · ⛔ blockiert (Betreiberangabe fehlt). „Geprüft“ = Unit-Test (`npm test`, 439) und/oder Browserprüfung (`scripts/e2e-smoke.mjs`, `scripts/e2e-charts.mjs`, Chromium).

| Abschn. | Anforderung | Seiten / Komponenten | Vorhandener Stand | Änderung | Status |
|---|---|---|---|---|---|
| 2.1 | Startseite: vollständiger Katalog | `Catalog.astro`, `catalog-state.ts` | bereits umgesetzt (Folgeauftrag 2) | bestätigt; kompakte Ansicht jetzt Standard | ✔ |
| 2.2 | Suche: Treffer unter dem Suchfeld | `Catalog.astro`, `features.css` | Treffer unter Aufgabenkacheln | Suchmodus blendet Aufgaben/Favoriten aus (`data-searching`) | ✔ |
| 2.3 | Break-even-Graph oben | `calculator.ts` | Graph bereits oben (Folgeauftrag 2) | bestätigt; Interpretationssatz jetzt nach der Grafik | ✔ |
| 2.4 | Grafik bei Marge/ROAS | `src/calc/charts/*` | umgesetzt (Folgeauftrag 2) | bestätigt, Beschriftungen verbessert | ✔ |
| 2.5 | Praxisfall-Link Handel öffnet Standardbeispiel | `cases.ts`, `praxisfaelle` | Link `#beispiel` | Schritt-Übernahmen mit Fallwerten (100/80/100) | ✔ |
| 2.6 | Stunden als „Stück“ | `units.ts`, Module, Grafiken | fest „Stück“ | Einheitenauswahl; Stundenfall: „80 abrechenbare Stunden“, „60 € je abrechenbarer Stunde“ | ✔ |
| 2.7 | ROAS-Alternative verborgen | `roas.ts`, `calculator.ts` | Detailbereich | sichtbare Tabelle, Differenz −360 €, Vergleichsgrafik | ✔ |
| 2.8 | Übernahmebanner veraltet | `calculator.ts` | statischer Hinweis | dynamisch (`renderIncomingNotice`) bei jeder Änderung | ✔ |
| 2.9 | Kopierausgabe ohne Alternative | `calculator.ts` | nur Eingabe | Vergleich, Szenarien und Differenz im Export | ✔ |
| 2.10 | Preisablauf: Notiz vor Ergebnissen, Zwischenstand rechts | `ablauf/…`, `flow.ts` | Notiz oben, Aside | Reihenfolge Ergebnis→Vergleich→Diagramm→Annahmen→Notizen; Aside im Abschluss ausgeblendet | ✔ |
| 2.11 / 3.1 | Impressum/Datenschutz offen | `operator.ts`, `DraftNotice` | Entwurf, Offen-Liste | unverändert ehrlich; Liste in `BETREIBER-OFFEN.md` | ⛔ |
| 3.2 | Fachliche Verantwortung | `Ueber`, `Provenance.astro` | Hinweis in Zeile | Abschnitt „Verantwortung, Zielgruppe und Prüfung“; Rechnerseite: Modellvariante, getrennt: Verantwortung / automatisierte Prüfung / fachliche Prüfung / technische Änderung | ◐ (keine fachliche Prüfung dokumentiert) |
| 4 | Falldaten, Übergänge | `cases.ts`, `praxisfaelle` | Zahlen aus Funktionen, ein Link je Fall | eine Datenquelle je Fall; Schritt- und Fallübernahmen; Banner „Werte aus Praxisfall X übernommen“ | ✔ |
| 5 | Einheiten durchgängig | `units.ts`, `engine.ts`, Felder, Grafiken, Übernahmen, Szenarien | fest „Stück“ | Einheitenauswahl in Break-even, Gewinn, Deckungsbeitrag, Ablauf, Fälle; gilt in Ergebnissen, Grafiken, Tabellen, Szenarien (Einheit gemeinsam), Übernahmen, Speicherung | ◐ (nicht in Stückkosten/Rabatt-Mehrabsatz) |
| 6 | Vollständiger Katalog, Ansichten | `Catalog.astro` | s. 2.1 | Kompakt als Standard für Erstbesucher, gespeicherte Wahl hat Vorrang | ✔ |
| 7 | Suchmodus, kompakter Einstieg | `Catalog`, `index.astro`, `TaskTiles` | große Kacheln | Aufgabenkacheln ~96 px, Favoriten zurückhaltend, Link „Preis und Gewinn gemeinsam kalkulieren“ | ✔ |
| 8 | Live-Diagramme | `src/calc/charts/*`, `charts.ts` | umgesetzt (Folgeauftrag 2) | bestätigt; neu: Fixkosten-Marker, theoretischer Schnittpunkt, Ablauf-Grafiken | ✔ |
| 9 | ROAS-Vergleich | `roas.ts`, `marketing.ts` | – | Tabelle 30 %/20 %, Mindest-ROAS 3,3333/5,0, Differenz, Grafik mit Nulllinie | ✔ |
| 10 | Hinweise/Exporte | `calculator.ts` | s. oben | Banner dynamisch; Kopieren inkl. Vergleich; „Vergleich kopieren“; Druck zeigt offenen Vergleich | ◐ (PDF-Optik nicht visuell geprüft) |
| 11 | Abschluss Preisablauf | `flow.ts` | s. oben | Hauptübersicht ersetzt Zwischenstand | ✔ |
| 12 | Fälle als bearbeitbare Vorlagen | `flow.ts`, `praxisfaelle` | – | „Diesen Fall mit meinen Zahlen durchrechnen“; Herkunft/Annahmen; „abgewandelte Berechnung“; Entwurfsschutz mit Auswahl | ✔ |
| 13 | Marketing-Praxisfall | `cases.ts` | – | vierter Fall „Werbung“ (3.600/900/30 %/20 %), Zahl der Fälle aus Quelle | ✔ |
| 14 | Sensitivität im Preisablauf | `workflow.ts`, `charts/flow.ts`, `charts.ts` (hbars) | Preis-/Kostenänderung | Preis €, Kosten €, Absatz %; horizontale Balken, gemeinsame Euro-Skala, konstante übrige Größen | ✔ |
| 15–16 | Leitlinien, Abnahme | – | – | siehe `PRUEFUNGEN.md` | ◐ |
