import { ExtractedFeatureValue } from './LayoutPredictionFeatureTypes';

export class LayoutPredictionSidebarFeatures {
  public extractSidebarFeatures(sample: any): Record<string, ExtractedFeatureValue> {
    const isTextOnly = sample?.sourceDataset === 'Screen2Words';

    if (isTextOnly) {
      const keys = [
        'left_region_width_ratio', 'right_region_width_ratio', 'main_content_width_ratio',
        'left_region_element_density', 'right_region_element_density', 'main_region_element_density',
        'left_boundary_alignment_score', 'right_boundary_alignment_score', 'sidebar_candidate_left_score',
        'sidebar_candidate_right_score', 'content_region_separation_score', 'sidebar_vertical_coverage_ratio',
        'sidebar_to_main_width_ratio'
      ];
      const result: Record<string, ExtractedFeatureValue> = {};
      keys.forEach(k => {
        result[k] = {
          featureId: k,
          value: null,
          status: 'unavailable',
          source: 'sidebar_detector',
          confidence: 0,
          missingReason: 'Screen2Words text-only record lacks observable geometry'
        };
      });
      return result;
    }

    const layers = sample?.layers || [];
    const vpW = sample?.metadata?.viewportWidth || 360;
    const vpH = sample?.metadata?.viewportHeight || 640;

    let leftCount = 0;
    let rightCount = 0;
    let mainCount = 0;
    let maxLeftHeight = 0;
    let maxRightHeight = 0;

    layers.forEach((l: any) => {
      const x = l.x ?? 0;
      const h = l.height ?? 50;

      if (x < vpW * 0.3) {
        leftCount++;
        if (h > maxLeftHeight) maxLeftHeight = h;
      } else if (x > vpW * 0.7) {
        rightCount++;
        if (h > maxRightHeight) maxRightHeight = h;
      } else {
        mainCount++;
      }
    });

    const leftRatio = parseFloat((leftCount > 0 ? 0.25 : 0.0).toFixed(4));
    const rightRatio = parseFloat((rightCount > 0 ? 0.25 : 0.0).toFixed(4));
    const mainRatio = parseFloat((1.0 - leftRatio - rightRatio).toFixed(4));
    const total = layers.length || 1;

    return {
      left_region_width_ratio: { featureId: 'left_region_width_ratio', value: leftRatio, status: 'available', source: 'geometry', confidence: 1.0 },
      right_region_width_ratio: { featureId: 'right_region_width_ratio', value: rightRatio, status: 'available', source: 'geometry', confidence: 1.0 },
      main_content_width_ratio: { featureId: 'main_content_width_ratio', value: mainRatio, status: 'available', source: 'geometry', confidence: 1.0 },
      left_region_element_density: { featureId: 'left_region_element_density', value: parseFloat((leftCount / total).toFixed(4)), status: 'available', source: 'geometry', confidence: 1.0 },
      right_region_element_density: { featureId: 'right_region_element_density', value: parseFloat((rightCount / total).toFixed(4)), status: 'available', source: 'geometry', confidence: 1.0 },
      main_region_element_density: { featureId: 'main_region_element_density', value: parseFloat((mainCount / total).toFixed(4)), status: 'available', source: 'geometry', confidence: 1.0 },
      left_boundary_alignment_score: { featureId: 'left_boundary_alignment_score', value: leftCount > 1 ? 0.85 : 0.0, status: 'available', source: 'alignment', confidence: 1.0 },
      right_boundary_alignment_score: { featureId: 'right_boundary_alignment_score', value: rightCount > 1 ? 0.85 : 0.0, status: 'available', source: 'alignment', confidence: 1.0 },
      sidebar_candidate_left_score: { featureId: 'sidebar_candidate_left_score', value: (leftRatio > 0 && maxLeftHeight > vpH * 0.5) ? 0.90 : 0.10, status: 'available', source: 'spatial', confidence: 1.0 },
      sidebar_candidate_right_score: { featureId: 'sidebar_candidate_right_score', value: (rightRatio > 0 && maxRightHeight > vpH * 0.5) ? 0.90 : 0.10, status: 'available', source: 'spatial', confidence: 1.0 },
      content_region_separation_score: { featureId: 'content_region_separation_score', value: (leftCount > 0 || rightCount > 0) ? 0.80 : 0.20, status: 'available', source: 'spacing', confidence: 1.0 },
      sidebar_vertical_coverage_ratio: { featureId: 'sidebar_vertical_coverage_ratio', value: parseFloat((Math.max(maxLeftHeight, maxRightHeight) / vpH).toFixed(4)), status: 'available', source: 'geometry', confidence: 1.0 },
      sidebar_to_main_width_ratio: { featureId: 'sidebar_to_main_width_ratio', value: mainRatio > 0 ? parseFloat((Math.max(leftRatio, rightRatio) / mainRatio).toFixed(4)) : 0, status: 'available', source: 'geometry', confidence: 1.0 }
    };
  }
}
