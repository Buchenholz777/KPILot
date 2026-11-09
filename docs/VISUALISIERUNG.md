# Visualisierungskonzept

Stand: 09.11.2026. Grundsatz: Ein Diagramm wird nur ergänzt, wenn es etwas zeigt, das die Zahl allein nicht zeigt. Alle Ergebnisse bleiben als Zahlen bestehen; das Diagramm ist zusätzlich, aktualisiert sich mit jeder Eingabe, hat eine Textbeschreibung (`aria-label`) und eine Tabellenalternative („Werte als Tabelle“). Umsetzung ohne neue Bibliothek: `src/scripts/charts.ts` (SVG als Text), Daten kommen aus den Rechenmodulen (`chart`), getestet in `tests/charts.test.ts`.

## Rechner mit Diagramm (10 von 41)

| Rechner | Diagramm | Nutzen |
|---|---|---|
| Break-even (schon vorhanden) | Umsatz- und Gesamtkostenlinie, Schnittpunkt = Gewinnschwelle | zeigt Verlust- und Gewinnzone |
| Rabatt: nötiger Mehrabsatz (schon vorhanden) | Beitrag je Einheit vorher/nachher, Absatz vorher/nachher | zeigt, warum ein Rabatt viel Mehrabsatz braucht |
| **Deckungsbeitrag** (neu) | Preis = variable Kosten + Deckungsbeitrag | zeigt, was zur Fixkostendeckung übrig bleibt; bei negativem Beitrag kein Diagramm (Meldung erklärt es) |
| **Margenrechner** (neu) | links Kosten und Rohertrag in €, rechts Marge (vom Preis) und Aufschlag (auf Kosten) | macht den häufigsten Irrtum sichtbar: gleicher Rohertrag, zwei verschiedene Prozentwerte |
| **Rabattrechner** (neu) | Ausgangs- und Endpreis (Modi „Preis nach Rabatt/Erhöhung“) | zeigt die Preisänderung auf einen Blick |
| **Cashflow** (neu) | operativ: Ein-/Auszahlungen und Cashflow; erweitert: operativ, investiv, Finanzierung, netto | zeigt, aus welchem Bereich das Geld kommt bzw. geht; negative Werte in Warnfarbe |
| **Eigenkapitalquote** (neu) | Eigenkapital, Fremdkapital, Gesamtkapital | zeigt die Kapitalstruktur |
| **ROI** (neu) | eingesetztes Kapital und Gewinn | zeigt das Verhältnis, das der Prozentwert beschreibt |
| **Soll-Ist-Abweichung** (neu) | Soll und Ist nebeneinander | zeigt Größe und Richtung der Abweichung |
| **Amortisation** (neu) | kumulierte Rückflüsse gegen Investitionsbetrag über die Zeit; Schnittpunkt = Amortisationsdauer | zeigt, wann sich die Investition trägt |

Die Spalte „Diagramm“ in `docs/RECHNER-INVENTAR.md` wird bei jedem `npm run docs` aus dem Code erzeugt.

## Bewusst ohne Diagramm

| Rechner | Begründung |
|---|---|
| Prozentrechner, Prozentpunkte, Dreisatz, Veränderung, CAGR, gewichteter Durchschnitt | Ergebnis ist eine einzelne Zahl; die vorhandene Illustration zeigt das Prinzip, ein Diagramm würde nur wiederholen |
| EBIT, EBITDA, EBIT-Marge, Umsatzrendite, Working Capital, Liquiditätsgrade | Rechenstufen sind kurze Summen/Quoten; die Rechenweg-Liste ist aussagekräftiger. Mögliche spätere Ergänzung: Ergebnisbrücke (Wasserfall) |
| Conversion, CTR, CPC, CPM, CPA, CAC, ARPU, Churn, NPS, MRR/ARR | Zähler und Nenner haben typischerweise sehr unterschiedliche Größenordnungen (z. B. 20 Käufe zu 2.000 Besuchen); ein Balkendiagramm wäre nicht ablesbar |
| Stundenkostensatz | nur zwei Eingaben (Kosten, Stunden); eine Kostenaufteilung würde eingabefremde Annahmen erfordern |
| Stückkosten, Zuschlagskalkulation, Lagerkennzahlen, Auslastung | Schema bzw. Verhältnis ohne zusätzlichen Erkenntnisgewinn im Diagramm |
| Verkaufspreis aus Zielmarge, Gewinn, CLV, ROAS | Gewinn, CLV und ROAS besitzen Szenariovergleiche; ein zusätzliches Diagramm ist offen (siehe „Empfohlene Ausbaustufe“). Bei Stückkosten wäre eine Kurve „Stückkosten je Menge“ (Fixkostendegression) sinnvoll und ist dort ebenfalls offen |

## Technische Eigenschaften

- Kein Aufwand bei Eingabe: SVG-Text wird nur bei gültigem Ergebnis erzeugt, keine Animation (daher auch keine Bewegung bei `prefers-reduced-motion`).
- Negative Werte: Balkenhöhe = Betrag, Warnfarbe plus Vorzeichen im Wert; das Diagramm ist nicht ausschließlich farblich lesbar.
- Lange Beschriftungen brechen in zwei Zeilen um; ein Balken-Diagramm mit einem Feld ist zentriert, mit zwei Feldern nebeneinander.
- Linien-Diagramm (Break-even, Amortisation) beschriftet die Achse mit der passenden Einheit (Stück bzw. Jahre/Quartale/Monate).

## Empfohlene Ausbaustufe

- Gewinn und CLV: Ergebnisse der drei Szenarien (vorsichtig/realistisch/optimistisch) als Balken.
- EBIT/EBITDA: Wasserfall von Umsatz bis EBIT.
- Diagramm als Bild exportieren (PNG): technisch möglich, wurde nicht umgesetzt, weil die Diagramme Systemschrift und Muster verwenden und der Export zusätzliche Tests auf Farben und Schriftdarstellung erfordert.
