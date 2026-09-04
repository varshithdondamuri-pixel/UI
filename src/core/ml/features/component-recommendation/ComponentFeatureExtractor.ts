import { ComponentPreparationSample } from '../../../dataset/preparation/component/ComponentPreparationTypes';
import { ComponentRecommendationFeatureLeakageGuard } from './ComponentRecommendationFeatureLeakageGuard';

export class ComponentFeatureExtractor {
  private leakageGuard: ComponentRecommendationFeatureLeakageGuard;

  constructor() {
    this.leakageGuard = new ComponentRecommendationFeatureLeakageGuard();
  }

  public extractFeatures(sample: ComponentPreparationSample, version: 'v0.1' | 'v0.2'): Record<string, number> {
    const rawVector: Record<string, number> = {};

    // Base v0.1 features
    rawVector['geometry_width'] = sample.geometry.width;
    rawVector['geometry_height'] = sample.geometry.height;
    rawVector['geometry_aspect_ratio'] = sample.geometry.aspectRatio;
    rawVector['geometry_area'] = sample.geometry.area;
    rawVector['geometry_relative_width'] = sample.geometry.relativeWidth;
    rawVector['geometry_relative_height'] = sample.geometry.relativeHeight;
    rawVector['spatial_pos_x'] = sample.geometry.x;
    rawVector['spatial_pos_y'] = sample.geometry.y;
    rawVector['hierarchy_depth'] = sample.structure.depth;
    rawVector['hierarchy_sibling_count'] = sample.structure.siblingCount;
    rawVector['hierarchy_child_count'] = sample.structure.childCount;
    rawVector['text_has_text'] = sample.structure.hasText ? 1.0 : 0.0;
    rawVector['text_length'] = sample.textContext?.textLength || 0;
    rawVector['text_word_count'] = sample.textContext?.wordCount || 0;
    rawVector['visual_has_image'] = sample.structure.hasImage ? 1.0 : 0.0;
    rawVector['interaction_has_child_input'] = sample.structure.hasChildInput ? 1.0 : 0.0;

    // v0.2 upgrades
    if (version === 'v0.2') {
      rawVector['local_neighborhood_density'] = (sample.structure.siblingCount * 0.5) + (sample.structure.childCount * 0.2);
      rawVector['parent_container_aspect'] = sample.geometry.aspectRatio > 0 ? sample.geometry.aspectRatio * 1.2 : 1.0;
      rawVector['sibling_distribution_ratio'] = sample.structure.siblingCount > 0 ? sample.structure.childCount / sample.structure.siblingCount : 0.0;
      const quadX = sample.geometry.x > 720 ? 1 : 0;
      const quadY = sample.geometry.y > 450 ? 2 : 0;
      rawVector['spatial_role_quadrant'] = quadX + quadY;
      rawVector['repeated_component_pattern_flag'] = sample.structure.siblingCount > 4 ? 1.0 : 0.0;
      let textRole = 0;
      if (sample.textContext?.hasKeywordButton) textRole = 1;
      else if (sample.textContext?.hasKeywordInput) textRole = 2;
      else if (sample.structure.hasText && sample.geometry.height > 40) textRole = 3;
      else if (sample.structure.hasText) textRole = 4;
      rawVector['text_role_indicator'] = textRole;
      rawVector['vertical_position_ratio'] = sample.geometry.relativeHeight;
      rawVector['local_container_depth'] = sample.structure.depth > 2 ? sample.structure.depth - 2 : 0;
    }

    // Run strict Leakage Guard check before returning
    return this.leakageGuard.sanitizeFeatureMap(rawVector);
  }
}
