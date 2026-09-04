import { MLTaskIdentifier } from '../MLTaskTypes';

export interface MLTrainingConfiguration {
  task: MLTaskIdentifier;
  datasetVersion: string;
  featureVersion: string;
  labelVersion: string;
  modelType: string;
  randomSeed: number;
  hyperparameters: Record<string, any>;
  trainingSplit: string;
  validationSplit: string;
  testSplit: string;
  timestamp: string;
  codeVersion: string;
  environment: string;
}

export interface PerClassMetrics {
  className: string;
  precision: number;
  recall: number;
  f1: number;
  sampleCount: number;
}

export interface ConfusionMatrix {
  classes: string[];
  matrix: number[][]; // actual x predicted
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  macroF1: number;
  weightedF1: number;
  confusionMatrix: ConfusionMatrix;
  perClassMetrics: Record<string, PerClassMetrics>;
}

export interface BaselineComparison {
  baselineA: {
    name: string;
    modelType: string;
    testAccuracy: number;
    testMacroF1: number;
  };
  baselineB: {
    name: string;
    modelType: string;
    testAccuracy: number;
    testMacroF1: number;
  };
  accuracyImprovement: number;
  macroF1Improvement: number;
  isMLSuperior: boolean;
}

export interface ModelArtifact {
  modelId: string;
  task: MLTaskIdentifier;
  modelType: string;
  datasetVersion: string;
  featureVersion: string;
  labelVersion: string;
  trainingConfiguration: MLTrainingConfiguration;
  trainingMetrics: EvaluationMetrics;
  validationMetrics: EvaluationMetrics;
  testMetrics: EvaluationMetrics;
  baselineComparison: BaselineComparison;
  classDistribution: Record<string, number>;
  featureSchema: Record<string, string>;
  labelSchema: Record<string, any>;
  provenance: Record<string, any>;
  createdAt: string;
  status: 'candidate' | 'approved' | 'rejected' | 'archived';
}
