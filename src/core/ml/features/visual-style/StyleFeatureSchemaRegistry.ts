export interface VisualStyleFeatureDefinition {
  featureId: string;
  featureName: string;
  type: 'numeric' | 'categorical' | 'boolean';
  description: string;
  extractionMethod: string;
  sourceField: string;
  availabilityPolicy: 'required' | 'optional';
  normalization: 'standard' | 'minmax' | 'none';
  leakageStatus: 'clean' | 'blocked';
  version: 'v0.1' | 'v0.2';
}

export class StyleFeatureSchemaRegistry {
  private static SCHEMA_V01: VisualStyleFeatureDefinition[] = [
    { featureId: 'color_palette_entropy', featureName: 'color_palette_entropy', type: 'numeric', description: 'Entropy of color distribution', extractionMethod: 'computePaletteEntropy', sourceField: 'colorContext.paletteEntropy', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'color_contrast_ratio', featureName: 'color_contrast_ratio', type: 'numeric', description: 'Contrast ratio between foreground and background', extractionMethod: 'computeContrastRatio', sourceField: 'colorContext.contrastRatio', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'color_has_dark_bg', featureName: 'color_has_dark_bg', type: 'boolean', description: 'Whether canvas has a dark background surface', extractionMethod: 'checkDarkBg', sourceField: 'colorContext.hasDarkBackground', availabilityPolicy: 'required', normalization: 'none', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'typography_font_size_ratio', featureName: 'typography_font_size_ratio', type: 'numeric', description: 'Heading to body font size ratio', extractionMethod: 'computeFontSizeRatio', sourceField: 'typographyContext.fontSizeRatio', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'typography_text_density', featureName: 'typography_text_density', type: 'numeric', description: 'Text characters per unit area', extractionMethod: 'computeTextDensity', sourceField: 'typographyContext.textDensity', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'typography_heading_ratio', featureName: 'typography_heading_ratio', type: 'numeric', description: 'Proportion of heading text elements', extractionMethod: 'computeHeadingRatio', sourceField: 'typographyContext.headingRatio', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'spacing_density_score', featureName: 'spacing_density_score', type: 'numeric', description: 'Layout content density score', extractionMethod: 'computeDensityScore', sourceField: 'spacingContext.densityScore', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'spacing_padding_consistency', featureName: 'spacing_padding_consistency', type: 'numeric', description: 'Consistency of padding across containers', extractionMethod: 'computePaddingConsistency', sourceField: 'spacingContext.paddingConsistency', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'spacing_grid_rhythm', featureName: 'spacing_grid_rhythm', type: 'numeric', description: 'Rhythmic alignment to baseline grid', extractionMethod: 'computeGridRhythm', sourceField: 'spacingContext.gridRhythmScore', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'visual_corner_radius_avg', featureName: 'visual_corner_radius_avg', type: 'numeric', description: 'Average corner radius of container elements', extractionMethod: 'computeCornerRadiusAvg', sourceField: 'visualContext.cornerRadiusAvg', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'visual_shadow_count', featureName: 'visual_shadow_count', type: 'numeric', description: 'Count of elevated shadow elements', extractionMethod: 'countShadows', sourceField: 'visualContext.shadowCount', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'visual_border_count', featureName: 'visual_border_count', type: 'numeric', description: 'Count of visible border declarations', extractionMethod: 'countBorders', sourceField: 'visualContext.borderCount', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'visual_image_text_ratio', featureName: 'visual_image_text_ratio', type: 'numeric', description: 'Ratio of image area to text area', extractionMethod: 'computeImageTextRatio', sourceField: 'visualContext.imageToTextRatio', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'visual_edge_density', featureName: 'visual_edge_density', type: 'numeric', description: 'Density of visual structural edges', extractionMethod: 'computeEdgeDensity', sourceField: 'visualContext.edgeDensity', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'viewport_aspect_ratio', featureName: 'viewport_aspect_ratio', type: 'numeric', description: 'Aspect ratio of input canvas viewport', extractionMethod: 'computeViewportAspectRatio', sourceField: 'viewport.aspectRatio', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' },
    { featureId: 'structural_depth', featureName: 'structural_depth', type: 'numeric', description: 'Maximum depth of structural element tree', extractionMethod: 'computeTreeDepth', sourceField: 'structure.depth', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.1' }
  ];

  private static SCHEMA_V02_ADDITIONS: VisualStyleFeatureDefinition[] = [
    { featureId: 'color_dominant_hue', featureName: 'color_dominant_hue', type: 'numeric', description: 'Dominant color hue angle in HSL space', extractionMethod: 'extractDominantHue', sourceField: 'colorContext.dominantHue', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'color_accent_contrast', featureName: 'color_accent_contrast', type: 'numeric', description: 'Contrast ratio of accent colors against background', extractionMethod: 'computeAccentContrast', sourceField: 'colorContext.accentContrast', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'typography_hierarchy_steps', featureName: 'typography_hierarchy_steps', type: 'numeric', description: 'Number of distinct font size steps in layout', extractionMethod: 'countHierarchySteps', sourceField: 'typographyContext.hierarchySteps', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'spacing_vertical_rhythm_var', featureName: 'spacing_vertical_rhythm_var', type: 'numeric', description: 'Variance of vertical section spacing', extractionMethod: 'computeVerticalRhythmVar', sourceField: 'spacingContext.verticalRhythmVar', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'visual_card_density', featureName: 'visual_card_density', type: 'numeric', description: 'Density of card container components', extractionMethod: 'computeCardDensity', sourceField: 'visualContext.cardDensity', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'visual_shadow_softness', featureName: 'visual_shadow_softness', type: 'numeric', description: 'Average blur radius of elevation shadows', extractionMethod: 'computeShadowSoftness', sourceField: 'visualContext.shadowSoftness', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'composition_balance_score', featureName: 'composition_balance_score', type: 'numeric', description: 'Left-right visual balance symmetry score', extractionMethod: 'computeCompositionBalance', sourceField: 'composition.balanceScore', availabilityPolicy: 'required', normalization: 'minmax', leakageStatus: 'clean', version: 'v0.2' },
    { featureId: 'component_style_consistency', featureName: 'component_style_consistency', type: 'numeric', description: 'Consistency index of repeated component styling', extractionMethod: 'computeStyleConsistency', sourceField: 'component.styleConsistency', availabilityPolicy: 'required', normalization: 'standard', leakageStatus: 'clean', version: 'v0.2' }
  ];

  public static getSchemaV01(): VisualStyleFeatureDefinition[] {
    return [...this.SCHEMA_V01];
  }

  public static getSchemaV02(): VisualStyleFeatureDefinition[] {
    return [...this.SCHEMA_V01, ...this.SCHEMA_V02_ADDITIONS];
  }
}
