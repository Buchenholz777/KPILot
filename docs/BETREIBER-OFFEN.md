# Offene Betreiberangaben (Impressum, Datenschutz, Kontakt)

Stand der Überarbeitung: 05.11.2026. Alle Angaben stehen zentral in [`src/config/operator.ts`](../src/config/operator.ts); jede Angabe hat ein eigenes Flag `confirmed`. Die Seiten zeigen unbestätigte Angaben sichtbar als „nicht bestätigt“ und listen offene Punkte automatisch. **Sobald alle Pflichtangaben `confirmed: true` haben, verschwindet der Hinweis „in Vorbereitung“ von selbst.** Es wurde nichts erfunden: Name und Anschrift stammen aus dem bisherigen Entwurf (eckige Klammern), der Hosting-Eintrag aus der Projektkonfiguration (`wrangler.jsonc`) – beides ist nicht als geprüft markiert.

## Vom Betreiber zu liefern oder zu bestätigen

| # | Angabe | Warum | Wo eintragen |
|---|---|---|---|
| 1 | Vollständiger Name bzw. Firma, Anschrift (Straße, PLZ/Ort, Land) bestätigen | Bisher nur Entwurfswerte | `OPERATOR.name/street/city/country` |
| 2 | E-Mail-Adresse bestätigen (Impressum, Datenschutz, Rückmeldung je Rechner) | Der Rückmeldelink nutzt diese Adresse; ohne Bestätigung ist sie nur der Entwurfskontakt | `OPERATOR.email` |
| 3 | Telefonnummer – nur falls veröffentlicht werden soll | optional | `OPERATOR.phone` |
| 4 | Rechtsform, Register, USt-IdNr. – oder Bestätigung „nicht zutreffend“ | Pflichtangaben je nach Betreiber | `OPERATOR.legalForm/register/vatId` (`confirmed: true` + leer = nicht zutreffend) |
| 5 | Tatsächlicher Hosting-Anbieter und dessen Angaben zu Art/Dauer der Verbindungsdaten | Projekt ist für Cloudflare Pages konfiguriert; der tatsächliche Anbieter ist nicht belegt | `OPERATOR.hostingProvider/hostingDetails` |
| 6 | Eingestellte Speicherdauer in der Google-Analytics-Property | Muss in den Datenschutzhinweisen stehen | `OPERATOR.analyticsRetention` |
| 7 | Grundlage der Datenübermittlung an Google in die USA | Im Entwurf offen; nicht erfunden | `OPERATOR.analyticsTransferBasis` |
| 8 | Zuständige Datenschutz-Aufsichtsbehörde | Hängt vom bestätigten Sitz ab | `OPERATOR.supervisoryAuthority` |
| 9 | Bestätigung, dass Impressum und Datenschutzhinweise rechtlich geprüft wurden | Es wird kein Fertigstellungsstatus vorgegeben | `OPERATOR.legalReview` |

## Technisch bereits erledigt (verifiziert im Code und im Browser)

- Google Analytics 4 wird nur nach Zustimmung geladen; vorher keine Anfrage an Google (Browserprüfung `scripts/e2e-smoke.mjs`).
- Auch bei Ablehnung bleiben alle Rechner vollständig nutzbar; Widerruf löscht `_ga*`-Cookies und lädt neu.
- Seitenaufruf wird ohne Adressfragment und ohne Parameter gesendet; Google-Signale und personalisierte Werbung sind ausgeschaltet.
- Ereignisse enthalten nur Rechner-, Modus- oder Aufgabenkennung (siehe `docs/MESSKONZEPT.md`); Rechenwerte, Suchtexte, Namen, Notizen und importierte Inhalte werden nicht übertragen.
- Über-Seite, Footer, Cookie-Hinweis und Datenschutzhinweise beschreiben dasselbe Verhalten.
