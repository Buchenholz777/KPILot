// Prüft das Build-Verzeichnis (SEO-Qualitätssicherung):
// Titel, Descriptions (fehlend, doppelt, Länge), genau eine H1, robots, Canonical (Pfad und Domain),
// og:url, gültiges JSON-LD, interne Links, Sitemap (vollständig, absolut, nur indexierbare Seiten), robots.txt.
// Aufruf: npm run check:site   (nach npm run build)
// Fehler brechen ab (Exit 1); Längenhinweise sind Warnungen.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(dist);

const toUrl = (p) =>
  "/" +
  relative(dist, p)
    .split(sep)
    .join("/")
    .replace(/index\.html$/, "");
const html = files.filter((f) => f.endsWith(".html"));
const exists = (url) => {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return true;
  const p = join(dist, decodeURIComponent(clean));
  return existsSync(p) && statSync(p).isFile()
    ? true
    : existsSync(join(p, "index.html"));
};
const decode = (s) =>
  s
    ?.replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const errors = [];
const warnings = [];
const sitemap = existsSync(join(dist, "sitemap.xml"))
  ? readFileSync(join(dist, "sitemap.xml"), "utf8")
  : "";
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => m[1],
);
const sitemapUrls = sitemapLocs.map((u) => new URL(u).pathname);
const preview = sitemapUrls.length === 0;
const origin = preview ? undefined : new URL(sitemapLocs[0]).origin;
let indexable = 0;
const titles = new Map();
const descs = new Map();

for (const f of html) {
  const url = toUrl(f);
  const s = readFileSync(f, "utf8");
  const get = (re) => s.match(re)?.[1];
  const title = decode(get(/<title>([^<]*)<\/title>/));
  const desc = decode(get(/<meta name="description" content="([^"]*)"/));
  const robots = get(/<meta name="robots" content="([^"]*)"/);
  const canonical = get(/<link rel="canonical" href="([^"]*)"/);
  const ogUrl = get(/<meta property="og:url" content="([^"]*)"/);
  const h1 = (s.match(/<h1[\s>]/g) ?? []).length;
  if (!title) errors.push(`${url}: kein <title>`);
  if (!desc) errors.push(`${url}: keine Meta Description`);
  if (!s.includes('<html lang="de"')) errors.push(`${url}: lang="de" fehlt`);
  if (h1 !== 1) errors.push(`${url}: ${h1} h1-Überschriften`);
  if (!robots) errors.push(`${url}: kein robots-Meta`);
  if (/<meta name="keywords"/i.test(s))
    errors.push(`${url}: Meta-Keywords-Tag (wird nicht genutzt)`);

  // Gültiges JSON-LD mit @context/@type
  for (const m of s.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    try {
      const j = JSON.parse(m[1]);
      if (j["@context"] !== "https://schema.org" || !j["@type"])
        errors.push(`${url}: JSON-LD ohne @context/@type`);
      if (j["@type"] === "FAQPage")
        errors.push(`${url}: FAQPage-Auszeichnung (bewusst nicht verwendet)`);
      if (/aggregateRating|review/i.test(m[1]))
        errors.push(`${url}: Bewertungen im JSON-LD`);
      for (const u of JSON.stringify(j).match(/https?:\/\/[^"]+/g) ?? [])
        if (
          origin &&
          u.startsWith("http") &&
          !u.startsWith(origin) &&
          !u.startsWith("https://schema.org")
        )
          errors.push(`${url}: JSON-LD verweist auf fremde Domain ${u}`);
    } catch {
      errors.push(`${url}: ungültiges JSON-LD`);
    }
  }

  const noindex = robots?.includes("noindex");
  if (!noindex) {
    indexable++;
    if (title) titles.set(title, [...(titles.get(title) ?? []), url]);
    if (desc) descs.set(desc, [...(descs.get(desc) ?? []), url]);
    if (title && (title.length < 30 || title.length > 65))
      warnings.push(`${url}: Titel hat ${title.length} Zeichen`);
    if (desc && (desc.length < 110 || desc.length > 165))
      warnings.push(`${url}: Description hat ${desc.length} Zeichen`);
    if (!canonical) errors.push(`${url}: indexierbar, aber ohne Canonical`);
    else {
      const c = new URL(canonical);
      if (c.pathname !== url && url !== "/404.html")
        errors.push(`${url}: Canonical zeigt auf ${canonical}`);
      if (origin && c.origin !== origin)
        errors.push(`${url}: Canonical-Domain ${c.origin} ≠ ${origin}`);
      if (!c.pathname.endsWith("/"))
        errors.push(`${url}: Canonical ohne abschließenden Schrägstrich`);
      if (ogUrl !== canonical) errors.push(`${url}: og:url ≠ Canonical`);
    }
    if (!sitemapUrls.includes(url))
      errors.push(`${url}: indexierbar, fehlt in der Sitemap`);
  } else if (sitemapUrls.includes(url))
    errors.push(`${url}: noindex, steht aber in der Sitemap`);
  if (preview && !noindex)
    errors.push(`${url}: Vorschaumodus, aber nicht noindex`);
  for (const m of s.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (u.startsWith("/") && !u.startsWith("//") && !exists(u))
      errors.push(`${url}: toter interner Link ${u}`);
    if (origin && u.startsWith(origin) && !exists(u.slice(origin.length)))
      errors.push(`${url}: toter absoluter Link ${u}`);
  }
}
for (const [t, urls] of titles)
  if (urls.length > 1)
    errors.push(`Doppelter Titel „${t}“: ${urls.join(", ")}`);
for (const [d, urls] of descs)
  if (urls.length > 1)
    errors.push(
      `Doppelte Description „${d.slice(0, 60)}…“: ${urls.join(", ")}`,
    );
for (const u of sitemapUrls)
  if (!exists(u)) errors.push(`Sitemap: ${u} existiert nicht`);
for (const u of sitemapLocs)
  if (!/^https:\/\//.test(u))
    errors.push(`Sitemap: keine absolute HTTPS-URL ${u}`);
if (new Set(sitemapUrls).size !== sitemapUrls.length)
  errors.push("Sitemap: doppelte Einträge");

const robotsTxt = existsSync(join(dist, "robots.txt"))
  ? readFileSync(join(dist, "robots.txt"), "utf8")
  : "";
if (!robotsTxt) errors.push("robots.txt fehlt");
if (/Disallow:\s*\/\s*$/m.test(robotsTxt))
  errors.push("robots.txt sperrt die gesamte Website");
if (!preview && !robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`))
  errors.push("robots.txt nennt die Sitemap nicht");

console.log(
  `${html.length} HTML-Seiten geprüft · ${indexable} indexierbar · Sitemap: ${sitemapUrls.length} URLs · Modus: ${preview ? "Vorschau (noindex)" : `Produktion (${origin})`}`,
);
if (warnings.length)
  console.warn(`Hinweise (${warnings.length}):\n  ` + warnings.join("\n  "));
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} Problem(e) gefunden.`);
  process.exit(1);
}
console.log("Keine Probleme gefunden.");
