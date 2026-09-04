import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';

export type FeatureGroupIdentifier =
  | 'geometry'
  | 'spatial'
  | 'alignment'
  | 'spacing'
  | 'density'
  | 'composition'
  | 'hierarchy'
  | 'viewport'
  | 'dom_structure'
  | 'css_layout'
  | 'responsive_structure'
  | 'component_distribution'
  | 'layout_structure';

export type FeatureDataType = 'numeric' | 'categorical' | 'binary';

export type FeatureAvailabilityStatus = 'available' | 'partially_available' | 'unavailable';

export type NormalizationStrategy =
  | 'min_max'
  | 'z_score'
  | 'log_scale'
  | 'binary'
  | 'categorical_one_hot'
  | 'none';

export type MissingValuePolicy =
  | 'default_zero'
  | 'impute_mean'
  | 'preserve_flag'
  | 'explicit_unavailable';

export type ShortcutRiskLevel = 'clean' | 'low' | 'moderate' | 'high' | 'prohibited';

export interface LayoutFeatureDefinition {
  featureId: string;
  featureName: string;
  featureGroup: FeatureGroupIdentifier;
  dataType: FeatureDataType;
  description: string;
  sourceRequirements: string[];
  normalizationStrategy: NormalizationStrategy;
  missingValuePolicy: MissingValuePolicy;
  predictiveAllowed: boolean;
  leakageRisk: 'none' | 'low' | 'high' | 'prohibited';
  version: string;
}

export interface ExtractedFeatureValue {
  featureId: string;
  value: number | string | boolean | null;
  status: 'available' | 'unavailable';
  source: string;
  confidence: number;
  missingReason?: string;
}

export interface ExtractedFeatureVector {
  sampleId: string;
  features: Record<string, ExtractedFeatureValue>;
  availableGroupCount: number;
  totalGroupCount: number;
}

export interface FeatureSourceCoverageCell {
  featureGroup: FeatureGroupIdentifier;
  sourceDataset: string;
  status: FeatureAvailabilityStatus;
  coveragePercentage: number;
}

export interface FeatureNumericalStats {
  featureId: string;
  featureGroup: FeatureGroupIdentifier;
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  missingRate: number;
  uniqueCount: number;
  outlierRate: number;
}

export interface NormalizationFeatureSpec {
  featureId: string;
  strategy: NormalizationStrategy;
  mean?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  categories?: string[];
}

export interface NormalizationSpecReport {
  schemaVersion: string;
  fittedOnSplit: 'train';
  fittedSampleCount: number;
  featureSpecs: Record<string, NormalizationFeatureSpec>;
  createdAt: string;
}

export interface FeatureMissingnessAudit {
  overallMissingRate: number;
  trainMissingRate: number;
  validationMissingRate: number;
  testMissingRate: number;
  perDatasetMissingRate: Record<string, number>;
  perGroupMissingRate: Record<FeatureGroupIdentifier, number>;
  status: 'acceptable' | 'warning' | 'high_missingness' | 'unusable';
}

export interface FeatureDistributionShiftCell {
  featureId: string;
  trainMean: number;
  valMean: number;
  testMean: number;
  shiftScore: number; // e.g. Wasserstein / JS distance surrogate
  status: 'stable' | 'warning' | 'high_shift';
}

export interface FeatureLeakageAuditReport {
  prohibitedFieldsChecked: string[];
  rejectedFieldsCount: number;
  leakageStatus: 'PASSED' | 'FAILED';
  prohibitedMatches: string[];
}

export interface LabelShortcutAuditCell {
  featureId: string;
  targetAssociationScore: number;
  uniqueValueCount: number;
  classConditionalEntropy: number;
  shortcutRisk: ShortcutRiskLevel;
  explanation: string;
}

export interface ClassFeatureCoverageReport {
  className: LayoutClassLabel;
  sampleSupport: number;
  featureCoverageRatio: number;
  missingnessRate: number;
  datasetDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
}

export interface FeatureDimensionsReport {
  totalFeatureDefinitions: number;
  numericFeatureCount: number;
  categoricalFeatureCount: number;
  binaryFeatureCount: number;
  availableFeatureCount: number;
  partiallyAvailableFeatureCount: number;
  unavailableFeatureCount: number;
  predictiveFeatureCount: number;
  rejectedLeakageFeatureCount: number;
}

export interface FeatureAblationDefinition {
  ablationId: string;
  name: string;
  excludedGroup?: FeatureGroupIdentifier;
  includedGroups: FeatureGroupIdentifier[];
}

export interface FirstPartyVsExternalReport {
  firstPartySampleCount: number;
  externalSampleCount: number;
  firstPartyCoverage: number;
  externalCoverage: number;
  provenanceLeakageStatus: 'PASSED' | 'FAILED';
}

export interface FeatureQualityScoreBreakdown {
  coverageScore: number;
  missingnessScore: number;
  reproducibilityScore: number;
  leakageSafetyScore: number;
  shortcutSafetyScore: number;
  normalizationReadinessScore: number;
  datasetCoverageScore: number;
  classCoverageScore: number;
  featureDiversityScore: number;
  distributionStabilityScore: number;
  totalQualityScore: number;
}

export interface LayoutFeatureAuditResult {
  schemaVersion: string;
  totalFeaturesCount: number;
  featureGroupsCount: number;
  datasetCoverageMatrix: FeatureSourceCoverageCell[];
  featureStatistics: Record<string, FeatureNumericalStats>;
  normalizationSpec: NormalizationSpecReport;
  missingnessReport: FeatureMissingnessAudit;
  distributionAudit: FeatureDistributionShiftCell[];
  leakageAudit: FeatureLeakageAuditReport;
  shortcutAudit: LabelShortcutAuditCell[];
  classFeatureCoverage: ClassFeatureCoverageReport[];
  featureDimensions: FeatureDimensionsReport;
  ablationDefinitions: FeatureAblationDefinition[];
  firstPartyVsExternal: FirstPartyVsExternalReport;
  featureQualityScore: FeatureQualityScoreBreakdown;
  trainingReadiness: {
    schemaReady: boolean;
    coverageReady: boolean;
    leakageSafe: boolean;
    shortcutSafe: boolean;
    normalizationReady: boolean;
    splitSafe: boolean;
    distributionReady: boolean;
    classSupportReady: boolean;
    reproducibilityReady: boolean;
    overallTrainingReady: 'READY_FOR_BASELINE' | 'NEEDS_REVIEW' | 'BLOCKED';
  };
  auditedAt: string;
}
