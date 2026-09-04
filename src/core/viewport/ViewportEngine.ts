import { Point, Viewport, CoreEvent, BoundingBox, Size } from '../../types';
import { TypedEventBus } from '../events/EventBus';

export class ViewportEngine {
  private viewport: Viewport = { x: 0, y: 0, zoom: 1 };
  private eventBus: TypedEventBus;
  private minZoom = 0.1;
  private maxZoom = 10.0;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  public getViewport(): Viewport {
    return { ...this.viewport };
  }

  public setViewport(viewport: Partial<Viewport>): void {
    this.viewport = {
      x: viewport.x ?? this.viewport.x,
      y: viewport.y ?? this.viewport.y,
      zoom: Math.min(this.maxZoom, Math.max(this.minZoom, viewport.zoom ?? this.viewport.zoom))
    };
    this.emitChange();
  }

  public panBy(deltaX: number, deltaY: number): void {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
    this.emitChange();
  }

  public zoomAt(screenPoint: Point, zoomFactor: number): void {
    const oldZoom = this.viewport.zoom;
    const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, oldZoom * zoomFactor));

    if (newZoom === oldZoom) return;

    // Adjust pan so point under cursor stays at exact screen position
    const worldP = this.screenToWorld(screenPoint);

    this.viewport.zoom = newZoom;
    this.viewport.x = screenPoint.x - worldP.x * newZoom;
    this.viewport.y = screenPoint.y - worldP.y * newZoom;

    this.emitChange();
  }

  public resetZoom(): void {
    this.setViewport({ zoom: 1 });
  }

  public fitToScreen(bounds: BoundingBox[], containerSize: Size): void {
    if (bounds.length === 0) {
      this.setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const b of bounds) {
      if (b.minX < minX) minX = b.minX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.maxY > maxY) maxY = b.maxY;
    }

    const worldWidth = maxX - minX || 100;
    const worldHeight = maxY - minY || 100;
    const padding = 60;

    const scaleX = (containerSize.width - padding * 2) / worldWidth;
    const scaleY = (containerSize.height - padding * 2) / worldHeight;
    const zoom = Math.min(this.maxZoom, Math.max(this.minZoom, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.viewport = {
      zoom,
      x: containerSize.width / 2 - centerX * zoom,
      y: containerSize.height / 2 - centerY * zoom
    };

    this.emitChange();
  }

  public screenToWorld(screenPoint: Point): Point {
    return {
      x: (screenPoint.x - this.viewport.x) / this.viewport.zoom,
      y: (screenPoint.y - this.viewport.y) / this.viewport.zoom
    };
  }

  public worldToScreen(worldPoint: Point): Point {
    return {
      x: worldPoint.x * this.viewport.zoom + this.viewport.x,
      y: worldPoint.y * this.viewport.zoom + this.viewport.y
    };
  }

  private emitChange(): void {
    this.eventBus.emit(CoreEvent.VIEWPORT_CHANGED, { viewport: this.getViewport() });
  }
}
