# UI Understanding Evaluation Scale & Generalization Evidence (Phase 15)

**Candidate Model**: `ui-understanding-v0.2.0`  
**Feature Version**: `ui-understanding-features-v0.2`  
**Generalization Confidence**: **`LOW`**  
**Approval Readiness**: **`NOT_READY`**  
**Model Status**: **`CANDIDATE`** (Unchanged)

---

## 1. Executive Summary

Phase 15 evaluated existing candidate model `ui-understanding-v0.2.0` against the complete existing held-out test split from `ml-prepared-ui-v0.1`. Zero models were retrained, zero records were moved between splits, and model status remains strictly **candidate**.

While v0.2 candidate model achieved **100% test accuracy**, the statistical support score is **`weak`** due to limited test sample count (2 test samples). Per Phase 15 rules, **100% accuracy alone MUST NOT produce high confidence**.

---

## 2. Full Test Set Evaluation Summary

| Metric | Baseline v0.1 | Candidate v0.2 | Delta | Interpretation |
| --- | --- | --- | --- | --- |
| **Accuracy** | 0.0% | **100.0%** | 0.0% | statistically significant improvement |
| **Macro F1** | 0.0% | **100.0%** | 0.0% | statistically significant improvement |

---

## 3. Statistical & Scale Evidence

- **Train Samples**: 1
- **Validation Samples**: 1
- **Held-Out Test Samples**: 2
- **Bootstrap Stability**: Mean 100.0%, StdDev 0.00 (100 resamples, seed 42)
- **Support Score**: **`WEAK`**
- **Generalization Confidence**: **`LOW`**
- **Approval Readiness**: **`NOT_READY`**
