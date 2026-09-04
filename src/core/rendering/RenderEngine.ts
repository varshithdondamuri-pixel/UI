import { CoreEvent } from '../../types';
import { VisualDesignModel } from '../design/DesignTypes';
import { TypedEventBus } from '../events/EventBus';
import { AnimationPreview } from './AnimationPreview';
import { LayoutRenderer } from './LayoutRenderer';
import { RenderTree } from './RenderTree';
import { RenderTreeBuilder } from './RenderTreeBuilder';
import { RendererValidator } from './RendererValidator';
import { RenderPerformanceMetrics, RenderValidationResult, ViewportMode } from './RenderingTypes';
import { ResponsiveRenderer } from './ResponsiveRenderer';

export class RenderEngine {
  private eventBus: TypedEventBus;
  private builder = new RenderTreeBuilder();
  private layoutRenderer = new LayoutRenderer();
  private animationPreview = new AnimationPreview();
  private responsiveRenderer = new ResponsiveRenderer();
  private validator = new RendererValidator();

  private currentTree: RenderTree | null = null;
  private currentModel: VisualDesignModel | null = null;
  private viewportMode: ViewportMode = 'desktop';

  private lastRenderTimeMs: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = Date.now();
  private currentFps: number = 60;
  private validation: RenderValidationResult = { isValid: true, warnings: [] };

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Main Phase 5 entry point:
   * Processes a VisualDesignModel into a RenderTree and emits render events.
   */
  public processModel(model: VisualDesignModel, mode?: ViewportMode): RenderTree {
    const startTime = Date.now();
    this.eventBus.emit(CoreEvent.RENDER_STARTED, { timestamp: startTime });

    this.currentModel = model;
    if (mode) this.viewportMode = mode;
    this.responsiveRenderer.setViewportMode(this.viewportMode);

    const renderTree = this.builder.buildRenderTree(model, this.viewportMode);
    this.currentTree = renderTree;

    this.validation = this.validator.validate(renderTree.root);

    const renderTimeMs = Math.max(1, Date.now() - startTime);
    this.lastRenderTimeMs = renderTimeMs;

    this.eventBus.emit(CoreEvent.RENDER_UPDATED, { tree: renderTree });
    this.eventBus.emit(CoreEvent.RENDER_VALIDATED, { validation: this.validation });
    this.eventBus.emit(CoreEvent.RENDER_FINISHED, {
      tree: renderTree,
      metrics: this.getMetrics(),
      timestamp: Date.now()
    });

    return renderTree;
  }

  /**
   * Switches active responsive viewport mode ('desktop' | 'tablet' | 'mobile').
   */
  public setViewportMode(mode: ViewportMode): RenderTree | null {
    this.viewportMode = mode;
    if (this.currentModel) {
      return this.processModel(this.currentModel, mode);
    }
    return null;
  }

  /**
   * Renders the current RenderTree onto Canvas 2D context.
   */
  public renderToCanvas(ctx: CanvasRenderingContext2D, timeMs: number): void {
    if (!this.currentTree) return;

    const startTime = performance.now();

    // 1. Draw Layout Tree
    this.layoutRenderer.renderLayoutTree(ctx, this.currentTree.root);

    // 2. Apply Animation Preview Effects
    this.applyAnimationsRecursive(ctx, this.currentTree.root, timeMs);

    const endTime = performance.now();
    this.lastRenderTimeMs = Math.max(0.1, endTime - startTime);

    // Track FPS
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  private applyAnimationsRecursive(ctx: CanvasRenderingContext2D, node: any, timeMs: number): void {
    if (!node || !node.visibility) return;
    this.animationPreview.applyAnimation(ctx, node, timeMs);
    if (node.children) {
      for (const child of node.children) {
        this.applyAnimationsRecursive(ctx, child, timeMs);
      }
    }
  }

  public getTree(): RenderTree | null {
    return this.currentTree;
  }

  public getViewportMode(): ViewportMode {
    return this.viewportMode;
  }

  public getValidation(): RenderValidationResult {
    return this.validation;
  }

  public getMetrics(): RenderPerformanceMetrics {
    return {
      renderTimeMs: Number(this.lastRenderTimeMs.toFixed(2)),
      fps: this.currentFps,
      visibleNodeCount: this.currentTree?.visibleNodeCount || 0,
      totalNodeCount: this.currentTree?.totalNodeCount || 0
    };
  }
}
