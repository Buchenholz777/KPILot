import type { Category, CategoryId } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "prozent",
    slug: "prozent-grundlagen",
    title: "Prozent & Grundlagen",
    short: "Anteile, Veränderungen, Rabatte und Durchschnitte",
    intro:
      "Hier geht es um das Handwerkszeug: Anteile berechnen, Veränderungen richtig ausdrücken, Rabatte zurückrechnen und Durchschnitte fair bilden. Fast jede andere Kennzahl baut darauf auf.",
    confusions: [
      {
        a: "Prozent",
        b: "Prozentpunkte",
        text: "Steigt eine Quote von 5 % auf 6 %, sind das +1 Prozentpunkt, aber +20 % relativ.",
      },
      {
        a: "Zwei Rabatte",
        b: "Summe der Rabatte",
        text: "20 % und danach 10 % Rabatt ergeben 28 %, nicht 30 % – der zweite Rabatt wirkt auf den schon reduzierten Preis.",
      },
      {
        a: "Einfacher Mittelwert",
        b: "Gewichteter Durchschnitt",
        text: "Unterschiedlich große Gruppen dürfen nicht gleich stark zählen.",
      },
    ],
  },
  {
    id: "kosten",
    slug: "kostenrechnung-preise",
    title: "Kostenrechnung & Preise",
    short: "Deckungsbeitrag, Gewinnschwelle, Marge, Kalkulation",
    intro:
      "Diese Rechner helfen bei Preis- und Mengenentscheidungen: Was bleibt pro Stück, ab wann lohnt sich das Geschäft, welcher Preis ist nötig und was kostet eine Stunde oder ein Auftrag wirklich?",
    confusions: [
      {
        a: "Marge",
        b: "Aufschlag",
        text: "Die Marge bezieht sich auf den Verkaufspreis, der Aufschlag auf die Kosten: 80 € → 100 € sind 20 % Marge, aber 25 % Aufschlag.",
      },
      {
        a: "Deckungsbeitrag",
        b: "Gewinn",
        text: "Der Deckungsbeitrag muss erst die Fixkosten decken; erst danach entsteht Gewinn.",
      },
      {
        a: "Variable Stückkosten",
        b: "Selbstkosten",
        text: "Selbstkosten enthalten zusätzlich Gemeinkosten und gehören nicht in den Break-even-Rechner.",
      },
    ],
  },
  {
    id: "finanzen",
    slug: "finanzen-liquiditaet",
    title: "Finanzen & Liquidität",
    short: "EBIT, Cashflow, Liquidität, Rendite",
    intro:
      "Ergebnis, Geldfluss und Vermögen sind drei verschiedene Blickwinkel. Diese Rechner trennen sie sauber: Was wurde verdient, was ist tatsächlich geflossen und kann das Unternehmen seine Verpflichtungen bezahlen?",
    confusions: [
      {
        a: "EBIT / EBITDA",
        b: "Cashflow",
        text: "EBIT und EBITDA sind Ergebnisgrößen, keine Kontobewegungen. Der Cashflow zählt tatsächliche Zahlungen.",
      },
      {
        a: "Working Capital",
        b: "Bankguthaben",
        text: "Working Capital enthält auch Vorräte und Forderungen – es ist kein frei verfügbares Geld.",
      },
      {
        a: "ROI",
        b: "ROAS",
        text: "Der ROI setzt Gewinn ins Verhältnis zum Kapital, der ROAS Umsatz zu Werbekosten.",
      },
    ],
  },
  {
    id: "marketing",
    slug: "marketing-vertrieb",
    title: "Marketing & Vertrieb",
    short: "Conversion, Klicks, Werbekosten, Neukunden",
    intro:
      "Werbe- und Vertriebskennzahlen setzen Kosten und Ergebnisse einer Kampagne ins Verhältnis. Wichtig ist, dass Zähler und Nenner denselben Zeitraum und dieselbe Messung betreffen.",
    confusions: [
      {
        a: "CPA",
        b: "CAC",
        text: "Eine Conversion kann ein Lead sein; der CAC zählt nur echte Neukunden und meist auch Vertriebskosten.",
      },
      {
        a: "ROAS",
        b: "Gewinn",
        text: "Ein ROAS von 4 bedeutet 4 € Umsatz je Werbe-Euro – nicht 4 € Gewinn.",
      },
      {
        a: "CTR",
        b: "Conversion Rate",
        text: "Die CTR misst Klicks auf Einblendungen, die Conversion Rate erreichte Ziele.",
      },
    ],
  },
  {
    id: "produkt",
    slug: "produkt-kunden",
    title: "Produkt & Kunden",
    short: "Umsatz je Kunde, Kundenwert, Abos, Zufriedenheit",
    intro:
      "Für Abo- und Kundengeschäfte zählt, was ein Kunde über die Zeit bringt, wie viele bleiben und wie zufrieden sie sind. Diese Rechner zeigen die Modelle dahinter offen.",
    confusions: [
      {
        a: "ARR",
        b: "Jahresumsatz",
        text: "ARR ist die hochgerechnete wiederkehrende Run-Rate, kein verbuchter Umsatz.",
      },
      {
        a: "Churn",
        b: "Netto-Kundenwachstum",
        text: "Neukunden gleichen Abgänge im Bestand aus, verbessern aber nicht die Churn-Rate der Anfangskunden.",
      },
      {
        a: "NPS",
        b: "Zufriedenheitsquote",
        text: "Ein NPS von +30 ist ein Score zwischen −100 und +100, keine 30-%-Quote.",
      },
    ],
  },
  {
    id: "controlling",
    slug: "controlling-planung",
    title: "Controlling & Planung",
    short: "Planabweichung, Auslastung, Lager",
    intro:
      "Controlling vergleicht Plan und Wirklichkeit und macht Engpässe sichtbar: Wo weichen wir ab, wie voll sind unsere Kapazitäten und wie lange liegt Ware im Lager?",
    confusions: [
      {
        a: "Positive Abweichung",
        b: "Gute Abweichung",
        text: "Bei Kosten ist ein Plus eine Überschreitung – die Zielrichtung entscheidet.",
      },
      {
        a: "Lagerumschlag",
        b: "Lagerdauer",
        text: "Viele Umschläge bedeuten kurze Lagerdauer; beide beschreiben dasselbe aus zwei Richtungen.",
      },
    ],
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
