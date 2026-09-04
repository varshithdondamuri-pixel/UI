import { CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';
import { SceneGraph } from '../scene/SceneGraph';
import { IntentTreeBuilder } from './IntentTreeBuilder';
import { LayoutAnalyzer } from './LayoutAnalyzer';
import { LayoutPlanner } from '../planning/LayoutPlanner';
import { LayoutBlueprint } from '../planning/BlueprintTypes';
import { IntentTree, RecognitionResult, SemanticTree } from './RecognitionTypes';
import { RelationshipAnalyzer } from './RelationshipAnalyzer';
import { SemanticTreeBuilder } from './SemanticTreeBuilder';
import { ShapeRecognizer } from './ShapeRecognizer';
import { VisualDesignEngine } from '../design/VisualDesignEngine';
import { VisualDesignModel } from '../design/DesignTypes';
import { RenderEngine } from '../rendering/RenderEngine';
import { KnowledgeEngine } from '../knowledge/KnowledgeEngine';
import { MLCore } from '../ml/MLCore';
import { AIOrchestrator } from '../ai/AIOrchestrator';
import { CodeGenerationEngine } from '../codegen/CodeGenerationEngine';
import { DesignFeedbackEngine } from '../learning/DesignFeedbackEngine';
import { AIDesignAgent } from '../agent/AIDesignAgent';
import { DatasetRegistry, DatasetSampleBuilder, DatasetExporter } from '../dataset';
import { MLIntelligenceEngine } from '../ml/MLIntelligenceEngine';

export class SketchAnalyzer {
  private sceneGraph: SceneGraph;
  private eventBus: TypedEventBus;

  private shapeRecognizer: ShapeRecognizer;
  private relationshipAnalyzer: RelationshipAnalyzer;
  private layoutAnalyzer: LayoutAnalyzer;
  private semanticTreeBuilder: SemanticTreeBuilder;
  private intentTreeBuilder: IntentTreeBuilder;
  private layoutPlanner: LayoutPlanner;
  private visualDesignEngine: VisualDesignEngine;
  private renderEngine: RenderEngine;
  private knowledgeEngine: KnowledgeEngine;
  private mlCore: MLCore;
  private aiOrchestrator: AIOrchestrator;
  private codeGenerationEngine: CodeGenerationEngine;
  private designFeedbackEngine: DesignFeedbackEngine;
  private aiDesignAgent: AIDesignAgent;
  private datasetRegistry: DatasetRegistry;
  private datasetSampleBuilder: DatasetSampleBuilder;
  private datasetExporter: DatasetExporter;
  private mlIntelligenceEngine: MLIntelligenceEngine;

  private currentResult: RecognitionResult | null = null;
  private isAnalyzing: boolean = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(sceneGraph: SceneGraph, eventBus: TypedEventBus) {
    this.sceneGraph = sceneGraph;
    this.eventBus = eventBus;

    // Instantiate modular pipeline stages (independently replaceable)
    this.shapeRecognizer = new ShapeRecognizer();
    this.relationshipAnalyzer = new RelationshipAnalyzer();
    this.layoutAnalyzer = new LayoutAnalyzer();
    this.semanticTreeBuilder = new SemanticTreeBuilder();
    this.intentTreeBuilder = new IntentTreeBuilder();
    this.layoutPlanner = new LayoutPlanner(this.eventBus);
    this.visualDesignEngine = new VisualDesignEngine(this.eventBus);
    this.renderEngine = new RenderEngine(this.eventBus);
    this.knowledgeEngine = new KnowledgeEngine(this.eventBus);
    this.mlCore = new MLCore(this.eventBus);
    this.aiOrchestrator = new AIOrchestrator(this.eventBus);
    this.codeGenerationEngine = new CodeGenerationEngine(this.eventBus);
    this.designFeedbackEngine = new DesignFeedbackEngine(this.eventBus);
    this.aiDesignAgent = new AIDesignAgent(
      this.eventBus,
      this,
      this.layoutPlanner,
      this.visualDesignEngine,
      this.renderEngine,
      this.codeGenerationEngine,
      this.designFeedbackEngine
    );
    this.datasetRegistry = new DatasetRegistry();
    this.datasetSampleBuilder = new DatasetSampleBuilder();
    this.datasetExporter = new DatasetExporter();
    this.mlIntelligenceEngine = new MLIntelligenceEngine(this.eventBus, this.datasetRegistry);

    this.setupListeners();

    // Perform initial analysis
    this.scheduleAnalysis(0);
  }

  private setupListeners(): void {
    const triggerUpdate = () => this.scheduleAnalysis(100);

    this.eventBus.on(CoreEvent.NODE_CREATED, triggerUpdate);
    this.eventBus.on(CoreEvent.NODE_UPDATED, triggerUpdate);
    this.eventBus.on(CoreEvent.NODE_DELETED, triggerUpdate);
    this.eventBus.on(CoreEvent.SCENE_CLEARED, triggerUpdate);

    // Re-evaluate Visual Design Engine & Render Engine when active blueprint variant changes
    this.eventBus.on(CoreEvent.BLUEPRINT_UPDATED, ({ blueprint }) => {
      if (blueprint) {
        const visualDesignModel = this.visualDesignEngine.processBlueprint(blueprint);
        this.renderEngine.processModel(visualDesignModel);
        this.mlCore.processDesign(visualDesignModel, blueprint, null);
        if (this.currentResult) {
          this.currentResult.visualDesignModel = visualDesignModel;
        }
      }
    });

    // Re-evaluate Render Engine when visual design model option changes
    this.eventBus.on(CoreEvent.VISUAL_DESIGN_UPDATED, ({ model }) => {
      if (model) {
        this.renderEngine.processModel(model);
        this.mlCore.processDesign(model, this.getBlueprint(), null);
      }
    });
  }

  /**
   * Schedule debounced analysis execution.
   */
  public scheduleAnalysis(delayMs: number = 100): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.analyze();
    }, delayMs);
  }

  /**
   * Runs the complete Recognition & Planning Pipeline:
   * Scene Graph -> Shape Recognition -> Spatial Analysis -> Layout Analysis -> Semantic Tree -> Intent Tree -> Blueprint Variants -> Selected Blueprint -> Visual Design Model -> Render Tree -> Knowledge Platform -> ML Intelligence Layer -> Prediction Bundle -> Feedback & Evaluation Pipeline (Phase 10)
   * Strictly READ-ONLY operation on SceneGraph.
   */
  public analyze(): RecognitionResult {
    const startTime = Date.now();
    this.isAnalyzing = true;

    this.eventBus.emit(CoreEvent.RECOGNITION_STARTED, { timestamp: startTime });

    try {
      // READ SceneGraph nodes
      const nodes = this.sceneGraph.getNodes();

      // Stage 1: Shape Recognition & Text Association
      const { shapes, textAssociations } = this.shapeRecognizer.analyzeShapes(nodes);

      // Stage 2: Spatial Relationship Analysis
      const relationships = this.relationshipAnalyzer.analyzeRelationships(shapes, nodes);

      // Stage 3: Layout Structure Analysis
      const layouts = this.layoutAnalyzer.analyzeLayouts(shapes, relationships);

      // Stage 4: Semantic Tree Building
      const semanticTree = this.semanticTreeBuilder.buildSemanticTree(
        shapes,
        relationships,
        layouts,
        startTime
      );

      // Stage 5: Intent Tree Building
      this.eventBus.emit(CoreEvent.INTENT_ANALYSIS_STARTED, { timestamp: Date.now() });
      const intentTree = this.intentTreeBuilder.buildIntentTree(semanticTree);
      this.eventBus.emit(CoreEvent.INTENT_TREE_UPDATED, { tree: intentTree });
      this.eventBus.emit(CoreEvent.INTENT_ANALYSIS_FINISHED, { tree: intentTree });

      // Stage 6: Layout Blueprint Planning (Phase 3)
      const blueprint = this.layoutPlanner.planLayout(intentTree);

      // Stage 7: Visual Design Engine (Phase 4)
      const visualDesignModel = this.visualDesignEngine.processBlueprint(blueprint);

      // Stage 8: Design Rendering Engine (Phase 5)
      this.renderEngine.processModel(visualDesignModel);

      // Stage 9: ML Intelligence Layer (Phase 7)
      this.mlCore.processDesign(visualDesignModel, blueprint, null);

      const result: RecognitionResult = {
        shapes,
        textAssociations,
        relationships,
        layouts,
        semanticTree,
        intentTree,
        blueprint,
        visualDesignModel,
        timestamp: Date.now()
      };

      this.currentResult = result;
      this.isAnalyzing = false;

      // Stage 10: Continuous Learning Platform (Phase 10 Evaluation & Sample Creation)
      const designId = visualDesignModel?.selectedOptionId || visualDesignModel?.activeOption?.id || 'design_' + startTime;
      this.designFeedbackEngine.processDesignEvaluationAndSample(
        designId,
        'Generated canvas sketch design',
        { shapes },
        semanticTree,
        intentTree,
        blueprint,
        visualDesignModel,
        this.renderEngine.getTree(),
        null,
        this.mlCore.getLastPredictionBundle(),
        this.aiOrchestrator.getLastResult(),
        null
      );

      this.eventBus.emit(CoreEvent.RECOGNITION_FINISHED, { result });
      this.eventBus.emit(CoreEvent.SEMANTIC_TREE_UPDATED, { tree: semanticTree });

      return result;
    } catch (err: any) {
      this.isAnalyzing = false;
      const errorMsg = err?.message || 'Unknown recognition error';
      this.eventBus.emit(CoreEvent.RECOGNITION_FAILED, { error: errorMsg });
      throw err;
    }
  }

  /**
   * Returns current recognition result.
   */
  public getResult(): RecognitionResult | null {
    return this.currentResult;
  }

  /**
   * Returns current semantic tree.
   */
  public getSemanticTree(): SemanticTree | null {
    return this.currentResult?.semanticTree || null;
  }

  /**
   * Returns current intent tree.
   */
  public getIntentTree(): IntentTree | null {
    return this.currentResult?.intentTree || null;
  }

  /**
   * Returns current layout blueprint.
   */
  public getBlueprint(): LayoutBlueprint | null {
    return this.currentResult?.blueprint || this.layoutPlanner.getBlueprint();
  }

  /**
   * Returns current visual design model.
   */
  public getVisualDesignModel(): VisualDesignModel | null {
    return this.currentResult?.visualDesignModel || this.visualDesignEngine.getModel();
  }

  /**
   * Returns visual design engine instance.
   */
  public getVisualDesignEngine(): VisualDesignEngine {
    return this.visualDesignEngine;
  }

  /**
   * Returns render engine instance.
   */
  public getRenderEngine(): RenderEngine {
    return this.renderEngine;
  }

  /**
   * Returns knowledge engine instance.
   */
  public getKnowledgeEngine(): KnowledgeEngine {
    return this.knowledgeEngine;
  }

  /**
   * Returns ML core instance.
   */
  public getMLCore(): MLCore {
    return this.mlCore;
  }

  /**
   * Returns AI orchestrator instance.
   */
  public getAIOrchestrator(): AIOrchestrator {
    return this.aiOrchestrator;
  }

  /**
   * Returns the CodeGenerationEngine instance.
   */
  public getCodeGenerationEngine(): CodeGenerationEngine {
    return this.codeGenerationEngine;
  }

  /**
   * Returns the DesignFeedbackEngine instance (Phase 10).
   */
  public getDesignFeedbackEngine(): DesignFeedbackEngine {
    return this.designFeedbackEngine;
  }

  /**
   * Returns layout planner instance.
   */
  public getLayoutPlanner(): LayoutPlanner {
    return this.layoutPlanner;
  }

  /**
   * Returns the AIDesignAgent instance (Phase 11).
   */
  public getAIDesignAgent(): AIDesignAgent {
    return this.aiDesignAgent;
  }

  /**
   * Returns the DatasetRegistry instance.
   */
  public getDatasetRegistry(): DatasetRegistry {
    return this.datasetRegistry;
  }

  /**
   * Returns the DatasetSampleBuilder instance.
   */
  public getDatasetSampleBuilder(): DatasetSampleBuilder {
    return this.datasetSampleBuilder;
  }

  /**
   * Returns the DatasetExporter instance.
   */
  public getDatasetExporter(): DatasetExporter {
    return this.datasetExporter;
  }

  /**
   * Returns the MLIntelligenceEngine instance (Phase 12).
   */
  public getMLIntelligenceEngine(): MLIntelligenceEngine {
    return this.mlIntelligenceEngine;
  }

  /**
   * Check if analyzer is running.
   */
  public getIsAnalyzing(): boolean {
    return this.isAnalyzing;
  }
}


