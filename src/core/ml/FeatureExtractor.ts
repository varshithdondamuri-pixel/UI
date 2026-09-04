import { LayoutBlueprint } from '../planning/BlueprintTypes';
import { VisualDesignModel } from '../design/DesignTypes';
import { KnowledgeBundle } from '../knowledge/KnowledgeTypes';
import { FeatureVector } from './MLTypes';

export class FeatureExtractor {
  /**
   * Extracts a structured feature vector from Visual Design Model, Blueprint, and Knowledge Bundle.
   */
  public extractFeatures(
    visualModel?: VisualDesignModel | null,
    blueprint?: LayoutBlueprint | null,
    bundle?: KnowledgeBundle | null,
    industryOverride?: string,
    styleOverride?: string
  ): FeatureVector {
    const activeOption = visualModel?.activeOption;
    const rootNode = activeOption?.rootNode;

    let componentCount = 0;
    let maxDepth = 0;
    let hasNavbar = false;
    let hasHero = false;
    let hasFooter = false;
    let hasSidebar = false;

    const traverse = (node: any, depth: number) => {
      componentCount++;
      if (depth > maxDepth) maxDepth = depth;

      const type = (node?.componentType || node?.type || '').toLowerCase();
      if (type.includes('nav')) hasNavbar = true;
      if (type.includes('hero')) hasHero = true;
      if (type.includes('footer')) hasFooter = true;
      if (type.includes('side')) hasSidebar = true;

      if (node?.children) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    };

    if (rootNode) {
      traverse(rootNode, 1);
    } else if (blueprint?.root) {
      traverse(blueprint.root, 1);
    }

    const sectionCount = blueprint?.root?.gridRules?.columns || (hasNavbar ? 1 : 0) + (hasHero ? 1 : 0) + (hasFooter ? 1 : 0) + 1;
    const layoutDepth = maxDepth || 3;
    const gridDensity = Number((componentCount / Math.max(1, sectionCount)).toFixed(2));
    const whitespaceRatio = Number((1 - Math.min(0.8, gridDensity * 0.15)).toFixed(2));
    const hierarchyScore = Number((Math.min(1.0, 0.5 + layoutDepth * 0.1)).toFixed(2));
    const accessibilityScore = activeOption?.accessibilitySummary?.overallScore || 90;

    return {
      layoutDepth,
      sectionCount,
      gridDensity,
      whitespaceRatio,
      hierarchyScore,
      componentCount,
      accessibilityScore,
      industry: industryOverride || bundle?.industry || 'SaaS',
      style: styleOverride || activeOption?.theme?.name || bundle?.style || 'Modern',
      hasNavbar,
      hasHero,
      hasFooter,
      hasSidebar
    };
  }
}
