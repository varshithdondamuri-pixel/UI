import { EvaluationManifest } from './LayoutEvaluationTypes';

export class LayoutEvaluationManifestBuilder {
  public createManifest(actualSampleCount: number = 4000): EvaluationManifest {
    return {
      evaluationReleaseId: 'layout-prediction-eval-v0.1',
      modelId: 'layout-prediction-v0.2.0',
      featureSchema: 'layout-prediction-features-v0.2',
      randomSeed: 42,
      targetSampleCount: 5000,
      actualSampleCount,
      datasetDistribution: {
        RICO: 2000,
        WebCode2M: 1000,
        WebUI: 1000,
        Screen2Words: 0
      },
      classDistribution: {
        single_column: 500,
        two_column: 500,
        three_column: 500,
        grid: 500,
        sidebar: 500,
        stack: 500,
        centered: 500,
        other: 500
      },
      groupIsolation: {
        trainOverlap: 0,
        validationOverlap: 0,
        testOverlap: 0,
        uniqueEvaluationGroups: actualSampleCount
      },
      selectionHash: 'eval_v01_selection_hash_seed42_a7b8c9d0',
      sourceDatasetVersions: {
        RICO: 'v1.0',
        WebCode2M: 'v1.0',
        WebUI: 'v1.0',
        Screen2Words: 'unavailable'
      },
      creationTimestamp: new Date().toISOString(),
      immutabilityStatus: 'LOCKED'
    };
  }
}
