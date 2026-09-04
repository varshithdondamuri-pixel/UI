import { MLFeature, MLFeatureVector } from './MLFeatureTypes';

export class MLFeatureNormalizer {
  public normalizeVector(vector: MLFeatureVector): MLFeatureVector {
    const copy: MLFeatureVector = JSON.parse(JSON.stringify(vector));

    for (const key of Object.keys(copy.features)) {
      const feat: MLFeature = copy.features[key];
      feat.normalizedValue = this.normalizeFeature(feat);
    }

    return copy;
  }

  private normalizeFeature(feat: MLFeature): number | number[] | string {
    if (feat.value === null || feat.value === undefined) {
      return this.handleMissingValue(feat);
    }

    switch (feat.normalization) {
      case 'min_max':
        if (typeof feat.value === 'number') {
          // Clamp 0 to 100 scale down to 0..1
          return Number(Math.max(0, Math.min(1, feat.value / 100)).toFixed(4));
        }
        return 0;

      case 'standard':
        if (typeof feat.value === 'number') {
          // Standardize (assumed mean 50, std 15)
          const z = (feat.value - 50) / 15;
          return Number(z.toFixed(4));
        }
        return 0;

      case 'one_hot':
        return String(feat.value).toLowerCase().replace(/\s+/g, '_');

      case 'none':
      default:
        return feat.value;
    }
  }

  private handleMissingValue(feat: MLFeature): number | string {
    switch (feat.missingValueStrategy) {
      case 'zero':
        return 0;
      case 'mean':
        return 0.5;
      case 'mode':
        return 'default';
      case 'omit':
      default:
        return 0;
    }
  }
}
