import {
  BlueprintNode,
  BlueprintVariant,
  StructuralMetrics,
  VariantComparisonEntry,
  VariantComparisonMatrix
} from '../BlueprintTypes';

export class BlueprintComparison {
  /**
   * Compares a list of BlueprintVariants structurally and builds a comparison matrix.
   */
  public compareVariants(variants: BlueprintVariant[]): VariantComparisonMatrix {
    const entries: VariantComparisonEntry[] = variants.map((variant) => {
      const metrics = this.computeStructuralMetrics(variant);
      return {
        variantId: variant.id,
        variantName: variant.name,
        strategy: variant.layoutStrategy,
        overallScore: 0, // Filled after ranking
        metrics
      };
    });

    // Recommend variant with highest balanced metrics score
    let recommendedId = entries[0]?.variantId || '';
    let highestScore = -1;

    entries.forEach((e) => {
      const scoreSum =
        e.metrics.hierarchyDepth * 5 +
        e.metrics.spacingUniformity +
        e.metrics.gridFlexibility +
        e.metrics.responsiveQuality +
        e.metrics.visualBalance +
        e.metrics.navigationEfficiency -
        e.metrics.structuralComplexity * 0.3;

      if (scoreSum > highestScore) {
        highestScore = scoreSum;
        recommendedId = e.variantId;
      }
    });

    return {
      timestamp: Date.now(),
      variants: entries,
      recommendedVariantId: recommendedId
    };
  }

  /**
   * Computes non-visual structural metrics for a single BlueprintVariant.
   */
  public computeStructuralMetrics(variant: BlueprintVariant): StructuralMetrics {
    const root = variant.blueprint.root;

    // 1. Hierarchy Depth
    const hierarchyDepth = this.getTreeDepth(root);

    // 2. Spacing Uniformity (0 to 100)
    const spacingUniformity = this.calculateSpacingUniformity(root);

    // 3. Grid Flexibility (0 to 100)
    const gridFlexibility = this.calculateGridFlexibility(root);

    // 4. Structural Complexity (0 to 100)
    const totalNodes = variant.blueprint.totalNodeCount;
    const structuralComplexity = Math.min(100, Math.round(totalNodes * 8 + hierarchyDepth * 10));

    // 5. Responsive Quality (0 to 100)
    const responsiveQuality = variant.responsiveScore;

    // 6. Visual Balance (structural bounds distribution 0 to 100)
    const visualBalance = this.calculateVisualBalance(root);

    // 7. Content Density (0 to 100)
    const contentDensity = Math.min(100, Math.round((totalNodes / (hierarchyDepth || 1)) * 18));

    // 8. Navigation Efficiency (0 to 100)
    const navigationEfficiency = this.calculateNavigationEfficiency(root);

    return {
      hierarchyDepth,
      spacingUniformity,
      gridFlexibility,
      structuralComplexity,
      responsiveQuality,
      visualBalance,
      contentDensity,
      navigationEfficiency
    };
  }

  private getTreeDepth(node: BlueprintNode): number {
    if (!node.children || node.children.length === 0) return 1;
    let maxChildDepth = 0;
    for (const child of node.children) {
      const d = this.getTreeDepth(child);
      if (d > maxChildDepth) maxChildDepth = d;
    }
    return 1 + maxChildDepth;
  }

  private calculateSpacingUniformity(root: BlueprintNode): number {
    const spaces: number[] = [];
    const collectSpacing = (node: BlueprintNode) => {
      spaces.push(node.spacingRules.sectionSpacing);
      spaces.push(node.spacingRules.internalSpacing);
      if (node.children) node.children.forEach(collectSpacing);
    };
    collectSpacing(root);

    if (spaces.length === 0) return 85;
    const mean = spaces.reduce((a, b) => a + b, 0) / spaces.length;
    const variance = spaces.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / spaces.length;
    const stdDev = Math.sqrt(variance);

    // Lower variance relative to mean = higher uniformity
    const coefficient = stdDev / (mean || 1);
    return Math.max(40, Math.min(98, Math.round(100 - coefficient * 40)));
  }

  private calculateGridFlexibility(root: BlueprintNode): number {
    let flexScore = 70;
    const inspectGrid = (node: BlueprintNode) => {
      if (node.gridRules.autoFit) flexScore += 10;
      if (node.gridRules.gridType === 'responsive_grid') flexScore += 15;
      if (node.gridRules.gridType === 'single_column') flexScore += 5;
      if (node.children) node.children.forEach(inspectGrid);
    };
    inspectGrid(root);
    return Math.min(100, flexScore);
  }

  private calculateVisualBalance(root: BlueprintNode): number {
    if (!root.children || root.children.length === 0) return 90;

    // Check height distribution uniformity among top-level sections
    const heights = root.children.map((c) => c.bounds.height);
    const totalH = heights.reduce((a, b) => a + b, 0);
    if (totalH === 0) return 80;

    const avgH = totalH / heights.length;
    const diffSum = heights.reduce((sum, h) => sum + Math.abs(h - avgH), 0);
    const maxDiff = totalH;

    const balanceRatio = 1 - diffSum / maxDiff;
    return Math.max(50, Math.min(98, Math.round(balanceRatio * 100)));
  }

  private calculateNavigationEfficiency(root: BlueprintNode): number {
    const hasNavbar = root.children?.some((c) => c.type.toLowerCase().includes('nav'));
    const hasFooter = root.children?.some((c) => c.type.toLowerCase().includes('footer'));
    const hasHeroCTA = root.children?.some(
      (c) => c.type.toLowerCase().includes('hero') || c.type.toLowerCase().includes('cta')
    );

    let score = 60;
    if (hasNavbar) score += 20;
    if (hasFooter) score += 10;
    if (hasHeroCTA) score += 10;

    return Math.min(100, score);
  }
}
