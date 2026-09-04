export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  macroF1: number;
  weightedF1: number;
  topKAccuracy?: number;
  confusionMatrix?: { labels: string[]; matrix: number[][] };
}

export interface RegressionMetrics {
  MAE: number;
  RMSE: number;
  R2: number;
  calibrationError?: number;
}

export interface RankingMetrics {
  NDCG: number;
  MRR: number;
  pairwiseAccuracy: number;
}

export interface DesignQualityTaskMetrics {
  visualQualityMAE: number;
  uxQualityMAE: number;
  accessibilityMAE: number;
  responsiveQualityMAE: number;
  typographyMAE: number;
  spacingMAE: number;
  hierarchyMAE: number;
  consistencyMAE: number;
  codeQualityMAE: number;
  overallQualityMAE: number;
}

export interface UserPreferenceTaskMetrics {
  selectionAccuracy: number;
  rejectionAccuracy: number;
  pairwisePreferenceAccuracy: number;
  qualityDeltaCorrelation: number;
}
