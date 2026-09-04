import { CanvasNode } from '../../types';

import { RecognizedShape, ShapeKind, TextAssociation } from './RecognitionTypes';
import { RecognitionUtilities } from './RecognitionUtilities';

export class ShapeRecognizer {
  /**
   * Recognizes shapes and associates nearby text with shapes.
   * Strictly read-only; does not mutate any input CanvasNode.
   */
  public analyzeShapes(nodes: CanvasNode[]): {
    shapes: RecognizedShape[];
    textAssociations: TextAssociation[];
  } {
    const recognizedShapes: RecognizedShape[] = [];
    const textNodes: CanvasNode[] = [];
    const shapeCandidates: RecognizedShape[] = [];

    // Stage 1: Classify shapes and collect text nodes
    for (const node of nodes) {
      if (!node.visibility) continue;

      const bounds = RecognitionUtilities.getNodeBounds(node);

      if (node.kind === 'text') {
        textNodes.push(node);
        recognizedShapes.push({
          id: node.uuid,
          originalKind: 'text',
          classifiedKind: 'text',
          bounds,
          label: node.text || null,
          confidence: 1.0,
          metadata: { text: node.text || '' }
        });
      } else if (node.kind === 'pen') {
        const penPoints = node.points || [];
        const classification = RecognitionUtilities.classifyPenPoints(penPoints);
        const shape: RecognizedShape = {
          id: node.uuid,
          originalKind: 'pen',
          classifiedKind: classification.classifiedKind as ShapeKind,
          bounds,
          label: null,
          confidence: classification.confidence,
          metadata: { pointCount: penPoints.length }
        };
        shapeCandidates.push(shape);
        recognizedShapes.push(shape);
      } else {
        const shapeKind = node.kind as ShapeKind;
        const shape: RecognizedShape = {
          id: node.uuid,
          originalKind: node.kind,
          classifiedKind: shapeKind,
          bounds,
          label: null,
          confidence: 1.0,
          metadata: {}
        };
        shapeCandidates.push(shape);
        recognizedShapes.push(shape);
      }
    }

    // Stage 2: Distance-based Text Association
    const textAssociations: TextAssociation[] = [];

    for (const textNode of textNodes) {
      const textContent = textNode.text?.trim();
      if (!textContent) continue;

      const textBounds = RecognitionUtilities.getNodeBounds(textNode);
      const textCenter = RecognitionUtilities.getCenter(textBounds);

      let closestShape: RecognizedShape | null = null;
      let minDistance = Infinity;
      let isInsideClosest = false;

      for (const shape of shapeCandidates) {
        if (shape.classifiedKind === 'line' || shape.classifiedKind === 'arrow') {
          // Check proximity to line/arrow
          const shapeCenter = RecognitionUtilities.getCenter(shape.bounds);
          const dist = RecognitionUtilities.pointDistance(textCenter, shapeCenter);
          const maxAllowed = Math.max(60, Math.max(shape.bounds.width, shape.bounds.height) * 0.6);
          if (dist <= maxAllowed && dist < minDistance) {
            minDistance = dist;
            closestShape = shape;
            isInsideClosest = false;
          }
        } else {
          // Rectangle or Circle
          const isInside = RecognitionUtilities.isPointInBox(textCenter, shape.bounds, 10);
          const shapeCenter = RecognitionUtilities.getCenter(shape.bounds);
          const dist = RecognitionUtilities.pointDistance(textCenter, shapeCenter);
          const maxAllowed = Math.max(80, Math.max(shape.bounds.width, shape.bounds.height) * 0.7);

          if (isInside) {
            if (!isInsideClosest || dist < minDistance) {
              minDistance = dist;
              closestShape = shape;
              isInsideClosest = true;
            }
          } else if (!isInsideClosest && dist <= maxAllowed && dist < minDistance) {
            minDistance = dist;
            closestShape = shape;
            isInsideClosest = false;
          }
        }
      }

      if (closestShape) {
        const textConfidence = isInsideClosest
          ? 0.95
          : Math.max(0.4, 0.9 - minDistance / 150);

        closestShape.label = textContent;

        textAssociations.push({
          shapeNodeId: closestShape.id,
          textNodeId: textNode.uuid,
          textContent,
          distance: Math.round(minDistance * 10) / 10,
          confidence: Math.round(textConfidence * 100) / 100
        });
      }
    }

    return {
      shapes: recognizedShapes,
      textAssociations
    };
  }
}
