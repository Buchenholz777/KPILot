// @ts-check
import { defineConfig } from "astro/config";

/**
 * Produktionsdomain zentral über die Umgebungsvariable SITE_URL setzen,
 * z. B. SITE_URL=https://www.example.de npm run build
 * Ohne SITE_URL läuft die Website im Vorschaumodus: alle Seiten noindex,
 * keine Canonicals mit erfundener Domain, Sitemap ohne Einträge.
 */
const siteUrl = process.env.SITE_URL?.trim() || undefined;

export default defineConfig({
  site: siteUrl,
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
