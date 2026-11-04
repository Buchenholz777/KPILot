# Veröffentlichung – Checkliste

## Fehlende Betreiberangaben (vor dem Livegang nötig)

Im Projekt ist bewusst nichts erfunden. Einzutragen in `src/pages/impressum/index.astro` und `src/pages/datenschutz/index.astro`:

- [ ] Name bzw. Firma des Betreibers
- [ ] Ladungsfähige Anschrift
- [ ] E-Mail-Adresse (optional Telefon)
- [ ] Falls zutreffend: Rechtsform, Vertretungsberechtigte, Registergericht und -nummer, USt-IdNr., inhaltlich Verantwortliche/r
- [ ] Hosting-Anbieter und dessen Datenverarbeitung (z. B. Cloudflare: Art, Speicherdauer, Rechtsgrundlage)
- [ ] Zuständige Datenschutz-Aufsichtsbehörde
- [ ] Rechtliche Prüfung beider Texte, danach den „Entwurf“-Hinweis entfernen. Die Seiten bleiben `noindex`, das ist üblich und unschädlich.
- [ ] Produktionsdomain

## Technische Schritte

- [ ] `SITE_URL=https://… npm run build`
- [ ] `npm test`, `npm run check`, `npm run check:site` ohne Fehler (Modus „Produktion“, 49 indexierbare Seiten)
- [ ] Im Pages-Projekt `kpilot` die Umgebungsvariable `SITE_URL` setzen und neu bereitstellen (Build-Befehl `npm run build`, Ausgabe `dist`)
- [ ] Domain in Cloudflare verbinden, HTTPS prüfen
- [ ] Stichprobe live: Startseite, ein Rechner, `/sitemap.xml`, `/robots.txt`, eine nicht existierende URL (muss Status 404 liefern)
- [ ] Social-Vorschau prüfen (`/og-image.png`)
- [ ] Google Search Console: Domain bestätigen, Sitemap einreichen (siehe README)

## Später ändern

- **Domain wechseln:** neu bauen mit neuer `SITE_URL` und die Sitemap in der Search Console aktualisieren.
- **URL eines Rechners ändern** (möglichst vermeiden): im Projektordner `public/_redirects` mit z. B. `/alter-pfad/ /neuer-pfad/ 301` anlegen (Cloudflare unterstützt Redirects für Static Assets; vor Einsatz in der aktuellen Doku prüfen). Danach interne Links und Sitemap prüfen (`npm run check:site`).
