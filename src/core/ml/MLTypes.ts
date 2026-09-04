export * from './MLTaskTypes';
export * from './MLFeatureTypes';

// --- Phase 7 Backward Compatible Types ---
export type ModelStatus = 'ready' | 'loading' | 'active' | 'deprecated' | 'training' | 'candidate' | 'evaluating' | 'approved' | 'rejected';

export interface ModelMetrics {
  accuracy: number; // 0 to 1
  precision: number; // 0 to 1
  recall: number; // 0 to 1
  f1Score: number; // 0 to 1
  confidence: number; // 0 to 1
  predictionLatencyMs: number;
  coverage: number; // percentage 0 to 100
}

export interface RegisteredModel {
  id: string;
  name: string;
  version: string;
  status: ModelStatus;
  inputSchema: string[];
  outputSchema: string[];
  metrics: ModelMetrics;
  lastTrainedAt?: number;
}

export interface FeatureVector {
  layoutDepth: number;
  sectionCount: number;
  gridDensity: number;
  whitespaceRatio: number;
  hierarchyScore: number;
  componentCount: number;
  accessibilityScore: number;
  industry: string;
  style: string;
  hasNavbar: boolean;
  hasHero: boolean;
  hasFooter: boolean;
  hasSidebar: boolean;
}

export interface PredictionResult<T = any> {
  modelId: string;
  prediction: T;
  confidence: number; // 0 to 1
  alternatives: { option: T; confidence: number }[];
  latencyMs: number;
}

export interface QualityPrediction {
  hierarchyQuality: number;
  spacingQuality: number;
  readabilityScore: number;
  accessibilityScore: number;
  consistencyScore: number;
  overallScore: number;
}

export interface TrendPrediction {
  recommendedTrend: string;
  confidence: number;
  popularTrends: { trendName: string; popularity: number }[];
}

export interface PredictionBundle {
  id: string;
  layoutPrediction: PredictionResult<string>;
  stylePrediction: PredictionResult<string>;
  typographyPrediction: PredictionResult<{ scaleRatio: number; headingFont: string; bodyFont: string }>;
  colorPrediction: PredictionResult<{ primaryColor: string; contrastScore: number; wcagLevel: string }>;
  accessibilityPrediction: PredictionResult<{ wcagCompliant: boolean; score: number }>;
  trendPrediction: PredictionResult<TrendPrediction>;
  qualityPrediction: PredictionResult<QualityPrediction>;
  rankings: { id: string; name: string; score: number }[];
  totalLatencyMs: number;
  timestamp: number;
}

export interface DatasetSample {
  id: string;
  prompt?: string;
  industry: string;
  style: string;
  featureVector: FeatureVector;
  userRating?: number;
  approved: boolean;
  createdAt: number;
}

// --- Phase 12 ML Intelligence Intelligence Bundle ---
export interface MLIntelligenceBundle {
  predictions: Record<string, any>;
  confidence: number;
  modelVersions: Record<string, string>;
  featureVersions: Record<string, string>;
  taskResults: Record<string, any>;
  evaluationStatus: string;
  availability: 'available' | 'partially_available' | 'unavailable';
  unavailableReason?: string;
  timestamp: number;
}
