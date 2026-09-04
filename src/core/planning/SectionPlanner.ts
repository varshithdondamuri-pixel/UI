import { IntentNode } from '../recognition/RecognitionTypes';
import {
  ContentDensity,
  SectionPlanningInfo,
  SpacingRequirement,
  VisualWeight
} from './BlueprintTypes';

export class SectionPlanner {
  /**
   * Plan structural section properties for an IntentNode without any visual/color assignments.
   */
  public planSection(
    node: IntentNode,
    siblingIndex: number = 0,
    totalSiblings: number = 1
  ): SectionPlanningInfo {
    const type = node.type.toLowerCase();

    // 1. Estimated dimensions
    const rawBounds = node.metadata?.bounds || { width: 1200, height: 400, minY: siblingIndex * 400 };
    const estimatedWidth = rawBounds.width > 0 ? Math.round(rawBounds.width) : 1200;
    const estimatedHeight = this.estimateHeight(type, rawBounds.height);

    // 2. Preferred Position
    let anchor: 'top' | 'middle' | 'bottom' | 'floating' = 'middle';
    if (type.includes('nav') || type.includes('header') || siblingIndex === 0) {
      anchor = 'top';
    } else if (type.includes('footer') || siblingIndex === totalSiblings - 1) {
      anchor = 'bottom';
    } else if (type.includes('hero')) {
      anchor = 'top';
    }

    const preferredPosition = {
      index: siblingIndex,
      anchor,
      relativeY: rawBounds.minY ?? siblingIndex * 300
    };

    // 3. Importance
    const importance = node.priority || 'medium';

    // 4. Visual Weight
    const visualWeight = this.determineVisualWeight(type, node);

    // 5. Spacing Requirement
    const spacingRequirement = this.determineSpacingRequirement(type);

    // 6. Content Density
    const contentDensity = this.determineContentDensity(node);

    return {
      estimatedWidth,
      estimatedHeight,
      preferredPosition,
      importance,
      visualWeight,
      spacingRequirement,
      contentDensity
    };
  }

  private estimateHeight(type: string, measuredHeight: number): number {
    if (measuredHeight > 0) return Math.round(measuredHeight);
    if (type.includes('nav') || type.includes('header')) return 80;
    if (type.includes('hero')) return 600;
    if (type.includes('feature')) return 480;
    if (type.includes('testimonial')) return 400;
    if (type.includes('cta')) return 320;
    if (type.includes('footer')) return 200;
    return 300;
  }

  private determineVisualWeight(type: string, node: IntentNode): VisualWeight {
    if (node.priority === 'critical' || type.includes('hero') || type.includes('cta')) {
      return 'high';
    }
    if (type.includes('nav') || type.includes('footer') || node.priority === 'low') {
      return 'low';
    }
    return 'medium';
  }

  private determineSpacingRequirement(type: string): SpacingRequirement {
    if (type.includes('hero') || type.includes('cta')) return 'spacious';
    if (type.includes('feature') || type.includes('testimonial')) return 'relaxed';
    if (type.includes('nav') || type.includes('footer')) return 'compact';
    return 'standard';
  }

  private determineContentDensity(node: IntentNode): ContentDensity {
    const childCount = node.children ? node.children.length : 0;
    if (childCount > 6 || node.type.includes('grid')) return 'high';
    if (childCount > 2) return 'medium';
    return 'low';
  }
}
