# Modellannahmen und verwendete Definitionen

> Automatisch erzeugt mit `npm run docs`. Allgemeine Regeln: `README.md` → „Zahlen und Rundung“.

## Prozentrechner

- Alle Werte beziehen sich auf dieselbe Einheit.
- Ein Grundwert von 0 lässt keinen Prozentsatz zu.

**Typische Missverständnisse**

- Prozentsätze über 100 % sind nicht automatisch falsch – sie zeigen, dass der Teil größer ist als die Bezugsgröße.
- Der Grundwert muss zur Frage passen: 20 % Rabatt beziehen sich auf den alten Preis, nicht auf den neuen.

## Prozentuale Veränderung

- Beide Werte haben dieselbe Einheit und Abgrenzung.
- Bei einem Ausgangswert von 0 ist nur die absolute Veränderung bestimmbar.

**Typische Missverständnisse**

- +25 % und danach −25 % führen nicht zum Ausgangswert zurück: 80 → 100 → 75.
- Bei einem negativen Ausgangswert lässt sich die Prozentzahl nicht wie eine normale Wachstumsrate lesen.

## Rabatt & Erhöhung

- Rabatte liegen zwischen 0 und 100 %.
- Bei 100 % Rabatt lässt sich der ursprüngliche Preis nicht zurückrechnen.

**Typische Missverständnisse**

- 20 % und dann 10 % Rabatt sind zusammen 28 %, nicht 30 %.
- Wer vom reduzierten Preis zurückrechnet, darf nicht einfach 20 % aufschlagen: 80 € + 20 % = 96 €, nicht 100 €.

## Prozentpunkte

- Beide Prozentwerte beziehen sich auf dieselbe Größe.
- Bei einem alten Wert von 0 % ist keine relative Veränderung bestimmbar.

**Typische Missverständnisse**

- „Die Zinsen steigen um 1 %“ ist meist falsch formuliert, wenn 1 Prozentpunkt gemeint ist.
- Eine Verdopplung von 1 % auf 2 % sind nur +1 Prozentpunkt, aber +100 %.

## Dreisatz

- a und c sind größer als 0.
- Der gewählte Zusammenhang (direkt oder umgekehrt) gilt im ganzen Bereich.

**Typische Missverständnisse**

- Nicht jeder Zusammenhang ist proportional: Mengenrabatte oder Fixkosten brechen die Rechnung.
- Doppelt so viele Personen schaffen eine Aufgabe nur im idealisierten Modell in der halben Zeit.

## Gewichteter Durchschnitt

- Gewichte sind nicht negativ, mindestens eines ist größer als 0.

**Typische Missverständnisse**

- Quoten unterschiedlich großer Gruppen dürfen nicht einfach gemittelt werden.
- Gewichte müssen zur Frage passen – bei Durchschnittspreisen die Menge, nicht der Umsatz.

## Durchschnittliches Wachstum (CAGR)

- Anfangswert größer als 0, Endwert mindestens 0.
- Gleichmäßiges, zusammengesetztes Wachstum als Modell.

**Typische Missverständnisse**

- Die Gesamtveränderung geteilt durch die Jahre ergibt nicht die CAGR (21 % / 2 = 10,5 % statt 10 %).
- Negative Anfangs- oder Endwerte passen nicht in dieses Modell.

## Deckungsbeitrag (DB)

- Nettobeträge ohne Umsatzsteuer.
- Konstanter Preis und konstante variable Stückkosten.
- Ein Produkt bzw. eine gleichartige Leistung.

**Typische Missverständnisse**

- Der Deckungsbeitrag ist nicht der Gewinn – die Fixkosten fehlen noch.
- Volle Selbstkosten gehören nicht in das Feld „variable Kosten“.

## Break-even

- Konstante Preise, variable Stückkosten und Fixkosten im Zeitraum.
- Nettobeträge ohne Umsatzsteuer.
- Eine gleichartige Leistung.

**Typische Missverständnisse**

- Kostendeckung ist noch kein Gewinn: Bei genau 150 Stück ist das Ergebnis 0 €.
- Fixkosten pro Monat gehören zu einer Monatsmenge – nicht zu einer Jahresmenge.

## Gewinn & Zielgewinn

- Konstante Preise und Kosten im Zeitraum.
- Nettobeträge, keine Umsatzsteuer.
- Ganze Stückzahlen.

**Typische Missverständnisse**

- Ein kalkulatorischer Modellgewinn ist nicht automatisch das EBIT im Jahresabschluss.
- Zielgewinn 0 € bedeutet Kostendeckung, nicht positiven Gewinn.

## Marge & Aufschlag

- Nettobeträge ohne Umsatzsteuer.
- Die Kostenbasis ist klar definiert (z. B. Einstandspreis).

**Typische Missverständnisse**

- 20 % Aufschlag ergeben keine 20 % Marge.
- Die Rohmarge berücksichtigt Miete, Personal und andere Betriebskosten noch nicht.

## Verkaufspreis aus Zielmarge

- Nettobeträge ohne Umsatzsteuer.
- Rohmarge vor weiteren Betriebskosten.

**Typische Missverständnisse**

- Die Zielmarge nicht auf die Kosten aufschlagen: 80 € + 20 % = 96 € ergeben nur 16,67 % Marge.

## Gesamt- & Stückkosten

- Eine gleichartige Leistung (einstufige Divisionskalkulation).
- Fixkosten und Menge im selben Zeitraum.

**Typische Missverständnisse**

- Produzierte und verkaufte Menge sind nicht automatisch gleich.
- Stückkosten sind keine variablen Kosten – sie enthalten den Fixkostenanteil.

## Zuschlagskalkulation

- Vereinfachtes Schema ohne Sondereinzelkosten-Varianten oder Bestandsveränderungen.
- Zuschlagssätze stammen aus der eigenen Kostenstellenrechnung.

**Typische Missverständnisse**

- Selbstkosten sind keine variablen Stückkosten und gehören nicht in den Break-even-Rechner.
- Zuschlagssätze passen nur zu der Bezugsbasis, aus der sie ermittelt wurden.

## Stundenkostensatz

- Kosten und Stunden beziehen sich auf dieselbe Periode.

**Typische Missverständnisse**

- Arbeitszeit ist nicht gleich abrechenbare Zeit – Urlaub, Krankheit und Verwaltung zählen nicht.
- Der Kostensatz ist noch kein Verkaufspreis.

## Rabatt: nötiger Mehrabsatz

- Die variablen Kosten je Einheit bleiben gleich.
- Die Fixkosten sind vor und nach dem Rabatt vergleichbar.
- Nettopreise ohne Umsatzsteuer; Absatz im selben Zeitraum.

**Typische Missverständnisse**

- 10 % Rabatt verlangen nicht 10 % Mehrabsatz: Weil der Rabatt direkt vom Beitrag abgeht, ist der Effekt oft viel größer (hier 100 %).
- Mehr Umsatz ist nicht mehr Deckungsbeitrag: Bei sinkendem Stückbeitrag wächst der Umsatz schneller als der Beitrag.
- Der Rechner prüft nicht, ob die zusätzliche Nachfrage tatsächlich kommt.

## EBIT

- Vereinfachtes Modell, kein vollständiger HGB-/IFRS-Abschluss.
- Alle Werte aus derselben Periode.
- Zinsergebnis und Ertragsteuern nicht enthalten.

**Typische Missverständnisse**

- EBIT ist kein Kontostand und kein Cashflow.
- Abschreibungen nicht doppelt abziehen, wenn sie schon im Aufwand stecken.

## EBITDA

- Die hinzugerechneten Abschreibungen sind im EBIT enthalten.

**Typische Missverständnisse**

- EBITDA ist weder Cashflow noch frei verfügbares Geld.
- Abschreibungen auf Finanzanlagen gehören nicht ungeprüft dazu.

## EBIT-Marge

- EBIT und Umsatz aus derselben Periode.

**Typische Missverständnisse**

- Keine pauschalen Zielwerte: Übliche Margen unterscheiden sich stark nach Branche.
- Nicht mit Rohmarge oder Umsatzrendite verwechseln.

## Umsatzrendite

- Ergebnis und Umsatz aus derselben Periode.

**Typische Missverständnisse**

- Nicht mit Rohmarge, Deckungsbeitragsquote oder EBIT-Marge verwechseln.
- „Gewinn“ ist hier ausdrücklich das Ergebnis nach Zinsen und Steuern.

## Cashflow

- Direkte, vereinfachte Zahlungsübersicht – keine gesetzliche Kapitalflussrechnung.
- Zinsen und Steuern werden im Modell dem operativen Bereich zugeordnet.

**Typische Missverständnisse**

- Umsatz ist noch keine Einzahlung, solange die Rechnung offen ist.
- Abschreibungen sind Aufwand, aber keine Zahlung.
- EBITDA ist kein Cashflow.

## Working Capital

- Dieselbe Abgrenzung wie im Liquiditätsrechner.

**Typische Missverständnisse**

- Working Capital ist kein frei verfügbares Bankguthaben.
- Es ist eine Stichtagsgröße, kein Zahlungsstrom wie der Cashflow.

## Liquidität 1., 2. & 3. Grades

- Nicht überlappende Vermögensbeträge.
- Dieselbe Abgrenzung kurzfristiger Verpflichtungen wie beim Working Capital.

**Typische Missverständnisse**

- Keine universelle Ampel: Angemessene Werte hängen von Branche und Zahlungszielen ab.
- Stichtagswerte können sich wenige Tage später deutlich ändern.

## Eigenkapitalquote

- Eigenkapital und Bilanzsumme vom selben Stichtag.

**Typische Missverständnisse**

- Eine Quote allein ist keine Bonitätsbewertung.
- Negatives Eigenkapital bedeutet bilanzielle Überschuldung.

## Kapitalrendite (ROI)

- Einfache periodenbezogene Rendite.
- Keine Abzinsung, keine Jahreshochrechnung.

**Typische Missverständnisse**

- Umsatz gehört nicht in den Zähler – das wäre eher ein ROAS.
- Gewinn nicht doppelt um schon abgezogene Kosten mindern.

## Amortisationsdauer

- Konstante Rückflüsse je Periode.
- Statisches Modell ohne Abzinsung.

**Typische Missverständnisse**

- Was nach der Amortisation passiert, bleibt unberücksichtigt.
- Ohne Abzinsung zählt Geld in fünf Jahren so viel wie heute.

## Conversion Rate (CR)

- Zähler und Nenner aus demselben Zeitraum und derselben Messung.

**Typische Missverständnisse**

- Besuche, Besucher und Interaktionen nicht vermischen.
- Ereignisbasiert sind Werte über 100 % möglich.

## Klickrate (CTR)

- Gleiche Kampagne und gleicher Zeitraum für beide Zahlen.

**Typische Missverständnisse**

- Eine hohe CTR ist kein Umsatz.
- Werte über 100 % deuten auf Mehrfachklicks oder abweichende Messung hin.

## Kosten je Klick (CPC)

- Kosten und Klicks aus demselben Zeitraum.

**Typische Missverständnisse**

- Bei 0 Klicks gibt es keinen CPC – auch nicht 0 €.

## Tausenderkontaktpreis (CPM)

- Kosten und Impressionen aus demselben Zeitraum.

**Typische Missverständnisse**

- Eine Einblendung ist kein Kontakt mit Aufmerksamkeit.

## Kosten je Conversion (CPA)

- Attribution und Zeitraum transparent und gleich.

**Typische Missverständnisse**

- Eine Conversion ist nicht automatisch ein Neukunde.

## ROAS

- Umsatz und Kosten aus demselben Zeitraum und derselben Attribution.
- Werbewirtschaftlichkeit: konstante Deckungsbeitragsquote vor Werbekosten; die variablen Kosten sind darin schon abgezogen, die Werbekosten nicht.

**Typische Missverständnisse**

- ROAS ist keine Gewinnkennzahl.
- Attribution entscheidet, welcher Umsatz der Werbung zugerechnet wird.
- Ein Beitrag nach Werbekosten ist noch kein Gewinn: Weitere Fixkosten sind damit nicht gedeckt.
- Leads, Bestellungen und Neukunden sind verschiedene Bezugsgrößen und nicht ohne Erklärung gleichzusetzen.

## Neukundenkosten (CAC)

- Klare Kostenabgrenzung für den Zeitraum.

**Typische Missverständnisse**

- Leads oder Conversions sind keine Neukunden.
- Kosten und Kundengewinnung können zeitlich auseinanderliegen.

## Umsatz je Account (ARPU)

- Umsatz und Accountbestand aus derselben Periode.

**Typische Missverständnisse**

- Accounts sind nicht dasselbe wie Besucher oder Personen.

## Customer Lifetime Value (CLV)

- Konstante Werte, keine Abzinsung.
- Kein vollständiges Kohorten- oder Retention-Modell.

**Typische Missverständnisse**

- Umsatz-LTV und beitragsbasierter CLV sind nicht austauschbar.
- Eine Churn-Rate von 0 bedeutet keinen unendlichen Kundenwert.

## Churn & Kundenbindung

- Verlorene Kunden stammen aus dem Anfangsbestand.

**Typische Missverständnisse**

- Neukunden verbessern nicht die Retention der Anfangskunden.
- Kunden-Churn ist nicht dasselbe wie Umsatz-Churn.

## MRR & ARR

- Rabatte sind im eingegebenen Preis bereits berücksichtigt.

**Typische Missverständnisse**

- ARR ist kein garantierter oder verbuchter Jahresumsatz.
- Einmalgebühren und Steuern gehören nicht hinein.

## Net Promoter Score (NPS)

- Alle Antworten stammen aus derselben Befragung.

**Typische Missverständnisse**

- +30 ist keine 30-%-Zufriedenheitsquote.
- Kleine Stichproben schwanken stark.

## Soll-Ist-Abweichung

- Soll und Ist in derselben Einheit und Periode.

**Typische Missverständnisse**

- Ein Plus bei Kosten ist eine Überschreitung, kein Erfolg.

## Kapazitätsauslastung

- Gleiche Einheit und Periode.

**Typische Missverständnisse**

- Personen-, Maschinen- und Kalenderstunden nicht mischen.
- Eine Auslastung über 100 % wird nicht abgeschnitten.

## Lagerumschlag & Lagerdauer

- Wareneinsatz und Bestand in derselben Bewertungsbasis.
- Tagesbasis sichtbar gewählt.

**Typische Missverständnisse**

- Nicht Umsatz durch Bestand zu Einstandspreisen teilen.
- Die Lagerdauer ist ein Durchschnitt, nicht das Alter jedes Artikels.

## Herleitung der neuen Modelle

### Rabatt: nötiger Mehrabsatz (`rabatt-absatz`)

Gleicher Gesamtdeckungsbeitrag vorher und nachher: d₀ · q₀ = d₁ · q₁ mit d₀ = p₀ − v und d₁ = p₁ − v. Umgestellt: q₁ = q₀ · d₀ / d₁, Absatzfaktor = d₀ / d₁, Mehrabsatz = (Faktor − 1) · 100 %.
Voraussetzungen: konstante variable Stückkosten v, vergleichbare Fixkostenbasis, d₀ > 0 und d₁ > 0. Ist d₁ ≤ 0, gibt es keine Menge, die den Beitrag erreicht (kein endlicher und kein „unendlicher“ Wert). Ganze Stückzahlen werden erst am Ende aufgerundet (q₀ · d₀ wird vor der Division multipliziert) und gegen die ungerundeten Werte geprüft.
Das Modell sagt nichts darüber, ob die Nachfrage erreichbar ist. Es ist eine Standardumformung der Deckungsbeitragsrechnung (Lehrbuchdarstellung); eine externe Primärquelle ist dafür nicht hinterlegt.

### Werbewirtschaftlichkeit und Mindest-ROAS (`roas`, Modus „Werbewirtschaftlichkeit“)

Mit der Deckungsbeitragsquote u vor Werbekosten (variable Kosten bereits abgezogen): DB vor Werbung = Umsatz · u; Beitrag nach Werbung = DB vor Werbung − Werbekosten. Der Beitrag ist ≥ 0, wenn Umsatz · u ≥ Werbekosten, also ROAS = Umsatz / Werbekosten ≥ 1 / u. Daraus Mindest-ROAS = 1 / u (nur für u > 0).
Weitere Fixkosten sind nicht berücksichtigt; Attribution und Messzeitraum bestimmen den Umsatz. Bei Werbekosten 0 ist der ROAS nicht definiert, bei u = 0 ist der Mindest-ROAS nicht definiert.

### Ablauf „Preis und Wirtschaftlichkeit“

Der Ablauf verwendet ausschließlich die Rechenfunktionen von Deckungsbeitrag, Break-even, Gewinn und Verkaufspreis aus Zielmarge; er enthält keine eigene Formel. Eine Vollkostenangabe wird nicht als variable Kosten übernommen, damit Fixkosten nicht doppelt zählen.
