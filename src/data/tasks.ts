/**
 * Aufgabeneinstiege: Nutzer starten mit ihrer Frage, nicht mit einem Kennzahlnamen.
 * Jede Aufgabe hat eine eigene Zielseite (/aufgaben/<slug>/) mit konkreten nächsten Schritten.
 * Ein Schritt verweist auf einen vorhandenen Rechner (optional mit Modus und Beispiel) oder auf den geführten Ablauf.
 */
export interface TaskStep {
  title: string;
  text: string;
  /** Rechner-ID aus dem Register. */
  calc?: string;
  /** Rechenmodus (Variante) des Rechners. */
  variant?: string;
  /** Link auf eine andere Seite statt auf einen Rechner. */
  href?: string;
  linkLabel?: string;
}

export interface Task {
  slug: string;
  title: string;
  /** Eine Zeile für die Kachel. */
  short: string;
  /** Nutzenversprechen auf der Zielseite. */
  promise: string;
  /** Optional: kürzere Meta-Description (sonst wird `promise` verwendet). */
  metaDescription?: string;
  /** Typische Fragen, die diese Aufgabe beantwortet. */
  questions: string[];
  steps: TaskStep[];
  /** Grenzen der Aussage – ehrlich und konkret. */
  limits: string[];
  icon: "calc" | "chart" | "percent" | "compass" | "list";
  /** Hauptziel der Kachel. */
  primary: { label: string; href: string };
}

export const TASKS: Task[] = [
  {
    slug: "verkaufspreis-bestimmen",
    title: "Verkaufspreis bestimmen",
    short: "Preis kalkulieren, Mindestpreis kennen, Rabatt abwägen",
    promise:
      "Vom Kostenbild zu einem Preis, den du begründen kannst: Du siehst, was ein Stück an Beitrag leistet, wie ein Rabatt wirkt und ab wann sich der Preis rechnet.",
    questions: ["Welchen Preis brauche ich für meine Zielmarge?", "Welchen Rabatt kann ich mir leisten?", "Deckt mein Preis meine Kosten?"],
    steps: [
      { title: "Kosten je Einheit klären", text: "Wie hoch sind die Kosten, die mit jeder Einheit entstehen – und was kostet eine Leistungsstunde?", calc: "stueckkosten" },
      { title: "Preis aus einer Zielmarge ableiten", text: "Aus Kosten und gewünschter Marge ergibt sich ein Mindestpreis auf den Cent genau.", calc: "zielpreis" },
      { title: "Prüfen, was ein Stück beiträgt", text: "Der Deckungsbeitrag zeigt, ob der Preis die variablen Kosten deckt und wie viel für die Fixkosten bleibt.", calc: "deckungsbeitrag" },
      { title: "Rabatt abwägen", text: "Wie viel mehr müsstest du verkaufen, damit ein Rabatt denselben gesamten Deckungsbeitrag bringt?", calc: "rabatt-absatz" },
      { title: "Alles zusammen betrachten", text: "Im geführten Ablauf siehst du Preis, Mindestabsatz und Gewinn gemeinsam – mit deinen Varianten.", href: "/ablauf/preis-wirtschaftlichkeit/", linkLabel: "Geführten Ablauf starten" },
    ],
    limits: [
      "Ein Preis aus einer Zielmarge sagt nichts darüber, ob Kunden ihn zahlen.",
      "Marge bezieht sich auf den Verkaufspreis, Aufschlag auf die Kosten – nicht verwechseln.",
    ],
    icon: "percent",
    primary: { label: "Zielpreis berechnen", href: "/ablauf/preis-wirtschaftlichkeit/" },
  },
  {
    slug: "wirtschaftlichkeit-pruefen",
    title: "Wirtschaftlichkeit prüfen",
    short: "Wie viel muss ich verkaufen? Lohnt sich das?",
    promise:
      "Finde heraus, ab welcher Menge sich dein Angebot trägt, was bei deiner geplanten Menge übrig bleibt und wie sensibel das Ergebnis auf Preis und Kosten reagiert.",
    questions: ["Wie viel muss ich verkaufen, um die Kosten zu decken?", "Was bleibt bei meiner geplanten Menge übrig?", "Wann fließt eine Investition zurück?"],
    steps: [
      { title: "Beitrag je Stück bestimmen", text: "Preis minus variable Kosten: der Betrag, mit dem jedes Stück die Fixkosten deckt.", calc: "deckungsbeitrag" },
      { title: "Mindestabsatz ermitteln", text: "Die Mindeststückzahl zur Kostendeckung – und ab wann tatsächlich Gewinn entsteht.", calc: "break-even" },
      { title: "Gewinn bei geplanter Menge beurteilen", text: "Gewinn oder Verlust für deine Planmenge – oder die Menge für einen Zielgewinn.", calc: "gewinn" },
      { title: "Varianten vergleichen", text: "Vorsichtig, realistisch, optimistisch: Vergleiche eigene Annahmen nebeneinander.", href: "/ablauf/preis-wirtschaftlichkeit/", linkLabel: "Im geführten Ablauf vergleichen" },
      { title: "Rückfluss einer Investition grob einschätzen", text: "Kapitalrendite und Amortisationsdauer geben eine erste Orientierung zu einer Anschaffung.", calc: "amortisation" },
    ],
    limits: [
      "Die Investitionsrechner nutzen konstante, vereinfachte Zahlungsüberschüsse; Zinsen, Steuern und Risiken sind nicht enthalten.",
      "Der Break-even gilt nur bei konstanten Preisen und Kosten im gewählten Zeitraum.",
    ],
    icon: "chart",
    primary: { label: "Zum geführten Ablauf", href: "/ablauf/preis-wirtschaftlichkeit/" },
  },
  {
    slug: "werbung-bewerten",
    title: "Werbung bewerten",
    short: "Lohnt sich die Kampagne? Welcher ROAS reicht?",
    promise:
      "Vom Werbeumsatz zur Frage, ob nach den Kosten noch etwas übrig bleibt: Du siehst ROAS, Beitrag nach Werbekosten und den Mindest-ROAS für deine Deckungsbeitragsquote.",
    questions: ["Wie viel Umsatz bringt mir ein Euro Werbung?", "Ab welchem ROAS rechnet sich meine Werbung?", "Was darf ein Neukunde kosten?"],
    steps: [
      { title: "ROAS berechnen", text: "Zugeordneter Werbeumsatz im Verhältnis zu den Werbekosten.", calc: "roas" },
      { title: "Werbewirtschaftlichkeit prüfen", text: "Mit deiner Deckungsbeitragsquote siehst du den Beitrag nach Werbekosten und den Mindest-ROAS.", calc: "roas", variant: "wirtschaftlichkeit" },
      { title: "Kosten je Ergebnis einordnen", text: "Kosten je Conversion bzw. je Neukunde – Leads, Bestellungen und Neukunden sind verschiedene Größen.", calc: "cpa" },
      { title: "Neukundenkosten gegen Kundenwert halten", text: "Der Kundenwert (CLV) zeigt, wie viel ein Kunde über die Beziehung beiträgt – eine Schätzung mit Annahmen.", calc: "clv" },
    ],
    limits: [
      "ROAS ist Umsatz, kein Gewinn; weitere Fixkosten sind mit einem positiven Beitrag nach Werbung nicht automatisch gedeckt.",
      "Welcher Umsatz der Werbung zugeordnet wird (Attribution), bestimmt das Ergebnis – Messzeiträume müssen übereinstimmen.",
    ],
    icon: "chart",
    primary: { label: "Werbewirtschaftlichkeit prüfen", href: "/roas-rechner/#wirtschaftlichkeit" },
  },
  {
    slug: "liquiditaet-verstehen",
    title: "Liquidität verstehen",
    short: "Kann ich meine Rechnungen zahlen? Wo bleibt das Geld?",
    promise:
      "Unterscheide Gewinn und Zahlungsfähigkeit: Du lernst, was Liquiditätsgrade, Cashflow und Working Capital über deine Zahlungsfähigkeit sagen – und was nicht.",
    questions: ["Reicht mein Geld für die kurzfristigen Verbindlichkeiten?", "Warum habe ich Gewinn, aber wenig Geld auf dem Konto?", "Wie viel Geld ist im Betrieb gebunden?"],
    steps: [
      { title: "Kurzfristige Zahlungsfähigkeit prüfen", text: "Liquidität 1., 2. und 3. Grades im Vergleich zu den kurzfristigen Verbindlichkeiten.", calc: "liquiditaet" },
      { title: "Zahlungsströme verstehen", text: "Der Cashflow zeigt Ein- und Auszahlungen, nicht den Gewinn.", calc: "cashflow" },
      { title: "Gebundenes Kapital sehen", text: "Working Capital: Wie viel Umlaufvermögen ist nicht durch kurzfristige Schulden gedeckt?", calc: "working-capital" },
      { title: "Lager und Auslastung einbeziehen", text: "Lagerdauer und Auslastung erklären oft, warum Geld gebunden ist.", calc: "lager" },
      { title: "Begriffe sauber trennen", text: "Marge, Deckungsbeitrag, Gewinn und Cashflow beantworten verschiedene Fragen.", href: "/lernen/welche-kennzahl/", linkLabel: "Zur Auswahlhilfe" },
    ],
    limits: [
      "Es gibt keine allgemeingültigen „guten“ Liquiditätswerte; sie hängen von Branche und Zahlungsbedingungen ab.",
      "Die Rechner ersetzen keinen Liquiditätsplan über mehrere Monate.",
    ],
    icon: "compass",
    primary: { label: "Liquiditätsgrade berechnen", href: "/liquiditaetsrechner/" },
  },
  {
    slug: "kennzahlen-lernen",
    title: "Kennzahlen lernen",
    short: "Begriff, Beispiel, eigene Rechnung – in dieser Reihenfolge",
    metaDescription:
      "Kennzahlen Schritt für Schritt lernen: erst der Begriff, dann ein durchgerechnetes Beispiel, dann die eigene Berechnung – mit klaren Grenzen der Aussage.",
    promise:
      "Lerne Kennzahlen in sinnvoller Reihenfolge: erst der Begriff, dann ein durchgerechnetes Beispiel, dann deine eigene Berechnung – mit klaren Grenzen, damit du Ergebnisse richtig deutest.",
    questions: ["Was ist der Unterschied zwischen Marge und Deckungsbeitrag?", "Welche Kennzahl beantwortet meine Frage?", "Wie gehe ich mit unsicheren Annahmen um?"],
    steps: [
      { title: "Die passende Kennzahl finden", text: "Marge, Deckungsbeitrag, Gewinn und Cashflow im Vergleich: Zweck, Frage, benötigte Werte, Grenzen.", href: "/lernen/welche-kennzahl/", linkLabel: "Auswahlhilfe öffnen" },
      { title: "Ein durchgerechnetes Beispiel ansehen", text: "Drei vollständige, ausdrücklich fiktive Praxisfälle für Handel, Dienstleistung und Produktion.", href: "/praxisfaelle/", linkLabel: "Praxisfälle ansehen" },
      { title: "Mit Unsicherheit umgehen", text: "Beobachtete Daten und Schätzungen unterscheiden und Varianten bilden.", href: "/lernen/unsicherheit/", linkLabel: "Zum Lernartikel" },
      { title: "Selbst rechnen", text: "Starte mit dem Deckungsbeitrag – die Beispielwerte zeigen, wie das Ergebnis aussieht.", calc: "deckungsbeitrag" },
      { title: "Alle Rechner durchsuchen", text: "Suche nach einem Begriff, einer Abkürzung oder einer Alltagsfrage.", href: "/rechner/", linkLabel: "Alle Rechner" },
    ],
    limits: ["Die Lerninhalte sind bewusst vereinfacht und ersetzen keine Fachberatung."],
    icon: "list",
    primary: { label: "Welche Kennzahl passt?", href: "/lernen/welche-kennzahl/" },
  },
];

export const TASK_BY_SLUG: Record<string, Task> = Object.fromEntries(TASKS.map((t) => [t.slug, t]));
export const taskUrl = (t: Task) => `/aufgaben/${t.slug}/`;
