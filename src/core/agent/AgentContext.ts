export interface AgentContextPayload {
  userPrompt?: string;
  selectedNodeUuid?: string | null;
  selectedCanvasNodes?: any[];
  sceneGraphSnapshot?: any;
  semanticTree?: any;
  intentTree?: any;
  blueprintVariants?: any[];
  selectedBlueprint?: any;
  visualDesignModel?: any;
  renderTree?: any;
  knowledgeBundle?: any;
  predictionBundle?: any;
  aiDecision?: any;
  learningStats?: any;
  previousActions?: any[];
  userFeedbackHistory?: any[];
  timestamp: number;
}

export class AgentContextBuilder {
  public buildContext(params: Partial<AgentContextPayload>): AgentContextPayload {
    return {
      userPrompt: params.userPrompt || '',
      selectedNodeUuid: params.selectedNodeUuid || null,
      selectedCanvasNodes: params.selectedCanvasNodes || [],
      sceneGraphSnapshot: params.sceneGraphSnapshot || null,
      semanticTree: params.semanticTree || null,
      intentTree: params.intentTree || null,
      blueprintVariants: params.blueprintVariants || [],
      selectedBlueprint: params.selectedBlueprint || null,
      visualDesignModel: params.visualDesignModel || null,
      renderTree: params.renderTree || null,
      knowledgeBundle: params.knowledgeBundle || null,
      predictionBundle: params.predictionBundle || null,
      aiDecision: params.aiDecision || null,
      learningStats: params.learningStats || null,
      previousActions: params.previousActions || [],
      userFeedbackHistory: params.userFeedbackHistory || [],
      timestamp: Date.now()
    };
  }
}
