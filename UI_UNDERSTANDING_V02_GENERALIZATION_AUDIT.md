# UI Understanding v0.2 Generalization & Robustness Audit Report

**Model ID**: `ui-understanding-v0.2.0`  
**Feature Version**: `ui-understanding-features-v0.2`  
**Recommendation**: **`KEEP_CANDIDATE`**  
**Overall Status**: **`WARNING`**  

---

## 1. Executive Summary

Phase 14.5 executed a non-invasive generalization and robustness audit of candidate model `ui-understanding-v0.2.0` across 14 audit dimensions. The v0.2 feature expansion (28 features across 18 feature groups) achieved **100% test accuracy** and passed all leakage safety and reproducibility checks.

However, because held-out test support is currently limited to preview records, the generalization confidence is rated **`low`**, and the evidence-based recommendation is **`keep_candidate`**.

---

## 2. Model Comparison (v0.1 vs v0.2)

| Metric | Baseline v0.1 | Candidate v0.2 | Delta |
| --- | --- | --- | --- |
| **Accuracy** | 0.0% | **100.0%** | +100.0% |
| **Macro F1** | 0.0% | **100.0%** | +100.0% |
| **Weighted F1** | 0.0% | **100.0%** | +100.0% |

---

## 3. Generalization Scorecard

| Category | v0.1 Status | v0.2 Status | Audit Status | Evidence |
| --- | --- | --- | --- | --- |
| Data Integrity | PASS | PASS | **PASS** | Zero corrupted records; raw dataset structure unchanged. |
| Leakage Safety | PASS | PASS | **PASS** | Leakage Guard PASSED. Target labels & provenance excluded from predictive vectors. |
| Source Generalization | WARNING | PASS | **PASS** | Evaluated cleanly across 4 source datasets (RICO, Screen2Words, WebCode2M, WebUI). |
| Class Robustness | WARNING | PASS | **PASS** | 100% precision & recall across target classes. |
| Feature Robustness | FAIL | PASS | **PASS** | Expanded from 6 baseline proxy features to 28 features across 18 groups. |
| Distribution Stability | PASS | PASS | **PASS** | Zero distribution/class/missingness shift detected across train/val/test splits. |
| Reproducibility | PASS | PASS | **PASS** | 100% hash match across sequential seed 42 training runs. |
| Model Reliability | WARNING | WARNING | **WARNING** | Limited preview test set support requires keeping model in candidate status until large-scale data evaluation. |

---

## 4. Key Findings

1. **Leakage & Duplicate Risk**: Leakage Guard status is `PASSED` with 0 cross-split duplicates.
2. **Feature Coverage**: All 18 feature groups active and clean.
3. **Recommendation Rationale**: Candidate model ui-understanding-v0.2.0 achieved 100% accuracy and passed all leakage/reproducibility audits. However, held-out test support is limited to preview dataset records. Per strict Phase 14.5 safety rules, recommendation is keep_candidate until large-scale dataset evaluation.
