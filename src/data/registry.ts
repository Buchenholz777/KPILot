import type { Topic, CategoryId } from "./types";
import { prozentTopics } from "./topics/prozent";
import { kostenTopics } from "./topics/kosten";
import { finanzenTopics } from "./topics/finanzen";
import { marketingTopics } from "./topics/marketing";
import { produktTopics, controllingTopics } from "./topics/produkt-controlling";

/** Zentrales Rechnerverzeichnis – Reihenfolge = Registerreihenfolge 01–40. */
export const TOPICS: Topic[] = [
  ...prozentTopics,
  ...kostenTopics,
  ...finanzenTopics,
  ...marketingTopics,
  ...produktTopics,
  ...controllingTopics,
];

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
);

export const topicsInCategory = (c: CategoryId) =>
  TOPICS.filter((t) => t.category === c);

export const topicUrl = (t: Topic | string) =>
  `/${typeof t === "string" ? TOPIC_BY_ID[t].slug : t.slug}/`;

/** Name für Überschriften: „Break-even“, „Kapitalrendite (ROI)“. */
export const displayTitle = (t: Topic) =>
  t.abbr && !t.title.includes(t.abbr) ? `${t.title} (${t.abbr})` : t.title;
