import { FullDesignSample } from '../dataset/DatasetTypes';
import { MLTaskIdentifier } from './MLTaskTypes';

export interface EncodedLabel {
  sampleId: string;
  task: MLTaskIdentifier;
  labelType: 'categorical' | 'ordinal' | 'continuous' | 'ranking' | 'multi_label' | 'binary';
  labelSource: string;
  rawValue: any;
  encodedValue: number | number[] | string | string[];
}

export class MLLabelEncoder {
  public encodeLabel(sample: FullDesignSample, task: MLTaskIdentifier): EncodedLabel {
    switch (task) {
      case 'ui_understanding':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'sketch.objectTypes',
          rawValue: sample.sketch?.objectTypes || [],
          encodedValue: (sample.sketch?.objectTypes || []).join(',')
        };

      case 'semantic_prediction':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'semanticTree.semanticTree.type',
          rawValue: sample.semanticTree?.semanticTree?.type || 'layout_container',
          encodedValue: String(sample.semanticTree?.semanticTree?.type || 'layout_container')
        };

      case 'intent_prediction':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'intentTree.purpose',
          rawValue: sample.intentTree?.purpose || 'General UI',
          encodedValue: String(sample.intentTree?.purpose || 'General UI')
        };

      case 'layout_prediction':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'blueprintVariants.selectedBlueprint.strategyName',
          rawValue: sample.blueprintVariants?.selectedBlueprint?.strategyName || 'FlexGrid',
          encodedValue: String(sample.blueprintVariants?.selectedBlueprint?.strategyName || 'FlexGrid')
        };

      case 'component_recommendation':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'multi_label',
          labelSource: 'visualDesignOptions.components',
          rawValue: sample.sketch?.canvasObjects?.map((o) => o.kind) || ['rectangle'],
          encodedValue: sample.sketch?.canvasObjects?.map((o) => o.kind) || ['rectangle']
        };

      case 'visual_style_recommendation':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'style',
          rawValue: sample.style || 'Minimal',
          encodedValue: String(sample.style || 'Minimal')
        };

      case 'responsive_prediction':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'sketch.viewport',
          rawValue: sample.sketch?.viewport?.zoom < 0.8 ? 'mobile' : 'desktop',
          encodedValue: sample.sketch?.viewport?.zoom < 0.8 ? 'mobile' : 'desktop'
        };

      case 'design_quality_prediction':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'continuous',
          labelSource: 'qualityScore',
          rawValue: sample.qualityScore || 80,
          encodedValue: sample.qualityScore || 80
        };

      case 'alternative_ranking':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'ranking',
          labelSource: 'userSelections',
          rawValue: sample.blueprintVariants?.selectedBlueprint?.id || 'option_1',
          encodedValue: String(sample.blueprintVariants?.selectedBlueprint?.id || 'option_1')
        };

      case 'user_preference_prediction':
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'binary',
          labelSource: 'userChanges',
          rawValue: sample.userChanges?.length ? 1 : 0,
          encodedValue: sample.userChanges?.length ? 1 : 0
        };

      default:
        return {
          sampleId: sample.sampleId,
          task,
          labelType: 'categorical',
          labelSource: 'category',
          rawValue: sample.category,
          encodedValue: String(sample.category)
        };
    }
  }
}
