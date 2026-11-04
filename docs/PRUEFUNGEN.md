# Prüfprotokoll

## Überarbeitung KPILot (Design und Suche), 04.11.2026

**Vorher:** Screenshots von Startseite, `/rechner/` und `/cashflow-rechner/` bei 1440 px. Fehler reproduziert: Kategorie „Marketing“ aktiv, dann „Cashflow“ gesucht ergab 0 Treffer. „Cashflow-Berechnung“ ergab ebenfalls 0 Treffer.

**Automatisiert:**

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Alle Tests inkl. 27 neuer Regressionstests für Suche/Kategorien | `npm test` | 253 bestanden |
| Kontraste von 35 Farbpaaren | `npm run check:contrast` | alle erfüllen ihr Ziel (Text ≥ 4,5:1, Bedienelemente ≥ 3:1) |
| TypeScript / Astro | `npm run check` | 0 Fehler, 0 Warnungen |
| Build und Seitenprüfung | `npm run build` + `npm run check:site` | Produktion: 49 indexierbar = 49 Sitemap-URLs, keine Probleme · Vorschau: alles noindex, keine Probleme |

**Im Browser (eingebauter Browser, Dev-Server):**

1. „Marketing“ gewählt, dann „Cashflow“ getippt: Kategorie springt auf „Alle“, Cashflow wird gefunden ✔
2. „Controlling“ gewählt, dann „ROAS“ getippt: global gefunden ✔
3. „Cashflow-Berechnung“ und „  cashflow  “ getippt: Cashflow-Rechner ✔
4. Nach der Suche „Kostenrechnung & Preise“ gewählt: „Eingegrenzt auf … · 0 von 1 Treffern“, Hinweis und „In allen Kategorien suchen“, das den Suchbegriff behält ✔
5. Suche über ✕ geleert: Standardansicht mit „Alle“, Fokus im Suchfeld, kein versteckter Filter ✔
6. Kategorie ohne Suchtext: filtert wie zuvor (Controlling: 3 Rechner) ✔
7. Bestand: Favorit auf Kachel setzen und entfernen (ohne Navigation), Zustand nach Seitenwechsel, Favoriten-Seite, Variantenfavorit, „Beispiel einsetzen“ und Ergebnis (Cashflow), gespeicherte Rechnung aus der Zeit vor der Überarbeitung geöffnet (Werte erhalten) ✔
8. Layout bei 375, 768 und 1440 px angesehen. Horizontaler Überlauf per Skript auf 10 Seiten bei 320, 375 und 768 px geprüft: keiner (zwei Fehler gefunden und behoben: Rechner mit Zeilentabellen, Header bei 320 px) ✔
9. Tastatur: Fokusring im dunklen Header sichtbar, Reihenfolge Header → Suche ✔ (Stichprobe)

**Nicht geprüft:** Screenreader, echte Mobilgeräte, andere Browser als der eingebaute Chromium-Browser, Druckvorschau.

Stand: 04.11.2026. Unterschieden wird zwischen technischer Selbstprüfung und Tests mit Personen. **Nutzertests mit Personen wurden nicht durchgeführt.**

## Automatisiert (wiederholbar)

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Rechenfunktionen, Randfälle, Pflichtbeispiele aus dem Auftrag, Zahlenformat, Suche, Favoriten/Speicher (inkl. Migration, voller und fehlender Speicher), Werteübernahme, Register, Illustrationen | `npm test` | 226 Tests bestanden |
| TypeScript / Astro | `npm run check` | 0 Fehler, 0 Warnungen |
| Build | `npm run build` | 54 HTML-Seiten, 80 SVG-Illustrationen, Sitemap, robots.txt |
| Interne Links, Titel, Description, `lang="de"`, genau eine h1, Canonicals, noindex, Sitemap | `npm run check:site` | Produktion (Test-`SITE_URL`): 49 indexierbare Seiten = 49 Sitemap-URLs, keine Probleme. Vorschau: 0 indexierbar, leere Sitemap, keine Probleme |

Erwartungswerte in den Tests sind fest vorgegeben (aus dem Auftrag bzw. von Hand berechnet) und rufen nicht dieselbe Implementierung erneut auf. Geprüft wird auch: Die Mindeststückzahl erreicht das Ziel, eine Stück weniger nicht (Break-even, Zielgewinn), und Zielpreise in Cent halten die Marge ein.

## Im Browser durchgespielt (eingebauter Browser der Entwicklungsumgebung, Dev-Server)

Breiten: 375 px (Smartphone), 768 px (Tablet), 1440 px (Desktop).

1. „Gewinnschwelle“ suchen → genau ein Treffer: Break-even ✔
2. Break-even per Stern auf der Kachel favorisieren → keine Navigation, Favoritenkachel oben, Zähler im Kopf, nach Neuladen erhalten ✔
3. Prozentrechner-Modus „Prozentsatz“ als Favorit → eigene Kachel „Prozentsatz berechnen“ → öffnet direkt diesen Modus ✔
4. Kategorie „Marketing & Vertrieb“ filtern (7 Treffer) → CPC berechnen ✔
5. EBIT und Cashflow: Kurztexte und Bilder unterscheiden Ergebnis und Zahlungen; EBITDA-Bild mit Hinweis „kein Kontostand“ ✔ (inhaltliche Selbstprüfung)
6. Mehrdeutige Eingabe „2.500“ → Fehler am Feld, übrige Eingabe erhalten, altes Ergebnis entfernt; Korrektur per Tastatur, Enter rechnet ✔
7. Tastaturbedienung: Tab/Shift+Tab durch Felder, Enter zum Berechnen, Dialog „Rechnung speichern“ mit Enter, Fokus kehrt zurück ✔ (Stichprobe, keine vollständige Prüfung aller Seiten)

Außerdem geprüft: „Beispiel einsetzen“, Ergebnisdiagramm Break-even, Werteübernahme Deckungsbeitrag → Break-even (übernommene und fehlende Felder angezeigt, Fokus auf fehlendem Feld), Rechnung speichern → `/gespeichert/` → wieder öffnen (Werte und Zeitraum wiederhergestellt), Szenariovergleich A/B, Wiederherstellen von Suche und Filter in der Sitzung, keine Konsolenfehler.

## Nicht ausgeführt / Grenzen

- **Screenreader-Test** (NVDA, VoiceOver): nicht durchgeführt. ARIA-Struktur (Buttons mit `aria-pressed`, Live-Regionen, Labels, `aria-describedby`) ist umgesetzt, aber nur technisch geprüft.
- **Echte Mobilgeräte** (iOS Safari, Android Chrome, Bildschirmtastatur): nur per Viewport-Emulation getestet.
- **Andere Browser** (Firefox, Safari): nicht getestet.
- **Automatisierte Oberflächentests** (Playwright o. ä.): nicht eingerichtet. Die Bedienabläufe wurden manuell im Browser geprüft (siehe oben).
- **Druckansicht:** Druck-CSS vorhanden, Druckvorschau nicht geprüft.
- **Cloudflare-Deploy und 404-Status beim Hoster:** nicht ausgeführt (kein Konto, keine Domain). Konfiguration nach aktueller Doku vorbereitet.
- **Kontraste:** rechnerisch für die Tokens geprüft (siehe `tokens.css`), kein Prüfwerkzeug über alle Seiten.
- **Fachliche Prüfung durch Expertinnen oder Experten:** nicht erfolgt. Die Definitionen folgen den in `QUELLEN.md` genannten Quellen.

## Dokumentation neu erzeugen

`docs/FORMELN.md` und `docs/MODELLANNAHMEN.md` werden aus dem Code erzeugt. Nach Änderungen an Formeln oder Texten: `npm run docs`.
