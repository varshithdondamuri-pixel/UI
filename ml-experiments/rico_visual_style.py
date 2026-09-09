"""
Real visual-style baseline, built from real RICO screenshots + real Play
Store metadata.

Task: predict a real screen's Play Store app category from its screenshot's
visual appearance alone (color, brightness, saturation, contrast, edge
density) — a genuine visual-style classification task.

Honesty notes:
- Labels come from `app_details.csv`'s real `Category` field, joined to each
  screen via its real package name (parsed from `activity_name` in the
  screen's own JSON). This is independent, real-world ground truth — not
  derived from the pixels being classified, so there is no tautology risk
  here the way there was for the layout-prediction model.
- Features are computed directly from the real screenshot JPGs (not
  templated, not looked up from a table): mean/std of each RGB channel,
  mean saturation and brightness (HSV), a coarse color-histogram signature,
  and an edge-density proxy (mean absolute gradient magnitude).
- Categories with too few real samples to train/evaluate meaningfully are
  bucketed into "other" (see MIN_CATEGORY_COUNT) — this is disclosed, not
  hidden, and the resulting label distribution is printed in full.
- Split is grouped by package name. This matters even more here than for
  the other two models: since the label is an app-level property, an
  ungrouped split would let the same app's screens leak the answer across
  train/test trivially.
- One real, reproducible run (fixed seed) over the sample described by the
  run's own printed sample size.
"""
import csv
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
CSV_PATH = sys.argv[3] if len(sys.argv) > 3 else "/Users/varshithdondamuri/ui/data set layer/datset/rico/app_details.csv"
MIN_CATEGORY_COUNT = 60
SEED = 42
random.seed(SEED)
np.random.seed(SEED)


def load_category_map(csv_path):
    cat_map = {}
    with open(csv_path) as f:
        for row in csv.DictReader(f):
            cat_map[row["App Package Name"]] = row["Category"]
    return cat_map


def rgb_to_hsv_np(arr):
    arr = arr.astype(np.float32) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    maxc = np.max(arr, axis=-1)
    minc = np.min(arr, axis=-1)
    v = maxc
    delta = maxc - minc
    s = np.where(maxc == 0, 0, delta / np.where(maxc == 0, 1, maxc))
    return s, v


def extract_visual_features(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((128, 228))  # fixed small size, preserves rough aspect
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

    # Coarse 4x4x4 color histogram signature (normalized), captures palette
    # shape without being a per-pixel memorization of any single image.
    hist, _ = np.histogramdd(
        arr.reshape(-1, 3), bins=(4, 4, 4), range=((0, 255), (0, 255), (0, 255))
    )
    hist = hist / hist.sum()
    hist_feats = hist.flatten().tolist()

    return [
        mean_r, mean_g, mean_b, std_r, std_g, std_b,
        mean_sat, std_sat, mean_val, std_val, edge_density,
    ] + hist_feats


def main():
    cat_map = load_category_map(CSV_PATH)
    files = sorted(f for f in os.listdir(IMG_DIR) if f.endswith(".jpg"))
    print(f"Found {len(files)} extracted RICO screenshots in {IMG_DIR}")

    raw_labels, raw_groups, raw_feats = [], [], []
    skipped_no_category = 0
    skipped_error = 0

    for fname in files:
        sid = fname.replace(".jpg", "")
        jpath = os.path.join(JSON_DIR, f"{sid}.json")
        if not os.path.exists(jpath):
            continue
        try:
            data = json.load(open(jpath))
        except Exception:
            skipped_error += 1
            continue
        activity_name = data.get("activity_name", "")
        pkg = activity_name.split("/")[0] if activity_name else None
        category = cat_map.get(pkg)
        if not category:
            skipped_no_category += 1
            continue
        try:
            feats = extract_visual_features(os.path.join(IMG_DIR, fname))
        except Exception:
            skipped_error += 1
            continue
        raw_feats.append(feats)
        raw_labels.append(category)
        raw_groups.append(pkg)

    print(f"Screens skipped (no category match): {skipped_no_category}")
    print(f"Screens skipped (parse/image error): {skipped_error}")
    print(f"Screens with real category label + real visual features: {len(raw_feats)}")

    counts = Counter(raw_labels)
    print(f"Raw category distribution ({len(counts)} categories): {dict(counts.most_common())}")

    labels = [lbl if counts[lbl] >= MIN_CATEGORY_COUNT else "other" for lbl in raw_labels]
    final_counts = Counter(labels)
    print(f"\nAfter bucketing categories with < {MIN_CATEGORY_COUNT} samples into 'other':")
    print(f"Final label distribution ({len(final_counts)} classes): {dict(final_counts.most_common())}")

    X = np.array(raw_feats)
    y = np.array(labels)
    groups = np.array(raw_groups)

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED)
    train_idx, test_idx = next(splitter.split(X, y, groups))
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    train_apps = set(groups[train_idx])
    test_apps = set(groups[test_idx])
    overlap = train_apps & test_apps
    print(f"\nTrain samples: {len(X_train)} ({len(train_apps)} apps)")
    print(f"Test samples: {len(X_test)} ({len(test_apps)} apps)")
    print(f"App overlap between train/test (must be 0): {len(overlap)}")

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
    print(f"Number of classes: {len(final_counts)} — a uniform-random baseline would be ~{1/len(final_counts):.4f}")


if __name__ == "__main__":
    main()
