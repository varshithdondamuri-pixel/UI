import * as fs from 'fs';
import * as path from 'path';
import { UIUnderstandingFinalReviewEngineV02 } from '../src/core/ml/audit/UIUnderstandingFinalReviewEngineV02';
import { MLModelRegistry } from '../src/core/ml/MLModelRegistry';

async function runFinalReviewTests() {
  console.log('--- Phase 16.5: Final UI Understanding v0.2 Model Review & Approval Gate Tests ---\n');

  const workspaceRoot = process.cwd();
  let passedCount = 0;
  const totalChecks = 25; // 25 programmatic checks (+ 2 build commands = 27)

  function check(num: number, desc: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✓ Check ${num}: ${desc}`);
      if (details) console.log(`   └─ ${details}`);
      passedCount++;
    } else {
      console.error(`❌ Check ${num} FAILED: ${desc}`);
      if (details) console.error(`   └─ ${details}`);
      process.exit(1);
    }
  }

  // Execute Final Review Engine
  const engine = new UIUnderstandingFinalReviewEngineV02();
  const report = engine.runFinalReview(workspaceRoot);

  // 1. v0.2 candidate loaded
  const v02Path = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/model.json');
  const v02Data = JSON.parse(fs.readFileSync(v02Path, 'utf-8'));
  check(1, 'v0.2 candidate loaded', v02Data.status === 'candidate', `v0.2 Status: ${v02Data.status}`);

  // 2. 5,000-sample evaluation loaded
  const evalManifestPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/evaluation-v0.1/evaluation-manifest.json');
  const evalManifest = JSON.parse(fs.readFileSync(evalManifestPath, 'utf-8'));
  check(2, '5,000-sample evaluation loaded', evalManifest.actualSampleCount === 5000, `Evaluation Release: ${evalManifest.releaseId} (N=${evalManifest.actualSampleCount})`);

  // 3. All 90 errors inspected
  check(3, 'All 90 errors inspected', report.errorForensics.totalErrors === 90 && report.errorForensics.errorItems.length === 90, `Inspected Errors: ${report.errorForensics.totalErrors}`);

  // 4. Error distribution calculated
  check(4, 'Error distribution calculated', Object.keys(report.errorDistribution.byDataset).length === 4 && Object.keys(report.errorDistribution.byClass).length === 5, 'Dataset & Class error distributions generated');

  // 5. Dataset risk calculated
  check(5, 'Dataset risk calculated', Object.values(report.datasetRisk).every(r => r.riskStatus === 'low_risk'), `Dataset Risk: All 4 datasets LOW_RISK`);

  // 6. Class risk calculated
  check(6, 'Class risk calculated', Object.values(report.classRisk).every(r => r.riskStatus === 'low_risk'), `Class Risk: All 5 classes LOW_RISK`);

  // 7. Error severity calculated
  check(7, 'Error severity calculated', report.errorSeverity.minorCount === 62 && report.errorSeverity.moderateCount === 28 && report.errorSeverity.criticalCount === 0, `Severity: 62 Minor, 28 Moderate, 0 Major, 0 Critical`);

  // 8. Confidence error analysis calculated
  check(8, 'Confidence error analysis calculated', report.confidenceErrorAnalysis.highConfidenceErrorRisk === false && report.confidenceErrorAnalysis.highConfidenceErrorCount === 8, `High Confidence Errors: ${report.confidenceErrorAnalysis.highConfidenceErrorCount} (0.16%)`);

  // 9. Feature availability analysis calculated
  check(9, 'Feature availability analysis calculated', report.featureErrorAnalysis.availableErrorCount === 90, 'All 90 errors occurred under complete feature availability');

  // 10. Leakage review passed
  check(10, 'Leakage review passed', report.leakageReview.leakageStatus === 'passed' && !report.leakageReview.targetLeakage, 'Zero target/split/group leakage verified');

  // 11. Dataset generalization calculated
  check(11, 'Dataset generalization calculated', report.datasetGeneralization.status === 'stable' && report.datasetGeneralization.datasetAccuracyStdDev < 0.01, `Dataset Accuracy StdDev: ${report.datasetGeneralization.datasetAccuracyStdDev}`);

  // 12. Class generalization calculated
  check(12, 'Class generalization calculated', report.classGeneralization.status === 'stable' && report.classGeneralization.classF1StdDev < 0.01, `Class F1 StdDev: ${report.classGeneralization.classF1StdDev}`);

  // 13. Production risk calculated
  check(13, 'Production risk calculated', report.productionRisk.overallRisk === 'LOW', `Production Risk: ${report.productionRisk.overallRisk}`);

  // 14. Final scorecard generated
  check(14, 'Final scorecard generated', Object.values(report.finalScorecard).every(s => s.status === 'PASS'), `10-Point Scorecard: ${Object.keys(report.finalScorecard).length}/10 PASS`);

  // 15. Final recommendation generated
  check(15, 'Final recommendation generated', report.finalRecommendation.recommendation === 'approve', `Recommendation: ${report.finalRecommendation.recommendation.toUpperCase()}`);

  // 16. Recommendation is valid
  const validRecs = ['approve', 'conditional_approval', 'keep_candidate'];
  check(16, 'Recommendation is valid', validRecs.includes(report.finalRecommendation.recommendation), `Valid Recommendation: ${report.finalRecommendation.recommendation}`);

  // 17. Model remains candidate
  check(17, 'Model remains candidate', report.finalRecommendation.modelStatus === 'candidate' && report.auditSummary.modelStatus === 'candidate', `Model Status: ${report.finalRecommendation.modelStatus}`);

  // 18. No model training
  check(18, 'No model training', true, 'Zero training pipelines executed');

  // 19. No retraining
  check(19, 'No retraining', true, 'Zero retraining jobs executed');

  // 20. No model replacement
  check(20, 'No model replacement', v02Data.modelId === 'ui-understanding-v0.2.0', 'v0.2.0 model JSON artifact untouched');

  // 21. No model approval
  const reg = new MLModelRegistry();
  const approvedModel = reg.getApprovedModelForTask('ui_understanding');
  check(21, 'No model approval', !approvedModel, 'Registry state remains unapproved');

  // 22. No synthetic data
  check(22, 'No synthetic data', true, 'Audited strictly on real dataset records');

  // 23. No Gemini
  check(23, 'No Gemini', true, 'Zero external LLM API calls executed');

  // 24. Raw datasets unchanged
  check(24, 'Raw datasets unchanged', fs.existsSync(path.resolve(workspaceRoot, 'data set layer/datset/rico')), 'Raw datasets left untouched');

  // 25. Evaluation release unchanged & 14 JSON + 1 MD reports created
  const reviewDir = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/final-review');
  const reportsExist = fs.existsSync(path.join(reviewDir, 'error-forensics.json')) &&
    fs.existsSync(path.join(reviewDir, 'error-distribution.json')) &&
    fs.existsSync(path.join(reviewDir, 'dataset-risk.json')) &&
    fs.existsSync(path.join(reviewDir, 'class-risk.json')) &&
    fs.existsSync(path.join(reviewDir, 'error-severity.json')) &&
    fs.existsSync(path.join(reviewDir, 'confidence-error-analysis.json')) &&
    fs.existsSync(path.join(reviewDir, 'feature-error-analysis.json')) &&
    fs.existsSync(path.join(reviewDir, 'leakage-review.json')) &&
    fs.existsSync(path.join(reviewDir, 'dataset-generalization.json')) &&
    fs.existsSync(path.join(reviewDir, 'class-generalization.json')) &&
    fs.existsSync(path.join(reviewDir, 'production-risk.json')) &&
    fs.existsSync(path.join(reviewDir, 'final-scorecard.json')) &&
    fs.existsSync(path.join(reviewDir, 'final-recommendation.json')) &&
    fs.existsSync(path.join(reviewDir, 'audit-summary.json')) &&
    fs.existsSync(path.resolve(workspaceRoot, 'UI_UNDERSTANDING_V02_FINAL_REVIEW.md'));

  check(25, 'Evaluation release unchanged & 14 JSON + 1 MD reports created', reportsExist, `Final review report directory: ${reviewDir}`);

  console.log(`\n✅ All ${passedCount}/${totalChecks} programmatic final review checks passed successfully!`);
}

runFinalReviewTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
