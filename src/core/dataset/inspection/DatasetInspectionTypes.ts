import { FullDesignSample } from '../DatasetTypes';
import { MLTaskIdentifier } from '../../ml/MLTaskTypes';

export type TaskCompatibilityStatus = 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED' | 'UNKNOWN';

export type FeatureGroupIdentifier =
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

export type FileCategory =
  | 'image'
  | 'json'
  | 'jsonl'
  | 'csv'
  | 'parquet'
  | 'html'
  | 'css'
  | 'code'
  | 'archive'
  | 'unknown';

export interface DatasetInspectionLimits {
  maxFilesToInspect: number;
  maxSamplesPerDataset: number;
  maxBytesToRead: number;
  maxRowsPerFile: number;
  maxPreviewLength: number;
}

export const DEFAULT_INSPECTION_LIMITS: DatasetInspectionLimits = {
  maxFilesToInspect: 500,
  maxSamplesPerDataset: 50,
  maxBytesToRead: 5 * 1024 * 1024, // 5MB
  maxRowsPerFile: 100,
  maxPreviewLength: 250
};

export interface FileFormatStats {
  format: FileCategory;
  count: number;
  totalBytes: number;
  extensions: string[];
}

export interface DatasetFileStats {
  rootPath: string;
  totalFiles: number;
  totalDirectories: number;
  totalBytes: number;
  formatDistribution: Record<FileCategory, number>;
  extensionDistribution: Record<string, number>;
  sampleFileNames: string[];
}

export interface DatasetFieldSummary {
  fieldName: string;
  dataType: string;
  presentInPercentage: number;
  sampleValues: any[];
  isVerified: boolean;
  description?: string;
}

export interface DatasetSchemaSummary {
  primaryFormat: FileCategory;
  topLevelFields: DatasetFieldSummary[];
  nestedFields: Record<string, DatasetFieldSummary[]>;
  rawSchemaDetails: Record<string, string>;
}

export interface TaskCompatibilityDetail {
  task: MLTaskIdentifier;
  status: TaskCompatibilityStatus;
  rationale: string;
  requiredFieldsPresent: string[];
  missingFields: string[];
}

export interface FeatureGroupCompatibilityDetail {
  featureGroup: FeatureGroupIdentifier;
  status: 'available' | 'partiallyAvailable' | 'missing' | 'unsupported';
  supportedFields: string[];
  missingFields: string[];
}

export interface DatasetSamplePreview {
  sampleId: string;
  fields: Record<string, any>;
}

export interface DatasetStatisticsSummary {
  datasetSizeFormatted: string;
  totalBytes: number;
  estimatedSampleCount: number;
  fileCount: number;
  imageCount: number;
  metadataCount: number;
  avgTextLength: number | null;
  fieldCoveragePercentage: number;
  missingFieldPercentage: number;
  duplicateIndicators: string[];
  splits: {
    trainCount?: number;
    devCount?: number;
    testCount?: number;
    validationCount?: number;
  };
}

export interface DatasetLicenseInfo {
  license: string;
  source: string;
  citation: string;
  usageRestrictions: string[];
  attributionRequirements: string;
  isVerifiedLocally: boolean;
}

export interface DatasetInspectionResult {
  datasetId: string;
  datasetName: string;
  localPath: string;
  inspectionTimestamp: string;
  isDiscovered: boolean;
  fileStats: DatasetFileStats;
  schemaSummary: DatasetSchemaSummary;
  samplePreview: DatasetSamplePreview[];
  statistics: DatasetStatisticsSummary;
  licenseInfo: DatasetLicenseInfo;
  taskCompatibility: Record<MLTaskIdentifier, TaskCompatibilityDetail>;
  featureGroupCompatibility: {
    availableFeatureGroups: FeatureGroupIdentifier[];
    partiallyAvailableFeatureGroups: FeatureGroupIdentifier[];
    missingFeatureGroups: FeatureGroupIdentifier[];
    unsupportedFeatureGroups: FeatureGroupIdentifier[];
    details: Record<FeatureGroupIdentifier, FeatureGroupCompatibilityDetail>;
  };
  normalizationStatus: {
    isNormalizable: boolean;
    adapterName: string;
    normalizedSampleCount: number;
    provenanceSourceType: 'external';
    provenanceSourceName: string;
  };
  warnings: string[];
  errors: string[];
}

export interface CombinedInspectionReport {
  generatedAt: string;
  datasetCount: number;
  datasets: Record<string, DatasetInspectionResult>;
  mlTaskAvailabilityMatrix: Record<MLTaskIdentifier, Record<string, TaskCompatibilityStatus>>;
  overallSummary: {
    totalBytes: number;
    totalFiles: number;
    supportedTasksAcrossDatasets: Record<MLTaskIdentifier, string[]>;
  };
}

export interface DatasetAdapterInterface {
  datasetName: string;
  normalize(rawRecord: any, recordId?: string): { sample: FullDesignSample | null; errors: string[] };
}
