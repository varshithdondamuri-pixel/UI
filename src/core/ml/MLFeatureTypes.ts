export type MLFeatureGroup =
  | 'sketch_features'
  | 'geometry_features'
  | 'semantic_features'
  | 'intent_features'
  | 'layout_features'
  | 'component_features'
  | 'visual_features'
  | 'typography_features'
  | 'color_features'
  | 'spacing_features'
  | 'responsive_features'
  | 'accessibility_features'
  | 'interaction_features'
  | 'preference_features'
  | 'quality_features'
  | 'prompt_features'
  | 'industry_features'
  | 'style_features';

export type MLFeatureType = 'numerical' | 'categorical' | 'binary' | 'vector' | 'text';
export type MLNormalizationStrategy = 'none' | 'min_max' | 'standard' | 'one_hot';
export type MLMissingValueStrategy = 'zero' | 'mean' | 'mode' | 'omit';

export interface MLFeature {
  featureId: string;
  featureName: string;
  featureType: MLFeatureType;
  group: MLFeatureGroup;
  source: string;
  value: any;
  normalizedValue?: number | number[] | string;
  normalization: MLNormalizationStrategy;
  missingValueStrategy: MLMissingValueStrategy;
}

export interface MLFeatureVector {
  sampleId: string;
  features: Record<string, MLFeature>;
  featureGroups: MLFeatureGroup[];
  extractedAt: string;
  version: string;
}
