import type { Topic } from "../types";

export const kostenTopics: Topic[] = [
  {
    id: "deckungsbeitrag",
    slug: "deckungsbeitragsrechner",
    title: "Deckungsbeitrag",
    abbr: "DB",
    category: "kosten",
    recommended: true,
    short:
      "Was bleibt pro Stück nach den variablen Kosten, um die Fixkosten zu decken?",
    question: "Was bleibt mir pro verkauftem Stück übrig?",
    intro:
      "Der Deckungsbeitrag ist der Verkaufspreis minus die variablen Kosten je Stück. Dieser Betrag steht zuerst zur Deckung der Fixkosten bereit – erst danach entsteht Gewinn.",
    synonyms: [
      "db",
      "stückdeckungsbeitrag",
      "deckungsbeitragsquote",
      "db-quote",
      "was bleibt pro stück",
      "was bleibt vom umsatz",
      "rohertrag pro stück",
      "contribution margin",
      "teilkostenrechnung",
      "klr",
    ],
    image: {
      alt: "50 € Erlös je Stück, aufgeteilt in 30 € variable Kosten und 20 € Deckungsbeitrag.",
      caption:
        "Beispiel: 50 € Preis − 30 € variable Kosten = 20 € Deckungsbeitrag je Stück.",
      description:
        "Ein Balken für 50 € Verkaufspreis ist in zwei maßstäbliche Abschnitte geteilt: 30 € variable Kosten (grau) und 20 € Deckungsbeitrag (farbig, schraffiert). Ein Pfeil vom Deckungsbeitrag zeigt auf „Fixkosten decken, dann Gewinn“.",
    },
    formula: [
      "Stückdeckungsbeitrag d = p − v",
      "Deckungsbeitragsquote = d / p × 100",
      "Gesamtdeckungsbeitrag = d × q",
    ],
    variables: [
      ["p", "Nettoverkaufspreis je Stück"],
      ["v", "variable Kosten je Stück"],
      ["q", "verkaufte Stückzahl"],
    ],
    interpretation:
      "Ein positiver Deckungsbeitrag hilft, die Fixkosten zu tragen; ein negativer vergrößert mit jedem Stück den Verlust.",
    misconceptions: [
      "Der Deckungsbeitrag ist nicht der Gewinn – die Fixkosten fehlen noch.",
      "Volle Selbstkosten gehören nicht in das Feld „variable Kosten“.",
    ],
    assumptions: [
      "Nettobeträge ohne Umsatzsteuer.",
      "Konstanter Preis und konstante variable Stückkosten.",
      "Ein Produkt bzw. eine gleichartige Leistung.",
    ],
    related: ["break-even", "gewinn", "marge", "clv"],
    seoTitle: "Deckungsbeitrag berechnen – Stückdeckungsbeitrag und DB-Quote",
    seoDescription:
      "Deckungsbeitrag berechnen: Stückdeckungsbeitrag, Deckungsbeitragsquote und Gesamtdeckungsbeitrag mit Rechenweg – und Übernahme in den Break-even-Rechner.",
  },
  {
    id: "break-even",
    slug: "break-even-rechner",
    title: "Break-even",
    fullTerm: "Gewinnschwelle",
    category: "kosten",
    recommended: true,
    short:
      "Ab welcher Stückzahl sind alle Kosten gedeckt? Mit Grafik, Tabelle und Szenariovergleich.",
    question: "Wie viel muss ich verkaufen, damit sich das Geschäft trägt?",
    intro:
      "Die Gewinnschwelle ist die Menge, bei der Umsatz und Gesamtkosten gleich groß sind. Darunter entsteht Verlust, darüber Gewinn.",
    synonyms: [
      "gewinnschwelle",
      "break even point",
      "bep",
      "kostendeckung",
      "nutzenschwelle",
      "ab wann lohnt sich",
      "mindestmenge",
      "mindestabsatz",
      "kostendeckungspunkt",
      "klr",
      "fixkosten decken",
    ],
    image: {
      alt: "Umsatzlinie und Gesamtkostenlinie schneiden sich bei 150 Stück; links davon Verlust, rechts Gewinn.",
      caption:
        "Beispiel: Bei 50 € Preis, 30 € variablen Kosten und 3.000 € Fixkosten liegt die Gewinnschwelle bei 150 Stück.",
      description:
        "Ein Diagramm mit Stückzahl auf der waagerechten Achse. Die Kostenlinie beginnt bei 3.000 € Fixkosten, die Umsatzlinie bei 0 €. Sie schneiden sich bei 150 Stück und 7.500 €. Der Bereich links ist mit „Verlust“, rechts mit „Gewinn“ beschriftet.",
    },
    formula: [
      "d = p − v",
      "Break-even-Menge = F / d",
      "Break-even-Umsatz = Break-even-Menge × p",
    ],
    variables: [
      ["p", "Nettoverkaufspreis je Stück"],
      ["v", "variable Kosten je Stück"],
      ["F", "Fixkosten im gewählten Zeitraum"],
      ["d", "Stückdeckungsbeitrag"],
    ],
    interpretation:
      "Bei genau der Break-even-Menge ist das Ergebnis 0 €; Gewinn entsteht erst darüber. Ganze Stückzahlen werden aufgerundet.",
    misconceptions: [
      "Kostendeckung ist noch kein Gewinn: Bei genau 150 Stück ist das Ergebnis 0 €.",
      "Fixkosten pro Monat gehören zu einer Monatsmenge – nicht zu einer Jahresmenge.",
    ],
    assumptions: [
      "Konstante Preise, variable Stückkosten und Fixkosten im Zeitraum.",
      "Nettobeträge ohne Umsatzsteuer.",
      "Eine gleichartige Leistung.",
    ],
    related: ["deckungsbeitrag", "gewinn", "stueckkosten", "marge"],
    seoTitle: "Break-even-Rechner: Gewinnschwelle berechnen mit Grafik",
    seoDescription:
      "Break-even berechnen: Gewinnschwelle in Stück und Euro, aufgerundete Mindeststückzahl, Grafik, Tabelle und Vergleich zweier Szenarien.",
  },
  {
    id: "gewinn",
    slug: "gewinnrechner",
    title: "Gewinn & Zielgewinn",
    category: "kosten",
    short:
      "Gewinn oder Verlust bei einer Stückzahl – oder die Menge für einen Wunschgewinn.",
    question: "Wie viel muss ich verkaufen, um 1.000 € Gewinn zu machen?",
    intro:
      "Der Gewinn ist der Umsatz minus variable und fixe Kosten. Umgekehrt lässt sich berechnen, wie viele Stück für einen gewünschten Gewinn nötig sind.",
    synonyms: [
      "gewinn berechnen",
      "verlust",
      "zielgewinn",
      "wunschgewinn",
      "ergebnis",
      "betriebsergebnis",
      "gewinn bei stückzahl",
      "was bleibt vom umsatz",
      "menge für gewinn",
      "klr",
    ],
    image: {
      alt: "10.000 € Erlös minus 6.000 € variable und 3.000 € fixe Kosten ergeben 1.000 € Gewinn.",
      caption:
        "Beispiel: 200 Stück × 50 € = 10.000 € Erlös − 6.000 € variable − 3.000 € fixe Kosten = 1.000 € Gewinn.",
      description:
        "Ein Erlösbalken von 10.000 € steht neben einem gleich hohen Stapel aus 6.000 € variablen Kosten, 3.000 € Fixkosten und 1.000 € Gewinn (hervorgehoben). Die Abschnitte sind maßstäblich.",
    },
    formula: [
      "Ergebnis = (p − v) × q − F",
      "Benötigte Menge = (F + Zielgewinn) / (p − v)",
    ],
    variables: [
      ["p", "Nettoverkaufspreis je Stück"],
      ["v", "variable Kosten je Stück"],
      ["F", "Fixkosten im Zeitraum"],
      ["q", "Stückzahl"],
      ["Zielgewinn", "gewünschtes Ergebnis"],
    ],
    interpretation:
      "Ein negatives Ergebnis ist ein Verlust. Bei der Zielmenge wird auf ganze Stück aufgerundet.",
    misconceptions: [
      "Ein kalkulatorischer Modellgewinn ist nicht automatisch das EBIT im Jahresabschluss.",
      "Zielgewinn 0 € bedeutet Kostendeckung, nicht positiven Gewinn.",
    ],
    assumptions: [
      "Konstante Preise und Kosten im Zeitraum.",
      "Nettobeträge, keine Umsatzsteuer.",
      "Ganze Stückzahlen.",
    ],
    related: ["break-even", "deckungsbeitrag", "ebit", "stueckkosten"],
    seoTitle: "Gewinnrechner: Gewinn und Menge für Zielgewinn berechnen",
    seoDescription:
      "Gewinn bei gegebener Stückzahl berechnen oder die nötige Absatzmenge für einen Zielgewinn ermitteln – mit Szenariovergleich A/B und Rechenweg.",
  },
  {
    id: "marge",
    slug: "margenrechner",
    title: "Marge & Aufschlag",
    category: "kosten",
    recommended: true,
    short:
      "Handelsspanne und Aufschlag aus Kosten und Verkaufspreis – und warum sie sich unterscheiden.",
    question: "Wie viel Prozent verdiene ich am Verkaufspreis?",
    intro:
      "Marge und Aufschlag beschreiben dieselbe Differenz zwischen Kosten und Preis, aber mit unterschiedlicher Bezugsgröße. Die Marge bezieht sich auf den Verkaufspreis, der Aufschlag auf die Kosten.",
    synonyms: [
      "handelsspanne",
      "rohmarge",
      "bruttomarge",
      "kalkulationsaufschlag",
      "aufschlag",
      "gewinnspanne",
      "spanne",
      "markup",
      "was bleibt vom umsatz",
      "rohertrag",
    ],
    image: {
      alt: "80 € Kosten plus 20 € Differenz ergeben 100 € Preis; 20 € sind 20 % von 100 € und 25 % von 80 €.",
      caption:
        "Beispiel: 20 € Differenz sind 20 % Marge (von 100 €) und 25 % Aufschlag (auf 80 €).",
      description:
        "Ein Balken von 100 € besteht aus 80 € Kosten und 20 € Differenz. Eine Klammer über dem ganzen Balken zeigt die Bezugsgröße 100 € für die Marge, eine Klammer unter dem Kostenteil die Bezugsgröße 80 € für den Aufschlag.",
    },
    formula: [
      "Differenz = Verkaufspreis − Kostenbasis",
      "Marge = Differenz / Verkaufspreis × 100",
      "Aufschlag = Differenz / Kostenbasis × 100",
    ],
    variables: [
      ["Kostenbasis", "z. B. Einstandspreis netto"],
      ["Verkaufspreis", "Nettoverkaufspreis"],
    ],
    interpretation:
      "Bei positivem Verkaufspreis und positiven Kosten liegt die Marge unter 100 %. Nur bei Kostenbasis 0 € und positivem Verkaufspreis beträgt sie genau 100 %; ein Aufschlag auf Kosten von 0 € ist dann nicht definiert. Ein Aufschlag kann dagegen über 100 % liegen.",
    misconceptions: [
      "20 % Aufschlag ergeben keine 20 % Marge.",
      "Die Rohmarge berücksichtigt Miete, Personal und andere Betriebskosten noch nicht.",
    ],
    assumptions: [
      "Nettobeträge ohne Umsatzsteuer.",
      "Die Kostenbasis ist klar definiert (z. B. Einstandspreis).",
    ],
    related: ["zielpreis", "deckungsbeitrag", "rabatt", "umsatzrendite"],
    seoTitle: "Margenrechner: Marge und Aufschlag berechnen",
    seoDescription:
      "Marge und Aufschlag berechnen und unterscheiden: Handelsspanne in Prozent vom Verkaufspreis und Aufschlag auf die Kosten, mit Rechenweg.",
  },
  {
    id: "zielpreis",
    slug: "verkaufspreis-berechnen",
    title: "Verkaufspreis aus Zielmarge",
    category: "kosten",
    short:
      "Welcher Preis ist nötig, damit eine gewünschte Marge übrig bleibt? Auf Cent genau.",
    question: "Welchen Preis brauche ich für 20 % Marge?",
    intro:
      "Wer eine bestimmte Marge erreichen will, teilt die Kosten durch den Anteil, der für die Kosten übrig bleibt. Bei 20 % Marge sind die Kosten 80 % des Preises.",
    synonyms: [
      "verkaufspreis berechnen",
      "preis kalkulieren",
      "zielmarge",
      "preis aus marge",
      "welchen preis",
      "vk berechnen",
      "preisfindung",
      "kalkulation verkaufspreis",
    ],
    image: {
      alt: "80 € Kosten machen 80 % eines Verkaufspreises von 100 € aus; 20 % sind Marge.",
      caption:
        "Beispiel: 80 € Kosten sind 80 % des Preises – also 100 € Verkaufspreis bei 20 % Marge.",
      description:
        "Ein Balken mit Skala 0 bis 100 % ist in 80 % (80 € Kosten) und 20 % (Marge) geteilt. Darunter die Rechnung 80 € / 0,8 = 100 €.",
    },
    formula: ["Verkaufspreis = Kostenbasis / (1 − Zielmarge / 100)"],
    variables: [
      ["Kostenbasis", "Kosten je Stück (größer als 0)"],
      [
        "Zielmarge",
        "gewünschte Rohmarge in % vom Verkaufspreis (0 bis unter 100)",
      ],
    ],
    interpretation:
      "Der Preis wird auf volle Cent aufgerundet, damit die Zielmarge sicher erreicht wird.",
    misconceptions: [
      "Die Zielmarge nicht auf die Kosten aufschlagen: 80 € + 20 % = 96 € ergeben nur 16,67 % Marge.",
    ],
    assumptions: [
      "Nettobeträge ohne Umsatzsteuer.",
      "Rohmarge vor weiteren Betriebskosten.",
    ],
    related: ["marge", "deckungsbeitrag", "zuschlag", "stundensatz"],
    seoTitle: "Verkaufspreis berechnen aus Zielmarge – auf Cent genau",
    seoDescription:
      "Verkaufspreis aus Kosten und gewünschter Marge berechnen, auf Cent aufgerundet, mit tatsächlich erreichter Marge und typischem Fehler beim Aufschlag.",
  },
  {
    id: "stueckkosten",
    slug: "stueckkosten-rechner",
    title: "Gesamt- & Stückkosten",
    category: "kosten",
    short:
      "Gesamtkosten und Kosten je Stück aus Fixkosten, variablen Kosten und Menge.",
    question: "Was kostet mich ein Stück im Durchschnitt?",
    intro:
      "Die Gesamtkosten setzen sich aus Fixkosten und variablen Kosten zusammen. Teilt man sie durch die Menge, erhält man die Stückkosten – je mehr Stück, desto kleiner der Fixkostenanteil.",
    synonyms: [
      "stückkosten",
      "gesamtkosten",
      "durchschnittskosten",
      "kosten pro stück",
      "fixkostendegression",
      "divisionskalkulation",
      "einheitskosten",
      "klr",
    ],
    image: {
      alt: "Ein Fixkostenblock von 1.000 € wird auf 100 Stück verteilt; zusammen mit 10 € variablen Kosten kostet jedes Stück 20 €.",
      caption:
        "Beispiel: 1.000 € Fixkosten auf 100 Stück = 10 € je Stück, plus 10 € variable Kosten = 20 € Stückkosten.",
      description:
        "Ein großer Block „Fixkosten 1.000 €“ wird über Pfeile auf eine Reihe von Stücken verteilt. Jedes Stück zeigt zwei Teile: 10 € Fixkostenanteil und 10 € variable Kosten.",
    },
    formula: ["Gesamtkosten K = F + v × q", "Stückkosten = K / q"],
    variables: [
      ["F", "Fixkosten im Zeitraum"],
      ["v", "variable Kosten je Stück"],
      ["q", "produzierte Menge im selben Zeitraum"],
    ],
    interpretation:
      "Stückkosten sinken mit steigender Menge, weil sich die Fixkosten auf mehr Stück verteilen.",
    misconceptions: [
      "Produzierte und verkaufte Menge sind nicht automatisch gleich.",
      "Stückkosten sind keine variablen Kosten – sie enthalten den Fixkostenanteil.",
    ],
    assumptions: [
      "Eine gleichartige Leistung (einstufige Divisionskalkulation).",
      "Fixkosten und Menge im selben Zeitraum.",
    ],
    related: ["break-even", "zuschlag", "deckungsbeitrag", "stundensatz"],
    seoTitle: "Stückkosten berechnen – Gesamtkosten und Kosten je Stück",
    seoDescription:
      "Gesamtkosten und Stückkosten aus Fixkosten, variablen Kosten und Menge berechnen, mit Fixkostenanteil je Stück und Hinweisen zur Divisionskalkulation.",
  },
  {
    id: "zuschlag",
    slug: "zuschlagskalkulation",
    title: "Zuschlagskalkulation",
    category: "kosten",
    short:
      "Von Material- und Fertigungseinzelkosten über Gemeinkostenzuschläge zu den Selbstkosten.",
    question: "Was kostet ein Auftrag einschließlich Gemeinkosten?",
    intro:
      "In der Zuschlagskalkulation werden Gemeinkosten mit Prozentsätzen auf Einzelkosten verteilt. Schritt für Schritt entstehen so Herstellkosten und Selbstkosten einer Leistung.",
    synonyms: [
      "zuschlagskalkulation",
      "gemeinkostenzuschlag",
      "zuschlagssatz",
      "selbstkosten",
      "herstellkosten",
      "mgk",
      "fgk",
      "vwgk",
      "vtgk",
      "mek",
      "fek",
      "kalkulationsschema",
      "bab",
      "klr",
      "vollkostenrechnung",
    ],
    image: {
      alt: "Kostenbausteine stapeln sich: 110 € Material, 60 € Fertigung = 170 € Herstellkosten, plus 8,50 € Verwaltung und 17 € Vertrieb = 195,50 € Selbstkosten.",
      caption:
        "Beispiel: 170 € Herstellkosten + 5 % Verwaltung + 10 % Vertrieb = 195,50 € Selbstkosten.",
      description:
        "Ein gestufter Stapel: MEK 100 € + MGK 10 € = Materialkosten 110 €; FEK 50 € + FGK 10 € = Fertigungskosten 60 €; zusammen Herstellkosten 170 €; darauf VwGK 8,50 € und VtGK 17 € = Selbstkosten 195,50 €.",
    },
    formula: [
      "Materialkosten = MEK + MEK × MGK-Satz",
      "Fertigungskosten = FEK + FEK × FGK-Satz + Sondereinzelkosten Fertigung",
      "Herstellkosten = Materialkosten + Fertigungskosten",
      "Selbstkosten = Herstellkosten × (1 + VwGK-Satz + VtGK-Satz) + Sondereinzelkosten Vertrieb",
    ],
    variables: [
      ["MEK", "Materialeinzelkosten"],
      ["MGK", "Materialgemeinkosten (Zuschlag auf MEK)"],
      ["FEK", "Fertigungseinzelkosten (Fertigungslöhne)"],
      ["FGK", "Fertigungsgemeinkosten (Zuschlag auf FEK)"],
      ["VwGK", "Verwaltungsgemeinkosten (Zuschlag auf Herstellkosten)"],
      ["VtGK", "Vertriebsgemeinkosten (Zuschlag auf Herstellkosten)"],
    ],
    interpretation:
      "Die Selbstkosten enthalten alle zugerechneten Kosten, aber noch keinen Gewinn.",
    misconceptions: [
      "Selbstkosten sind keine variablen Stückkosten und gehören nicht in den Break-even-Rechner.",
      "Zuschlagssätze passen nur zu der Bezugsbasis, aus der sie ermittelt wurden.",
    ],
    assumptions: [
      "Vereinfachtes Schema ohne Sondereinzelkosten-Varianten oder Bestandsveränderungen.",
      "Zuschlagssätze stammen aus der eigenen Kostenstellenrechnung.",
    ],
    related: ["stueckkosten", "zielpreis", "stundensatz", "deckungsbeitrag"],
    seoTitle: "Zuschlagskalkulation online: Herstellkosten und Selbstkosten",
    seoDescription:
      "Zuschlagskalkulation berechnen: Material- und Fertigungsgemeinkosten, Herstellkosten, Verwaltungs- und Vertriebszuschlag bis zu den Selbstkosten – oder Zuschlagssatz ermitteln.",
  },
  {
    id: "stundensatz",
    slug: "stundenkostensatz-rechner",
    title: "Stundenkostensatz",
    category: "kosten",
    short:
      "Was eine abrechenbare Stunde mindestens einbringen muss, um die Kosten zu decken.",
    question: "Was kostet mich eine Arbeitsstunde wirklich?",
    intro:
      "Der Stundenkostensatz verteilt die Kosten einer Periode auf die Stunden, die du tatsächlich abrechnen kannst. Er ist die Untergrenze – Gewinn kommt erst noch hinzu.",
    synonyms: [
      "stundensatz",
      "stundenlohn kalkulieren",
      "kosten pro stunde",
      "maschinenstundensatz",
      "verrechnungssatz",
      "stundenverrechnungssatz",
      "freelancer stundensatz",
      "handwerker stundensatz",
    ],
    image: {
      alt: "1.200 € Kosten eines Monats werden auf 60 abrechenbare Stunden verteilt: 20 € je Stunde.",
      caption:
        "Beispiel: 1.200 € Periodenkosten / 60 abrechenbare Stunden = 20 € je Stunde.",
      description:
        "Ein Kostenblock „1.200 € im Monat“ wird auf eine Reihe von 60 Stundenfeldern verteilt; jedes Feld trägt 20 €. Daneben eine kleinere Reihe nicht abrechenbarer Stunden (Urlaub, Verwaltung), die keinen Anteil tragen.",
    },
    formula: ["Kosten je Stunde = Periodenkosten / abrechenbare Stunden"],
    variables: [
      ["Periodenkosten", "alle zugeordneten Kosten der Periode"],
      ["abrechenbare Stunden", "produktiv nutzbare Stunden derselben Periode"],
    ],
    interpretation:
      "Jede abrechenbare Stunde muss mindestens diesen Betrag einbringen, damit die Kosten gedeckt sind.",
    misconceptions: [
      "Arbeitszeit ist nicht gleich abrechenbare Zeit – Urlaub, Krankheit und Verwaltung zählen nicht.",
      "Der Kostensatz ist noch kein Verkaufspreis.",
    ],
    assumptions: ["Kosten und Stunden beziehen sich auf dieselbe Periode."],
    related: ["zuschlag", "stueckkosten", "zielpreis", "auslastung"],
    seoTitle: "Stundenkostensatz berechnen – Kosten je abrechenbarer Stunde",
    seoDescription:
      "Stundenkostensatz berechnen: Periodenkosten auf abrechenbare Stunden verteilen, mit Hinweisen zu Urlaub, Leerlauf und dem Unterschied zum Verkaufspreis.",
  },
];
