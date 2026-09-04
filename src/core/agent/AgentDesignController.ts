import { TypedEventBus } from '../events/EventBus';
import { SketchAnalyzer } from '../recognition/SketchAnalyzer';
import { LayoutPlanner } from '../planning/LayoutPlanner';
import { VisualDesignEngine } from '../design/VisualDesignEngine';
import { RenderEngine } from '../rendering/RenderEngine';
import { CodeGenerationEngine } from '../codegen/CodeGenerationEngine';
import { DesignFeedbackEngine } from '../learning/DesignFeedbackEngine';
import { HistoryEngine } from '../history/HistoryEngine';

export class AgentDesignController {
  private eventBus: TypedEventBus;
  private sketchAnalyzer: SketchAnalyzer;
  private layoutPlanner: LayoutPlanner;
  private visualDesignEngine: VisualDesignEngine;
  private renderEngine: RenderEngine;
  private codeGenerationEngine: CodeGenerationEngine;
  private designFeedbackEngine: DesignFeedbackEngine;
  private historyEngine?: HistoryEngine;

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
    this.eventBus = eventBus;
    this.sketchAnalyzer = sketchAnalyzer;
    this.layoutPlanner = layoutPlanner;
    this.visualDesignEngine = visualDesignEngine;
    this.renderEngine = renderEngine;
    this.codeGenerationEngine = codeGenerationEngine;
    this.designFeedbackEngine = designFeedbackEngine;
    this.historyEngine = historyEngine;
  }

  public triggerSketchAnalysis(): any {
    return this.sketchAnalyzer.analyze();
  }

  public selectBlueprintVariant(variantId: string): any {
    return this.layoutPlanner.selectVariant(variantId);
  }

  public selectVisualOption(optionId: string): any {
    return this.visualDesignEngine.selectOption(optionId);
  }

  public updateViewportMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
    this.renderEngine.setViewportMode(mode);
  }

  public async generateProductionCode(): Promise<any> {
    const visualModel = this.sketchAnalyzer.getVisualDesignModel();
    const renderTree = this.renderEngine.getTree();
    return await this.codeGenerationEngine.generate(visualModel, renderTree);
  }

  public recordLearningOutcome(designId: string, rating: 1 | 2 | 3 | 4 | 5, comment?: string, reason?: any): void {
    this.designFeedbackEngine.submitRating(designId, rating);
    if (comment) {
      this.designFeedbackEngine.submitExplicitFeedback(designId, 'Comment', comment, comment, reason);
    }
  }

  public getEventBus(): TypedEventBus {
    return this.eventBus;
  }

  public undo(): boolean {
    if (this.historyEngine && this.historyEngine.canUndo()) {
      this.historyEngine.undo();
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.historyEngine && this.historyEngine.canRedo()) {
      this.historyEngine.redo();
      return true;
    }
    return false;
  }
}
