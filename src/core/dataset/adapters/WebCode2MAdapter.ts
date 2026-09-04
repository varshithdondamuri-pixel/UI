import { FullDesignSample, ProvenanceData } from '../DatasetTypes';
import { DatasetAdapterInterface } from '../inspection/DatasetInspectionTypes';

export class WebCode2MAdapter implements DatasetAdapterInterface {
  public datasetName = 'WebCode2M';

  public normalize(
    rawRecord: any,
    recordId?: string
  ): { sample: FullDesignSample | null; errors: string[] } {
    if (!rawRecord) return { sample: null, errors: ['Raw record is empty'] };

    const sampleId = `norm_webcode2m_${rawRecord.hash || recordId || Date.now()}`;
    const htmlContent = typeof rawRecord.text === 'string' ? rawRecord.text : null;
    const bboxList = Array.isArray(rawRecord.bbox) ? rawRecord.bbox : [];

    const provenance: ProvenanceData = {
      sourceType: 'external',
      sourceDataset: 'WebCode2M',
      sourceDatasetVersion: 'v1.0-webcode2m',
      license: 'unknown',
      collectionDate: new Date().toISOString(),
      transformationVersion: '1.0.0',
      sampleOrigin: 'WebCode2M Dataset'
    };

    const normalizedSample: FullDesignSample = {
      sampleId,
      datasetVersion: 'v1.0-webcode2m',
      prompt: 'WebCode2M Synthetic Layout & HTML Token Code',
      sketch: {
        sceneGraphReference: `webcode2m_graph_${rawRecord.hash || 'raw'}`,
        canvasObjects: bboxList.map((box: any, idx: number) => ({
          id: `webcode_box_${idx}`,
          type: 'web_element',
          bbox: box
        })),
        objectTypes: ['web_element'],
        positions: [],
        sizes: [],
        relationships: [],
        text: [],
        drawingOrder: [],
        viewport: { x: 0, y: 0, zoom: 1 },
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
        semanticTree: { tokenCount: Array.isArray(rawRecord.tokens) ? rawRecord.tokens.length : 0 },
        recognitionConfidence: rawRecord.score || 0.9
      },
      intentTree: {
        semanticTree: null,
        intentTree: null,
        purpose: 'Web Code Generation',
        priority: 'medium',
        possibleVariants: [],
        ambiguityCandidates: [],
        confidence: 0.8
      },
      blueprintVariants: {
        intentTree: null,
        candidateBlueprintVariants: [],
        structuralStrategies: [],
        rankingScores: {},
        selectedBlueprint: null,
        rejectedBlueprints: [],
        selectionReason: 'WebCode2M layout'
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
        selectedOption: null,
        rejectedOptions: [],
        visualEvaluation: null
      },
      selectedVisualDesign: null,
      knowledgeBundle: null,
      mlPredictionBundle: null,
      aiDecision: null,
      renderTree: null,
      codeGenerationReference: htmlContent,
      userSelections: null,
      userChanges: [],
      feedback: null,
      evaluation: {
        visualQuality: Math.round((rawRecord.score || 0.8) * 100),
        uxQuality: Math.round((rawRecord.score || 0.8) * 100),
        accessibility: 80,
        responsiveQuality: 80,
        typography: 80,
        spacing: 80,
        hierarchy: 80,
        consistency: 80,
        codeQuality: Math.round((rawRecord.score || 0.8) * 100),
        overallQuality: Math.round((rawRecord.score || 0.8) * 100),
        humanFeedback: 'WebCode2M Filter Score',
        machineEvaluation: null,
        finalRating: Math.round((rawRecord.score || 0.8) * 100)
      },
      finalDesign: null,
      provenance,
      qualityScore: rawRecord.score ? Math.round(rawRecord.score * 100) : 80,
      createdAt: new Date().toISOString(),
      trainingDataAllowed: true,
      category: 'layout',
      industry: 'Developer Tools',
      style: 'Modern SaaS',
      sessionId: `external_session_webcode2m_${rawRecord.hash || 'default'}`
    };

    return { sample: normalizedSample, errors: [] };
  }
}
