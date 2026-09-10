"""
Real UI-understanding baseline, built from real RICO screenshots + real
view-hierarchy structure.

Task: "does this screen require text input?" — predict, from screenshot
VISUAL appearance alone (no access to the accessibility tree), whether a
screen contains at least one real text-input field (EditText / search box /
etc.). This is a genuine "look at a screen and understand what it needs"
task: complementary to model 2 (which goes structure -> widget type), this
one goes pixels -> a real structural fact about the screen.

Honesty notes:
- Label is REAL ground truth, not a heuristic: derived from RICO's own
  `class` field via the same deterministic bucketing used in model 2
  (rico_component_recommendation.py's bucket_class), checking whether any
  node in the real tree buckets to "input". This is a real fact about the
  real screen, not a proxy.
- Features are pixel statistics computed directly from the real screenshot
  JPG (color/brightness/contrast/edge-density, same extraction approach as
  model 3) — deliberately NOT given any accessibility-tree access, since
  the point is genuine visual understanding, not just re-reading the label
  source.
- Split grouped by real Android package name, consistent with models 1-3,
  to avoid the same app's screens leaking across train/test.
- One real, reproducible run (fixed seed) over the sample described by the
  run's own printed sample size.
"""
import json
import os
import random
import sys
from collections import Counter

import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit

IMG_DIR = sys.argv[1] if len(sys.argv) > 1 else "rico_images"
JSON_DIR = sys.argv[2] if len(sys.argv) > 2 else "rico_raw2/combined"
SEED = 42
random.seed(SEED)
np.random.seed(SEED)


def real_children(node):
    return [c for c in (node.get("children") or []) if c]


BUCKET_RULES = [
    ("input", ("EditText", "AutoCompleteTextView", "SearchView")),
    ("toggle", ("CheckBox", "RadioButton", "Switch", "ToggleButton")),
    ("icon_button", ("ImageButton",)),
    ("button", ("Button",)),
    ("image", ("ImageView", "IconView")),
    ("text", ("TextView",)),
    ("scroll_container", ("RecyclerView", "ListView", "GridView", "ScrollView", "ViewPager", "AdapterView")),
    ("container", ("Layout", "ViewGroup", "FrameLayout", "CardView", "ViewPager", "DecorView")),
]


def bucket_class(class_name):
    if not class_name:
        return "other"
    short = class_name.rsplit(".", 1)[-1]
    for bucket, keywords in BUCKET_RULES:
        if any(kw in short for kw in keywords):
            return bucket
    return "other"


def has_input_field(root):
    if bucket_class(root.get("class")) == "input":
        return True
    return any(has_input_field(c) for c in real_children(root))


def rgb_to_hsv_np(arr):
    arr = arr.astype(np.float32) / 255.0
    maxc = np.max(arr, axis=-1)
    minc = np.min(arr, axis=-1)
    delta = maxc - minc
    s = np.where(maxc == 0, 0, delta / np.where(maxc == 0, 1, maxc))
    return s, maxc


def extract_visual_features(img_path):
    img = Image.open(img_path).convert("RGB").resize((128, 228))
    arr = np.asarray(img)

    mean_r, mean_g, mean_b = arr[..., 0].mean(), arr[..., 1].mean(), arr[..., 2].mean()
    std_r, std_g, std_b = arr[..., 0].std(), arr[..., 1].std(), arr[..., 2].std()
    sat, val = rgb_to_hsv_np(arr)
    mean_sat, std_sat = sat.mean(), sat.std()
    mean_val, std_val = val.mean(), val.std()
    gray = arr.mean(axis=-1)
    gx = np.abs(np.diff(gray, axis=1)).mean()
    gy = np.abs(np.diff(gray, axis=0)).mean()
    edge_density = (gx + gy) / 2

    # Bottom-third-of-screen brightness/edge stats: keyboards + input bars
    # tend to sit low on real mobile screens, so this is a legitimate
    # vision-derived signal, not a label leak (still pixels only).
    h = arr.shape[0]
    bottom = arr[int(h * 0.66):, :, :]
    bottom_gray = bottom.mean(axis=-1)
    bottom_edge = np.abs(np.diff(bottom_gray, axis=1)).mean() if bottom_gray.shape[1] > 1 else 0.0
    bottom_std = bottom.std()

    hist, _ = np.histogramdd(arr.reshape(-1, 3), bins=(4, 4, 4), range=((0, 255), (0, 255), (0, 255)))
    hist = (hist / hist.sum()).flatten().tolist()

    return [
        mean_r, mean_g, mean_b, std_r, std_g, std_b,
        mean_sat, std_sat, mean_val, std_val, edge_density,
        bottom_edge, bottom_std,
    ] + hist


def main():
    files = sorted(f for f in os.listdir(IMG_DIR) if f.endswith(".jpg"))
    print(f"Found {len(files)} extracted RICO screenshots in {IMG_DIR}")

    X, y, groups = [], [], []
    skipped = 0

    for fname in files:
        sid = fname.replace(".jpg", "")
        jpath = os.path.join(JSON_DIR, f"{sid}.json")
        if not os.path.exists(jpath):
            skipped += 1
            continue
        try:
            data = json.load(open(jpath))
            root = (data.get("activity") or {}).get("root")
            if not root:
                skipped += 1
                continue
            activity_name = data.get("activity_name", "")
            pkg = activity_name.split("/")[0] if activity_name else sid
            label = "has_input" if has_input_field(root) else "no_input"
            feats = extract_visual_features(os.path.join(IMG_DIR, fname))
        except Exception:
            skipped += 1
            continue
        X.append(feats)
        y.append(label)
        groups.append(pkg)

    print(f"Skipped (missing/parse/image error): {skipped}")
    print(f"Usable samples: {len(X)}")
    print(f"Label distribution: {dict(Counter(y))}")

    X = np.array(X)
    y = np.array(y)
    groups = np.array(groups)
    print(f"Distinct apps (groups): {len(set(groups))}")

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED)
    train_idx, test_idx = next(splitter.split(X, y, groups))
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    train_apps = set(groups[train_idx])
    test_apps = set(groups[test_idx])
    print(f"\nTrain samples: {len(X_train)} ({len(train_apps)} apps)")
    print(f"Test samples: {len(X_test)} ({len(test_apps)} apps)")
    print(f"App overlap between train/test (must be 0): {len(train_apps & test_apps)}")

    clf = RandomForestClassifier(n_estimators=300, max_depth=14, random_state=SEED, class_weight="balanced", n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n=== REAL TEST RESULTS (n={len(X_test)}, grouped split, seed={SEED}) ===")
    print(f"Accuracy: {acc:.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    labels_sorted = sorted(set(y_test) | set(y_pred))
    print("Confusion matrix labels order:", labels_sorted)
    print(confusion_matrix(y_test, y_pred, labels=labels_sorted))

    majority_label = Counter(y_train).most_common(1)[0][0]
    majority_acc = accuracy_score(y_test, [majority_label] * len(y_test))
    print(f"\nMajority-class baseline accuracy (predicting '{majority_label}' always): {majority_acc:.4f}")


if __name__ == "__main__":
    main()
