import type { APIRoute, GetStaticPaths } from "astro";
import { TOPICS } from "../../data/registry";
import { illustrationSvg } from "../../illustrations";

export const getStaticPaths = (() =>
  TOPICS.flatMap((t) => [
    { params: { name: t.id }, props: { id: t.id, detail: true } },
    { params: { name: `${t.id}-kachel` }, props: { id: t.id, detail: false } },
  ])) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(illustrationSvg(props.id as string, props.detail as boolean), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
