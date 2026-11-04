import { describe, expect, it } from "vitest";
import { TOPICS } from "../src/data/registry";
import { DRAWINGS, illustrationSvg } from "../src/illustrations";
import { CALCS } from "../src/calc/all";
import { runExample } from "../src/calc/engine";
import { formatDecimal } from "../src/lib/number";

describe("Erklärillustrationen", () => {
  it("jedes der 40 Themen hat eine eigene Zeichnung", () => {
    for (const t of TOPICS) expect(DRAWINGS[t.id], t.id).toBeTypeOf("function");
    expect(Object.keys(DRAWINGS)).toHaveLength(40);
  });
  for (const t of TOPICS) {
    it(`${t.id}: Detailbild zeigt das Ergebnis des Beispiels und ist als Beispiel gekennzeichnet`, () => {
      const svg = illustrationSvg(t.id, true);
      const tile = illustrationSvg(t.id, false);
      expect(svg).toContain("Beispiel");
      expect(tile).toContain("Beispiel");
      expect(svg.length).toBeGreaterThan(tile.length);
      const r = runExample(CALCS[t.id].variants[0]);
      if (r.status !== "ok") throw new Error(t.id);
      const shown = formatDecimal(r.main.value.abs(), { max: 2 });
      expect(svg, `${t.id}: ${shown}`).toContain(shown);
      expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    });
  }
});
