import type { APIRoute, GetStaticPaths } from "astro";
import { VIDEOS, toVtt, type KpiVideo } from "../../data/videos";

/** WebVTT-Untertitel aus der zentralen Video-Konfiguration (eine Quelle für Bild, Untertitel und Transkript). */
export const getStaticPaths = (() => VIDEOS.map((v) => ({ params: { id: v.id }, props: { video: v } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(toVtt((props as { video: KpiVideo }).video), { headers: { "Content-Type": "text/vtt; charset=utf-8" } });
