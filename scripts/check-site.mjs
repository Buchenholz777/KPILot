// Prüft das Build-Verzeichnis: interne Links, Metadaten, Canonicals, Indexierung, Sitemap.
// Aufruf: npm run check:site   (nach npm run build)
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

const errors = [];
const sitemap = existsSync(join(dist, "sitemap.xml"))
  ? readFileSync(join(dist, "sitemap.xml"), "utf8")
  : "";
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => new URL(m[1]).pathname,
);
const preview = sitemapUrls.length === 0;
let indexable = 0;

for (const f of html) {
  const url = toUrl(f);
  const s = readFileSync(f, "utf8");
  const get = (re) => s.match(re)?.[1];
  const title = get(/<title>([^<]*)<\/title>/);
  const desc = get(/<meta name="description" content="([^"]*)"/);
  const robots = get(/<meta name="robots" content="([^"]*)"/);
  const canonical = get(/<link rel="canonical" href="([^"]*)"/);
  const h1 = (s.match(/<h1[\s>]/g) ?? []).length;
  if (!title) errors.push(`${url}: kein <title>`);
  if (!desc) errors.push(`${url}: keine Meta Description`);
  if (!s.includes('<html lang="de"')) errors.push(`${url}: lang="de" fehlt`);
  if (h1 !== 1) errors.push(`${url}: ${h1} h1-Überschriften`);
  if (!robots) errors.push(`${url}: kein robots-Meta`);
  const noindex = robots?.includes("noindex");
  if (!noindex) {
    indexable++;
    if (!canonical) errors.push(`${url}: indexierbar, aber ohne Canonical`);
    else if (new URL(canonical).pathname !== url && url !== "/404.html")
      errors.push(`${url}: Canonical zeigt auf ${canonical}`);
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
  }
}
for (const u of sitemapUrls)
  if (!exists(u)) errors.push(`Sitemap: ${u} existiert nicht`);

console.log(
  `${html.length} HTML-Seiten geprüft · ${indexable} indexierbar · Sitemap: ${sitemapUrls.length} URLs · Modus: ${preview ? "Vorschau (noindex)" : "Produktion"}`,
);
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} Problem(e) gefunden.`);
  process.exit(1);
}
console.log("Keine Probleme gefunden.");
