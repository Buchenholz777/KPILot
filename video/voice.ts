/**
 * Erzählstimme für die KPI-Erklärvideos: Cue-Texte → Sprechtext → Piper (lokal, offline) → Tonspur → MP4.
 *
 *   node video/voice.ts break-even        # Tonspur erzeugen und in Master (video/out/) + Web (public/videos/) einsetzen
 *   node video/voice.ts all
 *
 * Jeder Cue wird einzeln gesprochen und an seiner Startzeit platziert (planVoice: kurzer Verzug erlaubt, höchstens
 * 12 % schneller; sonst bricht das Skript ab, damit der Text gekürzt wird). Das Bild wird nicht neu kodiert (-c:v copy).
 *
 * Voraussetzungen: ffmpeg, python3 mit piper-tts, Stimme de_DE-thorsten-medium (CC0, siehe docs/VIDEOS.md), Pfad per
 * KPILOT_VOICE oder unter video/voices/.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEOS, type KpiVideo } from "../src/data/videos.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const VOICE_MODEL = process.env.KPILOT_VOICE ?? resolve(ROOT, "video/voices/de_DE-thorsten-medium.onnx");
/** Höchste Beschleunigung eines Satzes (1,12 = 12 % schneller); darüber klingt die Stimme gehetzt. */
const MAX_TEMPO = 1.12;
/** Sprechbeginn nach Cue-Start, Atempause zwischen zwei Sätzen, größter Verzug hinter dem Bild (Ausnahme), Ruhe am Ende (s). */
const LEAD = 0.1;
const GAP = 0.3;
const MAX_LAG = 2;
/** Ziel: höchstens 1 s hinter dem Bild, dafür bis zu 8 % schneller sprechen. */
const SOFT_LAG = 1;
const SOFT_TEMPO = 1.08;
const END_PAD = 0.4;

/** Ordinalzahlen, die die Stimme sonst als Kardinalzahl plus Satzende liest. */
const ORDINALS: [RegExp, string][] = [
  [/\bdem 150\. /g, "dem hundertfünfzigsten "],
  [/\bdas 151\. /g, "das hunderteinundfünfzigste "],
  [/\b1\. Grades\b/g, "ersten Grades"],
  [/\b2\. Grades\b/g, "zweiten Grades"],
  [/\b3\. Grades\b/g, "dritten Grades"],
];

/** Englische Fachbegriffe als deutsche Lautumschrift (die Stimme ist deutsch). Reihenfolge: lange Formen zuerst. */
const TERMS: [RegExp, string][] = [
  [/Break-even/g, "Bräjk-iewen"],
  [/Cashflow/g, "Käschfloh"],
  [/Conversion[- ]Rate/g, "Konwörschen-Räjt"],
  [/\bROI\b/g, "Er-O-I"],
  [/\bCAC\b/g, "Zeh-A-Zeh"],
];

/** Wandelt einen Cue-Text (wie im Bild/Untertitel) in den Sprechtext für die Synthese um. */
export function speechText(text: string): string {
  let s = text;
  for (const [re, rep] of ORDINALS) s = s.replace(re, rep);
  for (const [re, rep] of TERMS) s = s.replace(re, rep);
  // Gedankenstrich als kurze Pause, Nachkommastellen bleiben („16,7“ → „sechzehn Komma sieben“).
  return s.replace(/\s+–\s+/g, ", ").replace(/ /g, " ");
}

function sh(cmd: string, args: string[], input?: string) {
  const r = spawnSync(cmd, args, { input, encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 4).join(" ")} … exit ${r.status}\n${(r.stderr || "").slice(-3000)}`);
  return r.stdout;
}

const wavSeconds = (file: string) => {
  const b = readFileSync(file);
  // PCM-WAV: Byte-Rate an Offset 28, Datenlänge im data-Chunk
  const rate = b.readUInt32LE(28);
  let o = 12;
  while (o < b.length - 8) {
    const id = b.toString("ascii", o, o + 4);
    const len = b.readUInt32LE(o + 4);
    if (id === "data") return len / rate;
    o += 8 + len;
  }
  throw new Error(`Kein data-Chunk in ${file}`);
};

export interface VoicePlan {
  cue: number;
  start: number;
  seconds: number;
  tempo: number;
}

/**
 * Plant Startzeit und Tempo je Cue. Ein Satz beginnt kurz nach seinem Cue – oder, wenn der vorige Satz noch läuft,
 * nach einer kurzen Atempause, höchstens MAX_LAG Sekunden später als das Bild. So holt die Stimme einen langen Satz im
 * nächsten kürzeren wieder auf. Nur was dann noch nicht passt, wird leicht beschleunigt; zu lange Sätze werfen.
 */
export function planVoice(v: Pick<KpiVideo, "id" | "duration" | "cues">, seconds: number[]): VoicePlan[] {
  let prevEnd = 0;
  return v.cues.map((c, i) => {
    const start = Math.max(c.start + LEAD, prevEnd + GAP);
    if (start > c.start + MAX_LAG + 1e-9) throw new Error(`${v.id}, Cue ${i}: Stimme läge ${(start - c.start).toFixed(2)} s hinter dem Bild – Text kürzen`);
    const next = v.cues[i + 1];
    const soft = next ? next.start + SOFT_LAG - GAP : v.duration - END_PAD;
    const hard = next ? next.start + MAX_LAG - GAP : v.duration - END_PAD;
    // erst leicht beschleunigen, um nah am Bild zu bleiben; nur wenn das nicht reicht, mehr Verzug oder Tempo
    let tempo = Math.min(SOFT_TEMPO, Math.max(1, seconds[i] / (soft - start)));
    if (start + seconds[i] / tempo > hard) tempo = seconds[i] / (hard - start);
    if (tempo > MAX_TEMPO) throw new Error(`${v.id}, Cue ${i}: ${seconds[i].toFixed(2)} s gesprochen, Platz ${(hard - start).toFixed(2)} s – Text kürzen`);
    const t = Math.ceil(tempo * 1000) / 1000;
    prevEnd = start + seconds[i] / t;
    return { cue: i, start: Math.round(start * 1000) / 1000, seconds: seconds[i] / t, tempo: t };
  });
}

export function voiceover(v: KpiVideo) {
  if (!existsSync(VOICE_MODEL)) throw new Error(`Stimme fehlt: ${VOICE_MODEL} (siehe docs/VIDEOS.md)`);
  const dir = resolve(ROOT, "video/out/voice", v.id);
  mkdirSync(dir, { recursive: true });
  const items = v.cues.map((c, i) => ({ text: speechText(c.text), out: resolve(dir, `cue-${String(i).padStart(2, "0")}.wav`) }));
  sh("python3", [resolve(ROOT, "video/tts.py")], JSON.stringify({ model: VOICE_MODEL, length_scale: 1.0, items }));
  const plan = planVoice(v, items.map((it) => wavSeconds(it.out)));

  // Tonspur: jeden Satz an seine Startzeit legen, mischen, auf Videolänge bringen, Lautheit normalisieren (−16 LUFS).
  const track = resolve(dir, "voice.wav");
  const inputs = items.flatMap((it) => ["-i", it.out]);
  const chains = plan.map((p, i) => `[${i}:a]${p.tempo > 1 ? `atempo=${p.tempo},` : ""}adelay=${Math.round(p.start * 1000)}:all=1[a${i}]`);
  const mix = `${plan.map((_, i) => `[a${i}]`).join("")}amix=inputs=${plan.length}:normalize=0,highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad,atrim=0:${v.duration}[out]`;
  sh("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", [...chains, mix].join(";"), "-map", "[out]", "-ac", "1", "-ar", "48000", track]);

  // In Master und Web-Version einsetzen (Bild unverändert kopiert).
  const targets: [string, string][] = [
    [resolve(ROOT, "video/out", `${v.id}-1080.mp4`), "128k"],
    [resolve(ROOT, "public/videos", `${v.id}-720.mp4`), "96k"],
  ];
  for (const [file, bitrate] of targets) {
    if (!existsSync(file)) {
      console.warn(`${v.id}: ${file} fehlt – erst node video/render.ts ${v.id}`);
      continue;
    }
    const tmp = file.replace(/\.mp4$/, ".tmp.mp4");
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-i", track, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", bitrate, "-ac", "1", "-ar", "48000", "-metadata:s:a:0", "language=deu", "-t", String(v.duration), "-movflags", "+faststart", tmp]);
    renameSync(tmp, file);
  }
  const sped = plan.filter((p) => p.tempo > 1);
  console.log(`${v.id}: Tonspur eingesetzt (${plan.length} Sätze${sped.length ? `, beschleunigt: ${sped.map((p) => `#${p.cue}×${p.tempo}`).join(" ")}` : ""})`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const which = process.argv[2];
  if (!which) {
    console.error("Aufruf: node video/voice.ts <id|all|a,b>");
    process.exit(1);
  }
  const ids = which === "all" ? VIDEOS.map((v) => v.id) : which.split(",");
  for (const id of ids) {
    const v = VIDEOS.find((x) => x.id === id);
    if (!v) throw new Error(`Unbekanntes Video: ${id}`);
    voiceover(v);
  }
}
