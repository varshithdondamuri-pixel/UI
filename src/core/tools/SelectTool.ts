import { ITool, InteractionEvent } from './ITool';
import { ToolKind, CanvasNode, Point, ResizeHandle, GridSettings } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { SelectionEngine } from '../selection/SelectionEngine';
import { HistoryEngine } from '../history/HistoryEngine';
import { UpdateNodeCommand } from '../history/commands';
import { getHitHandle } from '../../utils/hitTest';
import { getNodeCenter, snapPointToGrid } from '../../utils/math';

export class SelectTool implements ITool {
  id: ToolKind = 'select';
  private activeMode: 'idle' | 'dragging' | 'resizing' | 'rotating' = 'idle';
  private startWorldPoint: Point | null = null;
  private initialNodeState: CanvasNode | null = null;
  private activeHandle: ResizeHandle | null = null;

  constructor(
    private sceneGraph: SceneGraph,
    private selectionEngine: SelectionEngine,
    private historyEngine: HistoryEngine,
    private getGridSettings: () => GridSettings,
    private getZoom: () => number
  ) {}

  onPointerDown(e: InteractionEvent): void {
    if (e.button !== 0) return;
    this.startWorldPoint = e.worldPoint;

    const selectedNode = this.selectionEngine.getSelectedNode();

    // 1. Check handle hit on selected node
    if (selectedNode) {
      const handle = getHitHandle(e.worldPoint, selectedNode, this.getZoom());
      if (handle) {
        this.activeHandle = handle;
        this.initialNodeState = { ...selectedNode };
        this.activeMode = handle === 'rotate' ? 'rotating' : 'resizing';
        return;
      }
    }

    // 2. Node hit test
    const hitNode = this.selectionEngine.hitTest(e.worldPoint);
    if (hitNode) {
      this.selectionEngine.select(hitNode.uuid);
      this.initialNodeState = { ...hitNode };
      this.activeMode = 'dragging';
    } else {
      this.selectionEngine.select(null);
      this.activeMode = 'idle';
    }
  }

  onPointerMove(e: InteractionEvent): void {
    if (this.activeMode === 'idle' || !this.startWorldPoint || !this.initialNodeState) return;

    const selectedUuid = this.selectionEngine.getSelectedUuid();
    if (!selectedUuid) return;

    const grid = this.getGridSettings();

    if (this.activeMode === 'dragging') {
      const dx = e.worldPoint.x - this.startWorldPoint.x;
      const dy = e.worldPoint.y - this.startWorldPoint.y;

      let newX = this.initialNodeState.position.x + dx;
      let newY = this.initialNodeState.position.y + dy;

      if (grid.snap) {
        const snapped = snapPointToGrid({ x: newX, y: newY }, grid.size);
        newX = snapped.x;
        newY = snapped.y;
      }

      this.sceneGraph.updateNode(selectedUuid, {
        position: { x: newX, y: newY }
      });
    } else if (this.activeMode === 'resizing' && this.activeHandle) {
      const dx = e.worldPoint.x - this.startWorldPoint.x;
      const dy = e.worldPoint.y - this.startWorldPoint.y;

      let newPos = { ...this.initialNodeState.position };
      let newWidth = this.initialNodeState.size.width;
      let newHeight = this.initialNodeState.size.height;

      const handle = this.activeHandle;

      if (handle.includes('e')) newWidth = Math.max(10, this.initialNodeState.size.width + dx);
      if (handle.includes('s')) newHeight = Math.max(10, this.initialNodeState.size.height + dy);
      if (handle.includes('w')) {
        const potentialW = this.initialNodeState.size.width - dx;
        if (potentialW >= 10) {
          newWidth = potentialW;
          newPos.x = this.initialNodeState.position.x + dx;
        }
      }
      if (handle.includes('n') && handle !== 'ne' && handle !== 'nw') {
        const potentialH = this.initialNodeState.size.height - dy;
        if (potentialH >= 10) {
          newHeight = potentialH;
          newPos.y = this.initialNodeState.position.y + dy;
        }
      }

      if (grid.snap) {
        const snappedPos = snapPointToGrid(newPos, grid.size);
        newPos = snappedPos;
      }

      this.sceneGraph.updateNode(selectedUuid, {
        position: newPos,
        size: { width: newWidth, height: newHeight }
      });
    } else if (this.activeMode === 'rotating') {
      const center = getNodeCenter(this.initialNodeState);
      const angleRad = Math.atan2(e.worldPoint.y - center.y, e.worldPoint.x - center.x);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);

      // Snap rotation to 15-degree increments if shift key is pressed
      if (e.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      }

      this.sceneGraph.updateNode(selectedUuid, { rotation: angleDeg % 360 });
    }
  }

  onPointerUp(_e: InteractionEvent): void {
    if (this.activeMode !== 'idle' && this.initialNodeState) {
      const currentNode = this.selectionEngine.getSelectedNode();
      if (currentNode && hasNodeStateChanged(this.initialNodeState, currentNode)) {
        this.historyEngine.execute(
          new UpdateNodeCommand(
            this.sceneGraph,
            currentNode.uuid,
            {
              position: this.initialNodeState.position,
              size: this.initialNodeState.size,
              rotation: this.initialNodeState.rotation
            },
            {
              position: currentNode.position,
              size: currentNode.size,
              rotation: currentNode.rotation
            }
          )
        );
      }
    }
    this.cancel();
  }

  cancel(): void {
    this.activeMode = 'idle';
    this.startWorldPoint = null;
    this.initialNodeState = null;
    this.activeHandle = null;
  }

  deactivate(): void {
    this.cancel();
  }
}

function hasNodeStateChanged(a: CanvasNode, b: CanvasNode): boolean {
  return (
    a.position.x !== b.position.x ||
    a.position.y !== b.position.y ||
    a.size.width !== b.size.width ||
    a.size.height !== b.size.height ||
    a.rotation !== b.rotation
  );
}
