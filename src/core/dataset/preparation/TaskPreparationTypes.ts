import { ProvenanceData } from '../DatasetTypes';

export type PreparedTaskIdentifier =
  | 'ui_understanding'
  | 'layout_prediction'
  | 'component_recommendation'
  | 'visual_style_recommendation';

export interface MLTaskSample {
  sampleId: string;
  sourceDataset: string;
  sourceRecordId: string;
  task: PreparedTaskIdentifier;
  inputFeatures: Record<string, any>;
  labels: Record<string, any>;
  provenance: ProvenanceData;
  qualityScore: number;
  split: 'train' | 'validation' | 'test';
}

export interface ComponentLabelMapping {
  sourceDataset: string;
  sourceLabel: string;
  normalizedLabel:
    | 'button'
    | 'card'
    | 'navbar'
    | 'header'
    | 'footer'
    | 'input'
    | 'image'
    | 'text'
    | 'table'
    | 'menu'
    | 'sidebar'
    | 'other';
  mappingMethod: 'exact_taxonomy' | 'html_element' | 'heuristic';
  mappingConfidence: number;
}

export interface FeatureVersion {
  featureVersionId: string;
  featureName: string;
  task: PreparedTaskIdentifier;
  source: string;
  featureGroups: string[];
  normalizationStrategy: string;
  missingValueStrategy: string;
  version: string;
  createdAt: string;
}

export interface LabelVersion {
  labelVersionId: string;
  labelSchemaName: string;
  task: PreparedTaskIdentifier;
  labelType: 'categorical' | 'multi_label' | 'derived_deterministic' | 'style_tokens';
  mappingMethod: string;
  confidenceAverage: number;
  version: string;
  createdAt: string;
}

export interface PreparationQualityReport {
  rawSamples: number;
  validSamples: number;
  invalidSamples: number;
  duplicateSamples: number;
  missingLabelSamples: number;
  missingFeatureSamples: number;
  eligibleSamples: number;
  rejectedSamples: number;
  averageQuality: number;
  minimumQuality: number;
  maximumQuality: number;
  rejectionReasons: Record<string, number>;
}

export interface ClassDistributionReport {
  classCount: number;
  classDistribution: Record<string, number>;
  minClassSize: number;
  maxClassSize: number;
  medianClassSize: number;
  imbalanceRatio: number;
  rareClasses: string[];
  emptyClasses: string[];
}

export interface TrainingManifest {
  manifestId: string;
  datasetVersion: string;
  task: PreparedTaskIdentifier;
  featureVersion: FeatureVersion;
  labelVersion: LabelVersion;
  sourceDatasets: string[];
  sampleCount: number;
  trainCount: number;
  validationCount: number;
  testCount: number;
  qualityThreshold: number;
  splitStrategy: string;
  leakageStatus: {
    isValid: boolean;
    leakageCount: number;
    warnings: string[];
    errors: string[];
  };
  classDistribution: ClassDistributionReport;
  featureGroups: string[];
  labelSchema: Record<string, any>;
  provenance: {
    sourceTypes: string[];
    sourceDatasets: string[];
    licenses: string[];
    allVerified: boolean;
  };
  licenseStatus: string;
  trainingReady: boolean;
  trainingBlockedReason: string | null;
  createdAt: string;
}

export interface BaselineConfig {
  task: PreparedTaskIdentifier;
  datasetVersion: string;
  featureVersion: string;
  labelVersion: string;
  expectedInput: Record<string, string>;
  expectedOutput: Record<string, string>;
  primaryMetric: string;
  secondaryMetrics: string[];
  trainingReady: boolean;
  status: 'not_trained';
}

export interface PreparedTaskDataset {
  task: PreparedTaskIdentifier;
  manifest: TrainingManifest;
  qualityReport: PreparationQualityReport;
  baselineConfig: BaselineConfig;
  samples: {
    train: MLTaskSample[];
    validation: MLTaskSample[];
    test: MLTaskSample[];
  };
}
