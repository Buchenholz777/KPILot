# KPI-Erklärvideos „In 60 Sekunden verstehen“

Zwölf kurze, animierte Erklärvideos im KPILot-Stil (sechs Basis-Kennzahlen und sechs Vertiefungsthemen). Alle Videos werden **programmatisch und reproduzierbar** aus
TypeScript-Szenen erzeugt und von einer lokal erzeugten deutschen Erklärstimme (Piper, CC0) gesprochen – ohne
kostenpflichtige Video-, Bild- oder Stimmengeneratoren.

| Video | Rechnerseite | Dauer | Beispiel (= Rechnerbeispiel) |
| --- | --- | --- | --- |
| Break-even | `/break-even-rechner/` | 1:06 | Fixkosten 3.000 €/Monat, Preis 50 €, variable Kosten 30 € → DB 20 €, 150 Stück; ab dem 151. Stück Gewinn |
| Cashflow | `/cashflow-rechner/` | 1:06 | 30.000 € Einzahlungen − 22.000 € Auszahlungen = 8.000 € operativ; offene Rechnung 5.000 € = Forderung; erweitert: −5.000 € Investition, +2.000 € Kredit → Netto 5.000 € |
| Deckungsbeitrag | `/deckungsbeitragsrechner/` | 1:06 | 50 € − 30 € = 20 € je Stück; 100 Stück → 2.000 €; Quote 40 % |
| Marge & Aufschlag | `/margenrechner/` | 1:06 | Einkauf 80 €, Verkauf 100 € → 20 € Rohertrag, 20 % Marge, 25 % Aufschlag |
| ROI | `/roi-rechner/` | 1:06 | 5.000 € Gewinn ÷ 50.000 € Kapital = 10 % für den betrachteten Zeitraum (nicht annualisiert) |
| Conversion Rate | `/conversion-rate-rechner/` | 1:06 | 25 Besuche mit Kauf ÷ 1.000 Besuche = 2,5 % (Besuche ≠ Personen) |
| EBIT & EBITDA | `/ebitda-rechner/` | 1:06 | EBIT 20.000 € + Abschreibungen 10.000 € = EBITDA 30.000 € (ein Ergebnis, kein Kontostand) |
| ROAS & Gewinn | `/roas-rechner/` | 1:06 | Werbeumsatz 2.000 €, Werbekosten 500 € → ROAS 4; Quote 30 % → Beitrag 600 € − 500 € = 100 €; Mindest-ROAS 1 ÷ 0,3 ≈ 3,33 |
| Liquiditätsgrade | `/liquiditaetsrechner/` | 1:06 | liquide Mittel 10.000 €, Forderungen 15.000 €, Vorräte 20.000 €, Sonstiges 5.000 €, Schulden 20.000 € → 50 % / 125 % / 250 % |
| CLV & CAC | `/clv-rechner/` | 1:06 | Bestellwert 50 €, 4 Käufe/Jahr, 3 Jahre, Quote 40 % → CLV 240 €; CAC 3.000 € ÷ 30 = 100 €; Beitrag 140 €, Verhältnis 2,4 |
| Rabatt & Mehrabsatz | `/rabatt-mehrabsatz-rechner/` | 1:06 | Preis 100 €, Kosten 80 €, 10 % Rabatt → Beitrag 20 € → 10 €, +100 % Absatz (100 → 200 Stück); Gegenprobe 60 € Kosten → +33,3 % |
| Amortisation & Kapitalwert | `/amortisationsrechner/` | 1:06 | 10.000 € Investition, 2.500 € je Jahr → 4 Jahre; Kapitalwert bei 10 % Zins (Beispielannahme) −2.075 € |

## Dateien

| Pfad | Inhalt |
| --- | --- |
| `src/data/videos.ts` | **Einzige Quelle**: Titel, Beschreibung, Dauer, Vorschaubild-Zeitpunkt, Beispielwerte, zusätzlich gezeigte Zahlen (`checks`) und der zeitgenaue Erzähltext (`cues`). Keine zweite Kennzahlen-Datenbank – Formeln bleiben in `src/calc/modules/*`. |
| `video/engine.ts` | Motion-Engine: Zeit → SVG (1920 × 1080), Easing, Designsystem, Figur „Kalle“, Sprechblasen, Münzen, Karten, Wasserfall-/Stapeldiagramme, Titel- und Abschlusskarte, Erzählband |
| `video/scenes/<id>.ts` | Eine Datei pro Video: die fünf Szenen als reine Funktion der Zeit |
| `video/render.ts` | Rendert Frames in Chromium (Playwright) und kodiert per ffmpeg |
| `video/voice.ts`, `video/tts.py` | Erklärstimme: Sprechtext, Zeitplan, Piper-Synthese, Tonspur, Einsetzen ins MP4 |
| `public/videos/<id>-720.mp4` | Webfassung 1280 × 720, H.264 High, 30 fps, CRF 27, AAC-Tonspur (Erklärstimme), `faststart` |
| `public/videos/<id>-poster.jpg` | Vorschaubild 1280 × 720 (ohne Erzählband) |
| `/videos/<id>.vtt` | WebVTT-Untertitel, beim Build aus `cues` erzeugt (`src/pages/videos/[id].vtt.ts`) |
| `video/out/<id>-1080.mp4` | Master 1920 × 1080, CRF 18 (nicht im Repository, `.gitignore`; jederzeit neu erzeugbar) |

## Reproduzieren

Voraussetzungen: Node ≥ 22.18 (führt TypeScript direkt aus), ffmpeg/ffprobe im `PATH`, Playwright mit Chromium,
für die Stimme python3 mit `piper-tts` und die Stimme unter `video/voices/` (siehe „Erklärstimme“).

```bash
npm run video:render -- all                 # alle zwölf: Master + Web + Vorschaubild + Stimme
npm run video:render -- break-even          # ein Video
npm run video:render -- roi --stills 12,31.5 --out /tmp/stills   # Einzelbilder zur Sichtprüfung
npm run video:voice -- all                  # nur die Erklärstimme neu erzeugen und einsetzen
npm run video:check                          # ffprobe-Prüfung gegen die Konfiguration
```

Ein Video dauert auf 4 Kernen ca. 2–3 Minuten. Die Ausgabe ist deterministisch (keine Zufallswerte ohne festen
Startwert), daher erzeugt derselbe Stand dieselben Bilder.

## Erklärstimme

Jedes Video hat eine **moderierende deutsche Erklärstimme**, die den Erzähltext (`cues`) spricht. Sie wird lokal
und offline erzeugt – kein Cloud- oder Bezahldienst, keine Daten verlassen den Rechner, beim Abspielen gibt es keine
externen Anfragen (die Tonspur steckt im MP4).

### Überblick (Stand 23.11.2026, Überarbeitung der Sprecherstimme)

- **Engine**: [Piper](https://github.com/OHF-Voice/piper1-gpl) (`pip install piper-tts`, 1.8) mit **`de_DE-thorsten-medium`**
  (22 kHz, Download nach `video/voices/`, nicht im Repository, ca. 63 MB). Die Stimme blieb bewusst dieselbe für alle
  12 Videos; verbessert wurden Aussprache, Pausen, Tempo und Auswahl der Aufnahmen (siehe unten).
- **Lizenz**: Trainingsdaten „Thorsten-Voice“ unter **CC0**, Medium-Modell aus CC0-Basismodell feinjustiert. Nicht
  verwendet: `thorsten-high` (aus „lessac“ feinjustiert, Daten nur unter Forschungslizenz), XTTS-v2 (CPML,
  nicht kommerziell), MMS-TTS und F5-TTS-Deutsch (CC-BY-NC). Bezahldienste (z. B. ElevenLabs, Azure, Google) wurden
  **nicht** aktiviert; sie wären nur mit ausdrücklicher Freigabe eine Option (siehe „Grenzen“).

### Zentrale Konfiguration

| Datei | Inhalt |
| --- | --- |
| `video/voice.config.json` | Stimme/Modell, Synthese (`length_scale` 0,96, `noise_scale`, `noise_w`), Pausen (Satz 0,22 s, Doppelpunkt 0,15 s, nach Rechenergebnis 0,32 s), Zeitplan (Vorlauf, Verzug, Tempo-Grenzen), Aufnahmeauswahl (Kandidaten), Export (48 kHz, −16 LUFS, Hochpass, AAC 128/96 kbit/s) |
| `video/pronunciation.json` | **Aussprachewörterbuch**: je Begriff ein Regex (`match`), die Aussprache als IPA im Phonemvorrat der Stimme (`ipa`), die Erkennungsformen für die Prüfung (`asr`) und eine Notiz |
| `video/speech.ts` | Sprechtext → Teile (Text, Wörterbuch-Aussprache, Pausen); Ordinalzahlen; Regeln für Pausen |
| `video/tts.py` | Eigene Phonemisierung und Synthese (Piper-Modell direkt, ohne `espeak`-Markup), Stille-Einfügung, Aufnahmeauswahl |
| `video/voice.ts` | Zeitplan (`planVoice`), Tonspur, Einsetzen ins MP4 |
| `video/pronounce-test.ts`, `video/voice-eval.py` | Hörproben für Fachbegriffe und automatische Prüfung per Spracherkennung |

### Ursachen der schlechten Aussprache (vorher)

1. Englische Begriffe waren als **deutsche Lautumschrift** geschrieben („Bräjk-iewen“, „Käschfloh“,
   „Konwörschen-Räjt“) und klangen daher deutsch-verfremdet statt englisch.
2. Es gab **keine Pausensteuerung**: Alles lief in einem Zug, Zahlen und Rechenergebnisse hatten keine Atempause.
3. Das **Sprechtempo** war für die Zeitfenster zu langsam, es wurde nachträglich per `atempo` gedehnt/gestaucht.
4. Die Standard-Phonemisierung (espeak) liest einzelne deutsche Wörter falsch (**„Marge“ mit hartem g**, „Rohertrag“
   ohne Glottisverschluss, „Irrtum“ mit schwer verständlichem r).
5. Die **Stimme selbst** (Piper medium, VITS, 22 kHz) ist eine kleine, lokale Stimme. Ihre Natürlichkeit ist
   begrenzt; das lässt sich mit Einstellungen verbessern, aber nicht auf das Niveau großer Cloud-Stimmen heben.

### Umsetzung der Aussprache

- **Englische Fachbegriffe** werden nicht mehr als deutsche Schreibweise, sondern als **englische IPA** direkt in den
  Satz eingebettet (Break-even `brˈeɪk ˈiːvən`, Cashflow `kˈæʃflˌoʊ`, Conversion Rate `kɑnvˈɜːʒən ɹˈeɪt`,
  Return on Investment, Key Performance Indicator, Operating Cashflow, Revenue, EBIT, EBITDA). Der Phonemvorrat
  der deutschen Stimme enthält englische Laute (`eɪ`, `oʊ`, `æ`, `ɜ`, `ɹ` …), die Stimme bleibt dieselbe.
- **Akronyme**: ROI als Buchstaben (`ɛʁ oː iː`, deutsch üblich), ROAS als Wort („Ro-as“), CLV/CAC englische
  Buchstaben, KPILot als „KPI-Lot“.
- **Deutsche Korrekturen**: Marge, Margen(rechner), Rohertrag, Irrtum.
- **Auswahl der Aufnahme**: Das Modell erzeugt bei jedem Lauf leicht andere Aussprache (zufälliges Rauschen).
  Darum werden je Satz bis zu 4 Aufnahmen (bei Sätzen mit Wörterbuch-Begriff bis zu 8) erzeugt, mit lokaler
  Spracherkennung (faster-whisper „medium“, `KPILOT_ASR_MODEL`) geprüft und die am besten erkannte, bei Gleichstand
  die kürzeste gewählt. Ohne Erkennungsmodell wird die erste Aufnahme verwendet. Das Ergebnis ist **nicht
  bitgleich reproduzierbar**, aber gleichbleibend in der Qualität; die Berichte stehen unter `video/out/voice/<id>/report.json`.
- **Pausen**: Stille wird zwischen Sätzen, nach Doppelpunkten und länger nach Rechenergebnissen („… ergibt 150 Stück.“)
  eingefügt. Sehr kurze Abschnitte (< 3 Wörter) werden mit dem Nachbarn verbunden, weil die Stimme Mini-Äußerungen
  unnatürlich dehnt.
- **Ordinalzahlen** werden ausgeschrieben („dem 150. Stück“ → „dem hundertfünfzigsten Stück“, „1. Grades“ → „ersten Grades“).
- **Timing** (`planVoice`): Jeder Satz startet 0,1 s nach seinem Cue; ein langer Satz darf bis 1 s (Ausnahme 2 s) in den
  nächsten Cue laufen, höchstens 8 % (Ausnahme 12 %) schneller. Alle 12 Videos halten das ein (größte Beschleunigung ×1,08).
  Das Bild wird nicht neu kodiert (`-c:v copy`).
- **Textänderungen** (fachlich unverändert, nur sprechbarer; Untertitel/VTT/Transkript kommen aus denselben Cues und
  bleiben synchron): ROI „Risiko und Zeitpunkt fehlen“; Liquidität „Grad 1, nur Kasse und Bank: 10.000 € durch
  20.000 € ergibt 50 %.“ (ebenso Grad 2/3); CLV/CAC „CAC: Kosten je Neukunde. 3.000 € für 30 Neukunden ergeben
  100 €.“, „240 € Wert, 100 € Kosten: 140 € bleiben. Verhältnis: 2,4.“, „100 € zahlt Kalle sofort, 240 € kommen erst
  über drei Jahre.“, „… Modell mit festen Annahmen“; Amortisation „… sind 4 Jahre“, „Kalle kauft eine Maschine für
  10.000 € – sie bringt 2.500 € im Jahr.“

### Qualitätssicherung der Stimme

- **Automatisch** (Spracherkennung als Näherung an eine Hörkontrolle): Alle 132 Sätze wurden erkannt und mit dem Text
  verglichen: mittlere Wortfehlerrate **7,7 %** (68 von 132 Sätzen exakt, 7 über 25 %). Das sind überwiegend Eigenheiten der
  Erkennung (Zahlen „5 und 40“, „Euro“ vs. „€“, Eigennamen), kein Beweis für Fehler – aber auch kein Beweis für gute Aussprache.
- **Technisch**: `npm run video:check` (genau eine AAC-Spur, Dauer, nicht still), Zeitplan-Prüfung in `planVoice`,
  Tests in `tests/voice.test.ts` (Wörterbuch, Pausen, Phonemvorrat, Abdeckung aller Fachbegriffe in allen Cues).
- **Hörproben** für kritische Begriffe: `docs/audio/aussprache/*.mp3` (je ein Trägersatz, MP3 64 kbit/s), Erkennungsergebnis in
  `erkannt.json`. Neu erzeugen: `KPILOT_ASR_MODEL=<Ordner> node video/pronounce-test.ts`.
- **Die automatische Prüfung ersetzt kein Anhören.** Ob die Stimme wie ein Muttersprachler klingt und die Satzmelodie
  natürlich ist, kann sie nicht beurteilen; das steht aus (siehe „Offene Punkte“).

### Weitere Befehle

- Alles neu vertonen: `KPILOT_ASR_MODEL=<faster-whisper-Ordner> npm run video:voice -- all` (ca. 8 Minuten je Video);
  ohne `KPILOT_ASR_MODEL` etwa 30 Sekunden gesamt, dann ohne Aufnahmeauswahl.
- Nur bestimmte Sätze neu sprechen (nach einer Wörterbuch-Änderung): `KPILOT_REDO='Irrtum|ROAS' npm run video:voice -- all`.
- Das Erkennungsmodell (`Systran/faster-whisper-medium`, huggingface.co) und `pip install faster-whisper` sind nur
  für die Erzeugung nötig, nicht für die Website.
- **Tonspur**: Sätze per `adelay` platziert, Hochpass 70 Hz, −16 LUFS, mono 48 kHz, AAC (Master 128, Web 96 kbit/s), Sprache `deu`.
- **Barrierefreiheit**: Der Text bleibt zusätzlich synchron im Bild, als WebVTT und als Transkript. Der Player startet
  nur auf Klick und mit Ton.
- Keine Musik (keine lizenzfreie Quelle mit geklärter Lizenz in der Umgebung).

## Designsystem der Videos

- **Stil**: ruhiger 2D-Editorial-Comic, klare Outlines (5–6 px, Navy `#17253D`), flache Flächen, feines Raster wie
  im KPILot-Markenbild. Keine Effekte ohne Erklärfunktion.
- **Farben** (aus `src/styles/tokens.css`): Navy `#0B1730` (Titel/Abschluss), Indigo `#4338CA` (Umsatz, Preis,
  Kapital), Teal `#0F766E` (Deckungsbeitrag, Gewinn, Zufluss), Rose `#B4235A` (Kosten, Verlust, Abfluss),
  Amber `#B45309` (Veränderung, Warnung, Aufschlag). Bedeutung zusätzlich über Schraffur/Beschriftung, nie nur Farbe.
- **Typografie**: Inter; Zahlen ≥ 72 px, wichtige Texte ≥ 44 px, Erzählband 46 px.
- **Figur „Kalle“**: wiederkehrender, minimalistischer Unternehmer (runder Kopf, indigo Pullover, türkiser Kragen),
  fünf Stimmungen und wenige Armhaltungen. Er ist nie größer als die Zahlen und tritt in Rechen-Szenen zurück.
- **Bewegung**: kubisches Ease-in-out, leichter Überschwinger nur beim „Ankommen“ von Objekten, progressives
  Zeichnen von Linien und Balken, Zähler, die exakt auf dem Ergebnis enden. Diagramme sind maßstabsgetreu.
- **Bildaufbau**: Kapitelzeile oben, eine Kernaussage pro Szene als Titel, Inhalt im Bereich y = 230–900,
  Erzählband unten (y > 920).
- **Dramaturgie** (alle Videos): Titelkarte 0–3,4 s · ① Problem 3,4–8,2 s · ② intuitive Erklärung 8,2–20,2 s ·
  ③ Zahlenbeispiel 20,2–40,2 s · ④ Interpretation 40,2–55,2 s · ⑤ typischer Irrtum 55,2–60,8 s ·
  Abschlusskarte „Jetzt selbst mit KPILot berechnen“ 60,8–66 s.

## Storyboards

### Break-even (Referenzvideo)
1. **Problem** – Kalle am Verkaufstisch, Produkt mit Preisschild 50 €: „Und – bleibt da was übrig?“
2. **Intuition** – Fixkosten-Topf 3.000 €; Rechnungszettel (Miete, Software, Versicherung) fallen hinein. Ein Verkauf
   teilt sich: 30 € gehen an Material & Versand, 20 € wandern in den Topf; weitere Verkäufe füllen ihn.
3. **Zahlen** – Rechenkarte 50 € − 30 € = 20 €; „Wie oft passen 20 € in 3.000 €?“; Topf füllt sich mit Zähler bis
   150 × 20 € = 3.000 €; Formel 3.000 € ÷ 20 € = 150 Stück. Umsatz- und Kostenlinie (maßstabsgetreu) schneiden sich
   bei 150 Stück; Hinweis „150. Stück: Gewinn 0 € – 151. Stück: +20 €“.
4. **Interpretation** – Flächen Verlust/Gewinn; bei 200 Stück +1.000 €. Preis sinkt auf 45 €: Umsatzlinie kippt,
   Break-even wandert auf 200 Stück (+50 Stück).
5. **Irrtum** – „Break-even erreicht – Ziel geschafft!“ wird durchgestrichen; Waage Umsatz 7.500 € = Kosten 7.500 €.

### Cashflow
1. **Problem** – Auswertung „Gewinn ✓“, Geschäftskonto „fast leer“; Kalle: „Wo ist das Geld?“
2. **Intuition** – Konto als Tank: Einzahlungen fließen zu, Auszahlungen ab. Eine Rechnung über 5.000 € bleibt in der
   Ablage „Forderung: wartet“ – kein Zufluss.
3. **Zahlen** – Brückendiagramm 30.000 € − 22.000 € = 8.000 € operativer Cashflow; die offene Rechnung zählt „später“.
4. **Interpretation** – Netto-Cashflow: operativ +8.000 €, Maschine −5.000 €, Kredit +2.000 € → 5.000 €
   (= Rechnermodus „Erweiterte Übersicht“). Kontostand (Bestand, Zeitpunkt) vs. Cashflow (Fluss, Zeitraum):
   12.000 € → 17.000 € (illustrative Kontostände).
5. **Irrtum** – Gewinn zählt die Rechnung schon, Cashflow erst bei Zahlung: „Gewinn ≠ Geld auf dem Konto“.

### Deckungsbeitrag
1. **Problem** – Preis-Säule 50 €: „Alles meins?“
2. **Intuition** – Material 22 € und Verpackung 8 € (Aufteilung als Beispiel gekennzeichnet) lösen sich ab; der Rest
   20 € wandert als „+20 € Beitrag“ zu den Fixkosten (Miete, Software, Gehälter).
3. **Zahlen** – 50 € − 30 € = 20 €; 10 × 10-Raster: 100 × 20 € = 2.000 €; Quote 20 € ÷ 50 € = 40 %
   („40 Cent je Euro“).
4. **Interpretation** – drei Säulen: variable Kosten 30/45/55 € → DB +20 € (füllt schnell), +5 € (langsam),
   −5 € (Verlust wächst). Rabatt 10 €: DB sinkt von 20 € auf 10 € (−20 % Preis = −50 % Beitrag).
5. **Irrtum** – 2.000 € DB − 3.000 € Fixkosten = −1.000 €: Gewinn erst nach Fixkosten.

### Marge & Aufschlag
1. **Problem** – Einkauf 80 € → Verkauf 100 €: „20 % oder 25 %?“
2. **Intuition** – zwei Säulen 80 € und 100 €, die 20 € Differenz; Aufschlag-Pfeil von unten (Basis 80 €),
   Marge-Pfeil von oben (Basis 100 €).
3. **Zahlen** – 100 € − 80 € = 20 €; Marge: 1 von 5 Blöcken à 20 € = 20 %; Aufschlag: +1 Block auf 4 = 25 %.
4. **Interpretation** – Tabelle Aufschlag → Marge: 25 % → 20 %, 50 % → 33,3 %, 100 % → 50 %. Ziel 20 % Marge, aber
   20 % aufgeschlagen: 80 € + 16 € = 96 €, Marge 16 € ÷ 96 € ≈ 16,7 %.
5. **Irrtum** – „20 % Marge = 20 % Aufschlag“ wird durchgestrichen.

### ROI
1. **Problem** – Kalle investiert 50.000 € in „Laden 2“: „Lohnt sich das?“
2. **Intuition** – Bruch Gewinn / eingesetztes Kapital = ROI; Kapitalstapel aus 10 Blöcken à 5.000 €, im Zeitraum
   (Uhr läuft) kommt ein Block +5.000 € obendrauf (maßstabsgetreu).
3. **Zahlen** – zurechenbarer Gewinn 5.000 € im betrachteten Zeitraum; 5.000 € ÷ 50.000 € = 0,1 = 10 %
   „für diesen Zeitraum“; 10 Münzen à 10 € = 100 € → 10 € Gewinn.
4. **Interpretation** – Ist 10 % gut? Fragen nach Kapitalkosten, Alternative, Risiko (keine erfundenen Vergleichszahlen).
   Zeitraum: 10 % in 1 Jahr vs. 10 % in 3 Jahren (≈ 3,2 % pro Jahr).
5. **Irrtum** – was 10 % nicht zeigen: Risiko, Zahlungszeitpunkte, Dauer.

### Conversion Rate
1. **Problem** – Shop-Fenster mit 1.000 Besuchen: „Und wie viele haben gekauft?“
2. **Intuition** – Trichter „alle Besuche → Ziel: Kauf“; 1.000 Punkte, einer pro Besuch.
3. **Zahlen** – 25 Punkte werden grün (fester Zufallsstartwert); 25 ÷ 1.000 = 0,025 = 2,5 %; 10 × 10-Ausschnitt mit
   2,5 grünen Punkten („ein halber Kauf ist ein Durchschnitt“).
4. **Interpretation** – eine Person, drei Besuche (Mo/Mi/Fr) = 3 Besuche in der Statistik. Vergleich nur bei gleicher
   Definition (Ziel, Zeitraum, Basis).
5. **Irrtum** – Variante A 1.000 × 2,5 % = 25 Käufe vs. B 400 × 5 % = 20 Käufe: doppelte Rate, weniger Käufe.

### EBIT & EBITDA
1. **Problem** – Kalle meldet 20.000 € EBIT, ein Freund 30.000 € EBITDA: „Wer hat recht?“
2. **Intuition** – EBIT = Ergebnis vor Zinsen und Steuern; die Abschreibung (10.000 €, Maschine) ist darin schon abgezogen.
3. **Zahlen** – Abschreibung verteilt den Maschinenpreis auf Jahre (kein Geldabfluss in diesem Jahr); Brücke EBIT 20.000 € +
   Abschreibung 10.000 € = EBITDA 30.000 €; „beide Zahlen stimmen“.
4. **Interpretation** – Schema (ohne Maßstab): gleiches EBITDA, unterschiedliches EBIT bei wenig/vielen Maschinen; Ersatz
   der Maschine bleibt ein Kostenfaktor, den nur das EBIT zeigt.
5. **Irrtum** – EBITDA ≠ Geld auf dem Konto (Ergebnis eines Zeitraums, kein Bestand).

### ROAS & Gewinn
1. **Problem** – 500 € Werbekosten → 2.000 € Werbeumsatz.
2. **Intuition** – ROAS = Werbeumsatz ÷ Werbekosten = 4; aber vom Umsatz bleibt nur der Deckungsbeitrag (Säule 1.400 € variable
   Kosten + 600 € Beitrag, maßstäblich).
3. **Zahlen** – Brücke Umsatz 2.000 € → variable Kosten −1.400 € → Deckungsbeitrag 600 € → Werbekosten −500 € → 100 €;
   Mindest-ROAS 1 ÷ 0,3 ≈ 3,33 auf einer ROAS-Skala 0–5.
4. **Interpretation** – bei ROAS 3: 1.500 € → 450 € → −500 € = −50 €; Quote 50/30/20 % → Mindest-ROAS 2 / 3,33 / 5.
5. **Irrtum** – hoher ROAS ≠ Gewinn; Fixkosten sind darin nicht gedeckt.

### Liquiditätsgrade
1. **Problem** – 50.000 € Umlaufvermögen, 20.000 € Schulden fällig: „Reicht das Geld?“
2. **Intuition** – Säule aus Kasse/Bank, Forderungen, Vorräten, Sonstigem (maßstäblich) – drei Stufen von „sofort“ bis „später“.
3. **Zahlen** – Balken gegen die 100-%-Linie: Grad 1 = 50 %, Grad 2 = 125 %, Grad 3 = 250 %.
4. **Interpretation** – Weg zum Geld (sofort / wenn der Kunde zahlt / erst nach Verkauf); 20 Kästchen à 1.000 € Schulden,
   10 durch Kasse und Bank gedeckt.
5. **Irrtum** – viel Vermögen ≠ zahlungsfähig; entscheidend ist verfügbares Geld. (Keine Richtwerte: keine belastbare Quelle.)

### CLV & CAC
1. **Problem** – Kalle gibt Geld für Werbung und Vertrieb aus, ein Neukunde kommt.
2. **Intuition** – CAC: 2.000 € + 1.000 € = 3.000 € ÷ 30 Neukunden = 100 €; CLV als Beitrag über drei Jahre.
3. **Zahlen** – 12 Käufe à 50 € = 600 € Umsatz → 40 % Beitrag = 240 € CLV; Brücke 240 € − 100 € = 140 €; Verhältnis 2,4.
4. **Interpretation** – Zeitpunkt: 100 € heute, bis zu 240 € über drei Jahre. Modell: 2 statt 4 Käufe pro Jahr halbiert den CLV (120 €).
5. **Irrtum** – CLV ≠ Umsatz (600 € vs. 240 € Beitrag).

### Rabatt & Mehrabsatz
1. **Problem** – 100 €, 80 € Kosten, 10 % Rabatt.
2. **Intuition** – zwei Säulen: Preis 100 € = 80 € + 20 € Beitrag; Preis 90 € = 80 € + 10 € Beitrag (halb so groß).
3. **Zahlen** – Flächen (Menge × Beitrag, maßstäblich): 100 × 20 € = 2.000 € = 200 × 10 €; +100 %. Gegenprobe: 60 € Kosten →
   100 × 40 € = 4.000 € = 133,3 × 30 € (+33,3 %).
4. **Interpretation** – je kleiner der Beitrag, desto größer der nötige Mehrabsatz; ob die Nachfrage kommt, ist eine Annahme
   des Nutzers (keine Nachfrageelastizität im Rechner).
5. **Irrtum** – 10 % Rabatt brauchen 10 % mehr Absatz – es ist immer mehr.

### Amortisation & Kapitalwert
1. **Problem** – Maschine 10.000 €, Rückfluss 2.500 € je Jahr.
2. **Intuition** – 10.000 € ÷ 2.500 € = 4 Jahre; kumulierte Säulen erreichen die Investitionslinie im vierten Jahr.
3. **Zahlen** – Geld von morgen ist weniger wert; Barwerte bei 10 % (Beispielannahme, Zahlungen am Jahresende, kein Restwert):
   2.273 / 2.066 / 1.878 / 1.708 € = 7.925 €; Kapitalwert 7.925 € − 10.000 € = −2.075 € (unabhängig nachgerechnet im Test).
4. **Interpretation** – zwei Kennzahlen, zwei Fragen: Amortisation „Wann ist das Geld zurück?“ (4 Jahre), Kapitalwert „Was
   bleibt nach Zins?“ (−2.075 €). Der Zinssatz ist eine Annahme.
5. **Irrtum** – kurze Amortisation ≠ gute Investition (der Gewinn danach fehlt).

## Website-Integration

- **Rechnerseiten** (`src/pages/[slug].astro`): Videokarte im Bereich „Kurz erklärt“ – Vorschaubild (lazy, feste
  16:9-Fläche, kein Layoutsprung), Titel „In 60 Sekunden verstehen“, Dauer, ein Satz Beschreibung, Transkript zum
  Aufklappen. Klick öffnet einen nativen `<dialog>` (Esc/Schließen, Fokus bleibt im Dialog); erst dann wird das
  `<video>` mit `controls`, Poster und deutscher Untertitelspur eingefügt – **kein Autoplay beim Laden, kein
  Video-Download beim Seitenaufruf**. Am Ende erscheint „Jetzt selbst berechnen“ (Sprung zu `#rechner`, kein Neuladen).
  Ohne JavaScript öffnet der Link die MP4-Datei.
- **Lernbereich** (`/aufgaben/kennzahlen-lernen/`): Abschnitt „Kennzahlen visuell verstehen“ mit zwölf Kacheln
  (Vorschaubild, Kennzahl, Nutzen, Dauer, Link zum Rechner).
- **Verfügbarkeit**: Karte, Kachel und VideoObject erscheinen nur, wenn Web-Datei **und** Vorschaubild unter
  `public/videos/` existieren (`src/lib/videos.ts`). Ein neues Video = Eintrag in `src/data/videos.ts` + Szene +
  Rendern; die Seiten übernehmen es automatisch.
- **SEO**: Transkript im HTML; `VideoObject` (Name, Beschreibung, Vorschaubild, contentUrl, uploadDate, ISO-Dauer,
  Transkript) nur im Produktions-Build mit `SITE_URL` und nur für vorhandene Videos. Canonicals unverändert.
- **Datenschutz**: Videos werden selbst gehostet, keine Einbettung externer Player, keine neuen Tracker. Optionales
  Ereignis `video_started` nur über die bestehende, einwilligungsabhängige Messung und nur mit der Rechner-ID.

## Qualitätssicherung

- `tests/videos.test.ts`: Dauer 45–70 s, Cues geordnet/ohne Überlappung/≤ 17 Zeichen pro Sekunde, Dramaturgie,
  Beispielwerte = Rechnerbeispiel, **jede im Video gezeigte Zahl** (inkl. 151, 200 Stück bei 45 €, Netto-Cashflow
  5.000 €, 16,7 % Marge, 33,3 %, 5 % bei 20/400 …) wird mit dem echten Rechner nachgerechnet, WebVTT-Format.
- `npm run video:check`: Codec, Auflösung, 30 fps, Dauer, genau eine AAC-Tonspur in Videolänge und nicht still,
  faststart, Dateigröße, Vorschaubild.
- `tests/voice.test.ts`: Sprechtext (Lautumschrift, Ordinalzahlen) und Zeitplan der Stimme (Verzug, Tempo, Ende).
- Sichtprüfung über Einzelbilder (`--stills`) für jede Szene; Abnahme-Kontaktbögen im Arbeitsverlauf.

## Offene Punkte

- Veröffentlicht am 22.11.2026 (`uploadDate`) mit Erklärstimme.
- Die Stimme ist synthetisch (Piper). **Eine Hörprobe durch einen Menschen steht aus.** Aussprache-Korrekturen gehören
  in `video/pronunciation.json`, danach `KPILOT_REDO=<Begriff> npm run video:voice -- all`.
- **Bekannte Ausspracheprobleme** (nach automatischer Prüfung): „Break-even“ wird von der Spracherkennung nur teilweise
  erkannt (die Stimme liefert das englische /r/ in „Break“ nicht stabil, das ɹ/r bleibt je Aufnahme unterschiedlich);
  „Cashflow“ endet im Deutschen eher auf „-flo“ als „-floʊ“; „Conversion Rate“ wird oft als „Inversion …“ erkannt;
  ROAS/CLV/CAC sind verständlich, aber nicht muttersprachlich; „Margenrechner“ ist als seltenes Kompositum unsicher.
  Die Piper-Stimme ist für englische Laute nicht trainiert; für Muttersprachler-Niveau bräuchte es eine mehrsprachige
  oder Cloud-Stimme (kostenpflichtig, nicht aktiviert) oder eine Aufnahme durch einen Sprecher.
- Safari/iOS, Firefox und Screenreader nicht auf echten Geräten geprüft.
