import { GeminiIntentPlanner } from '../GeminiIntentPlanner.js';
import { DatasetReferenceEngine } from '../../dataset/DatasetReferenceEngine.js';
import { UICompositionEngine } from '../../planning/UICompositionEngine.js';
import { SceneGraph } from '../../scene/SceneGraph.js';
import { TypedEventBus } from '../../events/EventBus.js';
import { UIIntelligenceService } from '../../ml/orchestration/UIIntelligenceService.js';
import { UIIntelligenceInputAdapter } from '../../ml/orchestration/UIIntelligenceInputAdapter.js';

export async function runGeminiUIIntegrationTest(): Promise<{ success: boolean; results: any[] }> {
  const eventBus = new TypedEventBus();
  const sceneGraph = new SceneGraph(eventBus);
  const compositionEngine = new UICompositionEngine();
  const referenceEngine = new DatasetReferenceEngine();
  const geminiPlanner = new GeminiIntentPlanner();
  const intelligenceService = new UIIntelligenceService();

  const promptsToTest = [
    'Create a SaaS dashboard',
    'Create an ecommerce homepage',
    'Create a portfolio website',
    'Create a login page',
    'Create a mobile banking app',
    'Create a dark analytics dashboard',
    'Create a restaurant website',
    'Create a modern landing page'
  ];

  const results: any[] = [];

  for (const prompt of promptsToTest) {
    // 1. Gemini Intent Understanding & UIGenerationSpec
    const spec = await geminiPlanner.planGenerationFromPrompt(prompt);
    if (!spec || !spec.productType || !spec.referenceQueries) {
      throw new Error(`Invalid UIGenerationSpec produced for prompt: "${prompt}"`);
    }

    // 2. Reference Retrieval Layer
    const refMatches = referenceEngine.searchReferencesByQueries(spec.referenceQueries);
    if (!refMatches || refMatches.length === 0) {
      throw new Error(`Reference layer returned 0 dataset matches for prompt: "${prompt}"`);
    }

    // 3. UI Composition Engine -> Canvas Nodes
    const nodes = compositionEngine.composeAndPopulateCanvas(sceneGraph, {
      uiGenerationSpec: spec
    });

    if (!nodes || nodes.length === 0) {
      throw new Error(`Composition Engine created 0 CanvasNodes for prompt: "${prompt}"`);
    }

    // 4. Governed ML Orchestration
    const canvasElements = nodes.map((n) => ({
      id: n.uuid,
      type: n.kind,
      bounds: { x: n.position.x, y: n.position.y, width: n.size.width, height: n.size.height },
      styles: { stroke: n.stroke, fill: n.fill }
    }));
    const req = UIIntelligenceInputAdapter.extractUIRepresentationFromCanvas(canvasElements, { width: 1200, height: 800 });
    const mlResult = intelligenceService.analyzeUI(req);

    if (!mlResult || mlResult.governanceReport.overallStatus !== 'GOVERNED_COMPLIANT') {
      throw new Error(`Governed ML pipeline failed for prompt: "${prompt}"`);
    }

    results.push({
      prompt,
      productType: spec.productType,
      referenceMatched: refMatches[0].id,
      nodeCount: nodes.length,
      mlApproved: mlResult.governanceReport.overallStatus === 'GOVERNED_COMPLIANT'
    });
  }

  // 5. Governance Boundary Verification
  const initialRegistryState = intelligenceService.analyzeUI(
    UIIntelligenceInputAdapter.extractUIRepresentationFromCanvas([], { width: 1200, height: 800 })
  );
  if (initialRegistryState.governanceReport.overallStatus !== 'GOVERNED_COMPLIANT') {
    throw new Error('Governed ML model registry integrity check failed');
  }

  return { success: true, results };
}
