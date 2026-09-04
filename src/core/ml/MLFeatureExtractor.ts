import { FullDesignSample } from '../dataset/DatasetTypes';
import { MLFeature, MLFeatureGroup, MLFeatureVector } from './MLFeatureTypes';

export class MLFeatureExtractor {
  public extractFeatures(
    sample: FullDesignSample,
    enabledGroups?: MLFeatureGroup[]
  ): MLFeatureVector {
    const allGroups: MLFeatureGroup[] = [
      'sketch_features',
      'geometry_features',
      'semantic_features',
      'intent_features',
      'layout_features',
      'component_features',
      'visual_features',
      'typography_features',
      'color_features',
      'spacing_features',
      'responsive_features',
      'accessibility_features',
      'interaction_features',
      'preference_features',
      'quality_features',
      'prompt_features',
      'industry_features',
      'style_features'
    ];

    const activeGroups = enabledGroups && enabledGroups.length > 0 ? enabledGroups : allGroups;
    const features: Record<string, MLFeature> = {};

    for (const group of activeGroups) {
      const extracted = this.extractGroup(sample, group);
      for (const feat of extracted) {
        features[feat.featureId] = feat;
      }
    }

    return {
      sampleId: sample.sampleId,
      features,
      featureGroups: activeGroups,
      extractedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  private extractGroup(sample: FullDesignSample, group: MLFeatureGroup): MLFeature[] {
    const list: MLFeature[] = [];
    if (!sample) return list;

    switch (group) {
      case 'sketch_features':
        list.push({
          featureId: 'sketch_object_count',
          featureName: 'Sketch Object Count',
          featureType: 'numerical',
          group: 'sketch_features',
          source: 'sketch.canvasObjects',
          value: sample.sketch?.canvasObjects?.length || 0,
          normalization: 'min_max',
          missingValueStrategy: 'zero'
        });
        break;

      case 'geometry_features':
        const positions = sample.sketch?.positions || [];
        const avgX = positions.length > 0 ? positions.reduce((acc, p) => acc + (p.x || 0), 0) / positions.length : 0;
        list.push({
          featureId: 'geom_avg_x',
          featureName: 'Average Geometry Position X',
          featureType: 'numerical',
          group: 'geometry_features',
          source: 'sketch.positions',
          value: Number(avgX.toFixed(2)),
          normalization: 'standard',
          missingValueStrategy: 'zero'
        });
        break;

      case 'semantic_features':
        list.push({
          featureId: 'semantic_confidence',
          featureName: 'Semantic Recognition Confidence',
          featureType: 'numerical',
          group: 'semantic_features',
          source: 'semanticTree.recognitionConfidence',
          value: sample.semanticTree?.recognitionConfidence || 0.85,
          normalization: 'none',
          missingValueStrategy: 'mean'
        });
        break;

      case 'intent_features':
        list.push({
          featureId: 'intent_purpose_text',
          featureName: 'Intent Purpose',
          featureType: 'text',
          group: 'intent_features',
          source: 'intentTree.purpose',
          value: sample.intentTree?.purpose || 'General UI',
          normalization: 'none',
          missingValueStrategy: 'mode'
        });
        break;

      case 'layout_features':
        list.push({
          featureId: 'layout_strategy_name',
          featureName: 'Layout Structural Strategy',
          featureType: 'categorical',
          group: 'layout_features',
          source: 'blueprintVariants.structuralStrategies',
          value: sample.blueprintVariants?.structuralStrategies?.[0] || 'FlexGrid',
          normalization: 'one_hot',
          missingValueStrategy: 'mode'
        });
        break;

      case 'component_features':
        list.push({
          featureId: 'component_count',
          featureName: 'Visual Component Count',
          featureType: 'numerical',
          group: 'component_features',
          source: 'visualDesignOptions.components',
          value: sample.visualDesignOptions?.components?.length || sample.sketch?.canvasObjects?.length || 0,
          normalization: 'min_max',
          missingValueStrategy: 'zero'
        });
        break;

      case 'visual_features':
        list.push({
          featureId: 'theme_mode',
          featureName: 'Theme Color Mode',
          featureType: 'categorical',
          group: 'visual_features',
          source: 'visualDesignOptions.theme.mode',
          value: sample.visualDesignOptions?.theme?.mode || 'dark',
          normalization: 'one_hot',
          missingValueStrategy: 'mode'
        });
        break;

      case 'typography_features':
        list.push({
          featureId: 'font_family',
          featureName: 'Font Family',
          featureType: 'text',
          group: 'typography_features',
          source: 'visualDesignOptions.typography.fontFamily',
          value: sample.visualDesignOptions?.typography?.fontFamily || 'Inter',
          normalization: 'none',
          missingValueStrategy: 'mode'
        });
        break;

      case 'color_features':
        list.push({
          featureId: 'primary_color',
          featureName: 'Primary Color Hex',
          featureType: 'categorical',
          group: 'color_features',
          source: 'visualDesignOptions.colors',
          value: sample.visualDesignOptions?.colors?.[0] || '#6366f1',
          normalization: 'one_hot',
          missingValueStrategy: 'mode'
        });
        break;

      case 'spacing_features':
        list.push({
          featureId: 'spacing_base_unit',
          featureName: 'Spacing Base Unit',
          featureType: 'numerical',
          group: 'spacing_features',
          source: 'visualDesignOptions.spacing.baseUnit',
          value: sample.visualDesignOptions?.spacing?.baseUnit || 8,
          normalization: 'none',
          missingValueStrategy: 'mean'
        });
        break;

      case 'responsive_features':
        list.push({
          featureId: 'viewport_zoom',
          featureName: 'Viewport Zoom Level',
          featureType: 'numerical',
          group: 'responsive_features',
          source: 'sketch.zoom',
          value: sample.sketch?.zoom || 1.0,
          normalization: 'none',
          missingValueStrategy: 'mode'
        });
        break;

      case 'accessibility_features':
        list.push({
          featureId: 'acc_min_contrast',
          featureName: 'Accessibility Minimum Contrast Ratio',
          featureType: 'numerical',
          group: 'accessibility_features',
          source: 'visualDesignOptions.accessibility.minContrastRatio',
          value: sample.visualDesignOptions?.accessibility?.minContrastRatio || 4.5,
          normalization: 'none',
          missingValueStrategy: 'mean'
        });
        break;

      case 'interaction_features':
        list.push({
          featureId: 'user_changes_count',
          featureName: 'User Interaction Changes Count',
          featureType: 'numerical',
          group: 'interaction_features',
          source: 'userChanges',
          value: sample.userChanges?.length || 0,
          normalization: 'min_max',
          missingValueStrategy: 'zero'
        });
        break;

      case 'preference_features':
        list.push({
          featureId: 'has_preference_example',
          featureName: 'Preference Example Recorded',
          featureType: 'binary',
          group: 'preference_features',
          source: 'preferenceExamples',
          value: (sample.preferenceExamples?.length || 0) > 0 ? 1 : 0,
          normalization: 'none',
          missingValueStrategy: 'zero'
        });
        break;

      case 'quality_features':
        list.push({
          featureId: 'overall_quality_score',
          featureName: 'Overall Dataset Quality Score',
          featureType: 'numerical',
          group: 'quality_features',
          source: 'qualityScore',
          value: sample.qualityScore || 80,
          normalization: 'min_max',
          missingValueStrategy: 'mean'
        });
        break;

      case 'prompt_features':
        list.push({
          featureId: 'prompt_length',
          featureName: 'User Prompt Length',
          featureType: 'numerical',
          group: 'prompt_features',
          source: 'prompt',
          value: sample.prompt ? sample.prompt.length : 0,
          normalization: 'min_max',
          missingValueStrategy: 'zero'
        });
        break;

      case 'industry_features':
        list.push({
          featureId: 'industry_label',
          featureName: 'Industry Category',
          featureType: 'categorical',
          group: 'industry_features',
          source: 'industry',
          value: sample.industry || 'SaaS',
          normalization: 'one_hot',
          missingValueStrategy: 'mode'
        });
        break;

      case 'style_features':
        list.push({
          featureId: 'style_label',
          featureName: 'Design Style Label',
          featureType: 'categorical',
          group: 'style_features',
          source: 'style',
          value: sample.style || 'Minimal',
          normalization: 'one_hot',
          missingValueStrategy: 'mode'
        });
        break;
    }

    return list;
  }
}
