/**
 * Zentrale SEO-Konfiguration aller Rechnerseiten – eine Stelle für Title, Description, H1 und Keywords.
 *
 * - `title`: ohne Markenzusatz; die Seite hängt „ | KPILot“ an (Ziel gesamt ca. 50–62 Zeichen).
 * - `description`: ca. 140–160 Zeichen, nennt nur Vorteile, die der Rechner tatsächlich bietet
 *   (Szenariovergleich nur bei Rechnern mit Szenariofunktion, Grafik nur bei Rechnern mit Diagramm).
 * - `h1`: sichtbare Hauptüberschrift, auf das Hauptkeyword ausgerichtet.
 * - `primary` / `secondary`: Zielkeywords. Priorität ist eine qualitative Einschätzung –
 *   es liegen keine Suchvolumendaten vor (siehe docs/SEO.md).
 * - `intent`: Suchintention in einem Satz (Dokumentation, nicht ausgegeben).
 *
 * tests/seo.test.ts prüft Vollständigkeit, Längen und Eindeutigkeit.
 */
export interface SeoEntry {
  title: string;
  description: string;
  h1: string;
  primary: string;
  secondary: string[];
  intent: string;
}

export const SEO: Record<string, SeoEntry> = {
  /* ---------- Prozent & Grundlagen ---------- */
  prozent: {
    title: "Prozentrechner: Prozent online berechnen – kostenlos",
    description:
      "Prozentwert, Prozentsatz oder Grundwert berechnen: kostenloser Prozentrechner mit Formel, Rechenweg und Beispiel. Direkt online, ohne Anmeldung.",
    h1: "Prozentrechner: Prozentwert, Prozentsatz und Grundwert berechnen",
    primary: "Prozentrechner",
    secondary: [
      "Prozent berechnen",
      "Prozentwert berechnen",
      "Prozentsatz berechnen",
      "Grundwert berechnen",
    ],
    intent: "Schnell einen Prozentwert, Prozentsatz oder Grundwert ausrechnen.",
  },
  veraenderung: {
    title: "Prozentuale Veränderung berechnen – Rechner",
    description:
      "Um wie viel Prozent ist ein Wert gestiegen oder gesunken? Prozentuale Veränderung kostenlos berechnen – mit Formel, Beispiel und verständlichem Rechenweg.",
    h1: "Prozentuale Veränderung berechnen",
    primary: "prozentuale Veränderung berechnen",
    secondary: [
      "Wachstum in Prozent",
      "Steigerung berechnen",
      "Rückgang in Prozent",
      "prozentuale Abweichung",
    ],
    intent:
      "Steigerung oder Rückgang zwischen zwei Werten in Prozent ermitteln.",
  },
  rabatt: {
    title: "Rabattrechner: Preis nach Rabatt berechnen",
    description:
      "Preis nach Rabatt oder Preiserhöhung, Ursprungspreis und zwei Änderungen nacheinander berechnen. Kostenloser Rabattrechner mit Formel und Beispiel.",
    h1: "Rabattrechner: Preis nach Rabatt und Ursprungspreis berechnen",
    primary: "Rabattrechner",
    secondary: [
      "Rabatt berechnen",
      "Preis nach Rabatt",
      "ursprünglichen Preis berechnen",
      "Preiserhöhung berechnen",
    ],
    intent:
      "Endpreis nach Rabatt bzw. Erhöhung oder den Ausgangspreis ermitteln.",
  },
  prozentpunkte: {
    title: "Prozentpunkte berechnen – Unterschied zu Prozent",
    description:
      "Prozentpunkte oder Prozent? Den Unterschied zweier Prozentwerte in Prozentpunkten berechnen und richtig einordnen – kostenlos, mit Formel und Beispiel.",
    h1: "Prozentpunkte berechnen – und vom Prozent unterscheiden",
    primary: "Prozentpunkte berechnen",
    secondary: [
      "Prozentpunkte vs. Prozent",
      "Unterschied Prozent Prozentpunkte",
      "Quote Veränderung",
    ],
    intent:
      "Verstehen und berechnen, ob eine Änderung in Prozentpunkten oder Prozent anzugeben ist.",
  },
  dreisatz: {
    title: "Dreisatz-Rechner: proportional & umgekehrt",
    description:
      "Dreisatz online berechnen: direkt proportional oder umgekehrt proportional. Kostenloser Dreisatzrechner mit Rechenweg, Formel und Beispiel – ohne Anmeldung.",
    h1: "Dreisatz-Rechner: direkt und umgekehrt proportional",
    primary: "Dreisatz Rechner",
    secondary: [
      "Dreisatz berechnen",
      "umgekehrter Dreisatz",
      "Verhältnisrechnung",
    ],
    intent:
      "Einen unbekannten Wert über ein Verhältnis (proportional oder antiproportional) ermitteln.",
  },
  durchschnitt: {
    title: "Gewichteter Durchschnitt – Rechner online",
    description:
      "Gewichteten Durchschnitt mit beliebig vielen Werten berechnen, z. B. Durchschnittspreis oder Notenschnitt. Kostenlos, mit Formel und Rechenweg erklärt.",
    h1: "Gewichteten Durchschnitt berechnen",
    primary: "gewichteter Durchschnitt berechnen",
    secondary: [
      "gewichtetes Mittel",
      "Durchschnittspreis berechnen",
      "Mischpreis berechnen",
    ],
    intent:
      "Einen Mittelwert berechnen, bei dem Werte unterschiedlich stark zählen.",
  },
  cagr: {
    title: "CAGR-Rechner: jährliche Wachstumsrate berechnen",
    description:
      "CAGR berechnen: durchschnittliches jährliches Wachstum (Compound Annual Growth Rate) aus Start-, Endwert und Jahren. Kostenlos, mit Formel und Beispiel.",
    h1: "CAGR-Rechner: durchschnittliche jährliche Wachstumsrate",
    primary: "CAGR Rechner",
    secondary: [
      "CAGR berechnen",
      "jährliche Wachstumsrate",
      "durchschnittliches Wachstum pro Jahr",
    ],
    intent:
      "Ein Wachstum über mehrere Jahre in eine vergleichbare jährliche Rate umrechnen.",
  },

  /* ---------- Kostenrechnung & Preise ---------- */
  deckungsbeitrag: {
    title: "Deckungsbeitrag berechnen – Kostenloser Rechner",
    description:
      "Stückdeckungsbeitrag, Gesamtdeckungsbeitrag und DB-Quote online berechnen. Kostenloser Deckungsbeitragsrechner mit Formel und verständlichem Beispiel.",
    h1: "Deckungsbeitrag berechnen: Stück-DB, Gesamt-DB und DB-Quote",
    primary: "Deckungsbeitrag berechnen",
    secondary: [
      "Deckungsbeitragsrechner",
      "Stückdeckungsbeitrag",
      "DB-Quote berechnen",
      "Deckungsbeitragsrechnung",
    ],
    intent:
      "Ermitteln, was je Stück bzw. vom Umsatz zur Deckung der Fixkosten bleibt.",
  },
  "break-even": {
    title: "Break-even-Rechner: Gewinnschwelle berechnen",
    description:
      "Gewinnschwelle kostenlos berechnen: mit Fixkosten, variablen Kosten, Formel, Beispielrechnung, Grafik und Szenariovergleich. Direkt online, ohne Anmeldung.",
    h1: "Break-even-Rechner: Gewinnschwelle berechnen",
    primary: "Break-even Rechner",
    secondary: [
      "Gewinnschwelle berechnen",
      "Break-even-Point berechnen",
      "Break-even-Menge",
      "Mindestabsatz berechnen",
    ],
    intent:
      "Die Absatzmenge bzw. den Umsatz finden, ab dem kein Verlust mehr entsteht.",
  },
  gewinn: {
    title: "Gewinnrechner: Gewinn & Zielgewinn berechnen",
    description:
      "Gewinn bei einer Stückzahl oder die nötige Menge für einen Zielgewinn berechnen. Kostenloser Gewinnrechner mit Formel, Beispiel und Szenariovergleich.",
    h1: "Gewinnrechner: Gewinn und Menge für den Zielgewinn berechnen",
    primary: "Gewinnrechner",
    secondary: [
      "Gewinn berechnen",
      "Zielgewinn berechnen",
      "Menge für Zielgewinn",
    ],
    intent:
      "Gewinn aus Preis, Kosten und Menge ermitteln oder die Menge für ein Gewinnziel.",
  },
  marge: {
    title: "Margenrechner: Marge und Aufschlag berechnen",
    description:
      "Marge (Handelsspanne) und Kalkulationsaufschlag aus Einkaufs- und Verkaufspreis berechnen – und richtig unterscheiden. Kostenlos, mit Formel und Beispiel.",
    h1: "Margenrechner: Marge, Handelsspanne und Aufschlag berechnen",
    primary: "Margenrechner",
    secondary: [
      "Marge berechnen",
      "Handelsspanne berechnen",
      "Aufschlag berechnen",
      "Marge vs. Aufschlag",
    ],
    intent:
      "Marge und Aufschlag zu einem Preis berechnen und die beiden Begriffe auseinanderhalten.",
  },
  zielpreis: {
    title: "Verkaufspreis berechnen aus Zielmarge – Rechner",
    description:
      "Welcher Verkaufspreis ergibt die gewünschte Marge? Verkaufspreis aus Kosten und Zielmarge auf den Cent genau berechnen – kostenlos, mit Formel und Beispiel.",
    h1: "Verkaufspreis berechnen aus Kosten und Zielmarge",
    primary: "Verkaufspreis berechnen",
    secondary: [
      "Preis aus Marge berechnen",
      "Zielmarge",
      "Preis kalkulieren",
      "VK berechnen",
    ],
    intent: "Den Verkaufspreis ermitteln, der eine gewünschte Marge erreicht.",
  },
  stueckkosten: {
    title: "Stückkosten berechnen – Rechner mit Grafik",
    description:
      "Gesamtkosten und Stückkosten aus Fixkosten, variablen Kosten und Menge berechnen – inklusive Fixkostendegression als Grafik. Kostenlos, mit Formel und Beispiel.",
    h1: "Stückkosten und Gesamtkosten berechnen",
    primary: "Stückkosten berechnen",
    secondary: [
      "Kosten pro Stück",
      "Gesamtkosten berechnen",
      "Fixkostendegression",
      "Durchschnittskosten",
    ],
    intent: "Kosten je Einheit bei einer bestimmten Menge ermitteln.",
  },
  zuschlag: {
    title: "Zuschlagskalkulation Rechner: Selbstkosten",
    description:
      "Zuschlagskalkulation online: Herstellkosten und Selbstkosten mit Gemeinkostenzuschlägen berechnen oder Zuschlagssätze ermitteln. Kostenlos, mit Kalkulationsschema.",
    h1: "Zuschlagskalkulation: Herstellkosten und Selbstkosten berechnen",
    primary: "Zuschlagskalkulation Rechner",
    secondary: [
      "Selbstkosten berechnen",
      "Herstellkosten berechnen",
      "Gemeinkostenzuschlag",
      "Zuschlagssatz berechnen",
    ],
    intent:
      "Selbstkosten über das Kalkulationsschema mit Zuschlagssätzen ermitteln.",
  },
  stundensatz: {
    title: "Stundenkostensatz berechnen – Stundensatz-Rechner",
    description:
      "Stundenkostensatz aus Kosten und abrechenbaren Stunden einer Periode berechnen – für Selbstständige, Handwerk und Dienstleister. Kostenlos, mit Formel und Beispiel.",
    h1: "Stundenkostensatz berechnen",
    primary: "Stundensatz berechnen",
    secondary: [
      "Stundenkostensatz",
      "Stundenverrechnungssatz",
      "Kosten pro Stunde",
      "Stundensatz Selbstständige",
    ],
    intent: "Ermitteln, was eine abrechenbare Stunde mindestens kosten muss.",
  },
  "rabatt-absatz": {
    title: "Lohnt sich ein Rabatt? Mehrabsatz berechnen",
    description:
      "Wie viel mehr musst du verkaufen, damit sich ein Rabatt lohnt? Nötigen Mehrabsatz über den Deckungsbeitrag berechnen – mit Grafik und Szenariovergleich.",
    h1: "Lohnt sich ein Rabatt? Nötigen Mehrabsatz berechnen",
    primary: "Rabatt Mehrabsatz berechnen",
    secondary: [
      "lohnt sich ein Rabatt",
      "Rabattaktion Wirtschaftlichkeit",
      "Absatzsteigerung bei Preissenkung",
    ],
    intent:
      "Prüfen, ob eine Preissenkung durch zusätzliche Verkäufe ausgeglichen wird.",
  },

  /* ---------- Finanzen & Liquidität ---------- */
  ebit: {
    title: "EBIT berechnen – Ergebnis vor Zinsen und Steuern",
    description:
      "EBIT (Earnings Before Interest and Taxes) aus Umsatz, sonstigen Erträgen, Aufwendungen und Abschreibungen berechnen. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "EBIT berechnen: Ergebnis vor Zinsen und Steuern",
    primary: "EBIT berechnen",
    secondary: [
      "EBIT Rechner",
      "operatives Ergebnis",
      "Ergebnis vor Zinsen und Steuern",
    ],
    intent:
      "Das operative Ergebnis ohne Finanzierungs- und Steuereffekte ermitteln.",
  },
  ebitda: {
    title: "EBITDA berechnen – Rechner mit Formel",
    description:
      "EBITDA berechnen: EBIT plus die darin abgezogenen Abschreibungen. Kostenloser EBITDA-Rechner mit Formel, Beispiel und typischen Missverständnissen erklärt.",
    h1: "EBITDA berechnen",
    primary: "EBITDA berechnen",
    secondary: [
      "EBITDA Rechner",
      "EBITDA Formel",
      "Ergebnis vor Abschreibungen",
    ],
    intent: "Das operative Ergebnis vor Abschreibungen ermitteln.",
  },
  "ebit-marge": {
    title: "EBIT-Marge berechnen – operative Marge in Prozent",
    description:
      "EBIT-Marge berechnen: Anteil des EBIT am Umsatz in Prozent. Kostenloser Rechner für die operative Marge mit Formel, Beispiel und Einordnung des Ergebnisses.",
    h1: "EBIT-Marge berechnen",
    primary: "EBIT-Marge berechnen",
    secondary: ["operative Marge", "EBIT-Marge Formel", "Operating Margin"],
    intent: "Die operative Profitabilität im Verhältnis zum Umsatz ausdrücken.",
  },
  umsatzrendite: {
    title: "Umsatzrendite berechnen – Nettomarge in Prozent",
    description:
      "Umsatzrendite (Nettoumsatzrendite) aus Gewinn und Umsatz berechnen. Kostenloser Rechner mit Formel, Beispiel und typischen Missverständnissen.",
    h1: "Umsatzrendite berechnen",
    primary: "Umsatzrendite berechnen",
    secondary: [
      "Nettoumsatzrendite",
      "Return on Sales",
      "Umsatzrentabilität",
      "Gewinnmarge",
    ],
    intent: "Ermitteln, wie viel Prozent vom Umsatz als Gewinn übrig bleiben.",
  },
  cashflow: {
    title: "Cashflow-Rechner: operativen Cashflow berechnen",
    description:
      "Operativen Cashflow berechnen oder eine erweiterte Übersicht mit Investitions- und Finanzierungs-Cashflow erstellen. Kostenlos, mit Formel und Beispiel.",
    h1: "Cashflow-Rechner: operativen Cashflow berechnen",
    primary: "Cashflow berechnen",
    secondary: [
      "Cashflow Rechner",
      "operativer Cashflow",
      "Free Cashflow",
      "Cashflow Formel",
    ],
    intent:
      "Ermitteln, wie viel Geld im Zeitraum tatsächlich zu- oder abgeflossen ist.",
  },
  "working-capital": {
    title: "Working Capital berechnen – Nettoumlaufvermögen",
    description:
      "Working Capital aus Umlaufvermögen und kurzfristigen Verbindlichkeiten berechnen. Kostenloser Rechner mit Formel, Beispiel und Einordnung des Ergebnisses.",
    h1: "Working Capital berechnen",
    primary: "Working Capital berechnen",
    secondary: [
      "Nettoumlaufvermögen",
      "Net Working Capital",
      "Working Capital Formel",
    ],
    intent:
      "Prüfen, ob kurzfristige Verbindlichkeiten durch Umlaufvermögen gedeckt sind.",
  },
  liquiditaet: {
    title: "Liquiditätsgrad berechnen: 1., 2. und 3. Grades",
    description:
      "Liquidität 1., 2. und 3. Grades (Cash Ratio, Quick Ratio, Current Ratio) berechnen. Kostenloser Liquiditätsrechner mit Formeln, Beispiel und Einordnung.",
    h1: "Liquiditätsgrade berechnen: Liquidität 1., 2. und 3. Grades",
    primary: "Liquiditätsgrad berechnen",
    secondary: [
      "Liquidität 1. Grades",
      "Liquidität 2. Grades",
      "Quick Ratio",
      "Current Ratio",
    ],
    intent:
      "Die kurzfristige Zahlungsfähigkeit mit Liquiditätskennzahlen beurteilen.",
  },
  eigenkapital: {
    title: "Eigenkapitalquote berechnen – Rechner online",
    description:
      "Eigenkapitalquote aus Eigenkapital und Bilanzsumme berechnen. Kostenloser Rechner mit Formel, Beispiel und Hinweisen zur Einordnung der Kapitalstruktur.",
    h1: "Eigenkapitalquote berechnen",
    primary: "Eigenkapitalquote berechnen",
    secondary: [
      "EK-Quote",
      "Eigenkapitalquote Formel",
      "Kapitalstruktur",
      "Fremdkapitalquote",
    ],
    intent: "Den Anteil des Eigenkapitals an der Bilanzsumme ermitteln.",
  },
  roi: {
    title: "ROI-Rechner: Kapitalrendite berechnen",
    description:
      "ROI (Return on Investment) aus Gewinn und eingesetztem Kapital berechnen. Kostenloser ROI-Rechner mit Formel, Beispiel und typischen Fehlern bei der Berechnung.",
    h1: "ROI-Rechner: Kapitalrendite berechnen",
    primary: "ROI Rechner",
    secondary: [
      "ROI berechnen",
      "Kapitalrendite berechnen",
      "Return on Investment",
      "Rendite berechnen",
    ],
    intent:
      "Die Rendite einer Investition bzw. des eingesetzten Kapitals ermitteln.",
  },
  amortisation: {
    title: "Amortisationsrechner: Amortisationsdauer berechnen",
    description:
      "Wann hat sich eine Investition bezahlt gemacht? Amortisationsdauer (Payback) aus Investition und Zahlungsüberschuss je Periode berechnen – kostenlos, mit Beispiel.",
    h1: "Amortisationsdauer berechnen",
    primary: "Amortisationsrechner",
    secondary: [
      "Amortisationsdauer berechnen",
      "Amortisationszeit",
      "Payback Period",
    ],
    intent:
      "Ermitteln, nach wie vielen Jahren eine Investition zurückgeflossen ist.",
  },

  /* ---------- Marketing & Vertrieb ---------- */
  conversion: {
    title: "Conversion Rate berechnen – Rechner online",
    description:
      "Conversion Rate besuchs- oder ereignisbasiert berechnen: Anteil der Besuche, die zu Kauf, Lead oder Anmeldung führen. Kostenlos, mit Formel und Beispiel.",
    h1: "Conversion Rate berechnen",
    primary: "Conversion Rate berechnen",
    secondary: [
      "Conversion Rate Rechner",
      "Konversionsrate",
      "Conversion Rate Formel",
    ],
    intent:
      "Den Anteil der Besuche bzw. Interaktionen mit Zielerreichung ermitteln.",
  },
  ctr: {
    title: "CTR-Rechner: Klickrate (Click-Through-Rate) berechnen",
    description:
      "CTR (Click-Through-Rate) aus Klicks und Impressionen berechnen – für Anzeigen, Newsletter oder Suchergebnisse. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "CTR-Rechner: Klickrate berechnen",
    primary: "CTR Rechner",
    secondary: ["CTR berechnen", "Klickrate berechnen", "Click-Through-Rate"],
    intent: "Den Anteil der Impressionen ermitteln, die zu einem Klick führen.",
  },
  cpc: {
    title: "CPC-Rechner: Kosten pro Klick berechnen",
    description:
      "CPC (Cost per Click) aus Werbekosten und Klicks berechnen, z. B. für Google Ads oder Social Ads. Kostenloser Rechner für Kosten pro Klick mit Formel und Beispiel.",
    h1: "CPC-Rechner: Kosten pro Klick berechnen",
    primary: "CPC Rechner",
    secondary: ["CPC berechnen", "Kosten pro Klick", "Cost per Click"],
    intent: "Die durchschnittlichen Kosten je Anzeigenklick ermitteln.",
  },
  cpm: {
    title: "CPM / TKP berechnen – Tausenderkontaktpreis",
    description:
      "CPM bzw. TKP (Tausenderkontaktpreis) aus Werbekosten und Impressionen berechnen. Kostenloser TKP-Rechner mit Formel und Beispiel.",
    h1: "CPM / TKP berechnen: Tausenderkontaktpreis",
    primary: "TKP berechnen",
    secondary: ["CPM berechnen", "Tausenderkontaktpreis", "Cost per Mille"],
    intent: "Die Kosten für 1.000 Werbeeinblendungen ermitteln.",
  },
  cpa: {
    title: "CPA-Rechner: Kosten pro Conversion berechnen",
    description:
      "CPA (Cost per Action) aus Werbekosten und Conversions berechnen – für Käufe, Leads oder Anmeldungen. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "CPA-Rechner: Kosten pro Conversion berechnen",
    primary: "CPA Rechner",
    secondary: [
      "CPA berechnen",
      "Cost per Action",
      "Kosten pro Lead",
      "Cost per Acquisition",
    ],
    intent: "Die Werbekosten je erreichter Conversion ermitteln.",
  },
  roas: {
    title: "ROAS-Rechner: Return on Ad Spend & Mindest-ROAS",
    description:
      "ROAS aus Werbeumsatz und Werbekosten berechnen und mit dem Mindest-ROAS prüfen, ob sich Werbung lohnt. Kostenlos, mit Formel, Beispiel und Szenariovergleich.",
    h1: "ROAS-Rechner: Return on Ad Spend und Mindest-ROAS berechnen",
    primary: "ROAS Rechner",
    secondary: [
      "ROAS berechnen",
      "Return on Ad Spend",
      "Break-even-ROAS",
      "lohnt sich Werbung",
    ],
    intent:
      "Werbeumsatz je Werbeeuro ermitteln und prüfen, ob die Werbung wirtschaftlich ist.",
  },
  cac: {
    title: "CAC-Rechner: Kosten je Neukunde berechnen",
    description:
      "Customer Acquisition Cost (CAC) aus Marketing- und Vertriebskosten und Neukunden berechnen. Kostenloser Rechner mit Formel, Beispiel und Vergleich zum CLV.",
    h1: "CAC-Rechner: Customer Acquisition Cost berechnen",
    primary: "Customer Acquisition Cost Rechner",
    secondary: [
      "CAC berechnen",
      "Kundenakquisitionskosten",
      "Kosten pro Neukunde",
    ],
    intent:
      "Ermitteln, was die Gewinnung eines Neukunden durchschnittlich kostet.",
  },

  /* ---------- Produkt & Kunden ---------- */
  arpu: {
    title: "ARPU berechnen – Umsatz pro Kunde / Account",
    description:
      "ARPU (Average Revenue per User) aus Umsatz und Anzahl der Nutzer bzw. Accounts im Zeitraum berechnen. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "ARPU berechnen: durchschnittlicher Umsatz je Account",
    primary: "ARPU berechnen",
    secondary: ["Average Revenue per User", "Umsatz pro Kunde", "ARPA"],
    intent: "Den durchschnittlichen Umsatz je Nutzer bzw. Account ermitteln.",
  },
  clv: {
    title: "CLV-Rechner: Customer Lifetime Value berechnen",
    description:
      "Customer Lifetime Value aus Bestellwert, Kaufhäufigkeit, Dauer und DB-Quote berechnen und mit dem CAC vergleichen. Kostenlos, mit Formel und Szenariovergleich.",
    h1: "CLV-Rechner: Customer Lifetime Value berechnen",
    primary: "Customer Lifetime Value Rechner",
    secondary: [
      "CLV berechnen",
      "Kundenwert berechnen",
      "LTV berechnen",
      "CLV CAC Verhältnis",
    ],
    intent:
      "Den Deckungsbeitrag eines Kunden über die Kundenbeziehung abschätzen.",
  },
  churn: {
    title: "Churn-Rate-Rechner: Abwanderung & Retention",
    description:
      "Churn Rate (Kündigungsrate) und Retention Rate aus Kunden zu Beginn, Abgängen und Zugängen berechnen. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "Churn Rate und Retention Rate berechnen",
    primary: "Churn Rate Rechner",
    secondary: [
      "Churn Rate berechnen",
      "Kündigungsrate",
      "Retention Rate",
      "Kundenbindungsrate",
    ],
    intent:
      "Den Anteil verlorener bzw. gehaltener Kunden in einem Zeitraum ermitteln.",
  },
  mrr: {
    title: "MRR- und ARR-Rechner: wiederkehrender Umsatz",
    description:
      "MRR (Monthly Recurring Revenue) und ARR (Annual Recurring Revenue) aus Abos und Preisen berechnen. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "MRR und ARR berechnen",
    primary: "MRR Rechner",
    secondary: [
      "ARR Rechner",
      "MRR berechnen",
      "ARR berechnen",
      "Monthly Recurring Revenue",
    ],
    intent: "Den monatlich bzw. jährlich wiederkehrenden Abo-Umsatz ermitteln.",
  },
  nps: {
    title: "NPS-Rechner: Net Promoter Score berechnen",
    description:
      "Net Promoter Score aus Promotoren, Passiven und Detraktoren berechnen. Kostenloser NPS-Rechner mit Formel, Beispiel und Hinweisen zur Einordnung.",
    h1: "NPS-Rechner: Net Promoter Score berechnen",
    primary: "Net Promoter Score Rechner",
    secondary: ["NPS berechnen", "NPS Formel", "Weiterempfehlungsrate"],
    intent:
      "Die Weiterempfehlungsbereitschaft aus einer Kundenbefragung auswerten.",
  },

  /* ---------- Controlling & Planung ---------- */
  "soll-ist": {
    title: "Soll-Ist-Vergleich: Abweichung berechnen",
    description:
      "Soll-Ist-Abweichung absolut und in Prozent berechnen – für Budget, Umsatz oder Kosten. Kostenloser Rechner mit Formel, Beispiel und richtiger Vorzeichendeutung.",
    h1: "Soll-Ist-Abweichung berechnen",
    primary: "Soll-Ist-Vergleich berechnen",
    secondary: ["Planabweichung", "Budgetabweichung", "Abweichungsanalyse"],
    intent:
      "Die Abweichung eines Ist-Werts vom Plan absolut und relativ ermitteln.",
  },
  auslastung: {
    title: "Auslastung berechnen – Kapazitätsauslastung",
    description:
      "Kapazitätsauslastung aus genutzter und verfügbarer Kapazität berechnen – für Personal, Maschinen oder Räume. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "Kapazitätsauslastung berechnen",
    primary: "Auslastung berechnen",
    secondary: [
      "Kapazitätsauslastung",
      "Beschäftigungsgrad",
      "Maschinenauslastung",
    ],
    intent: "Den genutzten Anteil der verfügbaren Kapazität ermitteln.",
  },
  lager: {
    title: "Lagerumschlag und Lagerdauer berechnen",
    description:
      "Lagerumschlagshäufigkeit und durchschnittliche Lagerdauer aus Ø-Bestand oder Anfangs- und Endbestand berechnen. Kostenloser Rechner mit Formel und Beispiel.",
    h1: "Lagerumschlag und Lagerdauer berechnen",
    primary: "Lagerumschlag berechnen",
    secondary: [
      "Lagerumschlagshäufigkeit",
      "Lagerdauer berechnen",
      "durchschnittlicher Lagerbestand",
    ],
    intent:
      "Ermitteln, wie oft der Lagerbestand umgeschlagen wird und wie lange Ware liegt.",
  },
};

/** Vollständiger HTML-Titel einer Rechnerseite. */
export const seoPageTitle = (id: string) => `${SEO[id].title} | KPILot`;
