export interface ComponentLabelRecord {
  labelId: string;
  canonicalName: string;
  sourceLabels: string[];
  definition: string;
  derivationRule: string;
  confidence: number;
  sourceCoverage: number;
  validationStatus: 'valid' | 'invalid' | 'rejected' | 'unavailable';
}

export interface ComponentPreparationSample {
  sampleId: string;
  datasetName: 'RICO' | 'Screen2Words' | 'WebCode2M' | 'WebUI';
  groupId: string; // screenId or documentId
  componentLabel: string;
  labelConfidence: number;
  isSupported: boolean;
  unavailableReason?: string;
  geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
    aspectRatio: number;
    area: number;
    relativeWidth: number;
    relativeHeight: number;
  };
  structure: {
    depth: number;
    siblingCount: number;
    childCount: number;
    hasText: boolean;
    hasImage: boolean;
    hasChildInput: boolean;
    tagType: string;
    role: string;
  };
  textContext?: {
    textLength: number;
    wordCount: number;
    hasKeywordButton: boolean;
    hasKeywordInput: boolean;
    hasKeywordNav: boolean;
  };
  provenance: {
    sourceName: string;
    sourceVersion?: string;
  };
}

export interface ComponentPreparationResult {
  releaseId: string;
  preparedAt: string;
  datasetVersion: string;
  statistics: {
    totalRawRecords: number;
    eligibleRecords: number;
    rejectedRecords: number;
    validRecords: number;
    unavailableRecords: number;
    labelCoverage: number;
    datasetCoverage: number;
  };
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  classDistribution: Record<string, { count: number; percentage: number; isMajority: boolean; isMinority: boolean }>;
  datasetCoverage: Record<string, { totalRaw: number; usable: number; coveragePct: number; supportedLabels: string[] }>;
  duplicateReport: {
    totalEvaluated: number;
    exactDuplicates: number;
    nearDuplicates: number;
    uniqueCount: number;
    duplicateRiskScore: number;
  };
  splitManifest: {
    trainCount: number;
    valCount: number;
    testCount: number;
    groupLeakageCount: number;
    leakageStatus: 'passed' | 'failed';
    trainPct: number;
    valPct: number;
    testPct: number;
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
    overallPreparationStatus: 'ready' | 'not_ready';
  };
  manifestPath: string;
}
