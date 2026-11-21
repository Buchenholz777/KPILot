# SEO-Konzept und -Stand von KPILot

Stand: 07.11.2026 · bevorzugte Domain: `https://www.my-kpilot.de/`

Grundsatz: Jede Rechnerseite zielt auf die konkrete Berechnung, nach der gesucht wird (z. B. „Deckungsbeitrag berechnen“), nicht auf die Marke. **Keyword-Prioritäten sind qualitative Einschätzungen** – es lagen keine Suchvolumendaten vor. Es werden keine Platzierungen versprochen.

## 1. Technische Bestandsaufnahme

| Bereich | Befund |
|---|---|
| Framework / Rendering | Astro, vollständig statisch vorgerendert (SSG). Überschriften, Erklärungen, Formeln, Beispiele, Rechenweg und Links stehen im ausgelieferten HTML. JavaScript wird nur für die Interaktion der Rechner gebraucht. **Kein Indexierungsproblem durch JavaScript.** |
| Routing | `/<rechner-slug>/` (41), `/kategorie/<slug>/` (6), `/rechner/`, `/aufgaben/…`, `/lernen/…`, `/praxisfaelle/`, `/ablauf/…`, `/ueber/`; einheitlich mit abschließendem Schrägstrich |
| HTTPS / Weiterleitungen | `http://www…` → 301 → `https://www…`; ohne Schrägstrich → 308 → mit Schrägstrich; `/index.html` → 308 → `/` |
| Domain ohne www | `http://my-kpilot.de` → 302 → `http://www…` (beim Domain-Anbieter, temporär); **`https://my-kpilot.de` ist nicht erreichbar** (siehe „Offene Punkte“) |
| robots.txt | erlaubt alles, nennt die Sitemap |
| Sitemap | 60 absolute HTTPS-URLs, nur indexierbare Seiten, kein `lastmod` (keine verlässlichen Änderungsdaten) |
| Canonical / robots | jede indexierbare Seite hat ein selbstreferenzierendes Canonical; persönliche Seiten (Favoriten, Gespeichert, Impressum, Datenschutz, 404) sind `noindex` |
| Strukturierte Daten | WebSite, WebPage, BreadcrumbList, WebApplication (Start und jeder Rechner) |
| Mobil | responsive, kein horizontaler Überlauf (geprüft bei 375 px) |
| Performance | Startseite ca. 22 KB komprimiert (Brotli), JavaScript je Rechner wird nachgeladen; Illustrationen als SVG |

## 2. Gefundene Probleme und Änderungen

### Bestätigte Probleme (behoben)

1. **Canonical auf noindex-Seiten**: Die 404-Seite und weitere noindex-Seiten hatten ein Canonical und og:url, die 404-Seite sogar auf die nicht existierende Adresse `/404/`. Jetzt werden Canonical und og:url nur auf indexierbaren Seiten ausgegeben (`src/layouts/Base.astro`).
2. **„Verfügbare Kapazität“ auf fast allen Rechnerseiten**: Der Block „Nächster Schritt“ mit dem Feld „Verfügbare Kapazität“ stand als verstecktes HTML in jedem Rechner. Im Browser war er korrekt ausgeblendet, aber in reinen Textansichten (Suchmaschinen, Reader-Modus, KI-Tools) erschien er als fachlich unpassender Inhalt. Jetzt wird „Nächster Schritt“ nur bei Rechnern mit Folgeschritten ausgegeben, das Kapazitätsfeld nur beim Gewinnrechner und beim Rabatt-Mehrabsatz-Rechner, die den Kapazitätsabgleich tatsächlich anbieten (`src/components/Calculator.astro`, `src/scripts/calculator.ts`). Die Funktion selbst ist unverändert.
3. **Kein Browser-Caching der Build-Dateien**: Gehashte Dateien unter `/_astro/` wurden mit `max-age=0` ausgeliefert und bei jedem Seitenaufruf neu geprüft. Neu: `public/_headers` mit einjährigem, unveränderlichem Cache für `/_astro/*` und kürzeren Zeiten für Logos und Illustrationen.
4. **Doppelte Auslieferung unter `kpilot.pages.dev`**: Die Projektadresse liefert dieselben Inhalte aus. Sie erhält jetzt per Header `X-Robots-Tag: noindex`; die Canonicals zeigen ohnehin auf www.my-kpilot.de.
5. **Zu lange bzw. abgeschnittene Metadaten**: 14 Rechnertitel über ca. 65 Zeichen, mehrere Descriptions unter 110 Zeichen; Kategorie-Descriptions wurden mitten im Wort abgeschnitten; ein Lernseitentitel mit 91 Zeichen.
6. **H1 ohne Suchbegriff**: Die H1 der Rechner war nur der Kurzname (z. B. „Break-even“, „Gewinn & Zielgewinn“).
7. **FAQPage-Auszeichnung auf der Startseite**: entfernt. Google zeigt FAQ-Rich-Results nur noch für ausgewählte Behörden- und Gesundheitswebsites; die sichtbaren Fragen bleiben.

### Umsetzung

- **Zentrale SEO-Konfiguration** `src/data/seo.ts`: Für jeden der 41 Rechner Titel, Description, H1, Haupt- und Nebenkeywords sowie Suchintention. Die bisherigen verstreuten Felder `seoTitle`/`seoDescription` wurden entfernt (eine Quelle). Vorteile wie „Szenariovergleich“ oder „Grafik“ stehen nur dort, wo der Rechner sie hat (automatisch geprüft).
- **Startseite**: Titel „KPI-Rechner kostenlos: 41 Online-Rechner mit Formeln | KPILot“, neue Description, H1 beginnt mit „KPI-Rechner“.
- **Rechnerseiten**: H1 aus der SEO-Konfiguration, H2 „Formel: …“, „Beispielrechnung mit Rechenweg“, „Verwandte Rechner zu …“; zusätzlich WebApplication-JSON-LD (kostenlos, im Browser, ohne Bewertungen).
- **Kategorie-, Aufgaben-, Lern- und Übersichtsseiten**: Titel und Descriptions gekürzt bzw. geschärft, Kategorie-Descriptions ohne Abschneiden.
- **Inhalte**: Jede Rechnerseite hatte bereits Kurz-Erklärung, Rechner, Feldhilfen, Formel mit Variablen, dokumentiertes Beispiel mit Rechenweg, Ergebnisdeutung, typische Missverständnisse, Modellannahmen, Quellen und verwandte Rechner. Deshalb wurden keine zusätzlichen Fülltexte ergänzt.
- **Interne Verlinkung**: „Verwandte Rechner“ steht als echte Links im HTML. Die wichtigen Pfade (Deckungsbeitrag → Break-even → Gewinn, Marge → Verkaufspreis, CTR → CPC → CPA → ROAS, CAC → CLV, EBIT → EBITDA → EBIT-Marge) sind vorhanden und werden getestet.

## 3. Automatisierte Prüfung

- `npm test` → `tests/seo.test.ts`: Eintrag für jeden Rechner, Titel 45–62 Zeichen, Descriptions 120–165 Zeichen, alles eindeutig (Titel, Descriptions, H1, Hauptkeywords), Szenario-Versprechen nur bei Szenariorechnern, verwandte Rechner gültig, wichtige Linkpfade vorhanden.
- `npm run check:site` (nach dem Build) → `scripts/check-site.mjs`: fehlende oder doppelte Titel und Descriptions, Längenhinweise, genau eine H1, robots-Meta, Canonical (Pfad, Domain, Schrägstrich), og:url = Canonical, gültiges JSON-LD (kein FAQPage, keine Bewertungen, keine fremden Domains), tote interne Links, Sitemap (vollständig, absolut, HTTPS, ohne noindex-Seiten, ohne Dubletten), robots.txt mit Sitemap, kein Meta-Keywords-Tag.
- Produktionsmodus lokal prüfen: `CF_PAGES=1 CF_PAGES_BRANCH=main npm run build && npm run check:site`

## 4. Offene Punkte (manuell)

1. **Domain ohne www**: `https://my-kpilot.de` antwortet nicht, `http://my-kpilot.de` leitet nur temporär (302) weiter. Beim Domain-Anbieter eine **dauerhafte 301-Weiterleitung** von `my-kpilot.de` (http und https) auf `https://www.my-kpilot.de/` einrichten, oder die Domain zu Cloudflare umziehen und dort per Weiterleitungsregel umleiten.
2. **Logo-Datei**: `brand/kpilot-logo.png` hat 592 × 160 Pixel (ca. 61 KB) und wird deutlich kleiner angezeigt. Eine verkleinerte Fassung würde einige KB sparen; das ist optional.
3. **Lighthouse**: wurde nicht ausgeführt (kein Werkzeug installiert). Empfehlung: PageSpeed Insights für Startseite und einen Rechner prüfen.

## 5. Google Search Console

1. Property `https://www.my-kpilot.de` ist bestätigt (Meta-Tag auf der Startseite).
2. **Sitemaps** → `sitemap.xml` einreichen bzw. nach dem Deploy erneut senden.
3. **URL-Prüfung** für Startseite und die wichtigsten Rechner (z. B. Break-even, Deckungsbeitrag, Prozentrechner, ROI) → „Indexierung beantragen“.
4. Nach 2–4 Wochen unter **Seiten** prüfen, ob alle 60 URLs indexiert sind; „Gecrawlt – zurzeit nicht indexiert“ beobachten.
5. Unter **Leistung** die tatsächlichen Suchanfragen je Seite auswerten und Titel/Descriptions in `src/data/seo.ts` gezielt nachschärfen.
6. **Verbesserungen → Breadcrumbs** auf Fehler prüfen.

## 6. Zielkeywords und Seitentitel je Rechner

### Prozent & Grundlagen

| Seite | Seitentitel | Hauptkeyword | Nebenkeywords |
|---|---|---|---|
| `/prozentrechner/` | Prozentrechner: Prozent online berechnen – kostenlos &#124; KPILot | Prozentrechner | Prozent berechnen, Prozentwert berechnen, Prozentsatz berechnen, Grundwert berechnen |
| `/prozentuale-veraenderung/` | Prozentuale Veränderung berechnen – Rechner &#124; KPILot | prozentuale Veränderung berechnen | Wachstum in Prozent, Steigerung berechnen, Rückgang in Prozent, prozentuale Abweichung |
| `/rabattrechner/` | Rabattrechner: Preis nach Rabatt berechnen &#124; KPILot | Rabattrechner | Rabatt berechnen, Preis nach Rabatt, ursprünglichen Preis berechnen, Preiserhöhung berechnen |
| `/prozentpunkte-rechner/` | Prozentpunkte berechnen – Unterschied zu Prozent &#124; KPILot | Prozentpunkte berechnen | Prozentpunkte vs. Prozent, Unterschied Prozent Prozentpunkte, Quote Veränderung |
| `/dreisatz-rechner/` | Dreisatz-Rechner: proportional & umgekehrt &#124; KPILot | Dreisatz Rechner | Dreisatz berechnen, umgekehrter Dreisatz, Verhältnisrechnung |
| `/gewichteter-durchschnitt/` | Gewichteter Durchschnitt – Rechner online &#124; KPILot | gewichteter Durchschnitt berechnen | gewichtetes Mittel, Durchschnittspreis berechnen, Mischpreis berechnen |
| `/cagr-rechner/` | CAGR-Rechner: jährliche Wachstumsrate berechnen &#124; KPILot | CAGR Rechner | CAGR berechnen, jährliche Wachstumsrate, durchschnittliches Wachstum pro Jahr |

### Kostenrechnung & Preise

| Seite | Seitentitel | Hauptkeyword | Nebenkeywords |
|---|---|---|---|
| `/deckungsbeitragsrechner/` | Deckungsbeitrag berechnen – Kostenloser Rechner &#124; KPILot | Deckungsbeitrag berechnen | Deckungsbeitragsrechner, Stückdeckungsbeitrag, DB-Quote berechnen, Deckungsbeitragsrechnung |
| `/break-even-rechner/` | Break-even-Rechner: Gewinnschwelle berechnen &#124; KPILot | Break-even Rechner | Gewinnschwelle berechnen, Break-even-Point berechnen, Break-even-Menge, Mindestabsatz berechnen |
| `/gewinnrechner/` | Gewinnrechner: Gewinn & Zielgewinn berechnen &#124; KPILot | Gewinnrechner | Gewinn berechnen, Zielgewinn berechnen, Menge für Zielgewinn |
| `/margenrechner/` | Margenrechner: Marge und Aufschlag berechnen &#124; KPILot | Margenrechner | Marge berechnen, Handelsspanne berechnen, Aufschlag berechnen, Marge vs. Aufschlag |
| `/verkaufspreis-berechnen/` | Verkaufspreis berechnen aus Zielmarge – Rechner &#124; KPILot | Verkaufspreis berechnen | Preis aus Marge berechnen, Zielmarge, Preis kalkulieren, VK berechnen |
| `/stueckkosten-rechner/` | Stückkosten berechnen – Gesamt- und Stückkosten &#124; KPILot | Stückkosten berechnen | Kosten pro Stück, Gesamtkosten berechnen, Divisionskalkulation, Durchschnittskosten |
| `/zuschlagskalkulation/` | Zuschlagskalkulation Rechner: Selbstkosten &#124; KPILot | Zuschlagskalkulation Rechner | Selbstkosten berechnen, Herstellkosten berechnen, Gemeinkostenzuschlag, Zuschlagssatz berechnen |
| `/stundenkostensatz-rechner/` | Stundenkostensatz berechnen – Stundensatz-Rechner &#124; KPILot | Stundensatz berechnen | Stundenkostensatz, Stundenverrechnungssatz, Kosten pro Stunde, Stundensatz Selbstständige |
| `/rabatt-mehrabsatz-rechner/` | Lohnt sich ein Rabatt? Mehrabsatz berechnen &#124; KPILot | Rabatt Mehrabsatz berechnen | lohnt sich ein Rabatt, Rabattaktion Wirtschaftlichkeit, Absatzsteigerung bei Preissenkung |

### Finanzen & Liquidität

| Seite | Seitentitel | Hauptkeyword | Nebenkeywords |
|---|---|---|---|
| `/ebit-rechner/` | EBIT berechnen – Ergebnis vor Zinsen und Steuern &#124; KPILot | EBIT berechnen | EBIT Rechner, operatives Ergebnis, Ergebnis vor Zinsen und Steuern |
| `/ebitda-rechner/` | EBITDA berechnen – Rechner mit Formel &#124; KPILot | EBITDA berechnen | EBITDA Rechner, EBITDA Formel, Ergebnis vor Abschreibungen |
| `/ebit-marge-rechner/` | EBIT-Marge berechnen – operative Marge in Prozent &#124; KPILot | EBIT-Marge berechnen | operative Marge, EBIT-Marge Formel, Operating Margin |
| `/umsatzrendite-rechner/` | Umsatzrendite berechnen – Nettomarge in Prozent &#124; KPILot | Umsatzrendite berechnen | Nettoumsatzrendite, Return on Sales, Umsatzrentabilität, Gewinnmarge |
| `/cashflow-rechner/` | Cashflow-Rechner: operativen Cashflow berechnen &#124; KPILot | Cashflow berechnen | Cashflow Rechner, operativer Cashflow, Free Cashflow, Cashflow Formel |
| `/working-capital-rechner/` | Working Capital berechnen – Nettoumlaufvermögen &#124; KPILot | Working Capital berechnen | Nettoumlaufvermögen, Net Working Capital, Working Capital Formel |
| `/liquiditaetsrechner/` | Liquiditätsgrad berechnen: 1., 2. und 3. Grades &#124; KPILot | Liquiditätsgrad berechnen | Liquidität 1. Grades, Liquidität 2. Grades, Quick Ratio, Current Ratio |
| `/eigenkapitalquote-rechner/` | Eigenkapitalquote berechnen – Rechner online &#124; KPILot | Eigenkapitalquote berechnen | EK-Quote, Eigenkapitalquote Formel, Kapitalstruktur, Fremdkapitalquote |
| `/roi-rechner/` | ROI-Rechner: Kapitalrendite berechnen &#124; KPILot | ROI Rechner | ROI berechnen, Kapitalrendite berechnen, Return on Investment, Rendite berechnen |
| `/amortisationsrechner/` | Amortisationsrechner: Amortisationsdauer berechnen &#124; KPILot | Amortisationsrechner | Amortisationsdauer berechnen, Amortisationszeit, Payback Period |

### Marketing & Vertrieb

| Seite | Seitentitel | Hauptkeyword | Nebenkeywords |
|---|---|---|---|
| `/conversion-rate-rechner/` | Conversion Rate berechnen – Rechner online &#124; KPILot | Conversion Rate berechnen | Conversion Rate Rechner, Konversionsrate, Conversion Rate Formel |
| `/ctr-rechner/` | CTR-Rechner: Klickrate (Click-Through-Rate) berechnen &#124; KPILot | CTR Rechner | CTR berechnen, Klickrate berechnen, Click-Through-Rate |
| `/cpc-rechner/` | CPC-Rechner: Kosten pro Klick berechnen &#124; KPILot | CPC Rechner | CPC berechnen, Kosten pro Klick, Cost per Click |
| `/cpm-rechner/` | CPM / TKP berechnen – Tausenderkontaktpreis &#124; KPILot | TKP berechnen | CPM berechnen, Tausenderkontaktpreis, Cost per Mille |
| `/cpa-rechner/` | CPA-Rechner: Kosten pro Conversion berechnen &#124; KPILot | CPA Rechner | CPA berechnen, Cost per Action, Kosten pro Lead, Cost per Acquisition |
| `/roas-rechner/` | ROAS-Rechner: Return on Ad Spend & Mindest-ROAS &#124; KPILot | ROAS Rechner | ROAS berechnen, Return on Ad Spend, Break-even-ROAS, lohnt sich Werbung |
| `/cac-rechner/` | CAC-Rechner: Kosten je Neukunde berechnen &#124; KPILot | Customer Acquisition Cost Rechner | CAC berechnen, Kundenakquisitionskosten, Kosten pro Neukunde |

### Produkt & Kunden

| Seite | Seitentitel | Hauptkeyword | Nebenkeywords |
|---|---|---|---|
| `/arpu-rechner/` | ARPU berechnen – Umsatz pro Kunde / Account &#124; KPILot | ARPU berechnen | Average Revenue per User, Umsatz pro Kunde, ARPA |
| `/clv-rechner/` | CLV-Rechner: Customer Lifetime Value berechnen &#124; KPILot | Customer Lifetime Value Rechner | CLV berechnen, Kundenwert berechnen, LTV berechnen, CLV CAC Verhältnis |
| `/churn-rechner/` | Churn-Rate-Rechner: Abwanderung & Retention &#124; KPILot | Churn Rate Rechner | Churn Rate berechnen, Kündigungsrate, Retention Rate, Kundenbindungsrate |
| `/mrr-arr-rechner/` | MRR- und ARR-Rechner: wiederkehrender Umsatz &#124; KPILot | MRR Rechner | ARR Rechner, MRR berechnen, ARR berechnen, Monthly Recurring Revenue |
| `/nps-rechner/` | NPS-Rechner: Net Promoter Score berechnen &#124; KPILot | Net Promoter Score Rechner | NPS berechnen, NPS Formel, Weiterempfehlungsrate |

### Controlling & Planung

| Seite | Seitentitel | Hauptkeyword | Nebenkeywords |
|---|---|---|---|
| `/soll-ist-rechner/` | Soll-Ist-Vergleich: Abweichung berechnen &#124; KPILot | Soll-Ist-Vergleich berechnen | Planabweichung, Budgetabweichung, Abweichungsanalyse |
| `/auslastung-rechner/` | Auslastung berechnen – Kapazitätsauslastung &#124; KPILot | Auslastung berechnen | Kapazitätsauslastung, Beschäftigungsgrad, Maschinenauslastung |
| `/lagerkennzahlen-rechner/` | Lagerumschlag und Lagerdauer berechnen &#124; KPILot | Lagerumschlag berechnen | Lagerumschlagshäufigkeit, Lagerdauer berechnen, durchschnittlicher Lagerbestand |

## 7. Zweite Runde (09.11.2026): Startseite, Diagramme, Messung

Grundlage war der Auftrag „SEO-, Growth-, UI/UX- und Performance-Optimierung“. Vieles davon war nach der ersten Runde schon erfüllt (zentrale Metadaten, Canonicals, Sitemap, strukturierte Daten, Prüfungen). Neu:

| Bereich | Umsetzung | Nachweis |
|---|---|---|
| Alle Rechner direkt sichtbar | Die Startseite zeigte zuvor nur 11 „empfohlene“ Rechner und brauchte „Alle 41 Rechner anzeigen“. Jetzt stehen alle 41 sofort im Katalog (nach Kategorien geordnet, Suche und Kategorie-Filter wie bisher); die redaktionelle Auswahl steht als „Schnellzugriff“ darüber. | Browserprüfung: 41 sichtbare Kacheln, kein Pflichtklick |
| Hero | H1 „KPI-Rechner: Berechnen statt schätzen.“ (Keyword bleibt erhalten), Unterzeile mit Nutzen, Vorteile in einer Zeile (kostenlos, ohne Anmeldung, Formeln und Rechenweg, Berechnung im Browser – alles zutreffend), Suchplatzhalter „Was möchtest du berechnen? …“ | Suche bei 390 px ohne Scrollen sichtbar |
| Schnellzugriff | Marge, Break-even, Deckungsbeitrag, Cashflow, Stundenkostensatz, Rabatt – bezeichnet als redaktionelle Auswahl, nicht als „beliebteste“ (keine Messdaten) | – |
| Suche | Bestand genügte: Synonyme, Abkürzungen, Alltagsfragen, Tippfehler. Stichproben: „Wie viel Gewinn bleibt?“ → Gewinn, EBIT, Marge, Umsatzrendite · „Was bleibt vom Umsatz“ → Umsatzrendite, Deckungsbeitrag, Gewinn · „Wie lange bis sich eine Investition lohnt“ → Amortisation | geprüft per Testlauf |
| Diagramme | 8 neue Live-Diagramme (siehe `docs/VISUALISIERUNG.md`), insgesamt 10 Rechner | `tests/charts.test.ts` |
| Messung | 6 neue Ereignisse ohne Werte/Freitext (siehe `docs/MESSKONZEPT.md`, `docs/GROWTH.md`); Datenschutzhinweise angepasst | `tests/analytics.test.ts` |
| Inventar und Regressionsschutz | `docs/RECHNER-INVENTAR.md` (automatisch aus dem Code), `tests/inventar.test.ts` (41 Rechner, URLs, Modi, Beispiele) | Tests |
| Korrektur | Titel/Description von „Stückkosten“ versprachen eine Grafik, die der Rechner nicht zeigt; angepasst. Neuer Test: „Grafik“ nur bei Rechnern mit Diagramm. | `tests/seo.test.ts` |

### Nicht umgesetzt (mit Begründung)

- **Hero-H1 nur „Berechnen statt schätzen.“**: Die H1 trägt stattdessen zusätzlich das Suchwort „KPI-Rechner“. Das Motto steht trotzdem prominent.
- **Zusätzliche drei SEO-Themenseiten**: Die Themenwelten Preisgestaltung, Wirtschaftlichkeit, Liquidität und Marketing existieren bereits als Aufgabenseiten (`/aufgaben/verkaufspreis-bestimmen/`, `/wirtschaftlichkeit-pruefen/`, `/liquiditaet-verstehen/`, `/werbung-bewerten/`) mit Fragen, Schritten, verlinkten Rechnern und Grenzen sowie `/lernen/welche-kennzahl/` und `/praxisfaelle/`. Weitere Seiten zum selben Thema würden um dieselbe Suchintention konkurrieren.
- **Diagramm als PNG exportieren, Ergebnis-Link teilen**: nicht umgesetzt (siehe `docs/VISUALISIERUNG.md` bzw. `docs/GROWTH.md`). Kopieren und Drucken sind vorhanden.
- **FAQ je Rechner**: Die Seiten enthalten „Typische Missverständnisse“ und „So liest du das Ergebnis“. Eine zusätzliche FAQ-Struktur würde dieselben Aussagen wiederholen.
- **Lighthouse und reale Core Web Vitals**: nicht gemessen (kein Lighthouse installiert, keine Search-Console-Daten). Bekannt: statisches HTML, größtes Skript ca. 36 KB, Startseite ca. 22 KB komprimiert, langes Caching für Build-Dateien aktiv.
