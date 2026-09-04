import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { TypedEventBus } from '../core/events/EventBus';
import { SceneGraph } from '../core/scene/SceneGraph';
import { ViewportEngine } from '../core/viewport/ViewportEngine';
import { HistoryEngine } from '../core/history/HistoryEngine';
import { SelectionEngine } from '../core/selection/SelectionEngine';
import { ToolManager } from '../core/tools/ToolManager';
import { InteractionEngine } from '../core/interaction/InteractionEngine';
import { CanvasRenderer } from '../core/renderer/CanvasRenderer';
import { SketchAnalyzer } from '../core/recognition/SketchAnalyzer';
import { RecognitionResult, IntentTree } from '../core/recognition/RecognitionTypes';
import { LayoutPlanner } from '../core/planning/LayoutPlanner';
import { LayoutBlueprint, RankedBlueprintVariant, VariantComparisonMatrix } from '../core/planning/BlueprintTypes';
import { VisualDesignEngine } from '../core/design/VisualDesignEngine';
import { VisualDesignModel, VisualDesignOption } from '../core/design/DesignTypes';
import { RenderEngine } from '../core/rendering/RenderEngine';
import { RenderTree } from '../core/rendering/RenderTree';
import { RenderPerformanceMetrics, RenderValidationResult, ViewportMode } from '../core/rendering/RenderingTypes';
import { KnowledgeEngine } from '../core/knowledge/KnowledgeEngine';
import { KnowledgeRecord, KnowledgeSearchQuery, KnowledgeSearchResult, KnowledgeStats, KnowledgeValidationResult, KnowledgeBundle, KnowledgeBundleRequest } from '../core/knowledge/KnowledgeTypes';
import { MLCore } from '../core/ml/MLCore';
import { PredictionBundle, RegisteredModel } from '../core/ml/MLTypes';
import { DatasetStats } from '../core/ml/datasets/DatasetStatistics';
import { AIOrchestrator } from '../core/ai/AIOrchestrator';
import { AIOrchestrationResult, AIProvider, AIStats } from '../core/ai/AITypes';
import { CodeGenerationEngine } from '../core/codegen/CodeGenerationEngine';
import { CodeGenProjectResult } from '../core/codegen/CodeGenerationTypes';
import { DesignFeedbackEngine } from '../core/learning/DesignFeedbackEngine';
import { AIDesignAgent } from '../core/agent/AIDesignAgent';
import { DatasetRegistry, DatasetSampleBuilder, DatasetExporter } from '../core/dataset';
import { MLIntelligenceEngine, MLTaskRegistry, MLTrainingScheduler, MLExperimentRegistry, MLModelRegistry, MLEvaluationEngine, MLPredictionEngine } from '../core/ml';
import { CoreEvent, ToolKind, Viewport, GridSettings, CanvasNode } from '../types';

export interface CoreEngineContextValue {
  eventBus: TypedEventBus;
  sceneGraph: SceneGraph;
  viewportEngine: ViewportEngine;
  historyEngine: HistoryEngine;
  selectionEngine: SelectionEngine;
  toolManager: ToolManager;
  interactionEngine: InteractionEngine;
  renderer: CanvasRenderer;
  sketchAnalyzer: SketchAnalyzer;
  layoutPlanner: LayoutPlanner;
  visualDesignEngine: VisualDesignEngine;
  renderEngine: RenderEngine;
  knowledgeEngine: KnowledgeEngine;
  mlCore: MLCore;
  aiOrchestrator: AIOrchestrator;
  codeGenerationEngine: CodeGenerationEngine;
  designFeedbackEngine: DesignFeedbackEngine;
  aiDesignAgent: AIDesignAgent;
  datasetRegistry: DatasetRegistry;
  datasetSampleBuilder: DatasetSampleBuilder;
  datasetExporter: DatasetExporter;
  mlIntelligenceEngine: MLIntelligenceEngine;
  mlTaskRegistry: MLTaskRegistry;
  mlTrainingJobManager: MLTrainingScheduler;
  mlExperimentRegistry: MLExperimentRegistry;
  mlModelRegistry: MLModelRegistry;
  mlEvaluationEngine: MLEvaluationEngine;
  mlPredictionEngine: MLPredictionEngine;
}

const CoreContext = createContext<CoreEngineContextValue | null>(null);

export function useCoreInstance(): CoreEngineContextValue {
  const instanceRef = useRef<CoreEngineContextValue | null>(null);

  if (!instanceRef.current) {
    const eventBus = new TypedEventBus();
    const sceneGraph = new SceneGraph(eventBus);
    const viewportEngine = new ViewportEngine(eventBus);
    const historyEngine = new HistoryEngine(eventBus);
    const selectionEngine = new SelectionEngine(sceneGraph, eventBus, historyEngine);
    const toolManager = new ToolManager(sceneGraph, selectionEngine, historyEngine, viewportEngine, eventBus);
    const interactionEngine = new InteractionEngine(viewportEngine, toolManager);
    const renderer = new CanvasRenderer(sceneGraph, viewportEngine, selectionEngine, toolManager);
    const sketchAnalyzer = new SketchAnalyzer(sceneGraph, eventBus);

    renderer.setSketchAnalyzer(sketchAnalyzer);

    instanceRef.current = {
      eventBus,
      sceneGraph,
      viewportEngine,
      historyEngine,
      selectionEngine,
      toolManager,
      interactionEngine,
      renderer,
      sketchAnalyzer,
      layoutPlanner: sketchAnalyzer.getLayoutPlanner(),
      visualDesignEngine: sketchAnalyzer.getVisualDesignEngine(),
      renderEngine: sketchAnalyzer.getRenderEngine(),
      knowledgeEngine: sketchAnalyzer.getKnowledgeEngine(),
      mlCore: sketchAnalyzer.getMLCore(),
      aiOrchestrator: sketchAnalyzer.getAIOrchestrator(),
      codeGenerationEngine: sketchAnalyzer.getCodeGenerationEngine(),
      designFeedbackEngine: sketchAnalyzer.getDesignFeedbackEngine(),
      aiDesignAgent: sketchAnalyzer.getAIDesignAgent(),
      datasetRegistry: sketchAnalyzer.getDatasetRegistry(),
      datasetSampleBuilder: sketchAnalyzer.getDatasetSampleBuilder(),
      datasetExporter: sketchAnalyzer.getDatasetExporter(),
      mlIntelligenceEngine: sketchAnalyzer.getMLIntelligenceEngine(),
      mlTaskRegistry: sketchAnalyzer.getMLIntelligenceEngine().getTaskRegistry(),
      mlTrainingJobManager: sketchAnalyzer.getMLIntelligenceEngine().getTrainingScheduler(),
      mlExperimentRegistry: sketchAnalyzer.getMLIntelligenceEngine().getExperimentRegistry(),
      mlModelRegistry: sketchAnalyzer.getMLIntelligenceEngine().getModelRegistry(),
      mlEvaluationEngine: sketchAnalyzer.getMLIntelligenceEngine().getEvaluationEngine(),
      mlPredictionEngine: sketchAnalyzer.getMLIntelligenceEngine().getPredictionEngine()
    };
  }

  return instanceRef.current;
}

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const core = useCoreInstance();
  return <CoreContext.Provider value={core}>{children}</CoreContext.Provider>;
};

export function useCore(): CoreEngineContextValue {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error('useCore must be used within a CoreProvider');
  }
  return context;
}

export function useActiveTool(): [ToolKind, (tool: ToolKind) => void] {
  const { toolManager, eventBus } = useCore();
  const [activeTool, setActiveToolState] = useState<ToolKind>(toolManager.getActiveToolKind());

  useEffect(() => {
    return eventBus.on(CoreEvent.TOOL_CHANGED, ({ tool }) => {
      setActiveToolState(tool);
    });
  }, [eventBus, toolManager]);

  const setTool = (tool: ToolKind) => toolManager.setTool(tool);
  return [activeTool, setTool];
}

export function useViewport(): Viewport {
  const { viewportEngine, eventBus } = useCore();
  const [viewport, setViewport] = useState<Viewport>(viewportEngine.getViewport());

  useEffect(() => {
    return eventBus.on(CoreEvent.VIEWPORT_CHANGED, ({ viewport: vp }) => {
      setViewport(vp);
    });
  }, [eventBus, viewportEngine]);

  return viewport;
}

export function useHistoryState(): { canUndo: boolean; canRedo: boolean } {
  const { historyEngine, eventBus } = useCore();
  const [state, setState] = useState({
    canUndo: historyEngine.canUndo(),
    canRedo: historyEngine.canRedo()
  });

  useEffect(() => {
    return eventBus.on(CoreEvent.HISTORY_CHANGED, ({ canUndo, canRedo }) => {
      setState({ canUndo, canRedo });
    });
  }, [eventBus, historyEngine]);

  return state;
}

export function useGridSettings(): [GridSettings, (settings: Partial<GridSettings>) => void] {
  const { toolManager, eventBus } = useCore();
  const [grid, setGrid] = useState<GridSettings>(toolManager.getGridSettings());

  useEffect(() => {
    return eventBus.on(CoreEvent.GRID_CHANGED, ({ grid: g }) => {
      setGrid(g);
    });
  }, [eventBus, toolManager]);

  const updateGrid = (settings: Partial<GridSettings>) => toolManager.setGridSettings(settings);
  return [grid, updateGrid];
}

export function useSelectedNode(): CanvasNode | null {
  const { selectionEngine, sceneGraph, eventBus } = useCore();
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(selectionEngine.getSelectedNode());

  useEffect(() => {
    const unsubSelection = eventBus.on(CoreEvent.SELECTION_CHANGED, () => {
      setSelectedNode(selectionEngine.getSelectedNode());
    });
    const unsubUpdated = eventBus.on(CoreEvent.NODE_UPDATED, ({ node }) => {
      if (selectionEngine.getSelectedUuid() === node.uuid) {
        setSelectedNode(node);
      }
    });
    return () => {
      unsubSelection();
      unsubUpdated();
    };
  }, [eventBus, selectionEngine, sceneGraph]);

  return selectedNode;
}

export function useRecognitionResult(): RecognitionResult | null {
  const { sketchAnalyzer, eventBus } = useCore();
  const [result, setResult] = useState<RecognitionResult | null>(sketchAnalyzer.getResult());

  useEffect(() => {
    const unsubFinished = eventBus.on(CoreEvent.RECOGNITION_FINISHED, ({ result: res }) => {
      setResult(res);
    });
    return () => {
      unsubFinished();
    };
  }, [eventBus, sketchAnalyzer]);

  return result;
}

export function useIntentTree(): IntentTree | null {
  const { sketchAnalyzer, eventBus } = useCore();
  const [tree, setTree] = useState<IntentTree | null>(sketchAnalyzer.getIntentTree());

  useEffect(() => {
    const unsubUpdated = eventBus.on(CoreEvent.INTENT_TREE_UPDATED, ({ tree: t }) => {
      setTree(t);
    });
    return () => {
      unsubUpdated();
    };
  }, [eventBus, sketchAnalyzer]);

  return tree;
}

export function useLayoutBlueprint(): LayoutBlueprint | null {
  const { sketchAnalyzer, eventBus } = useCore();
  const [blueprint, setBlueprint] = useState<LayoutBlueprint | null>(sketchAnalyzer.getBlueprint());

  useEffect(() => {
    const unsubUpdated = eventBus.on(CoreEvent.BLUEPRINT_UPDATED, ({ blueprint: bp }) => {
      setBlueprint(bp);
    });
    const unsubFinished = eventBus.on(CoreEvent.BLUEPRINT_FINISHED, ({ blueprint: bp }) => {
      setBlueprint(bp);
    });
    return () => {
      unsubUpdated();
      unsubFinished();
    };
  }, [eventBus, sketchAnalyzer]);

  return blueprint;
}

export function useBlueprintVariants(): {
  rankedVariants: RankedBlueprintVariant[];
  comparisonMatrix: VariantComparisonMatrix | null;
  activeVariantId: string | null;
  selectVariant: (variantId: string) => void;
} {
  const { layoutPlanner, eventBus } = useCore();
  const [state, setState] = useState({
    rankedVariants: layoutPlanner.getRankedVariants(),
    comparisonMatrix: layoutPlanner.getComparisonMatrix(),
    activeVariantId: layoutPlanner.getActiveVariantId()
  });

  useEffect(() => {
    const unsubRanked = eventBus.on(CoreEvent.BLUEPRINT_RANKED, () => {
      setState({
        rankedVariants: layoutPlanner.getRankedVariants(),
        comparisonMatrix: layoutPlanner.getComparisonMatrix(),
        activeVariantId: layoutPlanner.getActiveVariantId()
      });
    });
    return () => {
      unsubRanked();
    };
  }, [eventBus, layoutPlanner]);

  const selectVariant = (variantId: string) => {
    layoutPlanner.selectVariant(variantId);
  };

  return {
    rankedVariants: state.rankedVariants,
    comparisonMatrix: state.comparisonMatrix,
    activeVariantId: state.activeVariantId,
    selectVariant
  };
}

export function useVisualDesignModel(): {
  model: VisualDesignModel | null;
  selectedOptionId: string;
  activeOption: VisualDesignOption | null;
  selectOption: (optionId: string) => void;
} {
  const { visualDesignEngine, sketchAnalyzer, eventBus } = useCore();
  const [model, setModel] = useState<VisualDesignModel | null>(sketchAnalyzer.getVisualDesignModel());

  useEffect(() => {
    const unsubUpdated = eventBus.on(CoreEvent.VISUAL_DESIGN_UPDATED, ({ model: m }) => {
      setModel(m);
    });
    const unsubFinished = eventBus.on(CoreEvent.VISUAL_DESIGN_FINISHED, ({ model: m }) => {
      setModel(m);
    });
    return () => {
      unsubUpdated();
      unsubFinished();
    };
  }, [eventBus, sketchAnalyzer]);

  const selectOption = (optionId: string) => {
    const updated = visualDesignEngine.selectOption(optionId);
    if (updated) {
      setModel(updated);
    }
  };

  return {
    model,
    selectedOptionId: model?.selectedOptionId || visualDesignEngine.getSelectedOptionId(),
    activeOption: model?.activeOption || null,
    selectOption
  };
}

export function useRenderEngine(): {
  tree: RenderTree | null;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  metrics: RenderPerformanceMetrics;
  validation: RenderValidationResult;
} {
  const { renderEngine, eventBus } = useCore();
  const [tree, setTree] = useState<RenderTree | null>(renderEngine.getTree());
  const [viewportMode, setViewportModeState] = useState<ViewportMode>(renderEngine.getViewportMode());
  const [metrics, setMetrics] = useState<RenderPerformanceMetrics>(renderEngine.getMetrics());
  const [validation, setValidation] = useState<RenderValidationResult>(renderEngine.getValidation());

  useEffect(() => {
    const unsubUpdated = eventBus.on(CoreEvent.RENDER_UPDATED, ({ tree: t }) => {
      setTree(t);
      setMetrics(renderEngine.getMetrics());
      setValidation(renderEngine.getValidation());
    });
    const unsubFinished = eventBus.on(CoreEvent.RENDER_FINISHED, ({ tree: t, metrics: m }) => {
      setTree(t);
      setMetrics(m);
      setValidation(renderEngine.getValidation());
    });
    return () => {
      unsubUpdated();
      unsubFinished();
    };
  }, [eventBus, renderEngine]);

  const setViewportMode = (mode: ViewportMode) => {
    setViewportModeState(mode);
    renderEngine.setViewportMode(mode);
  };

  return {
    tree,
    viewportMode,
    setViewportMode,
    metrics,
    validation
  };
}

export function useKnowledgeEngine(): {
  records: KnowledgeRecord[];
  stats: KnowledgeStats;
  validation: KnowledgeValidationResult;
  search: (query: KnowledgeSearchQuery) => KnowledgeSearchResult[];
  createBundle: (request: KnowledgeBundleRequest) => KnowledgeBundle;
  knowledgeEngine: KnowledgeEngine;
} {
  const { knowledgeEngine, eventBus } = useCore();
  const [records, setRecords] = useState<KnowledgeRecord[]>(knowledgeEngine.getAllRecords());
  const [stats, setStats] = useState<KnowledgeStats>(knowledgeEngine.getStats());
  const [validation, setValidation] = useState<KnowledgeValidationResult>(knowledgeEngine.validate());

  useEffect(() => {
    const refresh = () => {
      setRecords(knowledgeEngine.getAllRecords());
      setStats(knowledgeEngine.getStats());
      setValidation(knowledgeEngine.validate());
    };

    const unsubLoaded = eventBus.on(CoreEvent.KNOWLEDGE_LOADED, refresh);
    const unsubUpdated = eventBus.on(CoreEvent.KNOWLEDGE_UPDATED, refresh);
    const unsubValidated = eventBus.on(CoreEvent.KNOWLEDGE_VALIDATED, ({ validation: v }) => {
      setValidation(v);
    });

    return () => {
      unsubLoaded();
      unsubUpdated();
      unsubValidated();
    };
  }, [eventBus, knowledgeEngine]);

  const search = (query: KnowledgeSearchQuery) => knowledgeEngine.search(query);
  const createBundle = (req: KnowledgeBundleRequest) => knowledgeEngine.createBundle(req);

  return {
    records,
    stats,
    validation,
    search,
    createBundle,
    knowledgeEngine
  };
}

export function useMLEngine(): {
  models: RegisteredModel[];
  predictionBundle: PredictionBundle | null;
  datasetStats: DatasetStats;
  mlCore: MLCore;
} {
  const { mlCore, eventBus } = useCore();
  const [models, setModels] = useState<RegisteredModel[]>(mlCore.getModelRegistry().getAllModels());
  const [predictionBundle, setPredictionBundle] = useState<PredictionBundle | null>(mlCore.getLastPredictionBundle());
  const [datasetStats, setDatasetStats] = useState<DatasetStats>(mlCore.getDatasetRegistry().getStats());

  useEffect(() => {
    const refresh = () => {
      setModels(mlCore.getModelRegistry().getAllModels());
      setPredictionBundle(mlCore.getLastPredictionBundle());
      setDatasetStats(mlCore.getDatasetRegistry().getStats());
    };

    const unsubModel = eventBus.on(CoreEvent.MODEL_LOADED, refresh);
    const unsubPred = eventBus.on(CoreEvent.PREDICTION_FINISHED, ({ bundle }) => {
      setPredictionBundle(bundle);
      setModels(mlCore.getModelRegistry().getAllModels());
    });
    const unsubDs = eventBus.on(CoreEvent.DATASET_UPDATED, refresh);

    return () => {
      unsubModel();
      unsubPred();
      unsubDs();
    };
  }, [eventBus, mlCore]);

  return {
    models,
    predictionBundle,
    datasetStats,
    mlCore
  };
}

export function useAIOrchestrator(): {
  providers: AIProvider[];
  activeProviderId: string;
  setActiveProvider: (id: string) => void;
  stats: AIStats;
  lastResult: AIOrchestrationResult | null;
  orchestrate: (prompt?: string) => Promise<AIOrchestrationResult>;
  aiOrchestrator: AIOrchestrator;
} {
  const { aiOrchestrator, sketchAnalyzer, knowledgeEngine, mlCore, eventBus } = useCore();
  const [activeProviderId, setActiveProviderId] = useState<string>(aiOrchestrator.getProviderRegistry().getActiveProviderId());
  const [stats, setStats] = useState<AIStats>(aiOrchestrator.getStats());
  const [lastResult, setLastResult] = useState<AIOrchestrationResult | null>(aiOrchestrator.getLastResult());

  useEffect(() => {
    const refresh = () => {
      setActiveProviderId(aiOrchestrator.getProviderRegistry().getActiveProviderId());
      setStats(aiOrchestrator.getStats());
      setLastResult(aiOrchestrator.getLastResult());
    };

    const unsubReq = eventBus.on(CoreEvent.AI_REQUEST_FINISHED, refresh);
    const unsubProv = eventBus.on(CoreEvent.AI_PROVIDER_CHANGED, refresh);
    const unsubDec = eventBus.on(CoreEvent.AI_DECISION_CREATED, refresh);

    return () => {
      unsubReq();
      unsubProv();
      unsubDec();
    };
  }, [eventBus, aiOrchestrator]);

  const setActiveProvider = (id: string) => {
    aiOrchestrator.setActiveProvider(id);
    setActiveProviderId(id);
  };

  const orchestrate = async (promptText?: string) => {
    const recResult = sketchAnalyzer.getResult();
    const semTree = sketchAnalyzer.getSemanticTree();
    const intentTree = sketchAnalyzer.getIntentTree();
    const bp = sketchAnalyzer.getBlueprint();
    const vdModel = sketchAnalyzer.getVisualDesignModel();

    let kbBundle = null;
    if (knowledgeEngine) {
      kbBundle = knowledgeEngine.createBundle({ intent: 'dashboard' });
    }

    const predBundle = mlCore ? mlCore.getLastPredictionBundle() : null;

    const res = await aiOrchestrator.orchestrate({
      userPrompt: promptText,
      recognitionResult: recResult,
      semanticTree: semTree,
      intentTree: intentTree,
      blueprint: bp,
      visualDesignModel: vdModel,
      knowledgeBundle: kbBundle,
      predictionBundle: predBundle
    });

    setLastResult(res);
    setStats(aiOrchestrator.getStats());
    return res;
  };

  return {
    providers: aiOrchestrator.getProviderRegistry().listProviders(),
    activeProviderId,
    setActiveProvider,
    stats,
    lastResult,
    orchestrate,
    aiOrchestrator
  };
}

/** useCodeGenerator — access Code Generation Engine and trigger generation */
export function useCodeGenerator() {
  const core = useContext(CoreContext);
  if (!core) throw new Error('useCodeGenerator must be used within CoreContextProvider');

  const { codeGenerationEngine } = core;
  const [lastResult, setLastResult] = useState<CodeGenProjectResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Resolve latest visual model and render tree from the analyzer
      const analyzer = core.sketchAnalyzer;
      const visualModel = (analyzer as any).currentResult?.visualDesignModel || null;
      const renderTree = (analyzer as any).currentResult?.renderTree || null;

      const result = await codeGenerationEngine.generate(visualModel, renderTree);
      setLastResult(result);
      return result;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    codeGenerationEngine,
    lastResult,
    isGenerating,
    error,
    generate
  };
}

/** useLearningEngine — access Phase 10 Continuous Learning Platform state and actions */
export function useLearningEngine() {
  const core = useContext(CoreContext);
  if (!core) throw new Error('useLearningEngine must be used within CoreContextProvider');

  const { designFeedbackEngine, eventBus } = core;
  const [stats, setStats] = useState(() => designFeedbackEngine.getStatistics());
  const [samples, setSamples] = useState(() => designFeedbackEngine.getAllSamples());

  useEffect(() => {
    const refresh = () => {
      setStats(designFeedbackEngine.getStatistics());
      setSamples(designFeedbackEngine.getAllSamples());
    };

    const unsubFeedback = eventBus.on(CoreEvent.FEEDBACK_RECEIVED, refresh);
    const unsubChange = eventBus.on(CoreEvent.DESIGN_CHANGE_RECORDED, refresh);
    const unsubSelect = eventBus.on(CoreEvent.DESIGN_SELECTED, refresh);
    const unsubEval = eventBus.on(CoreEvent.EVALUATION_FINISHED, refresh);
    const unsubSample = eventBus.on(CoreEvent.LEARNING_SAMPLE_CREATED, refresh);
    const unsubApproved = eventBus.on(CoreEvent.LEARNING_SAMPLE_APPROVED, refresh);
    const unsubExport = eventBus.on(CoreEvent.DATASET_EXPORTED, refresh);

    return () => {
      unsubFeedback();
      unsubChange();
      unsubSelect();
      unsubEval();
      unsubSample();
      unsubApproved();
      unsubExport();
    };
  }, [eventBus, designFeedbackEngine]);

  return {
    designFeedbackEngine,
    stats,
    samples,
    changes: designFeedbackEngine.getChanges(),
    sessions: designFeedbackEngine.getSessions(),
    submitRating: (designId: string, rating: 1 | 2 | 3 | 4 | 5, optionId?: string) =>
      designFeedbackEngine.submitRating(designId, rating, optionId),
    submitExplicitFeedback: (
      designId: string,
      kind: any,
      value: any,
      comment?: string,
      reason?: any,
      targetElementId?: string
    ) => designFeedbackEngine.submitExplicitFeedback(designId, kind, value, comment, reason, targetElementId),
    setSampleStatus: (sampleId: string, status: any) => designFeedbackEngine.setSampleStatus(sampleId, status),
    createDatasetVersion: (version: string, threshold?: number) =>
      designFeedbackEngine.createDatasetVersion(version, threshold),
    exportDataset: (format: any, version?: string) => designFeedbackEngine.exportDataset(format, version)
  };
}

export function useAIDesignAgent() {
  const { eventBus, sketchAnalyzer } = useCore();
  const agent = sketchAnalyzer.getAIDesignAgent();
  const [agentStatus, setAgentStatus] = useState(agent.getState().agentStatus);
  const [stats, setStats] = useState(agent.getStatistics());

  useEffect(() => {
    const refresh = () => {
      setAgentStatus(agent.getState().agentStatus);
      setStats(agent.getStatistics());
    };

    const unsubs = [
      eventBus.on(CoreEvent.AGENT_SESSION_STARTED, refresh),
      eventBus.on(CoreEvent.AGENT_INTENT_DETECTED, refresh),
      eventBus.on(CoreEvent.AGENT_PLAN_CREATED, refresh),
      eventBus.on(CoreEvent.AGENT_DESIGN_PROPOSED, refresh),
      eventBus.on(CoreEvent.AGENT_ALTERNATIVES_CREATED, refresh),
      eventBus.on(CoreEvent.AGENT_CHANGE_APPROVED, refresh),
      eventBus.on(CoreEvent.AGENT_CHANGE_REJECTED, refresh),
      eventBus.on(CoreEvent.AGENT_CHANGE_APPLIED, refresh),
      eventBus.on(CoreEvent.AGENT_CODE_REQUESTED, refresh),
      eventBus.on(CoreEvent.AGENT_FAILED, refresh)
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [eventBus, agent]);

  return {
    agent,
    status: agentStatus,
    stats,
    sendPrompt: (prompt: string, selectedNodeId?: string) => agent.sendPrompt(prompt, selectedNodeId),
    analyzeSketch: () => agent.analyzeSketch(),
    proposeDesign: (prompt?: string) => agent.sendPrompt(prompt || 'Propose design improvements'),
    generateAlternatives: (count?: number) => agent.generateAlternatives(count),
    selectAlternative: (variantId: string) => agent.selectAlternative(variantId),
    approveChange: (changeId: string) => agent.approveChange(changeId),
    rejectChange: (changeId: string, reason?: string) => agent.rejectChange(changeId, reason),
    applyChange: (changeId: string) => agent.applyChange(changeId),
    undo: () => agent.undo(),
    redo: () => agent.redo(),
    generateCode: () => agent.generateCode()
  };
}

export function useDatasetPlatform() {
  const core = useContext(CoreContext);
  if (!core) throw new Error('useDatasetPlatform must be used within CoreContextProvider');

  const { datasetRegistry, datasetSampleBuilder, datasetExporter, sceneGraph, viewportEngine } = core;
  const [samples, setSamples] = useState(() => datasetRegistry.getAllSamples());
  const [metadata, setMetadata] = useState(() => datasetRegistry.getMetadata());
  const [statsSummary, setStatsSummary] = useState(() => datasetRegistry.getStatisticsSummary());

  const refresh = useCallback(() => {
    setSamples(datasetRegistry.getAllSamples());
    setMetadata(datasetRegistry.getMetadata());
    setStatsSummary(datasetRegistry.getStatisticsSummary());
  }, [datasetRegistry]);

  const captureCurrentWorkflowSample = (
    prompt: string,
    trainingDataAllowed: boolean = true,
    category?: any,
    industry?: any,
    style?: any
  ) => {
    const analyzer = core.sketchAnalyzer;
    const currentRes = (analyzer as any).currentResult || {};
    const nodes = sceneGraph.getNodes();
    const viewport = viewportEngine.getViewport();

    const sample = datasetSampleBuilder.buildFullDesignSample({
      prompt: prompt || 'User interactive design session',
      nodes,
      viewport,
      semanticTree: currentRes.semanticTree,
      intentTree: currentRes.intentTree,
      blueprintVariants: currentRes.layoutBlueprint ? [currentRes.layoutBlueprint] : [],
      selectedBlueprint: currentRes.layoutBlueprint,
      visualDesignModel: currentRes.visualDesignModel,
      renderTree: currentRes.renderTree,
      trainingDataAllowed,
      category,
      industry,
      style
    });

    datasetRegistry.addSample(sample);
    refresh();
    return sample;
  };

  const importExternalDataset = (sourceName: string, itemsCount: number = 5) => {
    const normalizer = datasetRegistry.getNormalizer();
    const config = {
      sourceName,
      sourceVersion: 'v1.0',
      license: sourceName === 'DesignBench' ? 'MIT' : 'CC-BY-4.0',
      isEvaluationOnly: sourceName === 'DesignBench'
    };

    const mockRawItems = Array.from({ length: itemsCount }).map((_, idx) => ({
      id: `${sourceName.toLowerCase()}_sample_${idx + 1}`,
      prompt: `${sourceName} external benchmark layout pattern #${idx + 1}`,
      elements: [{ kind: 'rectangle', position: { x: 10, y: 10 }, size: { width: 300, height: 200 } }],
      qualityScore: 85 + (idx % 10)
    }));

    const records = normalizer.registerRawExternal(config, mockRawItems);
    for (const rec of records) {
      const { sample } = normalizer.normalizeExternalRecord(rec, config);
      if (sample) {
        datasetRegistry.addSample(sample);
      }
    }
    refresh();
  };

  const createVersionRelease = (versionTag: string) => {
    const release = datasetRegistry.createVersionRelease(versionTag);
    refresh();
    return release;
  };

  const exportDataset = (format: 'json' | 'jsonl' | 'csv', version?: string) => {
    let targetSamples = samples;
    if (version) {
      targetSamples = datasetRegistry.samplesByVersion(version);
    }

    let content = '';
    let ext = 'json';
    let mime = 'application/json';

    if (format === 'jsonl') {
      content = datasetExporter.exportJSONL(targetSamples);
      ext = 'jsonl';
      mime = 'application/x-jsonlines';
    } else if (format === 'csv') {
      content = datasetExporter.exportCSV(targetSamples);
      ext = 'csv';
      mime = 'text/csv';
    } else {
      content = datasetExporter.exportJSON(targetSamples);
      ext = 'json';
      mime = 'application/json';
    }

    datasetExporter.downloadFile(content, `ai_ui_dataset_${Date.now()}.${ext}`, mime);
  };

  return {
    datasetRegistry,
    datasetSampleBuilder,
    datasetExporter,
    samples,
    metadata,
    statsSummary,
    splits: datasetRegistry.generateSplits(),
    versions: datasetRegistry.getVersioning().getAllVersions(),
    captureCurrentWorkflowSample,
    importExternalDataset,
    createVersionRelease,
    exportDataset,
    refresh
  };
}

export function useMLIntelligence() {
  const core = useContext(CoreContext);
  if (!core) throw new Error('useMLIntelligence must be used within CoreContextProvider');

  const {
    mlIntelligenceEngine,
    mlTaskRegistry,
    mlTrainingJobManager,
    mlExperimentRegistry,
    mlModelRegistry,
    mlEvaluationEngine,
    mlPredictionEngine,
    datasetRegistry
  } = core;

  const [tasks, setTasks] = useState(mlTaskRegistry.getAllTasks());
  const [jobs, setJobs] = useState(mlTrainingJobManager.getAllJobs());
  const [experiments, setExperiments] = useState(mlExperimentRegistry.getAllExperiments());
  const [models, setModels] = useState(mlModelRegistry.getAllModels());
  const [stats, setStats] = useState(mlIntelligenceEngine.getStatistics());

  const refresh = () => {
    setTasks(mlTaskRegistry.getAllTasks());
    setJobs(mlTrainingJobManager.getAllJobs());
    setExperiments(mlExperimentRegistry.getAllExperiments());
    setModels(mlModelRegistry.getAllModels());
    setStats(mlIntelligenceEngine.getStatistics());
  };

  const validateTaskGate = (taskId: any) => {
    const adapter = mlIntelligenceEngine.getDatasetAdapter();
    const gate = mlIntelligenceEngine.getValidationGate();
    const splits = datasetRegistry.generateSplits();
    const ver = adapter?.getDatasetVersion() || 'v0.1';
    return gate.validateTaskForTraining(taskId, splits, ver);
  };

  const extractFeaturesForTask = (taskId: any) => {
    const samples = datasetRegistry.getApprovedSamples();
    const extractor = mlIntelligenceEngine.getFeatureExtractor();
    const normalizer = mlIntelligenceEngine.getFeatureNormalizer();
    const task = mlTaskRegistry.getTask(taskId);

    const featureVectors = samples.map((s) => {
      const rawVector = extractor.extractFeatures(s, task?.requiredFeatureGroups as any);
      return normalizer.normalizeVector(rawVector);
    });

    mlTaskRegistry.updateTaskStatus(taskId, 'features_ready');
    refresh();
    return featureVectors;
  };

  const createBaselineForTask = (taskId: any) => {
    const baselineEngine = mlIntelligenceEngine.getBaselineEngine();
    const baseline = baselineEngine.createBaseline(taskId);
    mlTaskRegistry.updateTaskStatus(taskId, 'baseline_ready');
    refresh();
    return baseline;
  };

  const prepareTrainingJob = (taskId: any) => {
    const gate = validateTaskGate(taskId);
    if (gate.trainingStatus === 'blocked') {
      throw new Error(`Training blocked: ${gate.reasons.join(', ')}`);
    }

    const config = {
      task: taskId,
      datasetVersion: datasetRegistry.getMetadata().datasetVersion,
      featureGroups: (mlTaskRegistry.getTask(taskId)?.requiredFeatureGroups as any) || ['sketch_features'],
      label: 'target',
      modelType: 'Task-specific Candidate Model'
    };

    const job = mlTrainingJobManager.prepareJob(taskId, config.datasetVersion, config);
    mlTaskRegistry.updateTaskStatus(taskId, 'training_ready');
    refresh();
    return job;
  };

  const startTrainingJob = async (jobId: string) => {
    const job = await mlTrainingJobManager.startJob(jobId);
    refresh();
    return job;
  };

  const cancelTrainingJob = (jobId: string) => {
    const job = mlTrainingJobManager.cancelJob(jobId);
    refresh();
    return job;
  };

  const registerCandidateModel = (taskId: any, versionTag: string) => {
    const ver = datasetRegistry.getMetadata().datasetVersion;
    const model = mlModelRegistry.registerCandidateModel(taskId, versionTag, ver, 'v1.0', { modelType: 'Neural Baseline' });
    refresh();
    return model;
  };

  const evaluateCandidateModel = (modelId: string, taskId: any) => {
    const samples = datasetRegistry.getApprovedSamples();
    const encoder = mlIntelligenceEngine.getLabelEncoder();
    const labels = samples.map((s) => encoder.encodeLabel(s, taskId));
    const mockPreds = samples.map((_, i) => ({ value: labels[i]?.encodedValue }));

    const evalResult = mlEvaluationEngine.evaluateTask(modelId, taskId, 'v0.1', mockPreds, labels);
    mlModelRegistry.evaluateModel(modelId, evalResult.metrics);
    mlTaskRegistry.updateTaskStatus(taskId, 'evaluated');
    refresh();
    return evalResult;
  };

  const approveCandidateModel = (modelId: string, taskId: any) => {
    const model = mlModelRegistry.approveModel(modelId);
    mlTaskRegistry.updateTaskStatus(taskId, 'approved', modelId);
    refresh();
    return model;
  };

  const rejectCandidateModel = (modelId: string) => {
    const model = mlModelRegistry.rejectModel(modelId);
    refresh();
    return model;
  };

  return {
    mlIntelligenceEngine,
    tasks,
    jobs,
    experiments,
    models,
    stats,
    validateTaskGate,
    extractFeaturesForTask,
    createBaselineForTask,
    prepareTrainingJob,
    startTrainingJob,
    cancelTrainingJob,
    registerCandidateModel,
    evaluateCandidateModel,
    approveCandidateModel,
    rejectCandidateModel,
    predict: (taskId: any, input: any) => mlPredictionEngine.predict(taskId, input),
    getPredictionBundle: (taskId?: any, input?: any) => mlIntelligenceEngine.generatePredictionBundle(taskId, input),
    refresh
  };
}


