import { FullDesignSample } from '../DatasetTypes';
import { ComponentLabelMapper } from './ComponentLabelMapper';
import { LayoutLabelDeriver } from './LayoutLabelDeriver';
import { MLTaskSample, PreparedTaskIdentifier } from './TaskPreparationTypes';

export class TaskSampleBuilder {
  private componentMapper: ComponentLabelMapper;
  private layoutDeriver: LayoutLabelDeriver;

  constructor() {
    this.componentMapper = new ComponentLabelMapper();
    this.layoutDeriver = new LayoutLabelDeriver();
  }

  /**
   * Converts a normalized FullDesignSample into a task-specific MLTaskSample for one of the 4 target tasks.
   */
  public buildTaskSample(
    sample: FullDesignSample,
    task: PreparedTaskIdentifier,
    split: 'train' | 'validation' | 'test' = 'train'
  ): MLTaskSample | null {
    if (!sample) return null;

    const sourceDataset = sample.provenance?.sourceDataset || 'External';
    const sourceRecordId = sample.sampleId;

    switch (task) {
      case 'ui_understanding':
        return this.buildUIUnderstandingSample(sample, sourceDataset, sourceRecordId, split);

      case 'layout_prediction':
        return this.buildLayoutPredictionSample(sample, sourceDataset, sourceRecordId, split);

      case 'component_recommendation':
        return this.buildComponentRecommendationSample(sample, sourceDataset, sourceRecordId, split);

      case 'visual_style_recommendation':
        return this.buildVisualStyleSample(sample, sourceDataset, sourceRecordId, split);

      default:
        return null;
    }
  }

  private buildUIUnderstandingSample(
    sample: FullDesignSample,
    sourceDataset: string,
    sourceRecordId: string,
    split: 'train' | 'validation' | 'test'
  ): MLTaskSample {
    const canvasObjects = sample.sketch?.canvasObjects || [];
    const textList = sample.sketch?.text || [];
    const rootClass = sample.semanticTree?.semanticTree?.rootNodeClass || sample.category;

    return {
      sampleId: `prep_ui_${sample.sampleId}`,
      sourceDataset,
      sourceRecordId,
      task: 'ui_understanding',
      inputFeatures: {
        canvasObjectCount: canvasObjects.length,
        hasImageScreenshot: true,
        textListLength: textList.length,
        viewport: sample.sketch?.viewport || { width: 1280, height: 800 }
      },
      labels: {
        rootClass,
        elementCount: canvasObjects.length || 1,
        containsButtons: canvasObjects.some((o: any) => String(o.type).toLowerCase().includes('button')),
        containsText: textList.length > 0
      },
      provenance: sample.provenance,
      qualityScore: sample.qualityScore || 80,
      split
    };
  }

  private buildLayoutPredictionSample(
    sample: FullDesignSample,
    sourceDataset: string,
    sourceRecordId: string,
    split: 'train' | 'validation' | 'test'
  ): MLTaskSample {
    const derivedLayout = this.layoutDeriver.deriveLayoutLabel(sample);

    return {
      sampleId: `prep_layout_${sample.sampleId}`,
      sourceDataset,
      sourceRecordId,
      task: 'layout_prediction',
      inputFeatures: {
        hasHtml: Boolean(sample.codeGenerationReference || sample.finalDesign?.html),
        elementCount: sample.sketch?.canvasObjects?.length || 1,
        viewport: sample.sketch?.viewport || { width: 1280, height: 800 }
      },
      labels: {
        layoutLabel: derivedLayout.layoutLabel,
        labelSource: derivedLayout.labelSource,
        derivationMethod: derivedLayout.derivationMethod,
        confidence: derivedLayout.confidence
      },
      provenance: sample.provenance,
      qualityScore: sample.qualityScore || 80,
      split
    };
  }

  private buildComponentRecommendationSample(
    sample: FullDesignSample,
    sourceDataset: string,
    sourceRecordId: string,
    split: 'train' | 'validation' | 'test'
  ): MLTaskSample {
    const rawObjects = sample.sketch?.canvasObjects || [];
    const recommendedComponents = rawObjects.map((o: any) => {
      const srcLabel = String(o.type || o.kind || 'component');
      const mapped = this.componentMapper.mapComponentLabel(sourceDataset, srcLabel);
      return mapped.normalizedLabel;
    });

    const uniqueComponents = Array.from(new Set(recommendedComponents));

    return {
      sampleId: `prep_comp_${sample.sampleId}`,
      sourceDataset,
      sourceRecordId,
      task: 'component_recommendation',
      inputFeatures: {
        category: sample.category,
        industry: sample.industry || 'Web',
        style: sample.style || 'Modern'
      },
      labels: {
        recommendedComponents: uniqueComponents.length > 0 ? uniqueComponents : ['card', 'button'],
        primaryComponent: uniqueComponents[0] || 'card'
      },
      provenance: sample.provenance,
      qualityScore: sample.qualityScore || 80,
      split
    };
  }

  private buildVisualStyleSample(
    sample: FullDesignSample,
    sourceDataset: string,
    sourceRecordId: string,
    split: 'train' | 'validation' | 'test'
  ): MLTaskSample {
    const cssRules = sample.selectedVisualDesign?.cssRules || sample.finalDesign?.css || null;
    const cssFramework = sample.selectedVisualDesign?.framework || 'vanilla';

    return {
      sampleId: `prep_style_${sample.sampleId}`,
      sourceDataset,
      sourceRecordId,
      task: 'visual_style_recommendation',
      inputFeatures: {
        hasCssRules: Boolean(cssRules),
        cssFramework,
        imagePresent: true
      },
      labels: {
        cssFramework,
        styleLabel: sample.style || 'Modern SaaS',
        status: cssRules ? 'verified_labels' : 'insufficient_labels'
      },
      provenance: sample.provenance,
      qualityScore: sample.qualityScore || 80,
      split
    };
  }
}
