export interface VisualStyleCategoryDefinition {
  labelId: string;
  canonicalName: string;
  definition: string;
  derivationRule: string;
  sourceCoverage: string[];
  confidence: number;
  validationStatus: 'validated' | 'candidate';
  version: string;
}

export const VISUAL_STYLE_TAXONOMY_VERSION = 'visual-style-labels-v0.1';

export const VISUAL_STYLE_RECOMMENDATION_TAXONOMY: VisualStyleCategoryDefinition[] = [
  {
    labelId: 'style_minimal',
    canonicalName: 'minimal',
    definition: 'High white space, simple typography, monochromatic or low-saturation colors, subtle borders.',
    derivationRule: 'paletteEntropy < 1.5 AND contrastRatio >= 4.5 AND densityScore < 0.4',
    sourceCoverage: ['RICO', 'WebCode2M', 'WebUI'],
    confidence: 0.95,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_modern',
    canonicalName: 'modern',
    definition: 'Vibrant accent colors, clean sans-serif typography, rounded corners, subtle elevation shadows.',
    derivationRule: 'cornerRadiusAvg > 6 AND shadowCount > 0 AND colorCount >= 3',
    sourceCoverage: ['RICO', 'WebCode2M', 'WebUI'],
    confidence: 0.94,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_classic',
    canonicalName: 'classic',
    definition: 'Serif or traditional typography, high contrast, sharp or low corner radius, structured grid borders.',
    derivationRule: 'cornerRadiusAvg <= 4 AND borderCount > 5 AND headingRatio > 0.3',
    sourceCoverage: ['WebCode2M', 'WebUI'],
    confidence: 0.92,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_playful',
    canonicalName: 'playful',
    definition: 'High color entropy, large rounded corners, high image-to-text balance, soft shadows.',
    derivationRule: 'paletteEntropy >= 2.5 AND cornerRadiusAvg >= 12 AND imageToTextRatio > 0.4',
    sourceCoverage: ['RICO', 'WebUI'],
    confidence: 0.91,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_professional',
    canonicalName: 'professional',
    definition: 'Neutral blue/slate tones, balanced typography scale, structured padding, medium density.',
    derivationRule: 'paddingConsistency > 0.8 AND contrastRatio >= 5.0 AND densityScore BETWEEN 0.4 AND 0.7',
    sourceCoverage: ['RICO', 'WebCode2M', 'WebUI'],
    confidence: 0.96,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_editorial',
    canonicalName: 'editorial',
    definition: 'Large typography scale ratio, high text density, asymmetric grid rhythm, high image balance.',
    derivationRule: 'fontSizeRatio >= 2.5 AND textDensity > 0.6 AND imageToTextRatio > 0.3',
    sourceCoverage: ['WebCode2M', 'WebUI'],
    confidence: 0.90,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_dashboard',
    canonicalName: 'dashboard',
    definition: 'Dense content layout, multi-card containers, high border/shadow usage, data-dense typography.',
    derivationRule: 'densityScore >= 0.7 AND shadowCount >= 4 AND borderCount >= 8',
    sourceCoverage: ['RICO', 'WebCode2M', 'WebUI'],
    confidence: 0.95,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_ecommerce',
    canonicalName: 'ecommerce',
    definition: 'High image-to-text ratio, prominent callout card containers, medium corner radius, high CTA contrast.',
    derivationRule: 'imageToTextRatio >= 0.5 AND shadowCount >= 2 AND contrastRatio >= 4.5',
    sourceCoverage: ['RICO', 'WebCode2M', 'WebUI'],
    confidence: 0.93,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_mobile_app',
    canonicalName: 'mobile_app',
    definition: 'Compact viewport geometry, high touch-target spacing, rounded card styling, soft elevation.',
    derivationRule: 'cornerRadiusAvg >= 8 AND densityScore BETWEEN 0.3 AND 0.6',
    sourceCoverage: ['RICO', 'WebUI'],
    confidence: 0.94,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_landing_page',
    canonicalName: 'landing_page',
    definition: 'Hero section typography, spacious vertical rhythm, high contrast CTAs, modern elevation.',
    derivationRule: 'gridRhythmScore > 0.8 AND fontSizeRatio >= 2.2 AND paddingConsistency > 0.7',
    sourceCoverage: ['WebCode2M', 'WebUI'],
    confidence: 0.92,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_corporate',
    canonicalName: 'corporate',
    definition: 'Conservative color palette, sharp/small corner radius, formal typography hierarchy, high contrast.',
    derivationRule: 'cornerRadiusAvg <= 4 AND paletteEntropy < 2.0 AND contrastRatio >= 6.0',
    sourceCoverage: ['WebCode2M', 'WebUI'],
    confidence: 0.93,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  },
  {
    labelId: 'style_dark',
    canonicalName: 'dark',
    definition: 'Dark background surface, high contrast inverted text foreground, luminous accent elements.',
    derivationRule: 'hasDarkBackground === true AND contrastRatio >= 5.0',
    sourceCoverage: ['RICO', 'WebCode2M', 'WebUI'],
    confidence: 0.97,
    validationStatus: 'validated',
    version: VISUAL_STYLE_TAXONOMY_VERSION
  }
];
