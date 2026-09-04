import { IntentTree } from '../../recognition/RecognitionTypes';
import {
  BlueprintVariant,
  RankedBlueprintVariant,
  VariantScores
} from '../BlueprintTypes';
import { BlueprintComparison } from './BlueprintComparison';

export class BlueprintRanker {
  private comparisonEngine: BlueprintComparison;

  constructor() {
    this.comparisonEngine = new BlueprintComparison();
  }

  /**
   * Deterministically ranks blueprint variants based on structural criteria.
   * NEVER uses randomness.
   */
  public rankVariants(
    variants: BlueprintVariant[],
    intentTree: IntentTree
  ): RankedBlueprintVariant[] {
    const rankedList: RankedBlueprintVariant[] = variants.map((variant) => {
      const scores = this.calculateVariantScores(variant, intentTree);
      return {
        rank: 0, // Assigned after sorting
        variant: {
          ...variant,
          // Attach computed overall score to variant
          confidence: Math.round((scores.overallScore / 100) * 100) / 100
        },
        scores
      };
    });

    // Sort deterministically descending by overallScore, fallback to strategy name if tied
    rankedList.sort((a, b) => {
      if (b.scores.overallScore !== a.scores.overallScore) {
        return b.scores.overallScore - a.scores.overallScore;
      }
      return a.variant.name.localeCompare(b.variant.name);
    });

    // Assign 1-indexed ranks
    rankedList.forEach((item, index) => {
      item.rank = index + 1;
    });

    return rankedList;
  }

  /**
   * Calculates deterministic scores for a single variant.
   */
  private calculateVariantScores(
    variant: BlueprintVariant,
    intentTree: IntentTree
  ): VariantScores {
    const metrics = this.comparisonEngine.computeStructuralMetrics(variant);
    const rootType = intentTree.root?.type?.toLowerCase() || '';

    // 1. Intent Match Score (0 - 100)
    let intentMatch = 80;
    if (variant.layoutStrategy === 'landing_page' && rootType.includes('landing')) intentMatch = 98;
    if (variant.layoutStrategy === 'hero_focused' && rootType.includes('hero')) intentMatch = 95;
    if (variant.layoutStrategy === 'dashboard' && rootType.includes('dashboard')) intentMatch = 96;
    if (variant.layoutStrategy === 'grid' && rootType.includes('grid')) intentMatch = 92;

    // 2. Layout Balance (0 - 100)
    const layoutBalance = metrics.visualBalance;

    // 3. Responsive Structure (0 - 100)
    const responsiveStructure = variant.responsiveScore;

    // 4. Hierarchy Quality (0 - 100)
    const hasRoot = variant.blueprint.root !== undefined;
    const hierarchyLevels = Object.keys(variant.blueprint.hierarchyMap).length;
    let hierarchyQuality = hasRoot ? Math.min(100, 60 + hierarchyLevels * 8) : 30;

    // 5. Constraint Satisfaction (0 - 100)
    const totalNodes = variant.blueprint.totalNodeCount;
    let constraintSatisfaction = totalNodes > 0 ? 90 : 50;

    // 6. Validation Warnings Penalty (0 - 50)
    const warnings = variant.blueprint.validation.warnings || [];
    let validationPenalty = 0;
    warnings.forEach((w) => {
      if (w.severity === 'error') validationPenalty += 20;
      else if (w.severity === 'warning') validationPenalty += 5;
    });
    validationPenalty = Math.min(50, validationPenalty);

    // 7. Overall Score Calculation (Weighted deterministic formula)
    const weightedScore =
      intentMatch * 0.3 +
      layoutBalance * 0.2 +
      responsiveStructure * 0.2 +
      hierarchyQuality * 0.15 +
      constraintSatisfaction * 0.15 -
      validationPenalty;

    const overallScore = Math.max(0, Math.min(100, Math.round(weightedScore)));

    return {
      intentMatch,
      layoutBalance,
      responsiveStructure,
      hierarchyQuality,
      constraintSatisfaction,
      validationPenalty,
      overallScore
    };
  }
}
