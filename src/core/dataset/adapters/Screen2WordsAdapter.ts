import { FullDesignSample, ProvenanceData } from '../DatasetTypes';
import { DatasetAdapterInterface } from '../inspection/DatasetInspectionTypes';

export class Screen2WordsAdapter implements DatasetAdapterInterface {
  public datasetName = 'Screen2Words';

  public normalize(
    rawRecord: any,
    recordId?: string
  ): { sample: FullDesignSample | null; errors: string[] } {
    if (!rawRecord) return { sample: null, errors: ['Raw record is empty'] };

    const screenId = String(rawRecord.screenId || recordId || Date.now());
    const summaryText = rawRecord.summary || rawRecord.caption || 'Screen2Words Summary';

    const sampleId = `norm_screen2words_${screenId}_${Math.floor(Math.random() * 1000)}`;

    const provenance: ProvenanceData = {
      sourceType: 'external',
      sourceDataset: 'Screen2Words',
      sourceDatasetVersion: 'v1.0-screen2words',
      license: 'CC-BY-4.0 (Google Research)',
      collectionDate: new Date().toISOString(),
      transformationVersion: '1.0.0',
      sampleOrigin: 'Screen2Words Dataset (Google Research)'
    };

    const normalizedSample: FullDesignSample = {
      sampleId,
      datasetVersion: 'v1.0-screen2words',
      prompt: summaryText,
      sketch: {
        sceneGraphReference: `screen2words_${screenId}`,
        canvasObjects: [],
        objectTypes: [],
        positions: [],
        sizes: [],
        relationships: [],
        text: [summaryText],
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
        semanticTree: { summary: summaryText, screenId },
        recognitionConfidence: 1.0
      },
      intentTree: {
        semanticTree: null,
        intentTree: null,
        purpose: summaryText,
        priority: 'high',
        possibleVariants: [],
        ambiguityCandidates: [],
        confidence: 1.0
      },
      blueprintVariants: {
        intentTree: null,
        candidateBlueprintVariants: [],
        structuralStrategies: [],
        rankingScores: {},
        selectedBlueprint: null,
        rejectedBlueprints: [],
        selectionReason: summaryText
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
      codeGenerationReference: null,
      userSelections: null,
      userChanges: [],
      feedback: null,
      evaluation: {
        visualQuality: 80,
        uxQuality: 80,
        accessibility: 80,
        responsiveQuality: 80,
        typography: 80,
        spacing: 80,
        hierarchy: 80,
        consistency: 80,
        codeQuality: 80,
        overallQuality: 80,
        humanFeedback: 'Screen2Words Ground Truth Summary',
        machineEvaluation: null,
        finalRating: 80
      },
      finalDesign: null,
      provenance,
      qualityScore: 80,
      createdAt: new Date().toISOString(),
      trainingDataAllowed: true,
      category: 'ui_understanding',
      industry: 'Productivity',
      style: 'Minimal',
      sessionId: `external_session_screen2words_${screenId}`
    };

    return { sample: normalizedSample, errors: [] };
  }
}
