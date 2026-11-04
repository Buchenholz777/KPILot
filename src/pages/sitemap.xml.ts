import type { APIRoute } from "astro";
import { TOPICS, topicUrl } from "../data/registry";
import { CATEGORIES } from "../data/categories";

/** Nur indexierbare, kanonische Inhaltsseiten. Im Vorschaumodus (ohne SITE_URL) leer. */
export const GET: APIRoute = ({ site }) => {
  const paths = [
    "/",
    "/rechner/",
    "/ueber/",
    ...CATEGORIES.map((c) => `/kategorie/${c.slug}/`),
    ...TOPICS.map((t) => topicUrl(t)),
  ];
  const urls = site
    ? paths
        .map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`)
        .join("\n")
    : "";
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n${site ? "" : "<!-- Vorschaumodus: SITE_URL ist nicht gesetzt, daher keine Einträge. -->\n"}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
