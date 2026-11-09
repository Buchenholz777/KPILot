# Rechner-Inventar – alle 41 Rechner

> Automatisch erzeugt mit `npm run docs`. Zweck: Referenz für Regressionsprüfungen (tests/inventar.test.ts erwartet genau diese Rechner, URLs und Modi).

| # | Rechner | URL | Kategorie | Modi | Eingabefelder | Diagramm | Szenariovergleich | Weiterverwendung | Verwandte Rechner |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Prozentrechner | `/prozentrechner/` | Prozent & Grundlagen | Prozentwert; Prozentsatz; Grundwert | Grundwert (das Ganze); Prozentsatz (der Anteil in %); Prozentwert (der Teil) | nein | nein | – | veraenderung, rabatt, prozentpunkte, dreisatz |
| 02 | Prozentuale Veränderung | `/prozentuale-veraenderung/` | Prozent & Grundlagen | Veränderung | Alter Wert (vorher); Neuer Wert (nachher) | nein | nein | – | prozentpunkte, cagr, soll-ist, prozent |
| 03 | Rabatt & Erhöhung | `/rabattrechner/` | Prozent & Grundlagen | Preis nach Rabatt; Preis nach Erhöhung; Ursprungspreis (Rabatt); Ursprungspreis (Erhöhung); Zwei Änderungen | Ausgangspreis; Rabatt; Erhöhung; Endpreis; 1. Änderung; 1. Satz; 2. Änderung; 2. Satz; Ausgangspreis (optional) | ja: Preis nach Rabatt; Preis nach Erhöhung | nein | – | prozent, marge, zielpreis, veraenderung |
| 04 | Prozentpunkte | `/prozentpunkte-rechner/` | Prozent & Grundlagen | Prozentpunkte | Alter Prozentwert; Neuer Prozentwert | nein | nein | – | veraenderung, prozent, conversion |
| 05 | Dreisatz | `/dreisatz-rechner/` | Prozent & Grundlagen | Direkt proportional; Umgekehrt proportional | Bekannte Menge a; Zugehöriger Wert b (bei Menge a); Gesuchte Menge c; Andere Größe b (bei Menge a) | nein | nein | – | prozent, durchschnitt, stueckkosten |
| 06 | Gewichteter Durchschnitt | `/gewichteter-durchschnitt/` | Prozent & Grundlagen | Gewichteter Durchschnitt | Wert; Gewicht | nein | nein | – | dreisatz, prozent, cagr |
| 07 | Durchschnittliches Wachstum (CAGR) | `/cagr-rechner/` | Prozent & Grundlagen | CAGR | Anfangswert; Endwert; Anzahl Jahre | nein | nein | – | veraenderung, roi, durchschnitt |
| 08 | Deckungsbeitrag (DB) | `/deckungsbeitragsrechner/` | Kostenrechnung & Preise | Deckungsbeitrag | Nettoverkaufspreis je Stück; Variable Kosten je Stück; Verkaufte Stückzahl (optional) | ja | nein | break-even, gewinn | break-even, gewinn, marge, clv |
| 09 | Break-even | `/break-even-rechner/` | Kostenrechnung & Preise | Break-even | Nettoverkaufspreis je Stück; Variable Kosten je Stück; Fixkosten im Zeitraum; Betrachtungszeitraum | ja | ja | gewinn | deckungsbeitrag, gewinn, stueckkosten, marge |
| 10 | Gewinn & Zielgewinn | `/gewinnrechner/` | Kostenrechnung & Preise | Gewinn bei Stückzahl; Stückzahl für Zielgewinn | Nettoverkaufspreis je Stück; Variable Kosten je Stück; Fixkosten im Zeitraum; Verkaufte Stückzahl; Betrachtungszeitraum; Gewünschter Gewinn | nein | ja | break-even | break-even, deckungsbeitrag, ebit, stueckkosten |
| 11 | Marge & Aufschlag | `/margenrechner/` | Kostenrechnung & Preise | Marge & Aufschlag | Kostenbasis (z. B. Einstandspreis); Nettoverkaufspreis | ja | nein | – | zielpreis, deckungsbeitrag, rabatt, umsatzrendite |
| 12 | Verkaufspreis aus Zielmarge | `/verkaufspreis-berechnen/` | Kostenrechnung & Preise | Verkaufspreis aus Zielmarge | Kostenbasis; Gewünschte Rohmarge | nein | nein | – | marge, deckungsbeitrag, zuschlag, stundensatz |
| 13 | Gesamt- & Stückkosten | `/stueckkosten-rechner/` | Kostenrechnung & Preise | Gesamt- & Stückkosten | Fixkosten im Zeitraum; Variable Kosten je Stück; Produzierte Menge | nein | nein | – | break-even, zuschlag, deckungsbeitrag, stundensatz |
| 14 | Zuschlagskalkulation | `/zuschlagskalkulation/` | Kostenrechnung & Preise | Kalkulationsschema; Zuschlagssatz ermitteln | Materialeinzelkosten (MEK); Materialgemeinkosten-Zuschlag (MGK); Fertigungseinzelkosten (FEK); Fertigungsgemeinkosten-Zuschlag (FGK); Sondereinzelkosten der Fertigung; Verwaltungsgemeinkosten-Zuschlag (VwGK); Vertriebsgemeinkosten-Zuschlag (VtGK); Sondereinzelkosten des Vertriebs; Gemeinkosten der Periode; Bezugsbasis der Periode; Bezugsbasis einer einzelnen Leistung (optional) | nein | nein | – | stueckkosten, zielpreis, stundensatz, deckungsbeitrag |
| 15 | Stundenkostensatz | `/stundenkostensatz-rechner/` | Kostenrechnung & Preise | Stundenkostensatz | Zugeordnete Kosten der Periode; Abrechenbare Stunden derselben Periode | nein | nein | – | zuschlag, stueckkosten, zielpreis, auslastung |
| 16 | Rabatt: nötiger Mehrabsatz | `/rabatt-mehrabsatz-rechner/` | Kostenrechnung & Preise | Rabatt in Prozent; Neuer Preis | Ausgangspreis netto je Einheit; Variable Kosten je Einheit; Rabatt; Bisheriger Absatz im Zeitraum (optional); Betrachtungszeitraum des Absatzes; Neuer Preis netto je Einheit | ja | ja | gewinn, deckungsbeitrag | rabatt, deckungsbeitrag, gewinn, break-even |
| 17 | EBIT | `/ebit-rechner/` | Finanzen & Liquidität | EBIT | Umsatzerlöse; Sonstige betriebliche Erträge; Betriebliche Aufwendungen ohne Abschreibungen; Betriebliche Abschreibungen | nein | nein | ebitda, ebit-marge | ebitda, ebit-marge, cashflow, umsatzrendite |
| 18 | EBITDA | `/ebitda-rechner/` | Finanzen & Liquidität | EBITDA | EBIT; Im EBIT abgezogene Abschreibungen | nein | nein | – | ebit, cashflow, ebit-marge |
| 19 | EBIT-Marge | `/ebit-marge-rechner/` | Finanzen & Liquidität | EBIT-Marge | EBIT; Nettoumsatz derselben Periode | nein | nein | – | ebit, umsatzrendite, marge |
| 20 | Umsatzrendite | `/umsatzrendite-rechner/` | Finanzen & Liquidität | Nettoumsatzrendite | Jahresüberschuss bzw. Periodenergebnis; Nettoumsatz derselben Periode | nein | nein | – | ebit-marge, marge, roi |
| 21 | Cashflow | `/cashflow-rechner/` | Finanzen & Liquidität | Operativer Cashflow; Erweiterte Übersicht | Betriebliche Einzahlungen; Betriebliche Auszahlungen; Investive Einzahlungen; Investive Auszahlungen; Finanzierungs-Einzahlungen; Finanzierungs-Auszahlungen | ja | nein | – | liquiditaet, working-capital, ebit, ebitda |
| 22 | Working Capital | `/working-capital-rechner/` | Finanzen & Liquidität | Working Capital | Umlaufvermögen am Stichtag; Kurzfristige Verpflichtungen am Stichtag | nein | nein | – | liquiditaet, cashflow, eigenkapital |
| 23 | Liquidität 1., 2. & 3. Grades | `/liquiditaetsrechner/` | Finanzen & Liquidität | Liquiditätsgrade | Liquide Mittel; Kurzfristige Forderungen; Vorräte; Sonstiges Umlaufvermögen; Kurzfristige Verpflichtungen | nein | nein | – | working-capital, cashflow, eigenkapital |
| 24 | Eigenkapitalquote | `/eigenkapitalquote-rechner/` | Finanzen & Liquidität | Eigenkapitalquote | Eigenkapital am Stichtag; Gesamtkapital (Bilanzsumme) am selben Stichtag | ja | nein | – | liquiditaet, working-capital, roi |
| 25 | Kapitalrendite (ROI) | `/roi-rechner/` | Finanzen & Liquidität | ROI | Zurechenbarer Gewinn der Periode; Eingesetztes Kapital | ja | nein | – | amortisation, roas, eigenkapital, cagr |
| 26 | Amortisationsdauer | `/amortisationsrechner/` | Finanzen & Liquidität | Amortisationsdauer | Anfänglicher Investitionsbetrag; Netto-Zahlungsüberschuss je Periode; Periode | ja | nein | – | roi, cashflow |
| 27 | Conversion Rate (CR) | `/conversion-rate-rechner/` | Marketing & Vertrieb | Besuchsbasiert; Ereignisbasiert | Besuche mit mindestens einer Conversion; Besuche insgesamt; Conversion-Ereignisse; Interaktionen | nein | nein | – | ctr, cpa, cac, roas |
| 28 | Klickrate (CTR) | `/ctr-rechner/` | Marketing & Vertrieb | CTR | Klicks; Impressionen (Einblendungen) | nein | nein | – | cpc, cpm, conversion |
| 29 | Kosten je Klick (CPC) | `/cpc-rechner/` | Marketing & Vertrieb | CPC | Werbekosten; Klicks | nein | nein | – | cpm, ctr, cpa |
| 30 | Tausenderkontaktpreis (CPM) | `/cpm-rechner/` | Marketing & Vertrieb | CPM | Werbekosten; Impressionen | nein | nein | – | cpc, ctr |
| 31 | Kosten je Conversion (CPA) | `/cpa-rechner/` | Marketing & Vertrieb | CPA | Zugeordnete Werbekosten; Conversions | nein | nein | – | cac, conversion, cpc, roas |
| 32 | ROAS | `/roas-rechner/` | Marketing & Vertrieb | ROAS; Werbewirtschaftlichkeit | Zugeordneter Werbeumsatz; Werbekosten; Deckungsbeitragsquote vor Werbekosten; Alternative Deckungsbeitragsquote (optional) | nein | ja | – | cac, cpa, clv, conversion, deckungsbeitrag |
| 33 | Neukundenkosten (CAC) | `/cac-rechner/` | Marketing & Vertrieb | CAC | Zugeordnete Marketingkosten; Zugeordnete Vertriebskosten; Neu gewonnene Kunden | nein | nein | clv | clv, cpa, conversion |
| 34 | Umsatz je Account (ARPU) | `/arpu-rechner/` | Produkt & Kunden | ARPU | Zugeordneter Umsatz der Periode; Durchschnittlich aktive Accounts; Periode | nein | nein | – | clv, mrr, churn |
| 35 | Customer Lifetime Value (CLV) | `/clv-rechner/` | Produkt & Kunden | Customer Lifetime Value | Durchschnittlicher Nettobestellwert; Käufe pro Jahr; Angenommene Beziehungsdauer; Deckungsbeitragsquote; Akquisitionskosten je Kunde (optional) | nein | ja | – | cac, arpu, churn, deckungsbeitrag |
| 36 | Churn & Kundenbindung | `/churn-rechner/` | Produkt & Kunden | Churn & Retention | Kunden zu Periodenbeginn; Davon im Zeitraum verloren; Neukunden im Zeitraum (optional) | nein | nein | – | clv, mrr, arpu |
| 37 | MRR & ARR | `/mrr-arr-rechner/` | Produkt & Kunden | MRR & ARR | Aktive Abos; Wiederkehrender Nettopreis; Abrechnungsintervall | nein | nein | – | arpu, churn, clv |
| 38 | Net Promoter Score (NPS) | `/nps-rechner/` | Produkt & Kunden | NPS | Promotoren (Bewertung 9–10); Passive (Bewertung 7–8); Detraktoren (Bewertung 0–6) | nein | nein | – | churn, clv |
| 39 | Soll-Ist-Abweichung | `/soll-ist-rechner/` | Controlling & Planung | Soll-Ist-Abweichung | Soll (Plan); Ist (tatsächlich); Zielrichtung | ja | nein | – | veraenderung, auslastung, prozent |
| 40 | Kapazitätsauslastung | `/auslastung-rechner/` | Controlling & Planung | Kapazitätsauslastung | Genutzte Kapazität; Verfügbare Kapazität | nein | nein | – | stundensatz, soll-ist |
| 41 | Lagerumschlag & Lagerdauer | `/lagerkennzahlen-rechner/` | Controlling & Planung | Mit Ø-Bestand; Aus Anfangs- & Endbestand | Wareneinsatz der Periode; Durchschnittlicher Lagerbestand; Tagesbasis der Periode; Tage der Periode (bei „andere Periode“); Anfangsbestand; Endbestand | nein | nein | – | working-capital, auslastung, stueckkosten |

## SEO-Daten je Rechner

| Rechner | Seitentitel | H1 | Hauptkeyword |
|---|---|---|---|
| prozent | Prozentrechner: Prozent online berechnen – kostenlos &#124; KPILot | Prozentrechner: Prozentwert, Prozentsatz und Grundwert berechnen | Prozentrechner |
| veraenderung | Prozentuale Veränderung berechnen – Rechner &#124; KPILot | Prozentuale Veränderung berechnen | prozentuale Veränderung berechnen |
| rabatt | Rabattrechner: Preis nach Rabatt berechnen &#124; KPILot | Rabattrechner: Preis nach Rabatt und Ursprungspreis berechnen | Rabattrechner |
| prozentpunkte | Prozentpunkte berechnen – Unterschied zu Prozent &#124; KPILot | Prozentpunkte berechnen – und vom Prozent unterscheiden | Prozentpunkte berechnen |
| dreisatz | Dreisatz-Rechner: proportional & umgekehrt &#124; KPILot | Dreisatz-Rechner: direkt und umgekehrt proportional | Dreisatz Rechner |
| durchschnitt | Gewichteter Durchschnitt – Rechner online &#124; KPILot | Gewichteten Durchschnitt berechnen | gewichteter Durchschnitt berechnen |
| cagr | CAGR-Rechner: jährliche Wachstumsrate berechnen &#124; KPILot | CAGR-Rechner: durchschnittliche jährliche Wachstumsrate | CAGR Rechner |
| deckungsbeitrag | Deckungsbeitrag berechnen – Kostenloser Rechner &#124; KPILot | Deckungsbeitrag berechnen: Stück-DB, Gesamt-DB und DB-Quote | Deckungsbeitrag berechnen |
| break-even | Break-even-Rechner: Gewinnschwelle berechnen &#124; KPILot | Break-even-Rechner: Gewinnschwelle berechnen | Break-even Rechner |
| gewinn | Gewinnrechner: Gewinn & Zielgewinn berechnen &#124; KPILot | Gewinnrechner: Gewinn und Menge für den Zielgewinn berechnen | Gewinnrechner |
| marge | Margenrechner: Marge und Aufschlag berechnen &#124; KPILot | Margenrechner: Marge, Handelsspanne und Aufschlag berechnen | Margenrechner |
| zielpreis | Verkaufspreis berechnen aus Zielmarge – Rechner &#124; KPILot | Verkaufspreis berechnen aus Kosten und Zielmarge | Verkaufspreis berechnen |
| stueckkosten | Stückkosten berechnen – Gesamt- und Stückkosten &#124; KPILot | Stückkosten und Gesamtkosten berechnen | Stückkosten berechnen |
| zuschlag | Zuschlagskalkulation Rechner: Selbstkosten &#124; KPILot | Zuschlagskalkulation: Herstellkosten und Selbstkosten berechnen | Zuschlagskalkulation Rechner |
| stundensatz | Stundenkostensatz berechnen – Stundensatz-Rechner &#124; KPILot | Stundenkostensatz berechnen | Stundensatz berechnen |
| rabatt-absatz | Lohnt sich ein Rabatt? Mehrabsatz berechnen &#124; KPILot | Lohnt sich ein Rabatt? Nötigen Mehrabsatz berechnen | Rabatt Mehrabsatz berechnen |
| ebit | EBIT berechnen – Ergebnis vor Zinsen und Steuern &#124; KPILot | EBIT berechnen: Ergebnis vor Zinsen und Steuern | EBIT berechnen |
| ebitda | EBITDA berechnen – Rechner mit Formel &#124; KPILot | EBITDA berechnen | EBITDA berechnen |
| ebit-marge | EBIT-Marge berechnen – operative Marge in Prozent &#124; KPILot | EBIT-Marge berechnen | EBIT-Marge berechnen |
| umsatzrendite | Umsatzrendite berechnen – Nettomarge in Prozent &#124; KPILot | Umsatzrendite berechnen | Umsatzrendite berechnen |
| cashflow | Cashflow-Rechner: operativen Cashflow berechnen &#124; KPILot | Cashflow-Rechner: operativen Cashflow berechnen | Cashflow berechnen |
| working-capital | Working Capital berechnen – Nettoumlaufvermögen &#124; KPILot | Working Capital berechnen | Working Capital berechnen |
| liquiditaet | Liquiditätsgrad berechnen: 1., 2. und 3. Grades &#124; KPILot | Liquiditätsgrade berechnen: Liquidität 1., 2. und 3. Grades | Liquiditätsgrad berechnen |
| eigenkapital | Eigenkapitalquote berechnen – Rechner online &#124; KPILot | Eigenkapitalquote berechnen | Eigenkapitalquote berechnen |
| roi | ROI-Rechner: Kapitalrendite berechnen &#124; KPILot | ROI-Rechner: Kapitalrendite berechnen | ROI Rechner |
| amortisation | Amortisationsrechner: Amortisationsdauer berechnen &#124; KPILot | Amortisationsdauer berechnen | Amortisationsrechner |
| conversion | Conversion Rate berechnen – Rechner online &#124; KPILot | Conversion Rate berechnen | Conversion Rate berechnen |
| ctr | CTR-Rechner: Klickrate (Click-Through-Rate) berechnen &#124; KPILot | CTR-Rechner: Klickrate berechnen | CTR Rechner |
| cpc | CPC-Rechner: Kosten pro Klick berechnen &#124; KPILot | CPC-Rechner: Kosten pro Klick berechnen | CPC Rechner |
| cpm | CPM / TKP berechnen – Tausenderkontaktpreis &#124; KPILot | CPM / TKP berechnen: Tausenderkontaktpreis | TKP berechnen |
| cpa | CPA-Rechner: Kosten pro Conversion berechnen &#124; KPILot | CPA-Rechner: Kosten pro Conversion berechnen | CPA Rechner |
| roas | ROAS-Rechner: Return on Ad Spend & Mindest-ROAS &#124; KPILot | ROAS-Rechner: Return on Ad Spend und Mindest-ROAS berechnen | ROAS Rechner |
| cac | CAC-Rechner: Kosten je Neukunde berechnen &#124; KPILot | CAC-Rechner: Customer Acquisition Cost berechnen | Customer Acquisition Cost Rechner |
| arpu | ARPU berechnen – Umsatz pro Kunde / Account &#124; KPILot | ARPU berechnen: durchschnittlicher Umsatz je Account | ARPU berechnen |
| clv | CLV-Rechner: Customer Lifetime Value berechnen &#124; KPILot | CLV-Rechner: Customer Lifetime Value berechnen | Customer Lifetime Value Rechner |
| churn | Churn-Rate-Rechner: Abwanderung & Retention &#124; KPILot | Churn Rate und Retention Rate berechnen | Churn Rate Rechner |
| mrr | MRR- und ARR-Rechner: wiederkehrender Umsatz &#124; KPILot | MRR und ARR berechnen | MRR Rechner |
| nps | NPS-Rechner: Net Promoter Score berechnen &#124; KPILot | NPS-Rechner: Net Promoter Score berechnen | Net Promoter Score Rechner |
| soll-ist | Soll-Ist-Vergleich: Abweichung berechnen &#124; KPILot | Soll-Ist-Abweichung berechnen | Soll-Ist-Vergleich berechnen |
| auslastung | Auslastung berechnen – Kapazitätsauslastung &#124; KPILot | Kapazitätsauslastung berechnen | Auslastung berechnen |
| lager | Lagerumschlag und Lagerdauer berechnen &#124; KPILot | Lagerumschlag und Lagerdauer berechnen | Lagerumschlag berechnen |
