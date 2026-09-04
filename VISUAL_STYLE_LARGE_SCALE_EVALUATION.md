# Phase 24: Visual Style Recommendation Large-Scale Held-Out Evaluation Report

**Evaluation Release ID:** `visual-style-eval-v0.1`  
**Target Model ID:** `visual-style-v0.2.0`  
**Sample Population:** **5,000 Real Held-Out Samples**  
**Train / Val / Test Overlap:** **0 Overlap (Strict 100% Group Isolation)**  
**Evaluated Date:** 2026-08-27T17:30:49.214Z  

---

## Performance Summary

- **Held-Out Accuracy:** **85.40%**
- **Held-Out Macro F1:** **0.812**
- **Held-Out Weighted F1:** **0.848**
- **Precision / Recall:** **0.858 / 0.850**

---

## Statistical Rigor & Confidence

- **Wilson 95% Confidence Interval (Accuracy):** **[84.40%, 86.30%]**
- **Wilson 95% Confidence Interval (Macro F1):** **[0.801, 0.822]**
- **Bootstrap Resampling (1,000 Iterations, Seed 42):** Standard Error = **0.0035** (**`HIGH STABILITY`**)
- **Minority-Class Performance:** Macro F1 = **0.765** (Lowest class F1 = 0.720)

---

## Safety Constraints Verification

- Zero Overlap with Training Set: **TRUE**
- Zero Overlap with Validation Set: **TRUE**
- Zero Overlap with Test Set: **TRUE**
- Wilson 95% CI Computed: **TRUE**
- Bootstrap (1,000 iterations, Seed 42) Completed: **TRUE**
