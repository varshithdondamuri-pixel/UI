export interface ComponentFeatureDefinition {
  featureId: string;
  name: string;
  type: 'numeric' | 'categorical' | 'boolean';
  group: string;
  description: string;
  extractionMethod: string;
  sourceField: string;
  availabilityPolicy: 'required' | 'optional' | 'explicit_unavailable';
  normalization: 'z_score' | 'min_max' | 'one_hot' | 'passthrough';
  leakageStatus: 'verified_clean';
  version: 'v0.1' | 'v0.2';
}

export class ComponentFeatureSchemaRegistry {
  private static SCHEMA_V01: ComponentFeatureDefinition[] = [
    { featureId: 'f01_width', name: 'geometry_width', type: 'numeric', group: 'geometry', description: 'Observable element width', extractionMethod: 'direct_bounds', sourceField: 'geometry.width', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f02_height', name: 'geometry_height', type: 'numeric', group: 'geometry', description: 'Observable element height', extractionMethod: 'direct_bounds', sourceField: 'geometry.height', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f03_aspect', name: 'geometry_aspect_ratio', type: 'numeric', group: 'geometry', description: 'Aspect ratio of bounds', extractionMethod: 'w_div_h', sourceField: 'geometry.aspectRatio', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f04_area', name: 'geometry_area', type: 'numeric', group: 'geometry', description: 'Area of element bounds', extractionMethod: 'w_mul_h', sourceField: 'geometry.area', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f05_rel_width', name: 'geometry_relative_width', type: 'numeric', group: 'geometry', description: 'Width relative to viewport', extractionMethod: 'w_div_viewport_w', sourceField: 'geometry.relativeWidth', availabilityPolicy: 'required', normalization: 'min_max', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f06_rel_height', name: 'geometry_relative_height', type: 'numeric', group: 'geometry', description: 'Height relative to viewport', extractionMethod: 'h_div_viewport_h', sourceField: 'geometry.relativeHeight', availabilityPolicy: 'required', normalization: 'min_max', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f07_pos_x', name: 'spatial_pos_x', type: 'numeric', group: 'spatial', description: 'Observable X coordinate', extractionMethod: 'direct_bounds', sourceField: 'geometry.x', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f08_pos_y', name: 'spatial_pos_y', type: 'numeric', group: 'spatial', description: 'Observable Y coordinate', extractionMethod: 'direct_bounds', sourceField: 'geometry.y', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f09_depth', name: 'hierarchy_depth', type: 'numeric', group: 'hierarchy', description: 'DOM/Node hierarchy tree depth', extractionMethod: 'tree_depth', sourceField: 'structure.depth', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f10_siblings', name: 'hierarchy_sibling_count', type: 'numeric', group: 'hierarchy', description: 'Number of immediate sibling nodes', extractionMethod: 'child_count', sourceField: 'structure.siblingCount', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f11_children', name: 'hierarchy_child_count', type: 'numeric', group: 'hierarchy', description: 'Number of child nodes', extractionMethod: 'child_count', sourceField: 'structure.childCount', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f12_has_text', name: 'text_has_text', type: 'numeric', group: 'text', description: 'Contains text content', extractionMethod: 'boolean_flag', sourceField: 'structure.hasText', availabilityPolicy: 'required', normalization: 'passthrough', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f13_text_len', name: 'text_length', type: 'numeric', group: 'text', description: 'Text character count', extractionMethod: 'str_length', sourceField: 'textContext.textLength', availabilityPolicy: 'optional', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f14_word_cnt', name: 'text_word_count', type: 'numeric', group: 'text', description: 'Text word count', extractionMethod: 'word_split', sourceField: 'textContext.wordCount', availabilityPolicy: 'optional', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f15_has_img', name: 'visual_has_image', type: 'numeric', group: 'visual', description: 'Contains image visual payload', extractionMethod: 'boolean_flag', sourceField: 'structure.hasImage', availabilityPolicy: 'required', normalization: 'passthrough', leakageStatus: 'verified_clean', version: 'v0.1' },
    { featureId: 'f16_has_inp', name: 'interaction_has_child_input', type: 'numeric', group: 'interaction-context', description: 'Contains child input control', extractionMethod: 'boolean_flag', sourceField: 'structure.hasChildInput', availabilityPolicy: 'required', normalization: 'passthrough', leakageStatus: 'verified_clean', version: 'v0.1' }
  ];

  private static SCHEMA_V02_ADDITIONS: ComponentFeatureDefinition[] = [
    { featureId: 'f17_neighborhood_density', name: 'local_neighborhood_density', type: 'numeric', group: 'local-neighborhood', description: 'Density of elements in local 200px bounding radius', extractionMethod: 'spatial_k_density', sourceField: 'calculated.localDensity', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f18_container_aspect', name: 'parent_container_aspect', type: 'numeric', group: 'container-context', description: 'Aspect ratio of parent container node', extractionMethod: 'parent_aspect', sourceField: 'calculated.parentAspect', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f19_sibling_ratio', name: 'sibling_distribution_ratio', type: 'numeric', group: 'sibling-distribution', description: 'Ratio of text vs visual siblings', extractionMethod: 'sibling_type_ratio', sourceField: 'calculated.siblingRatio', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f20_spatial_role', name: 'spatial_role_quadrant', type: 'numeric', group: 'spatial-role', description: 'Viewport quadrant index (0: TopLeft, 1: TopRight, 2: BottomLeft, 3: BottomRight)', extractionMethod: 'quadrant_index', sourceField: 'calculated.quadrant', availabilityPolicy: 'required', normalization: 'passthrough', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f21_repeated_pattern', name: 'repeated_component_pattern_flag', type: 'numeric', group: 'repeated-pattern', description: 'Flag indicating repetitive structural list/grid sibling pattern', extractionMethod: 'repetitive_geometry_detect', sourceField: 'calculated.isRepeatedPattern', availabilityPolicy: 'required', normalization: 'passthrough', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f22_text_role', name: 'text_role_indicator', type: 'numeric', group: 'text-role', description: 'Text role type (0: None, 1: Action, 2: Label, 3: Header, 4: Paragraph)', extractionMethod: 'text_heuristic_role', sourceField: 'calculated.textRole', availabilityPolicy: 'required', normalization: 'passthrough', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f23_vertical_pos_ratio', name: 'vertical_position_ratio', type: 'numeric', group: 'visual-hierarchy', description: 'Relative Y position relative to page scroll top', extractionMethod: 'y_div_total_height', sourceField: 'calculated.verticalRatio', availabilityPolicy: 'required', normalization: 'min_max', leakageStatus: 'verified_clean', version: 'v0.2' },
    { featureId: 'f24_container_depth', name: 'local_container_depth', type: 'numeric', group: 'container-context', description: 'Depth relative to main section container', extractionMethod: 'relative_container_depth', sourceField: 'calculated.containerDepth', availabilityPolicy: 'required', normalization: 'z_score', leakageStatus: 'verified_clean', version: 'v0.2' }
  ];

  public static getSchemaV01(): ComponentFeatureDefinition[] {
    return ComponentFeatureSchemaRegistry.SCHEMA_V01;
  }

  public static getSchemaV02(): ComponentFeatureDefinition[] {
    return [...ComponentFeatureSchemaRegistry.SCHEMA_V01, ...ComponentFeatureSchemaRegistry.SCHEMA_V02_ADDITIONS];
  }
}
