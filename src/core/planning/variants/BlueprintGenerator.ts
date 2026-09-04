import { IntentTree } from '../../recognition/RecognitionTypes';
import { BlueprintVariant, LayoutStrategy } from '../BlueprintTypes';
import { BlueprintVariantBuilder } from './BlueprintVariantBuilder';

export class BlueprintGenerator {
  private variantBuilder: BlueprintVariantBuilder;

  constructor() {
    this.variantBuilder = new BlueprintVariantBuilder();
  }

  /**
   * Generates multiple structural BlueprintVariant candidates from an IntentTree.
   */
  public generateVariants(intentTree: IntentTree): BlueprintVariant[] {
    const rootType = intentTree.root?.type?.toLowerCase() || '';

    // Select candidate strategies based on intent tree structure
    const candidateStrategies: LayoutStrategy[] = this.selectCandidateStrategies(rootType, intentTree);

    // Build variants for each candidate strategy
    const variants: BlueprintVariant[] = candidateStrategies.map((strategy) =>
      this.variantBuilder.buildVariant(intentTree, strategy)
    );

    return variants;
  }

  /**
   * Selects relevant structural strategies to evaluate for the given IntentTree.
   */
  private selectCandidateStrategies(rootType: string, intentTree: IntentTree): LayoutStrategy[] {
    const strategies: Set<LayoutStrategy> = new Set();

    // Default primary candidates
    strategies.add('landing_page');
    strategies.add('hero_focused');
    strategies.add('split');
    strategies.add('grid');
    strategies.add('centered');

    // Contextual candidates based on root or child intent types
    const childTypes = intentTree.root?.children
      ? intentTree.root.children.map((c) => c.type.toLowerCase())
      : [];

    if (rootType.includes('dashboard') || childTypes.some((t) => t.includes('grid') || t.includes('card'))) {
      strategies.add('dashboard');
      strategies.add('sidebar');
    }

    if (childTypes.some((t) => t.includes('text') || t.includes('article') || t.includes('heading'))) {
      strategies.add('content_focused');
    }

    if (childTypes.length <= 3) {
      strategies.add('minimal');
    }

    return Array.from(strategies);
  }
}
