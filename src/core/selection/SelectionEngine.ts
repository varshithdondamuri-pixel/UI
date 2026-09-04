import { CanvasNode, CoreEvent } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { TypedEventBus } from '../events/EventBus';
import { isPointInNode } from '../../utils/hitTest';
import { HistoryEngine } from '../history/HistoryEngine';
import { DeleteNodeCommand, UpdateNodeCommand } from '../history/commands';

export class SelectionEngine {
  private selectedUuid: string | null = null;
  private sceneGraph: SceneGraph;
  private eventBus: TypedEventBus;
  private historyEngine: HistoryEngine;

  constructor(sceneGraph: SceneGraph, eventBus: TypedEventBus, historyEngine: HistoryEngine) {
    this.sceneGraph = sceneGraph;
    this.eventBus = eventBus;
    this.historyEngine = historyEngine;

    // Clear selection if selected node is deleted
    this.eventBus.on(CoreEvent.NODE_DELETED, ({ uuid }) => {
      if (this.selectedUuid === uuid) {
        this.select(null);
      }
    });

    this.eventBus.on(CoreEvent.SCENE_CLEARED, () => {
      this.select(null);
    });
  }

  public getSelectedUuid(): string | null {
    return this.selectedUuid;
  }

  public getSelectedNode(): CanvasNode | null {
    return this.selectedUuid ? this.sceneGraph.getNode(this.selectedUuid) : null;
  }

  public select(uuid: string | null): void {
    if (this.selectedUuid !== uuid) {
      this.selectedUuid = uuid;
      this.eventBus.emit(CoreEvent.SELECTION_CHANGED, { selectedUuid: this.selectedUuid });
    }
  }

  public hitTest(worldPoint: { x: number; y: number }): CanvasNode | null {
    const nodes = this.sceneGraph.getNodes();
    // Search top-most zIndex first
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (!node.locked && node.visibility && isPointInNode(worldPoint, node)) {
        return node;
      }
    }
    return null;
  }

  public deleteSelected(): void {
    const node = this.getSelectedNode();
    if (node && !node.locked) {
      this.select(null);
      this.historyEngine.execute(new DeleteNodeCommand(this.sceneGraph, node));
    }
  }

  public bringForward(): void {
    const node = this.getSelectedNode();
    if (!node) return;

    const nodes = this.sceneGraph.getNodes();
    const idx = nodes.findIndex((n) => n.uuid === node.uuid);
    if (idx !== -1 && idx < nodes.length - 1) {
      const targetZIndex = nodes[idx + 1].zIndex + 1;
      this.historyEngine.execute(
        new UpdateNodeCommand(
          this.sceneGraph,
          node.uuid,
          { zIndex: node.zIndex },
          { zIndex: targetZIndex }
        )
      );
    }
  }

  public sendBackward(): void {
    const node = this.getSelectedNode();
    if (!node) return;

    const nodes = this.sceneGraph.getNodes();
    const idx = nodes.findIndex((n) => n.uuid === node.uuid);
    if (idx > 0) {
      const targetZIndex = Math.max(1, nodes[idx - 1].zIndex - 1);
      this.historyEngine.execute(
        new UpdateNodeCommand(
          this.sceneGraph,
          node.uuid,
          { zIndex: node.zIndex },
          { zIndex: targetZIndex }
        )
      );
    }
  }
}
