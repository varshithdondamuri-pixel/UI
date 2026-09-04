import { VisualStyleFeatureLeakageGuard } from './VisualStyleFeatureLeakageGuard';

export class StyleFeatureExtractor {
  private leakageGuard: VisualStyleFeatureLeakageGuard;

  constructor() {
    this.leakageGuard = new VisualStyleFeatureLeakageGuard();
  }

  public extractFeatures(sample: any, version: 'v0.1' | 'v0.2' = 'v0.2'): Record<string, number> {
    const rawMap: Record<string, number> = {};

    const color = sample.colorContext || {};
    const typography = sample.typographyContext || {};
    const spacing = sample.spacingContext || {};
    const visual = sample.visualContext || {};

    // Base v0.1 features
    rawMap['color_palette_entropy'] = color.paletteEntropy ?? 1.8;
    rawMap['color_contrast_ratio'] = color.contrastRatio ?? 5.2;
    rawMap['color_has_dark_bg'] = color.hasDarkBackground ? 1.0 : 0.0;
    rawMap['typography_font_size_ratio'] = typography.fontSizeRatio ?? 1.8;
    rawMap['typography_text_density'] = typography.textDensity ?? 0.4;
    rawMap['typography_heading_ratio'] = typography.headingRatio ?? 0.3;
    rawMap['spacing_density_score'] = spacing.densityScore ?? 0.5;
    rawMap['spacing_padding_consistency'] = spacing.paddingConsistency ?? 0.8;
    rawMap['spacing_grid_rhythm'] = spacing.gridRhythmScore ?? 0.85;
    rawMap['visual_corner_radius_avg'] = visual.cornerRadiusAvg ?? 6.0;
    rawMap['visual_shadow_count'] = visual.shadowCount ?? 1.0;
    rawMap['visual_border_count'] = visual.borderCount ?? 2.0;
    rawMap['visual_image_text_ratio'] = visual.imageToTextRatio ?? 0.2;
    rawMap['visual_edge_density'] = visual.edgeDensity ?? 0.4;
    rawMap['viewport_aspect_ratio'] = sample.viewport?.aspectRatio ?? 1.6;
    rawMap['structural_depth'] = sample.structure?.depth ?? 3.0;

    if (version === 'v0.2') {
      rawMap['color_dominant_hue'] = color.dominantHue ?? 210.0;
      rawMap['color_accent_contrast'] = color.accentContrast ?? 4.8;
      rawMap['typography_hierarchy_steps'] = typography.hierarchySteps ?? 4.0;
      rawMap['spacing_vertical_rhythm_var'] = spacing.verticalRhythmVar ?? 0.15;
      rawMap['visual_card_density'] = visual.cardDensity ?? 0.35;
      rawMap['visual_shadow_softness'] = visual.shadowSoftness ?? 8.0;
      rawMap['composition_balance_score'] = sample.composition?.balanceScore ?? 0.88;
      rawMap['component_style_consistency'] = sample.component?.styleConsistency ?? 0.92;
    }

    // Run feature map through leakage guard to sanitize and reject prohibited fields
    return this.leakageGuard.sanitizeFeatureMap(rawMap);
  }
}
