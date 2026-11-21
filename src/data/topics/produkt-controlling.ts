import type { Topic } from "../types";

export const produktTopics: Topic[] = [
  {
    id: "arpu",
    slug: "arpu-rechner",
    title: "Umsatz je Account",
    abbr: "ARPU",
    fullTerm: "Average Revenue per User",
    category: "produkt",
    short: "Durchschnittlicher Umsatz je aktivem Account in einer Periode.",
    question: "Wie viel Umsatz bringt ein Kunde im Monat?",
    intro:
      "Der ARPU verteilt den Umsatz einer Periode auf die durchschnittlich aktiven Accounts. 5.000 € Monatsumsatz bei 100 Accounts sind 50 € je Account und Monat.",
    synonyms: [
      "arpu",
      "average revenue per user",
      "umsatz pro kunde",
      "umsatz je nutzer",
      "arpa",
      "durchschnittsumsatz pro kunde",
    ],
    image: {
      alt: "5.000 € Monatsumsatz werden auf 100 aktive Accounts verteilt: 50 € je Account.",
      caption:
        "Beispiel: 5.000 € / durchschnittlich 100 aktive Accounts = 50 € je Account und Monat.",
      description:
        "Ein Umsatzblock 5.000 € wird auf ein Raster aus 100 Account-Symbolen verteilt; jedes trägt 50 €.",
    },
    formula: ["ARPU = Umsatz der Periode / durchschnittlich aktive Accounts"],
    variables: [
      ["Umsatz", "zugeordneter Umsatz der Periode"],
      ["aktive Accounts", "Durchschnitt der Periode (Abrechnungseinheiten)"],
    ],
    interpretation:
      "Steigt der ARPU, bringt jeder Account im Schnitt mehr Umsatz.",
    misconceptions: [
      "Accounts sind nicht dasselbe wie Besucher oder Personen.",
    ],
    assumptions: ["Umsatz und Accountbestand aus derselben Periode."],
    related: ["clv", "mrr", "churn"],
  },
  {
    id: "clv",
    slug: "clv-rechner",
    title: "Customer Lifetime Value",
    abbr: "CLV",
    fullTerm: "Kundenwert über die gesamte Beziehung",
    category: "produkt",
    short:
      "Deckungsbeitrag, den ein Kunde über die angenommene Beziehungsdauer bringt.",
    question: "Wie viel ist mir ein Kunde wert – wie teuer darf er sein?",
    intro:
      "Der CLV schätzt, wie viel Deckungsbeitrag ein durchschnittlicher Kunde über die gesamte Beziehung bringt. Er hilft einzuschätzen, wie viel die Gewinnung eines Kunden kosten darf.",
    synonyms: [
      "clv",
      "customer lifetime value",
      "kundenwert",
      "ltv",
      "lifetime value",
      "kundenlebenswert",
      "wie teuer darf ein kunde sein",
      "was ist ein kunde wert",
    ],
    image: {
      alt: "50 € pro Kauf × 4 Käufe pro Jahr × 3 Jahre = 600 € Umsatz; × 40 % DB-Quote = 240 € Modellwert.",
      caption:
        "Beispiel: 50 € × 4 × 3 = 600 € Umsatz → davon 40 % Deckungsbeitrag = 240 € CLV im Modell.",
      description:
        "Eine Zeitachse über 3 Jahre mit je 4 Kauf-Symbolen à 50 €. Am Ende ein Umsatzbalken 600 €, von dem 40 % (240 €) als Deckungsbeitrag hervorgehoben sind.",
    },
    formula: [
      "CLV = Bestellwert × Käufe pro Jahr × Jahre × DB-Quote / 100",
      "Optional: Modellbeitrag nach Akquisition = CLV − CAC",
    ],
    variables: [
      ["Bestellwert", "durchschnittlicher Nettobestellwert"],
      ["Käufe pro Jahr", "Kaufhäufigkeit"],
      ["Jahre", "angenommene Beziehungsdauer"],
      ["DB-Quote", "Deckungsbeitragsquote in %"],
    ],
    interpretation:
      "Liegt der CAC deutlich unter dem CLV, kann sich die Kundengewinnung lohnen – im Rahmen der Annahmen.",
    misconceptions: [
      "Umsatz-LTV und beitragsbasierter CLV sind nicht austauschbar.",
      "Eine Churn-Rate von 0 bedeutet keinen unendlichen Kundenwert.",
    ],
    assumptions: [
      "Konstante Werte, keine Abzinsung.",
      "Kein vollständiges Kohorten- oder Retention-Modell.",
    ],
    related: ["cac", "arpu", "churn", "deckungsbeitrag"],
  },
  {
    id: "churn",
    slug: "churn-rechner",
    title: "Churn & Kundenbindung",
    fullTerm: "Abwanderungsrate und Retention",
    category: "produkt",
    short: "Anteil der Anfangskunden, die gegangen bzw. geblieben sind.",
    question: "Wie viele Kunden habe ich im Quartal verloren?",
    intro:
      "Die Churn-Rate zeigt, welcher Anteil der Kunden vom Periodenbeginn in der Periode gegangen ist. Die Retention ist der Anteil, der geblieben ist – Neukunden zählen dabei nicht mit.",
    synonyms: [
      "churn",
      "churn rate",
      "abwanderungsrate",
      "kündigungsrate",
      "retention",
      "kundenbindung",
      "kundenbindungsrate",
      "kundenverlust",
      "wie viele kunden verloren",
    ],
    image: {
      alt: "Von 100 Bestandskunden gehen 10, 90 bleiben; Neukunden stehen getrennt daneben.",
      caption:
        "Beispiel: 10 von 100 Anfangskunden gehen = 10 % Churn, 90 % Retention. Neukunden zählen nicht zur Anfangskohorte.",
      description:
        "Ein Raster mit 100 Personen-Symbolen; 10 sind ausgegraut und durchgestrichen („verloren“), 90 bleiben. Rechts außerhalb des Rasters stehen 20 neue Symbole „Neukunden – separat“.",
    },
    formula: [
      "Churn = verlorene Kunden / Kunden zu Periodenbeginn × 100",
      "Retention = verbliebene Anfangskunden / Kunden zu Periodenbeginn × 100",
    ],
    variables: [
      ["Kunden zu Periodenbeginn", "Anfangskohorte"],
      ["verlorene Kunden", "aus der Anfangskohorte, im Zeitraum"],
    ],
    interpretation:
      "Im geschlossenen Kundenmodell ergeben Churn und Retention zusammen 100 %.",
    misconceptions: [
      "Neukunden verbessern nicht die Retention der Anfangskunden.",
      "Kunden-Churn ist nicht dasselbe wie Umsatz-Churn.",
    ],
    assumptions: ["Verlorene Kunden stammen aus dem Anfangsbestand."],
    related: ["clv", "mrr", "arpu"],
  },
  {
    id: "mrr",
    slug: "mrr-arr-rechner",
    title: "MRR & ARR",
    fullTerm: "Monthly / Annual Recurring Revenue",
    category: "produkt",
    short:
      "Wiederkehrender Monatsumsatz aus Abos – und hochgerechnet aufs Jahr.",
    question: "Wie viel wiederkehrenden Umsatz bringen meine Abos im Monat?",
    intro:
      "Der MRR rechnet alle aktiven Abos auf einen Monat um und addiert sie. Der ARR ist der MRR mal 12 – eine Run-Rate, kein verbuchter Jahresumsatz.",
    synonyms: [
      "mrr",
      "arr",
      "monthly recurring revenue",
      "annual recurring revenue",
      "wiederkehrender umsatz",
      "abo umsatz",
      "subscription",
      "run rate",
      "saas umsatz",
    ],
    image: {
      alt: "10 Monatsabos à 20 € und 12 Jahresabos à 120 € ergeben 320 € MRR und 3.840 € ARR.",
      caption:
        "Beispiel: 10 × 20 € + 12 × 120 € / 12 = 200 € + 120 € = 320 € MRR → 3.840 € ARR.",
      description:
        "Zwei Zeilen: 10 Monatsabo-Karten à 20 € ergeben 200 €; 12 Jahresabo-Karten à 120 € werden durch 12 Monate geteilt und ergeben 120 € pro Monat. Zusammen 320 € MRR, mal 12 = 3.840 € ARR.",
    },
    formula: [
      "MRR je Tarif = Abos × Preis / Intervall in Monaten",
      "MRR = Summe aller Tarife",
      "ARR = MRR × 12",
    ],
    variables: [
      ["Abos", "aktive Abos des Tarifs"],
      ["Preis", "tatsächlicher wiederkehrender Nettopreis je Intervall"],
      ["Intervall", "Abrechnungsintervall in Monaten"],
    ],
    interpretation:
      "Der MRR zeigt die aktuelle Stärke des Abo-Geschäfts, unabhängig vom Abrechnungsrhythmus.",
    misconceptions: [
      "ARR ist kein garantierter oder verbuchter Jahresumsatz.",
      "Einmalgebühren und Steuern gehören nicht hinein.",
    ],
    assumptions: ["Rabatte sind im eingegebenen Preis bereits berücksichtigt."],
    related: ["arpu", "churn", "clv"],
    sources: [
      {
        label: "Stripe: MRR und ARR verstehen",
        url: "https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29",
      },
    ],
  },
  {
    id: "nps",
    slug: "nps-rechner",
    title: "Net Promoter Score",
    abbr: "NPS",
    category: "produkt",
    short:
      "Weiterempfehlungs-Score zwischen −100 und +100 aus Promotoren und Detraktoren.",
    question: "Wie hoch ist mein Net Promoter Score?",
    intro:
      "Der NPS zieht den Anteil der Kritiker (0–6 Punkte) vom Anteil der Fans (9–10 Punkte) ab. Das Ergebnis ist ein Score zwischen −100 und +100.",
    synonyms: [
      "nps",
      "net promoter score",
      "weiterempfehlung",
      "kundenzufriedenheit",
      "promotoren",
      "detraktoren",
      "weiterempfehlungsrate",
      "kundenumfrage",
    ],
    image: {
      alt: "60 Promotoren, 10 Passive und 30 Detraktoren ergeben einen NPS von +30 Punkten.",
      caption:
        "Beispiel: 60 % Promotoren − 30 % Detraktoren = NPS +30 (Punkte, keine Prozentquote).",
      description:
        "Ein Balken aus 100 Antworten: 60 Promotoren (hervorgehoben, Plus-Symbol), 10 Passive (neutral), 30 Detraktoren (Minus-Symbol, schraffiert). Darunter eine Skala von −100 bis +100 mit Markierung bei +30.",
    },
    formula: ["NPS = (Promotoren − Detraktoren) / alle Antworten × 100"],
    variables: [
      ["Promotoren", "Bewertung 9–10"],
      ["Passive", "Bewertung 7–8, zählen im Nenner"],
      ["Detraktoren", "Bewertung 0–6"],
    ],
    interpretation: "Positive Werte bedeuten mehr Fans als Kritiker.",
    misconceptions: [
      "+30 ist keine 30-%-Zufriedenheitsquote.",
      "Kleine Stichproben schwanken stark.",
    ],
    assumptions: ["Alle Antworten stammen aus derselben Befragung."],
    related: ["churn", "clv"],
    sources: [
      {
        label: "Bain / Net Promoter System: Measuring your NPS",
        url: "https://www.netpromotersystem.com/about/measuring-your-net-promoter-score/",
      },
    ],
  },
];

export const controllingTopics: Topic[] = [
  {
    id: "soll-ist",
    slug: "soll-ist-rechner",
    title: "Soll-Ist-Abweichung",
    category: "controlling",
    short:
      "Abweichung zwischen Plan und Wirklichkeit – absolut, relativ und mit Zielrichtung.",
    question: "Wie stark weicht mein Ist vom Plan ab?",
    intro:
      "Die Soll-Ist-Abweichung zeigt, um wie viel das tatsächliche Ergebnis vom Plan abweicht. Ob ein Plus gut ist, hängt davon ab, ob es um Erträge oder Kosten geht.",
    synonyms: [
      "soll ist vergleich",
      "planabweichung",
      "abweichungsanalyse",
      "budgetabweichung",
      "plan ist",
      "zielerreichung",
      "budget überschritten",
    ],
    image: {
      alt: "Soll 100 und Ist 110 als Balken; Abweichung +10 bzw. +10 %; Bewertung je nach Kosten- oder Ertragsziel.",
      caption:
        "Beispiel: Soll 100, Ist 110 → +10 bzw. +10 %. Bei Umsatz günstig, bei Kosten ungünstig.",
      description:
        "Zwei Balken: Soll 100 (gestrichelte Linie) und Ist 110. Der Überstand von 10 ist markiert. Darunter zwei kleine Felder: „Ertragsziel: günstig“ und „Kostenziel: ungünstig“.",
    },
    formula: [
      "Abweichung absolut = Ist − Soll",
      "Abweichung relativ = (Ist − Soll) / Soll × 100",
    ],
    variables: [
      ["Soll", "Plan- oder Budgetwert"],
      ["Ist", "tatsächlich erreichter Wert"],
    ],
    interpretation:
      "Die Zielrichtung entscheidet, ob eine positive Abweichung günstig ist.",
    misconceptions: [
      "Ein Plus bei Kosten ist eine Überschreitung, kein Erfolg.",
    ],
    assumptions: ["Soll und Ist in derselben Einheit und Periode."],
    related: ["veraenderung", "auslastung", "prozent"],
  },
  {
    id: "auslastung",
    slug: "auslastung-rechner",
    title: "Kapazitätsauslastung",
    category: "controlling",
    short:
      "Genutzte im Verhältnis zur verfügbaren Kapazität – auch über 100 %.",
    question: "Wie gut sind meine Maschinen oder Mitarbeitenden ausgelastet?",
    intro:
      "Die Auslastung zeigt, welcher Anteil der verfügbaren Kapazität tatsächlich genutzt wurde. 75 von 100 verfügbaren Stunden sind 75 %.",
    synonyms: [
      "auslastung",
      "kapazitätsauslastung",
      "beschäftigungsgrad",
      "nutzungsgrad",
      "maschinenauslastung",
      "personalauslastung",
      "überlastung",
    ],
    image: {
      alt: "75 genutzte von 100 verfügbaren Stunden: 75 % Auslastung.",
      caption: "Beispiel: 75 von 100 verfügbaren Stunden genutzt = 75 %.",
      description:
        "Ein Behälter mit Skala 0–100 Stunden ist bis 75 gefüllt (hervorgehoben). Der leere Rest von 25 Stunden ist als „frei“ beschriftet.",
    },
    formula: ["Auslastung = genutzte Kapazität / verfügbare Kapazität × 100"],
    variables: [
      ["genutzte Kapazität", "z. B. Stunden im Monat"],
      ["verfügbare Kapazität", "gleiche Einheit und Periode"],
    ],
    interpretation:
      "Über 100 % heißt Überbelegung: Es wurde mehr genutzt als angegeben verfügbar war.",
    misconceptions: [
      "Personen-, Maschinen- und Kalenderstunden nicht mischen.",
      "Eine Auslastung über 100 % wird nicht abgeschnitten.",
    ],
    assumptions: ["Gleiche Einheit und Periode."],
    related: ["stundensatz", "soll-ist"],
  },
  {
    id: "lager",
    slug: "lagerkennzahlen-rechner",
    title: "Lagerumschlag & Lagerdauer",
    category: "controlling",
    short:
      "Wie oft sich der Lagerbestand dreht und wie lange Ware im Schnitt liegt.",
    question: "Wie lange liegt meine Ware durchschnittlich im Lager?",
    intro:
      "Der Lagerumschlag zeigt, wie oft der durchschnittliche Bestand in einer Periode verbraucht wurde. Daraus ergibt sich die durchschnittliche Lagerdauer in Tagen.",
    synonyms: [
      "lagerumschlag",
      "lagerumschlagshäufigkeit",
      "lagerdauer",
      "lagerreichweite",
      "umschlagshäufigkeit",
      "durchschnittlicher lagerbestand",
      "inventory turnover",
      "wie lange liegt ware",
    ],
    image: {
      alt: "120.000 € Jahreswareneinsatz bei 20.000 € Durchschnittsbestand: 6 Umschläge, bei 360 Tagen 60 Tage Lagerdauer.",
      caption:
        "Beispiel: 120.000 € / 20.000 € = 6 Umschläge; 360 Tage / 6 = 60 Tage Lagerdauer.",
      description:
        "Ein Lagerregal-Symbol mit 20.000 € Bestand, daneben eine Jahresachse von 360 Tagen, unterteilt in 6 Abschnitte à 60 Tage; in jedem Abschnitt wird das Regal einmal geleert und neu gefüllt.",
    },
    formula: [
      "Lagerumschlag = Wareneinsatz / durchschnittlicher Lagerbestand",
      "Lagerdauer = Tage der Periode / Lagerumschlag",
    ],
    variables: [
      ["Wareneinsatz", "Verbrauch zu Einstandskosten in der Periode"],
      ["Ø Lagerbestand", "zu Einstandskosten"],
      ["Tage", "360 oder 365 oder andere Periodenlänge"],
    ],
    interpretation:
      "Mehr Umschläge bedeuten kürzere Lagerdauer und weniger gebundenes Kapital.",
    misconceptions: [
      "Nicht Umsatz durch Bestand zu Einstandspreisen teilen.",
      "Die Lagerdauer ist ein Durchschnitt, nicht das Alter jedes Artikels.",
    ],
    assumptions: [
      "Wareneinsatz und Bestand in derselben Bewertungsbasis.",
      "Tagesbasis sichtbar gewählt.",
    ],
    related: ["working-capital", "auslastung", "stueckkosten"],
  },
];
