export interface StylePreparationSample {
  sampleId: string;
  datasetName: 'RICO' | 'Screen2Words' | 'WebCode2M' | 'WebUI';
  groupId: string;
  styleLabel: string;
  labelConfidence: number;
  isSupported: boolean;
  unavailableReason?: string;
  colorContext: {
    dominantColors: string[];
    paletteEntropy: number;
    contrastRatio: number;
    colorCount: number;
    hasDarkBackground: boolean;
  };
  typographyContext: {
    fontFamilies: string[];
    fontSizeRatio: number;
    textDensity: number;
    headingRatio: number;
  };
  spacingContext: {
    densityScore: number;
    paddingConsistency: number;
    gridRhythmScore: number;
  };
  visualContext: {
    edgeDensity: number;
    imageToTextRatio: number;
    shadowCount: number;
    borderCount: number;
    cornerRadiusAvg: number;
  };
  provenance: {
    sourceName: string;
  };
}

export interface StylePreparationResult {
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
  classDistribution: Record<string, number>;
  datasetCoverage: Record<string, { total: number; valid: number; coverage: number; status: 'available' | 'unavailable' }>;
  duplicateReport: {
    totalEvaluated: number;
    duplicateCount: number;
    uniqueCount: number;
  };
  splitManifest: {
    trainCount: number;
    valCount: number;
    testCount: number;
    groupLeakageCount: number;
  };
  featureCoverageReport: any;
  trainingReadiness: {
    trainingReady: boolean;
    labelCoverageReady: boolean;
    classSupportReady: boolean;
    leakageReady: boolean;
    duplicateReady: boolean;
    featureCoverageReady: boolean;
    splitReady: boolean;
    overallPreparationStatus: 'ready' | 'blocked';
  };
  manifestPath: string;
}
