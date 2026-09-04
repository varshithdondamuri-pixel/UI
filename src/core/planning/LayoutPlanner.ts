import { CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';
import { IntentTree } from '../recognition/RecognitionTypes';
import { BlueprintBuilder } from './BlueprintBuilder';

import {
  LayoutBlueprint,
  RankedBlueprintVariant,
  VariantComparisonMatrix
} from './BlueprintTypes';
import { BlueprintComparison } from './variants/BlueprintComparison';
import { BlueprintGenerator } from './variants/BlueprintGenerator';
import { BlueprintRanker } from './variants/BlueprintRanker';
import { BlueprintValidator } from './BlueprintValidator';

export class LayoutPlanner {
  private eventBus: TypedEventBus;
  private builder: BlueprintBuilder;
  private validator: BlueprintValidator;
  private generator: BlueprintGenerator;
  private ranker: BlueprintRanker;
  private comparison: BlueprintComparison;

  private currentBlueprint: LayoutBlueprint | null = null;
  private rankedVariants: RankedBlueprintVariant[] = [];
  private comparisonMatrix: VariantComparisonMatrix | null = null;
  private activeVariantId: string | null = null;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
    this.builder = new BlueprintBuilder();
    this.validator = new BlueprintValidator();
    this.generator = new BlueprintGenerator();
    this.ranker = new BlueprintRanker();
    this.comparison = new BlueprintComparison();
  }

  /**
   * Complete multi-blueprint planning pipeline:
   * IntentTree -> Multiple Blueprint Variants -> Independent Validation -> Structural Comparison -> Deterministic Ranking
   */
  public planLayout(intentTree: IntentTree): LayoutBlueprint {
    const startTime = Date.now();
    this.eventBus.emit(CoreEvent.BLUEPRINT_STARTED, { timestamp: startTime });
    this.eventBus.emit(CoreEvent.BLUEPRINT_VARIANTS_STARTED, { timestamp: startTime });

    // 1. Generate base blueprint
    const baseBlueprint = this.builder.buildBlueprint(intentTree);

    // 2. Generate candidate structural variants
    const rawVariants = this.generator.generateVariants(intentTree);
    this.eventBus.emit(CoreEvent.BLUEPRINT_VARIANTS_UPDATED, { variants: rawVariants });

    // 3. Validate every variant independently
    rawVariants.forEach((v) => {
      v.blueprint.validation = this.validator.validate(v.blueprint);
    });

    // 4. Structural comparison matrix
    this.comparisonMatrix = this.comparison.compareVariants(rawVariants);
    this.eventBus.emit(CoreEvent.BLUEPRINT_VARIANTS_FINISHED, {
      variants: rawVariants,
      matrix: this.comparisonMatrix
    });

    // 5. Deterministic ranking
    this.rankedVariants = this.ranker.rankVariants(rawVariants, intentTree);

    // Update overall scores in comparison matrix
    this.rankedVariants.forEach((rv) => {
      const match = this.comparisonMatrix?.variants.find((m) => m.variantId === rv.variant.id);
      if (match) match.overallScore = rv.scores.overallScore;
    });

    // 6. Select top ranked variant as default active blueprint
    const topVariant = this.rankedVariants[0]?.variant;
    if (topVariant) {
      this.activeVariantId = topVariant.id;
      this.currentBlueprint = topVariant.blueprint;
    } else {
      baseBlueprint.validation = this.validator.validate(baseBlueprint);
      this.currentBlueprint = baseBlueprint;
    }

    this.eventBus.emit(CoreEvent.BLUEPRINT_RANKED, {
      rankedVariants: this.rankedVariants,
      activeVariantId: this.activeVariantId || ''
    });

    if (this.currentBlueprint) {
      this.eventBus.emit(CoreEvent.BLUEPRINT_UPDATED, { blueprint: this.currentBlueprint });
      this.eventBus.emit(CoreEvent.BLUEPRINT_VALIDATED, {
        validation: this.currentBlueprint.validation,
        blueprint: this.currentBlueprint
      });
      this.eventBus.emit(CoreEvent.BLUEPRINT_FINISHED, {
        blueprint: this.currentBlueprint,
        timestamp: Date.now()
      });
    }

    return this.currentBlueprint || baseBlueprint;
  }

  /**
   * Sets the active variant by ID.
   */
  public selectVariant(variantId: string): LayoutBlueprint | null {
    const target = this.rankedVariants.find((r) => r.variant.id === variantId);
    if (target) {
      this.activeVariantId = target.variant.id;
      this.currentBlueprint = target.variant.blueprint;

      this.eventBus.emit(CoreEvent.BLUEPRINT_RANKED, {
        rankedVariants: this.rankedVariants,
        activeVariantId: this.activeVariantId
      });

      this.eventBus.emit(CoreEvent.BLUEPRINT_UPDATED, { blueprint: this.currentBlueprint });
      this.eventBus.emit(CoreEvent.BLUEPRINT_VALIDATED, {
        validation: this.currentBlueprint.validation,
        blueprint: this.currentBlueprint
      });
      this.eventBus.emit(CoreEvent.BLUEPRINT_FINISHED, {
        blueprint: this.currentBlueprint,
        timestamp: Date.now()
      });

      return this.currentBlueprint;
    }
    return null;
  }

  public getBlueprint(): LayoutBlueprint | null {
    return this.currentBlueprint;
  }

  public getRankedVariants(): RankedBlueprintVariant[] {
    return this.rankedVariants;
  }

  public getComparisonMatrix(): VariantComparisonMatrix | null {
    return this.comparisonMatrix;
  }

  public getActiveVariantId(): string | null {
    return this.activeVariantId;
  }
}
