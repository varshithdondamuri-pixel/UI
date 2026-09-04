import { Point, Size, CanvasNode, BoundingBox } from '../types';

/**
 * Snaps a single value to the nearest grid step.
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snaps a 2D point to the nearest grid coordinates.
 */
export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize)
  };
}

/**
 * Rotates a point around a center origin by a given angle in radians.
 */
export function rotatePoint(point: Point, center: Point, angleRad: number): Point {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

/**
 * Calculates center point of a CanvasNode.
 */
export function getNodeCenter(node: CanvasNode): Point {
  return {
    x: node.position.x + node.size.width / 2,
    y: node.position.y + node.size.height / 2
  };
}

/**
 * Computes axis-aligned bounding box for a CanvasNode (taking rotation into account).
 */
export function getNodeBoundingBox(node: CanvasNode): BoundingBox {
  const { position, size, rotation } = node;
  const halfW = size.width / 2;
  const halfH = size.height / 2;
  const center = { x: position.x + halfW, y: position.y + halfH };

  if (!rotation || rotation === 0) {
    return {
      minX: position.x,
      minY: position.y,
      maxX: position.x + size.width,
      maxY: position.y + size.height,
      width: size.width,
      height: size.height
    };
  }

  const rad = (rotation * Math.PI) / 180;
  const corners: Point[] = [
    rotatePoint({ x: position.x, y: position.y }, center, rad),
    rotatePoint({ x: position.x + size.width, y: position.y }, center, rad),
    rotatePoint({ x: position.x + size.width, y: position.y + size.height }, center, rad),
    rotatePoint({ x: position.x, y: position.y + size.height }, center, rad)
  ];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const c of corners) {
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.x > maxX) maxX = c.x;
    if (c.y > maxY) maxY = c.y;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Computes unrotated local corners for selection handle positioning.
 */
export function getLocalCorners(size: Size): Record<string, Point> {
  const w = size.width;
  const h = size.height;
  return {
    nw: { x: 0, y: 0 },
    n: { x: w / 2, y: 0 },
    ne: { x: w, y: 0 },
    e: { x: w, y: h / 2 },
    se: { x: w, y: h },
    s: { x: w / 2, y: h },
    sw: { x: 0, y: h },
    w: { x: 0, y: h / 2 },
    rotate: { x: w / 2, y: -24 }
  };
}
