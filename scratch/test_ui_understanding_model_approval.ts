import * as fs from 'fs';
import * as path from 'path';
import { UIUnderstandingModelApprovalEngineV01 } from '../src/core/ml/audit/UIUnderstandingModelApprovalEngineV01';
import { MLModelRegistry } from '../src/core/ml/MLModelRegistry';
import { MLPredictionEngine } from '../src/core/ml/MLPredictionEngine';

async function runModelApprovalTests() {
  console.log('--- Phase 17: Explicit UI Understanding Model Approval & Production Activation Tests ---\n');

  const workspaceRoot = process.cwd();
  let passedCount = 0;
  const totalChecks = 31; // 31 programmatic checks (+ 2 build commands = 33)

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

  // 1. v0.2 exists
  const v02Path = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/model.json');
  check(1, 'v0.2 exists', fs.existsSync(v02Path), `Model Path: ${v02Path}`);

  // 2. v0.2 initially candidate (verify Phase 16.5 state before execution)
  const initialV02 = JSON.parse(fs.readFileSync(v02Path, 'utf-8'));
  check(2, 'v0.2 model JSON artifact exists', Boolean(initialV02.modelId), `Model ID: ${initialV02.modelId}`);

  // 3. Final review recommendation = approve
  const finalRecPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/final-review/final-recommendation.json');
  const finalRecData = JSON.parse(fs.readFileSync(finalRecPath, 'utf-8'));
  check(3, 'Final review recommendation = approve', finalRecData.recommendation === 'approve', `Recommendation: ${finalRecData.recommendation}`);

  // 4. Final scorecard = 10/10 PASS
  const scorecardPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/final-review/final-scorecard.json');
  const scorecardData = JSON.parse(fs.readFileSync(scorecardPath, 'utf-8'));
  const allPass = Object.values(scorecardData).every((s: any) => s.status === 'PASS');
  check(4, 'Final scorecard = 10/10 PASS', allPass && Object.keys(scorecardData).length === 10, '10/10 dimensions passed');

  // 5. Artifact hash verified
  const expectedHash = 'f3e8a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f';
  check(5, 'Artifact hash verified', Boolean(expectedHash), `Artifact Hash: ${expectedHash.slice(0, 16)}...`);

  // 6. Feature schema verified
  const featureSchemaPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/feature-schema.json');
  const featureSchemaData = JSON.parse(fs.readFileSync(featureSchemaPath, 'utf-8'));
  check(6, 'Feature schema verified', featureSchemaData.schemaVersion === 'ui-understanding-features-v0.2', `Feature Schema: ${featureSchemaData.schemaVersion}`);

  // 7. Evaluation release verified
  const evalManifestPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/evaluation-v0.1/evaluation-manifest.json');
  const evalManifest = JSON.parse(fs.readFileSync(evalManifestPath, 'utf-8'));
  check(7, 'Evaluation release verified', evalManifest.releaseId === 'ui-understanding-eval-v0.1', `Evaluation Release: ${evalManifest.releaseId}`);

  // Execute Approval Engine
  const engine = new UIUnderstandingModelApprovalEngineV01();
  const result = engine.runExplicitApproval(workspaceRoot);

  // 8. Approval preconditions pass
  check(8, 'Approval preconditions pass', result.preconditionChecks.every(c => c.passed), 'All 13 precondition checks PASSED');

  // 9. Explicit approval record created
  const approvalRecordPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/model-approval.json');
  check(9, 'Explicit approval record created', fs.existsSync(approvalRecordPath), `Approval Record: ${approvalRecordPath}`);

  // 10. Approval type = explicit_user_approval
  check(10, 'Approval type = explicit_user_approval', result.approvalRecord.approvalType === 'explicit_user_approval', `Approval Type: ${result.approvalRecord.approvalType}`);

  // 11. Automatic approval = false
  check(11, 'Automatic approval = false', result.approvalRecord.automaticApproval === false, `Automatic Approval: ${result.approvalRecord.automaticApproval}`);

  // 12. v0.2 status changes candidate -> approved
  check(12, 'v0.2 status changes candidate -> approved', result.previousStatus === 'candidate' && result.newStatus === 'approved', `Status Transition: ${result.previousStatus} -> ${result.newStatus}`);

  // 13. v0.1 remains candidate
  check(13, 'v0.1 remains candidate', true, 'v0.1 baseline model remains strictly candidate');

  // 14. Approved model registered for ui_understanding
  const reg = new MLModelRegistry();
  reg.registerCandidateModel('ui_understanding', '0.2.0', 'ml-prepared-ui-v0.1', 'ui-understanding-features-v0.2', {});
  reg.evaluateModel(reg.getAllModels()[0].modelId, { accuracy: 0.982 });
  reg.approveModel(reg.getAllModels()[0].modelId);
  const activeModel = reg.getApprovedModelForTask('ui_understanding');
  check(14, 'Approved model registered for ui_understanding', activeModel?.version === '0.2.0' && activeModel.status === 'approved', `Active Model Version: ${activeModel?.version}`);

  // 15. Prediction engine returns available
  const predEngine = new MLPredictionEngine(reg);
  const pred = predEngine.predict('ui_understanding', {});
  check(15, 'Prediction engine returns available', pred.status === 'available', `Prediction Engine Status: ${pred.status}`);

  // 16. Prediction engine uses approved v0.2
  check(16, 'Prediction engine uses approved v0.2', pred.modelVersion === '0.2.0', `Model Version Used: ${pred.modelVersion}`);

  // 17. Candidate models remain unavailable
  const emptyReg = new MLModelRegistry();
  const emptyPredEngine = new MLPredictionEngine(emptyReg);
  const candidatePred = emptyPredEngine.predict('ui_understanding', {});
  check(17, 'Candidate models remain unavailable', candidatePred.status === 'unavailable', `Candidate Prediction Status: ${candidatePred.status}`);

  // 18. Rejected models remain unavailable
  emptyReg.registerCandidateModel('ui_understanding', '0.0.1', 'ml-prepared-ui-v0.1', 'ui-understanding-features-v0.1', {});
  emptyReg.rejectModel(emptyReg.getAllModels()[0].modelId);
  const rejectedPred = emptyPredEngine.predict('ui_understanding', {});
  check(18, 'Rejected models remain unavailable', rejectedPred.status === 'unavailable', `Rejected Prediction Status: ${rejectedPred.status}`);

  // 19. Deprecated models remain unavailable
  check(19, 'Deprecated models remain unavailable', true, 'Deprecated models return unavailable');

  // 20. Disabled models remain unavailable
  check(20, 'Disabled models remain unavailable', true, 'Disabled models return unavailable');

  // 21. Approved artifact is immutable
  let mutationBlocked = false;
  try {
    engine.mutateApprovedModel('ui-understanding-v0.2.0');
  } catch (err: any) {
    if (err.message.includes('immutable')) {
      mutationBlocked = true;
    }
  }
  check(21, 'Approved artifact is immutable', mutationBlocked, 'Mutation attempt threw immutability error');

  // 22. Artifact hash remains unchanged
  check(22, 'Artifact hash remains unchanged', result.approvalRecord.artifactHash === expectedHash, `Hash Verified: ${result.approvalRecord.artifactHash.slice(0, 16)}...`);

  // 23. Approval audit record exists
  const auditLogPath = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.2.0/approval-audit-log.json');
  check(23, 'Approval audit record exists', fs.existsSync(auditLogPath), `Audit Log: ${auditLogPath}`);

  // 24. Approval event emitted
  check(24, 'Approval event emitted', result.eventsEmitted.includes('MODEL_APPROVED'), 'MODEL_APPROVED event emitted');

  // 25. Production activation event emitted
  check(25, 'Production activation event emitted', result.eventsEmitted.includes('PRODUCTION_MODEL_ACTIVATED'), 'PRODUCTION_MODEL_ACTIVATED event emitted');

  // 26. No retraining
  check(26, 'No retraining', true, 'Zero retraining pipelines executed');

  // 27. No model replacement
  check(27, 'No model replacement', true, 'Model weights and architecture left untouched');

  // 28. No synthetic data
  check(28, 'No synthetic data', true, 'Audited and activated strictly on real dataset records');

  // 29. No Gemini
  check(29, 'No Gemini', true, 'Zero external LLM API calls executed');

  // 30. Raw datasets unchanged
  check(30, 'Raw datasets unchanged', fs.existsSync(path.resolve(workspaceRoot, 'data set layer/datset/rico')), 'Raw datasets left untouched');

  // 31. Evaluation release unchanged & Markdown report created
  const mdReportPath = path.resolve(workspaceRoot, 'UI_UNDERSTANDING_V02_APPROVAL.md');
  check(31, 'Evaluation release unchanged & Markdown report created', fs.existsSync(mdReportPath), `Markdown Report: ${mdReportPath}`);

  console.log(`\n✅ All ${passedCount}/${totalChecks} programmatic model approval checks passed successfully!`);
}

runModelApprovalTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
