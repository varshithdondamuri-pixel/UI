import {
  LayoutStructure,
  RecognizedShape,
  SemanticNode,
  SemanticNodeType,
  SemanticTree,
  SpatialRelationship
} from './RecognitionTypes';

export class SemanticTreeBuilder {
  /**
   * Constructs a hierarchical SemanticTree from recognized shapes, relationships, and layout structures.
   * Every node includes id, type, confidence, sourceNodes, children, and metadata.
   */
  public buildSemanticTree(
    shapes: RecognizedShape[],
    relationships: SpatialRelationship[],
    layouts: LayoutStructure[],
    startTime: number
  ): SemanticTree {
    const shapeMap = new Map<string, RecognizedShape>();
    shapes.forEach((s) => shapeMap.set(s.id, s));

    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();

    // Build parent-child relationships map
    relationships.forEach((r) => {
      if (r.type === 'parent') {
        const existing = childrenMap.get(r.sourceNodeId) || [];
        if (!existing.includes(r.targetNodeId)) {
          existing.push(r.targetNodeId);
          childrenMap.set(r.sourceNodeId, existing);
        }
        parentMap.set(r.targetNodeId, r.sourceNodeId);
      }
    });

    let nodeCounter = 1;

    // Helper: Classify a shape into a SemanticNode
    const classifyShapeToSemanticNode = (shape: RecognizedShape): SemanticNode => {
      const childShapeIds = childrenMap.get(shape.id) || [];
      const childShapes = childShapeIds.map((id) => shapeMap.get(id)).filter(Boolean) as RecognizedShape[];
      const isTop = shape.bounds.minY <= 120;
      const aspectRatio = shape.bounds.width / Math.max(1, shape.bounds.height);

      let semanticType: SemanticNodeType = 'generic';
      let confidence = shape.confidence;
      const meta: Record<string, any> = { ...shape.metadata, bounds: shape.bounds };

      if (shape.label) {
        meta.label = shape.label;
      }

      if (shape.classifiedKind === 'text') {
        // Text element check: Is it heading above rectangle?
        const belowRelations = relationships.filter(
          (r) => r.sourceNodeId === shape.id && r.type === 'above'
        );
        if (belowRelations.length > 0) {
          semanticType = 'heading_section';
          confidence = 0.85;
        } else {
          semanticType = 'text_block';
          confidence = 0.95;
        }
      } else if (shape.classifiedKind === 'rectangle' || shape.classifiedKind === 'circle') {
        // 1. Navbar Candidate
        if (isTop && (aspectRatio >= 3.0 || shape.bounds.width >= 350)) {
          semanticType = 'navbar';
          confidence = Math.min(0.95, 0.75 + (aspectRatio > 4 ? 0.2 : 0.1));
        }
        // 2. Footer Candidate
        else if (shape.bounds.minY >= 450 && (aspectRatio >= 3.0 || shape.bounds.width >= 350)) {
          semanticType = 'footer';
          confidence = 0.88;
        }
        // 3. Sidebar Candidate
        else if (shape.bounds.height / Math.max(1, shape.bounds.width) >= 1.8 && shape.bounds.height >= 200) {
          semanticType = 'sidebar';
          confidence = 0.85;
        }
        // 4. Button Candidate
        else if (shape.label && shape.bounds.width <= 250 && shape.bounds.height <= 80) {
          semanticType = 'button';
          confidence = 0.92;
        }
        // 5. Hero Candidate
        else if (shape.bounds.minY <= 250 && shape.bounds.width >= 300 && shape.bounds.height >= 150) {
          semanticType = 'hero';
          confidence = 0.85;
        }
        // 6. Card Grid Candidate
        else if (childShapes.length >= 2) {
          const rectChildren = childShapes.filter((c) => c.classifiedKind === 'rectangle');
          if (rectChildren.length >= 2) {
            semanticType = 'card_grid';
            confidence = 0.9;
          } else {
            semanticType = 'card';
            confidence = 0.88;
          }
        }
        // 7. Single Card / Container
        else if (shape.bounds.width >= 120 && shape.bounds.height >= 120) {
          semanticType = 'card';
          confidence = 0.75;
        } else {
          semanticType = 'container';
          confidence = 0.7;
        }
      } else if (shape.classifiedKind === 'line' || shape.classifiedKind === 'arrow') {
        semanticType = 'generic';
        confidence = 0.8;
      }

      // Recursively build children
      const children: SemanticNode[] = childShapes.map((childShape) =>
        classifyShapeToSemanticNode(childShape)
      );

      return {
        id: `sem-${nodeCounter++}-${shape.id}`,
        type: semanticType,
        confidence: Math.round(confidence * 100) / 100,
        sourceNodes: [shape.id],
        children,
        metadata: meta
      };
    };

    // Find top-level shapes (shapes without a parent container)
    const topLevelShapes = shapes.filter((s) => !parentMap.has(s.id));

    // Convert top-level shapes to SemanticNodes
    const rootChildren: SemanticNode[] = topLevelShapes.map((shape) =>
      classifyShapeToSemanticNode(shape)
    );

    // Create Root Page Node
    const rootNode: SemanticNode = {
      id: 'semantic-root-page',
      type: 'page',
      confidence: 1.0,
      sourceNodes: shapes.map((s) => s.id),
      children: rootChildren,
      metadata: {
        totalShapes: shapes.length,
        detectedLayouts: layouts.map((l) => l.type)
      }
    };

    const endTime = Date.now();
    const duration = Math.max(0, endTime - startTime);

    // Count total semantic nodes recursively
    const countNodes = (node: SemanticNode): number => {
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };

    return {
      root: rootNode,
      timestamp: Date.now(),
      analysisDurationMs: duration,
      totalNodeCount: countNodes(rootNode)
    };
  }
}
