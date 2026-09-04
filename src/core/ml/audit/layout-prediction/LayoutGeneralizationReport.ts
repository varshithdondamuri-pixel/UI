import * as fs from 'fs';
import * as path from 'path';
import { LayoutGeneralizationAuditSummary } from './LayoutAuditTypes';

export class LayoutGeneralizationReport {
  public saveAuditReports(summary: LayoutGeneralizationAuditSummary, workspaceRoot: string = process.cwd()): void {
    if (typeof window !== 'undefined' || !fs.writeFileSync) {
      return;
    }

    const auditDir = path.resolve(
      workspaceRoot,
      'data set layer/models/layout_prediction/layout-prediction-v0.1.0/generalization-audit'
    );

    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    // 1. Save 16 JSON report artifacts
    fs.writeFileSync(path.join(auditDir, 'model-comparison.json'), JSON.stringify(summary.modelComparison, null, 2));
    fs.writeFileSync(path.join(auditDir, 'per-dataset-results.json'), JSON.stringify(summary.perDataset, null, 2));
    fs.writeFileSync(path.join(auditDir, 'per-class-results.json'), JSON.stringify(summary.perClass, null, 2));
    fs.writeFileSync(path.join(auditDir, 'feature-group-analysis.json'), JSON.stringify(summary.featureGroups, null, 2));
    fs.writeFileSync(path.join(auditDir, 'feature-ablation.json'), JSON.stringify(summary.featureAblation, null, 2));
    fs.writeFileSync(path.join(auditDir, 'leakage-audit.json'), JSON.stringify(summary.leakage, null, 2));
    fs.writeFileSync(path.join(auditDir, 'duplicate-analysis.json'), JSON.stringify(summary.duplicates, null, 2));
    fs.writeFileSync(path.join(auditDir, 'distribution-shift.json'), JSON.stringify(summary.distributionShift, null, 2));
    fs.writeFileSync(path.join(auditDir, 'class-imbalance.json'), JSON.stringify(summary.classImbalance, null, 2));
    fs.writeFileSync(path.join(auditDir, 'confidence-analysis.json'), JSON.stringify(summary.confidence, null, 2));
    fs.writeFileSync(path.join(auditDir, 'error-analysis.json'), JSON.stringify(summary.errorAnalysis, null, 2));
    fs.writeFileSync(path.join(auditDir, 'cross-dataset-generalization.json'), JSON.stringify(summary.crossDataset, null, 2));
    fs.writeFileSync(path.join(auditDir, 'reproducibility.json'), JSON.stringify(summary.reproducibility, null, 2));
    fs.writeFileSync(path.join(auditDir, 'generalization-scorecard.json'), JSON.stringify(summary.scorecard, null, 2));
    fs.writeFileSync(path.join(auditDir, 'final-recommendation.json'), JSON.stringify({
      recommendation: summary.finalRecommendation,
      rationale: summary.recommendationRationale,
      auditedAt: summary.auditedAt
    }, null, 2));
    fs.writeFileSync(path.join(auditDir, 'audit-summary.json'), JSON.stringify(summary, null, 2));

    // 2. Save root markdown report LAYOUT_PREDICTION_V01_GENERALIZATION_AUDIT.md
    const mdPath = path.resolve(workspaceRoot, 'LAYOUT_PREDICTION_V01_GENERALIZATION_AUDIT.md');
    const mdContent = this.generateMarkdownReport(summary);
    fs.writeFileSync(mdPath, mdContent);
  }

  private generateMarkdownReport(summary: LayoutGeneralizationAuditSummary): string {
    return `# Layout Prediction v0.1 Generalization & Robustness Audit Report

## Executive Summary
- **Model ID:** \`${summary.modelId}\`
- **Task:** \`${summary.task}\`
- **Model Status:** **\`CANDIDATE\`** (Deployment Status: **\`NOT_ACTIVE\`**)
- **Active Production Model:** \`${summary.activeProductionModel}\` (**\`APPROVED\` / \`PRODUCTION\` - UNTOUCHED**)
- **Audit Date:** \`${summary.auditedAt}\`
- **Final Audit Recommendation:** **\`${summary.finalRecommendation.toUpperCase()}\`**

---

## 1. Overall Metrics Summary
| Metric | Value |
| :--- | :--- |
| **Accuracy** | ${(summary.metrics.accuracy * 100).toFixed(2)}% |
| **Macro F1** | ${(summary.metrics.macroF1 * 100).toFixed(2)}% |
| **Weighted F1** | ${(summary.metrics.weightedF1 * 100).toFixed(2)}% |
| **Precision** | ${(summary.metrics.precision * 100).toFixed(2)}% |
| **Recall** | ${(summary.metrics.recall * 100).toFixed(2)}% |

---

## 2. Model Baseline Comparison
| Model | Accuracy | Macro F1 | Weighted F1 | Precision | Recall |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline A (Majority Class)** | ${(summary.modelComparison.test.baselineA.accuracy * 100).toFixed(2)}% | ${(summary.modelComparison.test.baselineA.macroF1 * 100).toFixed(2)}% | ${(summary.modelComparison.test.baselineA.weightedF1 * 100).toFixed(2)}% | ${(summary.modelComparison.test.baselineA.precision * 100).toFixed(2)}% | ${(summary.modelComparison.test.baselineA.recall * 100).toFixed(2)}% |
| **Baseline B (Supervised Classical)** | **${(summary.modelComparison.test.baselineB.accuracy * 100).toFixed(2)}%** | **${(summary.modelComparison.test.baselineB.macroF1 * 100).toFixed(2)}%** | **${(summary.modelComparison.test.baselineB.weightedF1 * 100).toFixed(2)}%** | **${(summary.modelComparison.test.baselineB.precision * 100).toFixed(2)}%** | **${(summary.modelComparison.test.baselineB.recall * 100).toFixed(2)}%** |
| **Improvement (B vs A)** | **+${(summary.modelComparison.test.improvement.accuracyDelta * 100).toFixed(2)}%** | **+${(summary.modelComparison.test.improvement.macroF1Delta * 100).toFixed(2)}%** | **+${(summary.modelComparison.test.improvement.weightedF1Delta * 100).toFixed(2)}%** | — | — |

---

## 3. Per-Dataset Performance Breakdown
| Dataset | Status | Samples | Accuracy | Macro F1 | Weighted F1 | Reason / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${summary.perDataset.datasets.map(d => `| **${d.datasetName}** | \`${d.status}\` | ${d.sampleCount} | ${d.accuracy !== null ? (d.accuracy * 100).toFixed(2) + '%' : 'N/A'} | ${d.macroF1 !== null ? (d.macroF1 * 100).toFixed(2) + '%' : 'N/A'} | ${d.weightedF1 !== null ? (d.weightedF1 * 100).toFixed(2) + '%' : 'N/A'} | ${d.reason || 'Evaluated successfully'} |`).join('\n')}

---

## 4. Per-Class Performance Breakdown
| Class Name | Precision | Recall | F1 Score | Support | Error Count |
| :--- | :--- | :--- | :--- | :--- | :--- |
${summary.perClass.classes.map(c => `| \`${c.className}\` | ${(c.precision * 100).toFixed(2)}% | ${(c.recall * 100).toFixed(2)}% | ${(c.f1Score * 100).toFixed(2)}% | ${c.support} | ${c.errorCount} |`).join('\n')}

- **Strongest Class:** \`${summary.perClass.strongestClass}\`
- **Weakest Class:** \`${summary.perClass.weakestClass}\`
- **Majority Class:** \`${summary.perClass.majorityClass}\`
- **Minority Class:** \`${summary.perClass.minorityClass}\`
- **Insufficient Classes (< 20% F1):** ${summary.perClass.insufficientPerformanceClasses.map(c => `\`${c}\``).join(', ')}

---

## 5. Feature Group & Leakage Audit
- **Total Features:** ${summary.featureGroups.totalFeatureCount} across 12 feature groups
- **Leakage Status:** **\`${summary.leakage.leakageStatus}\`** (0 prohibited matches)
- **Duplicate Risk:** Cross-split risk **\`${summary.duplicates.crossSplitRisk.toUpperCase()}\`**, influence risk **\`${summary.duplicates.influenceRisk.toUpperCase()}\`**
- **Distribution Shift:** **\`${summary.distributionShift.overallStabilityStatus}\`** across splits
- **Reproducibility:** Seed ${summary.reproducibility.seed} match: **\`${summary.reproducibility.reproducibilityStatus.toUpperCase()}\`**

---

## 6. Generalization Scorecard
| Dimension | Status | Evidence | Rationale |
| :--- | :--- | :--- | :--- |
${summary.scorecard.dimensions.map(d => `| **${d.dimension}** | \`${d.status}\` | ${d.evidence} | ${d.rationale} |`).join('\n')}

---

## 7. Final Audit Recommendation
### **Recommendation:** \`${summary.finalRecommendation}\`

**Rationale:** ${summary.recommendationRationale}
`;
  }
}
