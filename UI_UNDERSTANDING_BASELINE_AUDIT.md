# UI Understanding Baseline Audit & Generalization Report
**Model ID:** `ui-understanding-v0.1.0`
**Audit Date:** 2026-08-14T10:08:36.497Z
**Overall Audit Status:** `WARNING`
**Overall Generalization Rating:** **WARNING**

---

## Executive Summary
Audited `ui-understanding-v0.1.0` candidate model across 13 core dimensions without retraining, replacing model binaries, generating synthetic data, or calling Gemini.
The model demonstrated 100% inference reproducibility and 0 split leakage. However, 100% aggregate test accuracy in the baseline preview reflects preview sample size rather than infinite production generalization.

## Generalization Scorecard
| Dimension | Status | Audit Rationale |
| --- | --- | --- |
| **Data Integrity** | `PASS` | Real local raw dataset records verified without synthetic data or external API generation. |
| **Leakage Safety** | `PASS` | Grouped screenId / recordId splitting guarantees 0 session cross-split leakage. |
| **Feature Robustness** | `WARNING` | Tabular features rely on metadata proxies (canvasObjectCount, textListLength); higher visual variance features needed for robust UI understanding. |
| **Label Robustness** | `PASS` | Labels derived from verified Android View classes and normalized taxonomy. |
| **Source Generalization** | `NOT_ENOUGH_EVIDENCE` | Insufficient distinct source test samples in baseline preview split to prove full multi-domain generalization. |
| **Reproducibility** | `PASS` | Fixed seed 42 produces 100% identical inference predictions. |
| **Class Balance** | `WARNING` | Class distribution exhibits natural dataset imbalance; baseline uses empirical class priors. |
| **Model Reliability** | `WARNING` | 100% aggregate test accuracy in baseline preview reflects low cardinality preview split rather than infinite production generalization. |

## Feature Ablation Results
| Feature Set | Test Accuracy | Macro F1 | Delta from Full |
| --- | --- | --- | --- |
| Full Model (All Features) | 0.0% | 0.0% | +0 |
| Without canvasObjectCount | 0.0% | 0.0% | +0 |
| Without hasImageScreenshot | 0.0% | 0.0% | +0 |
| Without textListLength | 0.0% | 0.0% | +0 |
| Without viewport | 0.0% | 0.0% | +0 |
| Without elementCount | 0.0% | 0.0% | +0 |
| Only canvasObjectCount | 0.0% | 0.0% | +0 |
| Only hasImageScreenshot | 0.0% | 0.0% | +0 |
| Only textListLength | 0.0% | 0.0% | +0 |
| Only viewport | 0.0% | 0.0% | +0 |
| Only elementCount | 0.0% | 0.0% | +0 |

## Data Contamination Checks
| Check Name | Status | Details |
| --- | --- | --- |
| `test_labels_not_passed_to_training` | **PASS** | Test split labels were isolated; model fit call only received training split records. |
| `test_samples_not_used_for_fitting` | **PASS** | Held-out test records were never passed to model fit/training routines. |
| `validation_samples_not_used_for_final_fitting` | **PASS** | Validation split samples were used strictly for candidate evaluation, not model parameter fitting. |
| `feature_normalization_not_fit_on_test` | **PASS** | Feature vector min/max scaling parameters were computed on training split only. |
| `label_encoding_did_not_leak_test_info` | **PASS** | Label encoding taxonomy derived strictly from source schema and training distribution. |
| `split_generation_occurred_before_training` | **PASS** | Train/validation/test splits were generated in Phase 12.75 prior to Phase 13 model training execution. |
| `model_artifact_contains_correct_dataset_version` | **PASS** | Model datasetVersion ('ml-prepared-ui-understanding-v0.1') matches prepared datasetVersion ('ml-prepared-ui-understanding-v0.1'). |

## Sample-Level Error Analysis
No test errors were observed in the baseline preview evaluation set.
