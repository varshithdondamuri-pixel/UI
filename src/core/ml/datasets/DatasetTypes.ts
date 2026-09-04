export type MLDatasetCategory =
  | 'design-systems-ds'
  | 'layout-ds'
  | 'component-ds'
  | 'ux-pattern-ds'
  | 'industry-ds'
  | 'design-style-ds'
  | 'color-ds'
  | 'typography-ds'
  | 'animation-ds'
  | 'accessibility-ds'
  | 'responsive-ds'
  | 'charts-ds'
  | 'forms-ds'
  | 'icons-ds'
  | 'illustration-ds'
  | 'component-states-ds'
  | 'ux-research-ds'
  | 'conversion-ds'
  | 'design-trend-ds'
  | 'generated-design-ds';

export interface MLDatasetRecord {
  id: string;
  category: MLDatasetCategory;
  subcategory: string;
  title: string;
  description: string;
  industry: string;
  style: string;
  purpose: string;
  tags: string[];
  keywords: string[];
  qualityScore: number;
  accessibilityScore: number;
  responsiveSupport: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  source: string;
  license: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  relationships: { targetId: string; relationshipType: string }[];
  payload?: Record<string, any>;
}

export interface MLDatasetMetadata {
  datasetId: string;
  datasetName: string;
  category: MLDatasetCategory;
  version: string;
  author: string;
  license: string;
  source: string;
  entryCount: number;
  lastUpdated: number;
  qualityScore: number;
  coverage: number;
}
