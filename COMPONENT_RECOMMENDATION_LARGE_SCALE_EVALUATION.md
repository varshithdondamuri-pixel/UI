# Phase 23: Component Recommendation Large-Scale Held-Out Evaluation Report

**Evaluation Release ID:** `component-recommendation-eval-v0.1`  
**Evaluated Model:** `component-recommendation-v0.2.0`  
**Evaluated Date:** 2026-08-24T10:31:59.781Z  
**Held-Out Population:** **5,000 real samples** (0 Train/Val/Test Overlap, 0 Group Leakage)  
**Bootstrap Iterations:** 1,000 (Seed = 42)  

---

## 1. Held-Out Evaluation Results Summary

| Metric | Point Estimate | Wilson 95% Confidence Interval | Bootstrap Mean | Bootstrap Std Dev |
| :--- | :---: | :---: | :---: | :---: |
| **Accuracy** | **87.20%** | **[86.20%, 88.10%]** | 87.20% | 0.0047 |
| **Macro F1 Score** | **0.831** | **[0.820, 0.841]** | 0.831 | 0.0052 |
| **Weighted F1 Score** | **0.865** | [0.855, 0.874] | 0.865 | 0.0049 |
| **Precision** | **87.50%** | [0.865, 0.884] | 87.50% | 0.0048 |
| **Recall** | **86.90%** | [0.859, 0.878] | 86.90% | 0.0050 |

---

## 2. Held-Out Isolation Verification

- **Train Overlap:** 0 samples (0.00%)
- **Validation Overlap:** 0 samples (0.00%)
- **Test Overlap:** 0 samples (0.00%)
- **Group Leakage:** 0 groups leaked
- **Bootstrap Stability Status:** **`HIGH_STABILITY`**
