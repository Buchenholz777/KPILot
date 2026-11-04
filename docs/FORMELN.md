# Formeldokumentation – alle 40 Themen

> Automatisch erzeugt mit `npm run docs` aus `src/data/topics/*` und `src/calc/modules/*`.

## 01. Prozentrechner

- ID: `prozent` · URL: `/prozentrechner/` · Kategorie: Prozent & Grundlagen
- Varianten: `prozentwert` (Prozentwert), `prozentsatz` (Prozentsatz), `grundwert` (Grundwert)

    Prozentwert W = Grundwert G × Prozentsatz p / 100
    Prozentsatz p = W / G × 100
    Grundwert G = W × 100 / p

- **G**: Grundwert – das Ganze, entspricht 100 %
- **p**: Prozentsatz – der Anteil in Prozent
- **W**: Prozentwert – der Teil in derselben Einheit wie G

Beispiel (Prozentwert): W = G × p / 100 → W = 250 × 20 / 100 = 50 ⇒ **Prozentwert W: 50**

Beispiel (Prozentsatz): p = W / G × 100 → p = 50 / 250 × 100 = 20 % ⇒ **Prozentsatz p: 20 %**

Beispiel (Grundwert): G = W × 100 / p → G = 50 × 100 / 20 = 250 ⇒ **Grundwert G: 250**

## 02. Prozentuale Veränderung

- ID: `veraenderung` · URL: `/prozentuale-veraenderung/` · Kategorie: Prozent & Grundlagen
- Varianten: `standard` (Veränderung)

    Differenz = neuer Wert − alter Wert
    Veränderung in % = Differenz / alter Wert × 100

- **alter Wert**: Ausgangswert, auf den sich die Prozentangabe bezieht
- **neuer Wert**: Vergleichswert nach der Veränderung

Beispiel: Differenz = neuer Wert − alter Wert = 100 − 80 = +20 → Veränderung = Differenz / alter Wert × 100 = 20 / 80 × 100 = +25 % ⇒ **Relative Veränderung: +25 %**

## 03. Rabatt & Erhöhung

- ID: `rabatt` · URL: `/rabattrechner/` · Kategorie: Prozent & Grundlagen
- Varianten: `rabatt` (Preis nach Rabatt), `erhoehung` (Preis nach Erhöhung), `ursprung-rabatt` (Ursprungspreis (Rabatt)), `ursprung-erhoehung` (Ursprungspreis (Erhöhung)), `zwei-aenderungen` (Zwei Änderungen)

    Endpreis nach Rabatt = Ausgangspreis × (1 − Rabatt / 100)
    Endpreis nach Erhöhung = Ausgangspreis × (1 + Erhöhung / 100)
    Ausgangspreis = Endpreis / Faktor
    Zwei Änderungen: Gesamtfaktor = Faktor 1 × Faktor 2

- **Rabatt**: Nachlass in % vom Ausgangspreis (0 bis 100 %)
- **Erhöhung**: Zuschlag in % vom Ausgangspreis (auch über 100 %)
- **Faktor**: z. B. 0,8 bei 20 % Rabatt oder 1,1 bei 10 % Erhöhung

Beispiel (Preis nach Rabatt): Endpreis = Ausgangspreis × (1 − Rabatt / 100) → = 100,00 € × (1 − 20 %) = 80,00 € ⇒ **Endpreis nach Rabatt: 80,00 €**

Beispiel (Preis nach Erhöhung): Endpreis = Ausgangspreis × (1 + Erhöhung / 100) → = 100,00 € × (1 + 10 %) = 110,00 € ⇒ **Endpreis nach Erhöhung: 110,00 €**

Beispiel (Ursprungspreis (Rabatt)): Ausgangspreis = Endpreis / (1 − Rabatt / 100) → = 80,00 € / 0,8 = 100,00 € ⇒ **Ursprünglicher Preis: 100,00 €**

Beispiel (Ursprungspreis (Erhöhung)): Ausgangspreis = Endpreis / (1 + Erhöhung / 100) → = 110,00 € / 1,1 = 100,00 € ⇒ **Ursprünglicher Preis: 100,00 €**

Beispiel (Zwei Änderungen): Faktor 1 = 0,8, Faktor 2 = 0,9 → Gesamtfaktor = 0,8 × 0,9 = 0,72 → Gesamtveränderung = (Gesamtfaktor − 1) × 100 = −28 % → Endpreis = 100,00 € × 0,72 = 72,00 € ⇒ **Gesamtveränderung: −28 %**

## 04. Prozentpunkte

- ID: `prozentpunkte` · URL: `/prozentpunkte-rechner/` · Kategorie: Prozent & Grundlagen
- Varianten: `standard` (Prozentpunkte)

    Prozentpunkte = neuer Prozentwert − alter Prozentwert
    Relative Veränderung = Prozentpunkte / alter Prozentwert × 100

- **alter Prozentwert**: z. B. Zinssatz, Quote oder Anteil vorher
- **neuer Prozentwert**: derselbe Wert nachher

Beispiel: Prozentpunkte = neuer Wert − alter Wert = 6 % − 5 % = +1 Prozentpunkt → Relative Veränderung = Differenz / alter Wert × 100 = 1 % / 5 % × 100 = +20 % ⇒ **Differenz in Prozentpunkten: +1 Prozentpunkt**

## 05. Dreisatz

- ID: `dreisatz` · URL: `/dreisatz-rechner/` · Kategorie: Prozent & Grundlagen
- Varianten: `direkt` (Direkt proportional), `umgekehrt` (Umgekehrt proportional)

    direkt proportional: x = b × c / a
    umgekehrt proportional: x = a × b / c

- **a**: bekannte Menge
- **b**: zugehöriger Wert bei a
- **c**: gesuchte Menge
- **x**: gesuchter Wert bei c

Beispiel (Direkt proportional): 1 Einheit: 12 / 3 = 4 → 5 Einheiten: 4 × 5 = 20 ⇒ **Wert bei Menge c: 20**

Beispiel (Umgekehrt proportional): Gesamtmenge: 3 × 6 = 18 → Bei 6: 18 / 6 = 3 ⇒ **Andere Größe bei Menge c: 3**

## 06. Gewichteter Durchschnitt

- ID: `durchschnitt` · URL: `/gewichteter-durchschnitt/` · Kategorie: Prozent & Grundlagen
- Varianten: `standard` (Gewichteter Durchschnitt)

    Durchschnitt = Summe(Wert × Gewicht) / Summe(Gewichte)

- **Wert x**: z. B. Preis, Note, Quote einer Gruppe
- **Gewicht w**: z. B. Menge, Anzahl, Anteil (nicht negativ)

Beispiel: Summe(Wert × Gewicht) = 10 × 1 + 20 × 3 = 70 → Summe(Gewichte) = 1 + 3 = 4 → Durchschnitt = 70 / 4 = 17,5 ⇒ **Gewichteter Durchschnitt: 17,5**

## 07. Durchschnittliches Wachstum (CAGR)

- ID: `cagr` · URL: `/cagr-rechner/` · Kategorie: Prozent & Grundlagen
- Varianten: `standard` (CAGR)

    CAGR = ((Endwert / Anfangswert)^(1 / Jahre) − 1) × 100

- **Anfangswert**: Wert zu Beginn (größer als 0)
- **Endwert**: Wert am Ende (nicht negativ)
- **Jahre**: Abstand in Jahren, auch gebrochen

Beispiel: CAGR = ((Endwert / Anfangswert)^(1 / Jahre) − 1) × 100 → = ((121 / 100)^(1 / 2) − 1) × 100 = +10 % ⇒ **Durchschnittliches Wachstum pro Jahr: +10 %**

## 08. Deckungsbeitrag (DB)

- ID: `deckungsbeitrag` · URL: `/deckungsbeitragsrechner/` · Kategorie: Kostenrechnung & Preise
- Varianten: `standard` (Deckungsbeitrag)

    Stückdeckungsbeitrag d = p − v
    Deckungsbeitragsquote = d / p × 100
    Gesamtdeckungsbeitrag = d × q

- **p**: Nettoverkaufspreis je Stück
- **v**: variable Kosten je Stück
- **q**: verkaufte Stückzahl

Beispiel: Stückdeckungsbeitrag d = p − v = 50,00 € − 30,00 € = 20,00 € → Deckungsbeitragsquote = d / p × 100 = 20,00 € / 50,00 € × 100 = 40 % → Gesamtdeckungsbeitrag = d × q = 20,00 € × 100 = 2.000,00 € → Umsatz = p × q = 50,00 € × 100 = 5.000,00 € ⇒ **Stückdeckungsbeitrag: 20,00 € je Stück**

## 09. Break-even

- ID: `break-even` · URL: `/break-even-rechner/` · Kategorie: Kostenrechnung & Preise
- Varianten: `standard` (Break-even)

    d = p − v
    Break-even-Menge = F / d
    Break-even-Umsatz = Break-even-Menge × p

- **p**: Nettoverkaufspreis je Stück
- **v**: variable Kosten je Stück
- **F**: Fixkosten im gewählten Zeitraum
- **d**: Stückdeckungsbeitrag

Beispiel: Stückdeckungsbeitrag d = p − v = 50,00 € − 30,00 € = 20,00 € → Theoretische Menge = F / d = 3.000,00 € / 20,00 € = 150 Stück → Aufgerundet auf ganze Stück: 150 Stück → Ergebnis bei 150 Stück = d × q − F = 20,00 € × 150 − 3.000,00 € = 0,00 € ⇒ **Theoretische Gewinnschwelle: 150 Stück**

## 10. Gewinn & Zielgewinn

- ID: `gewinn` · URL: `/gewinnrechner/` · Kategorie: Kostenrechnung & Preise
- Varianten: `menge` (Gewinn bei Stückzahl), `zielgewinn` (Stückzahl für Zielgewinn)

    Ergebnis = (p − v) × q − F
    Benötigte Menge = (F + Zielgewinn) / (p − v)

- **p**: Nettoverkaufspreis je Stück
- **v**: variable Kosten je Stück
- **F**: Fixkosten im Zeitraum
- **q**: Stückzahl
- **Zielgewinn**: gewünschtes Ergebnis

Beispiel (Gewinn bei Stückzahl): Umsatz = p × q = 50,00 € × 200 = 10.000,00 € → Gesamtkosten = F + v × q = 3.000,00 € + 30,00 € × 200 = 9.000,00 € → Ergebnis = Umsatz − Gesamtkosten = 10.000,00 € − 9.000,00 € = 1.000,00 € ⇒ **Gewinn: +1.000,00 €**

Beispiel (Stückzahl für Zielgewinn): d = p − v = 50,00 € − 30,00 € = 20,00 € → Menge = (F + Z) / d = (3.000,00 € + 1.000,00 €) / 20,00 € = 200 Stück → Aufgerundet: 200 Stück → Ergebnis 20,00 € × 200 − 3.000,00 € = 1.000,00 € ⇒ **Benötigte Stückzahl (aufgerundet): 200 Stück**

## 11. Marge & Aufschlag

- ID: `marge` · URL: `/margenrechner/` · Kategorie: Kostenrechnung & Preise
- Varianten: `standard` (Marge & Aufschlag)

    Differenz = Verkaufspreis − Kostenbasis
    Marge = Differenz / Verkaufspreis × 100
    Aufschlag = Differenz / Kostenbasis × 100

- **Kostenbasis**: z. B. Einstandspreis netto
- **Verkaufspreis**: Nettoverkaufspreis

Beispiel: Differenz = Verkaufspreis − Kostenbasis = 100,00 € − 80,00 € = 20,00 € → Marge = Differenz / Verkaufspreis × 100 = 20,00 € / 100,00 € × 100 = 20 % → Aufschlag = Differenz / Kostenbasis × 100 = 20,00 € / 80,00 € × 100 = 25 % ⇒ **Marge (Handelsspanne): +20 %**

## 12. Verkaufspreis aus Zielmarge

- ID: `zielpreis` · URL: `/verkaufspreis-berechnen/` · Kategorie: Kostenrechnung & Preise
- Varianten: `standard` (Verkaufspreis aus Zielmarge)

    Verkaufspreis = Kostenbasis / (1 − Zielmarge / 100)

- **Kostenbasis**: Kosten je Stück (größer als 0)
- **Zielmarge**: gewünschte Rohmarge in % vom Verkaufspreis (0 bis unter 100)

Beispiel: Verkaufspreis = Kostenbasis / (1 − Zielmarge / 100) → = 80,00 € / (1 − 20 %) = 80,00 € / 0,8 = 100 € → Auf volle Cent aufgerundet: 100,00 €; Marge = (100,00 € − 80,00 €) / 100,00 € × 100 = 20 % ⇒ **Mindest-Verkaufspreis (auf Cent aufgerundet): 100,00 €**

## 13. Gesamt- & Stückkosten

- ID: `stueckkosten` · URL: `/stueckkosten-rechner/` · Kategorie: Kostenrechnung & Preise
- Varianten: `standard` (Gesamt- & Stückkosten)

    Gesamtkosten K = F + v × q
    Stückkosten = K / q

- **F**: Fixkosten im Zeitraum
- **v**: variable Kosten je Stück
- **q**: produzierte Menge im selben Zeitraum

Beispiel: Gesamtkosten K = F + v × q = 1.000,00 € + 10,00 € × 100 = 2.000,00 € → Stückkosten = K / q = 2.000,00 € / 100 = 20,00 € ⇒ **Stückkosten: 20,00 € je Stück**

## 14. Zuschlagskalkulation

- ID: `zuschlag` · URL: `/zuschlagskalkulation/` · Kategorie: Kostenrechnung & Preise
- Varianten: `schema` (Kalkulationsschema), `satz` (Zuschlagssatz ermitteln)

    Materialkosten = MEK + MEK × MGK-Satz
    Fertigungskosten = FEK + FEK × FGK-Satz + Sondereinzelkosten Fertigung
    Herstellkosten = Materialkosten + Fertigungskosten
    Selbstkosten = Herstellkosten × (1 + VwGK-Satz + VtGK-Satz) + Sondereinzelkosten Vertrieb

- **MEK**: Materialeinzelkosten
- **MGK**: Materialgemeinkosten (Zuschlag auf MEK)
- **FEK**: Fertigungseinzelkosten (Fertigungslöhne)
- **FGK**: Fertigungsgemeinkosten (Zuschlag auf FEK)
- **VwGK**: Verwaltungsgemeinkosten (Zuschlag auf Herstellkosten)
- **VtGK**: Vertriebsgemeinkosten (Zuschlag auf Herstellkosten)

Beispiel (Kalkulationsschema): Materialkosten = 100,00 € + 10 % = 100,00 € + 10,00 € = 110,00 € → Fertigungskosten = 50,00 € + 20 % + 0,00 € = 50,00 € + 10,00 € + 0,00 € = 60,00 € → Herstellkosten = 110,00 € + 60,00 € = 170,00 € → Verwaltung 5 % von 170,00 € = 8,50 €; Vertrieb 10 % von 170,00 € = 17,00 € → Selbstkosten = 170,00 € + 8,50 € + 17,00 € + 0,00 € = 195,50 € ⇒ **Selbstkosten: 195,50 €**

Beispiel (Zuschlagssatz ermitteln): Zuschlagssatz = Gemeinkosten / Bezugsbasis × 100 = 20.000,00 € / 100.000,00 € × 100 = 20 % → Zuschlag der Leistung = 50,00 € × 20 % = 10,00 € ⇒ **Zuschlagssatz: 20 %**

## 15. Stundenkostensatz

- ID: `stundensatz` · URL: `/stundenkostensatz-rechner/` · Kategorie: Kostenrechnung & Preise
- Varianten: `standard` (Stundenkostensatz)

    Kosten je Stunde = Periodenkosten / abrechenbare Stunden

- **Periodenkosten**: alle zugeordneten Kosten der Periode
- **abrechenbare Stunden**: produktiv nutzbare Stunden derselben Periode

Beispiel: Kostensatz = Periodenkosten / abrechenbare Stunden = 1.200,00 € / 60 h = 20,00 €/h ⇒ **Kosten je Stunde: 20,00 € je Stunde**

## 16. EBIT

- ID: `ebit` · URL: `/ebit-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (EBIT)

    EBIT = Umsatzerlöse + sonstige betriebliche Erträge − betriebliche Aufwendungen ohne Abschreibungen − Abschreibungen

- **Umsatzerlöse**: Nettoumsatz der Periode
- **sonstige betriebliche Erträge**: z. B. Mieteinnahmen
- **Aufwendungen ohne Abschreibungen**: Material, Personal, sonstiger Betriebsaufwand
- **Abschreibungen**: Wertverlust des Anlagevermögens

Beispiel: EBIT = Umsatzerlöse + sonstige Erträge − Aufwendungen ohne Abschreibungen − Abschreibungen → = 100.000,00 € + 0,00 € − 70.000,00 € − 10.000,00 € = 20.000,00 € ⇒ **EBIT: +20.000,00 €**

## 17. EBITDA

- ID: `ebitda` · URL: `/ebitda-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (EBITDA)

    EBITDA = EBIT + Abschreibungen auf Sachanlagen und immaterielle Vermögenswerte

- **EBIT**: Ergebnis vor Zinsen und Ertragsteuern
- **Abschreibungen**: die im EBIT abgezogenen betrieblichen Abschreibungen

Beispiel: EBITDA = EBIT + Abschreibungen = 20.000,00 € + 10.000,00 € = 30.000,00 € ⇒ **EBITDA: +30.000,00 €**

## 18. EBIT-Marge

- ID: `ebit-marge` · URL: `/ebit-marge-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (EBIT-Marge)

    EBIT-Marge = EBIT / Nettoumsatz × 100

- **EBIT**: Ergebnis vor Zinsen und Ertragsteuern
- **Nettoumsatz**: Umsatzerlöse derselben Periode

Beispiel: EBIT-Marge = EBIT / Nettoumsatz × 100 = 20.000,00 € / 100.000,00 € × 100 = 20 % ⇒ **EBIT-Marge: +20 %**

## 19. Umsatzrendite

- ID: `umsatzrendite` · URL: `/umsatzrendite-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (Nettoumsatzrendite)

    Nettoumsatzrendite = Jahresüberschuss / Nettoumsatz × 100

- **Jahresüberschuss**: Ergebnis nach Zinsen und Ertragsteuern
- **Nettoumsatz**: Umsatzerlöse derselben Periode

Beispiel: Umsatzrendite = Jahresüberschuss / Nettoumsatz × 100 = 8.000,00 € / 100.000,00 € × 100 = 8 % ⇒ **Nettoumsatzrendite: +8 %**

## 20. Cashflow

- ID: `cashflow` · URL: `/cashflow-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `operativ` (Operativer Cashflow), `erweitert` (Erweiterte Übersicht)

    Operativer Cashflow = betriebliche Einzahlungen − betriebliche Auszahlungen
    Netto-Cashflow = operativ + investiv + Finanzierung

- **Einzahlungen**: tatsächlich eingegangene Zahlungen
- **Auszahlungen**: tatsächlich geleistete Zahlungen
- **investiv**: Kauf und Verkauf von Anlagen
- **Finanzierung**: Kredite, Tilgungen, Einlagen, Entnahmen

Beispiel (Operativer Cashflow): Operativer Cashflow = Einzahlungen − Auszahlungen = 30.000,00 € − 22.000,00 € = 8.000,00 € ⇒ **Operativer Cashflow: +8.000,00 €**

Beispiel (Erweiterte Übersicht): Operativ = 30.000,00 € − 22.000,00 € = 8.000,00 € → Investiv = 0,00 € − 5.000,00 € = −5.000,00 € → Finanzierung = 2.000,00 € − 0,00 € = 2.000,00 € → Netto = 8.000,00 € + −5.000,00 € + 2.000,00 € = 5.000,00 € ⇒ **Erfasster Netto-Cashflow: +5.000,00 €**

## 21. Working Capital

- ID: `working-capital` · URL: `/working-capital-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (Working Capital)

    Working Capital = Umlaufvermögen − kurzfristige Verpflichtungen

- **Umlaufvermögen**: liquide Mittel, Forderungen, Vorräte, sonstiges
- **kurzfristige Verpflichtungen**: kurzfristige Verbindlichkeiten inkl. kurzfristiger Rückstellungen

Beispiel: Working Capital = Umlaufvermögen − kurzfristige Verpflichtungen = 50.000,00 € − 30.000,00 € = 20.000,00 € ⇒ **Working Capital: +20.000,00 €**

## 22. Liquidität 1., 2. & 3. Grades

- ID: `liquiditaet` · URL: `/liquiditaetsrechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (Liquiditätsgrade)

    L1 = liquide Mittel / kurzfristige Verpflichtungen × 100
    L2 = (liquide Mittel + Forderungen) / kurzfristige Verpflichtungen × 100
    L3 = Umlaufvermögen / kurzfristige Verpflichtungen × 100

- **liquide Mittel**: Kasse, Bank, kurzfristig verfügbare Zahlungsmitteläquivalente
- **Forderungen**: kurzfristige Forderungen
- **Umlaufvermögen**: liquide Mittel + Forderungen + Vorräte + Sonstiges

Beispiel: L1 = liquide Mittel / Verpflichtungen × 100 = 10.000,00 € / 20.000,00 € × 100 = 50 % → L2 = (liquide Mittel + Forderungen) / Verpflichtungen × 100 = 25.000,00 € / 20.000,00 € × 100 = 125 % → L3 = Umlaufvermögen / Verpflichtungen × 100 = 50.000,00 € / 20.000,00 € × 100 = 250 % ⇒ **Liquidität 1. Grades: 50 %**

## 23. Eigenkapitalquote

- ID: `eigenkapital` · URL: `/eigenkapitalquote-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (Eigenkapitalquote)

    Eigenkapitalquote = Eigenkapital / Gesamtkapital × 100

- **Eigenkapital**: eigene Mittel laut Bilanz, kann negativ sein
- **Gesamtkapital**: Bilanzsumme am selben Stichtag

Beispiel: Quote = Eigenkapital / Gesamtkapital × 100 = 30.000,00 € / 100.000,00 € × 100 = 30 % ⇒ **Eigenkapitalquote: 30 %**

## 24. Kapitalrendite (ROI)

- ID: `roi` · URL: `/roi-rechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (ROI)

    ROI = Gewinn der Periode / eingesetztes Kapital × 100

- **Gewinn**: zurechenbarer Gewinn – nicht Umsatz
- **eingesetztes Kapital**: größer als 0

Beispiel: ROI = Gewinn / eingesetztes Kapital × 100 = 5.000,00 € / 50.000,00 € × 100 = 10 % ⇒ **ROI im betrachteten Zeitraum: +10 %**

## 25. Amortisationsdauer

- ID: `amortisation` · URL: `/amortisationsrechner/` · Kategorie: Finanzen & Liquidität
- Varianten: `standard` (Amortisationsdauer)

    Amortisationsdauer = Investitionsbetrag / Netto-Zahlungsüberschuss je Periode

- **Investitionsbetrag**: anfängliche Auszahlung
- **Netto-Zahlungsüberschuss**: zusätzliche Einzahlungen minus Auszahlungen je Periode

Beispiel: Amortisationsdauer = Investition / Überschuss je Periode = 10.000,00 € / 2.500,00 € = 4 Jahre ⇒ **Amortisationsdauer: 4 Jahre**

## 26. Conversion Rate (CR)

- ID: `conversion` · URL: `/conversion-rate-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `besuche` (Besuchsbasiert), `ereignisse` (Ereignisbasiert)

    besuchsbasiert: Besuche mit Conversion / Besuche × 100
    ereignisbasiert: Conversion-Ereignisse / Interaktionen × 100

- **Besuche**: Sitzungen im Zeitraum
- **Conversion**: definiertes Ziel, z. B. Kauf oder Anfrage
- **Interaktionen**: z. B. Anzeigenklicks

Beispiel (Besuchsbasiert): Conversion Rate = konvertierte Besuche / Besuche × 100 = 25 / 1.000 × 100 = 2,5 % ⇒ **Conversion Rate: 2,5 %**

Beispiel (Ereignisbasiert): Rate = Ereignisse / Interaktionen × 100 = 25 / 1.000 × 100 = 2,5 % ⇒ **Conversion Rate (Ereignisse): 2,5 %**

## 27. Klickrate (CTR)

- ID: `ctr` · URL: `/ctr-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `standard` (CTR)

    CTR = Klicks / Impressionen × 100

- **Klicks**: Anzahl der Klicks
- **Impressionen**: Anzahl der Einblendungen

Beispiel: CTR = Klicks / Impressionen × 100 = 200 / 10.000 × 100 = 2 % ⇒ **Klickrate (CTR): 2 %**

## 28. Kosten je Klick (CPC)

- ID: `cpc` · URL: `/cpc-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `standard` (CPC)

    CPC = Werbekosten / Klicks

- **Werbekosten**: Kosten der Kampagne im Zeitraum
- **Klicks**: Anzahl der Klicks im Zeitraum

Beispiel: CPC = Werbekosten / Klicks = 100,00 € / 200 = 0,50 € ⇒ **Durchschnittlicher CPC: 0,50 € je Klick**

## 29. Tausenderkontaktpreis (CPM)

- ID: `cpm` · URL: `/cpm-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `standard` (CPM)

    CPM = Werbekosten / Impressionen × 1.000

- **Werbekosten**: Kosten im Zeitraum
- **Impressionen**: Einblendungen im Zeitraum

Beispiel: CPM = Werbekosten / Impressionen × 1.000 = 100,00 € / 50.000 × 1.000 = 2,00 € ⇒ **CPM: 2,00 € je 1.000 Impressionen**

## 30. Kosten je Conversion (CPA)

- ID: `cpa` · URL: `/cpa-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `standard` (CPA)

    CPA = Werbekosten / Conversions

- **Werbekosten**: zugeordnete Kosten im Zeitraum
- **Conversions**: definierte Zielereignisse im Zeitraum

Beispiel: CPA = Werbekosten / Conversions = 500,00 € / 20 = 25,00 € ⇒ **CPA: 25,00 € je Conversion**

## 31. ROAS

- ID: `roas` · URL: `/roas-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `standard` (ROAS)

    ROAS (Faktor) = Werbeumsatz / Werbekosten
    ROAS (%) = Faktor × 100

- **Werbeumsatz**: Umsatz, den die Messung der Werbung zuordnet
- **Werbekosten**: Kosten der Werbung im selben Zeitraum

Beispiel: ROAS = Werbeumsatz / Werbekosten = 2.000,00 € / 500,00 € = 4,0-fach = 400 % ⇒ **ROAS: 4,0-fach**

## 32. Neukundenkosten (CAC)

- ID: `cac` · URL: `/cac-rechner/` · Kategorie: Marketing & Vertrieb
- Varianten: `standard` (CAC)

    CAC = (Marketingkosten + Vertriebskosten) / Neukunden

- **Marketingkosten**: zugeordnete Kosten im Zeitraum
- **Vertriebskosten**: zugeordnete Kosten im Zeitraum
- **Neukunden**: echte neu gewonnene Kunden

Beispiel: CAC = (Marketing + Vertrieb) / Neukunden = (2.000,00 € + 1.000,00 €) / 30 = 100,00 € ⇒ **CAC: 100,00 € je Neukunde**

## 33. Umsatz je Account (ARPU)

- ID: `arpu` · URL: `/arpu-rechner/` · Kategorie: Produkt & Kunden
- Varianten: `standard` (ARPU)

    ARPU = Umsatz der Periode / durchschnittlich aktive Accounts

- **Umsatz**: zugeordneter Umsatz der Periode
- **aktive Accounts**: Durchschnitt der Periode (Abrechnungseinheiten)

Beispiel: ARPU = Umsatz / durchschnittlich aktive Accounts = 5.000,00 € / 100 = 50,00 € ⇒ **ARPU: 50,00 € je Account und Monat**

## 34. Customer Lifetime Value (CLV)

- ID: `clv` · URL: `/clv-rechner/` · Kategorie: Produkt & Kunden
- Varianten: `standard` (Customer Lifetime Value)

    CLV = Bestellwert × Käufe pro Jahr × Jahre × DB-Quote / 100
    Optional: Modellbeitrag nach Akquisition = CLV − CAC

- **Bestellwert**: durchschnittlicher Nettobestellwert
- **Käufe pro Jahr**: Kaufhäufigkeit
- **Jahre**: angenommene Beziehungsdauer
- **DB-Quote**: Deckungsbeitragsquote in %

Beispiel: Lebenszeit-Umsatz = 50,00 € × 4 Käufe/Jahr × 3 Jahre = 600,00 € → CLV = Lebenszeit-Umsatz × DB-Quote = 600,00 € × 40 % = 240,00 € ⇒ **CLV (deckungsbeitragsbasiert): 240,00 € je Kunde**

## 35. Churn & Kundenbindung

- ID: `churn` · URL: `/churn-rechner/` · Kategorie: Produkt & Kunden
- Varianten: `standard` (Churn & Retention)

    Churn = verlorene Kunden / Kunden zu Periodenbeginn × 100
    Retention = verbliebene Anfangskunden / Kunden zu Periodenbeginn × 100

- **Kunden zu Periodenbeginn**: Anfangskohorte
- **verlorene Kunden**: aus der Anfangskohorte, im Zeitraum

Beispiel: Churn = verlorene / Anfangsbestand × 100 = 10 / 100 × 100 = 10 % → Retention = (100 − 10) / 100 × 100 = 90 % ⇒ **Churn-Rate: 10 %**

## 36. MRR & ARR

- ID: `mrr` · URL: `/mrr-arr-rechner/` · Kategorie: Produkt & Kunden
- Varianten: `standard` (MRR & ARR)

    MRR je Tarif = Abos × Preis / Intervall in Monaten
    MRR = Summe aller Tarife
    ARR = MRR × 12

- **Abos**: aktive Abos des Tarifs
- **Preis**: tatsächlicher wiederkehrender Nettopreis je Intervall
- **Intervall**: Abrechnungsintervall in Monaten

Beispiel: Tarif 1: 10 × 20,00 € / 1 Monate = 200,00 € MRR → Tarif 2: 12 × 120,00 € / 12 Monate = 120,00 € MRR → MRR = 200,00 € + 120,00 € = 320,00 € → ARR = MRR × 12 = 3.840,00 € ⇒ **MRR: 320,00 € je Monat**

## 37. Net Promoter Score (NPS)

- ID: `nps` · URL: `/nps-rechner/` · Kategorie: Produkt & Kunden
- Varianten: `standard` (NPS)

    NPS = (Promotoren − Detraktoren) / alle Antworten × 100

- **Promotoren**: Bewertung 9–10
- **Passive**: Bewertung 7–8, zählen im Nenner
- **Detraktoren**: Bewertung 0–6

Beispiel: NPS = (Promotoren − Detraktoren) / alle Antworten × 100 = (60 − 30) / 100 × 100 = +30 ⇒ **Net Promoter Score: +30 Punkte**

## 38. Soll-Ist-Abweichung

- ID: `soll-ist` · URL: `/soll-ist-rechner/` · Kategorie: Controlling & Planung
- Varianten: `standard` (Soll-Ist-Abweichung)

    Abweichung absolut = Ist − Soll
    Abweichung relativ = (Ist − Soll) / Soll × 100

- **Soll**: Plan- oder Budgetwert
- **Ist**: tatsächlich erreichter Wert

Beispiel: Abweichung = Ist − Soll = 110 − 100 = +10 → Relativ = Abweichung / Soll × 100 = 10 / 100 × 100 = +10 % ⇒ **Abweichung relativ: +10 %**

## 39. Kapazitätsauslastung

- ID: `auslastung` · URL: `/auslastung-rechner/` · Kategorie: Controlling & Planung
- Varianten: `standard` (Kapazitätsauslastung)

    Auslastung = genutzte Kapazität / verfügbare Kapazität × 100

- **genutzte Kapazität**: z. B. Stunden im Monat
- **verfügbare Kapazität**: gleiche Einheit und Periode

Beispiel: Auslastung = genutzt / verfügbar × 100 = 75 / 100 × 100 = 75 % ⇒ **Auslastung: 75 %**

## 40. Lagerumschlag & Lagerdauer

- ID: `lager` · URL: `/lagerkennzahlen-rechner/` · Kategorie: Controlling & Planung
- Varianten: `durchschnitt` (Mit Ø-Bestand), `anfang-ende` (Aus Anfangs- & Endbestand)

    Lagerumschlag = Wareneinsatz / durchschnittlicher Lagerbestand
    Lagerdauer = Tage der Periode / Lagerumschlag

- **Wareneinsatz**: Verbrauch zu Einstandskosten in der Periode
- **Ø Lagerbestand**: zu Einstandskosten
- **Tage**: 360 oder 365 oder andere Periodenlänge

Beispiel (Mit Ø-Bestand): Lagerumschlag = Wareneinsatz / Ø Bestand = 120.000,00 € / 20.000,00 € = 6 → Lagerdauer = Tage / Umschlag = 360 / 6 = 60 Tage ⇒ **Lagerumschlag: 6 Umschläge**

Beispiel (Aus Anfangs- & Endbestand): Ø Bestand = (Anfangsbestand + Endbestand) / 2 = (18.000,00 € + 22.000,00 €) / 2 = 20.000,00 € → Lagerumschlag = Wareneinsatz / Ø Bestand = 120.000,00 € / 20.000,00 € = 6 → Lagerdauer = Tage / Umschlag = 360 / 6 = 60 Tage ⇒ **Lagerumschlag: 6 Umschläge**

