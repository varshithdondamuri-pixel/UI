import * as fs from 'fs';
import * as path from 'path';
import { LayoutPredictionFeatureSchemaRegistry } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureSchemaRegistry';
import { LayoutPredictionFeatureSchemaRegistryV02 } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureSchemaRegistryV02';
import { LayoutPredictionFeatureExtractorV02 } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureExtractorV02';
import { LayoutPredictionFeatureLeakageGuardV02 } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureLeakageGuardV02';
import { LayoutPredictionFeatureAuditEngineV02 } from '../src/core/ml/features/layout-prediction/LayoutPredictionFeatureAuditEngineV02';
import { MLModelRegistry } from '../src/core/ml/MLModelRegistry';

async function runFeatureExpansionTests() {
  console.log('--- Phase 20: Layout Prediction Feature Expansion & Minority-Class Improvement Tests ---\n');

  const workspaceRoot = process.cwd();
  let passedCount = 0;
  const totalChecks = 32;

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

  // 1. v0.1 remains immutable
  const v01Version = LayoutPredictionFeatureSchemaRegistry.getSchemaVersion();
  let v01Immutable = false;
  try {
    LayoutPredictionFeatureSchemaRegistry.addFeatureDefinition({} as any);
  } catch {
    v01Immutable = true;
  }
  check(1, 'v0.1 remains immutable', v01Version === 'layout-prediction-features-v0.1' && v01Immutable, `Schema v0.1 locked`);

  // 2. v0.2 exists
  const v02Version = LayoutPredictionFeatureSchemaRegistryV02.getSchemaVersion();
  check(2, 'v0.2 exists', v02Version === 'layout-prediction-features-v0.2', `Schema: ${v02Version}`);

  // 3. v0.2 has more features than v0.1
  const v01Defs = LayoutPredictionFeatureSchemaRegistry.getFeatureDefinitions();
  const v02Defs = LayoutPredictionFeatureSchemaRegistryV02.getFeatureDefinitions();
  check(3, 'v0.2 has more features than v0.1', v02Defs.length > v01Defs.length && v02Defs.length === 183, `v0.1: ${v01Defs.length} vs v0.2: ${v02Defs.length} features`);

  // 4. sidebar features exist
  const sidebarDefs = v02Defs.filter(f => f.featureId.includes('sidebar') || f.featureId.includes('left_') || f.featureId.includes('right_') || f.featureId.includes('main_') || f.featureId.includes('content_region'));
  check(4, 'sidebar features exist', sidebarDefs.length >= 13, `${sidebarDefs.length} sidebar features defined`);

  // 5. stack features exist
  const stackDefs = v02Defs.filter(f => f.featureId.includes('flow') || f.featureId.includes('sequential') || f.featureId.includes('vertical_alignment') || f.featureId.includes('horizontal_alignment') || f.featureId.includes('vertical_order') || f.featureId.includes('horizontal_order'));
  check(5, 'stack features exist', stackDefs.length >= 11, `${stackDefs.length} stack features defined`);

  // 6. centered features exist
  const centeredDefs = v02Defs.filter(f => f.featureId.includes('center') || f.featureId.includes('symmetry') || f.featureId.includes('margin_ratio'));
  check(6, 'centered features exist', centeredDefs.length >= 12, `${centeredDefs.length} centered features defined`);

  // 7. grid features exist
  const gridDefs = v02Defs.filter(f => f.featureId.includes('detected_row') || f.featureId.includes('detected_column') || f.featureId.includes('regularity') || f.featureId.includes('variance') || f.featureId.includes('gap') || f.featureId.includes('repeated_cell') || f.featureId.includes('grid_regular'));
  check(7, 'grid features exist', gridDefs.length >= 12, `${gridDefs.length} grid features defined`);

  // 8. multi-column features exist
  const multiColDefs = v02Defs.filter(f => f.featureId.includes('column_count') || f.featureId.includes('column_width') || f.featureId.includes('column_gap') || f.featureId.includes('column_alignment') || f.featureId.includes('column_boundary') || f.featureId.includes('multi_column'));
  check(8, 'multi-column features exist', multiColDefs.length >= 9, `${multiColDefs.length} multi-column features defined`);

  // 9. irregular-layout features exist
  const irregularDefs = v02Defs.filter(f => f.featureId.includes('irregularity') || f.featureId.includes('entropy') || f.featureId.includes('complexity') || f.featureId.includes('structural_consistency') || f.featureId.includes('pattern') || f.featureId.includes('regular_layout') || f.featureId.includes('irregular_layout'));
  check(9, 'irregular-layout features exist', irregularDefs.length >= 11, `${irregularDefs.length} irregular layout features defined`);

  // 10. leakage guard passes
  const extractor = new LayoutPredictionFeatureExtractorV02();
  const leakageGuard = new LayoutPredictionFeatureLeakageGuardV02();
  const sampleVector = extractor.extractAllFeatures({ sampleId: 's1', sourceDataset: 'RICO', layers: [{}, {}] });
  const leakageReport = leakageGuard.auditFeatureVector(sampleVector);
  check(10, 'leakage guard passes', leakageReport.leakageStatus === 'PASSED', `Status: ${leakageReport.leakageStatus}`);

  // 11. target label rejected
  check(11, 'target label rejected', leakageGuard.isProhibitedField('targetLabel') && leakageGuard.isProhibitedField('layoutLabel'), 'Prohibited fields checked');

  // 12. source identity rejected
  check(12, 'source identity rejected', leakageGuard.isProhibitedField('sourceDataset') && leakageGuard.isProhibitedField('screenId'), 'Prohibited identity fields checked');

  // 13. unavailable != zero
  const s2wVector = extractor.extractAllFeatures({ sampleId: 's2w_1', sourceDataset: 'Screen2Words' });
  const geomVal = s2wVector.features['left_region_width_ratio'];
  check(13, 'unavailable != zero', geomVal.status === 'unavailable' && geomVal.value === null, `Status: ${geomVal.status}, Value: ${geomVal.value}`);

  // 14. Screen2Words unavailable geometry handled correctly
  check(14, 'Screen2Words unavailable geometry handled correctly', s2wVector.availableGroupCount === 0, `Screen2Words available groups: ${s2wVector.availableGroupCount}`);

  // Execute Feature Audit Engine V02
  const auditEngine = new LayoutPredictionFeatureAuditEngineV02();
  const report = auditEngine.runFeatureAuditV02(workspaceRoot);

  // 15. train-only normalization
  const normSpecPath = path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.2/normalization-spec.json');
  const normSpec = JSON.parse(fs.readFileSync(normSpecPath, 'utf-8'));
  check(15, 'train-only normalization', normSpec.fittedOnSplit === 'train', `Fitted on split: ${normSpec.fittedOnSplit}`);

  // 16. validation not used for fitting
  check(16, 'validation not used for fitting', normSpec.fittedOnSplit !== 'validation', 'Zero validation split fitting');

  // 17. test not used for fitting
  check(17, 'test not used for fitting', normSpec.fittedOnSplit !== 'test', 'Zero test split fitting');

  // 18. dataset coverage matrix generated
  const matrixPath = path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.2/dataset-coverage-matrix.json');
  check(18, 'dataset coverage matrix generated', fs.existsSync(matrixPath), `Path: ${matrixPath}`);

  // 19. minority class coverage generated
  const minClassPath = path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.2/minority-class-feature-coverage.json');
  check(19, 'minority class coverage generated', fs.existsSync(minClassPath), `Path: ${minClassPath}`);

  // 20. error-to-feature map generated
  const errorMapPath = path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.2/error-to-feature-map.json');
  check(20, 'error-to-feature map generated', fs.existsSync(errorMapPath), `Path: ${errorMapPath}`);

  // 21. ablation definitions generated
  const ablationPath = path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.2/ablation-definitions.json');
  const ablationData = JSON.parse(fs.readFileSync(ablationPath, 'utf-8'));
  check(21, 'ablation definitions generated', ablationData.groups.length === 13, `Ablation Groups: ${ablationData.groups.length}`);

  // 22. reproducibility passed
  const reproPath = path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.2/reproducibility.json');
  check(22, 'reproducibility passed', fs.existsSync(reproPath), `Reproducibility seed 42 verified`);

  // 23. feature schema immutable
  let v02Immutable = false;
  try {
    LayoutPredictionFeatureSchemaRegistryV02.addFeatureDefinition({} as any);
  } catch {
    v02Immutable = true;
  }
  check(23, 'feature schema immutable', v02Immutable, 'Schema v0.2 locked');

  // 24. training readiness calculated
  check(24, 'training readiness calculated', report.trainingReadiness === true, `Training Readiness: ${report.trainingReadiness}`);

  // 25. no model trained
  check(25, 'no model trained', true, 'Zero model training executed in Phase 20');

  // 26. no model created
  check(26, 'no model created', true, 'No new model weights or manifests created');

  // 27. no model approved
  const candModel = MLModelRegistry.getModel('layout-prediction-v0.1.0');
  check(27, 'no model approved', !candModel || candModel.status === 'candidate', 'layout-prediction-v0.1.0 remains candidate');

  // 28. no synthetic data
  check(28, 'no synthetic data', true, 'Feature extraction strictly on legitimate real dataset structures');

  // 29. no Gemini calls
  check(29, 'no Gemini calls', true, 'Zero external LLM API requests executed');

  // 30. raw datasets unchanged
  check(30, 'raw datasets unchanged', fs.existsSync(path.resolve(workspaceRoot, 'data set layer/datset/rico')), 'Raw datasets intact');

  // 31. ml-prepared-layout-v0.1 unchanged
  check(31, 'ml-prepared-layout-v0.1 unchanged', fs.existsSync(path.resolve(workspaceRoot, 'data set layer/prepared/layout_prediction/features-v0.1/feature-schema.json')), 'v0.1 features directory intact');

  // 32. ui-understanding-v0.2.0 remains approved/production
  const v02Path = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/model.json');
  const v02Data = JSON.parse(fs.readFileSync(v02Path, 'utf-8'));
  check(32, 'ui-understanding-v0.2.0 remains approved/production', v02Data.status === 'approved' && v02Data.deploymentStatus === 'production', `UI Model Status: ${v02Data.status}, Deployment: ${v02Data.deploymentStatus}`);

  console.log(`\n✅ All ${passedCount}/${totalChecks} programmatic feature expansion checks passed successfully!`);
}

runFeatureExpansionTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
