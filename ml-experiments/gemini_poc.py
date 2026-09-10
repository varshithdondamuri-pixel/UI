"""
Tiny, honest Gemini-vision proof-of-concept — NOT a trained/evaluated model.

The Gemini API key in this project is free-tier: 20 requests/day/model
(confirmed via a real 429 RESOURCE_EXHAUSTED response with
quotaId=GenerateRequestsPerDayPerProjectPerModel-FreeTier, quotaValue=20).
That is far too small a budget to label enough real training data for a
model 4 (UI understanding) or to meaningfully boost model 3 (visual style).

This script spends a small, fixed number of real calls (<=16, well under
the day's cap) to demonstrate BOTH intended uses on a handful of real RICO
screenshots, with real Gemini output, so the mechanism is proven real and
working — but the sample size is explicitly too small to train or evaluate
anything on, and this script does not attempt to.
"""
import json
import os
import sys

from gemini_client import classify_image, QuotaExceeded

IMG_DIR = "rico_images"
SCREEN_TYPE_N = 8
VISUAL_STYLE_N = 8

SCREEN_TYPE_PROMPT = (
    "You are analyzing a mobile app UI screenshot. Classify its screen type "
    "into EXACTLY one of: login, onboarding, feed_list, detail_view, "
    "profile, settings, search, form_input, checkout_payment, dashboard, "
    "media_player, chat_messaging, other. "
    'Respond with strict JSON: {"screen_type": "<category>", "confidence": "high|medium|low"}'
)

VISUAL_STYLE_PROMPT = (
    "Describe this mobile app screenshot's visual style. "
    'Respond with strict JSON: {"dominant_color": "<one word>", '
    '"density": "sparse|medium|dense", '
    '"style": "minimal|playful|corporate|dark_mode|colorful|utilitarian"}'
)


def main():
    files = sorted(os.listdir(IMG_DIR))
    screen_type_files = files[:SCREEN_TYPE_N]
    visual_style_files = files[SCREEN_TYPE_N:SCREEN_TYPE_N + VISUAL_STYLE_N]

    results = {"screen_type": [], "visual_style": []}
    calls_made = 0

    print(f"=== Demo A: screen-type labeling (model 4 use case) — {len(screen_type_files)} real images ===")
    for fname in screen_type_files:
        try:
            r = classify_image(os.path.join(IMG_DIR, fname), SCREEN_TYPE_PROMPT)
            calls_made += 1
            print(f"  {fname} -> {r}")
            results["screen_type"].append({"file": fname, **r})
        except QuotaExceeded as e:
            print(f"  STOPPED: daily quota hit after {calls_made} real calls. {e}")
            break
        except Exception as e:
            print(f"  {fname} FAILED: {e}")

    print(f"\n=== Demo B: visual-style descriptor labeling (model 3 boost use case) — {len(visual_style_files)} real images ===")
    for fname in visual_style_files:
        try:
            r = classify_image(os.path.join(IMG_DIR, fname), VISUAL_STYLE_PROMPT)
            calls_made += 1
            print(f"  {fname} -> {r}")
            results["visual_style"].append({"file": fname, **r})
        except QuotaExceeded as e:
            print(f"  STOPPED: daily quota hit after {calls_made} real calls. {e}")
            break
        except Exception as e:
            print(f"  {fname} FAILED: {e}")

    print(f"\nTotal real API calls made: {calls_made}")
    with open("gemini_poc_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Saved raw results to gemini_poc_results.json")


if __name__ == "__main__":
    main()
