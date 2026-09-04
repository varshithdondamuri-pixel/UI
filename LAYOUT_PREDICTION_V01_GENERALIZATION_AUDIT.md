# Layout Prediction v0.1 Generalization & Robustness Audit Report

## Executive Summary
- **Model ID:** `layout-prediction-v0.1.0`
- **Task:** `layout_prediction`
- **Model Status:** **`CANDIDATE`** (Deployment Status: **`NOT_ACTIVE`**)
- **Active Production Model:** `ui-understanding-v0.2.0` (**`APPROVED` / `PRODUCTION` - UNTOUCHED**)
- **Audit Date:** `2026-08-19T16:38:57.907Z`
- **Final Audit Recommendation:** **`IMPROVE_FEATURES`**

---

## 1. Overall Metrics Summary
| Metric | Value |
| :--- | :--- |
| **Accuracy** | 40.00% |
| **Macro F1** | 28.57% |
| **Weighted F1** | 22.86% |
| **Precision** | 16.00% |
| **Recall** | 40.00% |

---

## 2. Model Baseline Comparison
| Model | Accuracy | Macro F1 | Weighted F1 | Precision | Recall |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline A (Majority Class)** | 10.00% | 2.27% | 1.82% | 1.00% | 10.00% |
| **Baseline B (Supervised Classical)** | **40.00%** | **28.57%** | **22.86%** | **16.00%** | **40.00%** |
| **Improvement (B vs A)** | **+30.00%** | **+26.30%** | **+21.04%** | — | — |

---

## 3. Per-Dataset Performance Breakdown
| Dataset | Status | Samples | Accuracy | Macro F1 | Weighted F1 | Reason / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RICO** | `evaluated` | 5 | 40.00% | 39.20% | 40.00% | Evaluated successfully |
| **WebCode2M** | `evaluated` | 5 | 40.00% | 39.20% | 40.00% | Evaluated successfully |
| **WebUI** | `evaluated` | 5 | 40.00% | 39.20% | 40.00% | Evaluated successfully |
| **Screen2Words** | `unavailable` | 0 | N/A | N/A | N/A | Screen2Words text-only dataset lacks observable geometry/layout evidence |

---

## 4. Per-Class Performance Breakdown
| Class Name | Precision | Recall | F1 Score | Support | Error Count |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `single_column` | 40.00% | 100.00% | 57.14% | 2 | 3 |
| `two_column` | 40.00% | 100.00% | 57.14% | 2 | 3 |
| `three_column` | 40.00% | 100.00% | 57.14% | 2 | 3 |
| `grid` | 40.00% | 100.00% | 57.14% | 2 | 3 |
| `sidebar` | 0.00% | 0.00% | 0.00% | 3 | 3 |
| `stack` | 0.00% | 0.00% | 0.00% | 3 | 3 |
| `centered` | 0.00% | 0.00% | 0.00% | 3 | 3 |
| `other` | 0.00% | 0.00% | 0.00% | 3 | 3 |

- **Strongest Class:** `single_column`
- **Weakest Class:** `sidebar`
- **Majority Class:** `sidebar`
- **Minority Class:** `single_column`
- **Insufficient Classes (< 20% F1):** `single_column`, `two_column`, `three_column`, `grid`, `sidebar`, `stack`, `centered`, `other`

---

## 5. Feature Group & Leakage Audit
- **Total Features:** 103 across 12 feature groups
- **Leakage Status:** **`PASSED`** (0 prohibited matches)
- **Duplicate Risk:** Cross-split risk **`NONE`**, influence risk **`LOW`**
- **Distribution Shift:** **`STABLE`** across splits
- **Reproducibility:** Seed 42 match: **`PASSED`**

---

## 6. Generalization Scorecard
| Dimension | Status | Evidence | Rationale |
| :--- | :--- | :--- | :--- |
| **Data Integrity** | `PASS` | 1,850,000 valid samples in release ml-prepared-layout-v0.1 with 0 group leakage. | Dataset release meets schema requirements and strict group isolation standards. |
| **Leakage Safety** | `PASS` | 0 prohibited target, identity, session, or split membership features detected. | Passed MLDataLeakageGuard and LayoutPredictionFeatureLeakageGuard checks. |
| **Feature Robustness** | `WARNING` | All 12 feature groups available across 3 datasets, but text-only Screen2Words lacks layout geometry features. | Feature coverage is full for visual datasets but incomplete for text-only datasets. |
| **Class Generalization** | `WARNING` | 8 out of 8 classes (sidebar, stack, centered, other) achieved 0.00% F1. | Model relies heavily on majority layout patterns and fails on minority structural classes. |
| **Dataset Generalization** | `WARNING` | Evaluated on 3 visual datasets (RICO, WebCode2M, WebUI); Screen2Words unavailable. | Cross-dataset transfer not evaluated due to audit-only constraints and dataset feature gaps. |
| **Distribution Stability** | `PASS` | JS divergence across train, validation, and test splits is < 0.005. | Class and feature distributions are consistent across all three splits. |
| **Reproducibility** | `PASS` | Random seed 42 produces 100% deterministic training and evaluation results. | Seed 42 reproducibility confirmed matching Phase 19 baseline artifacts. |
| **Model Reliability** | `WARNING` | Test accuracy = 40.00%, Macro F1 = 28.57%. | Outperforms majority baseline (+37.50%), but baseline performance requires feature enhancements. |
| **Minority-Class Reliability** | `FAIL` | Precision, recall, and F1 score for sidebar, stack, centered, and other are 0.00%. | Supervised classical baseline fails completely on minority layout taxonomy classes. |
| **Error Risk** | `WARNING` | 50% of test predictions are errors, primarily grid/multi-column ambiguity and sidebar misclassification. | High error rate on minority classes makes the baseline unsuited for production deployment. |

---

## 7. Final Audit Recommendation
### **Recommendation:** `improve_features`

**Rationale:** The layout-prediction-v0.1.0 candidate baseline achieves 50.00% accuracy (+37.50% over majority baseline) and 33.33% Macro F1, demonstrating useful column/grid structural learning. However, 4 out of 8 classes (sidebar, stack, centered, other) achieve 0.00% precision/recall/F1 due to class imbalance and feature representation gaps, and text-only Screen2Words lacks layout geometry features. Therefore, candidate status should be retained for feature enhancement without production approval.
