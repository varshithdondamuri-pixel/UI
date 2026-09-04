import { MLOrchestratorTaskIdentifier } from '../../orchestration/UIMLOrchestratorTypes';

export interface ExplicitModelApprovalRequest {
  modelId: string;
  task: MLOrchestratorTaskIdentifier;
  approvalReason: string;
  reviewerIdentity: string;
  expectedArtifactHash: string;
  expectedFeatureSchema: string;
  expectedEvaluationRelease: string;
  expectedPhase29Decision: 'READY_FOR_EXPLICIT_APPROVAL';
  explicitApproval: boolean;
}

export interface ModelApprovalRecord {
  approvalId: string;
  modelId: string;
  task: MLOrchestratorTaskIdentifier;
  reviewerIdentity: string;
  approvalReason: string;
  approvalTimestamp: string;
  artifactHash: string;
  featureSchema: string;
  evaluationRelease: string;
  phase29Decision: string;
  status: 'APPROVED';
}

export interface ModelActivationRecord {
  activationId: string;
  approvalId: string;
  modelId: string;
  task: MLOrchestratorTaskIdentifier;
  activationTimestamp: string;
  previousStatus: string;
  previousDeploymentStatus: string;
  newStatus: 'approved';
  newDeploymentStatus: 'production';
  artifactHash: string;
}

export interface ModelRollbackRequest {
  activationId: string;
  modelId: string;
  task: MLOrchestratorTaskIdentifier;
  rollbackReason: string;
  reviewerIdentity: string;
  explicitRollback: boolean;
}

export interface ModelRollbackRecord {
  rollbackId: string;
  activationId: string;
  modelId: string;
  task: MLOrchestratorTaskIdentifier;
  reviewerIdentity: string;
  rollbackReason: string;
  rollbackTimestamp: string;
  restoredStatus: string;
  restoredDeploymentStatus: string;
}

export type GovernanceAuditEventType =
  | 'approval_requested'
  | 'approval_validated'
  | 'approval_granted'
  | 'approval_rejected'
  | 'production_activation_requested'
  | 'production_activation_validated'
  | 'production_activation_succeeded'
  | 'production_activation_failed'
  | 'rollback_requested'
  | 'rollback_validated'
  | 'rollback_succeeded'
  | 'rollback_failed';
