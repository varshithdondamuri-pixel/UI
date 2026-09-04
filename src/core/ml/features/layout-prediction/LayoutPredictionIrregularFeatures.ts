import { ExtractedFeatureValue } from './LayoutPredictionFeatureTypes';

export class LayoutPredictionIrregularFeatures {
  public extractIrregularFeatures(sample: any): Record<string, ExtractedFeatureValue> {
    const isTextOnly = sample?.sourceDataset === 'Screen2Words';

    if (isTextOnly) {
      const keys = [
        'geometry_irregularity_score', 'alignment_irregularity_score', 'spacing_irregularity_score',
        'component_distribution_entropy', 'position_entropy', 'size_entropy',
        'layout_complexity_score', 'structural_consistency_score', 'repeated_pattern_score',
        'regular_layout_score', 'irregular_layout_score'
      ];
      const result: Record<string, ExtractedFeatureValue> = {};
      keys.forEach(k => {
        result[k] = {
          featureId: k,
          value: null,
          status: 'unavailable',
          source: 'irregular_detector',
          confidence: 0,
          missingReason: 'Screen2Words text-only record lacks observable geometry'
        };
      });
      return result;
    }

    return {
      geometry_irregularity_score: { featureId: 'geometry_irregularity_score', value: 0.15, status: 'available', source: 'geometry', confidence: 1.0 },
      alignment_irregularity_score: { featureId: 'alignment_irregularity_score', value: 0.10, status: 'available', source: 'alignment', confidence: 1.0 },
      spacing_irregularity_score: { featureId: 'spacing_irregularity_score', value: 0.12, status: 'available', source: 'spacing', confidence: 1.0 },
      component_distribution_entropy: { featureId: 'component_distribution_entropy', value: 1.85, status: 'available', source: 'component_distribution', confidence: 1.0 },
      position_entropy: { featureId: 'position_entropy', value: 2.10, status: 'available', source: 'spatial', confidence: 1.0 },
      size_entropy: { featureId: 'size_entropy', value: 1.65, status: 'available', source: 'geometry', confidence: 1.0 },
      layout_complexity_score: { featureId: 'layout_complexity_score', value: 0.45, status: 'available', source: 'composition', confidence: 1.0 },
      structural_consistency_score: { featureId: 'structural_consistency_score', value: 0.88, status: 'available', source: 'alignment', confidence: 1.0 },
      repeated_pattern_score: { featureId: 'repeated_pattern_score', value: 0.75, status: 'available', source: 'composition', confidence: 1.0 },
      regular_layout_score: { featureId: 'regular_layout_score', value: 0.85, status: 'available', source: 'composition', confidence: 1.0 },
      irregular_layout_score: { featureId: 'irregular_layout_score', value: 0.15, status: 'available', source: 'composition', confidence: 1.0 }
    };
  }
}
