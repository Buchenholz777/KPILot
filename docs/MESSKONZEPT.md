# Erfolgsmessung und Nutzertest

## Messkonzept (optional, nur mit Einwilligung)

Umsetzung: `src/lib/analytics.ts`, eingebunden in `src/scripts/consent.ts`, `calculator.ts`, `flow.ts`, `Catalog.astro`, `TaskTiles.astro`. Es wird nur gesendet, wenn (1) die Einwilligung „granted“ gespeichert ist und (2) gtag.js geladen wurde. Ereignisse werden je Seitenaufruf, Rechner und Modus **höchstens einmal** gezählt – nicht je Tastendruck oder automatischer Neuberechnung. Ein Seitenaufruf ist kein begonnener Rechenvorgang.

| Ereignis (`event`) | Bedeutung / Zähler | Bezugsgröße | Parameter |
|---|---|---|---|
| `task_selected` | Aufgabeneinstieg angeklickt | Klicks je Aufgabe ÷ Aufrufe der Startseite | `task` |
| `calc_started` | erstmals Wert eingegeben bzw. Beispiel eingesetzt/Übernahme angewendet (je Seitenaufruf, Rechner, Modus) | ÷ Aufrufe der Rechnerseite | `calc`, `variant` |
| `calc_result` | erstmals gültiges Ergebnis (Status „ok“) | ÷ `calc_started` | `calc`, `variant` |
| `search_no_results` | Suche ohne Treffer (einmal je Seitenaufruf, ohne Suchtext) | ÷ Seitenaufrufe mit Suche | – |
| `scenario_used` | A/B-Vergleich bzw. Ablaufvarianten mit mindestens zwei auswertbaren Fällen | ÷ `calc_result` | `calc`, `variant` |
| `values_transferred` | Werte per Button an anderen Rechner übergeben | ÷ `calc_result` | `calc`, `variant` (Ziel) |
| `calc_saved` | Berechnung ausdrücklich gespeichert | ÷ `calc_result` | `calc`, `variant` |
| `saved_reopened` | gespeicherte Berechnung wieder geöffnet | ÷ `calc_saved` (zeitversetzt) | `calc`, `variant` |
| `calc_selected` | Rechner in der Übersicht oder im Schnellzugriff angeklickt | ÷ Aufrufe der Startseite bzw. Übersicht | `calc` (Ziel) |
| `related_clicked` | „Verwandten Rechner“ angeklickt | ÷ Aufrufe der Rechnerseite | `calc` (Ziel) |
| `search_used` | Suche in der Übersicht lieferte erstmals Treffer (einmal je Seitenaufruf, ohne Suchtext) | ÷ Seitenaufrufe mit Suche | – |
| `chart_shown` | zu einem Ergebnis wurde erstmals ein Diagramm angezeigt | ÷ `calc_result` | `calc`, `variant` |
| `result_copied` | Ergebnis kopiert | ÷ `calc_result` | `calc`, `variant` |
| `favorite_added` | Rechner zu den Favoriten hinzugefügt | ÷ Aufrufe der Rechnerseite | `calc` |

Zuordnung zu den üblichen Namen im Wachstumskonzept: `view_calculator` = automatischer Seitenaufruf (page_view) der Rechnerseite · `start_calculation` = `calc_started` · `complete_calculation` = `calc_result` · `search_calculator` = `search_used` (und `search_no_results`) · `select_calculator` = `calc_selected` · `click_related_calculator` = `related_clicked` · `use_chart` = `chart_shown` (Anzeige, nicht Interaktion) · `copy_result` = `result_copied` · `save_calculation` = `calc_saved` · `favorite_calculator` = `favorite_added`. Ein `share_result` gibt es nicht, weil es keine Teilen-Funktion gibt, die Eingaben in Links schreibt (bewusst: Datenschutz).

Nicht übertragen: Rechenwerte, freie Suchtexte, Projektnamen, Notizen, importierte Inhalte. Parameter werden gegen `^[a-z0-9-]{1,60}$` bereinigt (`cleanParams`, getestet in `tests/analytics.test.ts`). Die Browserprüfung belegt, dass eingegebene Zahlen weder im `dataLayer` noch in Anfrage-URLs auftauchen.
In Google Analytics 4 die Ereignisse als benutzerdefinierte Ereignisse auswerten; Kennungen als benutzerdefinierte Dimensionen anlegen.

## Kurzer Nutzertest – Verfahren (nicht durchgeführt)

**Es wurden keine Testpersonen befragt; es gibt keine Messwerte, Ausgangswerte oder Verbesserungsquoten.** Dieses Dokument beschreibt nur, wie getestet werden soll.

Ablauf: 5–8 Personen mit Geschäftsbezug, je 20 Minuten, Think-aloud, Bildschirm und Ton mit Einwilligung (oder nur Notizen). Kein Training vorab. Die Aufgabenstellung wird vorgelesen, die Testleitung greift nicht ein.

| # | Aufgabe | Erfolgskriterium | Beobachten |
|---|---|---|---|
| 1 | „Du willst wissen, wie viel du verkaufen musst, um die Kosten zu decken.“ Finde den passenden Rechner. | Break-even erreicht ohne Hilfe | Weg (Suche, Aufgabe, Kachel), Zeit, Fehlversuche |
| 2 | Erkläre die Felder und trage Werte aus einem gegebenen Szenario ein. | Alle Felder korrekt, Zeitraum passt | Nutzung von „Was ist gemeint?“, Verwechslung variabel/fix |
| 3 | Erkläre das Ergebnis in eigenen Worten. | Aussage trifft zu (Mindeststückzahl, Kostendeckung ≠ Gewinn) | Missverständnisse |
| 4 | Vergleiche eine Variante (anderer Preis). | Szenario B korrekt angelegt, Differenz gedeutet | Zeitraum-Hinweis verstanden? |
| 5 | Speichere die Berechnung, verlasse die Seite und finde sie wieder. | Öffnen aus „Meine Berechnungen“ | Auffindbarkeit, Rückgängig/Papierkorb |

Auswertung: je Aufgabe Erfolg ja/nein, Zeit, Hilfestellungen, Zitate; Schwachstellen nach Häufigkeit sortieren; Änderungen ableiten und mit neuen Personen wiederholen. Ergebnisse hier mit Datum eintragen.
