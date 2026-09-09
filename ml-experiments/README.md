# ML training — real, honestly-reported (session log)

This directory holds the actual training scripts for the 4 ML tasks the app's
UI claims to support (layout prediction, component recommendation, visual
style, UI understanding). It exists because `MODEL_AUDIT_FINDINGS.md`
established that the pre-existing model outputs elsewhere in this repo were
fabricated — no real data, no real training, no real evaluation. Everything
in this directory is the opposite: real RICO dataset input, a real
scikit-learn model, a real grouped train/test split, and results reported
with their limitations intact rather than smoothed over.

Status: 4 planned models, 1 attempted so far. Being done session-by-session
per explicit user direction — this is not meant to look "finished."

## Model 1 of 4: Layout-type prediction — PARTIAL, documented below

**Script:** `rico_layout_baseline.py`
**Data:** real RICO view-hierarchy JSON, sampled from the dataset's 66,261
screens (not included in this repo — see Data section below).

### What it does

1. Parses each screen's real Android view-hierarchy tree.
2. Descends through single-child wrapper layers to the actual content node.
3. Derives a **weak/proxy label** (`sidebar`, `grid`, `two_column`,
   `centered`, `list`, `irregular`) from that node's real child bounding
   boxes, via a deterministic geometric heuristic — see `derive_label()`.
   This is NOT human-annotated ground truth; RICO doesn't ship a layout-type
   label. It's a legitimate weak-supervision technique, but every number
   below has to be read with that caveat attached.
4. Extracts 7 features that are structurally independent of the label rule
   (tree depth, total node count, distinct widget-class count, clickable
   count, leaf count, direct-child count, aspect ratio) — deliberately
   excluding the per-child x/y positions and width/height ratios the label
   rule itself reads, so the model can't just reconstruct its own label.
5. Splits train/test **grouped by real Android package name** (parsed from
   each screen's `activity_name`), so no app appears in both splits — this
   directly avoids the positional/non-grouped leakage the original audit
   found elsewhere in this codebase.
6. Trains a `RandomForestClassifier` and reports accuracy, a full
   classification report, a confusion matrix, and a majority-class baseline
   for honest comparison.

### Two real runs, in order

**Run 1 — 6,000 screens, first feature set.**
Accuracy 99.65%. This number was **not trustworthy**: the feature set
included per-child x/y positions and width/height ratios — the exact inputs
`derive_label()` uses — so the model was substantially reconstructing its
own label rather than learning anything. Flagged to the user rather than
reported as a result.

**Run 2 — 20,000 screens, independent feature set (current script state).**
```
Labeled samples: 14,160
Label distribution: {'irregular': 9781, 'list': 4373, 'sidebar': 4, 'centered': 1, 'grid': 1}
Distinct apps (groups): 4,893
Train: 11,457 samples / 3,914 apps — Test: 2,703 samples / 979 apps
App overlap between train/test: 0

Accuracy: 0.9745
              precision  recall  f1-score  support
   irregular       0.99    0.97      0.98     1793
        list       0.95    0.98      0.96      910

Majority-class baseline ('irregular' always): 0.6633
```

**What genuinely improved:** removing label-overlapping features dropped
accuracy from 99.65% to 97.45% — a *good* sign, since it means the tautology
is gone. 97.45% vs. a 66.33% majority baseline on a leak-free, grouped split
is a real, non-trivial result.

**What did NOT improve — still open:** the label heuristic under-triggers on
4 of the 6 classes (`sidebar`=4, `centered`=1, `grid`=1 examples out of
14,160). In practice this script currently validates as a 2-class
(`irregular` vs. `list`) classifier, not the 6-way layout typer originally
scoped. Two honest paths forward, not yet chosen:
  (a) redesign the labeling heuristic (current thresholds are too narrow for
      real-world RICO layouts) or hand-label a small validation set to check
      it against, or
  (b) accept the 2-class result as "model 1, first honest pass, partial" and
      move on to model 2, returning to fix class coverage later.

**Not done:** this model is not wired into `MLPredictionEngine` — that class
still throws its original stub. Wiring a real trained model back in is a
separate integration decision, not yet made.

## Data

RICO screens are read from a local extraction of
`data set layer/datset/rico/unique_uis.tar.gz` (6.0GB, not committed here).
To reproduce: extract a random sample of `combined/<id>.json` files from
that archive into a `rico_raw/combined/` (or similarly named) directory and
run `python3 rico_layout_baseline.py <path-to-that-directory>`.

## Models 2–4 (component recommendation, visual style, UI understanding)

Not started yet.
