# Phase 15.5: UI Understanding Evaluation Capacity & Dataset Scale Audit (v0.1)

**Audit Date:** 2026-08-19T11:12:26.135Z  
**Task:** `ui_understanding`  
**Models Audited:**  
- `ui-understanding-v0.1.0` = **candidate**  
- `ui-understanding-v0.2.0` = **candidate**  

---

## Executive Summary

Phase 15 completed with 100% test accuracy on the preview test split ($N=2$). However, as identified in Phase 15, evaluating a preview-sized test population cannot justify model approval or claims of broad generalization.

This Phase 15.5 evaluation capacity audit inspected all local real datasets (**RICO**, **Screen2Words**, **WebCode2M**, **WebUI**) to assess their capacity to support a scale-appropriate evaluation population.

### Key Audit Findings

1. **Current Test Population:** $N=2$ test samples (RICO only). Evaluation scale status is **LIMITED**.
2. **Available Local Population:** **2,236,727** eligible records across 4 datasets.
3. **Additional Capacity:** **2,236,725** eligible records available locally without training or synthetic data generation.
4. **Potential Scale Status:** **STRONG** if a larger evaluation split is constructed.
5. **Approval Readiness:** **NOT_READY** due to 4 active blockers.

---

## 1. Raw Dataset Inventory

| Dataset | Total Raw Records | Usable Records | Labeled Records | Geometry | Component Info | Text | Hierarchy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **RICO** | 93,000 | 66,261 | 66,261 | Yes | Yes | Yes | Yes |
| **Screen2Words** | 112,000 | 112,000 | 112,000 | No | No | Yes | No |
| **WebCode2M** | 2,000,000 | 2,000,000 | 1,800,000 | Yes | Yes | Yes | Yes |
| **WebUI** | 400,000 | 400,000 | 350,000 | Yes | Yes | Yes | Yes |
| **TOTAL** | **2,605,000** | **2,578,261** | **2,328,261** | — | — | — | — |

---

## 2. Prepared Dataset Inventory (`ml-prepared-ui-v0.1`)

- **Total Prepared Samples:** 4
- **Train Samples:** 1
- **Validation Samples:** 1
- **Test Samples:** 2
- **Samples by Dataset:** RICO = 4, Screen2Words = 0, WebCode2M = 0, WebUI = 0

---

## 3. Preview vs Available Evaluation Capacity

- **Preview Test Count:** 2
- **Available Eligible Evaluation Count:** 2,236,727
- **Additional Eligible Records:** 2,236,725
- **Additional Eligible Classes:** login_form, dashboard_grid, navigation_drawer, settings_list, search_results, profile_card, checkout_summary, media_player, chat_feed, onboarding_carousel
- **Additional Eligible Datasets:** Screen2Words, WebCode2M, WebUI

---

## 4. Cross-Dataset Evaluation Capacity

| Dataset | Capacity Status | Details |
| :--- | :---: | :--- |
| **RICO** | `SUPPORTED` | 66,261 usable records with complete UI hierarchy and bounding box geometry |
| **Screen2Words** | `SUPPORTED` | 20,466 screen summary records linked to RICO screens |
| **WebCode2M** | `PARTIAL` | 1,800,000 labeled web code records, partially structured for UI bounding box extraction |
| **WebUI** | `SUPPORTED` | 350,000 labeled web design records with DOM and CSS metadata |

---

## 5. Dataset Priority Ranking for Evaluation Expansion

1. **RICO** (Score: 92/100) — Primary mobile UI evaluation benchmark.
2. **Screen2Words** (Score: 85/100) — Natural language UI semantic alignment evaluation.
3. **WebUI** (Score: 81/100) — Web UI layout and design token evaluation.
4. **WebCode2M** (Score: 74/100) — Large-scale web element classification stress test.

---

## 6. Proposed Future Evaluation Design

- **Target Total Evaluation Samples:** 5,000
- **Target Per-Dataset Samples:** RICO: 2,000, Screen2Words: 1,000, WebUI: 1,000, WebCode2M: 1,000
- **Target Per-Class Samples:** 500 per class across 10 primary UI categories
- **Group Isolation Rule:** Enforce strict session and screen grouping by screenId / applicationId / documentId / pageId. Zero overlap between train, validation, and evaluation splits.
- **Duplicate Rule:** Exclude exact content duplicates (MD5 hash) and near duplicates (Jaccard similarity > 0.85).
- **Label Rule:** Only include samples with verified deterministic taxonomy mapping and confidence >= 0.90.

---

## 7. Approval Blockers Assessment

- **Approval Readiness:** `not_ready`
- **Active Blockers:**
  - `insufficient_test_support`: Current test split contains N=2 samples. Minimum required for statistical confidence is N=500.
  - `insufficient_class_support`: Only 3 classes evaluated in test set with N=1 or N=2 samples per class. Minimum N=30 per class required.
  - `insufficient_dataset_support`: Test split evaluates only RICO dataset. Screen2Words, WebCode2M, and WebUI are not included in current test set.
  - `cross_dataset_evidence_missing`: Model performance has not been validated on non-RICO datasets.

---

## Absolute Constraints Compliance Verification

- Model Training Executed: **FALSE**
- Model Retraining Executed: **FALSE**
- Model Approved: **FALSE**
- Model Replaced: **FALSE**
- Model Artifacts Modified: **FALSE**
- Feature Schema Changed: **FALSE**
- Label Schema Changed: **FALSE**
- Synthetic Data Created: **FALSE**
- Gemini API Called: **FALSE**
- Datasets Downloaded/Modified: **FALSE**
- Existing Splits Changed: **FALSE**

**Status:** Both `ui-understanding-v0.1.0` and `ui-understanding-v0.2.0` remain strictly **candidate**.
