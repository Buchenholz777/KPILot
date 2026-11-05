import { TOPICS } from './registry';

/** Häufige Fragen auf der Startseite (sichtbar und als FAQPage-Daten). */
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: 'Was ist ein KPI?',
    a: 'KPI steht für Key Performance Indicator, auf Deutsch Leistungskennzahl. Ein KPI ist eine Zahl, die zeigt, wie gut ein Unternehmen, ein Team oder eine Maßnahme ein festgelegtes Ziel erreicht, zum Beispiel die Conversion Rate eines Onlineshops oder die Kosten pro Neukunde.',
  },
  {
    q: 'Welche KPIs sollte ich als kleines Unternehmen im Blick behalten?',
    a: 'Für den Start reichen wenige Kennzahlen, die direkt zu deinen Zielen passen: meist Umsatz und Gewinn bzw. Marge, der Deckungsbeitrag, die Conversion Rate sowie das Verhältnis von Kundenwert (CLV) zu Neukundenkosten (CAC). Lieber fünf KPIs regelmäßig prüfen als zwanzig nie.',
  },
  {
    q: 'Ist der KPI Rechner kostenlos und werden meine Zahlen gespeichert?',
    a: `Ja, alle ${TOPICS.length} Rechner sind kostenlos und ohne Anmeldung nutzbar. Die Berechnung läuft direkt in deinem Browser; deine eingegebenen Zahlen werden nicht an einen Berechnungsserver übertragen. Gespeichert wird nur, wenn du es ausdrücklich möchtest – lokal in deinem Browser. Eine Messung der Website-Nutzung gibt es nur mit deiner Zustimmung.`,
  },
];

/** Hilfe und häufige Fragen auf „Über KPILot“ – beschreibt nur tatsächlich vorhandene Funktionen. */
export const HELP_FAQ: { q: string; a: string }[] = [
  {
    q: 'Welche Rechner und Anwendungsfälle bietet KPILot?',
    a: `${TOPICS.length} Einzelrechner in sechs Kategorien (Prozent, Kosten und Preise, Finanzen, Marketing, Produkt und Kunden, Controlling). Dazu kommen Anwendungsfälle, die mehrere Rechner verbinden und nicht als Einzelrechner zählen: fünf Aufgabeneinstiege, der geführte Ablauf „Preis & Wirtschaftlichkeit“, drei Praxisfälle und Lernseiten.`,
  },
  {
    q: 'Wie gebe ich Werte ein und wie lese ich das Ergebnis?',
    a: 'Trage Zahlen mit Komma oder eindeutigem Punkt ein (1234,56 · 1.234,56). „Beispiel einsetzen“ füllt dokumentierte Beispielwerte ein und kennzeichnet sie. Das Ergebnis hat drei Ebenen: die Hauptaussage, die Einordnung mit Zeitraum und Einheit, und aufklappbare Details mit Rechenweg und Modellgrenzen. Unter „Was ist gemeint?“ am Feld steht, welche Positionen zählen, ob netto oder brutto gemeint ist und woher du den Wert typischerweise nimmst.',
  },
  {
    q: 'Was unterscheidet Favoriten, zuletzt genutzte Rechner und Meine Berechnungen?',
    a: 'Favoriten sind Rechner (oder Rechenmodi), die du mit dem Stern markierst – es werden nur Kennungen gespeichert. „Zuletzt genutzt“ merkt sich automatisch nur Rechnerkennung und Zeitpunkt, nie Eingaben. „Meine Berechnungen“ enthält nur, was du ausdrücklich mit „Speichern“ ablegst: Eingaben, Name, Notiz und Vorhaben.',
  },
  {
    q: 'Wo liegen meine gespeicherten Daten?',
    a: 'Ausschließlich im lokalen Speicher deines Browsers auf diesem Gerät. KPILot hat kein Konto und keinen Server für deine Berechnungen. Es gibt keinen geräteübergreifenden Freigabelink.',
  },
  {
    q: 'Wie sichere ich meine Daten und wie funktioniert der Gerätewechsel?',
    a: 'Unter „Meine Berechnungen“ erzeugt „Sicherung herunterladen“ eine Datei mit Berechnungen, Vorhaben, Notizen und Favoriten. Auf dem anderen Gerät wählst du „Sicherung einspielen“, siehst eine Vorschau und entscheidest bei Konflikten, ob Vorhandenes behalten, als Kopie ergänzt oder überschrieben wird. Deine Entscheidung zur Nutzungsmessung wird nicht übertragen.',
  },
  {
    q: 'Kann ich eine gelöschte Berechnung wiederherstellen?',
    a: 'Ja. Nach dem Löschen erscheint „Rückgängig“; zusätzlich liegen gelöschte Berechnungen bis zu 30 Tage unter „Zuletzt gelöscht“ und lassen sich mit Name, Werten, Notiz und Vorhaben wiederherstellen.',
  },
  {
    q: 'Was passiert, wenn ich Browserdaten entferne?',
    a: 'Favoriten, Meine Berechnungen, Papierkorb, zuletzt genutzte Rechner und Einstellungen sind dann weg, ebenso wenn du „Alle lokalen Daten löschen“ wählst. Eine zuvor heruntergeladene Sicherungsdatei bleibt erhalten und lässt sich wieder einspielen.',
  },
  {
    q: 'Welche Grenzen haben die Berechnungsmodelle?',
    a: 'Die Modelle sind bewusst einfach: konstante Preise und Kosten im gewählten Zeitraum, Nettobeträge, ganze Stückzahlen. Sie sagen nicht, ob Nachfrage erreichbar ist, und ersetzen keinen Jahresabschluss und keine Steuer-, Rechts- oder Finanzberatung. Jede Rechnerseite nennt Annahmen und typische Missverständnisse.',
  },
  {
    q: 'Wie kann ich einen Fehler melden?',
    a: 'Am Ende jeder Rechnerseite steht „Rückmeldung per E-Mail“. Die E-Mail enthält nur den Namen des Rechners und den Text, den du selbst schreibst – keine Rechenwerte oder gespeicherten Daten.',
  },
];
