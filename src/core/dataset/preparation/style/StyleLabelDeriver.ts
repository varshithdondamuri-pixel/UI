import { VISUAL_STYLE_RECOMMENDATION_TAXONOMY, VISUAL_STYLE_TAXONOMY_VERSION } from './StyleLabelTaxonomy';

export interface StyleDerivationInput {
  sampleId: string;
  datasetName: string;
  provenance: { sourceName: string };
  groupId: string;
  payload: {
    colorContext?: any;
    typographyContext?: any;
    spacingContext?: any;
    visualContext?: any;
    isScreen2Words?: boolean;
    styleHint?: string;
  };
}

export interface DerivedStyleLabel {
  labelId: string;
  canonicalName: string;
  confidence: number;
  isSupported: boolean;
  reason?: string;
  version: string;
}

export class StyleLabelDeriver {
  public deriveLabel(input: StyleDerivationInput): DerivedStyleLabel {
    // Screen2Words has text summaries only -> unavailable for style derivation
    if (input.datasetName === 'Screen2Words' || input.payload?.isScreen2Words) {
      return {
        labelId: 'unknown',
        canonicalName: 'unavailable',
        confidence: 0.0,
        isSupported: false,
        reason: 'Screen2Words dataset contains text summaries only without visual style declarations',
        version: VISUAL_STYLE_TAXONOMY_VERSION
      };
    }

    const payload = input.payload || {};
    const color = payload.colorContext || {};
    const typography = payload.typographyContext || {};
    const spacing = payload.spacingContext || {};
    const visual = payload.visualContext || {};

    const hasDarkBg = color.hasDarkBackground ?? false;
    const entropy = color.paletteEntropy ?? 1.8;
    const contrast = color.contrastRatio ?? 5.2;
    const density = spacing.densityScore ?? 0.5;
    const radius = visual.cornerRadiusAvg ?? 6;
    const shadowCount = visual.shadowCount ?? 1;
    const borderCount = visual.borderCount ?? 2;
    const imgRatio = visual.imageToTextRatio ?? 0.2;
    const fontRatio = typography.fontSizeRatio ?? 1.8;

    let canonicalName = 'modern';
    let confidence = 0.90;

    if (hasDarkBg) {
      canonicalName = 'dark';
      confidence = 0.97;
    } else if (density >= 0.7 && shadowCount >= 4) {
      canonicalName = 'dashboard';
      confidence = 0.95;
    } else if (imgRatio >= 0.5) {
      canonicalName = 'ecommerce';
      confidence = 0.93;
    } else if (entropy < 1.5 && density < 0.4) {
      canonicalName = 'minimal';
      confidence = 0.95;
    } else if (entropy >= 2.5 && radius >= 12) {
      canonicalName = 'playful';
      confidence = 0.91;
    } else if (fontRatio >= 2.5) {
      canonicalName = 'editorial';
      confidence = 0.90;
    } else if (radius <= 4 && contrast >= 6.0) {
      canonicalName = 'corporate';
      confidence = 0.93;
    } else if (radius <= 4 && borderCount > 5) {
      canonicalName = 'classic';
      confidence = 0.92;
    } else if (fontRatio >= 2.2) {
      canonicalName = 'landing_page';
      confidence = 0.92;
    } else if (radius >= 8) {
      canonicalName = 'mobile_app';
      confidence = 0.94;
    } else if (contrast >= 5.0) {
      canonicalName = 'professional';
      confidence = 0.96;
    }

    const matchedTaxonomy = VISUAL_STYLE_RECOMMENDATION_TAXONOMY.find(t => t.canonicalName === canonicalName);

    return {
      labelId: matchedTaxonomy ? matchedTaxonomy.labelId : `style_${canonicalName}`,
      canonicalName,
      confidence,
      isSupported: true,
      version: VISUAL_STYLE_TAXONOMY_VERSION
    };
  }
}
