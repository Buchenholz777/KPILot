import type { Topic } from "../types";

export const marketingTopics: Topic[] = [
  {
    id: "conversion",
    slug: "conversion-rate-rechner",
    title: "Conversion Rate",
    abbr: "CR",
    fullTerm: "Konversionsrate",
    category: "marketing",
    recommended: true,
    short:
      "Anteil der Besuche oder Interaktionen, die zu einem definierten Ziel führen.",
    question: "Wie viele meiner Besucher kaufen tatsächlich?",
    intro:
      "Die Conversion Rate zeigt, wie viele Besuche ein Ziel erreichen – etwa einen Kauf oder eine Anfrage. 25 von 1.000 Besuchen sind 2,5 %.",
    synonyms: [
      "conversion rate",
      "konversionsrate",
      "cr",
      "umwandlungsrate",
      "kaufrate",
      "abschlussquote",
      "wie viele kaufen",
      "besucher zu kunden",
      "shop conversion",
    ],
    image: {
      alt: "1.000 Besuche führen zu 25 Besuchen mit Conversion: 2,5 %.",
      caption:
        "Beispiel (besuchsbasiertes Modell): 25 von 1.000 Besuchen mit Conversion = 2,5 %.",
      description:
        "Ein Trichter: oben 1.000 Besuche als Punktewolke, unten 25 hervorgehobene Punkte „Besuche mit Conversion“. Beschriftung: besuchsbasiert, 25 / 1.000 = 2,5 %.",
    },
    formula: [
      "besuchsbasiert: Besuche mit Conversion / Besuche × 100",
      "ereignisbasiert: Conversion-Ereignisse / Interaktionen × 100",
    ],
    variables: [
      ["Besuche", "Sitzungen im Zeitraum"],
      ["Conversion", "definiertes Ziel, z. B. Kauf oder Anfrage"],
      ["Interaktionen", "z. B. Anzeigenklicks"],
    ],
    interpretation:
      "Die Rate hängt stark davon ab, was als Conversion und was als Besuch zählt.",
    misconceptions: [
      "Besuche, Besucher und Interaktionen nicht vermischen.",
      "Ereignisbasiert sind Werte über 100 % möglich.",
    ],
    assumptions: [
      "Zähler und Nenner aus demselben Zeitraum und derselben Messung.",
    ],
    related: ["ctr", "cpa", "cac", "roas"],
    seoTitle: "Conversion Rate berechnen – besuchs- oder ereignisbasiert",
    seoDescription:
      "Conversion Rate berechnen: besuchsbasierte oder ereignisbasierte Messweise, mit Beispiel 25 / 1.000 und Hinweisen zu Werten über 100 %.",
  },
  {
    id: "ctr",
    slug: "ctr-rechner",
    title: "Klickrate",
    abbr: "CTR",
    fullTerm: "Click-Through-Rate",
    category: "marketing",
    short: "Anteil der Einblendungen, die angeklickt wurden.",
    question: "Wie oft wird meine Anzeige angeklickt?",
    intro:
      "Die Klickrate setzt Klicks ins Verhältnis zu Einblendungen. 200 Klicks bei 10.000 Einblendungen sind 2 %.",
    synonyms: [
      "ctr",
      "klickrate",
      "click through rate",
      "durchklickrate",
      "anzeige angeklickt",
      "impressionen klicks",
    ],
    image: {
      alt: "10.000 Einblendungen führen zu 200 Klicks: 2 %.",
      caption: "Beispiel: 200 Klicks auf 10.000 Einblendungen = 2 % CTR.",
      description:
        "Ein Raster mit 50 Anzeigen-Symbolen (je 200 Einblendungen), eines davon hervorgehoben mit Mauszeiger „200 Klicks“. Beschriftung 200 / 10.000 = 2 %.",
    },
    formula: ["CTR = Klicks / Impressionen × 100"],
    variables: [
      ["Klicks", "Anzahl der Klicks"],
      ["Impressionen", "Anzahl der Einblendungen"],
    ],
    interpretation:
      "Die CTR zeigt, wie anziehend eine Anzeige ist – nicht, ob danach gekauft wird.",
    misconceptions: [
      "Eine hohe CTR ist kein Umsatz.",
      "Werte über 100 % deuten auf Mehrfachklicks oder abweichende Messung hin.",
    ],
    assumptions: ["Gleiche Kampagne und gleicher Zeitraum für beide Zahlen."],
    related: ["cpc", "cpm", "conversion"],
    seoTitle: "CTR berechnen – Klickrate von Anzeigen",
    seoDescription:
      "Klickrate (CTR) berechnen: Klicks im Verhältnis zu Impressionen, mit Beispiel und Hinweisen zur Messung.",
  },
  {
    id: "cpc",
    slug: "cpc-rechner",
    title: "Kosten je Klick",
    abbr: "CPC",
    fullTerm: "Cost per Click",
    category: "marketing",
    short: "Durchschnittliche Werbekosten für einen Klick.",
    question: "Was kostet mich ein Klick auf meine Anzeige?",
    intro:
      "Der CPC verteilt die Werbekosten auf die Klicks. 100 € für 200 Klicks sind 0,50 € je Klick.",
    synonyms: [
      "cpc",
      "cost per click",
      "kosten pro klick",
      "klickpreis",
      "google ads kosten",
      "preis je klick",
    ],
    image: {
      alt: "100 € Werbekosten werden auf 200 Klicks verteilt: 0,50 € je Klick.",
      caption: "Beispiel: 100 € / 200 Klicks = 0,50 € je Klick.",
      description:
        "Ein Geldstapel 100 € wird über Pfeile auf viele Klick-Symbole verteilt; ein Klick ist vergrößert mit „0,50 €“.",
    },
    formula: ["CPC = Werbekosten / Klicks"],
    variables: [
      ["Werbekosten", "Kosten der Kampagne im Zeitraum"],
      ["Klicks", "Anzahl der Klicks im Zeitraum"],
    ],
    interpretation:
      "Ein niedriger CPC ist nur gut, wenn die Klicks auch zu Zielen führen.",
    misconceptions: ["Bei 0 Klicks gibt es keinen CPC – auch nicht 0 €."],
    assumptions: ["Kosten und Klicks aus demselben Zeitraum."],
    related: ["cpm", "ctr", "cpa"],
    seoTitle: "CPC berechnen – Kosten je Klick",
    seoDescription:
      "Durchschnittlichen CPC berechnen: Werbekosten geteilt durch Klicks, mit Beispiel 100 € / 200 Klicks.",
  },
  {
    id: "cpm",
    slug: "cpm-rechner",
    title: "Tausenderkontaktpreis",
    abbr: "CPM",
    fullTerm: "Cost per Mille / TKP",
    category: "marketing",
    short: "Werbekosten für 1.000 Einblendungen.",
    question: "Was kosten 1.000 Einblendungen meiner Anzeige?",
    intro:
      "Der CPM zeigt, was 1.000 Einblendungen kosten. 100 € für 50.000 Einblendungen sind 2 € CPM.",
    synonyms: [
      "cpm",
      "tkp",
      "tausenderkontaktpreis",
      "cost per mille",
      "kosten pro tausend",
      "reichweite kosten",
      "impressionen kosten",
    ],
    image: {
      alt: "100 € werden auf 50 Gruppen mit je 1.000 Einblendungen verteilt: 2 € je Gruppe.",
      caption: "Beispiel: 100 € / 50.000 Einblendungen × 1.000 = 2 € CPM.",
      description:
        "50 kleine Kästchen, jedes steht für 1.000 Einblendungen. Ein Kästchen ist hervorgehoben und mit „2 €“ beschriftet. Oben: 100 € gesamt.",
    },
    formula: ["CPM = Werbekosten / Impressionen × 1.000"],
    variables: [
      ["Werbekosten", "Kosten im Zeitraum"],
      ["Impressionen", "Einblendungen im Zeitraum"],
    ],
    interpretation: "Der CPM vergleicht Reichweitenkosten zwischen Kanälen.",
    misconceptions: ["Eine Einblendung ist kein Kontakt mit Aufmerksamkeit."],
    assumptions: ["Kosten und Impressionen aus demselben Zeitraum."],
    related: ["cpc", "ctr"],
    seoTitle: "CPM / TKP berechnen – Tausenderkontaktpreis",
    seoDescription:
      "Tausenderkontaktpreis (CPM, TKP) berechnen: Werbekosten je 1.000 Impressionen, mit Beispiel und Erklärung.",
  },
  {
    id: "cpa",
    slug: "cpa-rechner",
    title: "Kosten je Conversion",
    abbr: "CPA",
    fullTerm: "Cost per Action / Acquisition",
    category: "marketing",
    short:
      "Werbekosten für eine erreichte Conversion, z. B. einen Kauf oder Lead.",
    question: "Was kostet mich eine Anfrage oder ein Verkauf über Werbung?",
    intro:
      "Der CPA verteilt die Werbekosten auf die erreichten Conversions. 500 € für 20 Conversions sind 25 € je Conversion.",
    synonyms: [
      "cpa",
      "cost per action",
      "cost per acquisition",
      "kosten pro conversion",
      "kosten pro lead",
      "cpl",
      "kosten pro verkauf",
    ],
    image: {
      alt: "500 € Werbekosten werden auf 20 Conversions verteilt: 25 € je Conversion.",
      caption: "Beispiel: 500 € / 20 Conversions = 25 € je Conversion.",
      description:
        "Ein Geldblock 500 € teilt sich in 20 gleich große Abschnitte, jeder mit einem Häkchen-Symbol „Conversion“ und 25 €.",
    },
    formula: ["CPA = Werbekosten / Conversions"],
    variables: [
      ["Werbekosten", "zugeordnete Kosten im Zeitraum"],
      ["Conversions", "definierte Zielereignisse im Zeitraum"],
    ],
    interpretation:
      "Der CPA ist nur so aussagekräftig wie die Definition der Conversion.",
    misconceptions: ["Eine Conversion ist nicht automatisch ein Neukunde."],
    assumptions: ["Attribution und Zeitraum transparent und gleich."],
    related: ["cac", "conversion", "cpc", "roas"],
    seoTitle: "CPA berechnen – Kosten je Conversion",
    seoDescription:
      "CPA berechnen: Werbekosten je Conversion, mit Beispiel und Abgrenzung zum CAC (Kosten je Neukunde).",
  },
  {
    id: "roas",
    slug: "roas-rechner",
    title: "ROAS",
    fullTerm: "Return on Advertising Spend",
    category: "marketing",
    recommended: true,
    short:
      "Zugeordneter Umsatz je Werbe-Euro – als Faktor und in Prozent. Kein Gewinn.",
    question: "Wie viel Umsatz bringt mir ein Euro Werbung?",
    intro:
      "Der ROAS teilt den der Werbung zugeordneten Umsatz durch die Werbekosten. 2.000 € Umsatz bei 500 € Kosten ergeben einen ROAS von 4.",
    synonyms: [
      "roas",
      "return on ad spend",
      "werbeerfolg",
      "umsatz pro werbeeuro",
      "werberendite",
      "lohnt sich werbung",
      "anzeigenrendite",
    ],
    image: {
      alt: "500 € Werbekosten führen zu 2.000 € zugeordnetem Umsatz: Faktor 4. Umsatz ist als Umsatz beschriftet, nicht als Gewinn.",
      caption:
        "Beispiel: 2.000 € zugeordneter Umsatz / 500 € Werbekosten = 4,0-facher ROAS. Das ist Umsatz, nicht Gewinn.",
      description:
        "Links ein Block „Werbekosten 500 €“, rechts vier gleich große Blöcke à 500 € mit der Beschriftung „zugeordneter Umsatz 2.000 €“. Ein Hinweis: „Umsatz – davon gehen noch Kosten ab“.",
    },
    formula: [
      "ROAS (Faktor) = Werbeumsatz / Werbekosten",
      "ROAS (%) = Faktor × 100",
    ],
    variables: [
      ["Werbeumsatz", "Umsatz, den die Messung der Werbung zuordnet"],
      ["Werbekosten", "Kosten der Werbung im selben Zeitraum"],
    ],
    interpretation:
      "Ein ROAS von 4 bedeutet 4 € Umsatz je Werbe-Euro – ob das profitabel ist, hängt von Marge und Kosten ab.",
    misconceptions: [
      "ROAS ist keine Gewinnkennzahl.",
      "Attribution entscheidet, welcher Umsatz der Werbung zugerechnet wird.",
    ],
    assumptions: [
      "Umsatz und Kosten aus demselben Zeitraum und derselben Attribution.",
    ],
    related: ["roi", "cpa", "conversion", "marge"],
    seoTitle: "ROAS-Rechner: Return on Ad Spend berechnen",
    seoDescription:
      "ROAS berechnen als Faktor und in Prozent: zugeordneter Werbeumsatz durch Werbekosten – mit Bild und klarem Hinweis, dass ROAS kein Gewinn ist.",
  },
  {
    id: "cac",
    slug: "cac-rechner",
    title: "Neukundenkosten",
    abbr: "CAC",
    fullTerm: "Customer Acquisition Cost",
    category: "marketing",
    short: "Marketing- und Vertriebskosten je gewonnenem Neukunden.",
    question: "Wie teuer darf ein Kunde sein – was kostet mich ein neuer?",
    intro:
      "Der CAC verteilt die Marketing- und Vertriebskosten auf die neu gewonnenen Kunden. 3.000 € Kosten für 30 Neukunden sind 100 € je Kunde.",
    synonyms: [
      "cac",
      "customer acquisition cost",
      "kundenakquisitionskosten",
      "neukundenkosten",
      "kosten pro neukunde",
      "wie teuer darf ein kunde sein",
      "akquisekosten",
    ],
    image: {
      alt: "2.000 € Marketing plus 1.000 € Vertrieb, verteilt auf 30 Neukunden: 100 € je Neukunde.",
      caption:
        "Beispiel: (2.000 € + 1.000 €) / 30 Neukunden = 100 € je Neukunde.",
      description:
        "Zwei Kostenblöcke (Marketing 2.000 €, Vertrieb 1.000 €) fließen zusammen und verteilen sich auf 30 kleine Personen-Symbole, jedes mit 100 €.",
    },
    formula: ["CAC = (Marketingkosten + Vertriebskosten) / Neukunden"],
    variables: [
      ["Marketingkosten", "zugeordnete Kosten im Zeitraum"],
      ["Vertriebskosten", "zugeordnete Kosten im Zeitraum"],
      ["Neukunden", "echte neu gewonnene Kunden"],
    ],
    interpretation:
      "Ob ein CAC tragbar ist, zeigt der Vergleich mit dem Kundenwert (CLV).",
    misconceptions: [
      "Leads oder Conversions sind keine Neukunden.",
      "Kosten und Kundengewinnung können zeitlich auseinanderliegen.",
    ],
    assumptions: ["Klare Kostenabgrenzung für den Zeitraum."],
    related: ["clv", "cpa", "conversion"],
    seoTitle: "CAC berechnen – Kosten je Neukunde",
    seoDescription:
      "Customer Acquisition Cost (CAC) berechnen: Marketing- und Vertriebskosten je Neukunde, mit Übernahme in den CLV-Rechner.",
  },
];
