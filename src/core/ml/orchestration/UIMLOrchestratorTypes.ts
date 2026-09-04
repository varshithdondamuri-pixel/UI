export type MLOrchestratorTaskIdentifier =
  | 'ui_understanding'
  | 'layout_prediction'
  | 'component_recommendation'
  | 'visual_style_recommendation';

export type MLOrchestrationFailureCode =
  | 'MODEL_UNAVAILABLE'
  | 'MODEL_NOT_APPROVED'
  | 'MODEL_NOT_ACTIVE'
  | 'FEATURE_SCHEMA_MISMATCH'
  | 'INVALID_INPUT'
  | 'REQUIRED_FEATURE_UNAVAILABLE'
  | 'LEAKAGE_GUARD_FAILURE'
  | 'ARTIFACT_INTEGRITY_FAILURE'
  | 'TASK_DEPENDENCY_FAILED'
  | 'PREDICTION_EXECUTION_FAILED';

export interface UIMLOrchestrationRequest {
  requestId?: string;
  tasks?: MLOrchestratorTaskIdentifier[];
  inputContext: {
    rawInput?: any;
    elements?: any[];
    screenshot?: string;
    domTree?: any;
    geometry?: any;
    components?: any[];
    styleContext?: any;
    viewport?: any;
    [key: string]: any;
  };
  featureSchemas?: Partial<Record<MLOrchestratorTaskIdentifier, string>>;
  modelOverrides?: Partial<Record<MLOrchestratorTaskIdentifier, string>>;
  provenance?: {
    sourceDataset?: string;
    clientVersion?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface TaskOrchestrationResult {
  task: MLOrchestratorTaskIdentifier;
  modelId: string;
  modelStatus: 'approved' | 'candidate' | 'rejected' | 'deprecated' | 'disabled' | 'unavailable';
  deploymentStatus: 'production' | 'not_active' | 'unavailable';
  predictionStatus: 'SUCCESS' | 'UNAVAILABLE' | 'BLOCKED' | 'FAILED';
  featureSchemaVersion: string;
  modelArtifactHash: string;
  result: any | null;
  confidence: number | 'unavailable';
  confidenceLevel?: 'high' | 'medium' | 'low' | 'unavailable';
  uncertaintyStatus?: 'certain' | 'uncertain' | 'unavailable';
  topAlternatives?: any[];
  warningFlags?: string[];
  governanceDecision: 'eligible' | 'blocked';
  failureReason?: MLOrchestrationFailureCode | string;
  affectedDownstreamTasks?: MLOrchestratorTaskIdentifier[];
  provenance: Record<string, any>;
  timestamp: string;
}

export interface UIMLOrchestrationResponse {
  requestId: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'BLOCKED';
  timestamp: string;
  tasks: Record<MLOrchestratorTaskIdentifier, TaskOrchestrationResult>;
  dependencies: {
    graph: Record<MLOrchestratorTaskIdentifier, MLOrchestratorTaskIdentifier[]>;
    executionOrder: MLOrchestratorTaskIdentifier[];
    dependencyStatuses: Record<MLOrchestratorTaskIdentifier, 'SATISFIED' | 'FAILED' | 'SKIPPED'>;
  };
  governance: {
    totalTasks: number;
    eligibleTasks: number;
    blockedTasks: number;
    blockedCandidateModels: string[];
    productionModels: string[];
    overallGovernanceStatus: 'GOVERNED_COMPLIANT';
  };
  provenance: {
    sourceDataset?: string;
    clientVersion: string;
    timestamp: string;
  };
}

export interface OrchestrationAuditEvent {
  eventId: string;
  requestId: string;
  eventType:
    | 'orchestration_request'
    | 'task_resolution'
    | 'model_resolution'
    | 'schema_resolution'
    | 'prediction_start'
    | 'prediction_success'
    | 'prediction_blocked'
    | 'prediction_failure'
    | 'dependency_failure'
    | 'final_orchestration_result';
  task?: MLOrchestratorTaskIdentifier;
  modelId?: string;
  schemaId?: string;
  governanceStatus?: 'eligible' | 'blocked';
  resultStatus?: 'SUCCESS' | 'UNAVAILABLE' | 'BLOCKED' | 'FAILED';
  details?: Record<string, any>;
  timestamp: string;
}
