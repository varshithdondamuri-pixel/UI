"""
Real component-recommendation baseline, built from real RICO view-hierarchy data.

Task: given a slot in a real UI layout (its parent, position among siblings,
size/shape, and ancestor context) — but NOT the node's own text, clickable
state, or content-desc — predict which category of widget a designer/model
should recommend for that slot. This mirrors the actual product use case:
recommending a component BEFORE its content exists, not classifying an
already-filled-in node.

Honesty notes:
- Labels come from RICO's real `class` field (actual Android widget class
  names from real rendered apps) collapsed into 8 buckets by deterministic
  string matching (see `bucket_class`). This is real ground truth, not a
  heuristic proxy — stronger footing than the layout-prediction model, which
  had to fall back to weak/proxy labels because RICO has no layout-type field.
- Features deliberately EXCLUDE the node's own text/clickable/content-desc,
  because a recommender doesn't know the content of a slot it hasn't filled
  yet. Including those would make the task near-trivial (e.g. "has text" ->
  almost certainly TextView) and would not reflect the real recommendation
  use case.
- Train/test split is grouped by real Android package name, so no app
  appears in both splits, avoiding the leakage the original audit found in
  this codebase's other splits.
- One real, reproducible run (fixed seed) over the sample described by the
  run's own printed sample size.
"""
import json
import os
import random
import sys
from collections import Counter

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit

RAW_DIR = sys.argv[1] if len(sys.argv) > 1 else "rico_raw2/combined"
MAX_SCREENS = int(sys.argv[2]) if len(sys.argv) > 2 else 20000
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


def collect_samples(root):
    """Walk the tree; for every node with real bounds and a parent, emit one
    (features, label, ) sample using only parent/sibling/ancestor context."""
    samples = []

    def walk(node, parent, depth, sibling_index, sibling_count):
        bounds = node.get("bounds")
        pbounds = parent.get("bounds") if parent else None
        if bounds and pbounds and parent is not None:
            x0, y0, x1, y1 = bounds
            w, h = x1 - x0, y1 - y0
            px0, py0, px1, py1 = pbounds
            pw, ph = max(1, px1 - px0), max(1, py1 - py0)
            if w > 0 and h > 0:
                label = bucket_class(node.get("class"))
                parent_bucket = bucket_class(parent.get("class"))
                grandparent = node.get("_grandparent")
                gp_bucket = bucket_class(grandparent.get("class")) if grandparent else "none"
                feats = {
                    "width_ratio": w / pw,
                    "height_ratio": h / ph,
                    "aspect_ratio": w / max(1, h),
                    "x_ratio": (x0 - px0) / pw,
                    "y_ratio": (y0 - py0) / ph,
                    "depth": depth,
                    "sibling_index": sibling_index,
                    "sibling_count": sibling_count,
                    "parent_clickable": 1 if parent.get("clickable") else 0,
                    "parent_scrollable": 1 if (parent.get("scrollable-vertical") or parent.get("scrollable-horizontal")) else 0,
                    "parent_bucket": parent_bucket,
                    "grandparent_bucket": gp_bucket,
                }
                samples.append((feats, label))

        children = real_children(node)
        node["_grandparent"] = parent
        for i, c in enumerate(children):
            walk(c, node, depth + 1, i, len(children))

    walk(root, None, 0, 0, 1)
    return samples


CATEGORICAL = ["parent_bucket", "grandparent_bucket"]
NUMERIC = [
    "width_ratio", "height_ratio", "aspect_ratio", "x_ratio", "y_ratio",
    "depth", "sibling_index", "sibling_count", "parent_clickable", "parent_scrollable",
]


def vectorize(feats_list, cat_vocab):
    rows = []
    for feats in feats_list:
        row = [feats[k] for k in NUMERIC]
        for cat_field in CATEGORICAL:
            val = feats[cat_field]
            onehot = [1.0 if val == v else 0.0 for v in cat_vocab[cat_field]]
            row.extend(onehot)
        rows.append(row)
    return np.array(rows)


def main():
    files = sorted(f for f in os.listdir(RAW_DIR) if f.endswith(".json"))[:MAX_SCREENS]
    print(f"Found {len(files)} extracted RICO screens in {RAW_DIR} (using up to {MAX_SCREENS})")

    all_feats, all_labels, all_groups = [], [], []
    skipped_parse_error = 0

    for fname in files:
        path = os.path.join(RAW_DIR, fname)
        try:
            with open(path, "r") as f:
                data = json.load(f)
        except Exception:
            skipped_parse_error += 1
            continue

        activity_name = data.get("activity_name", "")
        package = activity_name.split("/")[0] if activity_name else fname

        root = (data.get("activity") or {}).get("root")
        if not root:
            skipped_parse_error += 1
            continue

        samples = collect_samples(root)
        for feats, label in samples:
            all_feats.append(feats)
            all_labels.append(label)
            all_groups.append(package)

    print(f"Parse errors skipped (screens): {skipped_parse_error}")
    print(f"Total node samples: {len(all_feats)}")
    label_counts = Counter(all_labels)
    print(f"Label distribution: {dict(label_counts.most_common())}")

    # Build categorical vocab from top-N most common values (avoids exploding
    # one-hot width from rare/garbage class strings).
    cat_vocab = {}
    for cat_field in CATEGORICAL:
        vals = Counter(f[cat_field] for f in all_feats)
        cat_vocab[cat_field] = [v for v, _ in vals.most_common(8)]

    X = vectorize(all_feats, cat_vocab)
    y = np.array(all_labels)
    groups = np.array(all_groups)

    print(f"\nDistinct apps (groups): {len(set(groups))}")

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED)
    train_idx, test_idx = next(splitter.split(X, y, groups))
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    train_apps = set(groups[train_idx])
    test_apps = set(groups[test_idx])
    overlap = train_apps & test_apps
    print(f"Train samples: {len(X_train)} ({len(train_apps)} apps)")
    print(f"Test samples: {len(X_test)} ({len(test_apps)} apps)")
    print(f"App overlap between train/test (must be 0): {len(overlap)}")

    clf = RandomForestClassifier(n_estimators=200, max_depth=14, random_state=SEED, class_weight="balanced", n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n=== REAL TEST RESULTS (n={len(X_test)}, grouped split, seed={SEED}) ===")
    print(f"Accuracy: {acc:.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    labels_sorted = sorted(set(y_test) | set(y_pred))
    print("Confusion matrix (rows=true, cols=pred), labels order:", labels_sorted)
    print(confusion_matrix(y_test, y_pred, labels=labels_sorted))

    majority_label = Counter(y_train).most_common(1)[0][0]
    majority_acc = accuracy_score(y_test, [majority_label] * len(y_test))
    print(f"\nMajority-class baseline accuracy (predicting '{majority_label}' always): {majority_acc:.4f}")


if __name__ == "__main__":
    main()
