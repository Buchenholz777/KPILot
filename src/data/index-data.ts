import { TOPICS, topicUrl, displayTitle } from "./registry";
import { CATEGORY_BY_ID } from "./categories";
import { CALCS } from "../calc/all";
import type { SearchEntry } from "../lib/search";

/** Suchindex über den vollständigen Katalog (nur Texte, keine Zahlen). */
export function buildSearchIndex(): SearchEntry[] {
  return TOPICS.map((t) => ({
    id: t.id,
    category: t.category,
    t: [t.title, t.abbr ?? "", t.fullTerm ?? ""].join(" "),
    s: [
      ...t.synonyms,
      t.question,
      t.short,
      CATEGORY_BY_ID[t.category].title,
      ...CALCS[t.id].variants.map((v) => v.label),
    ].join(" · "),
  }));
}

/** Alle gültigen Favoriten-IDs: Rechner sowie „rechner#variante“ bei mehreren Varianten. */
export function favoriteIds(): string[] {
  return TOPICS.flatMap((t) => {
    const c = CALCS[t.id];
    return [
      t.id,
      ...(c.variants.length > 1
        ? c.variants.map((v) => `${t.id}#${v.id}`)
        : []),
    ];
  });
}

/** Titel und Link aller Rechner – für die kompakte Favoritenleiste im Browser. */
export function topicMeta(): Record<string, { title: string; href: string }> {
  return Object.fromEntries(
    TOPICS.map((t) => [t.id, { title: displayTitle(t), href: topicUrl(t) }]),
  );
}

/** Metadaten für Variantenfavoriten (Titel und Link) – für die Favoritenansicht im Browser. */
export function variantMeta(): Record<
  string,
  { title: string; href: string; parent: string }
> {
  const out: Record<string, { title: string; href: string; parent: string }> =
    {};
  for (const t of TOPICS) {
    const c = CALCS[t.id];
    if (c.variants.length < 2) continue;
    for (const v of c.variants)
      out[`${t.id}#${v.id}`] = {
        title: v.favLabel,
        href: `${topicUrl(t)}#${v.id}`,
        parent: displayTitle(t),
      };
  }
  return out;
}
