import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';

export type DimensionStatus = 'PASS' | 'WARNING' | 'FAIL';
export type ApprovalReadinessState = 'READY_FOR_REVIEW' | 'NOT_READY';
export type RepresentativenessState = 'representative' | 'partially_representative' | 'not_representative';

export interface ConfidenceIntervalResult {
  metricName: string;
  value: number;
  lower: number;
  upper: number;
  confidenceLevel: 0.95;
}

export interface BootstrapResult {
  seed: 42;
  iterations: 100;
  meanAccuracy: number;
  stdDevAccuracy: number;
  minAccuracy: number;
  maxAccuracy: number;
  lowerPercentile: number;
  upperPercentile: number;
  meanMacroF1: number;
  stdDevMacroF1: number;
}

export interface EvaluationSample {
  sampleId: string;
  sourceDataset: 'RICO' | 'WebCode2M' | 'WebUI' | 'Screen2Words';
  groupKey: string;
  label: LayoutClassLabel;
  features: Record<string, any>;
}

export interface EvaluationManifest {
  evaluationReleaseId: 'layout-prediction-eval-v0.1';
  modelId: 'layout-prediction-v0.2.0';
  featureSchema: 'layout-prediction-features-v0.2';
  randomSeed: 42;
  targetSampleCount: 5000;
  actualSampleCount: number;
  datasetDistribution: Record<string, number>;
  classDistribution: Record<string, number>;
  groupIsolation: {
    trainOverlap: 0;
    validationOverlap: 0;
    testOverlap: 0;
    uniqueEvaluationGroups: number;
  };
  selectionHash: string;
  sourceDatasetVersions: Record<string, string>;
  creationTimestamp: string;
  immutabilityStatus: 'LOCKED';
}

export interface LargeScaleEvaluationSummary {
  evaluationReleaseId: 'layout-prediction-eval-v0.1';
  modelId: 'layout-prediction-v0.2.0';
  featureSchemaVersion: 'layout-prediction-features-v0.2';
  status: 'candidate';
  deploymentStatus: 'not_active';
  evaluatedAt: string;
  actualSampleCount: number;
  overallMetrics: {
    accuracy: number;
    macroF1: number;
    weightedF1: number;
    precision: number;
    recall: number;
    errorCount: number;
    confusionMatrix: number[][];
  };
  confidenceIntervals: {
    accuracy: ConfidenceIntervalResult;
    macroF1: ConfidenceIntervalResult;
  };
  bootstrap: BootstrapResult;
  perDataset: Record<string, any>;
  perClass: Record<string, any>;
  minorityClass: Record<string, any>;
  errorAnalysis: Record<string, any>;
  distribution: {
    representativeness: RepresentativenessState;
    details: Record<string, any>;
  };
  reproducibility: {
    matches: boolean;
    reproducibility: 'PASSED' | 'FAILED';
  };
  scorecard: {
    passedDimensions: number;
    warningDimensions: number;
    failedDimensions: number;
    overallScore: number;
    overallStatus: 'PASS' | 'WARNING' | 'FAIL';
  };
  approvalReadiness: {
    readinessState: ApprovalReadinessState;
    evidenceOnly: true;
    details: string;
  };
  governanceUntouched: boolean;
}
