# Growth-Dokumentation

Stand: 09.11.2026. Ziel: messen, welche Maßnahmen wirken – ohne Rechenwerte oder Freitext zu übertragen und nur mit Einwilligung. Messkonzept im Detail: `docs/MESSKONZEPT.md`. SEO-Konzept: `docs/SEO.md`.

## Trichter

1. **Auffindbarkeit** – Impressionen und Klicks (Search Console, extern)
2. **Einstieg** – Seitenaufruf Startseite oder Rechnerseite (`page_view`, automatisch von GA4)
3. **Auswahl** – `calc_selected` (Kachel/Schnellzugriff), `task_selected`, `search_used`
4. **Nutzung** – `calc_started` → `calc_result` (gültiges Ergebnis)
5. **Vertiefung** – `chart_shown`, `scenario_used`, `values_transferred`, `related_clicked`
6. **Mitnahme** – `result_copied`, `calc_saved`, `favorite_added`

Definitionen: *Begonnen* = erstmals ein Wert eingegeben bzw. Beispiel eingesetzt (nicht schon der Seitenaufruf). *Abgeschlossen* = erstmals ein gültiges Ergebnis. Jedes Ereignis zählt je Seitenaufruf, Rechner und Modus höchstens einmal.

## Fragen und Auswertung

| Frage | Quelle | Auswertung |
|---|---|---|
| Wie viele Besucher kommen über Google? | GA4: Akquisition → Traffic (Kanal „Organic Search“) | nur Einwilligte; Search Console zählt alle Klicks |
| Welche Rechner erhalten die meisten organischen Zugriffe? | Search Console → Leistung → Seiten; GA4 Seitenaufrufe nach Landingpage | Vergleich beider Quellen |
| Welche Suchanfragen erzeugen Impressionen? | Search Console → Leistung → Suchanfragen | nur dort verfügbar (kein Frontend-Zugriff) |
| Welche Seiten haben niedrige Klickraten? | Search Console: Seiten mit vielen Impressionen und CTR unter dem Durchschnitt | Titel/Description in `src/data/seo.ts` anpassen |
| Wie viele starten eine Berechnung? | `calc_started` ÷ Seitenaufrufe der Rechnerseite | je Rechner |
| Wie viele schließen erfolgreich ab? | `calc_result` ÷ `calc_started` | niedrige Quote = Eingabehürde (Felder, Hilfetexte) |
| Welche Rechner werden zusammen genutzt? | `values_transferred`, `related_clicked` (Ziel in `calc`) | Pfadanalyse in GA4 |
| Welche Suchanfragen auf der Website liefern nichts? | `search_no_results` (ohne Suchtext) | nur Anzahl; Begriffe stehen nicht zur Verfügung – bei Bedarf Test mit Personen |
| Welche Endgeräte? | GA4: Technologie → Geräte | |
| Welche Seiten mit hohen Ausstiegen? | GA4: Engagement → Seiten | |
| Wiederkehrende Nutzung? | GA4: Nutzer wiederkehrend; `saved_reopened` | |

## Einrichtung außerhalb des Repositories

1. **Search Console** (Property bestätigt): Sitemap `https://www.my-kpilot.de/sitemap.xml` einreichen, wichtige URLs prüfen lassen, nach 2–4 Wochen Leistung auswerten.
2. **GA4**: Ereignisse als „Schlüsselereignisse“ markieren: `calc_result`, `calc_saved`; Kennungen (`calc`, `variant`, `task`) unter Verwaltung → Benutzerdefinierte Definitionen als Dimensionen (Bereich „Ereignis“) anlegen; Datenaufbewahrung auf 2 Monate belassen (steht so in der Datenschutzerklärung).
3. **Search Console ↔ GA4 verknüpfen** (GA4 → Verwaltung → Produktverknüpfungen), damit Suchanfragen und Nutzung zusammen sichtbar sind.
4. **Core Web Vitals**: Im Bericht der Search Console erscheinen reale Daten erst bei ausreichend Besuchern. Bis dahin PageSpeed Insights (Labordaten) für Startseite und einen Rechner nutzen.

## Grenzen

- GA4 sieht nur Besucher, die zugestimmt haben; Zahlen sind keine Gesamtbesucherzahlen.
- Es gibt keine Auswertung nach Eingabewerten – bewusst.
- Es gibt keine Teilen-Funktion mit Eingaben im Link (`share_result` entfällt aus Datenschutzgründen); Kopieren des Ergebnistextes und Drucken sind vorhanden.
- Wirkung von SEO-Änderungen zeigt sich frühestens nach Wochen; ohne Vorher-Werte aus der Search Console sind Aussagen zu Rankings nicht möglich.
