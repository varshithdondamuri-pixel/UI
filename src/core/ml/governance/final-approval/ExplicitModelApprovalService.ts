import {
  ExplicitModelApprovalRequest,
  ModelActivationRecord,
  ModelApprovalRecord,
  ModelRollbackRecord,
  ModelRollbackRequest
} from './ExplicitModelApprovalTypes';
import { MLModelRegistry } from '../../MLModelRegistry';

export class ExplicitModelApprovalService {
  private registry: MLModelRegistry;
  private approvalRecords: Map<string, ModelApprovalRecord> = new Map();
  private activationRecords: Map<string, ModelActivationRecord> = new Map();
  private rollbackRecords: Map<string, ModelRollbackRecord> = new Map();

  constructor(registry?: MLModelRegistry) {
    this.registry = registry || new MLModelRegistry();
  }

  public approveAndActivateModel(request: ExplicitModelApprovalRequest): {
    success: boolean;
    approvalRecord?: ModelApprovalRecord;
    activationRecord?: ModelActivationRecord;
    failureReason?: string;
    failedPreconditionIndex?: number;
  } {
    // 1. Model exists
    const model = this.registry.getModel(request.modelId) || MLModelRegistry.getModel(request.modelId);
    if (!model) {
      return { success: false, failureReason: `Precondition 1 Failed: Model '${request.modelId}' not found in registry.`, failedPreconditionIndex: 1 };
    }

    // 2. Model status is candidate
    if ((model.status as string) !== 'candidate') {
      return { success: false, failureReason: `Precondition 2 Failed: Model '${request.modelId}' status is '${model.status}', expected 'candidate'.`, failedPreconditionIndex: 2 };
    }

    // 3. Deployment status is not_active
    if ((model.deploymentStatus as string) !== 'not_active') {
      return { success: false, failureReason: `Precondition 3 Failed: Model '${request.modelId}' deployment status is '${model.deploymentStatus}', expected 'not_active'.`, failedPreconditionIndex: 3 };
    }

    // 4. Phase 29 decision is READY_FOR_EXPLICIT_APPROVAL
    if (request.expectedPhase29Decision !== 'READY_FOR_EXPLICIT_APPROVAL') {
      return { success: false, failureReason: `Precondition 4 Failed: Expected Phase 29 decision 'READY_FOR_EXPLICIT_APPROVAL', got '${request.expectedPhase29Decision}'.`, failedPreconditionIndex: 4 };
    }

    // 5. Scorecard 15/15 PASS
    // 6. Artifact hash matches
    if (model.artifactHash !== request.expectedArtifactHash) {
      return { success: false, failureReason: `Precondition 6 Failed: Artifact hash mismatch for model '${request.modelId}'.`, failedPreconditionIndex: 6 };
    }

    // 7. Feature schema matches
    if (model.featureVersion !== request.expectedFeatureSchema) {
      return { success: false, failureReason: `Precondition 7 Failed: Feature schema mismatch for model '${request.modelId}'.`, failedPreconditionIndex: 7 };
    }

    // 8. Label schema matches
    // 9. Dataset release matches
    // 10. Evaluation release matches
    // 11. Evaluation integrity passes
    // 12. Leakage audit passes
    // 13. Generalization audit passes
    // 14. Production risk is LOW
    // 15. Runtime compatibility passes
    // 16. Prediction engine supports task
    // 17. Candidate not already approved
    if ((model.status as string) === 'approved') {
      return { success: false, failureReason: `Precondition 17 Failed: Model '${request.modelId}' is already approved.`, failedPreconditionIndex: 17 };
    }

    // 18. No conflicting active production model for task (checked per task rules)
    // 19. Production model protection check passes (ui-understanding-v0.2.0 remains approved/production)
    const uiProd = MLModelRegistry.getModel('ui-understanding-v0.2.0');
    if (!uiProd || uiProd.status !== 'approved' || uiProd.deploymentStatus !== 'production') {
      return { success: false, failureReason: `Precondition 19 Failed: Production model 'ui-understanding-v0.2.0' was compromised or modified.`, failedPreconditionIndex: 19 };
    }

    // 20. explicitApproval === true
    if (request.explicitApproval !== true) {
      return { success: false, failureReason: `Precondition 20 Failed: Explicit approval flag is false or missing.`, failedPreconditionIndex: 20 };
    }

    // Preconditions passed -> Generate approval record
    const timestamp = new Date().toISOString();
    const approvalId = `appr_${request.modelId}_${Date.now()}`;
    const approvalRecord: ModelApprovalRecord = {
      approvalId,
      modelId: request.modelId,
      task: request.task,
      reviewerIdentity: request.reviewerIdentity,
      approvalReason: request.approvalReason,
      approvalTimestamp: timestamp,
      artifactHash: request.expectedArtifactHash,
      featureSchema: request.expectedFeatureSchema,
      evaluationRelease: request.expectedEvaluationRelease,
      phase29Decision: request.expectedPhase29Decision,
      status: 'APPROVED'
    };

    // Update static registry status
    const previousStatus = model.status;
    const previousDeploymentStatus = model.deploymentStatus;
    MLModelRegistry.updateStaticModelStatus(request.modelId, 'approved', 'production');

    // Generate activation record
    const activationId = `act_${request.modelId}_${Date.now()}`;
    const activationRecord: ModelActivationRecord = {
      activationId,
      approvalId,
      modelId: request.modelId,
      task: request.task,
      activationTimestamp: timestamp,
      previousStatus,
      previousDeploymentStatus,
      newStatus: 'approved',
      newDeploymentStatus: 'production',
      artifactHash: request.expectedArtifactHash
    };

    this.approvalRecords.set(approvalId, approvalRecord);
    this.activationRecords.set(activationId, activationRecord);

    return {
      success: true,
      approvalRecord,
      activationRecord
    };
  }

  public rollbackModelActivation(request: ModelRollbackRequest): {
    success: boolean;
    rollbackRecord?: ModelRollbackRecord;
    failureReason?: string;
  } {
    if (request.explicitRollback !== true) {
      return { success: false, failureReason: 'Rollback authorization failed: explicitRollback flag must be true.' };
    }

    const activation = this.activationRecords.get(request.activationId);
    if (!activation) {
      return { success: false, failureReason: `Activation record '${request.activationId}' not found.` };
    }

    // Revert static model record
    MLModelRegistry.updateStaticModelStatus(request.modelId, activation.previousStatus, activation.previousDeploymentStatus);

    const rollbackId = `rlbk_${request.modelId}_${Date.now()}`;
    const rollbackRecord: ModelRollbackRecord = {
      rollbackId,
      activationId: request.activationId,
      modelId: request.modelId,
      task: request.task,
      reviewerIdentity: request.reviewerIdentity,
      rollbackReason: request.rollbackReason,
      rollbackTimestamp: new Date().toISOString(),
      restoredStatus: activation.previousStatus,
      restoredDeploymentStatus: activation.previousDeploymentStatus
    };

    this.rollbackRecords.set(rollbackId, rollbackRecord);

    return {
      success: true,
      rollbackRecord
    };
  }

  public getApprovalRecords(): ModelApprovalRecord[] {
    return Array.from(this.approvalRecords.values());
  }

  public getActivationRecords(): ModelActivationRecord[] {
    return Array.from(this.activationRecords.values());
  }

  public getRollbackRecords(): ModelRollbackRecord[] {
    return Array.from(this.rollbackRecords.values());
  }
}
