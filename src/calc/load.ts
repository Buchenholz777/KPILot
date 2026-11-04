import type { CalcDef } from "./types";

/** Lädt im Browser nur das Rechenmodul der aktuellen Seite (eigener Chunk je Rechner). */
const loaders = import.meta.glob<{ default: CalcDef }>("./modules/*.ts");

export async function loadCalc(id: string): Promise<CalcDef> {
  const l = loaders[`./modules/${id}.ts`];
  if (!l) throw new Error(`Unbekannter Rechner: ${id}`);
  return (await l()).default;
}
