import { ITool, InteractionEvent } from './ITool';
import { ToolKind, CanvasNode, GridSettings } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { HistoryEngine } from '../history/HistoryEngine';
import { CreateNodeCommand } from '../history/commands';
import { snapPointToGrid } from '../../utils/math';

export class RectTool implements ITool {
  id: ToolKind = 'rectangle';
  private previewNode: CanvasNode | null = null;
  private startPoint: { x: number; y: number } | null = null;

  constructor(
    private sceneGraph: SceneGraph,
    private historyEngine: HistoryEngine,
    private getGridSettings: () => GridSettings,
    private getDefaultStyle: () => { stroke: string; fill: string; strokeWidth: number }
  ) {}

  onPointerDown(e: InteractionEvent): void {
    if (e.button !== 0) return;
    const grid = this.getGridSettings();
    const point = grid.snap ? snapPointToGrid(e.worldPoint, grid.size) : e.worldPoint;
    this.startPoint = point;

    const style = this.getDefaultStyle();
    this.previewNode = this.sceneGraph.createNode({
      kind: 'rectangle',
      position: { ...point },
      size: { width: 0, height: 0 },
      stroke: style.stroke,
      fill: style.fill,
      strokeWidth: style.strokeWidth
    });
  }

  onPointerMove(e: InteractionEvent): void {
    if (!this.startPoint || !this.previewNode) return;
    const grid = this.getGridSettings();
    const currPoint = grid.snap ? snapPointToGrid(e.worldPoint, grid.size) : e.worldPoint;

    const x = Math.min(this.startPoint.x, currPoint.x);
    const y = Math.min(this.startPoint.y, currPoint.y);
    const width = Math.abs(currPoint.x - this.startPoint.x);
    const height = Math.abs(currPoint.y - this.startPoint.y);

    this.previewNode = {
      ...this.previewNode,
      position: { x, y },
      size: { width, height }
    };
  }

  onPointerUp(_e: InteractionEvent): void {
    if (this.previewNode && (this.previewNode.size.width > 2 || this.previewNode.size.height > 2)) {
      this.historyEngine.execute(new CreateNodeCommand(this.sceneGraph, this.previewNode));
    }
    this.cancel();
  }

  cancel(): void {
    this.previewNode = null;
    this.startPoint = null;
  }

  deactivate(): void {
    this.cancel();
  }

  getPreviewNode(): CanvasNode | null {
    return this.previewNode;
  }
}
