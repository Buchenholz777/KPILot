/**
 * Build-Hilfen für die Erklärvideos (nur serverseitig in .astro-Frontmatter verwenden).
 * Ein Video gilt nur als verfügbar, wenn Web-Datei und Vorschaubild tatsächlich unter public/ liegen –
 * so erscheinen Karte, Kachel und VideoObject nie für nicht gerenderte Videos.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { VIDEOS, videoSrc, posterSrc, videoForCalc, type KpiVideo } from "../data/videos";

const inPublic = (p: string) => existsSync(join(process.cwd(), "public", p));

export const isAvailable = (v: KpiVideo) => inPublic(videoSrc(v)) && inPublic(posterSrc(v));
export const availableVideos = () => VIDEOS.filter(isAvailable);
export const availableVideoForCalc = (calcId: string) => {
  const v = videoForCalc(calcId);
  return v && isAvailable(v) ? v : undefined;
};

/** Transkript als Absätze (Erzähltext ohne Titel- und Abschlusszeile zusammengefasst). */
export const transcript = (v: KpiVideo) => v.cues.map((c) => c.text);
