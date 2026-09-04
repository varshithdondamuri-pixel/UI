export type MLTaskIdentifier =
  | 'ui_understanding'
  | 'semantic_prediction'
  | 'intent_prediction'
  | 'layout_prediction'
  | 'component_recommendation'
  | 'visual_style_recommendation'
  | 'responsive_prediction'
  | 'design_quality_prediction'
  | 'alternative_ranking'
  | 'user_preference_prediction';

export type MLTaskStatus =
  | 'planned'
  | 'dataset_ready'
  | 'features_ready'
  | 'baseline_ready'
  | 'training_ready'
  | 'training'
  | 'evaluated'
  | 'approved'
  | 'deployed'
  | 'disabled';

export interface MLTaskDefinition {
  id: MLTaskIdentifier;
  name: string;
  description: string;
  status: MLTaskStatus;
  requiredFeatureGroups: string[];
  labelType: 'categorical' | 'ordinal' | 'continuous' | 'ranking' | 'multi_label' | 'binary';
  primaryMetric: string;
  datasetSampleCount: number;
  approvedModelId?: string;
  lastEvaluatedAt?: string;
  updatedAt: string;
}
