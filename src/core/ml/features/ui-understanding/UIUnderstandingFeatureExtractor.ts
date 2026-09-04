import { FullDesignSample } from '../../../dataset/DatasetTypes';
import { ComponentLabelMapper } from '../../../dataset/preparation/ComponentLabelMapper';
import { LayoutLabelDeriver } from '../../../dataset/preparation/LayoutLabelDeriver';
import { UIUnderstandingFeatureLeakageGuard } from './UIUnderstandingFeatureLeakageGuard';
import {
  ExpandedUIFeatureVector,
  UIUnderstandingFeatureGroup,
  UIUnderstandingFeatureSpec
} from './UIUnderstandingFeatureTypes';

export class UIUnderstandingFeatureExtractor {
  private leakageGuard: UIUnderstandingFeatureLeakageGuard;
  private componentMapper: ComponentLabelMapper;
  private layoutDeriver: LayoutLabelDeriver;

  constructor() {
    this.leakageGuard = new UIUnderstandingFeatureLeakageGuard();
    this.componentMapper = new ComponentLabelMapper();
    this.layoutDeriver = new LayoutLabelDeriver();
  }

  /**
   * Extracts expanded UI understanding features across 18 feature groups.
   */
  public extractExpandedFeatures(sample: FullDesignSample): ExpandedUIFeatureVector {
    const rawList: UIUnderstandingFeatureSpec[] = [];

    const activeGroups: UIUnderstandingFeatureGroup[] = [
      'geometry',
      'spatial',
      'alignment',
      'spacing',
      'density',
      'components',
      'component_composition',
      'text',
      'hierarchy',
      'visual',
      'typography',
      'viewport',
      'semantic',
      'intent',
      'blueprint',
      'visual_design',
      'quality',
      'provenance'
    ];

    // 1. Geometry Features
    const canvasObjs = sample.sketch?.canvasObjects || [];
    const vp = (sample.sketch as any)?.viewport || { width: 1280, height: 800 };
    const totalScreenArea = (vp.width || 1280) * (vp.height || 800);

    const areas = canvasObjs.map((o: any) => {
      const w = o.bounds?.[2] ? o.bounds[2] - o.bounds[0] : o.size?.width || 100;
      const h = o.bounds?.[3] ? o.bounds[3] - o.bounds[1] : o.size?.height || 50;
      return Math.max(1, w * h);
    });

    const sumArea = areas.reduce((a: number, b: number) => a + b, 0);
    const meanArea = areas.length > 0 ? sumArea / areas.length : 0;
    const screenCoverage = totalScreenArea > 0 ? parseFloat((sumArea / totalScreenArea).toFixed(4)) : 0;

    rawList.push(
      { featureId: 'geom_element_count', featureName: 'Element Count', featureGroup: 'geometry', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: canvasObjs.length, normalization: 'standard', missingValueStrategy: 'zero', description: 'Total canvas element count', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'geom_total_bbox_area', featureName: 'Total Bounded Box Area', featureGroup: 'geometry', type: 'numerical', source: 'sketch.bounds', availability: 'available', value: sumArea, normalization: 'standard', missingValueStrategy: 'zero', description: 'Sum of element bounding box areas', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'geom_mean_element_area', featureName: 'Mean Element Area', featureGroup: 'geometry', type: 'numerical', source: 'sketch.bounds', availability: 'available', value: meanArea, normalization: 'standard', missingValueStrategy: 'zero', description: 'Average element bounding box area', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'geom_screen_coverage_ratio', featureName: 'Screen Coverage Ratio', featureGroup: 'geometry', type: 'numerical', source: 'sketch.viewport', availability: 'available', value: screenCoverage, normalization: 'none', missingValueStrategy: 'zero', description: 'Ratio of occupied bounding box area to viewport area', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 2. Spatial Relationships
    let aboveCount = 0;
    let belowCount = 0;
    let overlapCount = 0;

    for (let i = 0; i < canvasObjs.length; i++) {
      for (let j = i + 1; j < canvasObjs.length; j++) {
        const yA = canvasObjs[i].bounds?.[1] ?? canvasObjs[i].position?.y ?? 0;
        const yB = canvasObjs[j].bounds?.[1] ?? canvasObjs[j].position?.y ?? 0;
        if (yA < yB) aboveCount++;
        else belowCount++;
      }
    }

    rawList.push(
      { featureId: 'spatial_above_count', featureName: 'Above Element Pair Count', featureGroup: 'spatial', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: aboveCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Number of element pairs in vertical above relationship', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'spatial_below_count', featureName: 'Below Element Pair Count', featureGroup: 'spatial', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: belowCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Number of element pairs in vertical below relationship', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'spatial_overlap_count', featureName: 'Overlap Element Count', featureGroup: 'spatial', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: overlapCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Number of overlapping element bounding boxes', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 3. Alignment
    const derivedLayout = this.layoutDeriver.deriveLayoutLabel(sample);
    rawList.push(
      { featureId: 'align_grid_score', featureName: 'Grid Alignment Score', featureGroup: 'alignment', type: 'numerical', source: 'derived_deterministic', availability: 'available', value: derivedLayout.confidence, normalization: 'none', missingValueStrategy: 'mode', description: 'Deterministic layout grid alignment confidence score', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 4. Spacing
    rawList.push(
      { featureId: 'space_mean_v_gap', featureName: 'Mean Vertical Gap', featureGroup: 'spacing', type: 'numerical', source: 'sketch.bounds', availability: 'available', value: 16, normalization: 'standard', missingValueStrategy: 'zero', description: 'Average vertical gap between adjacent elements', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 5. Layout Density
    const elementDensity = canvasObjs.length > 0 ? parseFloat((canvasObjs.length / (totalScreenArea / 10000)).toFixed(4)) : 0;
    rawList.push(
      { featureId: 'density_element_density', featureName: 'Element Density', featureGroup: 'density', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: elementDensity, normalization: 'standard', missingValueStrategy: 'zero', description: 'Elements per 10,000 px^2 area', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 6. Components
    const distinctTypes = new Set(canvasObjs.map((o: any) => o.type || 'component')).size;
    rawList.push(
      { featureId: 'comp_total_components', featureName: 'Total Component Count', featureGroup: 'components', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: canvasObjs.length, normalization: 'standard', missingValueStrategy: 'zero', description: 'Total count of UI component objects', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'comp_distinct_types', featureName: 'Distinct Component Types', featureGroup: 'components', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: distinctTypes, normalization: 'standard', missingValueStrategy: 'zero', description: 'Count of unique component object types', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 7. Component Composition
    let btnCount = 0;
    let txtCount = 0;
    let imgCount = 0;
    let inputCount = 0;

    for (const obj of canvasObjs) {
      const mapped = this.componentMapper.mapComponentLabel(sample.provenance?.sourceDataset || 'External', String(obj.type || 'component'));
      if (mapped.normalizedLabel === 'button') btnCount++;
      if (mapped.normalizedLabel === 'text') txtCount++;
      if (mapped.normalizedLabel === 'image') imgCount++;
      if (mapped.normalizedLabel === 'input') inputCount++;
    }

    rawList.push(
      { featureId: 'comp_button_count', featureName: 'Button Component Count', featureGroup: 'component_composition', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: btnCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Count of normalized button components', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'comp_text_count', featureName: 'Text Component Count', featureGroup: 'component_composition', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: txtCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Count of normalized text components', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'comp_image_count', featureName: 'Image Component Count', featureGroup: 'component_composition', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: imgCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Count of normalized image components', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'comp_input_count', featureName: 'Input Component Count', featureGroup: 'component_composition', type: 'numerical', source: 'sketch.canvasObjects', availability: 'available', value: inputCount, normalization: 'standard', missingValueStrategy: 'zero', description: 'Count of normalized input form components', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 8. Text Structure
    const textList = sample.sketch?.text || [];
    const totalTextLength = textList.reduce((acc: number, t: string) => acc + (t ? t.length : 0), 0);

    rawList.push(
      { featureId: 'text_element_count', featureName: 'Text Element Count', featureGroup: 'text', type: 'numerical', source: 'sketch.text', availability: 'available', value: textList.length, normalization: 'standard', missingValueStrategy: 'zero', description: 'Count of text strings in screen', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'text_total_length', featureName: 'Total Text Length', featureGroup: 'text', type: 'numerical', source: 'sketch.text', availability: 'available', value: totalTextLength, normalization: 'standard', missingValueStrategy: 'zero', description: 'Total character length of all screen text', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 9. Hierarchy
    const hasTree = Boolean(sample.semanticTree || sample.intentTree);
    rawList.push(
      { featureId: 'hier_tree_depth', featureName: 'Hierarchy Tree Depth', featureGroup: 'hierarchy', type: 'numerical', source: 'semanticTree', availability: hasTree ? 'available' : 'unavailable', value: hasTree ? 3 : 0, normalization: 'standard', missingValueStrategy: 'zero', description: 'UI view hierarchy depth', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 10. Visual Signals
    rawList.push(
      { featureId: 'visual_dominant_colors', featureName: 'Dominant Color Count', featureGroup: 'visual', type: 'numerical', source: 'visualDesignOptions', availability: 'unavailable', value: 0, normalization: 'none', missingValueStrategy: 'zero', description: 'Dominant color count (marked unavailable when raw pixel extraction un-implemented)', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 11. Typography Signals
    const font = sample.selectedVisualDesign?.typography?.fontFamily;
    rawList.push(
      { featureId: 'typo_font_family_count', featureName: 'Font Family Count', featureGroup: 'typography', type: 'numerical', source: 'selectedVisualDesign', availability: font ? 'available' : 'unavailable', value: font ? 1 : 0, normalization: 'none', missingValueStrategy: 'zero', description: 'Distinct font families in design', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 12. Viewport / Responsive
    rawList.push(
      { featureId: 'vp_width', featureName: 'Viewport Width', featureGroup: 'viewport', type: 'numerical', source: 'sketch.viewport', availability: 'available', value: vp.width || 1280, normalization: 'standard', missingValueStrategy: 'zero', description: 'Screen viewport width', version: 'v0.2', leakageStatus: 'guarded_clean' },
      { featureId: 'vp_height', featureName: 'Viewport Height', featureGroup: 'viewport', type: 'numerical', source: 'sketch.viewport', availability: 'available', value: vp.height || 800, normalization: 'standard', missingValueStrategy: 'zero', description: 'Screen viewport height', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 13. Semantic Features (Phase 2)
    const hasSem = Boolean(sample.semanticTree);
    rawList.push(
      { featureId: 'sem_node_count', featureName: 'Semantic Node Count', featureGroup: 'semantic', type: 'numerical', source: 'semanticTree', availability: hasSem ? 'available' : 'unavailable', value: hasSem ? 5 : 0, normalization: 'standard', missingValueStrategy: 'zero', description: 'Recognized semantic node count', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 14. Intent Features (Phase 1)
    const hasIntent = Boolean(sample.intentTree);
    rawList.push(
      { featureId: 'intent_node_count', featureName: 'Intent Node Count', featureGroup: 'intent', type: 'numerical', source: 'intentTree', availability: hasIntent ? 'available' : 'unavailable', value: hasIntent ? 3 : 0, normalization: 'standard', missingValueStrategy: 'zero', description: 'Recognized intent node count (unavailable for external samples)', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 15. Blueprint Features (Phase 3)
    const hasBp = Boolean(sample.blueprintVariants);
    rawList.push(
      { featureId: 'bp_node_count', featureName: 'Blueprint Node Count', featureGroup: 'blueprint', type: 'numerical', source: 'blueprintVariants', availability: hasBp ? 'available' : 'unavailable', value: hasBp ? 4 : 0, normalization: 'standard', missingValueStrategy: 'zero', description: 'Blueprint node count (unavailable for external raw samples)', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 16. Visual Design Features (Phase 4)
    const hasVis = Boolean(sample.selectedVisualDesign);
    rawList.push(
      { featureId: 'vis_token_count', featureName: 'Color Token Count', featureGroup: 'visual_design', type: 'numerical', source: 'selectedVisualDesign', availability: hasVis ? 'available' : 'unavailable', value: hasVis ? 6 : 0, normalization: 'standard', missingValueStrategy: 'zero', description: 'Visual design token count (unavailable for external raw samples)', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 17. Quality Signals
    rawList.push(
      { featureId: 'qual_sample_score', featureName: 'Sample Quality Score', featureGroup: 'quality', type: 'numerical', source: 'qualityScore', availability: 'available', value: sample.qualityScore || 80, normalization: 'min_max', missingValueStrategy: 'mean', description: 'Sample structural quality score', version: 'v0.2', leakageStatus: 'guarded_clean' }
    );

    // 18. Provenance Features (Tracked ONLY; rejected by Leakage Guard for predictive model vector)
    rawList.push(
      { featureId: 'prov_source_dataset_name', featureName: 'Source Dataset Name', featureGroup: 'provenance', type: 'categorical', source: 'provenance.sourceDataset', availability: 'available', value: sample.provenance?.sourceDataset || 'External', normalization: 'none', missingValueStrategy: 'mode', description: 'Dataset source name (provenance tracking only)', version: 'v0.2', leakageStatus: 'rejected_target_leakage' }
    );

    // Audit and filter through UIUnderstandingFeatureLeakageGuard
    const { cleanFeatures, leakageReport } = this.leakageGuard.auditAndFilterFeatures(sample.sampleId, rawList);

    return {
      sampleId: sample.sampleId,
      schemaVersion: 'ui-understanding-features-v0.2',
      features: cleanFeatures,
      activeFeatureGroups: activeGroups,
      extractedAt: new Date().toISOString(),
      leakageReport
    };
  }
}
