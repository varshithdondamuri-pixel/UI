import { TypedEventBus } from '../events/EventBus';
import { SketchAnalyzer } from '../recognition/SketchAnalyzer';
import { LayoutPlanner } from '../planning/LayoutPlanner';
import { VisualDesignEngine } from '../design/VisualDesignEngine';
import { RenderEngine } from '../rendering/RenderEngine';
import { CodeGenerationEngine } from '../codegen/CodeGenerationEngine';
import { DesignFeedbackEngine } from '../learning/DesignFeedbackEngine';
import { HistoryEngine } from '../history/HistoryEngine';

import { AgentState } from './AgentState';
import { AgentIntentClassifier } from './AgentIntent';
import { AgentContextBuilder, AgentContextPayload } from './AgentContext';
import { AgentObserver } from './AgentObserver';
import { AgentMemory } from './AgentMemory';
import { AgentDecisionEngine } from './AgentDecisionEngine';
import { AgentChangeValidator } from './AgentChangeValidator';
import { AgentApprovalManager } from './AgentApprovalManager';
import { AgentAlternativeManager } from './AgentAlternativeManager';
import { AgentIterationManager } from './AgentIterationManager';
import { AgentDesignController } from './AgentDesignController';
import { AgentPlanner } from './AgentPlanner';
import { AgentExecutor } from './AgentExecutor';
import { AgentResponseFormatter } from './AgentResponse';
import { AgentEvents } from './AgentEvents';
import { AgentResponseSummary } from './AgentTypes';

export class AIDesignAgent {
  private state: AgentState;
  private intentClassifier: AgentIntentClassifier;
  private contextBuilder: AgentContextBuilder;
  private observer: AgentObserver;
  private memory: AgentMemory;
  private decisionEngine: AgentDecisionEngine;
  private validator: AgentChangeValidator;
  private approvalManager: AgentApprovalManager;
  private alternativeManager: AgentAlternativeManager;
  private iterationManager: AgentIterationManager;
  private controller: AgentDesignController;
  private planner: AgentPlanner;
  private executor: AgentExecutor;
  private responseFormatter: AgentResponseFormatter;
  private events: AgentEvents;

  private sketchAnalyzer: SketchAnalyzer;

  constructor(
    eventBus: TypedEventBus,
    sketchAnalyzer: SketchAnalyzer,
    layoutPlanner: LayoutPlanner,
    visualDesignEngine: VisualDesignEngine,
    renderEngine: RenderEngine,
    codeGenerationEngine: CodeGenerationEngine,
    designFeedbackEngine: DesignFeedbackEngine,
    historyEngine?: HistoryEngine
  ) {
    this.state = new AgentState();
    this.intentClassifier = new AgentIntentClassifier();
    this.contextBuilder = new AgentContextBuilder();
    this.observer = new AgentObserver();
    this.memory = new AgentMemory();
    this.decisionEngine = new AgentDecisionEngine();
    this.validator = new AgentChangeValidator();
    this.approvalManager = new AgentApprovalManager();
    this.alternativeManager = new AgentAlternativeManager();
    this.iterationManager = new AgentIterationManager();
    this.planner = new AgentPlanner();
    this.responseFormatter = new AgentResponseFormatter();
    this.events = new AgentEvents(eventBus);
    this.sketchAnalyzer = sketchAnalyzer;

    this.controller = new AgentDesignController(
      eventBus,
      sketchAnalyzer,
      layoutPlanner,
      visualDesignEngine,
      renderEngine,
      codeGenerationEngine,
      designFeedbackEngine,
      historyEngine
    );

    this.executor = new AgentExecutor(this.controller);
    this.events.emitSessionStarted(this.state.sessionId);
  }

  public getState(): AgentState {
    return this.state;
  }

  public getMemory(): AgentMemory {
    return this.memory;
  }

  public getIterationManager(): AgentIterationManager {
    return this.iterationManager;
  }

  public getAlternativeManager(): AgentAlternativeManager {
    return this.alternativeManager;
  }

  public getApprovalManager(): AgentApprovalManager {
    return this.approvalManager;
  }

  public async sendPrompt(prompt: string, selectedNodeId?: string): Promise<AgentResponseSummary> {
    this.state.setStatus('understanding');
    this.memory.recordInstruction(prompt);

    const contextPayload = this.buildCurrentContext(prompt, selectedNodeId);
    this.events.emitContextBuilt(contextPayload);

    const intent = this.intentClassifier.classify(prompt, contextPayload.sceneGraphSnapshot?.nodes?.length > 0, selectedNodeId);
    this.state.currentIntent = intent.type;
    this.events.emitIntentDetected(intent);

    const plan = this.planner.createPlan(intent);
    this.events.emitPlanCreated(plan);

    this.state.setStatus('planning');
    const execResult = await this.executor.executePlan(plan, contextPayload);

    if (!execResult.success) {
      this.state.setStatus('failed');
      this.events.emitFailed(execResult.error || 'Execution failed');
      return this.responseFormatter.formatResponse(
        prompt,
        [],
        [],
        'failed',
        this.iterationManager.getCurrentVersion()?.version || 'v1.0.0'
      );
    }

    if (intent.type === 'GENERATE_CODE') {
      this.events.emitCodeRequested('react_project');
      this.state.setStatus('completed');
      return this.responseFormatter.formatResponse(
        prompt,
        [],
        [],
        'completed',
        this.iterationManager.getCurrentVersion()?.version || 'v1.0.0'
      );
    }

    if (intent.type === 'GENERATE_VARIANTS' || intent.type === 'CREATE_DESIGN') {
      return this.generateAlternatives(intent.extractedParameters.variantCount || 3, prompt);
    }

    // Formulate targeted proposals
    this.state.setStatus('designing');
    const proposals = this.decisionEngine.formulateProposals(contextPayload, intent.type);

    for (const prop of proposals) {
      this.events.emitDesignProposed(prop);
      this.events.emitValidationStarted(prop.changeId);
      const valResult = this.validator.validateProposal(prop, contextPayload.visualDesignModel);
      this.events.emitValidationFinished(valResult);

      if (valResult.isValid) {
        const requiresApproval = this.approvalManager.submitProposal(prop);
        if (requiresApproval) {
          this.events.emitApprovalRequired(prop);
        }
      }
    }

    this.state.pendingChanges = this.approvalManager.getPendingProposals();
    const hasPendingMajor = this.state.pendingChanges.some((p) => p.requiresApproval);
    const newStatus = hasPendingMajor ? 'awaiting_approval' : 'completed';
    this.state.setStatus(newStatus);

    return this.responseFormatter.formatResponse(
      prompt,
      this.state.pendingChanges,
      this.alternativeManager.getAlternatives(),
      newStatus,
      this.iterationManager.getCurrentVersion()?.version || 'v1.0.0'
    );
  }

  public analyzeSketch(): AgentResponseSummary {
    this.state.setStatus('understanding');
    this.controller.triggerSketchAnalysis();
    this.state.setStatus('completed');

    return this.responseFormatter.formatResponse(
      'Analyze sketch structure',
      [],
      [],
      'completed',
      this.iterationManager.getCurrentVersion()?.version || 'v1.0.0'
    );
  }

  public generateAlternatives(count: number = 3, prompt: string = 'Generate alternatives'): AgentResponseSummary {
    this.state.setStatus('comparing');
    const visualModel = this.sketchAnalyzer.getVisualDesignModel();
    const alternatives = this.alternativeManager.generateAlternatives(visualModel, count);
    this.events.emitAlternativesCreated(alternatives);
    this.state.setStatus('awaiting_approval');

    return this.responseFormatter.formatResponse(
      prompt,
      [],
      alternatives,
      'awaiting_approval',
      this.iterationManager.getCurrentVersion()?.version || 'v1.0.0'
    );
  }

  public selectAlternative(variantId: string): AgentResponseSummary {
    const selected = this.alternativeManager.selectAlternative(variantId);
    if (selected) {
      this.controller.selectVisualOption(variantId);
      this.memory.recordStyleSelection(selected.strategy);

      const version = this.iterationManager.commitIteration(
        `Selected alternative: ${selected.strategy}`,
        [],
        [],
        'USER',
        selected.visualOption
      );

      this.events.emitChangeApplied(variantId);
      this.state.currentDesignVersion = version.version;
      this.state.setStatus('completed');
    }

    return this.responseFormatter.formatResponse(
      `Selected variation ${variantId}`,
      [],
      this.alternativeManager.getAlternatives(),
      'completed',
      this.state.currentDesignVersion
    );
  }

  public approveChange(changeId: string): AgentResponseSummary {
    const approved = this.approvalManager.approveProposal(changeId);
    if (approved) {
      this.events.emitChangeApproved(changeId);
      this.applyChange(changeId);
    }
    return this.responseFormatter.formatResponse(
      `Approved change ${changeId}`,
      this.approvalManager.getPendingProposals(),
      [],
      'completed',
      this.state.currentDesignVersion
    );
  }

  public rejectChange(changeId: string, reason: string = 'User rejected change'): AgentResponseSummary {
    const rejected = this.approvalManager.rejectProposal(changeId);
    if (rejected) {
      this.events.emitChangeRejected(changeId, reason);
    }
    return this.responseFormatter.formatResponse(
      `Rejected change ${changeId}`,
      this.approvalManager.getPendingProposals(),
      [],
      'completed',
      this.state.currentDesignVersion
    );
  }

  public applyChange(changeId: string): void {
    const approvedList = this.approvalManager.getApprovedProposals();
    const targetProp = approvedList.find((p) => p.changeId === changeId);

    if (targetProp) {
      const newVer = this.iterationManager.commitIteration(
        targetProp.changeType + ' - ' + targetProp.target,
        [targetProp],
        [],
        'AGENT'
      );
      this.state.currentDesignVersion = newVer.version;
      this.events.emitChangeApplied(changeId);
    }
  }

  public undo(): AgentResponseSummary {
    const undone = this.iterationManager.undoVersion();
    if (undone) {
      this.state.currentDesignVersion = undone.version;
      this.controller.undo();
    }
    return this.responseFormatter.formatResponse(
      'Undo agent change',
      [],
      [],
      'completed',
      this.state.currentDesignVersion
    );
  }

  public redo(): AgentResponseSummary {
    const redone = this.iterationManager.redoVersion();
    if (redone) {
      this.state.currentDesignVersion = redone.version;
      this.controller.redo();
    }
    return this.responseFormatter.formatResponse(
      'Redo agent change',
      [],
      [],
      'completed',
      this.state.currentDesignVersion
    );
  }

  public async generateCode(): Promise<any> {
    this.events.emitCodeRequested('production_app');
    return await this.controller.generateProductionCode();
  }

  public getStatistics(): Record<string, any> {
    return {
      sessionId: this.state.sessionId,
      status: this.state.agentStatus,
      iterationNumber: this.state.iterationNumber,
      activeVersion: this.state.currentDesignVersion,
      versionHistoryCount: this.iterationManager.getAllVersions().length,
      pendingProposalsCount: this.approvalManager.getPendingProposals().length,
      approvedProposalsCount: this.approvalManager.getApprovedProposals().length,
      rejectedProposalsCount: this.approvalManager.getRejectedProposals().length,
      activeAlternativesCount: this.alternativeManager.getAlternatives().length
    };
  }

  public getObserver(): AgentObserver {
    return this.observer;
  }

  private buildCurrentContext(prompt?: string, selectedNodeId?: string): AgentContextPayload {
    const semanticTree = this.sketchAnalyzer.getSemanticTree();
    const intentTree = this.sketchAnalyzer.getIntentTree();
    const blueprintVariants = this.sketchAnalyzer.getLayoutPlanner().getRankedVariants();
    const selectedBlueprint = this.sketchAnalyzer.getBlueprint();
    const visualDesignModel = this.sketchAnalyzer.getVisualDesignModel();
    const renderTree = this.sketchAnalyzer.getRenderEngine().getTree();
    const knowledgeBundle = this.sketchAnalyzer.getKnowledgeEngine().createBundle({ prompt, intent: 'Landing Page' });
    const predictionBundle = this.sketchAnalyzer.getMLCore().getLastPredictionBundle();
    const aiDecision = this.sketchAnalyzer.getAIOrchestrator().getLastResult();

    const ctx = this.contextBuilder.buildContext({
      userPrompt: prompt,
      selectedNodeUuid: selectedNodeId,
      semanticTree,
      intentTree,
      blueprintVariants,
      selectedBlueprint,
      visualDesignModel,
      renderTree,
      knowledgeBundle,
      predictionBundle,
      aiDecision,
      learningStats: this.sketchAnalyzer.getDesignFeedbackEngine().getStatistics()
    });

    this.observer.observe(ctx);
    return ctx;
  }
}
