import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';

export type ErrorSeverityLevel = 'minor' | 'moderate' | 'major' | 'critical';
export type RiskLevel = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_EVIDENCE';
export type GeneralizationStatus = 'STABLE' | 'ACCEPTABLE' | 'WARNING' | 'FAIL';
export type FinalRecommendation = 'approve' | 'keep_candidate' | 'improve_features';

export interface EvaluationErrorRecord {
  sampleId: string;
  groupKey: string;
  sourceDataset: 'RICO' | 'WebCode2M' | 'WebUI' | 'Screen2Words';
  trueLabel: LayoutClassLabel;
  predictedLabel: LayoutClassLabel;
  confidence: number;
  errorCategory: string;
  severity: ErrorSeverityLevel;
  rationale: string;
}

export interface FinalReviewScorecardDimension {
  dimensionName: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  evidence: string;
  rationale: string;
}

export interface FinalReviewSummary {
  modelId: 'layout-prediction-v0.2.0';
  evaluationReleaseId: 'layout-prediction-eval-v0.1';
  evaluatedAt: string;
  status: 'candidate';
  deploymentStatus: 'not_active';
  sampleCount: 4000;
  overallMetrics: {
    accuracy: number;
    macroF1: number;
    weightedF1: number;
    minorityMacroF1: number;
    errorCount: number;
    errorRate: number;
  };
  errorForensics: {
    totalErrorsAudited: number;
    categories: Record<string, number>;
  };
  errorSeverity: {
    minor: number;
    moderate: number;
    major: number;
    critical: number;
  };
  datasetRisk: Record<string, RiskLevel>;
  classRisk: Record<string, RiskLevel>;
  confidenceErrors: {
    threshold: 0.95;
    highConfidenceErrorCount: number;
    highConfidenceErrorRate: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  leakageReview: {
    leakageStatus: 'PASSED' | 'FAILED';
    prohibitedFieldCount: 0;
  };
  datasetGeneralization: GeneralizationStatus;
  classGeneralization: GeneralizationStatus;
  productionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  finalScorecard: {
    dimensions: FinalReviewScorecardDimension[];
    passedDimensions: number;
    warningDimensions: number;
    failedDimensions: number;
    overallScore: number;
    overallStatus: 'PASS' | 'WARNING' | 'FAIL';
  };
  recommendation: FinalRecommendation;
  recommendationReasoning: string;
  governanceUntouched: boolean;
}
