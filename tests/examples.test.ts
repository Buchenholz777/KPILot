import { describe, expect, it } from "vitest";
import { CALCS } from "../src/calc/all";
import { runExample } from "../src/calc/engine";

describe("Beispieldaten aller Rechner", () => {
  it("es gibt genau 40 Rechner", () =>
    expect(Object.keys(CALCS)).toHaveLength(40));
  for (const c of Object.values(CALCS)) {
    for (const v of c.variants) {
      it(`${c.id}/${v.id}: Beispiel ist vollständig und berechenbar`, () => {
        const r = runExample(v);
        expect(r.status).toBe("ok");
      });
    }
  }
});
