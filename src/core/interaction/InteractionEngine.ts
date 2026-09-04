import { ViewportEngine } from '../viewport/ViewportEngine';
import { ToolManager } from '../tools/ToolManager';
import { InteractionEvent } from '../tools/ITool';

export class InteractionEngine {
  private canvasEl: HTMLCanvasElement | null = null;
  private viewportEngine: ViewportEngine;
  private toolManager: ToolManager;

  private isPanning = false;
  private spacePressed = false;
  private lastPointerPos: { x: number; y: number } | null = null;

  constructor(viewportEngine: ViewportEngine, toolManager: ToolManager) {
    this.viewportEngine = viewportEngine;
    this.toolManager = toolManager;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  public attach(canvas: HTMLCanvasElement): void {
    this.canvasEl = canvas;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvasEl = null;
  }

  public handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>): void {
    if (!this.canvasEl) return;
    this.canvasEl.setPointerCapture(e.pointerId);

    const screenPoint = this.getScreenPoint(e);
    const worldPoint = this.viewportEngine.screenToWorld(screenPoint);
    this.lastPointerPos = screenPoint;

    // Pan canvas if middle mouse button or Space bar held down
    if (e.button === 1 || this.spacePressed) {
      this.isPanning = true;
      return;
    }

    const eventPayload: InteractionEvent = {
      pointerId: e.pointerId,
      screenPoint,
      worldPoint,
      button: e.button,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    };

    this.toolManager.onPointerDown(eventPayload);
  }

  public handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>): void {
    if (!this.canvasEl) return;
    const screenPoint = this.getScreenPoint(e);

    if (this.isPanning && this.lastPointerPos) {
      const dx = screenPoint.x - this.lastPointerPos.x;
      const dy = screenPoint.y - this.lastPointerPos.y;
      this.viewportEngine.panBy(dx, dy);
      this.lastPointerPos = screenPoint;
      return;
    }

    const worldPoint = this.viewportEngine.screenToWorld(screenPoint);
    const eventPayload: InteractionEvent = {
      pointerId: e.pointerId,
      screenPoint,
      worldPoint,
      button: e.button,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    };

    this.toolManager.onPointerMove(eventPayload);
    this.lastPointerPos = screenPoint;
  }

  public handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>): void {
    if (!this.canvasEl) return;
    try {
      this.canvasEl.releasePointerCapture(e.pointerId);
    } catch (_) {
      // Ignore release capture errors if pointer was lost
    }

    if (this.isPanning) {
      this.isPanning = false;
      this.lastPointerPos = null;
      return;
    }

    const screenPoint = this.getScreenPoint(e);
    const worldPoint = this.viewportEngine.screenToWorld(screenPoint);

    const eventPayload: InteractionEvent = {
      pointerId: e.pointerId,
      screenPoint,
      worldPoint,
      button: e.button,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    };

    this.toolManager.onPointerUp(eventPayload);
    this.lastPointerPos = null;
  }

  public handleWheel(e: React.WheelEvent<HTMLCanvasElement>): void {
    e.preventDefault();
    const screenPoint = this.getScreenPoint(e);
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    this.viewportEngine.zoomAt(screenPoint, zoomFactor);
  }

  private getScreenPoint(e: { clientX: number; clientY: number }): { x: number; y: number } {
    if (!this.canvasEl) return { x: e.clientX, y: e.clientY };
    const rect = this.canvasEl.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' && !this.spacePressed) {
      this.spacePressed = true;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      this.spacePressed = false;
      this.isPanning = false;
    }
  }
}
