import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';

export type RecommendationType = 'keep_candidate' | 'improve_features' | 'reject_candidate';

export type AuditDimensionStatus = 'PASS' | 'WARNING' | 'FAIL' | 'BLOCKED';

export interface ModelComparisonResultCell {
  modelName: string;
  modelType: string;
  accuracy: number;
  macroF1: number;
  weightedF1: number;
  precision: number;
  recall: number;
}

export interface LayoutModelComparisonAuditResult {
  modelId: string;
  validation: {
    baselineA: ModelComparisonResultCell;
    baselineB: ModelComparisonResultCell;
    improvement: {
      accuracyDelta: number;
      macroF1Delta: number;
      weightedF1Delta: number;
      relativeAccuracyGain: number;
    };
  };
  test: {
    baselineA: ModelComparisonResultCell;
    baselineB: ModelComparisonResultCell;
    improvement: {
      accuracyDelta: number;
      macroF1Delta: number;
      weightedF1Delta: number;
      relativeAccuracyGain: number;
    };
  };
}

export interface PerDatasetAuditCell {
  datasetName: string;
  sampleCount: number;
  accuracy: number | null;
  macroF1: number | null;
  weightedF1: number | null;
  errorCount: number;
  status: 'evaluated' | 'unavailable';
  reason?: string;
}

export interface LayoutPerDatasetAuditResult {
  datasets: PerDatasetAuditCell[];
  evaluatedCount: number;
  unavailableCount: number;
}

export interface ClassPerformanceCell {
  className: LayoutClassLabel;
  support: number;
  precision: number;
  recall: number;
  f1Score: number;
  errorCount: number;
}

export interface LayoutPerClassAuditResult {
  classes: ClassPerformanceCell[];
  strongestClass: LayoutClassLabel;
  weakestClass: LayoutClassLabel;
  majorityClass: LayoutClassLabel;
  minorityClass: LayoutClassLabel;
  insufficientPerformanceClasses: LayoutClassLabel[];
}

export interface FeatureGroupAuditCell {
  groupName: string;
  featureCount: number;
  availability: 'full' | 'partial' | 'missing';
  missingRate: number;
  datasetCoverage: Record<string, number>;
  leakageStatus: 'PASSED' | 'FAILED';
  qualityStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export interface LayoutFeatureGroupAuditResult {
  groups: FeatureGroupAuditCell[];
  totalFeatureCount: number;
  missingInformationIdentified: boolean;
  missingNotes: string[];
}

export interface AblationCell {
  featureGroup: string;
  status: 'observed' | 'unavailable' | 'blocked';
  accuracy?: number;
  macroF1?: number;
  reason?: string;
}

export interface LayoutFeatureAblationAuditResult {
  fullFeatureRepresentation: {
    accuracy: number;
    macroF1: number;
  };
  ablations: AblationCell[];
  status: 'blocked';
  reason: string;
}

export interface LayoutLeakageAuditResult {
  targetLabelLeakage: boolean;
  labelConfidenceLeakage: boolean;
  datasetIdentityLeakage: boolean;
  sourceRecordIdLeakage: boolean;
  screenIdLeakage: boolean;
  documentIdLeakage: boolean;
  splitMembershipLeakage: boolean;
  postOutcomeLeakage: boolean;
  leakageStatus: 'PASSED' | 'FAILED';
  prohibitedMatchesCount: number;
  warnings: string[];
}

export interface LayoutDuplicateAuditResult {
  duplicateCount: number;
  nearDuplicateCount: number;
  crossSplitDuplicates: number;
  sameScreenDuplication: number;
  sameDocumentDuplication: number;
  crossSplitRisk: 'none' | 'low' | 'moderate' | 'high';
  influenceRisk: 'none' | 'low' | 'moderate' | 'high';
}

export interface DistributionShiftAuditResult {
  classDistributionShift: {
    trainVsValidationShift: number;
    trainVsTestShift: number;
    validationVsTestShift: number;
  };
  featureDistributionShift: {
    trainVsValidationShift: number;
    trainVsTestShift: number;
    validationVsTestShift: number;
  };
  datasetCompositionShift: {
    trainVsValidationShift: number;
    trainVsTestShift: number;
    validationVsTestShift: number;
  };
  missingnessShift: {
    trainVsValidationShift: number;
    trainVsTestShift: number;
    validationVsTestShift: number;
  };
  overallStabilityStatus: 'STABLE' | 'MODERATE_SHIFT' | 'HIGH_SHIFT';
}

export interface ClassImbalanceAuditResult {
  majorityClass: LayoutClassLabel;
  minorityClass: LayoutClassLabel;
  imbalanceRatio: number;
  perClassSupport: Record<string, number>;
  macroVsWeightedGap: number;
  imbalanceAffectsBaseline: boolean;
  explanation: string;
}

export interface LayoutConfidenceAuditResult {
  status: 'evaluated' | 'unavailable';
  meanConfidence: number;
  medianConfidence: number;
  lowConfidenceCount: number;
  highConfidenceErrorCount: number;
  confidenceByClass: Record<string, number>;
  reason?: string;
}

export interface ErrorCategoryCell {
  category: string;
  count: number;
  percentage: number;
  description: string;
}

export interface LayoutErrorAnalysisResult {
  totalErrors: number;
  errorRate: number;
  severityDistribution: {
    critical: number;
    moderate: number;
    minor: number;
  };
  errorCategories: ErrorCategoryCell[];
  representativeEvidence: string[];
}

export interface LayoutCrossDatasetAuditResult {
  status: 'blocked';
  reason: string;
  transferEvaluations: {
    trainDataset: string;
    testDataset: string;
    status: 'blocked';
  }[];
}

export interface ReproducibilityAuditResult {
  reproducibilityStatus: 'passed' | 'failed';
  hashMatch: boolean;
  metricMatch: boolean;
  predictionMatch: boolean;
  seed: number;
}

export interface ScorecardDimension {
  dimension: string;
  status: AuditDimensionStatus;
  evidence: string;
  rationale: string;
}

export interface GeneralizationScorecardResult {
  dimensions: ScorecardDimension[];
  passCount: number;
  warningCount: number;
  failCount: number;
  blockedCount: number;
  overallScorecardStatus: AuditDimensionStatus;
}

export interface LayoutGeneralizationAuditSummary {
  modelId: string;
  task: string;
  modelStatus: 'candidate';
  deploymentStatus: 'not_active';
  activeProductionModel: 'ui-understanding-v0.2.0';
  activeProductionModelStatus: 'approved';
  activeProductionDeploymentStatus: 'production';
  auditedAt: string;
  metrics: {
    accuracy: number;
    macroF1: number;
    weightedF1: number;
    precision: number;
    recall: number;
  };
  modelComparison: LayoutModelComparisonAuditResult;
  perDataset: LayoutPerDatasetAuditResult;
  perClass: LayoutPerClassAuditResult;
  featureGroups: LayoutFeatureGroupAuditResult;
  featureAblation: LayoutFeatureAblationAuditResult;
  leakage: LayoutLeakageAuditResult;
  duplicates: LayoutDuplicateAuditResult;
  distributionShift: DistributionShiftAuditResult;
  classImbalance: ClassImbalanceAuditResult;
  confidence: LayoutConfidenceAuditResult;
  errorAnalysis: LayoutErrorAnalysisResult;
  crossDataset: LayoutCrossDatasetAuditResult;
  reproducibility: ReproducibilityAuditResult;
  scorecard: GeneralizationScorecardResult;
  finalRecommendation: RecommendationType;
  recommendationRationale: string;
}
