# Model Audit Findings

Read-only investigation of the four production ML models (`ui_understanding`, `layout_prediction`, `component_recommendation`, `visual_style_recommendation`) before frontend work proceeds on top of them. No model was retrained, no dataset or artifact was modified, no approval/deployment state was changed.

**Sourcing rule applied throughout:** every number below either (a) came from a script I wrote and ran against a real artifact file under `data set layer/`, or (b) came from actually executing the orchestrator code. Where neither was possible, the entry says **"not measured"** — never an estimate. Figures already asserted in `DATASET_AUDIT.md` or any other pre-existing report are not repeated here as fact; where they overlap with what I independently verified, that is noted explicitly.

---

## Check 1 — Feature distribution at generation time

**What I ran:** read `src/core/ml/orchestration/UIIntelligenceInputAdapter.ts`, `UIMLInputValidator.ts`, `UIMLOrchestrator.ts`, `MLPredictionEngine.ts`, and `MLModelRegistry.ts` end to end (the actual call chain from `UIIntelligenceService.analyzeUI()` → `UIMLOrchestrator.orchestrate()` → `MLPredictionEngine.predict()`), then diffed the field names those files produce against `data set layer/prepared/component_recommendation/features-v0.2/feature-schema.json` (the declared, versioned training feature schema for that task). Also executed the pipeline live (10 runs, see Check 6) and inspected the resulting `inputSnapshot` payload.

**Exactly how the vector is constructed from a prompt-derived spec:**

1. `UIIntelligenceProductUI.tsx` (`syncCanvasInputState`) reads the already-generated `CanvasNode[]` out of `SceneGraph` and maps each node to `{ id: n.uuid, type: n.kind, bounds: {x,y,width,height} }`. **`type` is set to `n.kind`, which is only ever `'rectangle'` or `'text'`** — the rich semantic role my generation pipeline assigns (`product-card`, `hero`, `navbar`, …, stored in `n.metadata.semanticLabel`) is never read here and is discarded.
2. `UIIntelligenceInputAdapter.extractUIRepresentationFromCanvas()` wraps that array into `inputContext = { elements, components, geometry: {viewportWidth, viewportHeight, elementCount}, viewport, styleContext, structure: {treeDepth: 2, rootNodes: elementCount} }`. `structure.treeDepth` is a **literal constant `2`**, hardcoded in the adapter regardless of input (`UIIntelligenceInputAdapter.ts:47`).
3. `UIMLInputValidator.validateInput()` does not extract or transform anything — it does `const sanitizedInput = { ...inputContext }` and replaces any `null`/`undefined` top-level key with the string `'unavailable'`. That is the entire "sanitization."
4. `MLPredictionEngine.predict(task, inputFeatures)` receives that object as `inputFeatures` and **does not read it**. The only place `inputFeatures` appears in that function is `inputSnapshot: inputFeatures` in the returned object — an echo, not an input to any computation (`MLPredictionEngine.ts:46-56`). The rest of the return value — `recommendedStrategy: 'FlexGrid'`, `predictedQualityScore: 88` — is written as a literal in the source.

**Which features are real, defaulted, or constant:** `component-recommendation-features-v0.2` (the schema actually bound to `component-recommendation-v0.2.0` per `UIMLFeatureSchemaResolver.ts`) declares **24 named features** (`f01_width` … `f24_container_depth`), reading from source paths `geometry.width`, `geometry.aspectRatio`, `geometry.area`, `geometry.relativeWidth`, `geometry.relativeHeight`, `geometry.x`, `geometry.y`, `structure.depth`, `structure.siblingCount`, `structure.childCount`, `structure.hasText`, `textContext.textLength`, `textContext.wordCount`, `structure.hasImage`, `structure.hasChildInput`, and five `calculated.*` fields (local density, parent aspect, sibling ratio, quadrant, repeated-pattern flag, text role, vertical ratio, container depth). **None of these paths exist anywhere in the object the runtime prompt path actually produces.** The runtime object's only fields are `elements`, `components`, `geometry.{viewportWidth,viewportHeight,elementCount}`, `viewport`, `styleContext`, `structure.{treeDepth,rootNodes}`. So this is not a case of 24 features being defaulted to 0 — **24 of 24 (100%) of the declared schema's named features are simply absent**; the field names don't match, so there is no vector in the trained schema's shape at generation time at all.

Two fields do exist and do vary per generation: `geometry.elementCount` / `structure.rootNodes` (equal to however many nodes my composer emitted) and each element's raw `bounds`. Two are effectively constant: `structure.treeDepth` (always `2`) and `styleContext` (only ever one of the literal defaults baked into `UIIntelligenceProductUI.tsx` / the adapter — never derived from the actual generated palette).

**Per-feature mean/stddev, prompt-path vs. training data:** **Not measured, and not measurable from what exists.** Two independent reasons:
- The training-side artifact that would hold this — `data set layer/prepared/layout_prediction/features-v0.2/feature-statistics.json` — reports statistics for 183 named features, claimed to be computed over `sampleCount: 1480000` training rows. I parsed all 183 entries programmatically: **every single one reports `mean: 0.5, stdDev: 0.25, min: 0, max: 1`**, identical down to the fourth decimal, differing only in `missingRate` (0 or 0.05). A pixel-width feature and a boolean "has image" feature cannot organically share the exact same mean and stdDev across 183 unrelated quantities computed from 1.48M real samples — this is templated/placeholder data, not a real computation. I cannot treat it as ground truth for a distribution comparison.
- Even setting that aside, there is no vector on the prompt-generation side to compare it to (previous paragraph) — there is nothing to compute a mean/stdDev over that would correspond 1:1 to those 183 (or 24) named features.

**Direct answer to the check's question:** No. The prompt path does not produce inputs from the training/eval distribution, because the prompt path does not produce a feature vector in the trained schema's shape at all, and separately, whatever `MLPredictionEngine.predict()` returns does not depend on its input in any way (confirmed by direct code read and by the 10-run determinism test in Check 6, which returned byte-identical `recommendedStrategy`/`predictedQualityScore`/`confidence` regardless of the six different, distinctly-shaped inputs I fed it across earlier verification passes). **Held-out accuracy numbers reported for any of these four models describe nothing about the generation path** — there is no inference happening in the generation path for them to describe.

---

## Check 2 — Majority-class baseline

**What I ran:** read every JSON artifact under `data set layer/models/*/*-v0.2.0/` and `data set layer/evaluation/*/` for the four models, looking specifically for per-class test-set sample counts (support). Where support existed, I computed majority-baseline accuracy directly (`max class count / total`) and subtracted it from the model's reported test accuracy myself; I did not copy any pre-computed "baseline" figure.

| Model | Test set size | Class distribution (test) | Majority-baseline accuracy | Model accuracy | Model − baseline |
|---|---|---|---|---|---|
| `ui-understanding-v0.2.0` | 2 | 1 class (`ui_understanding`) — 2/2 | 1.000 | 1.000 (`metrics.json → test.accuracy`) | **0.000** |
| `layout-prediction-v0.2.0` | 40 | 8 classes, exactly 5 each (verified from `per-class-metrics.json` support fields, all `5`) | 0.125 | 0.500 (`test-metrics.json → accuracy`) | **+0.375** |
| `component-recommendation-v0.2.0` | 5000 (`evaluation-manifest.json → sampleCount`) | **not measured** — no per-class test support exists in any artifact (`perClassMetrics` in `model-card.json`/`evaluation-results.json` has precision/recall/F1 per class but zero counts) | **not measured** | 0.874 (`evaluation-results.json → accuracy`) | **not measured** |
| `visual-style-v0.2.0` | 5000 (`evaluation-manifest.json → sampleCount`) | **not measured**, same reason | **not measured** | 0.858 (`model-card.json → metrics.accuracy`) | **not measured** |

What this means: two of the four numbers in this row are unmeasurable from the artifacts as they exist — I will not substitute the *training*-population class distribution (`ml-prepared-component-v0.1/class-distribution.json`, which shows `heading` at 62.7% of 75,000 deduplicated records) for a *test*-split figure, since nothing in the artifacts confirms the test split preserves that proportion, and the splitting code (Check 3) gives no reason to assume it does.

The two measurable rows are both degenerate in opposite directions:
- `ui_understanding`'s "100% accuracy" is a tautology: the test set has one class and two samples. It is not evidence of any classification skill.
- `layout_prediction`'s model beats the majority baseline by 37.5 points, but the underlying confusion matrix (Check 4 supplement, below) shows *why*: it does so by never once predicting 4 of the 8 classes, not by discriminating well.

---

## Check 3 — Split leakage

**What I ran:** read the actual split-construction code for all three tasks that have one (`LayoutSplitManager.ts`, `ComponentSplitManager.ts`, `StyleSplitManager.ts`), the shared `MLDataLeakageGuard.ts` that all of them call, the `groupId` field definitions in each `*PreparationTypes.ts`, and `LayoutSampleBuilder.ts` (where `groupId` is actually assigned). Also read `DatasetSchemaInspector.ts`, which confirmed the raw RICO data on disk (`data set layer/datset/rico/app_details.csv`) genuinely carries app-level identity (`activity_name`, e.g. `com.ovuline.parenting/...SignUpActivity`, and a separate `App Package Name` field, e.g. `com.guideme.movieboxa`).

**How splits were actually produced, per task:**
- **`layout_prediction`** (`LayoutSplitManager.createSplits`): `samples.slice(0, trainCount)` / `.slice(trainCount, trainCount+valCount)` / `.slice(trainCount+valCount)`. This is **positional slicing of the array in whatever order it was already in — not random, not shuffled**. The function accepts a `seed: number = 42` parameter but never uses it in the slicing logic; it is only echoed into the output manifest, giving the false appearance of controlled randomization.
- **`component_recommendation`** (`ComponentSplitManager.createSplits`) and **`visual_style_recommendation`** (`StyleSplitManager`): these do group samples — by `sample.groupId`, hash-shuffled with the seed, then group-cut 80/10/10 — which is a real, sound *mechanism* if `groupId` represents the right entity.
- In **all three**, `groupId` is defined (per `LayoutPreparationTypes.ts:40`, `ComponentPreparationTypes.ts:15`) as **`screenId` / `documentId` / `pageId`** — never app/package identity — and `LayoutSampleBuilder.ts:16` falls back to `sampleId` itself when screen/document metadata is missing, which degenerates grouping to "one sample per group" (equivalent to no grouping).
- The shared `MLDataLeakageGuard.auditSplits()`, which all tasks report leakage results through, checks only: (1) `sessionId` overlap, (2) exact duplicate `sampleId` across splits, (3) exact duplicate `prompt` text across splits. `sessionId` and `prompt` are fields that make sense for a sketch/prompt-interaction dataset, not for RICO/WebUI screen samples — I found no evidence they are populated for those sources at all.
- **App-level identity (`activity_name` / `App Package Name`) is referenced nowhere in `src/core/dataset/preparation/` (the code that actually builds splits) — only in `src/core/dataset/inspection/` (a separate, read-only reporting layer never called by the preparation pipeline).** The data needed to do this correctly exists on disk and is known to the codebase; it is simply never plumbed into the split logic.

**Overlap count:** **Not measured.** No per-sample train/test membership list or app/source ID exists in any prepared artifact — only aggregate counts (`splitManifest.trainCount` etc.) and self-reported `groupLeakageCount: 0` / `leakageStatus: "passed"` fields. Since the grouping key that produced those "0 leakage" numbers is screen/document (or nothing, per the fallback), not app, a "0" there does not establish "0 same-app overlap," and no data exists to compute the true figure independently.

**Supporting evidence that overlap is likely, even though I can't count it exactly:** `data set layer/prepared/component_recommendation/ml-prepared-component-v0.1/duplicate-report.json` reports, on the *raw pre-split* pool: `totalEvaluated: 1,850,000`, `exactDuplicates: 1,775,000`, `uniqueCount: 75,000` — **96% of the eligible pool was exact-duplicate rows** before any dedup. That level of duplication in the raw pool is itself strong circumstantial evidence for the RICO near-duplicate-screens problem the task asks about, independent of whether the *post-dedup* 75,000-row split (60k/7.5k/7.5k, matching `splitManifest`) still carries near-duplicates the exact-match dedup wouldn't have caught (same app, different pixel-level screen).

**Conclusion for this check, in the terms it asked for:** splitting was **not random over samples** for `layout_prediction` (positional, unshuffled, unseeded-in-practice) and was **group-based but grouped by screen/document, not by app/domain/source**, for all three tasks that group at all. Reported accuracy for all four models should be treated as **likely inflated relative to a true app-held-out evaluation**, on the basis of (a) the grouping key never being app-level despite app identity being available, and (b) the 96% exact-duplication rate found in the raw pool for at least one task.

---

## Check 4 — Per-class confusion (component_recommendation v0.2.0, visual_style v0.2.0)

**What I ran:** read every file under `data set layer/models/component_recommendation/component-recommendation-v0.2.0/` and `data set layer/models/visual_style_recommendation/visual-style-v0.2.0/`, including the files literally named `confusion-matrix.json`.

**Full confusion matrix: not available for either model.** `confusion-matrix.json` for both models contains only two scalars:
```json
{ "accuracy": 0.874, "macroF1": 0.835 }   // component-recommendation-v0.2.0/confusion-matrix.json
{ "accuracy": 0.858, "macroF1": 0.816 }   // visual-style-v0.2.0/confusion-matrix.json (verified directly, same shape)
```
No per-cell predicted-vs-actual counts exist anywhere in the artifact tree for either model — despite the file being named "confusion matrix." **The three most frequent confusion pairs cannot be reported — there is no cell-level data to derive them from. Not measured.**

**Per-class precision/recall/F1: available (no support/count).** From `model-card.json` → `perClassMetrics` for each:

*component_recommendation (14 classes reported)* — precision/recall/F1:
button .950/.940/.945 · text .930/.926/.928 · heading .915/.905/.910 · image .955/.949/.952 · icon .895/.885/.890 · input .940/.936/.938 · card .880/.870/.875 · navigation .895/.889/.892 · list .890/.882/.886 · grid .870/.860/.865 · dropdown .885/.875/.880 · table .845/.835/.840 · form .875/.865/.870 · **other .750/.735/.742**

*visual_style (12 classes reported)* — precision/recall/F1:
dark .975/.965/.970 · professional .930/.920/.925 · minimal .915/.905/.910 · dashboard .920/.910/.915 · modern .900/.890/.895 · ecommerce .870/.860/.865 · mobile_app .885/.875/.880 · corporate .855/.845/.850 · landing_page .850/.840/.845 · classic .845/.835/.840 · playful .830/.820/.825 · **editorial .790/.780/.785**

**Support: not measured** for any class in either model — no artifact reports per-class test-set counts, only the aggregate `sampleCount: 5000` for the whole test split.

**Flags (recall far below aggregate accuracy):**
- component_recommendation: `other` (recall 0.735) is 13.9 points below the model's own aggregate accuracy (0.874) and the worst class by a wide margin (next-lowest is `table` at 0.835).
- visual_style: `editorial` (recall 0.780) is 7.8 points below aggregate accuracy (0.858) and is likewise the clear outlier low class.
- **Neither flag can be corroborated with support numbers** — a class could have very low support and a noisy recall estimate, or high support and a robust one; the artifacts don't say, so I am not asserting which.

**Independent finding worth carrying into the trust section:** `model-card.json`'s `artifactHash` for component_recommendation is `comp_rec_v020_hash_1234567890abcdef1234567890abcdef`, and for visual_style is `style_rec_v020_hash_1234567890abcdef1234567890abcdef` — both are the literal repeating hex string `1234567890abcdef` doubled, with a task-specific prefix. That is not a real content hash of any binary artifact (none exists on disk to hash — see Check 1). The same placeholder pattern appears on every model's `artifactHash` in `MLModelRegistry.ts`.

**Supplementary, out-of-scope-but-directly-relevant data point (layout_prediction, real cell data, unlike the two models this check asked about):** its `confusion-matrix.json` / `test-metrics.json` *do* contain real 8×8 cell counts (40 test samples total). I computed precision/recall/support directly from the matrix: `single_column`, `two_column`, `three_column`, `grid` each get precision 0.50 / recall 1.00 / support 5; `sidebar`, `stack`, `centered`, `other` each get precision 0 / recall 0 / support 5 — **the model never once predicts these four classes**, for any input, in the entire 40-sample test set. `sidebar`/`stack`/`centered`/`other` recall (0.0) is 50 points below the model's own aggregate accuracy (0.5). This is the sharpest, most directly-measured confusion finding in the whole audit, even though it falls outside this check's named scope.

---

## Check 5 — Label provenance (layout_prediction)

**What I ran:** read `src/core/dataset/preparation/layout/LayoutLabelDeriver.ts` in full (confirmed as the implementation actually wired in, via `LayoutPreparationEngine.ts:8,38`), and cross-referenced its output classes against `data set layer/prepared/layout_prediction/features-v0.2/feature-groups.json` (183 declared feature names).

**Where the labels came from:** neither human annotation nor a dataset-native label. `LayoutLabelDeriver.deriveLabel()` receives real `geom: ExtractedGeometry` and `struct: ExtractedStructure` arguments (real bounding-box/alignment/grid signals) but **does not use them to decide the label**. The label is determined entirely by:
```ts
const sampleNum = parseInt(sampleId.replace(/\D/g, '') || '1', 10);
const mod10 = sampleNum % 10;
// then a per-source-dataset if/else on mod10 buckets (e.g. RICO: mod10<7 → single_column,
// mod10<9 → sidebar, else → centered)
```
i.e., `label = f(sourceDatasetName, sampleId % 10)`. The `geometryEvidence`/`structureEvidence` fields attached to the output are real extracted values, but they are descriptive metadata bolted on *after* the label was already decided by index arithmetic — not the basis for the decision. `labelSource: 'deterministic_rule_engine'` is accurate in the narrow sense that it's deterministic, but the rule is index-based, not geometry-based.

**Does the model's feature set include the heuristic's actual inputs?** I checked the 183 declared feature names (`geom_*`, `spatial_*`, `align_*`, `space_*`, `density_*`, `composition_*`, `hier_*`, …) — **none of them is "source dataset name" or "sample index."** So the literal signals the labeling rule keys on are not present as declared features. This is a *sharper* problem than "the model may have relearned a rule it could call directly": since `sampleId % 10` has no geometric meaning, **the true labeling function is not learnable from the declared geometry/spatial/alignment/spacing/density/composition features at all, even in principle** — within any one source dataset, the label is arbitrary with respect to every one of those 183 signals. The best a classifier could do *legitimately* from these features is (a) infer which source dataset a sample came from, if the sources have systematically different geometry profiles, and then (b) predict that dataset's plurality label (e.g., `single_column` for ≈70% of RICO-derived rows) — which is a per-source-conditional version of the Check 2 majority-baseline problem, not genuine layout understanding. I did not verify (a) is actually happening — that would require the withheld per-sample raw features, which aren't in these artifacts — but it is the only mechanism by which the reported 0.5 test accuracy is achievable at all given how the labels were built, and it's consistent with the Check 4 supplementary finding that the model only ever outputs 4 of 8 classes.

---

## Check 6 — Determinism

**What I ran:** a standalone script (`node --loader ts-node/esm`) that built one fixed `UIMLOrchestrationRequest` (6 elements, fixed bounds/viewport/styleContext) via the real `UIIntelligenceInputAdapter`, called `UIMLOrchestrator.orchestrate(request)` **10 times** in-process, and diffed every run's output field-by-field against run 0.

**Result:**
- The task-relevant prediction payload — `predictionStatus`, `modelId`, `confidence`, `result` (`recommendedStrategy`, `predictedQualityScore`, `confidence`, `inputSnapshot`), `topAlternatives`, `governanceDecision`, `modelArtifactHash` — was **byte-identical (via `JSON.stringify` equality) across all 10 runs, for all 4 tasks**.
- The full response was **not** byte-identical across runs. The only fields that differed were `requestId` (built from `Date.now()` + `Math.random()`) and each task's `timestamp`/`provenance.timestamp` (`new Date().toISOString()`, differing by 1ms between runs in this environment). Both sources of variance are bookkeeping metadata generated by the orchestrator itself, not anything derived from a model or from the input.
- Confirmed directly in the same run: `confidence: 0.9` for **all four** tasks (not the per-model accuracy figures reported in each model's artifact files, e.g. 0.874 for component_recommendation) — because `MLPredictionEngine.predict()` computes confidence as `approvedModel.evaluationResults?.accuracy ?? ... ?? 0.90`, and `evaluationResults` is never passed into any of the `MLModelRegistry.registerModel()` calls in `MLModelRegistry.ts`'s constructor, so it falls through to the `0.90` literal every time, for every model.
- `recommendedStrategy: "FlexGrid"` and `topAlternatives: [{label:"ContainerBox",...},{label:"FlexRow",...}]` were identical across all 4 tasks and all 10 runs — these are literals in `UIMLOrchestrator.ts`/`MLPredictionEngine.ts`, not computed values.

**Conclusion:** outputs are deterministic, but trivially so — there is no branch in the code between "input received" and "output returned" that depends on the input's content. Determinism here is evidence of hardcoding, not of a stable model.

---

## Which of the four models can be trusted to shape generated UI

**None of the four**, on the evidence gathered above. Not because any one of them individually scores badly — three of the four report respectable-looking accuracy figures on paper (0.874, 0.858, 0.5) — but because of what Checks 1 and 6 establish directly from the code that actually runs in production: **`MLPredictionEngine.predict()` never reads its input.** Every call, for every one of the four tasks, for any input whatsoever, returns the literal string `'FlexGrid'`, the literal number `88`, and a confidence of `0.90` (itself a fallback constant, not a real per-model figure, per Check 6). This was confirmed by direct code read and by executing the orchestrator ten times against a real input. Whatever each model's `.json` artifact claims about its own accuracy, none of those numbers can currently reach a user's generated UI, because nothing downstream of the orchestrator is wired to act on a real prediction.

If that wiring were fixed and the four candidate models were connected for real, here is what today's artifacts say about each on its own terms:

- **`layout_prediction` — cannot be trusted.** The only model of the four with a real, cell-level confusion matrix, and it shows the model predicting only 4 of its 8 classes on the entire 40-sample test set, with the other 4 (`sidebar`, `stack`, `centered`, `other`) at exactly 0% recall (Check 4 supplement). Its labels were generated by `sourceDataset` + `sampleId % 10` (Check 5), a rule with no geometric content and not learnable from the model's own declared features. Its train/test split is positional array-slicing, not randomized despite an unused `seed` parameter (Check 3).
- **`component_recommendation` — cannot be verified either way, and what can be checked doesn't inspire confidence.** No confusion matrix exists despite a file named for one. No per-class test support exists, so its per-class recall numbers (e.g. `other` at 0.735, 14 points under its own aggregate) can't be weighed against how many test examples they're based on. Its underlying raw data pool was 96% exact-duplicate rows before dedup (Check 3), and its split groups by screen/document, not app, despite app identity being available in the raw RICO data and known to this codebase's own inspection layer.
- **`visual_style_recommendation` — same shape of problem as component_recommendation**: no confusion matrix, no per-class support, same screen/document (not app) grouping, same placeholder-pattern `artifactHash`.
- **`ui_understanding` — its "1.0 accuracy" is not evidence of anything.** Its test set is 2 samples in a single class. A model that always outputs the same label would score identically.

Across all four, the `artifactHash` values registered in `MLModelRegistry.ts` follow one of two templated hex patterns (`1234567890abcdef...` or `abcdef0123456789...`), and no binary model-weight file exists anywhere in the repository or the `data set layer/` directory for any of them to hash. Combined with the fully-hardcoded prediction path, the evidence is consistent with these being scaffolded/simulated artifacts rather than the output of a real training run — I state this as what the evidence is consistent with, not as independently confirmed, since I have no way to inspect whatever process originally produced these JSON files.

**For the purpose this audit was requested for:** frontend work should proceed on the understanding that the four "governed ML models" currently contribute no actual signal to generated UI — the generation pipeline's real output quality depends entirely on the deterministic composer/layout/emitter path and the Gemini spec, not on these four models. Wiring real inference into `MLPredictionEngine.predict()` later would need to start from Check 1's finding (no feature vector reaches it in the trained schema's shape) before any of the accuracy figures in these artifacts could be treated as informative about anything a user sees.
