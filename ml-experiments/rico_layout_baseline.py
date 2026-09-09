"""
Real layout-prediction baseline, built from real RICO view-hierarchy data.

Honesty notes (read before trusting any number this script prints):
- Labels are NOT human-annotated ground truth. RICO does not ship a
  "layout type" label. Labels here are derived by a deterministic geometric
  heuristic (see `derive_label`) applied to each screen's own real bounding
  boxes. This is a legitimate weak-supervision / proxy-labeling approach,
  but it is a heuristic, not authoritative ground truth, and must be
  described as such wherever these results are reported.
- The train/test split is grouped by Android package name (parsed from each
  screen's real `activity_name`), so no app appears in both splits. This
  directly avoids the positional/non-grouped leakage the original audit
  found in this codebase's other splits.
- All metrics below come from one real, reproducible run (fixed seed) over
  the sample described in the run's own printed sample size. Nothing here
  is templated or duplicated from another file.
"""
import json
import os
import random
import sys
from collections import Counter, defaultdict

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit

RAW_DIR = sys.argv[1] if len(sys.argv) > 1 else "rico_raw/combined"
SEED = 42
random.seed(SEED)
np.random.seed(SEED)


def real_children(node):
    """RICO's `children` arrays sometimes contain literal `null` entries
    (pruned/invisible nodes) — filter those out everywhere."""
    return [c for c in (node.get("children") or []) if c]


def find_content_node(root):
    """Descend through single-child wrapper nodes to the first node whose own
    children are the actual content to classify (avoids the common RICO
    pattern of several near-identical full-bounds wrapper layers)."""
    node = root
    depth = 0
    while len(real_children(node)) == 1 and depth < 6:
        node = real_children(node)[0]
        depth += 1
    return node


def count_leaves(node):
    children = real_children(node)
    if not children:
        return 1
    return sum(count_leaves(c) for c in children)


def tree_stats(node, depth=0):
    """Independent structural signal from the FULL subtree — not derived from
    the direct-children geometry the label rule uses, so the model has to
    learn something beyond re-deriving its own label."""
    children = real_children(node)
    class_names = set()
    ancestors = node.get("ancestors") or []
    if ancestors:
        class_names.add(ancestors[0])
    max_depth = depth
    total_nodes = 1
    clickable_count = 1 if node.get("clickable") else 0
    for c in children:
        cd, cc, cn, ccl = tree_stats(c, depth + 1)
        max_depth = max(max_depth, cd)
        total_nodes += cc
        class_names |= cn
        clickable_count += ccl
    return max_depth, total_nodes, class_names, clickable_count


def derive_label(content_node):
    """Deterministic geometric heuristic — see module docstring."""
    children = real_children(content_node)
    pb = content_node.get("bounds")
    if not pb or len(children) < 2:
        return None  # not enough structure to classify meaningfully
    px0, py0, px1, py1 = pb
    pw, ph = px1 - px0, py1 - py0
    if pw <= 0 or ph <= 0:
        return None

    boxes = []
    for c in children:
        b = c.get("bounds")
        if not b:
            continue
        x0, y0, x1, y1 = b
        w, h = x1 - x0, y1 - y0
        if w <= 0 or h <= 0:
            continue
        boxes.append((x0, y0, x1, y1, w, h))
    if len(boxes) < 2:
        return None

    width_ratios = [w / pw for *_junk, w, h in boxes]
    height_ratios = [h / ph for *_junk, w, h in boxes]
    x_starts = sorted(set(round(x0 / pw, 2) for x0, *_ in boxes))
    y_starts = sorted(set(round(y0 / ph, 2) for _x0, y0, *_ in boxes))

    # Sidebar: one child much narrower + tall, flush to an edge; rest fill the remainder.
    narrow = [b for b in boxes if b[4] / pw < 0.4 and b[5] / ph > 0.5]
    if narrow:
        nx0 = narrow[0][0]
        if nx0 - px0 < pw * 0.05 or (px1 - narrow[0][2]) < pw * 0.05:
            return "sidebar"

    # Grid: multiple distinct x_starts AND multiple distinct y_starts, children roughly uniform size.
    if len(x_starts) >= 2 and len(y_starts) >= 2 and len(boxes) >= 4:
        if np.std(width_ratios) < 0.25:
            return "grid"

    # Two-column: exactly 2 x_starts, single row, widths near half each.
    if len(x_starts) == 2 and len(y_starts) <= 3 and all(0.25 < w < 0.75 for w in width_ratios):
        return "two_column"

    # Centered: single dominant child with margin on all sides.
    if len(boxes) <= 3:
        biggest = max(boxes, key=lambda b: b[4] * b[5])
        x0, y0, x1, y1, w, h = biggest
        if (x0 - px0) > pw * 0.05 and (px1 - x1) > pw * 0.05 and w / pw < 0.9:
            return "centered"

    # Stack/list: single x_start (full-width-ish children), stacked vertically.
    if len(x_starts) == 1 and len(y_starts) == len(boxes) and np.mean(width_ratios) > 0.6:
        return "list"

    return "irregular"


FEATURE_NAMES = [
    "num_direct_children",  # coarse count only — NOT the x/y arrangement derive_label uses
    "content_aspect_ratio",
    "max_tree_depth",
    "total_node_count",
    "distinct_widget_class_count",
    "clickable_node_count",
    "leaf_node_count",
]


def extract_features(content_node, root):
    """Deliberately independent of derive_label's inputs: no per-child x/y
    positions, no width/height ratios, no x_start/y_start counts. Those are
    exactly what the label rule reads, so including them here would let the
    model partially reconstruct its own label instead of learning something
    a real predictor would have to."""
    children = real_children(content_node)
    pb = content_node["bounds"]
    px0, py0, px1, py1 = pb
    pw, ph = max(1, px1 - px0), max(1, py1 - py0)

    max_depth, total_nodes, class_names, clickable_count = tree_stats(root)
    leaf_count = count_leaves(root)

    return [
        len(children),
        pw / ph,
        max_depth,
        total_nodes,
        len(class_names),
        clickable_count,
        leaf_count,
    ]


def main():
    files = sorted(f for f in os.listdir(RAW_DIR) if f.endswith(".json"))
    print(f"Found {len(files)} extracted RICO screens in {RAW_DIR}")

    X, y, groups = [], [], []
    label_counts = Counter()
    skipped_no_label = 0
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

        content = find_content_node(root)
        label = derive_label(content)
        if label is None:
            skipped_no_label += 1
            continue

        feats = extract_features(content, root)

        X.append(feats)
        y.append(label)
        groups.append(package)
        label_counts[label] += 1

    print(f"Parse errors skipped: {skipped_parse_error}")
    print(f"No confident geometric label (skipped): {skipped_no_label}")
    print(f"Labeled samples: {len(X)}")
    print(f"Label distribution: {dict(label_counts)}")
    print(f"Distinct apps (groups): {len(set(groups))}")

    X = np.array(X)
    y = np.array(y)
    groups = np.array(groups)

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

    clf = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=SEED, class_weight="balanced")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n=== REAL TEST RESULTS (n={len(X_test)}, grouped split, seed={SEED}) ===")
    print(f"Accuracy: {acc:.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("Confusion matrix (rows=true, cols=pred), labels order:", sorted(set(y_test) | set(y_pred)))
    print(confusion_matrix(y_test, y_pred, labels=sorted(set(y_test) | set(y_pred))))

    # Majority-class baseline for honest comparison.
    majority_label = Counter(y_train).most_common(1)[0][0]
    majority_acc = accuracy_score(y_test, [majority_label] * len(y_test))
    print(f"\nMajority-class baseline accuracy (predicting '{majority_label}' always): {majority_acc:.4f}")


if __name__ == "__main__":
    main()
