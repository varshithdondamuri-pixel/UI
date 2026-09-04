import { SketchSample } from './DatasetTypes';
import { sanitizeText } from './DatasetSchema';

export class SketchDatasetBuilder {
  public buildSample(
    nodes: any[],
    viewport: { x: number; y: number; zoom: number },
    selectedNodeIds: string[] = [],
    sceneGraphRef: string = 'main_scene'
  ): SketchSample {
    const safeNodes = nodes || [];
    const canvasObjects = safeNodes.map((n) => ({
      id: n.uuid || n.id,
      kind: n.kind,
      position: n.position || { x: 0, y: 0 },
      size: n.size || { width: 0, height: 0 },
      rotation: n.rotation || 0,
      stroke: n.stroke,
      fill: n.fill,
      strokeWidth: n.strokeWidth,
      layerId: n.layerId,
      parentId: n.parentId || null,
      text: sanitizeText(n.text),
      isAgentCreated: Boolean(n.metadata?.agentCreated)
    }));

    const objectTypes = Array.from(new Set(safeNodes.map((n) => String(n.kind))));
    const positions = safeNodes.map((n) => ({ x: n.position?.x || 0, y: n.position?.y || 0 }));
    const sizes = safeNodes.map((n) => ({ width: n.size?.width || 0, height: n.size?.height || 0 }));
    const drawingOrder = safeNodes.map((n) => n.uuid || n.id);
    const text = safeNodes.filter((n) => n.text).map((n) => sanitizeText(n.text));

    const userCreatedObjects = safeNodes
      .filter((n) => !n.metadata?.agentCreated)
      .map((n) => n.uuid || n.id);

    const agentCreatedObjects = safeNodes
      .filter((n) => Boolean(n.metadata?.agentCreated))
      .map((n) => n.uuid || n.id);

    // Simple geometric spatial relationships calculation
    const relationships: any[] = [];
    for (let i = 0; i < safeNodes.length; i++) {
      for (let j = i + 1; j < safeNodes.length; j++) {
        const a = safeNodes[i];
        const b = safeNodes[j];
        const aCenterY = (a.position?.y || 0) + (a.size?.height || 0) / 2;
        const bCenterY = (b.position?.y || 0) + (b.size?.height || 0) / 2;

        if (Math.abs(aCenterY - bCenterY) < 20) {
          relationships.push({ type: 'aligned_horizontal', nodeA: a.uuid || a.id, nodeB: b.uuid || b.id });
        }
      }
    }

    return {
      sceneGraphReference: sceneGraphRef,
      canvasObjects,
      objectTypes,
      positions,
      sizes,
      relationships,
      text,
      drawingOrder,
      viewport: { x: viewport?.x || 0, y: viewport?.y || 0, zoom: viewport?.zoom || 1 },
      zoom: viewport?.zoom || 1,
      selectedObjects: selectedNodeIds,
      userCreatedObjects,
      agentCreatedObjects
    };
  }
}
