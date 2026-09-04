import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';

export type DimensionStatus = 'PASS' | 'WARNING' | 'FAIL';
export type AuditStatus = 'EVALUATED' | 'BLOCKED' | 'UNAVAILABLE';
export type RecommendationResult = 'keep_candidate' | 'improve_features' | 'ready_for_large_scale_evaluation';

export interface ModelComparisonAuditResult {
  v01Accuracy: number;
  v02Accuracy: number;
  accuracyDelta: number;
  v01MacroF1: number;
  v02MacroF1: number;
  macroF1Delta: number;
  v01WeightedF1: number;
  v02WeightedF1: number;
  weightedF1Delta: number;
  predictionAgreement: number;
  status: 'IMPROVED' | 'UNCHANGED' | 'REGRESSED';
}

export interface DatasetAuditCell {
  datasetName: string;
  sampleCount: number;
  accuracy: number | null;
  macroF1: number | null;
  weightedF1: number | null;
  errorCount: number;
  classCoverage: number;
  meanConfidence: number | null;
  status: 'evaluated' | 'unavailable';
  unavailabilityReason?: string;
}

export interface PerDatasetAuditResult {
  datasetResults: DatasetAuditCell[];
  evaluatedDatasetCount: number;
  datasetMeanAccuracy: number;
  datasetStdDevAccuracy: number;
  datasetMinAccuracy: number;
  datasetMaxAccuracy: number;
}

export interface ClassAuditRow {
  className: LayoutClassLabel;
  category: 'Majority' | 'Minority';
  support: number;
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1Score: number;
  errorCount: number;
  meanConfidence: number;
  v01F1: number;
  v02F1: number;
  f1Delta: number;
  status: 'IMPROVED' | 'STABLE' | 'REGRESSED';
}

export interface PerClassAuditResult {
  classRows: ClassAuditRow[];
}

export interface MinorityClassRow {
  className: LayoutClassLabel;
  previousF1: number;
  newF1: number;
  f1Improvement: number;
  previousRecall: number;
  newRecall: number;
  recallImprovement: number;
  previousPrecision: number;
  newPrecision: number;
  precisionImprovement: number;
  support: number;
  errorCount: number;
  meanConfidence: number;
  status: 'improved' | 'partially_improved' | 'unchanged' | 'regressed';
}

export interface MinorityClassAuditResult {
  minorityRows: MinorityClassRow[];
  previousMinorityMacroF1: number;
  newMinorityMacroF1: number;
  minorityMacroF1Delta: number;
  solvedStatus: boolean;
}

export interface FeatureGroupAuditCell {
  groupName: string;
  featureCount: number;
  availability: number;
  missingness: number;
  datasetCoverage: number;
  minorityClassCoverage: number;
  unavailableValueCount: number;
  structuralCoverage: number;
}

export interface FeatureGroupAuditResult {
  groupCells: FeatureGroupAuditCell[];
  totalFeatureCount: number;
  totalGroupCount: number;
}

export interface FeatureAblationAuditResult {
  status: 'BLOCKED';
  reason: string;
  retrainingAttempted: false;
}

export interface LeakageAuditResult {
  leakageStatus: 'PASSED' | 'FAILED';
  prohibitedFeatureCount: number;
  checkedFields: string[];
}

export interface DuplicateAuditResult {
  duplicateCount: number;
  nearDuplicateCount: number;
  crossSplitDuplicateCount: number;
  screenOverlapCount: number;
  influenceRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DistributionShiftAuditResult {
  featureShiftScore: number;
  classShiftScore: number;
  datasetShiftScore: number;
  viewportShiftScore: number;
  minorityShiftScore: number;
  distributionStatus: 'STABLE' | 'MODERATE_SHIFT' | 'HIGH_SHIFT';
}

export interface ConfidenceAuditResult {
  meanConfidence: number;
  medianConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  highConfidenceErrorCount: number;
  highConfidenceErrorRate: number;
  confidenceByClass: Record<string, number>;
  confidenceByDataset: Record<string, number>;
}

export interface ErrorAnalysisV02Result {
  totalErrors: number;
  errorRate: number;
  confusionCategories: Record<string, number>;
  addressedPreviousWeaknesses: boolean;
}

export interface CrossDatasetAuditResult {
  status: 'BLOCKED';
  reason: string;
  simulated: false;
}

export interface ReproducibilityAuditResult {
  seed: number;
  run1Hash: string;
  run2Hash: string;
  matches: boolean;
  reproducibility: 'PASSED' | 'FAILED';
}

export interface ScorecardDimension {
  dimensionName: string;
  status: DimensionStatus;
  details: string;
}

export interface ScorecardV02Result {
  dimensions: ScorecardDimension[];
  passedDimensions: number;
  warningDimensions: number;
  failedDimensions: number;
  overallScore: number; // 0 - 100
  overallStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export interface AuditSummaryV02Report {
  modelId: string;
  task: 'layout_prediction';
  datasetReleaseId: string;
  featureSchemaVersion: string;
  status: 'candidate';
  deploymentStatus: 'not_active';
  auditedAt: string;
  modelComparison: ModelComparisonAuditResult;
  perDataset: PerDatasetAuditResult;
  perClass: PerClassAuditResult;
  minorityClass: MinorityClassAuditResult;
  featureGroups: FeatureGroupAuditResult;
  ablation: FeatureAblationAuditResult;
  leakage: LeakageAuditResult;
  duplicate: DuplicateAuditResult;
  distribution: DistributionShiftAuditResult;
  confidence: ConfidenceAuditResult;
  errorAnalysis: ErrorAnalysisV02Result;
  crossDataset: CrossDatasetAuditResult;
  reproducibility: ReproducibilityAuditResult;
  scorecard: ScorecardV02Result;
  recommendation: RecommendationResult;
  governanceUntouched: boolean;
}
