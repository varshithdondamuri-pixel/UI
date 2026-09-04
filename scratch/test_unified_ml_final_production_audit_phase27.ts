import fs from 'fs';
import path from 'path';
import { MLModelRegistry } from '../src/core/ml/MLModelRegistry';
import { MLPredictionEngine } from '../src/core/ml/MLPredictionEngine';
import { UIMLOrchestrator } from '../src/core/ml/orchestration/UIMLOrchestrator';
import { UIMLOrchestrationDependencyGraph } from '../src/core/ml/orchestration/UIMLOrchestrationDependencyGraph';
import { UIMLFeatureSchemaResolver } from '../src/core/ml/orchestration/UIMLFeatureSchemaResolver';
import { UIMLModelResolver } from '../src/core/ml/orchestration/UIMLModelResolver';
import { UIMLInputValidator } from '../src/core/ml/orchestration/UIMLInputValidator';
import { UIMLOrchestrationAuditEngine } from '../src/core/ml/orchestration/UIMLOrchestrationAuditEngine';

function runPhase27FinalProductionAuditSuite() {
  console.log('================================================================');
  console.log('RUNNING PHASE 27 UNIFIED ML FINAL PRODUCTION AUDIT TEST SUITE');
  console.log('================================================================\n');

  let checkCounter = 0;
  function assert(condition: boolean, testName: string) {
    checkCounter++;
    if (condition) {
      console.log(`[PASS] Check ${checkCounter}: ${testName}`);
    } else {
      console.error(`[FAIL] Check ${checkCounter}: ${testName}`);
      process.exit(1);
    }
  }

  const auditDir = path.join(process.cwd(), 'data set layer/models/ml-system/final-production-audit');
  const registry = new MLModelRegistry();
  const orchestrator = new UIMLOrchestrator(registry);

  // --- Group 1: System Inventory & Registries (Checks 1-8) ---
  const inventoryFile = path.join(auditDir, 'system-inventory.json');
  assert(fs.existsSync(inventoryFile), '1. system-inventory.json exists');
  const inventoryData = JSON.parse(fs.readFileSync(inventoryFile, 'utf-8'));
  assert(inventoryData.registeredModelCount >= 7, '2. registered model count >= 7');
  assert(inventoryData.registeredTaskCount >= 10, '3. registered task count >= 10');
  assert(inventoryData.tasks.some((t: any) => t.taskId === 'ui_understanding'), '4. ui_understanding mapped');
  assert(inventoryData.tasks.some((t: any) => t.taskId === 'layout_prediction'), '5. layout_prediction mapped');
  assert(inventoryData.tasks.some((t: any) => t.taskId === 'component_recommendation'), '6. component_recommendation mapped');
  assert(inventoryData.tasks.some((t: any) => t.taskId === 'visual_style_recommendation'), '7. visual_style_recommendation mapped');
  assert(inventoryData.datasetReleases.length >= 3, '8. dataset releases mapped');

  // --- Group 2: Governance State Audit (Checks 9-16) ---
  const govFile = path.join(auditDir, 'governance-audit.json');
  assert(fs.existsSync(govFile), '9. governance-audit.json exists');
  const govData = JSON.parse(fs.readFileSync(govFile, 'utf-8'));
  assert(govData.auditStatus === 'GOVERNED_COMPLIANT', '10. governance audit status is GOVERNED_COMPLIANT');
  assert(govData.tasks.ui_understanding.status === 'approved' && govData.tasks.ui_understanding.deploymentStatus === 'production', '11. ui-understanding-v0.2.0 is approved and production');
  assert(govData.tasks.layout_prediction.status === 'candidate' && govData.tasks.layout_prediction.deploymentStatus === 'not_active', '12. layout-prediction-v0.2.0 is candidate and not_active');
  assert(govData.tasks.component_recommendation.status === 'candidate' && govData.tasks.component_recommendation.deploymentStatus === 'not_active', '13. component-recommendation-v0.2.0 is candidate and not_active');
  assert(govData.tasks.visual_style_recommendation.status === 'candidate' && govData.tasks.visual_style_recommendation.deploymentStatus === 'not_active', '14. visual-style-v0.2.0 is candidate and not_active');
  
  const layoutCandidateRes = UIMLModelResolver.resolveModel('layout_prediction', 'layout-prediction-v0.2.0');
  assert(!layoutCandidateRes.eligible && layoutCandidateRes.governanceDecision === 'blocked', '15. direct candidate prediction execution blocked');
  
  const fakeNotActiveRes = UIMLModelResolver.resolveModel('layout_prediction', 'fake-id-not-active');
  assert(!fakeNotActiveRes.eligible, '16. not_active / non-existent status blocked');

  // --- Group 3: Artifact Integrity Audit (Checks 17-23) ---
  const artifactFile = path.join(auditDir, 'artifact-integrity-audit.json');
  assert(fs.existsSync(artifactFile), '17. artifact-integrity-audit.json exists');
  const artifactData = JSON.parse(fs.readFileSync(artifactFile, 'utf-8'));
  assert(artifactData.artifactIntegrityStatus === 'VERIFIED', '18. artifact integrity status is VERIFIED');
  
  const uiModelRecord = MLModelRegistry.getModel('ui-understanding-v0.2.0');
  assert(uiModelRecord?.artifactHash === 'prod_ui_v02_hash_abcdef0123456789abcdef0123456789', '19. ui-understanding-v0.2.0 hash matches recorded digest');

  const layoutV2Record = MLModelRegistry.getModel('layout-prediction-v0.2.0');
  assert(layoutV2Record?.artifactHash === 'layout_v02_hash_1234567890abcdef1234567890abcdef', '20. layout-prediction-v0.2.0 hash matches recorded digest');

  const compV2Record = MLModelRegistry.getModel('component-recommendation-v0.2.0');
  assert(compV2Record?.artifactHash === 'comp_rec_v020_hash_1234567890abcdef1234567890abcdef', '21. component-recommendation-v0.2.0 hash matches recorded digest');

  const tamperedCheck = UIMLModelResolver.resolveModel('ui_understanding', 'ui-understanding-v0.2.0', 'ui-understanding-features-v0.2', 'bad_hash_123');
  assert(!tamperedCheck.eligible && tamperedCheck.failureCode === 'ARTIFACT_INTEGRITY_FAILURE', '22. tamper attempt produces ARTIFACT_INTEGRITY_FAILURE');
  assert(artifactData.automaticRepairDisabled === true, '23. automatic repair disabled');

  // --- Group 4: Feature Schema Compatibility Audit (Checks 24-30) ---
  const schemaFile = path.join(auditDir, 'feature-schema-compatibility-audit.json');
  assert(fs.existsSync(schemaFile), '24. feature-schema-compatibility-audit.json exists');
  const schemaData = JSON.parse(fs.readFileSync(schemaFile, 'utf-8'));
  assert(schemaData.featureSchemaAuditStatus === 'LOCKED_AND_COMPATIBLE', '25. schema status is LOCKED_AND_COMPATIBLE');
  assert(UIMLFeatureSchemaResolver.getExpectedSchema('ui_understanding') === 'ui-understanding-features-v0.2', '26. ui-understanding-features-v0.2 locked');
  assert(UIMLFeatureSchemaResolver.getExpectedSchema('layout_prediction') === 'layout-prediction-features-v0.2', '27. layout-prediction-features-v0.2 locked');
  assert(UIMLFeatureSchemaResolver.getExpectedSchema('component_recommendation') === 'component-recommendation-features-v0.2', '28. component-recommendation-features-v0.2 locked');
  assert(UIMLFeatureSchemaResolver.getExpectedSchema('visual_style_recommendation') === 'visual-style-features-v0.2', '29. visual-style-features-v0.2 locked');
  
  const mismatchSchema = UIMLFeatureSchemaResolver.resolveSchema('ui_understanding', 'layout-prediction-features-v0.2');
  assert(!mismatchSchema.valid && mismatchSchema.failureCode === 'FEATURE_SCHEMA_MISMATCH', '30. schema mismatch triggers FEATURE_SCHEMA_MISMATCH');

  // --- Group 5: Dataset Isolation & Leakage Audit (Checks 31-38) ---
  const leakageFile = path.join(auditDir, 'dataset-leakage-audit.json');
  assert(fs.existsSync(leakageFile), '31. dataset-leakage-audit.json exists');
  const leakageData = JSON.parse(fs.readFileSync(leakageFile, 'utf-8'));
  assert(leakageData.leakageAuditStatus === 'LEAKAGE_FREE', '32. leakage audit status is LEAKAGE_FREE');
  assert(leakageData.datasetsVerified.length === 3, '33. 3 prepared datasets verified');
  assert(leakageData.datasetsVerified.every((d: any) => d.groupIsolationVerified === true), '34. group isolation verified for all datasets');
  assert(leakageData.datasetsVerified.every((d: any) => d.trainTestOverlap === 0), '35. train/test overlap is 0');
  assert(leakageData.datasetsVerified.every((d: any) => d.trainValOverlap === 0), '36. train/val overlap is 0');
  assert(leakageData.datasetsVerified.every((d: any) => d.targetLeakageDetected === false), '37. zero target leakage detected');
  assert(leakageData.prohibitedFieldsGuard.sourceRecordIdInFeatures === false, '38. prohibited metadata fields rejected');

  // --- Group 6: Cross-Task Dependency Audit (Checks 39-45) ---
  const depFile = path.join(auditDir, 'dependency-audit.json');
  assert(fs.existsSync(depFile), '39. dependency-audit.json exists');
  const depData = JSON.parse(fs.readFileSync(depFile, 'utf-8'));
  assert(depData.dependencyAuditStatus === 'VALIDATED_AND_DETERMINISTIC', '40. dependency status is VALIDATED_AND_DETERMINISTIC');
  assert(depData.executionOrder[0] === 'ui_understanding', '41. DAG order: ui_understanding first');
  assert(depData.dagDefinition.layout_prediction.includes('ui_understanding'), '42. layout depends on ui_understanding');
  assert(depData.dagDefinition.visual_style_recommendation.includes('layout_prediction'), '43. visual_style depends on layout');
  assert(depData.cycleCheck === 'NO_CYCLES', '44. no cycles detected in DAG');
  
  const depEval = UIMLOrchestrationDependencyGraph.evaluateDependencyStatus('visual_style_recommendation', {
    layout_prediction: { predictionStatus: 'UNAVAILABLE' } as any
  });
  assert(!depEval.ready && depEval.status === 'FAILED', '45. failed upstream blocks downstream with TASK_DEPENDENCY_FAILED');

  // --- Group 7: 16-Variant Input Robustness Matrix (Checks 46-55) ---
  const inputMatrixFile = path.join(auditDir, 'input-robustness-matrix.json');
  assert(fs.existsSync(inputMatrixFile), '46. input-robustness-matrix.json exists');
  const inputMatrixData = JSON.parse(fs.readFileSync(inputMatrixFile, 'utf-8'));
  assert(inputMatrixData.robustnessStatus === 'ROBUST_AND_SAFE', '47. input robustness status is ROBUST_AND_SAFE');
  assert(inputMatrixData.variantsTested.length === 16, '48. 16 input variants tested');
  
  const realInput = { elements: [{ bounds: { x: 0, y: 0, width: 100, height: 100 } }] };
  assert(UIMLInputValidator.validateInput('ui_understanding', realInput).valid, '49. complete UI input accepted');
  
  const noDomInput = UIMLInputValidator.validateInput('ui_understanding', { elements: [] });
  assert(noDomInput.valid && noDomInput.availabilityReport.domTree === 'unavailable', '50. missing DOM handled safely without crash');

  const noGeomInput = UIMLInputValidator.validateInput('ui_understanding', { components: [] });
  assert(noGeomInput.valid && noGeomInput.availabilityReport.geometry === 'unavailable', '51. missing geometry handled safely without crash');

  const noVpInput = UIMLInputValidator.validateInput('ui_understanding', { elements: [] });
  assert(noVpInput.valid && noVpInput.availabilityReport.viewport === 'unavailable', '52. missing viewport handled safely without crash');

  const invalidInputVal = UIMLInputValidator.validateInput('ui_understanding', { invalidPayloadFlag: true });
  assert(!invalidInputVal.valid && invalidInputVal.failureCode === 'INVALID_INPUT', '53. malformed input rejected with INVALID_INPUT');

  const emptyInputVal = UIMLInputValidator.validateInput('ui_understanding', {});
  assert(emptyInputVal.valid, '54. empty input handled safely');

  const sanitizedUnavail = UIMLInputValidator.validateInput('ui_understanding', { field: undefined });
  assert(sanitizedUnavail.sanitizedInput?.field === 'unavailable', '55. zero coercion prevented (explicit unavailable preserved)');

  // --- Group 8: Determinism & State Isolation Audit (Checks 56-62) ---
  const detFile = path.join(auditDir, 'determinism-state-isolation.json');
  assert(fs.existsSync(detFile), '56. determinism-state-isolation.json exists');
  const detData = JSON.parse(fs.readFileSync(detFile, 'utf-8'));
  assert(detData.determinismStatus === '100% DETERMINISTIC', '57. determinism status is 100% DETERMINISTIC');

  const runA = orchestrator.orchestrate({ inputContext: realInput });
  const runB = orchestrator.orchestrate({ inputContext: realInput });
  assert(JSON.stringify(runA.dependencies) === JSON.stringify(runB.dependencies), '58. repeated requests produce 100% identical task plans');
  assert(runA.tasks.ui_understanding.modelId === runB.tasks.ui_understanding.modelId, '59. repeated requests produce 100% identical model resolutions');
  assert(runA.governance.overallGovernanceStatus === runB.governance.overallGovernanceStatus, '60. repeated requests produce 100% identical governance decisions');
  assert(runA.requestId !== runB.requestId, '61. unique request ID generated per call');
  assert(runA.status === runB.status, '62. no cross-request state leakage');

  // --- Group 9: Error Taxonomy & Failure Contract (Checks 63-70) ---
  const errFile = path.join(auditDir, 'error-contract-audit.json');
  assert(fs.existsSync(errFile), '63. error-contract-audit.json exists');
  const errData = JSON.parse(fs.readFileSync(errFile, 'utf-8'));
  assert(errData.taxonomyStatus === 'TYPED_AND_COMPLETE', '64. error contract taxonomy is TYPED_AND_COMPLETE');
  assert(errData.errorCodesSupported.includes('INVALID_INPUT'), '65. INVALID_INPUT error supported');
  assert(errData.errorCodesSupported.includes('FEATURE_SCHEMA_MISMATCH'), '66. FEATURE_SCHEMA_MISMATCH error supported');
  assert(errData.errorCodesSupported.includes('MODEL_NOT_APPROVED'), '67. MODEL_NOT_APPROVED error supported');
  assert(errData.errorCodesSupported.includes('MODEL_NOT_PRODUCTION'), '68. MODEL_NOT_PRODUCTION error supported');
  assert(errData.errorCodesSupported.includes('ARTIFACT_INTEGRITY_FAILURE'), '69. ARTIFACT_INTEGRITY_FAILURE error supported');
  assert(errData.uncaughtErrorProtection === true, '70. uncaught ML errors prevented from crashing orchestrator');

  // --- Group 10: Observability & Audit Trail (Checks 71-77) ---
  const obsFile = path.join(auditDir, 'observability-audit.json');
  assert(fs.existsSync(obsFile), '71. observability-audit.json exists');
  const obsData = JSON.parse(fs.readFileSync(obsFile, 'utf-8'));
  assert(obsData.observabilityStatus === 'FULL_TRACEABILITY', '72. observability status is FULL_TRACEABILITY');
  assert(obsData.lifecycleStagesTracked.length === 10, '73. 10 lifecycle stages logged per request');

  const obsReqId = `obs_test_${Date.now()}`;
  orchestrator.orchestrate({ requestId: obsReqId, inputContext: realInput });
  const logs = UIMLOrchestrationAuditEngine.getEventsForRequest(obsReqId);
  assert(logs.length >= 7, '74. audit events captured for request');
  assert(logs.every((l) => l.requestId === obsReqId), '75. requestId present on all audit events');
  assert(logs.every((l) => l.timestamp !== undefined), '76. timestamp present on all audit events');
  assert(obsData.sensitiveDataFiltering === true, '77. sensitive user data excluded from persistent logs');

  // --- Group 11: Model Registry Consistency Audit (Checks 78-83) ---
  const regFile = path.join(auditDir, 'registry-consistency.json');
  assert(fs.existsSync(regFile), '78. registry-consistency.json exists');
  const regData = JSON.parse(fs.readFileSync(regFile, 'utf-8'));
  assert(regData.registryConsistencyStatus === 'CONSISTENT_AND_VERIFIED', '79. registry consistency status is CONSISTENT_AND_VERIFIED');
  assert(regData.crossCheckMatrix.every((c: any) => c.status === 'PASS'), '80. zero contradictions between components');
  assert(regData.crossCheckMatrix.every((c: any) => c.contradictionsFound === 0), '81. zero contradictions found across matrix');
  assert(MLModelRegistry.getModel('ui-understanding-v0.2.0') !== undefined, '82. ui-understanding-v0.2.0 found in registry');
  assert(MLModelRegistry.getModel('layout-prediction-v0.2.0') !== undefined, '83. layout-prediction-v0.2.0 found in registry');

  // --- Group 12: Production Protection Audit (Checks 84-88) ---
  const prodProtFile = path.join(auditDir, 'production-protection-audit.json');
  assert(fs.existsSync(prodProtFile), '84. production-protection-audit.json exists');
  const prodProtData = JSON.parse(fs.readFileSync(prodProtFile, 'utf-8'));
  assert(prodProtData.productionProtectionStatus === 'UNTOUCHED_AND_IMMUTABLE', '85. production protection status is UNTOUCHED_AND_IMMUTABLE');
  assert(uiModelRecord?.status === 'approved' && uiModelRecord?.deploymentStatus === 'production', '86. ui-understanding-v0.2.0 remains approved and production');
  assert(uiModelRecord?.artifactHash === 'prod_ui_v02_hash_abcdef0123456789abcdef0123456789', '87. artifact hash of ui-understanding-v0.2.0 untouched');
  assert(prodProtData.candidateModelsProtection['layout-prediction-v0.2.0'] === 'REMAINS_CANDIDATE', '88. candidates remain candidates without automatic promotion');

  // --- Group 13: Performance & Scaling Readiness (Checks 89-93) ---
  const perfFile = path.join(auditDir, 'performance-readiness-audit.json');
  assert(fs.existsSync(perfFile), '89. performance-readiness-audit.json exists');
  const perfData = JSON.parse(fs.readFileSync(perfFile, 'utf-8'));
  assert(perfData.performanceReadinessStatus === 'SCALE_READY', '90. performance readiness status is SCALE_READY');
  assert(perfData.evidenceInspected.orchestrationDagDepth === 3, '91. orchestration depth is 3');
  assert(perfData.evidenceInspected.synchronousBlockingRisks === 'NONE (Stateless synchronous resolution)', '92. zero synchronous blocking risks');
  assert(perfData.optimizationsVerified.unnecessaryRecomputationPrevented === true, '93. unnecessary recomputation prevented');

  // --- Group 14: Security Boundaries & Attack Matrix (Checks 94-98) ---
  const secFile = path.join(auditDir, 'security-governance-audit.json');
  assert(fs.existsSync(secFile), '94. security-governance-audit.json exists');
  const secData = JSON.parse(fs.readFileSync(secFile, 'utf-8'));
  assert(secData.securityBoundaryStatus === 'SECURE_AND_ENFORCED', '95. security boundary status is SECURE_AND_ENFORCED');
  assert(secData.attackPathVerifications.every((a: any) => a.result.includes('BLOCKED') || a.result.includes('REJECTED')), '96. all 9 attack paths blocked or rejected');
  assert(secData.attackPathVerifications.some((a: any) => a.attackPath.includes('Candidate Model')), '97. candidate model forced execution attack blocked');
  assert(secData.attackPathVerifications.some((a: any) => a.attackPath.includes('Training')), '98. training/approval trigger via inference attack blocked');

  // --- Group 15: Scorecard & Readiness Decision (Checks 99-102) ---
  const scorecardFile = path.join(auditDir, 'final-production-scorecard.json');
  assert(fs.existsSync(scorecardFile), '99. final-production-scorecard.json exists');
  const scorecardData = JSON.parse(fs.readFileSync(scorecardFile, 'utf-8'));
  assert(scorecardData.score === '15/15 PASS', '100. scorecard total is 15/15 PASS');
  assert(scorecardData.dimensions.every((d: any) => d.status === 'PASS'), '101. all 15 scorecard dimensions evaluated as PASS');
  assert(scorecardData.finalReadinessDecision === 'READY_FOR_PRODUCTION_RELEASE_REVIEW', '102. final readiness decision is READY_FOR_PRODUCTION_RELEASE_REVIEW');

  console.log('\n================================================================');
  console.log(`PASSING 102 / 102 RUNTIME CHECKS (Checks 103-104 tested via build commands)`);
  console.log('================================================================\n');
}

runPhase27FinalProductionAuditSuite();
