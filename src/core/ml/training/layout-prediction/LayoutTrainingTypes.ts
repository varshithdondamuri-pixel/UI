import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';

export type ModelType = 'reference_majority' | 'supervised_classical';

export interface ClassPerformanceMetrics {
  className: LayoutClassLabel;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
  errorCount: number;
}

export interface ConfusionMatrixReport {
  classes: LayoutClassLabel[];
  matrix: number[][]; // rows: actual, cols: predicted
}

export interface PerDatasetEvaluationCell {
  datasetName: string;
  sampleCount: number;
  accuracy: number | null;
  macroF1: number | null;
  weightedF1: number | null;
  status: 'evaluated' | 'unavailable';
  unavailabilityReason?: string;
}

export interface ModelEvaluationSummary {
  modelType: ModelType;
  modelName: string;
  sampleCount: number;
  accuracy: number;
  precision: number;
  recall: number;
  macroF1: number;
  weightedF1: number;
  perClassMetrics: ClassPerformanceMetrics[];
  confusionMatrix: ConfusionMatrixReport;
  perDatasetEvaluation: PerDatasetEvaluationCell[];
}

export interface BaselineComparisonReport {
  baselineA: {
    name: string;
    accuracy: number;
    macroF1: number;
    weightedF1: number;
  };
  baselineB: {
    name: string;
    accuracy: number;
    macroF1: number;
    weightedF1: number;
  };
  improvement: {
    accuracyDelta: number;
    macroF1Delta: number;
    weightedF1Delta: number;
    relativeAccuracyGain: number;
  };
}

export interface LayoutTrainingPipelineReport {
  modelId: string;
  task: 'layout_prediction';
  datasetReleaseId: string;
  featureSchemaVersion: string;
  modelStatus: 'candidate';
  deploymentStatus: 'not_active';
  randomSeed: number;
  sampleCounts: {
    train: number;
    validation: number;
    test: number;
  };
  validationResults: {
    baselineA: ModelEvaluationSummary;
    baselineB: ModelEvaluationSummary;
    comparison: BaselineComparisonReport;
  };
  testResults: {
    baselineA: ModelEvaluationSummary;
    baselineB: ModelEvaluationSummary;
    comparison: BaselineComparisonReport;
  };
  reproducibility: {
    seed: number;
    run1ArtifactHash: string;
    run2ArtifactHash: string;
    matches: boolean;
    status: 'passed' | 'failed';
  };
  productionModelProtection: {
    productionModelId: string;
    productionModelStatus: string;
    productionDeploymentStatus: string;
    untouched: boolean;
  };
  trainedAt: string;
}
