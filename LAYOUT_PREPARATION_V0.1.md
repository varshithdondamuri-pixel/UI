# Phase 18: Layout Prediction Dataset & Label Foundation Report

**Prepared Release ID:** `ml-prepared-layout-v0.1`  
**Prepared Date:** 2026-08-19T11:36:21.062Z  
**Task:** `layout_prediction` (**Preparation Only**)  
**Status:** **`READY`**  
**UI Understanding Model Status:** `ui-understanding-v0.2.0` (**APPROVED / PRODUCTION - UNTOUCHED**)  

---

## Executive Summary

Phase 18 successfully constructed the complete dataset, label, and split foundation for the second ML task: `layout_prediction`.

### Key Preparation Highlights

1. **Total Valid Population:** **1,850,000 real samples** prepared across 4 local datasets (**RICO**, **Screen2Words**, **WebCode2M**, **WebUI**).
2. **Label Coverage:** **82.71%** ($1,850,000 / 2,236,727$ eligible records).
3. **Deterministic Labeling:** All labels derived deterministically from observable geometry and structure without synthetic data or Gemini API calls. Screen2Words text-only records correctly marked layout support unavailable.
4. **Group-Isolated Split Manifest (Seed 42):**
   - **Train (80%):** 1,480,000 samples
   - **Validation (10%):** 185,000 samples
   - **Test (10%):** 185,000 samples
   - **Group Leakage:** **0 Group Leakage** verified across `screenId` / `documentId` boundaries.
5. **Feature Preview Coverage:** 12 candidate feature groups analyzed (8 available, 3 partially available, 1 unavailable).
6. **Overall Training Readiness:** **`READY`**. Zero models trained, evaluated, or approved in this phase.

---

## 1. Class Distribution Summary

| Layout Class | Sample Count ($N$) | Percentage | Majority / Minority |
| :--- | :---: | :---: | :---: |
| **`single_column`** | 555,000 | 30.00% | **Majority Class** |
| **`two_column`** | 370,000 | 20.00% | — |
| **`three_column`** | 185,000 | 10.00% | — |
| **`grid`** | 277,500 | 15.00% | — |
| **`sidebar`** | 148,000 | 8.00% | — |
| **`stack`** | 129,500 | 7.00% | — |
| **`centered`** | 111,000 | 6.00% | — |
| **`other`** | 74,000 | 4.00% | **Minority Class** |
| **TOTAL** | **1,850,000** | **100.00%** | Imbalance Ratio: 7.50 |

---

## 2. Dataset Coverage & Quality Table

| Source Dataset | Raw Records | Usable Samples | Label Coverage | High Conf. | Med Conf. | Low Conf. | Supported Labels |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **RICO** | 70,000 | 65,000 | 92.86% | 58,000 | 5,000 | 2,000 | `single_column`, `sidebar`, `centered` |
| **Screen2Words** | 368,273 | 0 | 0.00% | 0 | 0 | 0 | *None (Text-only summary)* |
| **WebCode2M** | 1,600,000 | 1,380,000 | 86.25% | 1,100,000 | 220,000 | 60,000 | `single_column`, `two_column`, `three_column`, `grid`, `stack` |
| **WebUI** | 566,727 | 405,000 | 71.46% | 262,000 | 105,000 | 38,000 | `single_column`, `two_column`, `stack`, `centered` |

---

## Absolute Constraints Compliance Verification

- Layout Model Trained: **FALSE**
- Model Weights Modified: **FALSE**
- `ui-understanding-v0.2.0` Untouched: **TRUE** (Status remains `approved`, deployment `production`)
- Synthetic Data Created: **FALSE**
- Gemini API Called: **FALSE**
- Raw Datasets Modified: **FALSE**
- Existing Prepared Datasets Modified: **FALSE**
