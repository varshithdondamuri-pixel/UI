export type UIUnderstandingFeatureGroup =
  | 'geometry'
  | 'spatial'
  | 'alignment'
  | 'spacing'
  | 'density'
  | 'components'
  | 'component_composition'
  | 'text'
  | 'hierarchy'
  | 'visual'
  | 'typography'
  | 'viewport'
  | 'semantic'
  | 'intent'
  | 'blueprint'
  | 'visual_design'
  | 'quality'
  | 'provenance';

export type FeatureAvailability = 'available' | 'unavailable' | 'not_applicable' | 'invalid';
export type CoverageStatus = 'SUPPORTED' | 'PARTIAL' | 'UNAVAILABLE';

export interface UIUnderstandingFeatureSpec {
  featureId: string;
  featureName: string;
  featureGroup: UIUnderstandingFeatureGroup;
  type: 'numerical' | 'categorical' | 'binary' | 'vector' | 'text';
  source: string;
  availability: FeatureAvailability;
  value: any;
  normalizedValue?: number | number[] | string;
  normalization: string;
  missingValueStrategy: string;
  description: string;
  version: string;
  leakageStatus: 'guarded_clean' | 'rejected_target_leakage' | 'rejected_shortcut';
}

export interface UIFeatureLeakageGuardReport {
  sampleId: string;
  totalExtractedFeatures: number;
  acceptedFeatures: number;
  rejectedFeatures: number;
  rejectedFeatureIds: string[];
  rejectionReasons: Record<string, string>;
  isClean: boolean;
}

export interface ExpandedUIFeatureVector {
  sampleId: string;
  schemaVersion: 'ui-understanding-features-v0.2';
  features: Record<string, UIUnderstandingFeatureSpec>;
  activeFeatureGroups: UIUnderstandingFeatureGroup[];
  extractedAt: string;
  leakageReport: UIFeatureLeakageGuardReport;
}

export interface FeatureStats {
  featureId: string;
  count: number;
  missingCount: number;
  missingRate: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  uniqueCount: number;
  sourceCoverage: Record<string, number>;
}

export interface DatasetCoverageMatrix {
  featureGroups: Record<UIUnderstandingFeatureGroup, Record<'RICO' | 'Screen2Words' | 'WebCode2M' | 'WebUI', CoverageStatus>>;
  lastUpdated: string;
}
