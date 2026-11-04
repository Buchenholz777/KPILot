import { frame, type Draw } from "./kit";
import { basisKosten } from "./draw-basis-kosten";
import { finanzen } from "./draw-finanzen";
import { marktKunden } from "./draw-markt-kunden";
import { TOPIC_BY_ID } from "../data/registry";

export const DRAWINGS: Record<string, Draw> = {
  ...basisKosten,
  ...finanzen,
  ...marktKunden,
};

/** Vollständiges SVG einer Illustration. */
export function illustrationSvg(id: string, detail: boolean): string {
  const draw = DRAWINGS[id];
  if (!draw) throw new Error(`Keine Illustration für ${id}`);
  return frame(draw(detail), detail, TOPIC_BY_ID[id]?.image.alt ?? id);
}

/** Stabiler lokaler Pfad. */
export const illustrationPath = (id: string, detail: boolean) =>
  `/illustrationen/${id}${detail ? "" : "-kachel"}.svg`;
