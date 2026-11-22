/**
 * Prüft die gerenderten Erklärvideos mit ffprobe gegen die zentrale Konfiguration (src/data/videos.ts):
 * Datei vorhanden, H.264 High, yuv420p, 1280×720 (Web) bzw. 1920×1080 (Master, falls vorhanden), 30 fps,
 * Dauer = Konfiguration (±0,1 s), genau eine Tonspur (AAC, mono, 48 kHz, Erklärstimme, nicht still), faststart (moov vor mdat), Größe, Vorschaubild 1280×720.
 *   node scripts/check-videos.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { VIDEOS } from "../src/data/videos.ts";

const probe = (file) => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);

/** faststart: das „moov“-Atom liegt vor „mdat“ (Wiedergabe beginnt ohne vollständigen Download). */
function moovFirst(file) {
  const fd = openSync(file, "r");
  const buf = Buffer.alloc(64 * 1024);
  readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  const moov = buf.indexOf("moov"), mdat = buf.indexOf("mdat");
  return moov >= 0 && (mdat < 0 || moov < mdat);
}

function checkVideo(id, file, w, h, duration, maxMB) {
  if (!existsSync(file)) return void fail(id, `${file} fehlt`);
  const info = probe(file);
  const v = info.streams.filter((s) => s.codec_type === "video");
  const a = info.streams.filter((s) => s.codec_type === "audio");
  if (v.length !== 1) return void fail(id, `${file}: ${v.length} Videospuren`);
  const s = v[0];
  if (s.codec_name !== "h264") fail(id, `${file}: Codec ${s.codec_name}`);
  if (s.pix_fmt !== "yuv420p") fail(id, `${file}: Pixelformat ${s.pix_fmt}`);
  if (s.width !== w || s.height !== h) fail(id, `${file}: ${s.width}×${s.height} statt ${w}×${h}`);
  if (s.r_frame_rate !== "30/1") fail(id, `${file}: ${s.r_frame_rate} fps`);
  const d = Number(info.format.duration);
  if (Math.abs(d - duration) > 0.1) fail(id, `${file}: Dauer ${d} s statt ${duration} s`);
  if (a.length !== 1) fail(id, `${file}: ${a.length} Tonspuren statt 1 (Erklärstimme fehlt? node video/voice.ts ${id})`);
  else {
    if (a[0].codec_name !== "aac") fail(id, `${file}: Audio-Codec ${a[0].codec_name}`);
    if (Math.abs(Number(a[0].duration) - duration) > 0.15) fail(id, `${file}: Tonspur ${a[0].duration} s statt ${duration} s`);
    const vd = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-map", "0:a:0", "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr;
    const mean = Number(/mean_volume: (-?[\d.]+) dB/.exec(vd)?.[1] ?? -99);
    if (mean < -35) fail(id, `${file}: Tonspur fast still (${mean} dB)`);
  }
  if (!moovFirst(file)) fail(id, `${file}: nicht für Streaming optimiert (faststart)`);
  const mb = statSync(file).size / 1e6;
  if (mb > maxMB) fail(id, `${file}: ${mb.toFixed(1)} MB > ${maxMB} MB`);
  return { mb, d };
}

for (const v of VIDEOS) {
  const web = checkVideo(v.id, `public/videos/${v.id}-720.mp4`, 1280, 720, v.duration, 4);
  const poster = `public/videos/${v.id}-poster.jpg`;
  if (!existsSync(poster)) fail(v.id, "Vorschaubild fehlt");
  else {
    const p = probe(poster).streams[0];
    if (p.width !== 1280 || p.height !== 720) fail(v.id, `Vorschaubild ${p.width}×${p.height}`);
    if (statSync(poster).size > 200_000) fail(v.id, "Vorschaubild > 200 kB");
  }
  const master = `video/out/${v.id}-1080.mp4`;
  if (existsSync(master)) checkVideo(v.id, master, 1920, 1080, v.duration, 30);
  if (web) console.log(`✓ ${v.id}: ${web.d.toFixed(1)} s, ${web.mb.toFixed(2)} MB (Web 720p)${existsSync(master) ? " + Master 1080p" : ""}`);
}

if (errors.length) {
  console.error(`\n${errors.length} Problem(e):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("\nAlle Videos entsprechen der Konfiguration.");
