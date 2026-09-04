import { EvaluationMetrics } from '../training/MLTrainingTypes';

export interface AblationResult {
  featureSet: string;
  testAccuracy: number;
  macroF1: number;
  weightedF1: number;
  precision: number;
  recall: number;
  deltaFromFullModel: number;
}

export interface FeatureLabelCorrelation {
  featureName: string;
  cardinality: number;
  hasDirectMappingToClass: boolean;
  correlationStatus: 'normal' | 'potential_shortcut' | 'suspicious' | 'confirmed_leakage' | 'unknown';
  notes: string;
}

export interface SourcePerformance {
  sourceName: string;
  sampleCount: number;
  accuracy: number | 'unavailable';
  macroF1: number | 'unavailable';
  weightedF1: number | 'unavailable';
  precision: number | 'unavailable';
  recall: number | 'unavailable';
}

export interface CrossDatasetResult {
  experimentName: string;
  trainSources: string[];
  testSource: string;
  status: 'completed' | 'blocked';
  reason?: string;
  testAccuracy?: number;
}

export interface SplitAuditResult {
  trainGroups: number;
  validationGroups: number;
  testGroups: number;
  overlapCount: number;
  leakageCount: number;
  leakageExamples: string[];
  status: 'passed' | 'failed';
}

export interface DuplicateAuditResult {
  exactDuplicates: number;
  nearDuplicates: number;
  crossSplitDuplicates: number;
  crossSourceDuplicates: number;
  duplicateExamples: string[];
}

export interface ClassDistributionAudit {
  numberOfClasses: number;
  classCounts: Record<string, number>;
  classPercentages: Record<string, number>;
  largestClass: string;
  smallestClass: string;
  imbalanceRatio: number;
  trainDistribution: Record<string, number>;
  validationDistribution: Record<string, number>;
  testDistribution: Record<string, number>;
}

export interface ContaminationCheckResult {
  checkName: string;
  status: 'PASS' | 'FAIL' | 'UNKNOWN';
  description: string;
}

export interface ReproducibilityResult {
  isReproducible: boolean;
  mismatchCount: number;
  predictionsMatched: number;
  status: 'passed' | 'reproducibility_failure';
}

export interface ScorecardCategory {
  category: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_ENOUGH_EVIDENCE';
  reason: string;
}

export interface GeneralizationScorecard {
  overallStatus: 'PASS' | 'WARNING' | 'FAIL';
  auditStatus: 'warning' | 'failed' | 'not_enough_evidence';
  categories: ScorecardCategory[];
  summaryNote: string;
}

export interface FullAuditReport {
  modelId: string;
  task: string;
  auditedAt: string;
  fullMetrics: EvaluationMetrics;
  ablationResults: AblationResult[];
  featureLabelAnalysis: FeatureLabelCorrelation[];
  sourcePerformance: SourcePerformance[];
  crossDatasetResults: CrossDatasetResult[];
  splitAudit: SplitAuditResult;
  duplicateAnalysis: DuplicateAuditResult;
  classDistribution: ClassDistributionAudit;
  contaminationChecks: ContaminationCheckResult[];
  reproducibility: ReproducibilityResult;
  scorecard: GeneralizationScorecard;
}
