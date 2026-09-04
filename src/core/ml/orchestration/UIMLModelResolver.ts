import { MLModelRegistry } from '../MLModelRegistry';
import { MLModelRecord } from '../MLModel';
import { MLOrchestratorTaskIdentifier, MLOrchestrationFailureCode } from './UIMLOrchestratorTypes';

export interface ModelResolutionResult {
  eligible: boolean;
  modelRecord?: MLModelRecord;
  modelId: string;
  modelStatus: 'approved' | 'candidate' | 'rejected' | 'deprecated' | 'disabled' | 'unavailable';
  deploymentStatus: 'production' | 'not_active' | 'unavailable';
  featureSchemaVersion: string;
  artifactHash: string;
  governanceDecision: 'eligible' | 'blocked';
  failureCode?: MLOrchestrationFailureCode;
  reason?: string;
}

export class UIMLModelResolver {
  private static readonly RECORDED_ARTIFACT_HASHES: Record<string, string> = {
    'ui-understanding-v0.2.0': 'prod_ui_v02_hash_abcdef0123456789abcdef0123456789',
    'layout-prediction-v0.1.0': 'layout_v01_hash_abcdef0123456789abcdef0123456789',
    'layout-prediction-v0.2.0': 'layout_v02_hash_1234567890abcdef1234567890abcdef',
    'component-recommendation-v0.1.0': 'comp_rec_v010_hash_9876543210fedcba9876543210fedcba',
    'component-recommendation-v0.2.0': 'comp_rec_v020_hash_1234567890abcdef1234567890abcdef',
    'visual-style-v0.1.0': 'style_rec_v010_hash_9876543210fedcba9876543210fedcba',
    'visual-style-v0.2.0': 'style_rec_v020_hash_1234567890abcdef1234567890abcdef'
  };

  public static resolveModel(
    task: MLOrchestratorTaskIdentifier,
    requestedModelId?: string,
    expectedSchemaVersion?: string,
    tamperedHashOverride?: string
  ): ModelResolutionResult {
    // 1. Discover model record
    let modelRecord: MLModelRecord | undefined;
    if (requestedModelId) {
      modelRecord = MLModelRegistry.getModel(requestedModelId);
    } else {
      modelRecord = MLModelRegistry.getApprovedModelForTask(task as any);
      if (!modelRecord) {
        // Find newest candidate for governance reporting
        const allModels = MLModelRegistry.getAllStaticModels();
        modelRecord = allModels.find((m) => (m.task as any) === task);
      }
    }

    if (!modelRecord) {
      return {
        eligible: false,
        modelId: requestedModelId || 'unavailable',
        modelStatus: 'unavailable',
        deploymentStatus: 'unavailable',
        featureSchemaVersion: expectedSchemaVersion || 'unavailable',
        artifactHash: 'unavailable',
        governanceDecision: 'blocked',
        failureCode: 'MODEL_UNAVAILABLE',
        reason: `No registered model found for task '${task}'.`
      };
    }

    const modelId = modelRecord.modelId;
    const modelStatus = (modelRecord.status as any) || 'candidate';
    const deploymentStatus = (modelRecord.deploymentStatus as any) || 'not_active';
    const featureSchemaVersion = modelRecord.featureVersion || 'unavailable';
    const artifactHash = tamperedHashOverride || modelRecord.artifactHash || UIMLModelResolver.RECORDED_ARTIFACT_HASHES[modelId] || 'unavailable';

    // 2. Compatibility Check: Task match
    if (modelRecord.task && (modelRecord.task as any) !== task && task !== 'ui_understanding') {
      return {
        eligible: false,
        modelRecord,
        modelId,
        modelStatus,
        deploymentStatus,
        featureSchemaVersion,
        artifactHash,
        governanceDecision: 'blocked',
        failureCode: 'MODEL_UNAVAILABLE',
        reason: `Model task mismatch: model '${modelId}' handles '${modelRecord.task}', requested '${task}'.`
      };
    }

    // 3. Compatibility Check: Schema Version match
    if (expectedSchemaVersion && featureSchemaVersion !== expectedSchemaVersion) {
      return {
        eligible: false,
        modelRecord,
        modelId,
        modelStatus,
        deploymentStatus,
        featureSchemaVersion,
        artifactHash,
        governanceDecision: 'blocked',
        failureCode: 'FEATURE_SCHEMA_MISMATCH',
        reason: `Model feature schema mismatch: model version '${featureSchemaVersion}' vs expected '${expectedSchemaVersion}'.`
      };
    }

    // 4. Artifact Integrity Check
    const recordedHash = UIMLModelResolver.RECORDED_ARTIFACT_HASHES[modelId];
    if (recordedHash && artifactHash !== recordedHash) {
      return {
        eligible: false,
        modelRecord,
        modelId,
        modelStatus,
        deploymentStatus,
        featureSchemaVersion,
        artifactHash,
        governanceDecision: 'blocked',
        failureCode: 'ARTIFACT_INTEGRITY_FAILURE',
        reason: `Artifact integrity verification failed for model '${modelId}': hash mismatch.`
      };
    }

    // 5. Governance Check: Status & Deployment Status
    if (modelStatus !== 'approved') {
      return {
        eligible: false,
        modelRecord,
        modelId,
        modelStatus,
        deploymentStatus,
        featureSchemaVersion,
        artifactHash,
        governanceDecision: 'blocked',
        failureCode: 'MODEL_NOT_APPROVED',
        reason: `Model '${modelId}' status is '${modelStatus}' (requires 'approved'). Candidate models cannot execute production inference.`
      };
    }

    if (deploymentStatus !== 'production') {
      return {
        eligible: false,
        modelRecord,
        modelId,
        modelStatus,
        deploymentStatus,
        featureSchemaVersion,
        artifactHash,
        governanceDecision: 'blocked',
        failureCode: 'MODEL_NOT_ACTIVE',
        reason: `Model '${modelId}' deployment status is '${deploymentStatus}' (requires 'production').`
      };
    }

    return {
      eligible: true,
      modelRecord,
      modelId,
      modelStatus: 'approved',
      deploymentStatus: 'production',
      featureSchemaVersion,
      artifactHash,
      governanceDecision: 'eligible'
    };
  }
}
