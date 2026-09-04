import { ITool, InteractionEvent } from './ITool';
import { ToolKind, CanvasNode, GridSettings } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { HistoryEngine } from '../history/HistoryEngine';
import { CreateNodeCommand } from '../history/commands';
import { SelectionEngine } from '../selection/SelectionEngine';
import { snapPointToGrid } from '../../utils/math';

export class TextTool implements ITool {
  id: ToolKind = 'text';
  private previewNode: CanvasNode | null = null;

  constructor(
    private sceneGraph: SceneGraph,
    private historyEngine: HistoryEngine,
    private selectionEngine: SelectionEngine,
    private getGridSettings: () => GridSettings,
    private getDefaultStyle: () => { stroke: string; fill: string; strokeWidth: number }
  ) {}

  onPointerDown(e: InteractionEvent): void {
    if (e.button !== 0) return;
    const grid = this.getGridSettings();
    const point = grid.snap ? snapPointToGrid(e.worldPoint, grid.size) : e.worldPoint;
    const style = this.getDefaultStyle();

    const textNode = this.sceneGraph.createNode({
      kind: 'text',
      position: point,
      size: { width: 140, height: 36 },
      stroke: style.stroke,
      fill: 'transparent',
      strokeWidth: 1,
      text: 'Text Label'
    });

    this.historyEngine.execute(new CreateNodeCommand(this.sceneGraph, textNode));
    this.selectionEngine.select(textNode.uuid);
  }

  onPointerMove(_e: InteractionEvent): void {}

  onPointerUp(_e: InteractionEvent): void {}

  cancel(): void {
    this.previewNode = null;
  }

  deactivate(): void {
    this.cancel();
  }

  getPreviewNode(): CanvasNode | null {
    return this.previewNode;
  }
}
