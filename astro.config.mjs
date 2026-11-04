// @ts-check
import { defineConfig } from "astro/config";

/** Produktionsdomain der Website. */
const PRODUCTION_URL = "https://www.my-kpilot.de";

/**
 * Domain für Canonicals, Sitemap und Indexierung:
 * 1. Umgebungsvariable SITE_URL, falls gesetzt (z. B. SITE_URL=https://… npm run build)
 * 2. sonst PRODUCTION_URL beim Cloudflare-Pages-Build des Branches main
 * 3. sonst Vorschaumodus: alle Seiten noindex, keine Canonicals, leere Sitemap
 *    (lokale Builds und Cloudflare-Vorschau-Branches)
 */
const siteUrl =
  process.env.SITE_URL?.trim() ||
  (process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH === "main"
    ? PRODUCTION_URL
    : undefined);

export default defineConfig({
  site: siteUrl,
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
