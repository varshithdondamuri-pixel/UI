import { ProprietaryDatasetProvider, FullDesignSample, DatasetCategory, IndustryLabel, DesignStyleLabel } from '../dataset/DatasetTypes';
import { MLTaskIdentifier } from './MLTaskTypes';

export class MLDatasetAdapter {
  private provider: ProprietaryDatasetProvider;

  constructor(provider: ProprietaryDatasetProvider) {
    this.provider = provider;
  }

  public getTrainingSamples(task?: MLTaskIdentifier): FullDesignSample[] {
    const raw = this.provider.trainingSplit();
    return this.filterEligible(raw, task);
  }

  public getValidationSamples(task?: MLTaskIdentifier): FullDesignSample[] {
    const raw = this.provider.validationSplit();
    return this.filterEligible(raw, task);
  }

  public getTestSamples(task?: MLTaskIdentifier): FullDesignSample[] {
    const raw = this.provider.testSplit();
    return this.filterEligible(raw, task);
  }

  public getSamplesByCategory(category: DatasetCategory): FullDesignSample[] {
    const raw = this.provider.samplesByCategory(category);
    return this.filterEligible(raw);
  }

  public getSamplesByIndustry(industry: IndustryLabel): FullDesignSample[] {
    const raw = this.provider.samplesByIndustry(industry);
    return this.filterEligible(raw);
  }

  public getSamplesByStyle(style: DesignStyleLabel): FullDesignSample[] {
    const raw = this.provider.samplesByStyle(style);
    return this.filterEligible(raw);
  }

  public getSamplesByQuality(minQuality: number): FullDesignSample[] {
    const raw = this.provider.samplesByQuality(minQuality);
    return this.filterEligible(raw);
  }

  public getDatasetVersion(): string {
    const samples = this.getTrainingSamples();
    return samples[0]?.datasetVersion || 'v0.1';
  }

  public getDatasetStatistics(): any {
    return {
      trainingCount: this.getTrainingSamples().length,
      validationCount: this.getValidationSamples().length,
      testCount: this.getTestSamples().length,
      datasetVersion: this.getDatasetVersion()
    };
  }

  /**
   * Filters samples to enforce dataset quality gates:
   * 1. trainingDataAllowed === true
   * 2. !isDuplicate
   * 3. Valid provenance (sourceDataset & license present)
   * 4. Task-specific category matching
   */
  private filterEligible(samples: FullDesignSample[], task?: MLTaskIdentifier): FullDesignSample[] {
    return samples.filter((s) => {
      if (!s.trainingDataAllowed) return false;
      if (s.isDuplicate) return false;
      if (!s.provenance?.license || !s.provenance?.sourceDataset) return false;

      if (task) {
        return this.isSampleRelevantForTask(s, task);
      }

      return true;
    });
  }

  private isSampleRelevantForTask(sample: FullDesignSample, task: MLTaskIdentifier): boolean {
    switch (task) {
      case 'ui_understanding':
        return Boolean(sample.sketch?.canvasObjects?.length);
      case 'semantic_prediction':
        return Boolean(sample.semanticTree);
      case 'intent_prediction':
        return Boolean(sample.intentTree);
      case 'layout_prediction':
        return Boolean(sample.blueprintVariants || sample.selectedBlueprint);
      case 'component_recommendation':
        return Boolean(sample.visualDesignOptions?.components?.length || sample.sketch?.canvasObjects?.length);
      case 'visual_style_recommendation':
        return Boolean(sample.visualDesignOptions || sample.style);
      case 'responsive_prediction':
        return Boolean(sample.sketch?.viewport);
      case 'design_quality_prediction':
        return Boolean(sample.evaluation);
      case 'alternative_ranking':
        return Boolean(sample.userSelections || sample.preferenceExamples?.length);
      case 'user_preference_prediction':
        return Boolean(sample.userChanges?.length || sample.preferenceExamples?.length);
      default:
        return true;
    }
  }

  /**
   * Phase 12.5 Dataset Availability Query for ML Tasks.
   * Returns list of verified datasets supporting the specified ML task.
   */
  public getAvailableDatasetsForTask(task: MLTaskIdentifier): Array<{
    datasetId: string;
    datasetName: string;
    status: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED' | 'UNKNOWN';
    rationale: string;
  }> {
    const matrix: Record<MLTaskIdentifier, Record<string, { status: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED' | 'UNKNOWN'; name: string; rationale: string }>> = {
      ui_understanding: {
        rico: { status: 'SUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'Contains view nodes, bounds, text, class names, and image screenshots' },
        screen2words: { status: 'SUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'Provides natural language screen descriptions of UI structure' },
        webcode2m: { status: 'SUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'Provides rendered PNG screenshots, bounding boxes, and HTML text tokens' },
        webui: { status: 'SUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Provides image, HTML, DOM bboxes, and element counts' }
      },
      semantic_prediction: {
        rico: { status: 'SUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'Contains Android view hierarchy & class names' },
        screen2words: { status: 'SUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'Summaries describe functional screen intent & component roles' },
        webcode2m: { status: 'SUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'HTML tags and bounding box tokens enable semantic node extraction' },
        webui: { status: 'SUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Full HTML tree and component type labels enable semantic hierarchy parsing' }
      },
      intent_prediction: {
        rico: { status: 'UNSUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'Raw RICO lacks natural language user prompts and explicit layout intent statements' },
        screen2words: { status: 'SUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'Human screen goal summaries serve as ground-truth layout intent annotations' },
        webcode2m: { status: 'UNSUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'Lacks natural language user prompt intent annotations' },
        webui: { status: 'PARTIAL', name: 'WebUI Web Design Dataset', rationale: 'Description field provides web UI purpose, but lacks user prompt history' }
      },
      layout_prediction: {
        rico: { status: 'PARTIAL', name: 'RICO Mobile UI Dataset', rationale: 'Contains mobile bounding boxes and positions, but lacks web grid/flex metadata' },
        screen2words: { status: 'PARTIAL', name: 'Screen2Words Screen Summaries', rationale: 'Descriptive summaries outline layout structure, relying on RICO for coordinates' },
        webcode2m: { status: 'SUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'Contains bounding boxes and web layout HTML tokens' },
        webui: { status: 'SUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Provides full HTML, CSS, viewport, and bounding boxes for web layout synthesis' }
      },
      component_recommendation: {
        rico: { status: 'SUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'View class names and resource IDs support component type classification' },
        screen2words: { status: 'PARTIAL', name: 'Screen2Words Screen Summaries', rationale: 'Summaries explicitly mention UI component types in text' },
        webcode2m: { status: 'SUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'HTML element code tokens and bounding boxes allow component recommendation' },
        webui: { status: 'SUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Explicit component_type, framework, css_framework, and HTML code' }
      },
      visual_style_recommendation: {
        rico: { status: 'PARTIAL', name: 'RICO Mobile UI Dataset', rationale: 'Contains screen images & view classes, but lacks explicit CSS design tokens' },
        screen2words: { status: 'UNSUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'Summaries do not record visual style or CSS design tokens' },
        webcode2m: { status: 'PARTIAL', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'Includes website screenshots and code tokens, but lacks parsed CSS rules' },
        webui: { status: 'SUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Contains full CSS stylesheet strings, css_framework labels, and images' }
      },
      responsive_prediction: {
        rico: { status: 'UNSUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'Single mobile viewport screens without multi-breakpoint pairs' },
        screen2words: { status: 'UNSUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'Screen descriptions without multi-breakpoint metadata' },
        webcode2m: { status: 'PARTIAL', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'Provides scale factors and bboxes, but single viewports per record' },
        webui: { status: 'SUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Specifies viewport metadata, HTML, CSS media queries, and element counts' }
      },
      design_quality_prediction: {
        rico: { status: 'UNSUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'No quality ratings, accessibility scores, or human design evaluations' },
        screen2words: { status: 'UNSUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'No design quality metrics' },
        webcode2m: { status: 'PARTIAL', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'Includes data quality score column, but no human UX rating' },
        webui: { status: 'PARTIAL', name: 'WebUI Web Design Dataset', rationale: 'has_animations, element_count provide structural quality signals' }
      },
      alternative_ranking: {
        rico: { status: 'UNSUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'No design variant rankings exist' },
        screen2words: { status: 'UNSUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'No design variant rankings exist' },
        webcode2m: { status: 'UNSUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'No candidate variant choices exist' },
        webui: { status: 'UNSUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'Single web page records without design variant rankings' }
      },
      user_preference_prediction: {
        rico: { status: 'UNSUPPORTED', name: 'RICO Mobile UI Dataset', rationale: 'No user selection history or preferences' },
        screen2words: { status: 'UNSUPPORTED', name: 'Screen2Words Screen Summaries', rationale: 'No user interaction or preference selections' },
        webcode2m: { status: 'UNSUPPORTED', name: 'WebCode2M Code & Screenshot Corpus', rationale: 'No user interaction logs present' },
        webui: { status: 'UNSUPPORTED', name: 'WebUI Web Design Dataset', rationale: 'No user choice history or preference interactions' }
      }
    };

    const taskMap = matrix[task] || {};
    return Object.entries(taskMap).map(([id, info]) => ({
      datasetId: id,
      datasetName: info.name,
      status: info.status,
      rationale: info.rationale
    }));
  }
}

