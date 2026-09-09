# ML training — real, honestly-reported (session log)

This directory holds the actual training scripts for the 4 ML tasks the app's
UI claims to support (layout prediction, component recommendation, visual
style, UI understanding). It exists because `MODEL_AUDIT_FINDINGS.md`
established that the pre-existing model outputs elsewhere in this repo were
fabricated — no real data, no real training, no real evaluation. Everything
in this directory is the opposite: real RICO dataset input, a real
scikit-learn model, a real grouped train/test split, and results reported
with their limitations intact rather than smoothed over.

Status: 4 planned models, 3 attempted so far. Being done session-by-session
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

## Model 2 of 4: Component recommendation — PARTIAL, documented below

**Script:** `rico_component_recommendation.py`
**Data:** same 20,000-screen real RICO sample used for model 1.

### What it does

Real task: given an empty slot in a real layout — its parent, position among
siblings, size/shape, and ancestor context — predict which category of
widget belongs there. This mirrors the actual product use case (recommend a
component *before* its content exists), which matters because it's what
keeps this task from being trivial or tautological.

1. Labels come from RICO's real `class` field (actual Android widget class
   names from real rendered apps), collapsed into 9 buckets by deterministic
   string matching (`text`, `image`, `button`, `icon_button`, `input`,
   `toggle`, `container`, `scroll_container`, `other`). This is real ground
   truth, not a derived heuristic — stronger footing than model 1, which had
   to fall back to weak/proxy labels because RICO has no layout-type field.
2. Features deliberately **exclude the node's own text, clickable state, and
   content-desc** — a recommender doesn't know the content of a slot it
   hasn't filled yet, and including those would make the task near-trivial
   (e.g. "has text" → almost certainly a TextView). Features used: parent
   and grandparent widget-bucket, size/position ratios relative to the
   parent, tree depth, sibling index/count, and parent's
   clickable/scrollable flags.
3. Split grouped by real Android package name, same leakage-avoidance
   approach as model 1.

### Real run — 20,000 screens

```
Total node samples: 957,595
Label distribution: container 401,613 / other 183,499 / text 182,440 /
  image 110,158 / button 24,787 / scroll_container 22,904 /
  icon_button 19,111 / toggle 7,562 / input 5,521
Distinct apps (groups): 6,695
Train: 770,529 samples / 5,356 apps — Test: 187,066 samples / 1,339 apps
App overlap between train/test: 0

Accuracy: 0.5247
                  precision  recall  f1-score  support
          button       0.22    0.54      0.31     4873
       container       0.89    0.41      0.56    78672
     icon_button       0.32    0.63      0.42     3543
           image       0.52    0.66      0.58    21313
           input       0.04    0.73      0.07     1030
           other       0.76    0.54      0.63    36087
scroll_container       0.17    0.83      0.28     4380
            text       0.65    0.62      0.64    35519
          toggle       0.21    0.48      0.29     1649
macro avg F1: 0.42   weighted avg F1: 0.57

Majority-class baseline ('container' always): 0.4206
```

**Honest read:** 52.47% vs. a 42.06% majority baseline is a real,
above-baseline lift on a genuinely hard 9-class task — recommending a
component type from layout structure alone, with no shortcut through the
node's own content, is not an easy problem, and the model does show real
signal (macro recall 0.61 across classes). But it is not a strong or
production-ready result: `class_weight="balanced"` pulled recall up for rare
classes at a real precision cost — `input` in particular has 0.73 recall but
only 0.04 precision, meaning the model over-predicts "input" far more than
is correct, and its 5,521-sample share (0.6% of all nodes) is genuinely thin
for a 9-way task with 957K total samples. This is a first honest pass, not a
finished model.

**Not done:** not wired into `MLPredictionEngine`. No hyperparameter tuning
or feature-importance analysis has been done — the 52% ceiling has not been
probed to see if it moves with more features or more data.

## Model 3 of 4: Visual style — PARTIAL, documented below

**Script:** `rico_visual_style.py`
**Data:** 4,000 real RICO screenshots (`combined/<id>.jpg`, streamed out of
the 6GB archive for the same screen IDs already sampled for models 1–2) +
`app_details.csv`'s real Play Store `Category` field, joined by real
package name.

### What it does

Real task: predict a screen's Play Store app category from its screenshot's
visual appearance alone — color, brightness, saturation, contrast, edge
density. Category is genuinely independent, real-world ground truth (not
derived from the pixels being classified), so unlike model 1 there's no
tautology risk to design around here.

1. Labels: real `Category` field from `app_details.csv`, joined via each
   screen's real package name. Categories with under 60 real samples are
   bucketed into `other` (disclosed, not hidden — see the printed raw vs.
   final distribution).
2. Features: computed directly from the real JPGs — per-channel RGB
   mean/std, mean/std saturation and brightness (HSV), a coarse 4×4×4 color
   histogram signature, and an edge-density proxy (mean absolute pixel
   gradient). No feature is looked up or templated.
3. Split grouped by package name — essential here specifically, since the
   label is an app-level property; an ungrouped split would let the same
   app's other screens leak the answer directly.

### Real run — 4,000 screenshots (3,755 with a matched category)

```
20 classes after bucketing (Entertainment 303 ... Comics 74)
Train: 3,037 samples / 2,175 apps — Test: 718 samples / 544 apps
App overlap between train/test: 0

Accuracy: 0.1630
Majority-class baseline ('Social' always): 0.0655
Uniform-random baseline (20 classes): ~0.0500

Best-performing classes: Weather (f1 0.39), News & Magazines (f1 0.40)
Worst: Comics, Medical (f1 0.00 — model never predicts them correctly)
```

**Honest read:** 16.30% vs. a 6.55% majority baseline and a ~5% uniform
random baseline is a real signal, roughly 2.5x better than always guessing
the most common category — but the absolute number is low. Predicting an
app's Play Store category from one screenshot's raw color/contrast/edge
statistics alone is a hard, lossy task: two apps in very different
categories can look visually similar, and 3,000 training samples across 20
classes (~150/class) is thin for this kind of task. A couple of categories
with visually distinctive palettes (Weather, News & Magazines) are picked up
reasonably; most are closer to noise. This is a first honest pass on a
genuinely hard problem, not a working style classifier.

**Not done:** no image-level feature learning (e.g. a small CNN) was tried —
only hand-computed pixel statistics. Not wired into `MLPredictionEngine`.
Larger image sample (more than 4,000) not yet attempted.

## Model 4 (UI understanding)

Not started yet.
