import type { APIRoute } from "astro";

/**
 * Crawling bleibt erlaubt, damit Suchmaschinen das noindex der Vorschau sehen.
 * Die Indexsteuerung erfolgt über <meta name="robots"> auf jeder Seite.
 */
export const GET: APIRoute = ({ site }) => {
  const lines = ["User-agent: *", "Allow: /"];
  if (site) lines.push("", `Sitemap: ${new URL("/sitemap.xml", site).href}`);
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
