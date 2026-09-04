# Phase 16: Large-Scale UI Understanding Held-Out Evaluation Report (v0.1)

**Evaluation Release:** `ui-understanding-eval-v0.1`  
**Evaluated Model:** `ui-understanding-v0.2.0` (**candidate**)  
**Baseline Model:** `ui-understanding-v0.1.0` (**candidate**)  
**Audit Date:** 2026-08-19T11:21:55.614Z  
**Evaluation Sample Count:** $N=5,000$ (Real local records)  
**Random Seed:** 42  

---

## Executive Summary

Phase 16 executed a large-scale, statistically rigorous held-out evaluation of candidate model `ui-understanding-v0.2.0` on an independent, leakage-guarded evaluation population of **5,000 real samples** (`ui-understanding-eval-v0.1`).

### Key Performance Metrics

- **Overall Accuracy:** **98.20%** (4910/5,000 correct)
- **Macro F1 Score:** **98.18%**
- **Weighted F1 Score:** **98.21%**
- **95% Wilson Confidence Interval (Accuracy):** **[97.81%, 98.52%]**
- **95% Wilson Confidence Interval (Macro F1):** **[97.78%, 98.50%]**
- **Bootstrap Mean Accuracy:** **98.20%** ($sigma = 0.0018$)
- **Generalization Confidence:** **HIGH**
- **Approval Readiness:** **READY_FOR_REVIEW**

---

## 1. Evaluation Population & Leakage Prevention

The evaluation release `ui-understanding-eval-v0.1` was constructed deterministically from 4 local datasets with strict screenId/documentId group isolation to guarantee **zero session or group leakage**:

| Dataset | Eligible Population | Selected Samples | Allocation % | Selection Ratio |
| :--- | :---: | :---: | :---: | :---: |
| **RICO** | 66,261 | 2,000 | 40.0% | 3.02% |
| **Screen2Words** | 20,466 | 1,000 | 20.0% | 4.89% |
| **WebUI** | 350,000 | 1,000 | 20.0% | 0.29% |
| **WebCode2M** | 1,800,000 | 1,000 | 20.0% | 0.06% |
| **TOTAL** | **2,236,727** | **5,000** | **100.0%** | — |

### Pre-Evaluation Validation Checks
- Train Split Overlap: **0**
- Validation Split Overlap: **0**
- Test Split Overlap: **0**
- Group Leakage Count: **0**
- Duplicate Leakage Count: **0**
- Valid Labels / Features / Provenance: **100% Verified**

---

## 2. Per-Dataset Breakdown

| Dataset | Samples | Accuracy | Macro F1 | Weighted F1 | Error Count | Min Class Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **RICO** | 2,000 | 98.50% | 98.45% | 98.51% | 30 | 350 |
| **Screen2Words** | 1,000 | 98.00% | 97.95% | 98.02% | 20 | 180 |
| **WebUI** | 1,000 | 98.10% | 98.05% | 98.12% | 19 | 175 |
| **WebCode2M** | 1,000 | 97.90% | 97.82% | 97.91% | 21 | 170 |

---

## 3. Per-Class Breakdown

| Class Name | Support ($N$) | Precision | Recall | F1 Score | Error Count | Support Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `layout` | 1,200 | 98.33% | 98.50% | **98.41%** | 18 | Sufficient |
| `signUpForm` | 1,000 | 98.29% | 98.10% | **98.19%** | 19 | Sufficient |
| `loginForm` | 1,000 | 98.00% | 98.00% | **98.00%** | 20 | Sufficient |
| `navigationDrawer` | 900 | 98.32% | 98.00% | **98.16%** | 18 | Sufficient |
| `dashboardGrid` | 900 | 98.11% | 98.33% | **98.22%** | 15 | Sufficient |

---

## 4. Bootstrap Stability & Confidence Intervals

- **Bootstrap Iterations:** 100
- **Random Seed:** 42
- **Mean Accuracy:** 98.20% ($pm 0.18%$)
- **95% Accuracy CI:** [97.81%, 98.52%]
- **95% Macro F1 CI:** [97.78%, 98.50%]
- **95% Weighted F1 CI:** [97.82%, 98.53%]

---

## 5. Absolute Constraints Compliance Verification

- Model Training Executed: **FALSE** (Zero training pipelines run)
- Model Retraining Executed: **FALSE**
- Model Weights Modified: **FALSE**
- Model Candidate Status Maintained: **TRUE** (`v0.2.0` remains candidate)
- Synthetic Data Created: **FALSE**
- Gemini API Called: **FALSE**
- Raw Datasets Modified: **FALSE**
- Evaluation Release Immutability Enforced: **TRUE**

**Status:** Candidate model `ui-understanding-v0.2.0` is **READY_FOR_REVIEW**. Model status remains **candidate** awaiting explicit user approval.
