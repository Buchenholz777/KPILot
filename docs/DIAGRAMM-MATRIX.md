# Umsetzungsmatrix der Ergebnisgrafiken (05.11.2026)

Alle Grafiken entstehen programmatisch aus dem **validierten Eingabe- und Ergebnisstand** derselben Rechenfunktion wie die Zahlen (`src/calc/charts/*` bereitet auf, `src/scripts/charts.ts` zeichnet). Sie aktualisieren sich bei jeder Eingabe (150 ms Bündelung), Moduswechsel, Beispiel, Übernahme, gespeicherter Berechnung und im A/B-Vergleich. Jede Grafik hat Titel, sichtbare Datenlabel, erklärenden Satz, Legende (Muster zusätzlich zur Farbe) und aufklappbare Tabellenalternative. Vorher gab es nur im Break-even (Linien) und im Rabatt-Mehrabsatz (Balken) eine Ergebnisgrafik; bei allen anderen Rechnern nur das statische, als „Beispielgrafik“ gekennzeichnete Erklärbild.

Prüfstatus: **A** = Unit-Test der Diagrammdaten mit Beispiel (`tests/charts-data.test.ts`) · **B** = Browser-Durchlauf Desktop + 375 px ohne Befund (`scripts/e2e-charts.mjs`) · **G** = zusätzlich gezielte Grenzfall-/Prüffalltests.

| Rechner / Modus | Neue Ergebnisvisualisierung | Datenbasis | Grenzfälle | Status |
|---|---|---|---|---|
| Prozentrechner (3 Modi) | Anteil am Grundwert als Balken (0–100 %); außerhalb: Wertevergleich mit Nullbasis | Eingaben + Ergebnis | Satz <0 oder >100 %, Grundwert ≤0 → Vergleichsbalken statt Anteil | A B |
| Prozentuale Veränderung | Ausgangs-/Endwert und absolute Veränderung (Nullbasis) | Eingaben + Ergebnis | Ausgangswert 0 → relative Veränderung „nicht definiert“; negativ → Hinweis | A B |
| Rabatt & Erhöhung (5 Modi) | Preis vorher/nachher + Ersparnis/Aufschlag; „Zwei Änderungen“: Preisindex (Ausgang = 100) | Ergebnisfelder | – | A B |
| Prozentpunkte | Zwei Prozentwerte; Differenz in Prozentpunkten getrennt von relativer Veränderung | Eingaben + Ergebnis | alter Wert 0 → relative Veränderung nicht definiert | A B |
| Dreisatz (2 Modi) | Proportionale Gerade bzw. antiproportionale Kurve mit gegebenem und gesuchtem Paar | Eingaben + Ergebnis | Ausgangsmenge 0 → keine Grafik (begründet); getrennte Einheiten per Hinweis | A B |
| Gewichteter Durchschnitt | Werte je Zeile mit Gewicht, gewichtetes Mittel als Linie; Gewichte als eigenes Panel | Zeilen + Ergebnis | Gewichtssumme 0 → keine Grafik; kein ungewichteter Mittelwert gezeigt | A B |
| CAGR | Modellpfad bei gleichmäßigem Wachstum (ausdrücklich gekennzeichnet) | Anfang, Ende, Laufzeit | Anfang ≤0 / Laufzeit 0 → keine Grafik | A B |
| Deckungsbeitrag | Brücke Preis → variable Kosten → Deckungsbeitrag je Stück | Eingaben + Ergebnis | negativ: Balken unter der Nulllinie + Hinweis | A B G |
| **Break-even** | Liniendiagramm Umsatz/Gesamtkosten, Schnittpunkt, Verlust-/Gewinnfläche (Muster), Punktauswahl per Regler/Tastatur, Tabelle | Eingaben + Ergebnis (Schnittpunkt aus der Rechenfunktion) | p ≤ v & F > 0 (kein Break-even erfunden), F = 0, p = v & F = 0, nicht ganzzahliger Schnittpunkt, extreme Werte (nur 2 Punkte je Linie, ≤14 Reglerstufen) | A B G |
| Gewinn (Menge) | Brücke Umsatz → variable Kosten → Fixkosten → Gewinn/Verlust | Ergebnisfelder + F | Verlust negativ | A B G |
| Gewinn (Zielgewinn) | Ergebnis über der Menge, Kostendeckungs- und Zielwert-Linie, Markierung der Menge | Eingaben + Ergebnis | Beitrag ≤0 → keine Grafik (begründet) | A B |
| Marge & Aufschlag | Euro-Panel (Kosten, Preis, Differenz) + Prozent-Panel mit Nennern „/ Verkaufspreis“ und „/ Kostenbasis“ | Ergebnisfelder | Kosten 0 → 100 % Marge, Aufschlag nicht definiert (kein Balken) | A B G |
| Verkaufspreis aus Zielmarge | Brücke Kostenbasis + Rohertrag = Verkaufspreis | Ergebnisfelder | – | A B |
| Gesamt- & Stückkosten | Panel Euro gesamt, Panel Euro je Stück (getrennte Achsen) | Ergebnisfelder | Menge 0 → nur Fixkosten, Stückkosten nicht definiert | A B |
| Zuschlagskalkulation (2 Modi) | Kostenbrücke mit Zwischensumme Herstellkosten (keine Doppelzählung); Satz: Gemeinkosten vs. Basis | Ergebnisfelder | Sondereinzelkosten nur wenn > 0 | A B |
| Stundenkostensatz | Drei getrennte Panels: Kosten €, Stunden, € je Stunde | Eingaben + Ergebnis | Stunden 0 → kein Satz | A B |
| Rabatt: nötiger Mehrabsatz (2 Modi) | Panel Beitrag je Einheit vorher/nachher + Panel Absatz (bzw. relativ) | Ergebnisfelder | Beitrag ≤0 → nur Beitragspanel, keine Ausgleichsmenge | A B G |
| EBIT / EBITDA | Ergebnisbrücke aus den vorhandenen Größen | Eingaben + Ergebnis | negative Bestandteile abwärts | A B |
| EBIT-Marge / Umsatzrendite | Euro-Panel (Ergebnis mit Vorzeichen, Umsatz) + Prozent-Panel | Eingaben + Ergebnis | Umsatz 0 → keine Grafik; negative Quote bleibt sichtbar | A B |
| Cashflow (2 Modi) | Brücke aus den erfassten Zahlungen bis Netto-Cashflow | Eingaben + Ergebnis | kein Kontostand ohne Anfangsbestand | A B |
| Working Capital | Umlaufvermögen, Verbindlichkeiten, Differenz (vorzeichenfähig) | Eingaben + Ergebnis | – | A B |
| Liquidität 1.–3. Grades | Drei getrennte Balken, 100-%-Linie als rechnerische Deckung | Ergebnisfelder | Verbindlichkeiten 0 → keine Grafik | A B G |
| Eigenkapitalquote | Zusammensetzung EK/FK nur bei 0 ≤ EK ≤ GK, sonst vorzeichenfähige Balken | Eingaben + Ergebnis | negatives EK, EK > GK | A B G |
| ROI | Euro-Panel (Gewinn, Kapital) + Rendite-Panel (kein 100-%-Ganzes) | Eingaben + Ergebnis | Kapital 0 → keine Grafik | A B |
| Amortisationsdauer | Investition vs. kumulierte Rückflüsse über der Zeit, Rückflusszeitpunkt markiert (Modellannahme gekennzeichnet) | Eingaben + Ergebnis | Rückfluss ≤0: Linien ohne Schnittpunkt, Hinweis | A B G |
| Conversion Rate (2 Modi) / CTR | Zusammensetzung (Teil/Rest) bei Teil ≤ Ganzes, sonst Mengenvergleich | Eingaben + Ergebnis | Teil > Ganzes (Ereignisse) → kein Anteil des Ganzen | A B |
| CPC / CPM / CPA | Drei getrennte Panels (Euro, Menge, Euro je Einheit) | Eingaben + Ergebnis | Menge 0 → Ergebnis nicht definiert | A B |
| ROAS (Standard) | Zwei Eurobalken: Werbekosten, zugeordneter Umsatz | Eingaben + Ergebnis | Kosten 0 → ROAS nicht definiert, Beträge trotzdem | A B G |
| ROAS (Wirtschaftlichkeit) | Brücke Umsatz → variable Kosten → DB vor Werbung → Werbekosten → Beitrag nach Werbung | Ergebnisfelder | Quote 0/Kosten 0 per Erklärung; „kein Unternehmensgewinn“ | A B G |
| CAC | Brücke Marketing + Vertrieb; Panels Neukunden und CAC | Eingaben + Ergebnis | Neukunden 0 → CAC nicht definiert | A B |
| ARPU | Drei Panels (Umsatz, Accounts, ARPU) | Eingaben + Ergebnis | Accounts 0 | A B |
| CLV | Brücke Lebenszeit-Umsatz → variable Kosten → CLV (→ Akquisition) als Modellwerte | Ergebnisfelder | Hinweis „keine Kohortendaten“ | A B |
| Churn | Zusammensetzung verblieben/verloren der Anfangskohorte; Neukunden getrennt erwähnt | Eingaben + Ergebnis | verloren > Anfang → keine Grafik | A B G |
| MRR & ARR | MRR je Tarif + gesamt; ARR in eigenem Panel (nicht addiert) | `breakdown` des Rechenmoduls | – | A B G |
| NPS | Antwortverteilung + feste Skala −100…+100 | Eingaben + Ergebnis | keine Antworten → kein Score | A B G |
| Soll-Ist | Soll, Ist, Abweichung (Nullbasis, vorzeichenfähig); Bewertungsrichtung im Text | Eingaben + Ergebnis | Soll 0 → relative Abweichung nicht definiert | A B |
| Kapazitätsauslastung | Balken mit 100-%-Linie, Überlast über 100 % sichtbar | Eingaben + Ergebnis | verfügbar 0 → keine Grafik | A B G |
| Lagerumschlag (2 Modi) | Panels Umschläge und Tage, Jahresbasis im Text | Ergebnisfelder | Bestand 0 → keine Grafik | A B |

**A/B-Vergleich:** Break-even zeichnet beide Szenarien auf einer Skala (4 Linien, beide Schnittpunkte); alle Rechner mit Szenarien (Break-even, Gewinn, Rabatt-Mehrabsatz, ROAS-Wirtschaftlichkeit, CLV) zeigen bis zu drei vergleichbare Kennzahlen als Balken A/B mit gleicher Achse je Panel. Bei unterschiedlichen Zeiträumen wird nicht gezeichnet.

**Begründete Ausnahmen:** Keine Kategorie wurde pauschal ausgenommen. Keine Grafik gibt es nur dort, wo das Modell keinen Wert liefert (Spalte „Grenzfälle“); dann steht statt der Grafik eine Begründung.
