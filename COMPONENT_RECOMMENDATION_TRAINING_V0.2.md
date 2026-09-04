# Phase 23: Component Recommendation V0.2 Controlled Retraining Report

**Model Candidate ID:** `component-recommendation-v0.2.0`  
**Trained Date:** 2026-08-24T10:31:59.780Z  
**Task:** `component_recommendation`  
**Model Status:** **`candidate`** (Unapproved / Not Active)  
**UI Understanding Production Model Status:** `ui-understanding-v0.2.0` (**APPROVED / PRODUCTION - UNTOUCHED**)  

---

## Controlled Model Comparison (Validation Selection -> Held-Out Test Evaluation)

| Model / Feature Setup | Feature Version | Validation F1 | Test Accuracy | Test Macro F1 | Test Weighted F1 | Selection Outcome |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Baseline A** (Majority Class) | N/A | 0.024 | 28.50% | 0.024 | 0.127 | Reference |
| **Model B** (v0.1 Base Features) | `v0.1` (16 feats) | 0.765 | 80.80% | 0.758 | 0.801 | Candidate B |
| **Model C** (v0.2 Contextual Features) | `v0.2` (24 feats) | **0.842** | **87.40%** | **0.835** | **0.868** | **SELECTED (Model C)** |

---

## Controlled Feature Upgrade Performance Impact

1. **Overall Accuracy:** Improved from **80.80% -> 87.40%** (+6.60% absolute gain).
2. **Macro F1 Score:** Improved from **0.758 -> 0.835** (+7.70% absolute gain).
3. **Minority Class F1:** Improved from **0.650 -> 0.742** (+9.20% absolute gain on `other` and minority component classes).
4. **Dataset Transfer Stability:** Consistent performance gains across RICO (88.5%), WebCode2M (87.8%), and WebUI (85.2%).
