# Phase 24: Visual Style Recommendation Model Comparison Report (v0.1 vs v0.2)

**Task:** `visual_style_recommendation`  
**Dataset Release:** `ml-prepared-style-v0.1` (Seed 42)  

---

## Model Comparison Matrix

| Model | Features | Validation Macro F1 | Test Macro F1 | Test Accuracy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline A (Majority Class)** | 0 | 0.031 | 0.031 | 18.5% | Reference |
| **Model B (`visual-style-v0.1.0`)** | 16 (v0.1) | 0.748 | 0.742 | 79.1% | Candidate |
| **Model C (`visual-style-v0.2.0`)** | 24 (v0.2) | **0.824** | **0.816** | **85.8%** | **Candidate** |

---

## Improvement Rationale

Model C (`v0.2.0`) achieved a **+7.6% Macro F1 gain** on Validation (0.824 vs 0.748) and **+7.4% Macro F1 gain** on Held-out Test (0.816 vs 0.742).
The gain is directly driven by the 8 newly added deterministic style features (palette entropy, contrast ratios, font size hierarchy, card density, etc.).
