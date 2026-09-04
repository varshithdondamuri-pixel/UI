import { CanvasNode } from '../../types';

import { RecognizedShape, SpatialRelationship } from './RecognitionTypes';
import { RecognitionUtilities } from './RecognitionUtilities';

export class RelationshipAnalyzer {
  /**
   * Evaluates spatial relationships between recognized shapes.
   * Stores relationships separately without modifying drawing objects.
   */
  public analyzeRelationships(
    shapes: RecognizedShape[],
    rawNodes: CanvasNode[]
  ): SpatialRelationship[] {
    const relationships: SpatialRelationship[] = [];
    const shapeMap = new Map<string, RecognizedShape>();
    shapes.forEach((s) => shapeMap.set(s.id, s));

    const rawNodeMap = new Map<string, CanvasNode>();
    rawNodes.forEach((n) => rawNodeMap.set(n.uuid, n));

    let relationCounter = 1;
    const addRelation = (
      sourceId: string,
      targetId: string,
      type: SpatialRelationship['type'],
      confidence: number,
      distance?: number,
      metadata?: Record<string, any>
    ) => {
      relationships.push({
        id: `rel-${relationCounter++}`,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        type,
        confidence: Math.round(confidence * 100) / 100,
        distance: distance !== undefined ? Math.round(distance * 10) / 10 : undefined,
        metadata
      });
    };

    // Stage 1: Pairwise spatial containment, overlap, near, directional
    for (let i = 0; i < shapes.length; i++) {
      for (let j = 0; j < shapes.length; j++) {
        if (i === j) continue;

        const shapeA = shapes[i];
        const shapeB = shapes[j];
        const centerA = RecognitionUtilities.getCenter(shapeA.bounds);
        const centerB = RecognitionUtilities.getCenter(shapeB.bounds);

        // 1. Contains & Inside
        if (RecognitionUtilities.isContained(shapeB.bounds, shapeA.bounds, 5)) {
          const areaRatio = (shapeB.bounds.width * shapeB.bounds.height) / (shapeA.bounds.width * shapeA.bounds.height);
          const confidence = Math.min(0.98, Math.max(0.7, 1 - areaRatio * 0.3));
          addRelation(shapeA.id, shapeB.id, 'contains', confidence);
          addRelation(shapeB.id, shapeA.id, 'inside', confidence);
          continue;
        }

        // 2. Overlaps
        const overlap = RecognitionUtilities.computeOverlap(shapeA.bounds, shapeB.bounds);
        if (overlap.iou > 0.05) {
          const confidence = Math.min(0.95, 0.5 + overlap.iou);
          addRelation(shapeA.id, shapeB.id, 'overlaps', confidence);
          continue;
        }

        // 3. Near
        const dist = RecognitionUtilities.boxDistance(shapeA.bounds, shapeB.bounds);
        if (dist <= 80) {
          const nearConfidence = Math.max(0.4, 0.95 - dist / 100);
          addRelation(shapeA.id, shapeB.id, 'near', nearConfidence, dist);
        }

        // 4. Directional relationships (above, below, left_of, right_of)
        const dx = centerB.x - centerA.x;
        const dy = centerB.y - centerA.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Vertical dominant
        if (absDy > absDx && absDy > 30 && dist <= 200) {
          const dirConf = Math.min(0.9, Math.max(0.5, 1 - absDx / (absDy + 1)));
          if (dy > 0) {
            addRelation(shapeA.id, shapeB.id, 'above', dirConf, dist);
            addRelation(shapeB.id, shapeA.id, 'below', dirConf, dist);
          }
        }

        // Horizontal dominant
        if (absDx > absDy && absDx > 30 && dist <= 200) {
          const dirConf = Math.min(0.9, Math.max(0.5, 1 - absDy / (absDx + 1)));
          if (dx > 0) {
            addRelation(shapeA.id, shapeB.id, 'left_of', dirConf, dist);
            addRelation(shapeB.id, shapeA.id, 'right_of', dirConf, dist);
          }
        }
      }
    }

    // Stage 2: Parent-Child Hierarchy derivation
    for (const shapeB of shapes) {
      // Find all shapes containing shapeB
      const containments = relationships.filter(
        (r) => r.targetNodeId === shapeB.id && r.type === 'inside'
      );

      if (containments.length > 0) {
        // Find smallest container
        let smallestParentId: string | null = null;
        let smallestArea = Infinity;

        for (const c of containments) {
          const parentShape = shapeMap.get(c.sourceNodeId);
          if (parentShape) {
            const area = parentShape.bounds.width * parentShape.bounds.height;
            if (area < smallestArea) {
              smallestArea = area;
              smallestParentId = parentShape.id;
            }
          }
        }

        if (smallestParentId) {
          addRelation(smallestParentId, shapeB.id, 'parent', 0.92);
          addRelation(shapeB.id, smallestParentId, 'child', 0.92);
        }
      }
    }

    // Stage 3: Connected By Arrow Analysis
    const arrowShapes = shapes.filter((s) => s.classifiedKind === 'arrow' || s.classifiedKind === 'line');
    const targetShapes = shapes.filter((s) => s.classifiedKind !== 'arrow' && s.classifiedKind !== 'line');

    for (const arrow of arrowShapes) {
      const rawNode = rawNodeMap.get(arrow.id);
      if (!rawNode) continue;

      let pStart: { x: number; y: number } | null = null;
      let pEnd: { x: number; y: number } | null = null;

      if (rawNode.points && rawNode.points.length >= 2) {
        pStart = rawNode.points[0];
        pEnd = rawNode.points[rawNode.points.length - 1];
      } else {
        pStart = { x: rawNode.position.x, y: rawNode.position.y };
        pEnd = { x: rawNode.position.x + rawNode.size.width, y: rawNode.position.y + rawNode.size.height };
      }

      let sourceTarget: RecognizedShape | null = null;
      let destTarget: RecognizedShape | null = null;

      for (const t of targetShapes) {
        if (RecognitionUtilities.isPointInBox(pStart, t.bounds, 25)) {
          sourceTarget = t;
        }
        if (RecognitionUtilities.isPointInBox(pEnd, t.bounds, 25)) {
          destTarget = t;
        }
      }

      if (sourceTarget && destTarget && sourceTarget.id !== destTarget.id) {
        addRelation(sourceTarget.id, destTarget.id, 'connected_by_arrow', 0.95, undefined, {
          arrowNodeId: arrow.id
        });
        addRelation(destTarget.id, sourceTarget.id, 'connected_by_arrow', 0.95, undefined, {
          arrowNodeId: arrow.id
        });
      }
    }

    return relationships;
  }
}
