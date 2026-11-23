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
import json, sys, wave
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

def main():
    job = json.load(sys.stdin)
    voice = PiperVoice.load(job["model"])
    cfg = job.get("config", {})
    syn = SynthesisConfig(length_scale=cfg.get("length_scale", 1.0), noise_scale=cfg.get("noise_scale", 0.5),
                          noise_w_scale=cfg.get("noise_w", 0.333), volume=cfg.get("volume", 1.0))
    idmap = voice.config.phoneme_id_map
    sr = voice.config.sample_rate

    def speak(phonemes):
        ids = voice.phonemes_to_ids(phonemes)
        a = voice.phoneme_ids_to_audio(ids, syn)
        if isinstance(a, tuple): a = a[0]
        return np.clip(a, -1, 1).astype(np.float32)

    for it in job["items"]:
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
        with wave.open(it["out"], "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes((audio * 32767).astype(np.int16).tobytes())

main()
