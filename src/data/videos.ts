/**
 * Zentrale Konfiguration der KPI-Erklärvideos (einzige Quelle).
 *
 * Diese Datei ist reine Daten-Konfiguration ohne Imports, damit sie sowohl von der Website (Astro) als auch von den
 * Render-Skripten unter video/ (Node) genutzt werden kann. Sie ist KEINE zweite Kennzahlen-Datenbank: Formeln,
 * Felder und Erklärtexte bleiben in src/calc/modules/*. Hier stehen nur die Videodaten und die Beispielwerte,
 * die in den Tests gegen den jeweiligen Rechner geprüft werden (src/data/videos.test.ts).
 *
 * Der Erzähltext wird von einer lokal erzeugten Stimme gesprochen (video/voice.ts) und ist zusätzlich als Texteinblendung
 * im Bild, als WebVTT-Untertitel (/videos/<id>.vtt) und als Transkript auf der Seite verfügbar. Siehe docs/VIDEOS.md.
 */

export interface VideoCue {
  /** Sekunden ab Videostart. */
  start: number;
  end: number;
  text: string;
}

/** Eingaben in einen Rechner-Modus und erwartete Ergebnisse (Ergebnis-Bezeichnung → Wert, Prozent als Zahl wie im Rechner). */
export interface VideoCheck {
  variant: string;
  values: Record<string, string>;
  expect: Record<string, string>;
  /** Anderer Rechner als der des Videos (z. B. CAC im CLV-Video). */
  calc?: string;
}

export interface KpiVideo {
  /** Dateiname-Stamm unter /videos/ und Szenen-ID unter video/scenes/. */
  id: string;
  /** Rechner-ID aus src/calc/modules (Seite, auf der das Video erscheint). */
  calcId: string;
  /** Kennzahl, wie sie auf Kacheln erscheint. */
  kpi: string;
  /** Titel des Videos. */
  title: string;
  /** Ein Satz: worum es geht (Videokarte, VideoObject-Beschreibung). */
  description: string;
  /** Nutzentext für die Lernbereich-Kachel. */
  benefit: string;
  /** Exakte Dauer in Sekunden (wird beim Rendern verwendet und per ffprobe geprüft). */
  duration: number;
  /** Zeitpunkt für das Vorschaubild (Sekunden). */
  posterTime: number;
  /** Veröffentlichungsdatum (ISO) für VideoObject. */
  uploadDate: string;
  /** Beispielwerte des Videos = Beispiel des Rechners (Variante + Eingaben). */
  example: VideoCheck;
  /** Weitere Zahlen, die das Video zeigt – werden ebenfalls gegen den Rechner geprüft. */
  checks?: VideoCheck[];
  /** Erzähltext, zeitlich synchron zur Animation. */
  cues: VideoCue[];
}

export const VIDEO_BASE = "/videos";
export const videoSrc = (v: Pick<KpiVideo, "id">) => `${VIDEO_BASE}/${v.id}-720.mp4`;
export const posterSrc = (v: Pick<KpiVideo, "id">) => `${VIDEO_BASE}/${v.id}-poster.jpg`;
export const captionsSrc = (v: Pick<KpiVideo, "id">) => `${VIDEO_BASE}/${v.id}.vtt`;

export const VIDEOS: KpiVideo[] = [
  {
    id: "break-even",
    calcId: "break-even",
    kpi: "Break-even",
    title: "Break-even in 60 Sekunden",
    description: "Ab welcher Menge die Fixkosten gedeckt sind – am Beispiel 3.000 € Fixkosten und 20 € Deckungsbeitrag pro Stück.",
    benefit: "Sehen, ab welchem Stück ein Angebot Gewinn macht – und warum der Break-even kein Ziel ist.",
    duration: 66,
    posterTime: 39.5,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { p: "50", v: "30", F: "3000", zeitraum: "monat" }, expect: { "Mindeststückzahl zur Kostendeckung": "150", "Positiver Gewinn ab": "151", "Umsatz bei dieser Stückzahl": "7500" } },
    checks: [{ variant: "standard", values: { p: "45", v: "30", F: "3000", zeitraum: "monat" }, expect: { "Mindeststückzahl zur Kostendeckung": "200" } }],
    cues: [
      { start: 0.3, end: 3.4, text: "Break-even: Ab welcher Menge verdienst du Geld?" },
      { start: 3.5, end: 8.0, text: "Kalle verkauft sein Produkt für 50 €. Verdient er damit schon Geld?" },
      { start: 8.2, end: 13.4, text: "Dazu kommen 3.000 € Fixkosten pro Monat – egal, wie viel er verkauft." },
      { start: 13.6, end: 20.0, text: "Von jedem Verkauf gehen 30 € für Material und Versand weg. 20 € bleiben übrig." },
      { start: 20.2, end: 26.8, text: "Diese 20 € heißen Deckungsbeitrag. Die Frage lautet also: Wie oft passen 20 € in 3.000 €?" },
      { start: 27.0, end: 33.0, text: "3.000 € geteilt durch 20 € ergibt 150 Stück. Das ist die Break-even-Menge." },
      { start: 33.2, end: 40.0, text: "Mit dem 150. Stück sind die Fixkosten genau gedeckt. Erst das 151. Stück bringt Gewinn: 20 €." },
      { start: 40.2, end: 47.0, text: "Unter 150 Stück macht Kalle Verlust, darüber Gewinn. Bei 200 Stück wären es 1.000 €." },
      { start: 47.2, end: 55.0, text: "Sinkt der Preis auf 45 €, bleiben nur 15 € pro Stück. Dann braucht Kalle schon 200 Stück." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Break-even heißt Ziel erreicht. Dort ist der Gewinn aber genau null." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Break-even-Rechner von KPILot." },
    ],
  },
  {
    id: "cashflow",
    calcId: "cashflow",
    kpi: "Cashflow",
    title: "Cashflow in 60 Sekunden",
    description: "Warum Gewinn und Geld auf dem Konto nicht dasselbe sind – am Beispiel 30.000 € Einzahlungen und 22.000 € Auszahlungen.",
    benefit: "Verstehen, warum ein Unternehmen mit Gewinn trotzdem knapp bei Kasse sein kann.",
    duration: 66,
    posterTime: 31.5,
    uploadDate: "2026-11-22",
    example: { variant: "operativ", values: { ein: "30000", aus: "22000" }, expect: { "Operativer Cashflow": "8000" } },
    checks: [
      {
        variant: "erweitert",
        values: { ein: "30000", aus: "22000", invEin: "0", invAus: "5000", finEin: "2000", finAus: "0" },
        expect: { "Erfasster Netto-Cashflow": "5000", "Investitions-Cashflow": "-5000", "Finanzierungs-Cashflow": "2000" },
      },
    ],
    cues: [
      { start: 0.3, end: 3.4, text: "Cashflow: Wie viel Geld fließt wirklich?" },
      { start: 3.5, end: 8.0, text: "Kalle macht Gewinn. Trotzdem ist sein Konto knapp. Wie passt das zusammen?" },
      { start: 8.2, end: 14.0, text: "Der Cashflow zählt nur echtes Geld: was im Zeitraum auf dem Konto ankommt und was abfließt." },
      { start: 14.2, end: 20.0, text: "Eine Rechnung über 5.000 € ist noch nicht bezahlt. Sie ist eine Forderung – kein Zufluss." },
      { start: 20.2, end: 27.0, text: "Im Monat gehen 30.000 € ein. 22.000 € fließen ab – für Ware, Miete und Löhne." },
      { start: 27.2, end: 33.5, text: "30.000 € minus 22.000 € ergibt 8.000 €. Das ist der operative Cashflow." },
      { start: 33.7, end: 40.0, text: "Die offene Rechnung zählt erst, wenn das Geld wirklich eingeht – also in einem späteren Zeitraum." },
      { start: 40.2, end: 47.5, text: "Kauft Kalle eine Maschine für 5.000 € und nimmt 2.000 € Kredit auf, bleibt ein Netto-Cashflow von 5.000 €." },
      { start: 47.7, end: 55.0, text: "Der Kontostand ist ein Bestand an einem Tag. Der Cashflow zeigt, wie sich das Geld im Zeitraum verändert." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Gewinn heißt Geld auf dem Konto. Doch Gewinn ist nicht gleich Cashflow." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Cashflow-Rechner von KPILot." },
    ],
  },
  {
    id: "deckungsbeitrag",
    calcId: "deckungsbeitrag",
    kpi: "Deckungsbeitrag",
    title: "Deckungsbeitrag in 60 Sekunden",
    description: "Was von jedem Verkauf zur Deckung der Fixkosten übrig bleibt – am Beispiel 50 € Preis und 30 € variable Kosten.",
    benefit: "Erkennen, was ein Verkauf wirklich beiträgt – und warum das noch kein Gewinn ist.",
    duration: 66,
    posterTime: 25.5,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { p: "50", v: "30", q: "100" }, expect: { Stückdeckungsbeitrag: "20", Deckungsbeitragsquote: "40", Gesamtdeckungsbeitrag: "2000" } },
    checks: [
      { variant: "standard", values: { p: "40", v: "30" }, expect: { Stückdeckungsbeitrag: "10" } },
      { variant: "standard", values: { p: "50", v: "45" }, expect: { Stückdeckungsbeitrag: "5" } },
      { variant: "standard", values: { p: "50", v: "55" }, expect: { Stückdeckungsbeitrag: "-5" } },
    ],
    cues: [
      { start: 0.3, end: 3.4, text: "Deckungsbeitrag: Was bleibt pro Verkauf übrig?" },
      { start: 3.5, end: 8.0, text: "Kalle verkauft ein Produkt für 50 €. Aber nicht alles davon bleibt bei ihm." },
      { start: 8.2, end: 14.0, text: "Für jedes Stück fallen variable Kosten an: Material und Verpackung – zusammen 30 €." },
      { start: 14.2, end: 20.0, text: "Was danach übrig bleibt, hilft, die Fixkosten zu bezahlen: Miete, Software, Gehälter." },
      { start: 20.2, end: 26.5, text: "50 € Preis minus 30 € variable Kosten ergibt 20 € Deckungsbeitrag pro Stück." },
      { start: 26.7, end: 33.0, text: "Bei 100 verkauften Stück sind das 2.000 € Deckungsbeitrag insgesamt." },
      { start: 33.2, end: 40.0, text: "Als Quote: 20 € von 50 € sind 40 %. Von jedem Euro Umsatz bleiben 40 Cent zur Deckung." },
      { start: 40.2, end: 47.5, text: "Hoher Deckungsbeitrag: Fixkosten schnell gedeckt. Negativer Deckungsbeitrag: Jeder Verkauf vergrößert den Verlust." },
      { start: 47.7, end: 55.0, text: "Gibt Kalle 10 € Rabatt, sinkt der Deckungsbeitrag von 20 € auf 10 € – er halbiert sich." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Deckungsbeitrag sei Gewinn. Gewinn bleibt erst nach den Fixkosten." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Deckungsbeitragsrechner von KPILot." },
    ],
  },
  {
    id: "marge",
    calcId: "marge",
    kpi: "Marge & Aufschlag",
    title: "Marge und Aufschlag in 60 Sekunden",
    description: "Warum dieselben 20 € einmal 20 % und einmal 25 % sind – am Beispiel 80 € Einkauf und 100 € Verkaufspreis.",
    benefit: "Marge und Aufschlag sicher unterscheiden – und nicht zu knapp kalkulieren.",
    duration: 66,
    posterTime: 46,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { k: "80", p: "100" }, expect: { "Differenz (Rohertrag)": "20", "Marge (Handelsspanne)": "20", Aufschlag: "25" } },
    checks: [
      { variant: "standard", values: { k: "80", p: "96" }, expect: { "Differenz (Rohertrag)": "16", Aufschlag: "20", "Marge (Handelsspanne)~1": "16.7" } },
      { variant: "standard", values: { k: "100", p: "150" }, expect: { Aufschlag: "50", "Marge (Handelsspanne)~1": "33.3" } },
      { variant: "standard", values: { k: "100", p: "200" }, expect: { Aufschlag: "100", "Marge (Handelsspanne)": "50" } },
    ],
    cues: [
      { start: 0.3, end: 3.4, text: "Marge und Aufschlag: 20 €, zwei Prozentsätze." },
      { start: 3.5, end: 8.6, text: "Einkauf 80 €, Verkauf 100 €: 20 % oder 25 %?" },
      { start: 8.8, end: 14.0, text: "Beides stimmt. Es kommt darauf an, worauf man die 20 € bezieht." },
      { start: 14.2, end: 20.0, text: "Der Aufschlag rechnet vom Einkauf nach oben. Die Marge rechnet vom Verkaufspreis nach unten." },
      { start: 20.2, end: 27.0, text: "100 € minus 80 € ergibt 20 € Rohertrag pro Stück." },
      { start: 27.2, end: 33.5, text: "Marge: 20 € geteilt durch den Verkaufspreis von 100 € ergibt 20 %." },
      { start: 33.7, end: 40.0, text: "Aufschlag: 20 € geteilt durch den Einkauf von 80 € ergibt 25 %." },
      { start: 40.2, end: 47.5, text: "Bei positivem Rohertrag ist die Marge immer kleiner als der Aufschlag, weil der Verkaufspreis die größere Basis ist." },
      { start: 47.7, end: 55.0, text: "Wer 20 % Marge will, aber 20 % aufschlägt, landet bei 96 € – nur knapp 16,7 % Marge." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Marge gleich Aufschlag. Wer das verwechselt, kalkuliert zu knapp." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Margenrechner von KPILot." },
    ],
  },
  {
    id: "roi",
    calcId: "roi",
    kpi: "ROI",
    title: "ROI in 60 Sekunden",
    description: "Wie viel Gewinn eingesetztes Kapital im Zeitraum gebracht hat – am Beispiel 5.000 € Gewinn auf 50.000 € Kapital.",
    benefit: "Den ROI richtig lesen – und wissen, was die Kennzahl nicht verrät.",
    duration: 66,
    posterTime: 31,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { gewinn: "5000", kapital: "50000" }, expect: { "ROI im betrachteten Zeitraum": "10" } },
    cues: [
      { start: 0.3, end: 3.4, text: "ROI: Was bringt eingesetztes Kapital?" },
      { start: 3.5, end: 8.0, text: "Kalle steckt 50.000 € in einen zweiten Laden. Hat sich das gelohnt?" },
      { start: 8.2, end: 14.0, text: "Der ROI setzt den Gewinn einer Investition ins Verhältnis zum eingesetzten Kapital." },
      { start: 14.2, end: 20.0, text: "Stell dir das Kapital als Stapel vor. Der Gewinn ist das, was im Zeitraum obendrauf dazukommt." },
      { start: 20.2, end: 27.0, text: "Im betrachteten Zeitraum bringt der Laden 5.000 € Gewinn, der ihm zugerechnet werden kann." },
      { start: 27.2, end: 33.5, text: "5.000 € geteilt durch 50.000 € ergibt 0,1 – also 10 % ROI für diesen Zeitraum." },
      { start: 33.7, end: 40.0, text: "Das heißt: Pro 100 € eingesetztem Kapital kamen 10 € Gewinn zurück." },
      { start: 40.2, end: 47.5, text: "Ob 10 % gut sind, zeigt erst der Vergleich: mit Alternativen, Finanzierungskosten und dem Risiko." },
      { start: 47.7, end: 55.0, text: "Der ROI gilt nur für den gewählten Zeitraum. 10 % in drei Jahren sind weniger als 10 % in einem Jahr." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: 10 % ROI sei automatisch gut. Risiko und Zahlungszeitpunkte fehlen." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im ROI-Rechner von KPILot." },
    ],
  },
  {
    id: "conversion",
    calcId: "conversion",
    kpi: "Conversion Rate",
    title: "Conversion Rate in 60 Sekunden",
    description: "Welcher Anteil der Besuche zum Ziel führt – am Beispiel 25 Käufe bei 1.000 Besuchen.",
    benefit: "Die Conversion Rate richtig deuten – und Besuche nicht mit Personen verwechseln.",
    duration: 66,
    posterTime: 31,
    uploadDate: "2026-11-22",
    example: { variant: "besuche", values: { conv: "25", total: "1000" }, expect: { "Conversion Rate": "2.5" } },
    checks: [{ variant: "besuche", values: { conv: "20", total: "400" }, expect: { "Conversion Rate": "5" } }],
    cues: [
      { start: 0.3, end: 3.4, text: "Conversion Rate: Wie viele Besuche führen zum Ziel?" },
      { start: 3.5, end: 8.0, text: "Kalles Onlineshop hatte 1.000 Besuche. Aber wie viele davon haben gekauft?" },
      { start: 8.2, end: 14.0, text: "Die Conversion Rate ist der Anteil der Besuche, in denen ein Ziel erreicht wurde – etwa ein Kauf." },
      { start: 14.2, end: 20.0, text: "Stell dir jeden Besuch als Punkt vor. Endet ein Besuch mit einem Kauf, wird er grün." },
      { start: 20.2, end: 27.0, text: "Von 1.000 Besuchen endeten 25 mit einem Kauf." },
      { start: 27.2, end: 33.5, text: "25 geteilt durch 1.000 ergibt 0,025 – also eine Conversion Rate von 2,5 %." },
      { start: 33.7, end: 40.0, text: "Anders gesagt: Von 100 Besuchen führen im Schnitt 2,5 zu einem Kauf." },
      { start: 40.2, end: 47.5, text: "Achtung: Besuche sind keine Personen. Wer dreimal vorbeischaut, zählt als drei Besuche." },
      { start: 47.7, end: 55.0, text: "Vergleiche Conversion Rates nur bei gleicher Definition: gleiches Ziel, gleicher Zeitraum, gleiche Zählweise." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Höhere Rate heiße mehr Umsatz. Es zählen auch Besuche und Warenkorb." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Conversion-Rate-Rechner von KPILot." },
    ],
  },
  {
    id: "ebit-ebitda",
    calcId: "ebitda",
    kpi: "EBIT & EBITDA",
    title: "EBIT und EBITDA in 60 Sekunden",
    description: "Warum 20.000 € EBIT und 30.000 € EBITDA beide stimmen – am Beispiel einer Maschine mit 10.000 € Abschreibung.",
    benefit: "Den Unterschied zwischen EBIT und EBITDA verstehen – und warum EBITDA kein Geld auf dem Konto ist.",
    duration: 66,
    posterTime: 31.0,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { ebit: "20000", afa: "10000" }, expect: { "EBITDA": "30000" } },
    cues: [
      { start: 0.3, end: 3.4, text: "EBIT und EBITDA: Was ist der Unterschied?" },
      { start: 3.5, end: 8.0, text: "Kalle hat 20.000 € EBIT. Der Freund sagt 30.000 €. Wer hat recht?" },
      { start: 8.2, end: 14.0, text: "Beide, denn sie messen anders: EBIT ist das Ergebnis vor Zinsen und Steuern." },
      { start: 14.2, end: 20.0, text: "Im EBIT ist die Abschreibung schon abgezogen: 10.000 € für die Maschine." },
      { start: 20.2, end: 27.0, text: "Abschreibung verteilt den Maschinenpreis auf mehrere Jahre. Dafür fließt dieses Jahr nichts." },
      { start: 27.2, end: 33.5, text: "EBITDA rechnet sie wieder dazu: 20.000 € plus 10.000 € ergibt 30.000 €." },
      { start: 33.7, end: 40.0, text: "Beide Zahlen stimmen. EBIT berücksichtigt den Werteverbrauch, EBITDA blendet ihn aus." },
      { start: 40.2, end: 47.5, text: "EBITDA vergleicht Firmen mit unterschiedlich vielen Maschinen – und ignoriert deren Verschleiß." },
      { start: 47.7, end: 55.0, text: "Maschinen müssen irgendwann ersetzt werden. Das EBIT zeigt diese Kosten, das EBITDA nicht." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: EBITDA ist Geld auf dem Konto. Es ist ein Ergebnis, kein Bestand." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im EBITDA-Rechner von KPILot." },
    ],
  },
  {
    id: "roas",
    calcId: "roas",
    kpi: "ROAS & Gewinn",
    title: "ROAS und Gewinn in 60 Sekunden",
    description: "Warum ein ROAS von 4 nicht automatisch Gewinn bedeutet – am Beispiel 2.000 € Werbeumsatz bei 500 € Werbekosten und 30 % Deckungsbeitragsquote.",
    benefit: "Verstehen, warum Werbeumsatz nicht Gewinn ist und wie hoch der ROAS mindestens sein muss.",
    duration: 66,
    posterTime: 35.0,
    uploadDate: "2026-11-22",
    example: { variant: "wirtschaftlichkeit", values: { umsatz: "2000", kosten: "500", quote: "30", alt: "" }, expect: { "Deckungsbeitrag vor Werbekosten": "600", "Beitrag nach Werbekosten": "100", "ROAS": "4", "Mindest-ROAS zur Deckung der Werbekosten~2": "3.33" } },
    checks: [
      { variant: "wirtschaftlichkeit", values: { umsatz: "1500", kosten: "500", quote: "30", alt: "" }, expect: { "Beitrag nach Werbekosten": "-50" } },
    ],
    cues: [
      { start: 0.3, end: 3.4, text: "ROAS und Gewinn: Wann lohnt sich Werbung?" },
      { start: 3.5, end: 8.0, text: "Kalle gibt 500 € für Werbung aus und erzielt 2.000 € Umsatz." },
      { start: 8.2, end: 14.0, text: "ROAS ist Werbeumsatz geteilt durch Werbekosten: 2.000 € durch 500 € ergeben 4." },
      { start: 14.2, end: 20.0, text: "Ein ROAS von 4 klingt gut. Doch vom Umsatz bleibt nur der Deckungsbeitrag." },
      { start: 20.2, end: 27.0, text: "Bei 30 % Deckungsbeitragsquote bleiben von 2.000 € Umsatz nur 600 € übrig." },
      { start: 27.2, end: 33.5, text: "Davon gehen 500 € Werbekosten ab. Es bleiben 100 € Beitrag." },
      { start: 33.7, end: 40.0, text: "Mindest-ROAS: 1 geteilt durch 0,3, also etwa 3,33. Darunter lohnt sich Werbung nicht." },
      { start: 40.2, end: 47.5, text: "Mit ROAS 4 liegt Kalle über der Schwelle. Bei ROAS 3 bleiben nur 450 € – er zahlt 50 € drauf." },
      { start: 47.7, end: 55.0, text: "Die Schwelle hängt von den variablen Kosten ab: Je kleiner die Quote, desto höher der Mindest-ROAS." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Hoher ROAS heißt Gewinn. Fixkosten sind darin noch gar nicht gedeckt." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im ROAS-Rechner von KPILot." },
    ],
  },
  {
    id: "liquiditaet",
    calcId: "liquiditaet",
    kpi: "Liquiditätsgrade",
    title: "Liquiditätsgrade in 60 Sekunden",
    description: "Warum viel Vermögen nicht vor Zahlungsproblemen schützt – am Beispiel 50.000 € Umlaufvermögen und 20.000 € fälligen Schulden.",
    benefit: "Verstehen, warum ein Unternehmen trotz Vermögen zahlungsunfähig werden kann.",
    duration: 66,
    posterTime: 39.0,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { lm: "10000", ford: "15000", vorr: "20000", sonst: "5000", vb: "20000" }, expect: { "Liquidität 1. Grades": "50", "Liquidität 2. Grades": "125", "Liquidität 3. Grades": "250", "Umlaufvermögen": "50000" } },
    cues: [
      { start: 0.3, end: 3.4, text: "Liquidität: Reicht das Geld für die Schulden?" },
      { start: 3.5, end: 8.0, text: "50.000 € Umlaufvermögen, aber 20.000 € Schulden fällig. Reicht das?" },
      { start: 8.2, end: 14.0, text: "Entscheidend ist, wie schnell sich das Vermögen in Geld verwandeln lässt." },
      { start: 14.2, end: 20.0, text: "Die Liquiditätsgrade prüfen das in drei Stufen – von sofort verfügbar bis später." },
      { start: 20.2, end: 27.0, text: "Grad 1: Nur Kasse und Bank, 10.000 €. Geteilt durch 20.000 € Schulden ergibt 50 %." },
      { start: 27.2, end: 33.5, text: "Grad 2 zählt Forderungen dazu: 25.000 € durch 20.000 € ergibt 125 %." },
      { start: 33.7, end: 40.0, text: "Grad 3 zählt auch Vorräte und Sonstiges: 50.000 € durch 20.000 € ergibt 250 %." },
      { start: 40.2, end: 47.5, text: "Je weiter rechts, desto länger dauert es bis zum Geld. Vorräte müssen erst verkauft werden." },
      { start: 47.7, end: 55.0, text: "Bei Liquidität 1. Grades von 50 % reicht die Kasse allein nur für die Hälfte der fälligen Schulden." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Viel Vermögen heißt zahlungsfähig. Entscheidend ist verfügbares Geld." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Liquiditätsrechner von KPILot." },
    ],
  },
  {
    id: "clv-cac",
    calcId: "clv",
    kpi: "CLV & CAC",
    title: "CLV und CAC in 60 Sekunden",
    description: "Wann sich ein neuer Kunde lohnt – am Beispiel 100 € Akquisitionskosten und 240 € Deckungsbeitrag über drei Jahre.",
    benefit: "Verstehen, wann Kundengewinnung wirtschaftlich ist: Kundenwert gegen Gewinnungskosten.",
    duration: 66,
    posterTime: 35.0,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { aov: "50", kaeufe: "4", jahre: "3", db: "40", cac: "" }, expect: { "CLV (deckungsbeitragsbasiert)": "240", "Lebenszeit-Umsatz (Modell)": "600" } },
    checks: [
      { variant: "standard", values: { aov: "50", kaeufe: "4", jahre: "3", db: "40", cac: "100" }, expect: { "Modellbeitrag nach Akquisitionskosten": "140" } },
      { variant: "standard", values: { aov: "50", kaeufe: "2", jahre: "3", db: "40", cac: "" }, expect: { "CLV (deckungsbeitragsbasiert)": "120" } },
      { calc: "cac", variant: "standard", values: { mkt: "2000", vt: "1000", kunden: "30" }, expect: { "CAC": "100" } },
    ],
    cues: [
      { start: 0.3, end: 3.4, text: "CLV und CAC: Lohnt sich ein neuer Kunde?" },
      { start: 3.5, end: 8.0, text: "Ein neuer Kunde kostet Kalle Werbung und Vertrieb. Lohnt sich das?" },
      { start: 8.2, end: 14.0, text: "CAC: Kosten je neuem Kunden. 3.000 € für 30 Neukunden ergeben 100 € je Kunde." },
      { start: 14.2, end: 20.0, text: "CLV: der Deckungsbeitrag, den ein Kunde über die ganze Beziehung bringt." },
      { start: 20.2, end: 27.0, text: "Ein Kunde kauft viermal im Jahr für 50 € – drei Jahre lang. Das sind 600 € Umsatz." },
      { start: 27.2, end: 33.5, text: "Davon bleiben 40 % Deckungsbeitrag: 600 € mal 0,4 ergibt 240 € CLV." },
      { start: 33.7, end: 40.0, text: "240 € Kundenwert, 100 € Kosten: 140 € bleiben. Verhältnis: 2,4." },
      { start: 40.2, end: 47.5, text: "Wichtig ist der Zeitpunkt: Die 100 € zahlt Kalle sofort, die 240 € kommen erst über drei Jahre." },
      { start: 47.7, end: 55.0, text: "Der CLV ist ein Modell mit gleichbleibenden Annahmen. Kauft der Kunde seltener, sinkt der Wert." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: CLV ist Umsatz. Gemeint ist der Beitrag nach variablen Kosten." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im CLV-Rechner von KPILot." },
    ],
  },
  {
    id: "rabatt-mehrabsatz",
    calcId: "rabatt-absatz",
    kpi: "Rabatt & Mehrabsatz",
    title: "Rabatt und Mehrabsatz in 60 Sekunden",
    description: "Warum 10 % Rabatt den Absatz verdoppeln müssen – am Beispiel 100 € Preis und 80 € variable Kosten.",
    benefit: "Verstehen, wie viel mehr du nach einem Rabatt verkaufen musst, damit sich nichts verschlechtert.",
    duration: 66,
    posterTime: 33.0,
    uploadDate: "2026-11-22",
    example: { variant: "prozent", values: { preis: "100", v: "80", rabatt: "10", q0: "100", zeitraum: "monat" }, expect: { "Erforderlicher Mehrabsatz": "100", "Absatzfaktor": "2", "Stückdeckungsbeitrag vorher": "20", "Stückdeckungsbeitrag nachher": "10", "Erforderliche neue Menge": "200" } },
    checks: [
      { variant: "prozent", values: { preis: "100", v: "60", rabatt: "10", q0: "100", zeitraum: "monat" }, expect: { "Erforderlicher Mehrabsatz~1": "33.3", "Stückdeckungsbeitrag vorher": "40", "Stückdeckungsbeitrag nachher": "30" } },
    ],
    cues: [
      { start: 0.3, end: 3.4, text: "Rabatt: Wie viel mehr musst du verkaufen?" },
      { start: 3.5, end: 8.0, text: "Kalle verkauft für 100 €, hat 80 € Kosten und gibt 10 % Rabatt." },
      { start: 8.2, end: 14.0, text: "Der Preis fällt auf 90 €, die variablen Kosten bleiben bei 80 €." },
      { start: 14.2, end: 20.0, text: "Pro Stück bleiben statt 20 € nur noch 10 € Deckungsbeitrag – die Hälfte." },
      { start: 20.2, end: 27.0, text: "Für denselben Gesamtbeitrag muss Kalle also doppelt so viel verkaufen." },
      { start: 27.2, end: 33.5, text: "Aus 100 Stück müssen 200 werden: 100 % Mehrabsatz für nur 10 % Rabatt." },
      { start: 33.7, end: 40.0, text: "Bei 60 € Kosten ist es milder: 40 € werden 30 €, nötig sind 33,3 % mehr." },
      { start: 40.2, end: 47.5, text: "Je kleiner der Beitrag je Stück, desto mehr Mehrabsatz braucht derselbe Rabatt." },
      { start: 47.7, end: 55.0, text: "Ob so viele zusätzliche Kunden kommen, kann der Rechner nicht wissen. Das ist deine Annahme." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: 10 % Rabatt brauchen 10 % mehr Absatz. Es ist immer mehr." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Rabatt-Rechner von KPILot." },
    ],
  },
  {
    id: "amortisation-kapitalwert",
    calcId: "amortisation",
    kpi: "Amortisation & Kapitalwert",
    title: "Amortisation und Kapitalwert in 60 Sekunden",
    description: "Warum eine Investition nach 4 Jahren zurückverdient sein und trotzdem im Minus liegen kann – am Beispiel 10.000 € Maschine mit 2.500 € Rückfluss im Jahr.",
    benefit: "Verstehen, warum Amortisationsdauer und Kapitalwert unterschiedliche Fragen beantworten.",
    duration: 66,
    posterTime: 47.0,
    uploadDate: "2026-11-22",
    example: { variant: "standard", values: { inv: "10000", cf: "2500", periode: "jahr" }, expect: { "Amortisationsdauer": "4" } },
    cues: [
      { start: 0.3, end: 3.4, text: "Amortisation und Kapitalwert: Rechnet sich das?" },
      { start: 3.5, end: 8.0, text: "Kalle kauft eine Maschine für 10.000 €. Sie bringt 2.500 € im Jahr." },
      { start: 8.2, end: 14.0, text: "Amortisation: Wann ist das Geld zurück? 10.000 € durch 2.500 € ergeben 4 Jahre." },
      { start: 14.2, end: 20.0, text: "Nach vier Jahren ist das Geld zurück – mehr sagt diese Zahl nicht." },
      { start: 20.2, end: 27.0, text: "Das Geld von morgen ist heute weniger wert. Darum werden spätere Zahlungen abgezinst." },
      { start: 27.2, end: 33.5, text: "Bei 10 % Zins sind die vier Rückflüsse heute zusammen 7.925 € wert." },
      { start: 33.7, end: 40.0, text: "Kapitalwert: 7.925 € minus 10.000 € ergibt minus 2.075 €." },
      { start: 40.2, end: 47.5, text: "Nach vier Jahren zurückverdient, bei 10 % Zins aber ein Minus – das zeigt nur der Kapitalwert." },
      { start: 47.7, end: 55.0, text: "Der Zinssatz ist eine Annahme: Was dir das Kapital woanders brächte, bestimmt die Rechnung." },
      { start: 55.2, end: 60.6, text: "Typischer Irrtum: Kurze Amortisation heißt gute Investition. Der Gewinn danach fehlt." },
      { start: 60.8, end: 65.8, text: "Rechne jetzt mit deinen eigenen Zahlen – im Amortisationsrechner von KPILot." },
    ],
  },
];

export const videoForCalc = (calcId: string) => VIDEOS.find((v) => v.calcId === calcId);

/** Dauer als ISO-8601 (VideoObject), z. B. PT1M6S. */
export const isoDuration = (s: number) => {
  const m = Math.floor(s / 60),
    r = Math.round(s - m * 60);
  return `PT${m ? `${m}M` : ""}${r}S`;
};

/** Dauer für die Anzeige, z. B. „1:06 Min.“ */
export const displayDuration = (s: number) => {
  const m = Math.floor(s / 60),
    r = Math.round(s - m * 60);
  return `${m}:${String(r).padStart(2, "0")} Min.`;
};

/** WebVTT aus den Cues (für /videos/<id>.vtt). */
export const toVtt = (v: KpiVideo) => {
  const ts = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(3).padStart(6, "0")}`;
  };
  return `WEBVTT\n\n${v.cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}`).join("\n\n")}\n`;
};
