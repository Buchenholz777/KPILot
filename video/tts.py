"""
Lokale Sprachsynthese (Piper) mit eigener Phonemisierung.

Eingabe (JSON auf stdin):
  { "model": "<pfad.onnx>", "config": {synthesis…, pauses…}, "items": [ { "out": "x.wav", "parts": [...] } ] }
Ein Item besteht aus Teilen:
  {"text": "…"}            deutscher Text → Piper-Phonemisierung (espeak, Sprache de)
  {"ipa": "…", "punct": ""}   Wörterbucheintrag, direkt als Phoneme (Englisch eingebettet), optionale Satzzeichen danach
  {"pause": 0.3}            Stille in Sekunden
Teile ohne Pause werden zu EINEM Satz zusammengesetzt (durchgehende Satzmelodie); jede Pause beginnt einen neuen Abschnitt.
"""
import json, os, re, subprocess, sys, wave
import numpy as np
from piper import PiperVoice, SynthesisConfig

def tokenize_ipa(ipa, idmap):
    """Zerlegt eine IPA-Zeichenkette in Phonemsymbole des Modells (längste Übereinstimmung zuerst)."""
    out, i = [], 0
    keys = sorted((k for k in idmap if k.strip()), key=len, reverse=True)
    while i < len(ipa):
        if ipa[i] == " ":
            out.append(" "); i += 1; continue
        for k in keys:
            if ipa.startswith(k, i):
                out.append(k); i += len(k); break
        else:
            raise SystemExit(f"IPA-Zeichen {ipa[i]!r} (in {ipa!r}) fehlt im Phonemvorrat der Stimme")
    return out

def norm_tokens(text, aliases):
    """Kleinschreibung, Zahlen ohne Tausenderpunkt, €/% ausgeschrieben, Erkennungsformen der Fachbegriffe → §id."""
    t = text.lower().replace("€", " euro ").replace("%", " prozent ")
    t = re.sub(r"(?<=\d)\.(?=\d{3})", "", t)
    t = re.sub(r"(?<=\d)\s(?=\d{3}\b)", "", t)
    t = re.sub(r"§([a-z-]+)", lambda m: " §" + m.group(1).replace("-", "") + " ", t)
    for tid, rx in aliases:
        t = re.sub(rf"(?<![a-zäöüß§]){rx}(?![a-zäöüß])", " §" + tid.replace("-", "") + " ", t)
    t = re.sub(r"[^a-zäöüß0-9§, -]", " ", t).replace("-", " ").replace(",", " ")
    return t.split()

def edit(r, h):
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))

def main():
    job = json.load(sys.stdin)
    voice = PiperVoice.load(job["model"])
    cfg = job.get("config", {})
    syn = SynthesisConfig(length_scale=cfg.get("length_scale", 1.0), noise_scale=cfg.get("noise_scale", 0.5),
                          noise_w_scale=cfg.get("noise_w", 0.333), volume=cfg.get("volume", 1.0))
    idmap = voice.config.phoneme_id_map
    sr = voice.config.sample_rate
    cand = max(1, int(job.get("candidates", 1)))
    asr_dir = job.get("asr_model") or os.environ.get("KPILOT_ASR_MODEL")
    asr = None
    if cand > 1 and asr_dir and os.path.isdir(asr_dir):
        from faster_whisper import WhisperModel
        asr = WhisperModel(asr_dir, device="cpu", compute_type="int8", cpu_threads=4)
    aliases = [(a["id"], a["rx"]) for a in job.get("aliases", [])]

    def recognize(audio):
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-", "-f", "f32le", "-ar", "16000", "-ac", "1", "-"],
                             input=(audio * 32767).astype(np.int16).tobytes(), capture_output=True, check=True).stdout
        x = np.concatenate([np.zeros(4000, np.float32), np.frombuffer(raw, np.float32), np.zeros(4000, np.float32)])
        segs, _ = asr.transcribe(x, language="de", beam_size=5)
        return " ".join(g.text.strip() for g in segs)

    def speak(phonemes):
        ids = voice.phonemes_to_ids(phonemes)
        a = voice.phoneme_ids_to_audio(ids, syn)
        if isinstance(a, tuple): a = a[0]
        return np.clip(a, -1, 1).astype(np.float32)

    report = {}
    for it in job["items"]:
      best = None
      for attempt in range((it.get("candidates") or cand) if asr else 1):
        chunks, cur = [], []

        def flush():
            nonlocal cur
            while cur and cur[0] == " ": cur.pop(0)
            while cur and cur[-1] == " ": cur.pop()
            if cur: chunks.append(("a", speak(cur)))
            cur = []

        for part in it["parts"]:
            if "pause" in part:
                flush(); chunks.append(("s", np.zeros(int(part["pause"] * sr), np.float32)))
            elif "ipa" in part:
                if cur and cur[-1] != " ": cur.append(" ")
                cur += tokenize_ipa(part["ipa"], idmap)
                for ch in part.get("punct", ""): cur.append(ch)
            else:
                sents = voice.phonemize(part["text"])
                for k, ph in enumerate(sents):
                    if not ph: continue
                    if cur and cur[-1] != " " and ph[0] not in ",.:;!?": cur.append(" ")
                    cur += ph
        flush()
        audio = np.concatenate([c[1] for c in chunks]) if chunks else np.zeros(sr // 10, np.float32)
        if asr and it.get("expect"):
            heard = recognize(audio)
            score = edit(norm_tokens(it["expect"], aliases), norm_tokens(heard, aliases))
            if best is None or score < best[0] - 1e-9: best = (score, audio, heard)
            if score == 0: break
        else:
            best = (0.0, audio, "")
      score, audio, heard = best
      report[os.path.basename(it["out"])] = {"wer": round(score, 3), "heard": heard}
      with wave.open(it["out"], "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes((audio * 32767).astype(np.int16).tobytes())
    if job.get("report"): json.dump(report, open(job["report"], "w"), ensure_ascii=False, indent=1)

main()
