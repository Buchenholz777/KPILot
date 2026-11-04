import type { Topic } from "../types";

export const prozentTopics: Topic[] = [
  {
    id: "prozent",
    slug: "prozentrechner",
    title: "Prozentrechner",
    category: "prozent",
    recommended: true,
    short:
      "Berechne Prozentwert, Prozentsatz oder Grundwert – je nachdem, welche zwei Angaben du kennst.",
    question: "Wie viel sind 20 % von 250 €?",
    intro:
      "Prozent heißt „von Hundert“: 20 % sind 20 von 100 gleich großen Teilen eines Ganzen. Kennst du zwei der drei Größen Grundwert, Prozentsatz und Prozentwert, lässt sich die dritte berechnen.",
    synonyms: [
      "prozent berechnen",
      "prozentwert",
      "prozentsatz",
      "grundwert",
      "anteil",
      "wie viel prozent",
      "prozent von",
      "quote",
      "anteil berechnen",
      "hundertstel",
    ],
    image: {
      alt: "Ein Feld aus 100 Kästchen, 20 davon sind hervorgehoben.",
      caption:
        "Beispiel: 20 von 100 Teilen sind 20 %. Auf 250 € übertragen sind das 50 €.",
      description:
        "Ein Quadrat ist in 10 mal 10 gleich große Kästchen geteilt. 20 Kästchen sind farbig und schraffiert markiert, 80 sind leer. Daneben steht: 20 % von 250 € = 50 €.",
    },
    formula: [
      "Prozentwert W = Grundwert G × Prozentsatz p / 100",
      "Prozentsatz p = W / G × 100",
      "Grundwert G = W × 100 / p",
    ],
    variables: [
      ["G", "Grundwert – das Ganze, entspricht 100 %"],
      ["p", "Prozentsatz – der Anteil in Prozent"],
      ["W", "Prozentwert – der Teil in derselben Einheit wie G"],
    ],
    interpretation:
      "Das Ergebnis hat immer dieselbe Einheit wie der Grundwert: Prozent von Euro sind Euro, Prozent von Stück sind Stück.",
    misconceptions: [
      "Prozentsätze über 100 % sind nicht automatisch falsch – sie zeigen, dass der Teil größer ist als die Bezugsgröße.",
      "Der Grundwert muss zur Frage passen: 20 % Rabatt beziehen sich auf den alten Preis, nicht auf den neuen.",
    ],
    assumptions: [
      "Alle Werte beziehen sich auf dieselbe Einheit.",
      "Ein Grundwert von 0 lässt keinen Prozentsatz zu.",
    ],
    related: ["veraenderung", "rabatt", "prozentpunkte", "dreisatz"],
    seoTitle:
      "Prozentrechner: Prozentwert, Prozentsatz und Grundwert berechnen",
    seoDescription:
      "Prozent berechnen mit Erklärung: Prozentwert, Prozentsatz oder Grundwert ermitteln, mit Rechenweg, Beispiel und Hinweisen zu Werten über 100 %.",
  },
  {
    id: "veraenderung",
    slug: "prozentuale-veraenderung",
    title: "Prozentuale Veränderung",
    category: "prozent",
    recommended: true,
    short:
      "Um wie viel Prozent ist ein Wert gestiegen oder gefallen? Absolut und relativ.",
    question: "Um wie viel Prozent ist der Umsatz von 80 auf 100 gestiegen?",
    intro:
      "Die prozentuale Veränderung setzt den Unterschied zwischen neuem und altem Wert ins Verhältnis zum alten Wert. Von 80 auf 100 sind es +20 absolut und +25 % relativ.",
    synonyms: [
      "wachstum",
      "steigerung",
      "rückgang",
      "veränderung in prozent",
      "zuwachs",
      "abnahme",
      "prozentuale abweichung",
      "um wie viel prozent gestiegen",
      "wachstumsrate",
      "differenz in prozent",
      "vorjahresvergleich",
    ],
    image: {
      alt: "Zwei Balken im gleichen Maßstab: 80 und 100, die Differenz von 20 ist markiert.",
      caption:
        "Beispiel: Von 80 auf 100 sind +20 absolut, das entspricht +25 % bezogen auf 80.",
      description:
        "Links ein Balken der Höhe 80 (vorher), rechts ein Balken der Höhe 100 (nachher). Der obere Teil des rechten Balkens über der Höhe 80 ist schraffiert und mit +20 beschriftet. Darunter: +20 / 80 = +25 %.",
    },
    formula: [
      "Differenz = neuer Wert − alter Wert",
      "Veränderung in % = Differenz / alter Wert × 100",
    ],
    variables: [
      ["alter Wert", "Ausgangswert, auf den sich die Prozentangabe bezieht"],
      ["neuer Wert", "Vergleichswert nach der Veränderung"],
    ],
    interpretation:
      "Positive Werte bedeuten Anstieg, negative Rückgang. Bezugsgröße ist immer der alte Wert.",
    misconceptions: [
      "+25 % und danach −25 % führen nicht zum Ausgangswert zurück: 80 → 100 → 75.",
      "Bei einem negativen Ausgangswert lässt sich die Prozentzahl nicht wie eine normale Wachstumsrate lesen.",
    ],
    assumptions: [
      "Beide Werte haben dieselbe Einheit und Abgrenzung.",
      "Bei einem Ausgangswert von 0 ist nur die absolute Veränderung bestimmbar.",
    ],
    related: ["prozentpunkte", "cagr", "soll-ist", "prozent"],
    seoTitle: "Prozentuale Veränderung berechnen – Steigerung und Rückgang",
    seoDescription:
      "Prozentuale Veränderung berechnen: absolute und relative Veränderung zwischen zwei Werten, mit Rechenweg und Hinweisen zu Ausgangswert 0 und negativen Werten.",
  },
  {
    id: "rabatt",
    slug: "rabattrechner",
    title: "Rabatt & Erhöhung",
    category: "prozent",
    recommended: true,
    short:
      "Preis nach Rabatt oder Erhöhung, ursprünglichen Preis zurückrechnen, zwei Änderungen kombinieren.",
    question: "Was kostet es nach 20 % Rabatt – und was vorher?",
    intro:
      "Ein Rabatt verringert den Preis um einen Anteil des Ausgangspreises, eine Erhöhung vergrößert ihn. Mehrere Änderungen nacheinander werden multipliziert, nicht addiert.",
    synonyms: [
      "rabatt berechnen",
      "preisnachlass",
      "skonto",
      "reduziert",
      "sale",
      "preiserhöhung",
      "aufschlag prozent",
      "ursprünglicher preis",
      "preis vor rabatt",
      "doppelter rabatt",
      "zwei rabatte",
      "endpreis",
    ],
    image: {
      alt: "Preisschild 100 €, davon wird ein Abschnitt von 20 € abgetrennt, übrig bleiben 80 €.",
      caption:
        "Beispiel: 20 % Rabatt auf 100 € – 20 € werden abgezogen, 80 € bleiben.",
      description:
        "Ein Preisschild-Balken über 100 € ist in zwei Teile geteilt: 80 € (bleibt) und 20 € (schraffiert, abgetrennt, „−20 % Rabatt“). Ein Pfeil führt zum neuen Preis 80 €.",
    },
    formula: [
      "Endpreis nach Rabatt = Ausgangspreis × (1 − Rabatt / 100)",
      "Endpreis nach Erhöhung = Ausgangspreis × (1 + Erhöhung / 100)",
      "Ausgangspreis = Endpreis / Faktor",
      "Zwei Änderungen: Gesamtfaktor = Faktor 1 × Faktor 2",
    ],
    variables: [
      ["Rabatt", "Nachlass in % vom Ausgangspreis (0 bis 100 %)"],
      ["Erhöhung", "Zuschlag in % vom Ausgangspreis (auch über 100 %)"],
      ["Faktor", "z. B. 0,8 bei 20 % Rabatt oder 1,1 bei 10 % Erhöhung"],
    ],
    interpretation:
      "Der Endpreis ist der zu zahlende Betrag; die Ersparnis ist der Rabatt in Euro.",
    misconceptions: [
      "20 % und dann 10 % Rabatt sind zusammen 28 %, nicht 30 %.",
      "Wer vom reduzierten Preis zurückrechnet, darf nicht einfach 20 % aufschlagen: 80 € + 20 % = 96 €, nicht 100 €.",
    ],
    assumptions: [
      "Rabatte liegen zwischen 0 und 100 %.",
      "Bei 100 % Rabatt lässt sich der ursprüngliche Preis nicht zurückrechnen.",
    ],
    related: ["prozent", "marge", "zielpreis", "veraenderung"],
    seoTitle:
      "Rabattrechner: Preis nach Rabatt und ursprünglichen Preis berechnen",
    seoDescription:
      "Rabatt berechnen: Endpreis nach Rabatt oder Erhöhung, Rückrechnung des ursprünglichen Preises und zwei aufeinanderfolgende Rabatte richtig kombinieren.",
  },
  {
    id: "prozentpunkte",
    slug: "prozentpunkte-rechner",
    title: "Prozentpunkte",
    category: "prozent",
    short:
      "Unterschied zwischen zwei Prozentwerten in Prozentpunkten und relativ in Prozent.",
    question: "Ist von 5 % auf 6 % ein Plus von 1 % oder 20 %?",
    intro:
      "Prozentpunkte beschreiben den Abstand zwischen zwei Prozentwerten: von 5 % auf 6 % ist +1 Prozentpunkt. Relativ zum alten Wert sind das +20 %.",
    synonyms: [
      "prozentpunkt",
      "pp",
      "basispunkte",
      "zinsänderung",
      "quote gestiegen",
      "unterschied zwischen prozent",
      "prozent oder prozentpunkte",
      "marktanteil veränderung",
      "zinssatz gestiegen",
    ],
    image: {
      alt: "Zwei Quoten nebeneinander: 5 % und 6 %; getrennt beschriftet: +1 Prozentpunkt und +20 % relativ.",
      caption: "Beispiel: 5 % → 6 % sind +1 Prozentpunkt, relativ +20 %.",
      description:
        "Zwei Skalen von 0 bis 10 % mit Markierung bei 5 % und bei 6 %. Eine Klammer zwischen beiden zeigt „+1 Prozentpunkt (Abstand)“. Darunter getrennt: „1 / 5 = +20 % relativ“.",
    },
    formula: [
      "Prozentpunkte = neuer Prozentwert − alter Prozentwert",
      "Relative Veränderung = Prozentpunkte / alter Prozentwert × 100",
    ],
    variables: [
      ["alter Prozentwert", "z. B. Zinssatz, Quote oder Anteil vorher"],
      ["neuer Prozentwert", "derselbe Wert nachher"],
    ],
    interpretation:
      "Prozentpunkte sind ein Abstand auf der Prozentskala; „Prozent“ beschreibt die relative Veränderung.",
    misconceptions: [
      "„Die Zinsen steigen um 1 %“ ist meist falsch formuliert, wenn 1 Prozentpunkt gemeint ist.",
      "Eine Verdopplung von 1 % auf 2 % sind nur +1 Prozentpunkt, aber +100 %.",
    ],
    assumptions: [
      "Beide Prozentwerte beziehen sich auf dieselbe Größe.",
      "Bei einem alten Wert von 0 % ist keine relative Veränderung bestimmbar.",
    ],
    related: ["veraenderung", "prozent", "conversion"],
    seoTitle:
      "Prozentpunkte berechnen – Unterschied zu Prozent einfach erklärt",
    seoDescription:
      "Prozentpunkte berechnen und von Prozent unterscheiden: Differenz zweier Prozentwerte und relative Veränderung mit Beispiel 5 % → 6 %.",
  },
  {
    id: "dreisatz",
    slug: "dreisatz-rechner",
    title: "Dreisatz",
    category: "prozent",
    short:
      "Vom Bekannten über eine Einheit zum Gesuchten – direkt oder umgekehrt proportional.",
    question: "3 Artikel kosten 12 € – was kosten 5?",
    intro:
      "Beim Dreisatz rechnest du erst auf eine Einheit und dann auf die gesuchte Menge. Du wählst, ob beide Größen gemeinsam wachsen (direkt) oder sich gegenläufig verhalten (umgekehrt).",
    synonyms: [
      "verhältnisrechnung",
      "proportional",
      "antiproportional",
      "umgekehrter dreisatz",
      "hochrechnen",
      "was kosten 5",
      "wie lange brauchen",
      "regel de tri",
    ],
    image: {
      alt: "Drei gleiche Artikel kosten 12 €; fünf Artikel kosten 20 €; dazwischen der Schritt über 1 Artikel = 4 €.",
      caption:
        "Beispiel: 3 Artikel = 12 € → 1 Artikel = 4 € → 5 Artikel = 20 €.",
      description:
        "Drei Schritte nebeneinander: drei Pakete mit „12 €“, ein Paket mit „4 €“, fünf Pakete mit „20 €“. Pfeile beschriftet mit „÷ 3“ und „× 5“.",
    },
    formula: [
      "direkt proportional: x = b × c / a",
      "umgekehrt proportional: x = a × b / c",
    ],
    variables: [
      ["a", "bekannte Menge"],
      ["b", "zugehöriger Wert bei a"],
      ["c", "gesuchte Menge"],
      ["x", "gesuchter Wert bei c"],
    ],
    interpretation:
      "Das Ergebnis hat die Einheit von b (z. B. Euro oder Stunden).",
    misconceptions: [
      "Nicht jeder Zusammenhang ist proportional: Mengenrabatte oder Fixkosten brechen die Rechnung.",
      "Doppelt so viele Personen schaffen eine Aufgabe nur im idealisierten Modell in der halben Zeit.",
    ],
    assumptions: [
      "a und c sind größer als 0.",
      "Der gewählte Zusammenhang (direkt oder umgekehrt) gilt im ganzen Bereich.",
    ],
    related: ["prozent", "durchschnitt", "stueckkosten"],
    seoTitle: "Dreisatz-Rechner: direkt und umgekehrt proportional berechnen",
    seoDescription:
      "Dreisatz online berechnen: direkt und umgekehrt proportional, mit Rechenweg über eine Einheit und Beispielen zu Preis und Arbeitszeit.",
  },
  {
    id: "durchschnitt",
    slug: "gewichteter-durchschnitt",
    title: "Gewichteter Durchschnitt",
    category: "prozent",
    short: "Durchschnitt, bei dem größere Gruppen oder Mengen stärker zählen.",
    question: "Wie hoch ist der Durchschnittspreis über alle verkauften Stück?",
    intro:
      "Beim gewichteten Durchschnitt zählt jeder Wert so stark, wie sein Gewicht groß ist – etwa die Menge oder Anzahl. So beeinflusst eine große Gruppe das Ergebnis mehr als eine kleine.",
    synonyms: [
      "gewichtetes mittel",
      "durchschnitt berechnen",
      "mittelwert",
      "durchschnittspreis",
      "notendurchschnitt",
      "gewichtung",
      "mischpreis",
      "durchschnittsnote",
    ],
    image: {
      alt: "Eine kleine Gruppe mit Wert 10 und eine dreimal so große Gruppe mit Wert 20 ergeben den Durchschnitt 17,5.",
      caption:
        "Beispiel: Wert 10 mit Gewicht 1 und Wert 20 mit Gewicht 3 ergeben 17,5 – nicht 15.",
      description:
        "Links ein Block „10“ mit Gewicht 1, rechts drei Blöcke „20“ mit Gewicht 3. Eine Waage-Skala von 10 bis 20 zeigt den Schwerpunkt bei 17,5; der einfache Mittelwert 15 ist gestrichelt markiert.",
    },
    formula: ["Durchschnitt = Summe(Wert × Gewicht) / Summe(Gewichte)"],
    variables: [
      ["Wert x", "z. B. Preis, Note, Quote einer Gruppe"],
      ["Gewicht w", "z. B. Menge, Anzahl, Anteil (nicht negativ)"],
    ],
    interpretation:
      "Das Ergebnis liegt immer zwischen dem kleinsten und dem größten Wert.",
    misconceptions: [
      "Quoten unterschiedlich großer Gruppen dürfen nicht einfach gemittelt werden.",
      "Gewichte müssen zur Frage passen – bei Durchschnittspreisen die Menge, nicht der Umsatz.",
    ],
    assumptions: [
      "Gewichte sind nicht negativ, mindestens eines ist größer als 0.",
    ],
    related: ["dreisatz", "prozent", "cagr"],
    seoTitle: "Gewichteter Durchschnitt – Rechner mit beliebig vielen Werten",
    seoDescription:
      "Gewichteten Durchschnitt berechnen: Werte und Gewichte eintragen, Rechenweg sehen und verstehen, warum der einfache Mittelwert irreführen kann.",
  },
  {
    id: "cagr",
    slug: "cagr-rechner",
    title: "Durchschnittliches Wachstum",
    abbr: "CAGR",
    fullTerm: "Compound Annual Growth Rate",
    category: "prozent",
    short:
      "Gleichmäßige jährliche Wachstumsrate zwischen Anfangs- und Endwert.",
    question:
      "Um wie viel Prozent pro Jahr ist der Umsatz im Schnitt gewachsen?",
    intro:
      "Die CAGR ist die gleichbleibende Wachstumsrate pro Jahr, die vom Anfangs- zum Endwert führt. Von 100 auf 121 in zwei Jahren sind es 10 % pro Jahr, nicht 10,5 %.",
    synonyms: [
      "cagr",
      "compound annual growth rate",
      "jährliche wachstumsrate",
      "durchschnittliches wachstum",
      "wachstum pro jahr",
      "zinseszins wachstum",
      "annualisiertes wachstum",
      "jahresrate",
    ],
    image: {
      alt: "Zeitachse: 100 → 110 → 121 über zwei Jahre, je +10 %.",
      caption:
        "Beispiel: 100 → 121 in zwei Jahren entspricht einem gleichmäßigen Modellpfad von +10 % pro Jahr.",
      description:
        "Drei Balken auf einer Zeitachse: Jahr 0 = 100, Jahr 1 = 110, Jahr 2 = 121. Zwischen den Balken jeweils „+10 %“. Hinweis: gleichmäßiger Modellpfad, tatsächliche Jahre können abweichen.",
    },
    formula: ["CAGR = ((Endwert / Anfangswert)^(1 / Jahre) − 1) × 100"],
    variables: [
      ["Anfangswert", "Wert zu Beginn (größer als 0)"],
      ["Endwert", "Wert am Ende (nicht negativ)"],
      ["Jahre", "Abstand in Jahren, auch gebrochen"],
    ],
    interpretation:
      "Die CAGR glättet: Sie sagt nicht, wie die einzelnen Jahre verlaufen sind.",
    misconceptions: [
      "Die Gesamtveränderung geteilt durch die Jahre ergibt nicht die CAGR (21 % / 2 = 10,5 % statt 10 %).",
      "Negative Anfangs- oder Endwerte passen nicht in dieses Modell.",
    ],
    assumptions: [
      "Anfangswert größer als 0, Endwert mindestens 0.",
      "Gleichmäßiges, zusammengesetztes Wachstum als Modell.",
    ],
    related: ["veraenderung", "roi", "durchschnitt"],
    seoTitle: "CAGR-Rechner: durchschnittliches jährliches Wachstum berechnen",
    seoDescription:
      "CAGR berechnen: gleichmäßige jährliche Wachstumsrate zwischen Anfangs- und Endwert, mit Rechenweg und Erklärung des geglätteten Modells.",
  },
];
