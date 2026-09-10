"""Minimal Gemini vision REST client for weak-labeling RICO screenshots.
Reads the key from the project's .env (VITE_GEMINI_API_KEY) so the real key
never has to be typed or echoed anywhere in this script or its logs."""
import base64
import json
import os
import time
import urllib.request
import urllib.error

ENV_PATH = "/Users/varshithdondamuri/ui/.env"
MODEL = "gemini-flash-latest"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def _load_key():
    with open(ENV_PATH) as f:
        for line in f:
            if line.startswith("VITE_GEMINI_API_KEY="):
                return line.strip().split("=", 1)[1]
    raise RuntimeError("VITE_GEMINI_API_KEY not found in .env")


_API_KEY = _load_key()


class QuotaExceeded(Exception):
    pass


def classify_image(image_path, prompt, max_retries=6):
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("ascii")

    body = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}},
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.0,
        },
    }
    data = json.dumps(body).encode("utf-8")
    url = f"{API_URL}?key={_API_KEY}"

    last_err = None
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        except urllib.error.HTTPError as e:
            body_txt = e.read().decode("utf-8", errors="ignore")
            if e.code == 429 and "PerDay" in body_txt:
                raise QuotaExceeded(f"Daily free-tier quota exhausted: {body_txt[:300]}")
            last_err = e
            if e.code in (429, 503):
                time.sleep(min(2 ** attempt * 1.5, 30))
                continue
            raise RuntimeError(f"HTTP {e.code}: {body_txt[:300]}")
        except Exception as e:
            last_err = e
            time.sleep(min(2 ** attempt * 1.5, 30))
    raise RuntimeError(f"Failed after {max_retries} retries: {last_err}")


if __name__ == "__main__":
    import sys
    test_dir = "rico_images"
    sample = sorted(os.listdir(test_dir))[:3]
    prompt = (
        "You are analyzing a mobile app UI screenshot. Classify its screen "
        "type into EXACTLY one of: login, onboarding, feed_list, detail_view, "
        "profile, settings, search, form_input, checkout_payment, dashboard, "
        "media_player, chat_messaging, other. "
        'Respond with strict JSON: {"screen_type": "<category>", "confidence": "high|medium|low"}'
    )
    for fname in sample:
        path = os.path.join(test_dir, fname)
        try:
            result = classify_image(path, prompt)
            print(fname, "->", result)
        except Exception as e:
            print(fname, "FAILED:", e)
