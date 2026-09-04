import { ExtractedFeatureVector, FeatureGroupIdentifier, FeatureNumericalStats } from './LayoutPredictionFeatureTypes';

export class LayoutPredictionFeatureStatistics {
  public computeTrainStatistics(
    trainVectors: ExtractedFeatureVector[]
  ): Record<string, FeatureNumericalStats> {
    const stats: Record<string, FeatureNumericalStats> = {};
    if (trainVectors.length === 0) return stats;

    const sampleFeatures = trainVectors[0].features;

    for (const featureId of Object.keys(sampleFeatures)) {
      const allVals = trainVectors.map(v => v.features[featureId]);
      const validVals = allVals.filter(v => v && v.status === 'available' && typeof v.value === 'number').map(v => v.value as number);
      
      const totalCount = allVals.length;
      const validCount = validVals.length;
      const missingRate = totalCount > 0 ? (totalCount - validCount) / totalCount : 0;

      const groupName = this.inferGroupFromFeatureId(featureId);

      if (validCount === 0) {
        stats[featureId] = {
          featureId,
          featureGroup: groupName,
          count: 0,
          mean: 0,
          median: 0,
          stdDev: 0,
          min: 0,
          max: 0,
          missingRate: 1.0,
          uniqueCount: 0,
          outlierRate: 0
        };
        continue;
      }

      validVals.sort((a, b) => a - b);
      const sum = validVals.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / validCount;
      const median = validVals[Math.floor(validCount / 2)];

      const variance = validVals.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / validCount;
      const stdDev = Math.sqrt(variance);

      const min = validVals[0];
      const max = validVals[validVals.length - 1];

      const uniqueSet = new Set(validVals);
      const uniqueCount = uniqueSet.size;

      // IQR outlier detection
      const q1 = validVals[Math.floor(validCount * 0.25)];
      const q3 = validVals[Math.floor(validCount * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      const outlierCount = validVals.filter(v => v < lowerBound || v > upperBound).length;
      const outlierRate = validCount > 0 ? outlierCount / validCount : 0;

      stats[featureId] = {
        featureId,
        featureGroup: groupName,
        count: validCount,
        mean: parseFloat(mean.toFixed(4)),
        median: parseFloat(median.toFixed(4)),
        stdDev: parseFloat(stdDev.toFixed(4)),
        min: parseFloat(min.toFixed(4)),
        max: parseFloat(max.toFixed(4)),
        missingRate: parseFloat(missingRate.toFixed(4)),
        uniqueCount,
        outlierRate: parseFloat(outlierRate.toFixed(4))
      };
    }

    return stats;
  }

  private inferGroupFromFeatureId(featureId: string): FeatureGroupIdentifier {
    if (featureId.startsWith('geom_')) return 'geometry';
    if (featureId.startsWith('spatial_')) return 'spatial';
    if (featureId.startsWith('align_')) return 'alignment';
    if (featureId.startsWith('space_')) return 'spacing';
    if (featureId.startsWith('density_')) return 'density';
    if (featureId.startsWith('composition_')) return 'composition';
    if (featureId.startsWith('hier_')) return 'hierarchy';
    if (featureId.startsWith('viewport_')) return 'viewport';
    if (featureId.startsWith('dom_')) return 'dom_structure';
    if (featureId.startsWith('css_')) return 'css_layout';
    if (featureId.startsWith('responsive_')) return 'responsive_structure';
    if (featureId.startsWith('component_')) return 'component_distribution';
    return 'geometry';
  }
}
