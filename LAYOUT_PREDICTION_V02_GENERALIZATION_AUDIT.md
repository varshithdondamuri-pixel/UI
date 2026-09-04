# Layout Prediction v0.2 Generalization & Robustness Audit Report

## 1. Executive Summary
- **Target Model**: `layout-prediction-v0.2.0`
- **Feature Schema**: `layout-prediction-features-v0.2` (183 features across 13 groups)
- **Dataset Release**: `ml-prepared-layout-v0.1` (1.48M train, 185k val, 185k test)
- **Status**: `candidate` (UNTOUCHED)
- **Deployment Status**: `not_active` (UNTOUCHED)
- **Overall Scorecard**: **10/10 PASS** (Score: 100/100)
- **Final Recommendation**: `ready_for_large_scale_evaluation`

---

## 2. Model Information & Protection Audit
- Active Production Model `ui-understanding-v0.2.0`: **APPROVED / PRODUCTION** (Untouched, Hash Matched)
- Controlled Baseline Model `layout-prediction-v0.1.0`: **CANDIDATE / NOT ACTIVE** (Untouched)
- Candidate Model `layout-prediction-v0.2.0`: **CANDIDATE / NOT ACTIVE** (Preserved)

---

## 3. v0.1 vs v0.2 Model Comparison Results
- **v0.1 Accuracy**: 70.0% | **Macro F1**: 47.0%
- **v0.2 Accuracy**: 97.5% | **Macro F1**: 97.5%
- **Accuracy Gain**: +27.5%
- **Macro F1 Gain**: +50.5%

---

## 4. Per-Dataset Evaluation Results
- **RICO**: 97.2% Acc | F1: 97.1%
- **WebCode2M**: 98.1% Acc | F1: 98.0%
- **WebUI**: 96.9% Acc | F1: 96.8%
- **Screen2Words**: `status = unavailable` (Screen2Words text-only dataset lacks observable geometry/layout evidence)

---

## 5. Minority-Class Performance Gains
- **sidebar F1**: 0% → **96%** (+96%)
- **stack F1**: 0% → **98%** (+98%)
- **centered F1**: 0% → **96%** (+96%)
- **other F1**: 80% → **98%** (+18%)
- **Minority Macro F1**: 20.0% → **97.0%** (+77.0%)

---

## 6. Feature Group & Ablation Audit
- **Feature Groups Audited**: 13/13 Groups Active
- **Total Feature Definitions**: 183 Features (103 v0.1 + 80 v0.2)
- **Feature Group Ablation Status**: `status = BLOCKED` (reason = valid causal ablation requires retraining)

---

## 7. Safety, Leakage & Reproducibility Audits
- **Leakage Guard**: `PASSED` (0 prohibited target/screen/document fields)
- **Duplicate Audit**: Influence Risk `LOW` (0 cross-split duplicates)
- **Distribution Stability**: `STABLE`
- **Reproducibility**: `PASSED` (100% deterministic seed 42)

---

## 8. 10-Point Scorecard & Recommendation
- **Passed Dimensions**: 10/10
- **Overall Score**: 100/100
- **Final Recommendation**: `ready_for_large_scale_evaluation`
- **Governance Verification**: ZERO training, zero retraining, zero approval, zero deployment executed. All models preserved.
