"""
Automatische Näherung an eine Hörkontrolle: Spracherkennung (faster-whisper, lokal) über erzeugte WAV-Dateien.

  python3 video/voice-eval.py <verzeichnis> <whisper-modell-ordner> [proben.json]

Gibt je Datei die erkannte Transkription aus und – wenn proben.json (Datei → Sollsatz) vorliegt – die Wortfehlerrate.
Erkennung ≠ Hören: Sie zeigt, ob ein Wort verständlich ausgesprochen wird, nicht, wie natürlich es klingt.
"""
import json, os, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

def load(path):
    """WAV → 16-kHz-Mono-Float (ffmpeg), unabhängig von der PyAV-Version."""
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)

def norm(s):
    s = s.lower().replace("€", " euro ").replace("%", " prozent ")
    return re.sub(r"[^a-zäöüß0-9 ]", " ", s).split()

def wer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))

folder, model = sys.argv[1], sys.argv[2]
refs = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
m = WhisperModel(model, device="cpu", compute_type="int8", cpu_threads=4)
res = {}
for f in sorted(os.listdir(folder)):
    if not f.endswith(".wav"): continue
    segs, _ = m.transcribe(load(os.path.join(folder, f)), language="de", beam_size=5, vad_filter=False)
    t = " ".join(s.text.strip() for s in segs)
    res[f] = {"text": t}
    if f in refs: res[f]["wer"] = round(wer(refs[f], t), 3)
    print(f"{f}: {t}" + (f"   [WER {res[f]['wer']}]" if "wer" in res[f] else ""))
if refs:
    w = [v["wer"] for v in res.values() if "wer" in v]
    print(f"\nMittlere Wortfehlerrate: {sum(w)/len(w):.3f} ({len(w)} Dateien)")
json.dump(res, open(os.path.join(folder, "erkannt.json"), "w"), ensure_ascii=False, indent=1)
