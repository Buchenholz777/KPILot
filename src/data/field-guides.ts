/**
 * Eingabehilfen direkt am Feld: Was ist gemeint? Was zählt dazu? Einheit/Zeitraum? Netto oder brutto?
 * Woher kommt der Wert typischerweise? Welche Verwechslung ist häufig?
 *
 * Bewusst allgemein formuliert: Es gibt keine feste Zuordnung zu Konten, Berichten oder Buchhaltungssystemen,
 * weil sie je nach Kontenrahmen und Software verschieden ist.
 * Schlüssel: „<rechnerId>.<feldKey>“; „*.<feldKey>“ gilt nur im Preis-/Kostenmodell (break-even, gewinn, deckungsbeitrag).
 */
export interface FieldGuide {
  /** Was ist mit dem Wert gemeint? */
  means: string;
  /** Welche Positionen zählen dazu (und welche nicht)? */
  includes?: string;
  /** Einheit und Zeitraum. */
  unitPeriod?: string;
  /** Netto oder brutto? */
  net?: string;
  /** Woher kann der Wert typischerweise kommen? */
  source?: string;
  /** Häufige Verwechslung. */
  mistake?: string;
}

const NET = "Netto, also ohne Umsatzsteuer.";

export const FIELD_GUIDES: Record<string, FieldGuide> = {
  "*.p": {
    means: "Der Preis, zu dem du eine Einheit tatsächlich verkaufst.",
    includes: "Rabatte und Nachlässe, die du regelmäßig gibst, gehören schon in den Preis; Versandkosten nur, wenn du sie extra berechnest und hier mitrechnen willst.",
    unitPeriod: "Euro je Stück bzw. je Leistungseinheit.",
    net: NET,
    source: "Preisliste, Angebot oder Rechnung. Bei mehreren Preisen den durchschnittlichen Nettoerlös je Einheit nehmen.",
    mistake: "Bruttopreise aus dem Onlineshop (inkl. Umsatzsteuer) einsetzen.",
  },
  "*.v": {
    means: "Kosten, die mit jeder zusätzlich verkauften Einheit entstehen und bei null Verkäufen wegfallen.",
    includes: "Typisch: Wareneinsatz, Material, Verpackung, Versand, Provisionen, Zahlungsgebühren, Fertigungsstunden bei Stücklohn. Nicht dazu: Miete, Gehälter, Abos, Abschreibungen – das sind Fixkosten.",
    unitPeriod: "Euro je Stück bzw. je Leistungseinheit.",
    net: NET,
    source: "Einkaufs- oder Materialrechnungen, Stücklisten, Gebührenübersichten. Gesamtkosten dieser Art geteilt durch die Menge.",
    mistake: "Fixkosten anteilig mitzurechnen – sie werden separat als Fixkosten im Zeitraum erfasst, sonst zählen sie doppelt.",
  },
  "*.F": {
    means: "Kosten, die im Betrachtungszeitraum unabhängig von der verkauften Menge anfallen.",
    includes: "Typisch: Miete, Gehälter, Versicherungen, Software-Abos, Leasing, Abschreibungen. Nicht dazu: Material und anderes, das mit der Menge steigt.",
    unitPeriod: "Euro für den gewählten Betrachtungszeitraum (Monat, Quartal, Jahr).",
    net: NET,
    source: "Kostenübersicht oder Auswertung deiner Buchhaltung für genau diesen Zeitraum. Bei Jahreskosten für einen Monat: ausdrücklich durch 12 teilen und die Annahme gleichmäßiger Verteilung bedenken.",
    mistake: "Monatsmenge mit Jahresfixkosten kombinieren (oder umgekehrt).",
  },
  "*.q": {
    means: "Die Menge, die du im Zeitraum verkaufst oder verkaufen willst.",
    unitPeriod: "Stück bzw. Leistungseinheiten im selben Zeitraum wie die Fixkosten.",
    source: "Eigene Absatzstatistik oder – wenn du plant – eine begründete Schätzung. Kennzeichne Schätzungen als Annahme.",
    mistake: "Bestellte mit tatsächlich verkaufter (bezahlter, nicht retournierter) Menge verwechseln.",
  },
  "break-even.zeitraum": {
    means: "Der Zeitraum, auf den sich Fixkosten und die berechnete Menge beziehen.",
    unitPeriod: "Die Mindeststückzahl gilt für genau diesen Zeitraum.",
    mistake: "Fixkosten pro Jahr eintragen, aber „Monat“ wählen.",
  },
  "marge.k": {
    means: "Die Kosten, auf die sich Marge und Aufschlag beziehen – bei Handel meist der Einstandspreis.",
    includes: "Einkaufspreis plus Bezugskosten (Fracht, Zoll), abzüglich Rabatte/Skonti vom Lieferanten. Betriebskosten wie Miete gehören nicht dazu.",
    net: NET,
    source: "Eingangsrechnung des Lieferanten.",
    mistake: "Kosten und Verkaufspreis vertauschen: Marge bezieht sich auf den Verkaufspreis, Aufschlag auf die Kosten.",
  },
  "marge.p": {
    means: "Der Verkaufspreis ohne Umsatzsteuer.",
    net: NET,
    mistake: "Den Preis inklusive Umsatzsteuer eingeben – die Marge fällt dann zu hoch aus.",
  },
  "zielpreis.k": {
    means: "Die Kostenbasis je Einheit, auf die deine Zielmarge aufgeschlagen werden soll.",
    includes: "Je nach Ziel: nur Einstandspreis/variable Kosten oder Vollkosten. Wähle bewusst – und rechne dieselbe Basis auch in der Nachkalkulation.",
    net: NET,
    mistake: "Variable Kosten als Basis nehmen und das Ergebnis mit einer Marge auf Vollkosten vergleichen.",
  },
  "roas.umsatz": {
    means: "Der Umsatz, den die Auswertung dieser Werbemaßnahme zuordnet.",
    includes: "Je nach Werbeplattform kann das Käufe nach Klick, nach Anzeigenkontakt oder beides sein. Rücksendungen sind oft nicht abgezogen.",
    net: "Möglichst netto, sonst Umsatz und Kosten nicht vergleichbar.",
    unitPeriod: "Euro im selben Zeitraum und derselben Zählweise (Attribution) wie die Werbekosten.",
    source: "Werbekonto oder Shop-Auswertung der Kampagne.",
    mistake: "Gesamtumsatz des Shops nehmen, obwohl nur ein Teil der Werbung zuzuordnen ist.",
  },
  "roas.kosten": {
    means: "Ausgaben für die Werbung, deren Umsatz du betrachtest.",
    includes: "Mediabudget; Agentur- oder Toolkosten nur, wenn du sie der Maßnahme zurechnest.",
    unitPeriod: "Euro im selben Zeitraum wie der Umsatz.",
    source: "Rechnung oder Abrechnung der Werbeplattform.",
    mistake: "Werbekosten brutto und Umsatz netto mischen.",
  },
  "roas.quote": {
    means: "Welcher Anteil des Netto-Umsatzes nach den variablen Kosten übrig bleibt – bevor die Werbekosten abgezogen werden.",
    includes: "Variable Kosten wie Wareneinsatz, Verpackung, Versand, Gebühren sind schon abgezogen. Die Werbekosten selbst nicht – sie werden hier extra abgezogen.",
    unitPeriod: "Prozent des zugeordneten Nettoumsatzes.",
    source: "Deckungsbeitragsquote aus dem Deckungsbeitragsrechner oder deiner Kalkulation.",
    mistake: "Eine Quote nehmen, in der die Werbekosten bereits stecken – dann würde Werbung doppelt abgezogen.",
  },
  "rabatt-absatz.preis": {
    means: "Der bisherige Verkaufspreis, vor dem Rabatt.",
    net: NET,
    mistake: "Einen schon rabattierten Preis als Ausgangspreis eingeben.",
  },
  "rabatt-absatz.q0": {
    means: "Wie viele Einheiten du bisher im gewählten Zeitraum zum Ausgangspreis verkaufst.",
    unitPeriod: "Einheiten im Betrachtungszeitraum.",
    source: "Absatzstatistik; bei Neuprodukten bleibt das Feld leer – dann siehst du nur den Faktor.",
  },
  "clv.aov": {
    means: "Der durchschnittliche Wert einer Bestellung.",
    net: NET,
    source: "Shop- oder Rechnungsauswertung, Summe Nettoumsätze geteilt durch Zahl der Bestellungen.",
    mistake: "Den Warenkorbwert inkl. Versand und Umsatzsteuer verwenden.",
  },
  "clv.kaeufe": {
    means: "Wie oft ein Kunde im Schnitt pro Jahr bestellt.",
    unitPeriod: "Käufe je Jahr (auch Dezimalzahlen wie 2,5).",
    source: "Beobachtet: Bestellungen geteilt durch aktive Kunden. Geschätzt: bei neuen Angeboten – dann als Annahme variieren.",
  },
  "clv.jahre": {
    means: "Wie lange ein Kunde voraussichtlich Kunde bleibt.",
    unitPeriod: "Jahre.",
    source: "Beobachtet aus Kundenverläufen oder geschätzt. Dies ist die unsicherste Größe im CLV – variiere sie.",
    mistake: "Eine lange Beziehungsdauer anzunehmen, ohne dass Kunden je so lange gebunden waren.",
  },
  "clv.db": {
    means: "Welcher Anteil des Umsatzes nach den variablen Kosten bleibt.",
    unitPeriod: "Prozent des Umsatzes.",
    mistake: "Die Umsatzrendite (nach allen Kosten) einsetzen statt der Deckungsbeitragsquote.",
  },
  "clv.cac": {
    means: "Kosten, um den Kunden zu gewinnen.",
    source: "Ergebnis des CAC-Rechners.",
  },
  "cac.neukunden": {
    means: "Kunden, die im Zeitraum erstmals gekauft haben.",
    mistake: "Leads, Interessenten oder Bestellungen zählen – Bestandskunden mit Wiederkäufen sind keine Neukunden.",
  },
};

/** Module, in denen p, v, F, q dieselbe Bedeutung haben (Preis-/Kostenmodell). */
const COST_MODEL = new Set(["break-even", "gewinn", "deckungsbeitrag"]);

export function fieldGuide(calcId: string, key: string): FieldGuide | undefined {
  return FIELD_GUIDES[`${calcId}.${key}`] ?? (COST_MODEL.has(calcId) ? FIELD_GUIDES[`*.${key}`] : undefined);
}
