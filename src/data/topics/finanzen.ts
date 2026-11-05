import type { Topic } from "../types";

const IHK = {
  label: "IHK Regensburg: Kennzahlen zur Früherkennung von Krisen",
  url: "https://www.ihk.de/regensburg/fachthemen/finanzierung-und-krisenmanagement/krisenmanagement/kennzahlen-frueherkennung-krisen-4820236",
};

export const finanzenTopics: Topic[] = [
  {
    id: "ebit",
    slug: "ebit-rechner",
    title: "EBIT",
    fullTerm:
      "Earnings Before Interest and Taxes – Ergebnis vor Zinsen und Ertragsteuern",
    category: "finanzen",
    short:
      "Operatives Ergebnis vor Zinsen und Ertragsteuern – kein Kontostand.",
    question: "Was verdient mein operatives Geschäft vor Zinsen und Steuern?",
    intro:
      "Das EBIT zeigt das Ergebnis vor Zinsen und Ertragsteuern. In diesem vereinfachten Modell ziehst du die betrieblichen Aufwendungen einschließlich Abschreibungen von den betrieblichen Erträgen ab.",
    synonyms: [
      "ebit",
      "earnings before interest and taxes",
      "operatives ergebnis",
      "betriebsergebnis",
      "ergebnis vor zinsen und steuern",
      "was bleibt vom umsatz",
      "operativer gewinn",
    ],
    image: {
      alt: "100.000 € Umsatz, davon gehen 70.000 € übriger Betriebsaufwand und 10.000 € Abschreibungen ab; 20.000 € EBIT bleiben.",
      caption:
        "Beispiel: 100.000 € − 70.000 € − 10.000 € = 20.000 € EBIT. Zinsen und Steuern sind noch nicht abgezogen.",
      description:
        "Ein Umsatzbalken von 100.000 € ist maßstäblich in drei Teile geteilt: 70.000 € übriger Betriebsaufwand, 10.000 € Abschreibungen und 20.000 € EBIT (hervorgehoben). Rechts daneben gestrichelte Felder „Zinsen“ und „Steuern – hier noch nicht berücksichtigt“.",
    },
    formula: [
      "EBIT = Umsatzerlöse + sonstige betriebliche Erträge − betriebliche Aufwendungen ohne Abschreibungen − Abschreibungen",
    ],
    variables: [
      ["Umsatzerlöse", "Nettoumsatz der Periode"],
      ["sonstige betriebliche Erträge", "z. B. Mieteinnahmen"],
      [
        "Aufwendungen ohne Abschreibungen",
        "Material, Personal, sonstiger Betriebsaufwand",
      ],
      ["Abschreibungen", "Wertverlust des Anlagevermögens"],
    ],
    interpretation:
      "Ein positives EBIT heißt: Das Kerngeschäft deckt seine Aufwendungen. Über Geld auf dem Konto sagt es nichts.",
    misconceptions: [
      "EBIT ist kein Kontostand und kein Cashflow.",
      "Abschreibungen nicht doppelt abziehen, wenn sie schon im Aufwand stecken.",
    ],
    assumptions: [
      "Vereinfachtes Modell, kein vollständiger HGB-/IFRS-Abschluss.",
      "Alle Werte aus derselben Periode.",
      "Zinsergebnis und Ertragsteuern nicht enthalten.",
    ],
    related: ["ebitda", "ebit-marge", "cashflow", "umsatzrendite"],
    seoTitle: "EBIT berechnen – Ergebnis vor Zinsen und Steuern verständlich",
    seoDescription:
      "EBIT berechnen und verstehen: Umsatz minus Betriebsaufwand und Abschreibungen, mit Bild, Rechenweg und Abgrenzung zu EBITDA und Cashflow.",
    sources: [IHK],
  },
  {
    id: "ebitda",
    slug: "ebitda-rechner",
    title: "EBITDA",
    fullTerm: "Earnings Before Interest, Taxes, Depreciation and Amortization",
    category: "finanzen",
    short: "EBIT plus Abschreibungen – eine Ergebnisgröße, kein Geldbestand.",
    question: "Wie hoch ist das Ergebnis vor Abschreibungen?",
    intro:
      "Das EBITDA ist das EBIT, zu dem die darin abgezogenen Abschreibungen wieder hinzugerechnet werden. Es blendet aus, wie stark sich Investitionen der Vergangenheit auf das Ergebnis auswirken.",
    synonyms: [
      "ebitda",
      "ergebnis vor abschreibungen",
      "operatives ergebnis vor abschreibungen",
      "earnings before interest taxes depreciation amortization",
    ],
    image: {
      alt: "Ergebnisbrücke: 20.000 € EBIT plus 10.000 € Abschreibungen ergeben 30.000 € EBITDA.",
      caption:
        "Beispiel: 20.000 € EBIT + 10.000 € Abschreibungen = 30.000 € EBITDA – eine Ergebnisgröße, kein Bankguthaben.",
      description:
        "Eine Brücke aus zwei Blöcken: EBIT 20.000 € und darauf Abschreibungen 10.000 € (schraffiert, „wieder hinzugerechnet“). Zusammen ergibt sich EBITDA 30.000 €. Ein Hinweis: „Rechengröße – kein Geld auf dem Konto“.",
    },
    formula: [
      "EBITDA = EBIT + Abschreibungen auf Sachanlagen und immaterielle Vermögenswerte",
    ],
    variables: [
      ["EBIT", "Ergebnis vor Zinsen und Ertragsteuern"],
      [
        "Abschreibungen",
        "die im EBIT abgezogenen betrieblichen Abschreibungen",
      ],
    ],
    interpretation:
      "Das EBITDA eignet sich zum Vergleich der operativen Leistung unabhängig von Abschreibungsmethoden.",
    misconceptions: [
      "EBITDA ist weder Cashflow noch frei verfügbares Geld.",
      "Abschreibungen auf Finanzanlagen gehören nicht ungeprüft dazu.",
    ],
    assumptions: [
      "Die hinzugerechneten Abschreibungen sind im EBIT enthalten.",
    ],
    related: ["ebit", "cashflow", "ebit-marge"],
    seoTitle: "EBITDA berechnen – Ergebnisbrücke vom EBIT",
    seoDescription:
      "EBITDA aus EBIT und Abschreibungen berechnen, mit Ergebnisbrücke und klarer Abgrenzung: EBITDA ist kein Cashflow und kein Geldbestand.",
    sources: [
      {
        label: "Deutsche Börse: Glossar EBITDA",
        url: "https://live.deutsche-boerse.com/en/know-how/glossary/ebitda",
      },
    ],
  },
  {
    id: "ebit-marge",
    slug: "ebit-marge-rechner",
    title: "EBIT-Marge",
    category: "finanzen",
    short:
      "Welcher Anteil des Umsatzes als operatives Ergebnis vor Zinsen und Steuern bleibt.",
    question: "Wie viel Prozent vom Umsatz bleiben als EBIT?",
    intro:
      "Die EBIT-Marge setzt das EBIT ins Verhältnis zum Umsatz. 20.000 € EBIT bei 100.000 € Umsatz sind 20 %.",
    synonyms: [
      "ebit marge",
      "operative marge",
      "operating margin",
      "ebit-rendite",
      "was bleibt vom umsatz",
      "betriebsmarge",
    ],
    image: {
      alt: "20.000 € EBIT als 20-%-Anteil eines Umsatzbalkens von 100.000 €.",
      caption:
        "Beispiel: 20.000 € EBIT von 100.000 € Umsatz = 20 % EBIT-Marge.",
      description:
        "Ein Umsatzbalken von 100.000 € mit 10 gleich großen Segmenten; die letzten 2 Segmente sind als EBIT (20.000 €, 20 %) hervorgehoben.",
    },
    formula: ["EBIT-Marge = EBIT / Nettoumsatz × 100"],
    variables: [
      ["EBIT", "Ergebnis vor Zinsen und Ertragsteuern"],
      ["Nettoumsatz", "Umsatzerlöse derselben Periode"],
    ],
    interpretation:
      "Die Marge macht Unternehmen unterschiedlicher Größe vergleichbar – innerhalb derselben Branche.",
    misconceptions: [
      "Keine pauschalen Zielwerte: Übliche Margen unterscheiden sich stark nach Branche.",
      "Nicht mit Rohmarge oder Umsatzrendite verwechseln.",
    ],
    assumptions: ["EBIT und Umsatz aus derselben Periode."],
    related: ["ebit", "umsatzrendite", "marge"],
    seoTitle: "EBIT-Marge berechnen – operative Marge in Prozent",
    seoDescription:
      "EBIT-Marge berechnen: EBIT im Verhältnis zum Nettoumsatz, mit Beispiel, Rechenweg und Abgrenzung zu Rohmarge und Umsatzrendite.",
  },
  {
    id: "umsatzrendite",
    slug: "umsatzrendite-rechner",
    title: "Umsatzrendite",
    fullTerm: "Nettoumsatzrendite / Nettomarge",
    category: "finanzen",
    short:
      "Anteil des Umsatzes, der nach allen Aufwendungen, Zinsen und Steuern bleibt.",
    question: "Wie viel vom Umsatz bleibt am Ende als Jahresüberschuss?",
    intro:
      "Die Nettoumsatzrendite zeigt, welcher Anteil des Umsatzes als Jahresüberschuss übrig bleibt. Darin sind Zinsen und Ertragsteuern bereits abgezogen.",
    synonyms: [
      "umsatzrendite",
      "nettomarge",
      "nettoumsatzrendite",
      "return on sales",
      "gewinnmarge",
      "umsatzrentabilität",
      "was bleibt vom umsatz",
      "jahresüberschuss in prozent",
    ],
    image: {
      alt: "8.000 € Jahresüberschuss als 8-%-Anteil an 100.000 € Umsatz.",
      caption:
        "Beispiel: 8.000 € Jahresüberschuss von 100.000 € Umsatz = 8 % Nettoumsatzrendite.",
      description:
        "Ein Umsatzbalken von 100.000 € auf einer Skala von 0 bis 100 %. Ein schmales Segment von 8 % ist als Jahresüberschuss 8.000 € hervorgehoben, der Rest ist als „alle Aufwendungen, Zinsen, Steuern“ beschriftet.",
    },
    formula: ["Nettoumsatzrendite = Jahresüberschuss / Nettoumsatz × 100"],
    variables: [
      ["Jahresüberschuss", "Ergebnis nach Zinsen und Ertragsteuern"],
      ["Nettoumsatz", "Umsatzerlöse derselben Periode"],
    ],
    interpretation:
      "Eine niedrigere Umsatzrendite als die EBIT-Marge erklärt sich durch Zinsen und Steuern.",
    misconceptions: [
      "Nicht mit Rohmarge, Deckungsbeitragsquote oder EBIT-Marge verwechseln.",
      "„Gewinn“ ist hier ausdrücklich das Ergebnis nach Zinsen und Steuern.",
    ],
    assumptions: ["Ergebnis und Umsatz aus derselben Periode."],
    related: ["ebit-marge", "marge", "roi"],
    seoTitle: "Umsatzrendite berechnen – Nettomarge in Prozent",
    seoDescription:
      "Nettoumsatzrendite berechnen: Jahresüberschuss im Verhältnis zum Umsatz, mit Abgrenzung zu Marge, Deckungsbeitragsquote und EBIT-Marge.",
  },
  {
    id: "cashflow",
    slug: "cashflow-rechner",
    title: "Cashflow",
    category: "finanzen",
    short:
      "Tatsächliche Ein- und Auszahlungen eines Zeitraums – operativ oder mit Investition und Finanzierung.",
    question: "Wie viel Geld ist tatsächlich zu- oder abgeflossen?",
    intro:
      "Der Cashflow zeigt, wie sich tatsächliche Ein- und Auszahlungen in einem Zeitraum gegenüberstehen. Gewinn und Kontobewegungen können deshalb unterschiedlich sein.",
    synonyms: [
      "cashflow",
      "cash flow",
      "geldfluss",
      "zahlungsstrom",
      "geld auf dem konto",
      "kontobewegung",
      "operativer cashflow",
      "einzahlungen auszahlungen",
      "kapitalflussrechnung",
      "free cashflow",
    ],
    image: {
      alt: "Ein Bankkonto mit 30.000 € Zahlungseingängen und 22.000 € Zahlungsausgängen ergibt +8.000 € operativen Cashflow.",
      caption:
        "Beispiel: 30.000 € Einzahlungen − 22.000 € Auszahlungen = +8.000 € operativer Cashflow. Eine unbezahlte Rechnung zählt noch nicht.",
      description:
        "Ein Konto-Symbol in der Mitte. Ein Pfeil hinein mit „30.000 € Einzahlungen“, ein Pfeil hinaus mit „22.000 € Auszahlungen“, darunter „+8.000 €“. Daneben eine gestrichelte Rechnung über 5.000 € mit dem Hinweis „noch nicht bezahlt – kein Zufluss“.",
    },
    formula: [
      "Operativer Cashflow = betriebliche Einzahlungen − betriebliche Auszahlungen",
      "Netto-Cashflow = operativ + investiv + Finanzierung",
    ],
    variables: [
      ["Einzahlungen", "tatsächlich eingegangene Zahlungen"],
      ["Auszahlungen", "tatsächlich geleistete Zahlungen"],
      ["investiv", "Kauf und Verkauf von Anlagen"],
      ["Finanzierung", "Kredite, Tilgungen, Einlagen, Entnahmen"],
    ],
    interpretation:
      "Ein positiver Cashflow bedeutet: Es ist mehr Geld hereingekommen als hinausgegangen.",
    misconceptions: [
      "Umsatz ist noch keine Einzahlung, solange die Rechnung offen ist.",
      "Abschreibungen sind Aufwand, aber keine Zahlung.",
      "EBITDA ist kein Cashflow.",
    ],
    assumptions: [
      "Direkte, vereinfachte Zahlungsübersicht – keine gesetzliche Kapitalflussrechnung.",
      "Zinsen und Steuern werden im Modell dem operativen Bereich zugeordnet.",
    ],
    related: ["liquiditaet", "working-capital", "ebit", "ebitda"],
    seoTitle: "Cashflow berechnen – operativ, investiv und Finanzierung",
    seoDescription:
      "Cashflow berechnen: operativer Cashflow aus Ein- und Auszahlungen oder erweiterte Übersicht mit Investitions- und Finanzierungs-Cashflow – mit Bild und Abgrenzung zum Gewinn.",
    sources: [
      {
        label: "IFRS Foundation: IAS 7 Statement of Cash Flows",
        url: "https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows.html/",
      },
    ],
  },
  {
    id: "working-capital",
    slug: "working-capital-rechner",
    title: "Working Capital",
    fullTerm: "Nettoumlaufvermögen",
    category: "finanzen",
    short:
      "Umlaufvermögen minus kurzfristige Verpflichtungen an einem Stichtag.",
    question:
      "Reicht mein kurzfristiges Vermögen für die kurzfristigen Schulden?",
    intro:
      "Das Working Capital ist das Umlaufvermögen abzüglich der kurzfristigen Verpflichtungen. Es zeigt, wie viel kurzfristig gebundenes Vermögen nicht schon durch bald fällige Schulden belegt ist.",
    synonyms: [
      "working capital",
      "nettoumlaufvermögen",
      "umlaufvermögen",
      "kurzfristige verbindlichkeiten",
      "betriebskapital",
      "net working capital",
    ],
    image: {
      alt: "50.000 € Umlaufvermögen minus 30.000 € kurzfristige Verpflichtungen ergeben 20.000 € Working Capital.",
      caption:
        "Beispiel: 50.000 € − 30.000 € = 20.000 € Working Capital am Stichtag.",
      description:
        "Zwei Säulen im gleichen Maßstab: links Umlaufvermögen 50.000 €, rechts kurzfristige Verpflichtungen 30.000 €. Der Überstand der linken Säule (20.000 €) ist als Working Capital markiert.",
    },
    formula: [
      "Working Capital = Umlaufvermögen − kurzfristige Verpflichtungen",
    ],
    variables: [
      ["Umlaufvermögen", "liquide Mittel, Forderungen, Vorräte, sonstiges"],
      [
        "kurzfristige Verpflichtungen",
        "kurzfristige Verbindlichkeiten inkl. kurzfristiger Rückstellungen",
      ],
    ],
    interpretation:
      "Ein negatives Working Capital heißt: Die kurzfristigen Schulden übersteigen das kurzfristige Vermögen.",
    misconceptions: [
      "Working Capital ist kein frei verfügbares Bankguthaben.",
      "Es ist eine Stichtagsgröße, kein Zahlungsstrom wie der Cashflow.",
    ],
    assumptions: ["Dieselbe Abgrenzung wie im Liquiditätsrechner."],
    related: ["liquiditaet", "cashflow", "eigenkapital"],
    seoTitle: "Working Capital berechnen – Nettoumlaufvermögen",
    seoDescription:
      "Working Capital berechnen: Umlaufvermögen minus kurzfristige Verpflichtungen, mit Bild und Abgrenzung zu Bankguthaben und Cashflow.",
  },
  {
    id: "liquiditaet",
    slug: "liquiditaetsrechner",
    title: "Liquidität 1., 2. & 3. Grades",
    category: "finanzen",
    short:
      "Wie gut decken liquide Mittel, Forderungen und Umlaufvermögen die kurzfristigen Verpflichtungen?",
    question: "Kann ich meine kurzfristigen Rechnungen bezahlen?",
    intro:
      "Die Liquiditätsgrade vergleichen schrittweise mehr Vermögen mit denselben kurzfristigen Verpflichtungen. Der 1. Grad nimmt nur liquide Mittel, der 3. Grad das gesamte Umlaufvermögen.",
    synonyms: [
      "liquidität",
      "liquiditätsgrad",
      "barliquidität",
      "quick ratio",
      "current ratio",
      "cash ratio",
      "zahlungsfähigkeit",
      "geld auf dem konto reicht",
      "liquidität 1 grades",
      "liquidität 2 grades",
      "liquidität 3 grades",
    ],
    image: {
      alt: "Drei Vermögensgruppen werden jeweils denselben kurzfristigen Verpflichtungen von 20.000 € gegenübergestellt: 50 %, 125 %, 250 %.",
      caption:
        "Beispiel: 10.000 € liquide Mittel, + 15.000 € Forderungen, + 25.000 € Vorräte und Sonstiges – jeweils gegen 20.000 € Verpflichtungen.",
      description:
        "Drei Zeilen. In jeder Zeile steht rechts derselbe Block „kurzfristige Verpflichtungen 20.000 €“. Links: 1. Grad liquide Mittel 10.000 € (50 %), 2. Grad zusätzlich Forderungen = 25.000 € (125 %), 3. Grad gesamtes Umlaufvermögen 50.000 € (250 %).",
    },
    formula: [
      "L1 = liquide Mittel / kurzfristige Verpflichtungen × 100",
      "L2 = (liquide Mittel + Forderungen) / kurzfristige Verpflichtungen × 100",
      "L3 = Umlaufvermögen / kurzfristige Verpflichtungen × 100",
    ],
    variables: [
      [
        "liquide Mittel",
        "Kasse, Bank, kurzfristig verfügbare Zahlungsmitteläquivalente",
      ],
      ["Forderungen", "kurzfristige Forderungen"],
      ["Umlaufvermögen", "liquide Mittel + Forderungen + Vorräte + Sonstiges"],
    ],
    interpretation:
      "Über 100 % heißt: Die jeweilige Vermögensgruppe ist größer als die Verpflichtungen.",
    misconceptions: [
      "Keine universelle Ampel: Angemessene Werte hängen von Branche und Zahlungszielen ab.",
      "Stichtagswerte können sich wenige Tage später deutlich ändern.",
    ],
    assumptions: [
      "Nicht überlappende Vermögensbeträge.",
      "Dieselbe Abgrenzung kurzfristiger Verpflichtungen wie beim Working Capital.",
    ],
    related: ["working-capital", "cashflow", "eigenkapital"],
    seoTitle: "Liquiditätsgrade berechnen – Liquidität 1., 2. und 3. Grades",
    seoDescription:
      "Liquidität 1., 2. und 3. Grades berechnen: liquide Mittel, Forderungen und Umlaufvermögen im Verhältnis zu kurzfristigen Verpflichtungen – ohne pauschale Ampel.",
    sources: [IHK],
  },
  {
    id: "eigenkapital",
    slug: "eigenkapitalquote-rechner",
    title: "Eigenkapitalquote",
    category: "finanzen",
    short: "Anteil des Eigenkapitals am Gesamtkapital eines Stichtags.",
    question: "Wie viel meines Unternehmens ist mit eigenem Geld finanziert?",
    intro:
      "Die Eigenkapitalquote zeigt, welcher Anteil des Gesamtkapitals aus eigenen Mitteln stammt. Der Rest ist Fremdkapital, etwa Kredite oder Lieferantenschulden.",
    synonyms: [
      "eigenkapitalquote",
      "ek-quote",
      "eigenkapital",
      "fremdkapital",
      "kapitalstruktur",
      "bilanzsumme",
      "verschuldung",
      "equity ratio",
    ],
    image: {
      alt: "30.000 € Eigenkapital und 70.000 € Fremdkapital bilden zusammen 100.000 € Gesamtkapital.",
      caption:
        "Beispiel: 30.000 € Eigenkapital von 100.000 € Gesamtkapital = 30 %.",
      description:
        "Ein Balken „Gesamtkapital 100.000 €“ ist in 30.000 € Eigenkapital (hervorgehoben, 30 %) und 70.000 € Fremdkapital (grau, 70 %) geteilt.",
    },
    formula: ["Eigenkapitalquote = Eigenkapital / Gesamtkapital × 100"],
    variables: [
      ["Eigenkapital", "eigene Mittel laut Bilanz, kann negativ sein"],
      ["Gesamtkapital", "Bilanzsumme am selben Stichtag"],
    ],
    interpretation:
      "Ein höherer Anteil bedeutet weniger Abhängigkeit von Fremdkapitalgebern.",
    misconceptions: [
      "Eine Quote allein ist keine Bonitätsbewertung.",
      "Negatives Eigenkapital bedeutet bilanzielle Überschuldung.",
    ],
    assumptions: ["Eigenkapital und Bilanzsumme vom selben Stichtag."],
    related: ["liquiditaet", "working-capital", "roi"],
    seoTitle: "Eigenkapitalquote berechnen",
    seoDescription:
      "Eigenkapitalquote berechnen: Eigenkapital im Verhältnis zur Bilanzsumme, mit Hinweisen zu negativem Eigenkapital und ohne pauschale Bewertung.",
    sources: [IHK],
  },
  {
    id: "roi",
    slug: "roi-rechner",
    title: "Kapitalrendite",
    abbr: "ROI",
    fullTerm: "Return on Investment",
    category: "finanzen",
    short: "Gewinn einer Periode im Verhältnis zum eingesetzten Kapital.",
    question: "Wie viel Prozent bringt mein eingesetztes Kapital?",
    intro:
      "Der ROI setzt den Gewinn, den eine Investition in einem Zeitraum bringt, ins Verhältnis zum eingesetzten Kapital. 5.000 € Gewinn auf 50.000 € Kapital sind 10 %.",
    synonyms: [
      "roi",
      "return on investment",
      "kapitalrendite",
      "rendite",
      "kapitalverzinsung",
      "gesamtkapitalrendite",
      "lohnt sich die investition",
    ],
    image: {
      alt: "5.000 € Periodengewinn werden auf 50.000 € eingesetztes Kapital bezogen: 10 %.",
      caption:
        "Beispiel: 5.000 € Gewinn / 50.000 € Kapital = 10 % im betrachteten Zeitraum.",
      description:
        "Ein großer Kapitalblock von 50.000 €, aus dem ein Pfeil zu einem kleinen Gewinnblock von 5.000 € führt. Der Gewinnblock entspricht einem Zehntel der Kapitalfläche; Beschriftung „10 %“.",
    },
    formula: ["ROI = Gewinn der Periode / eingesetztes Kapital × 100"],
    variables: [
      ["Gewinn", "zurechenbarer Gewinn – nicht Umsatz"],
      ["eingesetztes Kapital", "größer als 0"],
    ],
    interpretation:
      "Der ROI gilt nur für den betrachteten Zeitraum und wird nicht automatisch hochgerechnet.",
    misconceptions: [
      "Umsatz gehört nicht in den Zähler – das wäre eher ein ROAS.",
      "Gewinn nicht doppelt um schon abgezogene Kosten mindern.",
    ],
    assumptions: [
      "Einfache periodenbezogene Rendite.",
      "Keine Abzinsung, keine Jahreshochrechnung.",
    ],
    related: ["amortisation", "roas", "eigenkapital", "cagr"],
    seoTitle: "ROI-Rechner: Kapitalrendite berechnen",
    seoDescription:
      "ROI berechnen: Gewinn im Verhältnis zum eingesetzten Kapital, mit Bild, Rechenweg und klarer Abgrenzung zum ROAS.",
  },
  {
    id: "amortisation",
    slug: "amortisationsrechner",
    title: "Amortisationsdauer",
    category: "finanzen",
    short:
      "Wie lange es dauert, bis eine Investition durch Rückflüsse wieder eingespielt ist.",
    question: "Wann hat sich meine Investition bezahlt gemacht?",
    intro:
      "Die Amortisationsdauer gibt an, nach wie vielen Perioden die Rückflüsse den Investitionsbetrag erreichen. Das Modell nimmt gleichbleibende Rückflüsse an und zinst nicht ab.",
    synonyms: [
      "amortisation",
      "payback",
      "payback period",
      "amortisationszeit",
      "rückzahlungsdauer",
      "wann lohnt sich",
      "kapitalrückfluss",
      "pay off",
    ],
    image: {
      alt: "10.000 € Investition werden durch vier jährliche Rückflüsse von 2.500 € zurückverdient.",
      caption: "Beispiel: 10.000 € Investition / 2.500 € pro Jahr = 4 Jahre.",
      description:
        "Eine Zeitachse mit vier Jahren. Jedes Jahr füllt ein Viertel eines Behälters „Investition 10.000 €“ mit 2.500 €. Nach Jahr 4 ist der Behälter voll.",
    },
    formula: [
      "Amortisationsdauer = Investitionsbetrag / Netto-Zahlungsüberschuss je Periode",
    ],
    variables: [
      ["Investitionsbetrag", "anfängliche Auszahlung"],
      [
        "Netto-Zahlungsüberschuss",
        "zusätzliche Einzahlungen minus Auszahlungen je Periode",
      ],
    ],
    interpretation:
      "Je kürzer die Dauer, desto schneller ist das Kapital wieder verfügbar – über die Rentabilität danach sagt sie nichts.",
    misconceptions: [
      "Was nach der Amortisation passiert, bleibt unberücksichtigt.",
      "Ohne Abzinsung zählt Geld in fünf Jahren so viel wie heute.",
    ],
    assumptions: [
      "Konstante Rückflüsse je Periode.",
      "Statisches Modell ohne Abzinsung.",
    ],
    related: ["roi", "cashflow"],
    seoTitle: "Amortisationsrechner: Amortisationsdauer berechnen",
    seoDescription:
      "Amortisationsdauer einer Investition berechnen: Investitionsbetrag durch Rückfluss je Periode, mit Hinweisen zum statischen Modell ohne Abzinsung.",
  },
];
