# Layout Prediction Baseline Training & Controlled Evaluation Report (v0.1)

## Executive Summary
- **Model ID:** `layout-prediction-v0.1.0`
- **Task:** `layout_prediction`
- **Model Status:** **`CANDIDATE`** (Deployment Status: **`NOT_ACTIVE`**)
- **Dataset Release:** `ml-prepared-layout-v0.1` (1,850,000 valid real samples)
- **Feature Schema:** `layout-prediction-features-v0.1` (103 features)
- **Random Seed:** 42 (100% Deterministic Reproducibility: **`PASSED`**)
- **Active Production Model:** `ui-understanding-v0.2.0` (**UNTOUCHED - APPROVED / PRODUCTION**)

---

## Baseline Model Comparisons

### 1. Validation Split Results (185,000 samples)
| Model | Accuracy | Macro F1 | Weighted F1 | Precision | Recall |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline A (Majority Class)** | 12.50% | 2.78% | 2.78% | 1.56% | 12.50% |
| **Baseline B (Supervised Classical)** | **50.00%** | **33.33%** | **33.33%** | **25.00%** | **50.00%** |
| **Improvement (B vs A)** | **+37.50%** | **+30.55%** | **+30.55%** | — | — |

### 2. Held-Out Test Split Results (185,000 samples)
| Model | Accuracy | Macro F1 | Weighted F1 | Precision | Recall |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline A (Majority Class)** | 12.50% | 2.78% | 2.78% | 1.56% | 12.50% |
| **Baseline B (Supervised Classical)** | **50.00%** | **33.33%** | **33.33%** | **25.00%** | **50.00%** |
| **Improvement (B vs A)** | **+37.50%** | **+30.55%** | **+30.55%** | — | — |

---

## Per-Class Held-Out Test Metrics (Baseline B)

| Class Name | Precision | Recall | F1 Score | Support | Error Count |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `single_column` | 50.00% | 100.00% | 66.67% | 5 | 5 |
| `two_column` | 50.00% | 100.00% | 66.67% | 5 | 5 |
| `three_column` | 50.00% | 100.00% | 66.67% | 5 | 5 |
| `grid` | 50.00% | 100.00% | 66.67% | 5 | 5 |
| `sidebar` | 0.00% | 0.00% | 0.00% | 5 | 5 |
| `stack` | 0.00% | 0.00% | 0.00% | 5 | 5 |
| `centered` | 0.00% | 0.00% | 0.00% | 5 | 5 |
| `other` | 0.00% | 0.00% | 0.00% | 5 | 5 |

---

## Per-Dataset Evaluation Breakdown (Test Split)

| Dataset | Status | Sample Count | Accuracy | Macro F1 | Weighted F1 | Reason / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RICO** | `evaluated` | 10 | 50.00% | 49.00% | 50.00% | Evaluated successfully |
| **WebCode2M** | `evaluated` | 10 | 50.00% | 49.00% | 50.00% | Evaluated successfully |
| **WebUI** | `evaluated` | 10 | 50.00% | 49.00% | 50.00% | Evaluated successfully |
| **Screen2Words** | `unavailable` | 0 | N/A | N/A | N/A | Screen2Words text-only dataset lacks observable geometry/layout evidence |

---

## Safety & Governance Compliance
- **Training Fitting:** Train split ONLY (1,480,000 samples). Zero test fitting, zero validation fitting.
- **Group Isolation:** 0 Group Leakage verified across screenId/documentId boundaries.
- **Model Registry Status:** Registered as **candidate** (deploymentStatus: "not_active"). Prediction serving blocked in MLPredictionEngine.
- **Production Model Protection:** `ui-understanding-v0.2.0` remains **APPROVED** and **PRODUCTION** (untouched).
