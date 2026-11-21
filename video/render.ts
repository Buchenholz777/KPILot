/**
 * Rendert KPI-Erklärvideos reproduzierbar: Szene (t → SVG) → Chromium (Playwright) → JPEG-Frames → ffmpeg (H.264).
 *
 *   node video/render.ts break-even            # Master 1080p (video/out/) + Web 720p + Poster (public/videos/)
 *   node video/render.ts all                   # alle Videos aus src/data/videos.ts
 *   node video/render.ts break-even --stills 5,12.5,30 [--out DIR]   # Einzelbilder als PNG zur Sichtprüfung
 *
 * Voraussetzungen: ffmpeg im PATH, Playwright mit Chromium (global oder lokal installiert).
 */
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEOS } from "../src/data/videos.ts";
import { FPS, W, H, RENDER, frameSvg, type VideoDef } from "./engine.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_MASTER = resolve(ROOT, "video/out");
const OUT_WEB = resolve(ROOT, "public/videos");

function loadPlaywright() {
  const req = createRequire(import.meta.url);
  try {
    return req("playwright");
  } catch {
    const globalRoot = execSync("npm root -g").toString().trim();
    return req(resolve(globalRoot, "playwright"));
  }
}

async function loadScene(id: string): Promise<VideoDef> {
  const mod = await import(`./scenes/${id}.ts`);
  return mod.video as VideoDef;
}

function run(cmd: string, args: string[], input?: (stdin: NodeJS.WritableStream) => Promise<void>) {
  return new Promise<void>((res, rej) => {
    const ps = spawn(cmd, args, { stdio: [input ? "pipe" : "ignore", "ignore", "pipe"] });
    let err = "";
    ps.stderr!.on("data", (d) => (err += d.toString()).length > 20000 && (err = err.slice(-10000)));
    ps.on("close", (code) => (code === 0 ? res() : rej(new Error(`${cmd} exit ${code}\n${err.slice(-3000)}`))));
    if (input) input(ps.stdin!).then(() => ps.stdin!.end(), rej);
  });
}

const write = (s: NodeJS.WritableStream, buf: Buffer) => new Promise<void>((r) => (s.write(buf) ? r() : s.once("drain", () => r())));

async function newPage(browser: any) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:#fff;overflow:hidden}#r{width:${W}px;height:${H}px}</style></head><body><div id="r"></div></body></html>`);
  return page;
}

async function draw(page: any, svg: string) {
  await page.evaluate((s: string) => {
    document.getElementById("r")!.innerHTML = s;
  }, svg);
}

async function stills(video: VideoDef, times: number[], outDir: string) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await newPage(browser);
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(outDir, { recursive: true });
  for (const t of times) {
    await draw(page, frameSvg(video, t));
    const file = resolve(outDir, `${video.id}-${String(t).replace(".", "_")}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(file);
  }
  await browser.close();
}

async function full(video: VideoDef) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await newPage(browser);
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(OUT_MASTER, { recursive: true });
  mkdirSync(OUT_WEB, { recursive: true });
  const master = resolve(OUT_MASTER, `${video.id}-1080.mp4`);
  const frames = Math.round(video.duration * FPS);
  const t0 = Date.now();
  // Master: 1920×1080, 30 fps, H.264 High, yuv420p, faststart
  await run(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", master],
    async (stdin) => {
      for (let i = 0; i < frames; i++) {
        await draw(page, frameSvg(video, i / FPS));
        const buf: Buffer = await page.screenshot({ type: "jpeg", quality: 95, clip: { x: 0, y: 0, width: W, height: H } });
        await write(stdin, buf);
        if (i % 300 === 0) console.log(`${video.id}: Frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      }
    },
  );
  // Poster (aus der Szene, nicht aus dem komprimierten Video)
  const def = VIDEOS.find((v) => v.id === video.id)!;
  RENDER.narration = false; // Vorschaubild ohne Erzählband
  await draw(page, frameSvg(video, def.posterTime));
  RENDER.narration = true;
  const posterPng = resolve(OUT_MASTER, `${video.id}-poster.png`);
  await page.screenshot({ path: posterPng, clip: { x: 0, y: 0, width: W, height: H } });
  await browser.close();
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", posterPng, "-vf", "scale=1280:720:flags=lanczos", "-q:v", "4", resolve(OUT_WEB, `${video.id}-poster.jpg`)]);
  // Web: 1280×720, stärker komprimiert, ohne Tonspur
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", master, "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", "27", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", resolve(OUT_WEB, `${video.id}-720.mp4`)]);
  console.log(`${video.id}: fertig in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

const [, , which, ...rest] = process.argv;
if (!which) {
  console.error("Aufruf: node video/render.ts <id|all> [--stills t1,t2] [--out DIR]");
  process.exit(1);
}
const ids = which === "all" ? VIDEOS.map((v) => v.id) : which.split(",");
const si = rest.indexOf("--stills");
const oi = rest.indexOf("--out");
for (const id of ids) {
  if (!existsSync(resolve(ROOT, `video/scenes/${id}.ts`))) throw new Error(`Keine Szene für ${id}`);
  const v = await loadScene(id);
  if (si >= 0) await stills(v, rest[si + 1].split(",").map(Number), oi >= 0 ? resolve(rest[oi + 1]) : resolve(OUT_MASTER, "stills"));
  else await full(v);
}
