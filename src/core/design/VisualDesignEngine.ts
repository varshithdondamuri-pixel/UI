import { CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';
import { LayoutBlueprint } from '../planning/BlueprintTypes';
import { DesignSystemEngine } from './DesignSystemEngine';
import { VisualDesignModel } from './DesignTypes';
import { ThemeEngine } from './ThemeEngine';
import { VisualModelBuilder } from './VisualModelBuilder';

export class VisualDesignEngine {
  private eventBus: TypedEventBus;
  private designSystemEngine = new DesignSystemEngine();
  private themeEngine = new ThemeEngine();
  private builder = new VisualModelBuilder();

  private currentModel: VisualDesignModel | null = null;
  private selectedOptionId: string = 'option-a';

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Main Phase 4 entry point:
   * Takes the selected LayoutBlueprint and automatically generates 3 visual design options
   * (Option A, Option B, Option C) using different visual directions while preserving the exact layout.
   */
  public processBlueprint(blueprint: LayoutBlueprint): VisualDesignModel {
    const startTime = Date.now();
    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_STARTED, { timestamp: startTime });

    // Option A: Modern SaaS + Sleek Dark
    const optionA = this.builder.buildOption(
      'option-a',
      'Option A (Modern SaaS Dark)',
      'Sleek product-focused visual language with dark surface contrast and subtle vibrant accents.',
      blueprint,
      this.designSystemEngine.getDesignSystem('modern-saas'),
      this.themeEngine.getTheme('dark')
    );

    // Option B: Minimal Clean + Neutral Light
    const optionB = this.builder.buildOption(
      'option-b',
      'Option B (Minimal Clean Light)',
      'High-clarity layout emphasizing typography, generous whitespace, and neutral slate borders.',
      blueprint,
      this.designSystemEngine.getDesignSystem('minimal'),
      this.themeEngine.getTheme('light')
    );

    // Option C: Linear / Glass Inspired + High Accent Tones
    const optionC = this.builder.buildOption(
      'option-c',
      'Option C (Linear Glass High-Accent)',
      'Precision translucent glass elements with high-contrast accent highlights.',
      blueprint,
      this.designSystemEngine.getDesignSystem('glass'),
      this.themeEngine.getTheme('cool')
    );

    const options = [optionA, optionB, optionC];
    const activeOption = options.find((o) => o.id === this.selectedOptionId) || optionA;

    const totalNodeCount = this.countNodes(activeOption.rootNode);

    const model: VisualDesignModel = {
      selectedOptionId: activeOption.id,
      activeOption,
      options,
      designSystem: activeOption.designSystem,
      theme: activeOption.theme,
      colorTokens: activeOption.colorTokens,
      typographyScale: activeOption.typographyScale,
      spacingSystem: activeOption.spacingSystem,
      rootNode: activeOption.rootNode,
      animationPlan: activeOption.animationPlan,
      accessibilitySummary: activeOption.accessibilitySummary,
      validation: activeOption.validation,
      totalNodeCount,
      timestamp: Date.now()
    };

    this.currentModel = model;

    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_UPDATED, { model });
    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_VALIDATED, {
      validation: activeOption.validation,
      model
    });
    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_FINISHED, {
      model,
      timestamp: Date.now()
    });

    return model;
  }

  /**
   * Switches active design option (Option A, Option B, Option C).
   */
  public selectOption(optionId: string): VisualDesignModel | null {
    if (!this.currentModel) return null;

    const targetOption = this.currentModel.options.find((o) => o.id === optionId);
    if (!targetOption) return null;

    this.selectedOptionId = optionId;

    const updatedModel: VisualDesignModel = {
      ...this.currentModel,
      selectedOptionId: targetOption.id,
      activeOption: targetOption,
      designSystem: targetOption.designSystem,
      theme: targetOption.theme,
      colorTokens: targetOption.colorTokens,
      typographyScale: targetOption.typographyScale,
      spacingSystem: targetOption.spacingSystem,
      rootNode: targetOption.rootNode,
      animationPlan: targetOption.animationPlan,
      accessibilitySummary: targetOption.accessibilitySummary,
      validation: targetOption.validation,
      totalNodeCount: this.countNodes(targetOption.rootNode),
      timestamp: Date.now()
    };

    this.currentModel = updatedModel;

    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_UPDATED, { model: updatedModel });
    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_VALIDATED, {
      validation: targetOption.validation,
      model: updatedModel
    });
    this.eventBus.emit(CoreEvent.VISUAL_DESIGN_FINISHED, {
      model: updatedModel,
      timestamp: Date.now()
    });

    return updatedModel;
  }

  public getModel(): VisualDesignModel | null {
    return this.currentModel;
  }

  public getSelectedOptionId(): string {
    return this.selectedOptionId;
  }

  private countNodes(node: any): number {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
}
