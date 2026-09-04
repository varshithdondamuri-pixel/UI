import { ExtractedFeatureValue, ExtractedFeatureVector, FeatureGroupIdentifier } from './LayoutPredictionFeatureTypes';
import { LayoutPredictionGeometryFeatures } from './LayoutPredictionGeometryFeatures';
import { LayoutPredictionSpatialFeatures } from './LayoutPredictionSpatialFeatures';
import { LayoutPredictionAlignmentFeatures } from './LayoutPredictionAlignmentFeatures';
import { LayoutPredictionSpacingFeatures } from './LayoutPredictionSpacingFeatures';
import { LayoutPredictionDensityFeatures } from './LayoutPredictionDensityFeatures';
import { LayoutPredictionCompositionFeatures } from './LayoutPredictionCompositionFeatures';
import { LayoutPredictionHierarchyFeatures } from './LayoutPredictionHierarchyFeatures';
import { LayoutPredictionViewportFeatures } from './LayoutPredictionViewportFeatures';
import { LayoutPredictionDOMFeatures } from './LayoutPredictionDOMFeatures';
import { LayoutPredictionCSSFeatures } from './LayoutPredictionCSSFeatures';
import { LayoutPredictionResponsiveFeatures } from './LayoutPredictionResponsiveFeatures';
import { LayoutPredictionComponentFeatures } from './LayoutPredictionComponentFeatures';

export class LayoutPredictionFeatureExtractor {
  private geometry: LayoutPredictionGeometryFeatures;
  private spatial: LayoutPredictionSpatialFeatures;
  private alignment: LayoutPredictionAlignmentFeatures;
  private spacing: LayoutPredictionSpacingFeatures;
  private density: LayoutPredictionDensityFeatures;
  private composition: LayoutPredictionCompositionFeatures;
  private hierarchy: LayoutPredictionHierarchyFeatures;
  private viewport: LayoutPredictionViewportFeatures;
  private dom: LayoutPredictionDOMFeatures;
  private css: LayoutPredictionCSSFeatures;
  private responsive: LayoutPredictionResponsiveFeatures;
  private component: LayoutPredictionComponentFeatures;

  constructor() {
    this.geometry = new LayoutPredictionGeometryFeatures();
    this.spatial = new LayoutPredictionSpatialFeatures();
    this.alignment = new LayoutPredictionAlignmentFeatures();
    this.spacing = new LayoutPredictionSpacingFeatures();
    this.density = new LayoutPredictionDensityFeatures();
    this.composition = new LayoutPredictionCompositionFeatures();
    this.hierarchy = new LayoutPredictionHierarchyFeatures();
    this.viewport = new LayoutPredictionViewportFeatures();
    this.dom = new LayoutPredictionDOMFeatures();
    this.css = new LayoutPredictionCSSFeatures();
    this.responsive = new LayoutPredictionResponsiveFeatures();
    this.component = new LayoutPredictionComponentFeatures();
  }

  public extractAllFeatures(sample: any): ExtractedFeatureVector {
    const sampleId = sample.sampleId || sample.id || 'sample_1';
    const features: Record<string, ExtractedFeatureValue> = {
      ...this.geometry.extract(sample),
      ...this.spatial.extract(sample),
      ...this.alignment.extract(sample),
      ...this.spacing.extract(sample),
      ...this.density.extract(sample),
      ...this.composition.extract(sample),
      ...this.hierarchy.extract(sample),
      ...this.viewport.extract(sample),
      ...this.dom.extract(sample),
      ...this.css.extract(sample),
      ...this.responsive.extract(sample),
      ...this.component.extract(sample)
    };

    // Calculate available group count
    const groups: FeatureGroupIdentifier[] = [
      'geometry', 'spatial', 'alignment', 'spacing', 'density', 'composition',
      'hierarchy', 'viewport', 'dom_structure', 'css_layout', 'responsive_structure', 'component_distribution'
    ];

    let availableCount = 0;
    const values = Object.values(features);
    for (const g of groups) {
      const gVals = values.filter(v => v.featureId.startsWith(g.slice(0, 4)));
      if (gVals.length > 0 && gVals.some(v => v.status === 'available')) {
        availableCount++;
      }
    }

    return {
      sampleId,
      features,
      availableGroupCount: availableCount,
      totalGroupCount: groups.length
    };
  }
}
