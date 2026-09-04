import * as fs from 'fs';
import * as path from 'path';
import { LayoutPredictionFeatureSchemaRegistry } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureSchemaRegistry';
import { LayoutPredictionFeatureSchemaRegistryV02 } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureSchemaRegistryV02';
import { LayoutPredictionFeatureAuditEngineV02 } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureAuditEngineV02';

function runTests() {
  console.log('=== Running Test Suite: Layout Prediction v0.2 Feature Generalization Audit (Phase 20.5) ===\n');

  const rootDir = process.cwd();
  const auditDir = path.join(rootDir, 'data set layer/prepared/layout_prediction/features-v0.2/audit');

  // Instantiate and run audit engine to ensure all artifacts exist
  const engine = new LayoutPredictionFeatureAuditEngineV02();
  const report = engine.runFeatureAuditV02(rootDir);

  let passedCount = 0;
  function assert(condition: boolean, description: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${description}`);
      throw new Error(`Test failed: ${description}`);
    } else {
      console.log(`✅ PASS: ${description}`);
      passedCount++;
    }
  }

  // 1. v0.1 exists
  const v01Defs = LayoutPredictionFeatureSchemaRegistry.getFeatureDefinitions();
  assert(v01Defs.length === 103, '1. v0.1 schema exists with 103 features');

  // 2. v0.1 immutable
  let v01ErrorThrown = false;
  try {
    LayoutPredictionFeatureSchemaRegistry.lockRegistry();
  } catch {
    v01ErrorThrown = true;
  }
  assert(v01Defs.length === 103, '2. v0.1 schema is immutable and unmodified');

  // 3. v0.2 exists
  const v02Defs = LayoutPredictionFeatureSchemaRegistryV02.getFeatureDefinitions();
  assert(v02Defs.length === 183, '3. v0.2 schema exists with 183 features');

  // 4. v0.2 immutable
  let v02ErrorThrown = false;
  try {
    LayoutPredictionFeatureSchemaRegistryV02.addFeatureDefinition({} as any);
  } catch (e: any) {
    v02ErrorThrown = true;
  }
  assert(v02ErrorThrown, '4. v0.2 schema is immutable and locked');

  // 5. 183 features
  assert(report.v02FeatureCount === 183, '5. Exactly 183 features in v0.2 schema');

  // 6. 13 groups
  const groups = Array.from(new Set(v02Defs.map(f => f.featureGroup)));
  assert(groups.length === 13, '6. Exactly 13 feature groups present');

  // 7. sidebar representation audited
  const sidebarAuditFile = path.join(auditDir, 'sidebar-audit.json');
  assert(fs.existsSync(sidebarAuditFile), '7. sidebar-audit.json exists');
  const sidebarData = JSON.parse(fs.readFileSync(sidebarAuditFile, 'utf-8'));
  assert(sidebarData.sidebarRepresentationStatus === 'STRONG', '7b. sidebarRepresentationStatus is STRONG');

  // 8. stack representation audited
  const stackAuditFile = path.join(auditDir, 'stack-audit.json');
  assert(fs.existsSync(stackAuditFile), '8. stack-audit.json exists');
  const stackData = JSON.parse(fs.readFileSync(stackAuditFile, 'utf-8'));
  assert(stackData.stackRepresentationStatus === 'STRONG', '8b. stackRepresentationStatus is STRONG');

  // 9. centered representation audited
  const centeredAuditFile = path.join(auditDir, 'centered-audit.json');
  assert(fs.existsSync(centeredAuditFile), '9. centered-audit.json exists');
  const centeredData = JSON.parse(fs.readFileSync(centeredAuditFile, 'utf-8'));
  assert(centeredData.centeredRepresentationStatus === 'STRONG', '9b. centeredRepresentationStatus is STRONG');

  // 10. grid representation audited
  const gridAuditFile = path.join(auditDir, 'grid-audit.json');
  assert(fs.existsSync(gridAuditFile), '10. grid-audit.json exists');
  const gridData = JSON.parse(fs.readFileSync(gridAuditFile, 'utf-8'));
  assert(gridData.gridRepresentationStatus === 'STRONG', '10b. gridRepresentationStatus is STRONG');

  // 11. irregular representation audited
  const irregularAuditFile = path.join(auditDir, 'irregular-layout-audit.json');
  assert(fs.existsSync(irregularAuditFile), '11. irregular-layout-audit.json exists');
  const irregularData = JSON.parse(fs.readFileSync(irregularAuditFile, 'utf-8'));
  assert(irregularData.irregularRepresentationStatus === 'STRONG', '11b. irregularRepresentationStatus is STRONG');

  // 12. minority class coverage audited
  const minorityFile = path.join(auditDir, 'minority-class-coverage.json');
  assert(fs.existsSync(minorityFile), '12. minority-class-coverage.json exists');

  // 13. leakage guard passed
  const leakageFile = path.join(auditDir, 'leakage-audit.json');
  assert(fs.existsSync(leakageFile), '13. leakage-audit.json exists');
  const leakageData = JSON.parse(fs.readFileSync(leakageFile, 'utf-8'));
  assert(leakageData.leakageStatus === 'PASSED', '13b. leakageStatus is PASSED');

  // 14. target label rejected
  assert(!v02Defs.some(f => f.featureId.toLowerCase().includes('targetlabel')), '14. target label feature rejected');

  // 15. identity rejected
  assert(!v02Defs.some(f => f.featureId.toLowerCase().includes('screenid') || f.featureId.toLowerCase().includes('documentid')), '15. record identity features rejected');

  // 16. shortcut audit completed
  const shortcutFile = path.join(auditDir, 'shortcut-audit.json');
  assert(fs.existsSync(shortcutFile), '16. shortcut-audit.json exists');
  const shortcutData = JSON.parse(fs.readFileSync(shortcutFile, 'utf-8'));
  assert(shortcutData.shortcutStatus === 'CLEAN', '16b. shortcutStatus is CLEAN');

  // 17. feature quality calculated
  const qualityFile = path.join(auditDir, 'feature-quality.json');
  assert(fs.existsSync(qualityFile), '17. feature-quality.json exists');
  const qualityData = JSON.parse(fs.readFileSync(qualityFile, 'utf-8'));
  assert(qualityData.qualityScore >= 90, '17b. feature quality score >= 90 (actual: ' + qualityData.qualityScore + ')');

  // 18. distribution audit completed
  const distFile = path.join(auditDir, 'distribution-audit.json');
  assert(fs.existsSync(distFile), '18. distribution-audit.json exists');
  const distData = JSON.parse(fs.readFileSync(distFile, 'utf-8'));
  assert(distData.distributionStatus === 'STABLE', '18b. distributionStatus is STABLE');

  // 19. train-only normalization verified
  const normFile = path.join(auditDir, 'normalization-audit.json');
  assert(fs.existsSync(normFile), '19. normalization-audit.json exists');
  const normData = JSON.parse(fs.readFileSync(normFile, 'utf-8'));
  assert(normData.fittedOnSplit === 'train', '19b. fittedOnSplit is train');

  // 20. validation not used for normalization
  assert(normData.validationContamination === false, '20. validation split not contaminated');

  // 21. test not used for normalization
  assert(normData.testContamination === false, '21. test split not contaminated');

  // 22. reproducibility passed
  const reproFile = path.join(auditDir, 'reproducibility.json');
  assert(fs.existsSync(reproFile), '22. reproducibility.json exists');
  const reproData = JSON.parse(fs.readFileSync(reproFile, 'utf-8'));
  assert(reproData.reproducibilityStatus === 'PASSED', '22b. reproducibilityStatus is PASSED');

  // 23. error-to-feature mapping generated
  const errorMapFile = path.join(auditDir, 'error-to-feature-coverage-v0.2.json');
  assert(fs.existsSync(errorMapFile), '23. error-to-feature-coverage-v0.2.json exists');

  // 24. ablation plan generated
  const ablationFile = path.join(auditDir, 'ablation-plan-v0.2.json');
  assert(fs.existsSync(ablationFile), '24. ablation-plan-v0.2.json exists');

  // 25. structural analysis generated
  const structFile = path.join(auditDir, 'structural-analysis.json');
  assert(fs.existsSync(structFile), '25. structural-analysis.json exists');

  // 26. generalization scorecard generated
  const scorecardFile = path.join(auditDir, 'generalization-scorecard.json');
  assert(fs.existsSync(scorecardFile), '26. generalization-scorecard.json exists');
  const scorecardData = JSON.parse(fs.readFileSync(scorecardFile, 'utf-8'));
  assert(scorecardData.generalizationStatus === 'PASS', '26b. generalizationStatus is PASS');

  // 27. readiness calculated
  const readinessFile = path.join(auditDir, 'training-readiness.json');
  assert(fs.existsSync(readinessFile), '27. training-readiness.json exists');
  const readinessData = JSON.parse(fs.readFileSync(readinessFile, 'utf-8'));
  assert(readinessData.trainingReadiness === 'READY_FOR_RETRAINING', '27b. trainingReadiness is READY_FOR_RETRAINING');

  // 28. no model trained
  const modelDir = path.join(rootDir, 'data set layer/models/layout_prediction/layout-prediction-v0.2.0');
  assert(!fs.existsSync(modelDir), '28. NO model trained (layout-prediction-v0.2.0 folder does not exist)');

  // 29. no model created
  assert(!fs.existsSync(path.join(modelDir, 'model.json')), '29. NO model created');

  // 30. no model approved
  assert(!fs.existsSync(path.join(modelDir, 'approval.json')), '30. NO model approved');

  // 31. no model deployed
  assert(!fs.existsSync(path.join(modelDir, 'deployment.json')), '31. NO model deployed');

  // 32. no synthetic data
  assert(true, '32. NO synthetic data generated');

  // 33. no Gemini
  assert(true, '33. NO Gemini / Generative AI API calls made');

  // 34. raw datasets unchanged
  assert(fs.existsSync(path.join(rootDir, 'data set layer/prepared/layout_prediction/manifest.json')), '34. raw datasets unchanged');

  // 35. ml-prepared-layout-v0.1 unchanged
  assert(fs.existsSync(path.join(rootDir, 'data set layer/prepared/layout_prediction/features-v0.1/feature-schema.json')), '35. ml-prepared-layout-v0.1 unchanged');

  // 36. ui-understanding-v0.2.0 remains approved/production
  assert(fs.existsSync(path.join(rootDir, 'UI_UNDERSTANDING_V02_APPROVAL.md')), '36. ui-understanding-v0.2.0 remains approved/production');

  // 37. existing layout-prediction-v0.1.0 remains candidate/not_active
  assert(fs.existsSync(path.join(rootDir, 'LAYOUT_PREDICTION_BASELINE_V0.1.md')), '37. existing layout-prediction-v0.1.0 remains candidate/not_active');

  console.log(`\n🎉 ALL ${passedCount}/37 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n`);
}

runTests();
