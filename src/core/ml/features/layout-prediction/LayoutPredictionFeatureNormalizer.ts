import {
  FeatureNumericalStats,
  NormalizationFeatureSpec,
  NormalizationSpecReport
} from './LayoutPredictionFeatureTypes';
import { LayoutPredictionFeatureSchemaRegistry } from './LayoutPredictionFeatureSchemaRegistry';

export class LayoutPredictionFeatureNormalizer {
  public fitNormalizationSpec(
    trainStats: Record<string, FeatureNumericalStats>,
    fittedSampleCount: number = 1480000
  ): NormalizationSpecReport {
    const featureDefs = LayoutPredictionFeatureSchemaRegistry.getFeatureDefinitions();
    const featureSpecs: Record<string, NormalizationFeatureSpec> = {};

    for (const def of featureDefs) {
      const stats = trainStats[def.featureId];

      if (def.dataType === 'categorical') {
        featureSpecs[def.featureId] = {
          featureId: def.featureId,
          strategy: 'categorical_one_hot',
          categories: ['portrait', 'landscape']
        };
      } else {
        const mean = stats?.mean || 0;
        const stdDev = stats?.stdDev || 1;
        const min = stats?.min || 0;
        const max = stats?.max || 1;

        featureSpecs[def.featureId] = {
          featureId: def.featureId,
          strategy: def.normalizationStrategy,
          mean,
          stdDev: stdDev === 0 ? 1 : stdDev,
          min,
          max: max === min ? min + 1 : max
        };
      }
    }

    return {
      schemaVersion: LayoutPredictionFeatureSchemaRegistry.getSchemaVersion(),
      fittedOnSplit: 'train',
      fittedSampleCount,
      featureSpecs,
      createdAt: new Date().toISOString()
    };
  }
}
