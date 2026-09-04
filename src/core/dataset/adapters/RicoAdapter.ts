import { FullDesignSample, ProvenanceData } from '../DatasetTypes';
import { DatasetAdapterInterface } from '../inspection/DatasetInspectionTypes';

export class RicoAdapter implements DatasetAdapterInterface {
  public datasetName = 'RICO';

  public normalize(
    rawRecord: any,
    recordId?: string
  ): { sample: FullDesignSample | null; errors: string[] } {
    if (!rawRecord) return { sample: null, errors: ['Raw record is empty'] };

    const sampleId = `norm_rico_${recordId || rawRecord.request_id || rawRecord.screenId || Date.now()}`;
    const activityName = rawRecord.activity_name || rawRecord.activity?.root?.class || 'RICO Android Screen';

    const provenance: ProvenanceData = {
      sourceType: 'external',
      sourceDataset: 'RICO',
      sourceDatasetVersion: 'v1.0-rico',
      license: 'unknown',
      collectionDate: new Date().toISOString(),
      transformationVersion: '1.0.0',
      sampleOrigin: 'RICO Mobile UI Dataset'
    };

    const normalizedSample: FullDesignSample = {
      sampleId,
      datasetVersion: 'v1.0-rico',
      prompt: rawRecord.app_name ? `${rawRecord.app_name} Mobile Screen` : `RICO ${activityName}`,
      sketch: {
        sceneGraphReference: `rico_screen_${recordId || 'raw'}`,
        canvasObjects: this.extractCanvasObjects(rawRecord.activity?.root || rawRecord.root),
        objectTypes: ['container', 'button', 'text', 'image'],
        positions: [],
        sizes: [],
        relationships: [],
        text: this.extractTexts(rawRecord.activity?.root || rawRecord.root),
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
        semanticTree: { type: 'android_view_hierarchy', rootNodeClass: activityName },
        recognitionConfidence: 1.0
      },
      intentTree: {
        semanticTree: null,
        intentTree: null,
        purpose: 'RICO Mobile Screen Layout',
        priority: 'medium',
        possibleVariants: [],
        ambiguityCandidates: [],
        confidence: 0.7
      },
      blueprintVariants: {
        intentTree: null,
        candidateBlueprintVariants: [],
        structuralStrategies: [],
        rankingScores: {},
        selectedBlueprint: null,
        rejectedBlueprints: [],
        selectionReason: 'RICO external raw layout'
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
        visualQuality: 75,
        uxQuality: 75,
        accessibility: 75,
        responsiveQuality: 75,
        typography: 75,
        spacing: 75,
        hierarchy: 75,
        consistency: 75,
        codeQuality: 75,
        overallQuality: 75,
        humanFeedback: 'RICO External Imported Sample',
        machineEvaluation: null,
        finalRating: 75
      },
      finalDesign: null,
      provenance,
      qualityScore: 75,
      createdAt: new Date().toISOString(),
      trainingDataAllowed: true,
      category: 'ui_understanding',
      industry: 'Social',
      style: 'Minimal',
      sessionId: `external_session_rico_${recordId || 'default'}`
    };

    return { sample: normalizedSample, errors: [] };
  }

  private extractCanvasObjects(rootNode: any): any[] {
    if (!rootNode) return [];
    const objects: any[] = [];
    const traverse = (node: any) => {
      if (!node) return;
      if (node.bounds) {
        objects.push({
          id: `rico_node_${objects.length}`,
          type: node.class || 'view',
          bounds: node.bounds,
          text: node.text || null,
          clickable: Boolean(node.clickable)
        });
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };
    traverse(rootNode);
    return objects;
  }

  private extractTexts(rootNode: any): string[] {
    if (!rootNode) return [];
    const texts: string[] = [];
    const traverse = (node: any) => {
      if (!node) return;
      if (node.text && typeof node.text === 'string' && node.text.trim().length > 0) {
        texts.push(node.text.trim());
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) traverse(child);
      }
    };
    traverse(rootNode);
    return texts;
  }
}
