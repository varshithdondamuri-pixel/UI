import { CanvasNode } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { BoxedNode } from './GenerationTree';
import { generateUUID } from '../../utils/uuid';

/**
 * Walks a boxed generation tree and constructs CanvasNodes for every node —
 * via SceneGraph.createNode (a pure factory — it does not mutate the graph)
 * — mirroring the tree's parent/child structure through `parentId` and
 * `children`. Callers decide when/whether to actually clear() and addNode()
 * the result, which is what makes generation atomic: nothing touches the
 * live scene until every node has been built successfully.
 *
 * Structural wrappers (the page root, a sidebar/main-column row — nodes with
 * `invisible: true`, meaning no fill/stroke of their own) still become real
 * CanvasNodes, just with `visibility: false`. Both CanvasRenderer.drawNode
 * and SelectionEngine's hit test (isPointInNode) already skip nodes with
 * visibility === false, so these are never drawn and never selectable — but
 * the emitted hierarchy exactly mirrors the composition tree, with no gaps
 * in depth and no orphans. The alternative (skip them entirely and reparent
 * their children to the nearest rendering ancestor) would make the emitted
 * tree's depth diverge from the composition tree's depth for any section
 * that goes through a wrapper (e.g. a sidebar layout), which is the thing
 * this function is meant to preserve.
 */
export function emitGenerationTree(sceneGraph: SceneGraph, root: BoxedNode): CanvasNode[] {
  // Pass 1: assign every node its id up front. Children need to know their
  // own id before their parent (which needs it to fill `children`) is built,
  // and the parent must still be *created* before its children so that
  // z-index assignment order — and therefore render order — stays exactly
  // what it was before this change (SceneGraph.createNode assigns the next
  // z-index sequentially as each node is created).
  const ids = new Map<BoxedNode, string>();
  const assignIds = (boxed: BoxedNode) => {
    ids.set(boxed, generateUUID());
    boxed.children.forEach(assignIds);
  };
  assignIds(root);

  // Pass 2: create nodes in the same pre-order (parent before children) the
  // flat emitter always used.
  const nodes: CanvasNode[] = [];
  const walk = (boxed: BoxedNode, parentId: string | null) => {
    const uuid = ids.get(boxed)!;
    const childIds = boxed.children.map((child) => ids.get(child)!);

    const node = sceneGraph.createNode({
      uuid,
      kind: boxed.kind === 'text' ? 'text' : 'rectangle',
      position: { x: boxed.box.minX, y: boxed.box.minY },
      size: { width: boxed.box.width, height: boxed.box.height },
      fill: boxed.style.fill,
      stroke: boxed.style.stroke,
      strokeWidth: boxed.style.strokeWidth,
      text: boxed.kind === 'text' ? boxed.text : undefined,
      visibility: !boxed.invisible,
      parentId,
      children: childIds,
      metadata: {
        semanticLabel: boxed.role,
        userLabel: boxed.text || humanizeRole(boxed.role),
        confidence: 1,
        notes: null
      }
    });
    nodes.push(node);

    boxed.children.forEach((child) => walk(child, uuid));
  };

  walk(root, null);
  return nodes;
}

function humanizeRole(role: string): string {
  return role
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
