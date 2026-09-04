import { ITool, InteractionEvent } from './ITool';
import { ToolKind, CanvasNode, Point, GridSettings } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { HistoryEngine } from '../history/HistoryEngine';
import { CreateNodeCommand } from '../history/commands';
import { snapPointToGrid } from '../../utils/math';

export class PenTool implements ITool {
  id: ToolKind = 'pen';
  private previewNode: CanvasNode | null = null;
  private rawPoints: Point[] = [];

  constructor(
    private sceneGraph: SceneGraph,
    private historyEngine: HistoryEngine,
    private getGridSettings: () => GridSettings,
    private getDefaultStyle: () => { stroke: string; fill: string; strokeWidth: number }
  ) {}

  onPointerDown(e: InteractionEvent): void {
    if (e.button !== 0) return;
    const grid = this.getGridSettings();
    const startPoint = grid.snap ? snapPointToGrid(e.worldPoint, grid.size) : e.worldPoint;

    this.rawPoints = [startPoint];

    const style = this.getDefaultStyle();
    this.previewNode = this.sceneGraph.createNode({
      kind: 'pen',
      position: { x: startPoint.x, y: startPoint.y },
      size: { width: 0, height: 0 },
      stroke: style.stroke,
      fill: 'transparent',
      strokeWidth: style.strokeWidth,
      points: [{ x: 0, y: 0 }]
    });
  }

  onPointerMove(e: InteractionEvent): void {
    if (this.rawPoints.length === 0 || !this.previewNode) return;
    this.rawPoints.push(e.worldPoint);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of this.rawPoints) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    const relPoints: Point[] = this.rawPoints.map((p) => ({
      x: p.x - minX,
      y: p.y - minY
    }));

    this.previewNode = {
      ...this.previewNode,
      position: { x: minX, y: minY },
      size: { width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) },
      points: relPoints
    };
  }

  onPointerUp(_e: InteractionEvent): void {
    if (this.previewNode && this.rawPoints.length > 1) {
      this.historyEngine.execute(new CreateNodeCommand(this.sceneGraph, this.previewNode));
    }
    this.cancel();
  }

  cancel(): void {
    this.previewNode = null;
    this.rawPoints = [];
  }

  deactivate(): void {
    this.cancel();
  }

  getPreviewNode(): CanvasNode | null {
    return this.previewNode;
  }
}
