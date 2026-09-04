import { CanvasNode, NodeKind, CoreEvent } from '../../types';
import { generateUUID } from '../../utils/uuid';
import { TypedEventBus } from '../events/EventBus';

export class SceneGraph {
  private nodes: Map<string, CanvasNode> = new Map();
  private eventBus: TypedEventBus;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Factory function to create a new, compliant CanvasNode.
   */
  public createNode(params: Partial<CanvasNode> & { kind: NodeKind }): CanvasNode {
    const now = Date.now();
    const existingZIndexes = Array.from(this.nodes.values()).map((n) => n.zIndex);
    const nextZIndex = existingZIndexes.length > 0 ? Math.max(...existingZIndexes) + 1 : 1;

    return {
      uuid: params.uuid || generateUUID(),
      kind: params.kind,
      position: params.position || { x: 0, y: 0 },
      size: params.size || { width: 100, height: 100 },
      rotation: params.rotation ?? 0,
      stroke: params.stroke || '#3b82f6',
      fill: params.fill || 'transparent',
      strokeWidth: params.strokeWidth ?? 2,
      visibility: params.visibility ?? true,
      locked: params.locked ?? false,
      layerId: params.layerId || 'layer-1',
      parentId: params.parentId || null,
      children: params.children || [],
      zIndex: params.zIndex ?? nextZIndex,
      createdAt: params.createdAt || now,
      updatedAt: now,
      text: params.text,
      points: params.points,
      metadata: {
        semanticLabel: null,
        userLabel: null,
        confidence: 1.0,
        notes: null,
        ...(params.metadata || {})
      }
    };
  }

  public addNode(node: CanvasNode): void {
    this.nodes.set(node.uuid, { ...node });
    this.eventBus.emit(CoreEvent.NODE_CREATED, { node: { ...node } });
  }

  public updateNode(uuid: string, updates: Partial<CanvasNode>): void {
    const existing = this.nodes.get(uuid);
    if (!existing) return;

    const updatedNode: CanvasNode = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      metadata: updates.metadata
        ? { ...existing.metadata, ...updates.metadata }
        : existing.metadata
    };

    this.nodes.set(uuid, updatedNode);
    this.eventBus.emit(CoreEvent.NODE_UPDATED, { node: { ...updatedNode } });
  }

  public removeNode(uuid: string): CanvasNode | null {
    const node = this.nodes.get(uuid);
    if (node) {
      this.nodes.delete(uuid);

      // Keep the hierarchy consistent on both sides of the relationship: a
      // surviving parent should stop listing a deleted child, and a
      // surviving child should not keep pointing at a parentId that no
      // longer resolves to anything (that's what "orphaned" means here).
      if (node.parentId) {
        const parent = this.nodes.get(node.parentId);
        if (parent && parent.children.includes(uuid)) {
          this.nodes.set(parent.uuid, { ...parent, children: parent.children.filter((id) => id !== uuid) });
        }
      }
      for (const child of node.children) {
        const childNode = this.nodes.get(child);
        if (childNode) {
          this.nodes.set(child, { ...childNode, parentId: null });
        }
      }

      this.eventBus.emit(CoreEvent.NODE_DELETED, { uuid });
      return node;
    }
    return null;
  }

  public getNode(uuid: string): CanvasNode | null {
    const node = this.nodes.get(uuid);
    return node ? { ...node } : null;
  }

  public getNodes(): CanvasNode[] {
    return Array.from(this.nodes.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  public clear(): void {
    this.nodes.clear();
    this.eventBus.emit(CoreEvent.SCENE_CLEARED, undefined);
  }
}
