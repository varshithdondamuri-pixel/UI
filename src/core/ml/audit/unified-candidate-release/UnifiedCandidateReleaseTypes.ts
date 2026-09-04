export type ApprovalReadinessDecision =
  | 'READY_FOR_EXPLICIT_APPROVAL'
  | 'CONDITIONAL_REVIEW'
  | 'IMPROVEMENT_REQUIRED'
  | 'BLOCKED';

export type DimensionStatus = 'PASS' | 'WARNING' | 'BLOCKER';

export interface ScorecardDimension {
  dimension: string;
  status: DimensionStatus;
  evidence: string;
  metric?: string;
  rationale?: string;
}

export interface CandidateModelComparisonRow {
  task: string;
  modelId: string;
  datasetReleaseId: string;
  featureSchemaId: string;
  validationAccuracy: number;
  validationMacroF1: number;
  heldOutAccuracy: number;
  heldOutMacroF1: number;
  minorityClassF1: number;
  confidenceInterval95: string;
  bootstrapStability: string;
  criticalErrors: number;
  highConfidenceErrors: number;
  leakageStatus: string;
  datasetGeneralization: string;
  classGeneralization: string;
  productionRisk: string;
  finalRecommendation: ApprovalReadinessDecision;
  approvalReadiness: string;
  currentRegistryStatus: string;
}

export interface CandidateModelScorecard {
  modelId: string;
  taskId: string;
  scorecardVersion: string;
  auditTimestamp: string;
  score: string;
  dimensions: ScorecardDimension[];
  decision: ApprovalReadinessDecision;
}

export interface UnifiedCandidateReleaseReport {
  timestamp: string;
  auditPhase: string;
  productionModelStatus: {
    modelId: string;
    status: string;
    deploymentStatus: string;
    predictionAvailability: string;
  };
  candidateModels: CandidateModelComparisonRow[];
  scorecards: Record<string, CandidateModelScorecard>;
  finalDecisions: Record<string, ApprovalReadinessDecision>;
}
