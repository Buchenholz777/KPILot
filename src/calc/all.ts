import type { CalcDef, VariantDef } from "./types";

/** Alle Rechenmodule (nur für Build und Tests – im Browser wird je Seite nur ein Modul geladen). */
const mods = import.meta.glob<{ default: CalcDef }>("./modules/*.ts", {
  eager: true,
});

export const CALCS: Record<string, CalcDef> = Object.fromEntries(
  Object.values(mods).map((m) => [m.default.id, m.default]),
);

export function getCalc(id: string): CalcDef {
  const c = CALCS[id];
  if (!c) throw new Error(`Unbekannter Rechner: ${id}`);
  return c;
}

export function getVariant(id: string, variantId?: string): VariantDef {
  const c = getCalc(id);
  const v = variantId
    ? c.variants.find((x) => x.id === variantId)
    : c.variants[0];
  if (!v) throw new Error(`Unbekannte Variante ${variantId} für ${id}`);
  return v;
}
