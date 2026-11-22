"""Lokale Sprachsynthese für die Erklärvideos (Piper, läuft offline, kein Cloud-Dienst).

Liest JSON von stdin: {"model": "...onnx", "length_scale": 1.0, "items": [{"text": "...", "out": "...wav"}]}
und schreibt pro Eintrag eine WAV-Datei. Aufruf erfolgt aus video/voice.ts.
Voraussetzung: pip install piper-tts (Version 1.x) und eine Piper-Stimme, siehe docs/VIDEOS.md.
"""

import json
import sys
import wave

from piper import PiperVoice, SynthesisConfig


def main() -> None:
    job = json.load(sys.stdin)
    voice = PiperVoice.load(job["model"])
    cfg = SynthesisConfig(length_scale=job.get("length_scale", 1.0), noise_scale=0.5, noise_w_scale=0.333)
    for item in job["items"]:
        with wave.open(item["out"], "wb") as wav:
            voice.synthesize_wav(item["text"], wav, syn_config=cfg)
    print(f"{len(job['items'])} Sätze synthetisiert", file=sys.stderr)


if __name__ == "__main__":
    main()
