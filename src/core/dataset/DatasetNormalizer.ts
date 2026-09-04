import { ExternalDatasetImportConfig, FullDesignSample } from './DatasetTypes';
import { sanitizeSampleData } from './DatasetSchema';
import { ProvenanceTracker } from './ProvenanceTracker';
import { RicoAdapter } from './adapters/RicoAdapter';
import { Screen2WordsAdapter } from './adapters/Screen2WordsAdapter';
import { WebCode2MAdapter } from './adapters/WebCode2MAdapter';
import { WebUIAdapter } from './adapters/WebUIAdapter';

export interface RawExternalRecord {
  rawId: string;
  sourceDataset: string; // 'RICO' | 'Screen2Words' | 'WebSight' | 'WebUI' | 'WebCode2M' | 'DesignBench'
  payload: any;
  importedAt: string;
}

export class DatasetNormalizer {
  private provenanceTracker: ProvenanceTracker;
  private rawRegistry: RawExternalRecord[] = [];
  private ricoAdapter: RicoAdapter;
  private screen2wordsAdapter: Screen2WordsAdapter;
  private webcode2mAdapter: WebCode2MAdapter;
  private webuiAdapter: WebUIAdapter;

  constructor() {
    this.provenanceTracker = new ProvenanceTracker();
    this.ricoAdapter = new RicoAdapter();
    this.screen2wordsAdapter = new Screen2WordsAdapter();
    this.webcode2mAdapter = new WebCode2MAdapter();
    this.webuiAdapter = new WebUIAdapter();
  }

  /**
   * Registers a raw external dataset into the Raw Dataset Registry.
   * Does NOT automatically copy external dataset into proprietary dataset.
   */
  public registerRawExternal(
    config: ExternalDatasetImportConfig,
    rawItems: any[]
  ): RawExternalRecord[] {
    const records: RawExternalRecord[] = rawItems.map((item, idx) => ({
      rawId: item.id || `${config.sourceName}_raw_${Date.now()}_${idx}`,
      sourceDataset: config.sourceName,
      payload: item,
      importedAt: new Date().toISOString()
    }));

    this.rawRegistry.push(...records);
    return records;
  }

  public getRawRegistry(): RawExternalRecord[] {
    return [...this.rawRegistry];
  }

  /**
   * Converts raw external records into normalized FullDesignSample schema after License & Provenance checks.
   */
  public normalizeExternalRecord(
    rawRecord: RawExternalRecord,
    config: ExternalDatasetImportConfig
  ): { sample: FullDesignSample | null; errors: string[] } {
    const errors: string[] = [];

    // 1. License & Provenance Check
    if (!config.license) {
      errors.push(`Missing license for external dataset ${config.sourceName}`);
      return { sample: null, errors };
    }

    const provenance = this.provenanceTracker.createExternalProvenance(config);
    const provValidation = this.provenanceTracker.validateProvenance(provenance);
    if (!provValidation.isValid) {
      errors.push(...provValidation.errors);
      return { sample: null, errors };
    }

    const payload = rawRecord.payload || {};

    // 2. Delegate to dataset-specific adapter if available
    const src = config.sourceName.toLowerCase();
    if (src === 'rico') {
      const res = this.ricoAdapter.normalize(payload, rawRecord.rawId);
      if (res.sample) res.sample.provenance = provenance;
      return res;
    } else if (src === 'screen2words') {
      const res = this.screen2wordsAdapter.normalize(payload, rawRecord.rawId);
      if (res.sample) res.sample.provenance = provenance;
      return res;
    } else if (src === 'webcode2m') {
      const res = this.webcode2mAdapter.normalize(payload, rawRecord.rawId);
      if (res.sample) res.sample.provenance = provenance;
      return res;
    } else if (src === 'webui') {
      const res = this.webuiAdapter.normalize(payload, rawRecord.rawId);
      if (res.sample) res.sample.provenance = provenance;
      return res;
    }

    // 3. Fallback generic normalization mapping
    let prompt = payload.prompt || payload.description || payload.caption || `External ${config.sourceName} Sample`;
    let category = payload.category || 'ui_understanding';
    let industry = payload.industry;
    let style = payload.style;

    const sampleId = `norm_${config.sourceName.toLowerCase()}_${rawRecord.rawId}`;

    const normalizedSample: FullDesignSample = {
      sampleId,
      datasetVersion: config.sourceVersion || 'v1.0',
      prompt,
      sketch: {
        sceneGraphReference: 'external_ref',
        canvasObjects: payload.elements || payload.nodes || [],
        objectTypes: payload.elementTypes || ['component'],
        positions: payload.positions || [],
        sizes: payload.sizes || [],
        relationships: payload.relationships || [],
        text: payload.texts || [],
        drawingOrder: payload.elementIds || [],
        viewport: { x: 0, y: 0, zoom: 1 },
        zoom: 1,
        selectedObjects: [],
        userCreatedObjects: [],
        agentCreatedObjects: []
      },
      semanticTree: payload.semanticTree || { type: 'root', confidence: 0.8 },
      intentTree: payload.intentTree || { purpose: prompt, priority: 'high', confidence: 0.8 },
      blueprintVariants: payload.blueprintVariants || { selectedBlueprint: null },
      selectedBlueprint: payload.selectedBlueprint || null,
      visualDesignOptions: payload.visualDesignOptions || { selectedOption: null },
      selectedVisualDesign: payload.selectedVisualDesign || null,
      knowledgeBundle: null,
      mlPredictionBundle: null,
      aiDecision: null,
      renderTree: payload.renderTree || null,
      codeGenerationReference: payload.code || payload.html || null,
      userSelections: null,
      userChanges: [],
      feedback: null,
      evaluation: {
        visualQuality: payload.qualityScore || 80,
        uxQuality: 80,
        accessibility: 80,
        responsiveQuality: 80,
        typography: 80,
        spacing: 80,
        hierarchy: 80,
        consistency: 80,
        codeQuality: 80,
        overallQuality: payload.qualityScore || 80,
        humanFeedback: 'External imported sample',
        machineEvaluation: null,
        finalRating: payload.qualityScore || 80
      },
      finalDesign: payload.finalDesign || null,
      provenance,
      qualityScore: payload.qualityScore || 80,
      createdAt: new Date().toISOString(),
      trainingDataAllowed: !config.isEvaluationOnly,
      category,
      industry,
      style,
      sessionId: `external_session_${config.sourceName.toLowerCase()}`
    };

    return {
      sample: sanitizeSampleData(normalizedSample),
      errors: []
    };
  }
}

