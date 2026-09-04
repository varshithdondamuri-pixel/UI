import { FullDesignSample, ProvenanceData } from '../DatasetTypes';
import { DatasetAdapterInterface } from '../inspection/DatasetInspectionTypes';

export class WebUIAdapter implements DatasetAdapterInterface {
  public datasetName = 'WebUI';

  public normalize(
    rawRecord: any,
    recordId?: string
  ): { sample: FullDesignSample | null; errors: string[] } {
    if (!rawRecord) return { sample: null, errors: ['Raw record is empty'] };

    const sampleId = `norm_webui_${rawRecord.sample_id || recordId || Date.now()}`;
    const prompt = rawRecord.description || `${rawRecord.component_type || 'Web'} Component Design`;

    const provenance: ProvenanceData = {
      sourceType: 'external',
      sourceDataset: 'WebUI',
      sourceDatasetVersion: 'v1.0-webui',
      license: 'unknown',
      collectionDate: new Date().toISOString(),
      transformationVersion: '1.0.0',
      sampleOrigin: 'WebUI Dataset'
    };

    const normalizedSample: FullDesignSample = {
      sampleId,
      datasetVersion: 'v1.0-webui',
      prompt,
      sketch: {
        sceneGraphReference: `webui_scene_${rawRecord.sample_id || 'raw'}`,
        canvasObjects: typeof rawRecord.bboxes === 'object' ? Object.keys(rawRecord.bboxes).map((k) => ({ id: k, bbox: rawRecord.bboxes[k] })) : [],
        objectTypes: [rawRecord.component_type || 'web_component'],
        positions: [],
        sizes: [],
        relationships: [],
        text: [],
        drawingOrder: [],
        viewport: this.parseViewport(rawRecord.viewport),
        zoom: 1,
        selectedObjects: [],
        userCreatedObjects: [],
        agentCreatedObjects: []
      },
      semanticTree: {
        canvasObjects: [],
        recognizedShapes: [],
        textAssociations: [],
        spatialRelationships: [],
        layoutStructures: [],
        semanticTree: { elementCount: rawRecord.element_count || 0, componentType: rawRecord.component_type || 'web_page' },
        recognitionConfidence: 1.0
      },
      intentTree: {
        semanticTree: null,
        intentTree: null,
        purpose: prompt,
        priority: 'high',
        possibleVariants: [],
        ambiguityCandidates: [],
        confidence: 0.9
      },
      blueprintVariants: {
        intentTree: null,
        candidateBlueprintVariants: [],
        structuralStrategies: [],
        rankingScores: {},
        selectedBlueprint: null,
        rejectedBlueprints: [],
        selectionReason: 'WebUI layout'
      },
      selectedBlueprint: null,
      visualDesignOptions: {
        blueprint: null,
        designSystem: null,
        theme: null,
        colors: [],
        typography: null,
        spacing: null,
        components: [],
        elevation: null,
        icons: [],
        illustrations: [],
        animation: null,
        accessibility: null,
        selectedOption: rawRecord.css ? { cssRules: rawRecord.css, cssFramework: rawRecord.css_framework || 'vanilla' } : null,
        rejectedOptions: [],
        visualEvaluation: null
      },
      selectedVisualDesign: rawRecord.css ? {
        cssRules: rawRecord.css,
        framework: rawRecord.css_framework || 'vanilla'
      } : null,
      knowledgeBundle: null,
      mlPredictionBundle: null,
      aiDecision: null,
      renderTree: null,
      codeGenerationReference: rawRecord.html || null,
      userSelections: null,
      userChanges: [],
      feedback: null,
      evaluation: {
        visualQuality: 85,
        uxQuality: 85,
        accessibility: 85,
        responsiveQuality: 85,
        typography: 85,
        spacing: 85,
        hierarchy: 85,
        consistency: 85,
        codeQuality: 85,
        overallQuality: 85,
        humanFeedback: 'WebUI Imported Record',
        machineEvaluation: null,
        finalRating: 85
      },
      finalDesign: rawRecord.html ? {
        html: rawRecord.html,
        css: rawRecord.css || '',
        js: rawRecord.js || ''
      } : null,
      provenance,
      qualityScore: 85,
      createdAt: new Date().toISOString(),
      trainingDataAllowed: true,
      category: 'layout',
      industry: 'Enterprise',
      style: 'Modern SaaS',
      sessionId: `external_session_webui_${rawRecord.sample_id || 'default'}`
    };

    return { sample: normalizedSample, errors: [] };
  }

  private parseViewport(vpStr: string): { x: number; y: number; zoom: number } {
    if (typeof vpStr === 'string' && vpStr.includes('x')) {
      const parts = vpStr.split('x').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { x: 0, y: 0, zoom: 1 };
      }
    }
    return { x: 0, y: 0, zoom: 1 };
  }
}
