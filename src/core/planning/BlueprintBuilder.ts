import { IntentNode, IntentTree } from '../recognition/RecognitionTypes';
import {
  BlueprintNode,
  HierarchyLevel,
  LayoutBlueprint,
  ResponsiveBehavior,
  ResponsiveRules
} from './BlueprintTypes';
import { ConstraintEngine } from './ConstraintEngine';
import { GridPlanner } from './GridPlanner';
import { HierarchyPlanner } from './HierarchyPlanner';
import { SectionPlanner } from './SectionPlanner';
import { SpacingPlanner } from './SpacingPlanner';

export class BlueprintBuilder {
  private sectionPlanner: SectionPlanner;
  private gridPlanner: GridPlanner;
  private spacingPlanner: SpacingPlanner;
  private hierarchyPlanner: HierarchyPlanner;
  private constraintEngine: ConstraintEngine;

  constructor() {
    this.sectionPlanner = new SectionPlanner();
    this.gridPlanner = new GridPlanner();
    this.spacingPlanner = new SpacingPlanner();
    this.hierarchyPlanner = new HierarchyPlanner();
    this.constraintEngine = new ConstraintEngine();
  }

  /**
   * Builds a complete LayoutBlueprint from an IntentTree.
   */
  public buildBlueprint(intentTree: IntentTree): LayoutBlueprint {
    const hierarchyMap: Record<HierarchyLevel, string[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };

    let totalNodeCount = 0;

    const rootNode = this.buildNode(
      intentTree.root,
      null,
      0,
      1,
      0,
      hierarchyMap,
      () => totalNodeCount++
    );

    const blueprint: LayoutBlueprint = {
      id: `blueprint-${Date.now()}`,
      root: rootNode,
      hierarchyMap,
      timestamp: Date.now(),
      totalNodeCount,
      validation: { valid: true, warnings: [] }
    };

    return blueprint;
  }

  private buildNode(
    intentNode: IntentNode,
    parentId: string | null,
    siblingIndex: number,
    totalSiblings: number,
    depth: number,
    hierarchyMap: Record<HierarchyLevel, string[]>,
    incrementCount: () => void
  ): BlueprintNode {
    incrementCount();

    const nodeType = intentNode.type || 'container';

    // 1. Hierarchy Level
    const hierarchyLevel = this.hierarchyPlanner.determineHierarchyLevel(
      intentNode,
      depth > 0 ? (depth as HierarchyLevel) : null
    );
    const blueprintNodeId = `bp-${intentNode.id}`;
    if (!hierarchyMap[hierarchyLevel]) {
      hierarchyMap[hierarchyLevel] = [];
    }
    hierarchyMap[hierarchyLevel].push(blueprintNodeId);

    // 2. Section Planning Metadata
    const sectionInfo = this.sectionPlanner.planSection(intentNode, siblingIndex, totalSiblings);

    // 3. Grid & Direction Planning
    const { gridRules, layoutDirection } = this.gridPlanner.planGrid(intentNode);

    // 4. Spacing Rules
    const spacingRules = this.spacingPlanner.planSpacing(intentNode);

    // 5. Constraints & Alignment
    const { constraints, alignment, distribution } = this.constraintEngine.planConstraints(intentNode);

    // 6. Responsive Rules (Desktop, Tablet, Mobile)
    const responsiveRules = this.planResponsiveRules(nodeType, gridRules.columns, layoutDirection);

    // 7. Bounds
    const bounds = intentNode.metadata?.bounds || {
      minX: 0,
      minY: siblingIndex * 300,
      maxX: sectionInfo.estimatedWidth,
      maxY: siblingIndex * 300 + sectionInfo.estimatedHeight,
      width: sectionInfo.estimatedWidth,
      height: sectionInfo.estimatedHeight
    };

    // 8. Recursive Children Building
    const childrenCount = intentNode.children ? intentNode.children.length : 0;
    const children: BlueprintNode[] = intentNode.children
      ? intentNode.children.map((child, idx) =>
          this.buildNode(
            child,
            blueprintNodeId,
            idx,
            childrenCount,
            depth + 1,
            hierarchyMap,
            incrementCount
          )
        )
      : [];

    const blueprintNode: BlueprintNode = {
      id: blueprintNodeId,
      type: nodeType,
      parent: parentId,
      children,
      priority: intentNode.priority || 'medium',
      purpose: intentNode.purpose || `Structural ${nodeType} container`,
      bounds,
      layoutDirection,
      alignment,
      distribution,
      spacingRules,
      gridRules,
      constraints,
      responsiveRules,
      sourceIntentNode: intentNode.id,
      confidence: intentNode.confidence ?? 1.0,
      hierarchyLevel,
      sectionInfo
    };

    return blueprintNode;
  }

  /**
   * Generates structural layout behavior rules for Desktop, Tablet, and Mobile.
   * No CSS allowed!
   */
  private planResponsiveRules(
    nodeType: string,
    columns: number,
    direction: 'vertical' | 'horizontal' | 'grid' | 'stack' | 'split'
  ): ResponsiveRules {
    const type = nodeType.toLowerCase();

    // Desktop Defaults
    const desktop: ResponsiveBehavior = {
      direction,
      columns,
      stacking: direction === 'grid' ? 'grid' : 'horizontal',
      hidden: false
    };

    // Tablet Defaults
    let tabletColumns = Math.min(2, columns);
    if (columns >= 3) tabletColumns = 2;
    const tablet: ResponsiveBehavior = {
      direction: columns > 2 ? 'grid' : direction,
      columns: tabletColumns,
      stacking: type.includes('hero') || type.includes('split') ? 'vertical' : 'wrap',
      hidden: false
    };

    // Mobile Defaults
    const mobile: ResponsiveBehavior = {
      direction: 'vertical',
      columns: 1,
      stacking: 'vertical',
      hidden: false
    };

    return { desktop, tablet, mobile };
  }
}
