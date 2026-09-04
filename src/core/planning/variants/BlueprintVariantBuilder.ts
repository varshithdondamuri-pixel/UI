import { IntentTree } from '../../recognition/RecognitionTypes';
import { BlueprintBuilder } from '../BlueprintBuilder';
import { BlueprintNode, BlueprintVariant, LayoutBlueprint, LayoutStrategy } from '../BlueprintTypes';
import { VariantConstraints } from './VariantConstraints';

export class BlueprintVariantBuilder {
  private baseBuilder: BlueprintBuilder;

  constructor() {
    this.baseBuilder = new BlueprintBuilder();
  }

  /**
   * Constructs a specific structural BlueprintVariant for a given IntentTree and LayoutStrategy.
   */
  public buildVariant(intentTree: IntentTree, strategy: LayoutStrategy): BlueprintVariant {
    const config = VariantConstraints.getStrategyConfig(strategy);

    // 1. Generate base blueprint
    const baseBlueprint = this.baseBuilder.buildBlueprint(intentTree);

    // 2. Customize structural rules according to the specific LayoutStrategy
    const customizedRoot = this.applyStrategyToNode(baseBlueprint.root, strategy, true);

    const customizedBlueprint: LayoutBlueprint = {
      ...baseBlueprint,
      id: `bp-${strategy}-${Date.now()}`,
      root: customizedRoot
    };

    // 3. Assemble BlueprintVariant metadata
    const variantId = `variant-${strategy}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: variantId,
      name: config.name,
      description: config.description,
      layoutStrategy: strategy,
      confidence: Math.round((intentTree.root.confidence ?? 0.9) * 100) / 100,
      advantages: [...config.advantages],
      tradeoffs: [...config.tradeoffs],
      responsiveScore: config.baseResponsiveScore,
      complexityScore: config.baseComplexityScore,
      maintainabilityScore: config.baseMaintainabilityScore,
      sourceIntentTree: intentTree.root.id,
      blueprint: customizedBlueprint
    };
  }

  /**
   * Recursively adjusts node structural rules (grid, layout direction, max width, spacing) to match strategy.
   */
  private applyStrategyToNode(
    node: BlueprintNode,
    strategy: LayoutStrategy,
    isRoot: boolean = false
  ): BlueprintNode {
    const config = VariantConstraints.getStrategyConfig(strategy);
    const type = node.type.toLowerCase();

    const updatedNode: BlueprintNode = {
      ...node,
      spacingRules: {
        ...node.spacingRules,
        sectionSpacing: Math.round(node.spacingRules.sectionSpacing * config.sectionGapScale),
        internalSpacing: Math.round(node.spacingRules.internalSpacing * config.sectionGapScale)
      },
      constraints: {
        ...node.constraints,
        containerRules: {
          ...node.constraints.containerRules,
          maxContentWidth: isRoot ? config.maxContentWidth : node.constraints.containerRules.maxContentWidth
        }
      }
    };

    // Apply strategy-specific layout overrides
    if (strategy === 'centered') {
      updatedNode.alignment = { horizontal: 'center', vertical: updatedNode.alignment.vertical };
      if (type.includes('page') || type.includes('landing_page')) {
        updatedNode.constraints.maxWidth = 1000;
        updatedNode.constraints.preferredWidth = 960;
      }
    } else if (strategy === 'split' && (type.includes('hero') || type.includes('feature'))) {
      updatedNode.layoutDirection = 'horizontal';
      updatedNode.gridRules = {
        gridType: 'split_layout',
        columns: 2,
        gap: 24,
        autoFit: false
      };
    } else if (strategy === 'grid' && (type.includes('feature') || type.includes('card_grid') || type.includes('section'))) {
      updatedNode.layoutDirection = 'grid';
      updatedNode.gridRules = {
        gridType: 'responsive_grid',
        columns: 3,
        gap: 20,
        autoFit: true,
        minColumnWidth: 260
      };
    } else if (strategy === 'sidebar' && isRoot) {
      updatedNode.layoutDirection = 'horizontal';
      updatedNode.gridRules = {
        gridType: 'split_layout',
        columns: 2,
        gap: 16,
        autoFit: false
      };
    } else if (strategy === 'dashboard' && !isRoot) {
      if (node.children && node.children.length >= 3) {
        updatedNode.gridRules = {
          gridType: 'four_column',
          columns: 4,
          gap: 16,
          autoFit: true,
          minColumnWidth: 220
        };
      }
    } else if (strategy === 'minimal') {
      updatedNode.spacingRules.sectionSpacing = Math.round(node.spacingRules.sectionSpacing * 1.5);
      updatedNode.spacingRules.contentPadding = {
        top: Math.round(node.spacingRules.contentPadding.top * 1.3),
        right: Math.round(node.spacingRules.contentPadding.right * 1.3),
        bottom: Math.round(node.spacingRules.contentPadding.bottom * 1.3),
        left: Math.round(node.spacingRules.contentPadding.left * 1.3)
      };
    }

    // Recurse children
    if (node.children && node.children.length > 0) {
      updatedNode.children = node.children.map((child) =>
        this.applyStrategyToNode(child, strategy, false)
      );
    }

    return updatedNode;
  }
}
