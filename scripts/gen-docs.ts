// Erzeugt docs/FORMELN.md und docs/MODELLANNAHMEN.md aus Register und Rechenmodulen.
// Aufruf: npm run docs
import { it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { TOPICS, topicUrl, displayTitle } from "../src/data/registry";
import { CATEGORY_BY_ID } from "../src/data/categories";
import { CALCS } from "../src/calc/all";
import { runExample } from "../src/calc/engine";
import { formatValue } from "../src/lib/number";

it("erzeugt docs/FORMELN.md und docs/MODELLANNAHMEN.md", () => {
  mkdirSync("docs", { recursive: true });
  let f =
    "# Formeldokumentation – alle 40 Themen\n\n> Automatisch erzeugt mit `npm run docs` aus `src/data/topics/*` und `src/calc/modules/*`.\n\n";
  let a =
    "# Modellannahmen und verwendete Definitionen\n\n> Automatisch erzeugt mit `npm run docs`. Allgemeine Regeln: `README.md` → „Zahlen und Rundung“.\n\n";
  TOPICS.forEach((t, i) => {
    const c = CALCS[t.id];
    f += `## ${String(i + 1).padStart(2, "0")}. ${displayTitle(t)}\n\n`;
    f += `- ID: \`${t.id}\` · URL: \`${topicUrl(t)}\` · Kategorie: ${CATEGORY_BY_ID[t.category].title}\n`;
    f += `- Varianten: ${c.variants.map((v) => `\`${v.id}\` (${v.label})`).join(", ")}\n\n`;
    f += t.formula.map((x) => `    ${x}`).join("\n") + "\n\n";
    f += t.variables.map(([k, v]) => `- **${k}**: ${v}`).join("\n") + "\n\n";
    for (const v of c.variants) {
      const r = runExample(v);
      if (r.status === "ok")
        f += `Beispiel${c.variants.length > 1 ? ` (${v.label})` : ""}: ${r.steps.join(" → ")} ⇒ **${r.main.label}: ${formatValue(r.main.value, r.main.format, r.main.unit, r.main.signed)}**\n\n`;
    }
    a += `## ${displayTitle(t)}\n\n${t.assumptions.map((x) => `- ${x}`).join("\n")}\n\n**Typische Missverständnisse**\n\n${t.misconceptions.map((x) => `- ${x}`).join("\n")}\n\n`;
  });
  writeFileSync("docs/FORMELN.md", f);
  writeFileSync("docs/MODELLANNAHMEN.md", a);
});
