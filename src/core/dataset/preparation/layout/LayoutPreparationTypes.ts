export type LayoutClassLabel =
  | 'single_column'
  | 'two_column'
  | 'three_column'
  | 'grid'
  | 'sidebar'
  | 'stack'
  | 'centered'
  | 'other';

export type LabelConfidence = 'high' | 'medium' | 'low';

export interface LayoutDerivedLabel {
  label: LayoutClassLabel;
  labelSource: 'deterministic_rule_engine';
  labelConfidence: LabelConfidence;
  derivationEvidence: string[];
  sourceDataset: string;
  sourceRecordId: string;
  geometryEvidence: {
    boundingBoxesCount: number;
    alignedColumnsCount: number;
    alignedRowsCount: number;
    hasSidebarRegion: boolean;
    hasSymmetricMargins: boolean;
    aspectRatio: number;
  };
  structureEvidence: {
    containerType: string;
    flexDirection?: string;
    gridTemplate?: string;
    parentChildCount: number;
  };
}

export interface LayoutPreparationSample {
  sampleId: string;
  sourceDataset: string;
  sourceRecordId: string;
  groupId: string; // screenId, documentId, or pageId
  derivedLabel: LayoutDerivedLabel;
  geometry: {
    viewportWidth: number;
    viewportHeight: number;
    elementCount: number;
    boundingAreaCoverage: number;
  };
  structure: {
    hierarchyDepth: number;
    containerCount: number;
  };
  qualityStatus: 'valid' | 'rejected';
  rejectionReason?: string;
}

export interface LayoutDatasetCoverageItem {
  datasetName: string;
  rawCount: number;
  usableCount: number;
  rejectedCount: number;
  labelCoverage: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  supportedLabels: LayoutClassLabel[];
  unsupportedLabels: LayoutClassLabel[];
}

export interface LayoutClassDistributionItem {
  className: LayoutClassLabel;
  count: number;
  percentage: number;
}

export interface LayoutPreparationResult {
  releaseId: string;
  preparedAt: string;
  datasetVersion: string;
  statistics: {
    totalRawRecords: number;
    candidateRecords: number;
    validRecords: number;
    rejectedRecords: number;
    unavailableRecords: number;
    labelCoverage: number;
  };
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  classDistribution: {
    classes: LayoutClassDistributionItem[];
    majorityClass: LayoutClassLabel;
    minorityClass: LayoutClassLabel;
    imbalanceRatio: number;
  };
  datasetCoverage: Record<string, LayoutDatasetCoverageItem>;
  duplicateReport: {
    exactDuplicates: number;
    nearDuplicates: number;
    crossSourceDuplicates: number;
    totalDuplicates: number;
  };
  splitManifest: {
    trainCount: number;
    valCount: number;
    testCount: number;
    totalCount: number;
    groupLeakageCount: number;
    seed: number;
  };
  featureCoverageReport: {
    candidateGroupsCount: number;
    availableGroupsCount: number;
    partiallyAvailableGroupsCount: number;
    unavailableGroupsCount: number;
    groups: Record<string, 'available' | 'partially_available' | 'unavailable'>;
  };
  trainingReadiness: {
    trainingReady: boolean;
    labelCoverageReady: boolean;
    classSupportReady: boolean;
    leakageReady: boolean;
    duplicateReady: boolean;
    featureCoverageReady: boolean;
    splitReady: boolean;
    overallPreparationStatus: 'ready' | 'needs_review' | 'blocked';
  };
  manifestPath: string;
}
