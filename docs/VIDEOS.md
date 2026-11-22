# KPI-Erklärvideos „In 60 Sekunden verstehen“

Sechs kurze, animierte Erklärvideos im KPILot-Stil. Alle Videos werden **programmatisch und reproduzierbar** aus
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
npm run video:render -- all                 # alle sechs: Master + Web + Vorschaubild
npm run video:render -- break-even          # ein Video
npm run video:render -- roi --stills 12,31.5 --out /tmp/stills   # Einzelbilder zur Sichtprüfung
npm run video:voice -- all                  # nur die Erklärstimme neu erzeugen und einsetzen
npm run video:check                          # ffprobe-Prüfung gegen die Konfiguration
```

Ein Video dauert auf 4 Kernen ca. 2–3 Minuten. Die Ausgabe ist deterministisch (keine Zufallswerte ohne festen
Startwert), daher erzeugt derselbe Stand dieselben Bilder.

## Erklärstimme

Jedes Video hat eine **moderierende deutsche Erklärstimme**, die den Erzähltext (`cues`) spricht. Sie wird lokal
und offline erzeugt – kein Cloud- oder Bezahldienst, keine Daten verlassen den Rechner.

- **Synthese**: [Piper](https://github.com/OHF-Voice/piper1-gpl) (`pip install piper-tts`, Version 1.8) mit der Stimme
  **`de_DE-thorsten-medium`** (22 kHz) aus `rhasspy/piper-voices` auf huggingface.co. Download nach `video/voices/`
  (nicht im Repository, ca. 63 MB):

  ```bash
  mkdir -p video/voices && cd video/voices
  curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx
  curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx.json
  ```

- **Lizenz**: Trainingsdaten „Thorsten-Voice“ von Thorsten Müller unter **CC0**; das Medium-Modell ist laut Model Card
  aus einem ebenfalls CC0-lizenzierten Basismodell (rdh, nl_BE) feinjustiert. Die erzeugten Tonspuren sind damit frei
  nutzbar. Bewusst **nicht** verwendet: `thorsten-high` (feinjustiert aus „lessac“, dessen Daten nur unter einer
  Forschungslizenz stehen) und `thorsten-low` (16 kHz, hörbar dumpfer).
- **Sprechtext** (`speechText` in `video/voice.ts`): Der Bildtext bleibt unverändert; für die Stimme werden englische
  Fachbegriffe in deutsche Lautumschrift gebracht (Break-even → „Bräjk-iewen“, Cashflow → „Käschfloh“,
  Conversion Rate → „Konwörschen-Räjt“, ROI → „Er-O-I“), Ordinalzahlen ausgeschrieben („dem 150. Stück“ →
  „dem hundertfünfzigsten Stück“) und Gedankenstriche zu kurzen Pausen. Zahlen, Euro und Prozent liest die Stimme
  selbst korrekt („3.000 €“ → „dreitausend Euro“, „16,7 %“ → „sechzehn Komma sieben Prozent“).
- **Timing** (`planVoice`): Jeder Satz startet 0,1 s nach seinem Cue. Läuft ein Satz länger, darf er bis zu 1 s in
  den nächsten Cue hineinlaufen (dafür höchstens 8 % schneller), in Ausnahmen bis 2 s; der nächste, kürzere Satz holt
  auf. Mehr als 12 % Beschleunigung lehnt das Skript ab – dann muss der Text gekürzt werden. Stand: kein Satz über
  8 %, größter Verzug ca. 1,4 s.
- **Tonspur**: Sätze per `adelay` platziert, gemischt, Hochpass 70 Hz, Lautheit auf −16 LUFS (`loudnorm`), mono
  48 kHz, AAC (Master 128 kbit/s, Web 96 kbit/s), Sprache `deu`. Das Bild wird nicht neu kodiert (`-c:v copy`).
- **Ablauf**: `npm run video:render -- <id>` vertont automatisch, wenn die Stimme vorhanden ist (sonst Warnung, und
  `video:check` schlägt fehl). Nur die Stimme neu erzeugen: `npm run video:voice -- all`.
- **Barrierefreiheit**: Der Text bleibt zusätzlich synchron im Bild (Erzählband), als WebVTT-Untertitel und als
  Transkript auf der Seite. Der Player startet nur auf Klick und mit Ton (kein Autoplay).
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

## Website-Integration

- **Rechnerseiten** (`src/pages/[slug].astro`): Videokarte im Bereich „Kurz erklärt“ – Vorschaubild (lazy, feste
  16:9-Fläche, kein Layoutsprung), Titel „In 60 Sekunden verstehen“, Dauer, ein Satz Beschreibung, Transkript zum
  Aufklappen. Klick öffnet einen nativen `<dialog>` (Esc/Schließen, Fokus bleibt im Dialog); erst dann wird das
  `<video>` mit `controls`, Poster und deutscher Untertitelspur eingefügt – **kein Autoplay beim Laden, kein
  Video-Download beim Seitenaufruf**. Am Ende erscheint „Jetzt selbst berechnen“ (Sprung zu `#rechner`, kein Neuladen).
  Ohne JavaScript öffnet der Link die MP4-Datei.
- **Lernbereich** (`/aufgaben/kennzahlen-lernen/`): Abschnitt „Kennzahlen visuell verstehen“ mit sechs Kacheln
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
- Die Stimme ist synthetisch (Piper). Eine Hörprobe durch einen Menschen steht aus; Aussprache-Korrekturen gehören in
  `speechText` (`video/voice.ts`), danach `npm run video:voice -- all`.
- Safari/iOS, Firefox und Screenreader nicht auf echten Geräten geprüft.
