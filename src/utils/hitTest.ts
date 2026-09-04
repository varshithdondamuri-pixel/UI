import { Point, CanvasNode, ResizeHandle } from '../types';
import { rotatePoint, getNodeCenter, getLocalCorners } from './math';

const HANDLE_SIZE = 10;

/**
 * Checks if a point hits a node in World Space.
 */
export function isPointInNode(point: Point, node: CanvasNode): boolean {
  if (!node.visibility) return false;

  const center = getNodeCenter(node);
  const rad = (-node.rotation * Math.PI) / 180; // inverse rotate point into local node coords
  const localPoint = rotatePoint(point, center, rad);

  const localX = localPoint.x - node.position.x;
  const localY = localPoint.y - node.position.y;

  // Add stroke width buffer for easy clicking
  const buffer = Math.max(node.strokeWidth / 2, 6);

  if (node.kind === 'circle') {
    const rx = node.size.width / 2;
    const ry = node.size.height / 2;
    const cx = rx;
    const cy = ry;
    const dx = (localX - cx) / (rx + buffer);
    const dy = (localY - cy) / (ry + buffer);
    return dx * dx + dy * dy <= 1;
  }

  if (node.kind === 'pen' && node.points && node.points.length > 0) {
    // Check distance to any point segment
    for (let i = 0; i < node.points.length; i++) {
      const p = node.points[i];
      const worldP = { x: node.position.x + p.x, y: node.position.y + p.y };
      const dist = Math.hypot(point.x - worldP.x, point.y - worldP.y);
      if (dist <= buffer + 4) return true;
    }
    return false;
  }

  if (node.kind === 'line' || node.kind === 'arrow') {
    const p1 = { x: node.position.x, y: node.position.y };
    const p2 = { x: node.position.x + node.size.width, y: node.position.y + node.size.height };
    const dist = distanceToSegment(point, p1, p2);
    return dist <= buffer + 4;
  }

  // Standard box bounds (Rectangle, Text, etc.)
  return (
    localX >= -buffer &&
    localX <= node.size.width + buffer &&
    localY >= -buffer &&
    localY <= node.size.height + buffer
  );
}

/**
 * Shortest distance from a point to a line segment p1-p2.
 */
function distanceToSegment(p: Point, p1: Point, p2: Point): number {
  const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - p1.x, p.y - p1.y);
  let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

/**
 * Hit test for selection handles (resize/rotate) of a selected node.
 */
export function getHitHandle(point: Point, node: CanvasNode, zoom: number): ResizeHandle | null {
  const center = getNodeCenter(node);
  const rad = (node.rotation * Math.PI) / 180;
  const localCorners = getLocalCorners(node.size);
  const handleRadius = (HANDLE_SIZE / zoom) + 4;

  for (const [handleKey, corner] of Object.entries(localCorners)) {
    const unrotatedWorld = {
      x: node.position.x + corner.x,
      y: node.position.y + corner.y
    };
    const worldPos = rotatePoint(unrotatedWorld, center, rad);
    const dist = Math.hypot(point.x - worldPos.x, point.y - worldPos.y);

    if (dist <= handleRadius) {
      return handleKey as ResizeHandle;
    }
  }

  return null;
}
