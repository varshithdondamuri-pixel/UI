import { BoundingBox, CanvasNode, Point } from '../../types';

export class RecognitionUtilities {
  /**
   * Calculates exact bounding box for a CanvasNode.
   */
  public static getNodeBounds(node: CanvasNode): BoundingBox {
    if (node.points && node.points.length > 0) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const p of node.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }

      return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY)
      };
    }

    const minX = node.position.x;
    const minY = node.position.y;
    const width = Math.max(1, node.size.width);
    const height = Math.max(1, node.size.height);

    return {
      minX,
      minY,
      maxX: minX + width,
      maxY: minY + height,
      width,
      height
    };
  }

  /**
   * Calculates the union bounding box of a list of bounding boxes.
   */
  public static computeUnionBounds(boxes: BoundingBox[]): BoundingBox {
    if (boxes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const b of boxes) {
      if (b.minX < minX) minX = b.minX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.maxY > maxY) maxY = b.maxY;
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY)
    };
  }

  /**
   * Computes center point of a bounding box.
   */
  public static getCenter(box: BoundingBox): Point {
    return {
      x: box.minX + box.width / 2,
      y: box.minY + box.height / 2
    };
  }

  /**
   * Euclidean distance between two points.
   */
  public static pointDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Minimum edge-to-edge distance between two bounding boxes.
   */
  public static boxDistance(b1: BoundingBox, b2: BoundingBox): number {
    const dx = Math.max(0, Math.max(b1.minX - b2.maxX, b2.minX - b1.maxX));
    const dy = Math.max(0, Math.max(b1.minY - b2.maxY, b2.minY - b1.maxY));
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Checks if box inner is contained within box outer (with optional tolerance).
   */
  public static isContained(inner: BoundingBox, outer: BoundingBox, tolerance: number = 5): boolean {
    return (
      inner.minX >= outer.minX - tolerance &&
      inner.minY >= outer.minY - tolerance &&
      inner.maxX <= outer.maxX + tolerance &&
      inner.maxY <= outer.maxY + tolerance
    );
  }

  /**
   * Calculates Intersection over Union (IoU) and area overlap ratios.
   */
  public static computeOverlap(
    b1: BoundingBox,
    b2: BoundingBox
  ): { iou: number; ratio1: number; ratio2: number; intersectionArea: number } {
    const interMinX = Math.max(b1.minX, b2.minX);
    const interMinY = Math.max(b1.minY, b2.minY);
    const interMaxX = Math.min(b1.maxX, b2.maxX);
    const interMaxY = Math.min(b1.maxY, b2.maxY);

    if (interMinX >= interMaxX || interMinY >= interMaxY) {
      return { iou: 0, ratio1: 0, ratio2: 0, intersectionArea: 0 };
    }

    const intersectionArea = (interMaxX - interMinX) * (interMaxY - interMinY);
    const area1 = b1.width * b1.height;
    const area2 = b2.width * b2.height;
    const unionArea = area1 + area2 - intersectionArea;

    return {
      iou: unionArea > 0 ? intersectionArea / unionArea : 0,
      ratio1: area1 > 0 ? intersectionArea / area1 : 0,
      ratio2: area2 > 0 ? intersectionArea / area2 : 0,
      intersectionArea
    };
  }

  /**
   * Determines if point p is inside bounding box.
   */
  public static isPointInBox(p: Point, box: BoundingBox, margin: number = 0): boolean {
    return (
      p.x >= box.minX - margin &&
      p.x <= box.maxX + margin &&
      p.y >= box.minY - margin &&
      p.y <= box.maxY + margin
    );
  }

  /**
   * Deterministically classifies a freehand pen stroke's geometric shape.
   */
  public static classifyPenPoints(
    points: Point[]
  ): { classifiedKind: 'rectangle' | 'circle' | 'line' | 'pen_stroke'; confidence: number } {
    if (!points || points.length < 2) {
      return { classifiedKind: 'pen_stroke', confidence: 0.5 };
    }

    const start = points[0];
    const end = points[points.length - 1];
    const totalDist = this.pointDistance(start, end);

    // Calculate stroke path length
    let pathLength = 0;
    for (let i = 1; i < points.length; i++) {
      pathLength += this.pointDistance(points[i - 1], points[i]);
    }

    // Straight line check: path length is close to start-to-end direct distance
    if (totalDist > 20 && pathLength / totalDist < 1.15) {
      const lineConfidence = Math.min(0.95, Math.max(0.6, 1.2 - (pathLength / totalDist - 1) * 2));
      return { classifiedKind: 'line', confidence: lineConfidence };
    }

    // Closed loop check: start and end points are close to each other
    const isClosed = totalDist < Math.max(15, pathLength * 0.25);
    if (isClosed && points.length >= 8) {
      const bounds = this.getNodeBounds({ points } as any);
      const aspectRatio = bounds.width / bounds.height;
      const center = this.getCenter(bounds);
      const radii = points.map((p) => this.pointDistance(p, center));
      const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
      const radiusVariance =
        radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
      const stdDev = Math.sqrt(radiusVariance);

      // Circle heuristic: aspect ratio near 1 and low radius variance
      if (aspectRatio >= 0.7 && aspectRatio <= 1.3 && stdDev / avgRadius < 0.25) {
        return { classifiedKind: 'circle', confidence: 0.85 };
      }

      // Rectangle heuristic: aspect ratio allows rectangular shapes
      if (aspectRatio >= 0.2 && aspectRatio <= 5.0) {
        return { classifiedKind: 'rectangle', confidence: 0.75 };
      }
    }

    return { classifiedKind: 'pen_stroke', confidence: 0.9 };
  }
}
