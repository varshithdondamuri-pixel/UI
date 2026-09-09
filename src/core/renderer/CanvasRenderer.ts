import { SceneGraph } from '../scene/SceneGraph';
import { ViewportEngine } from '../viewport/ViewportEngine';
import { SelectionEngine } from '../selection/SelectionEngine';
import { ToolManager } from '../tools/ToolManager';
import { CanvasNode } from '../../types';
import { rotatePoint, getNodeCenter, getLocalCorners } from '../../utils/math';
import { SketchAnalyzer } from '../recognition/SketchAnalyzer';
import { SemanticComponentRenderer } from './SemanticComponentRenderer';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D | null = null;
  private sceneGraph: SceneGraph;
  private viewportEngine: ViewportEngine;
  private selectionEngine: SelectionEngine;
  private toolManager: ToolManager;
  private sketchAnalyzer: SketchAnalyzer | null = null;
  private animationFrameId: number | null = null;
  private semanticRenderer: SemanticComponentRenderer;

  constructor(
    sceneGraph: SceneGraph,
    viewportEngine: ViewportEngine,
    selectionEngine: SelectionEngine,
    toolManager: ToolManager,
    sketchAnalyzer?: SketchAnalyzer
  ) {
    this.sceneGraph = sceneGraph;
    this.viewportEngine = viewportEngine;
    this.selectionEngine = selectionEngine;
    this.toolManager = toolManager;
    this.sketchAnalyzer = sketchAnalyzer || null;
    this.semanticRenderer = new SemanticComponentRenderer();

    this.render = this.render.bind(this);
  }

  public setSketchAnalyzer(analyzer: SketchAnalyzer): void {
    this.sketchAnalyzer = analyzer;
  }

  public getSketchAnalyzer(): SketchAnalyzer | null {
    return this.sketchAnalyzer;
  }

  public attach(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
    this.startLoop();
  }

  public detach(): void {
    this.stopLoop();
    this.ctx = null;
  }

  public startLoop(): void {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.render);
    }
  }

  public stopLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public render(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    const viewport = this.viewportEngine.getViewport();
    const grid = this.toolManager.getGridSettings();

    // 1. Clear background
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0f172a'; // Sleek dark slate canvas background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    // Apply viewport transformation (Pan & Zoom)
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // 2. Draw Infinite Grid
    if (grid.visible) {
      this.drawGrid(ctx, canvas.width, canvas.height, viewport, grid.size);
    }

    // 3. Draw Scene Graph Nodes (Raw sketch input)
    const nodes = this.sceneGraph.getNodes();
    for (const node of nodes) {
      if (node.visibility) {
        this.drawNode(ctx, node);
      }
    }

    // 4. Draw Active Tool Preview Node
    const previewNode = this.toolManager.getActiveTool().getPreviewNode?.();
    if (previewNode) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      this.drawNode(ctx, previewNode);
      ctx.restore();
    }

    // 5. Draw Selection Bounding Box & Handles
    const selectedNode = this.selectionEngine.getSelectedNode();
    if (selectedNode) {
      this.drawSelectionOverlay(ctx, selectedNode, viewport.zoom);
    }

    ctx.restore();

    this.animationFrameId = requestAnimationFrame(this.render);
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    viewport: { x: number; y: number; zoom: number },
    gridSize: number
  ): void {
    const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize;
    const endX = startX + (width / viewport.zoom) + gridSize * 2;
    const endY = startY + (height / viewport.zoom) + gridSize * 2;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1 / viewport.zoom;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawNode(ctx: CanvasRenderingContext2D, node: CanvasNode): void {
    ctx.save();

    const center = getNodeCenter(node);
    if (node.rotation) {
      ctx.translate(center.x, center.y);
      ctx.rotate((node.rotation * Math.PI) / 180);
      ctx.translate(-center.x, -center.y);
    }

    ctx.strokeStyle = node.stroke;
    ctx.fillStyle = node.fill;
    ctx.lineWidth = node.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (node.kind) {
      case 'rectangle': {
        if (node.metadata && (node.metadata.semanticLabel || node.metadata.userLabel)) {
          this.semanticRenderer.renderSemanticNode(ctx, node, this.resolveDescendants(node));
        } else {
          ctx.beginPath();
          ctx.rect(node.position.x, node.position.y, node.size.width, node.size.height);
          if (node.fill !== 'transparent') ctx.fill();
          ctx.stroke();
        }
        break;
      }
      case 'circle': {
        const rx = node.size.width / 2;
        const ry = node.size.height / 2;
        const cx = node.position.x + rx;
        const cy = node.position.y + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
        if (node.fill !== 'transparent') ctx.fill();
        ctx.stroke();
        break;
      }
      case 'line': {
        ctx.beginPath();
        ctx.moveTo(node.position.x, node.position.y);
        ctx.lineTo(node.position.x + node.size.width, node.position.y + node.size.height);
        ctx.stroke();
        break;
      }
      case 'arrow': {
        const p1 = node.position;
        const p2 = { x: node.position.x + node.size.width, y: node.position.y + node.size.height };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw Arrowhead
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = Math.max(12, node.strokeWidth * 4);
        ctx.save();
        ctx.fillStyle = node.stroke;
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(
          p2.x - headLen * Math.cos(angle - Math.PI / 6),
          p2.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          p2.x - headLen * Math.cos(angle + Math.PI / 6),
          p2.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'pen': {
        if (node.points && node.points.length > 0) {
          ctx.beginPath();
          const p0 = node.points[0];
          ctx.moveTo(node.position.x + p0.x, node.position.y + p0.y);
          for (let i = 1; i < node.points.length; i++) {
            const p = node.points[i];
            ctx.lineTo(node.position.x + p.x, node.position.y + p.y);
          }
          ctx.stroke();
        }
        break;
      }
      case 'text': {
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = node.stroke || '#ffffff';
        ctx.textBaseline = 'top';
        ctx.fillText(node.text || 'Text', node.position.x, node.position.y);
        break;
      }
    }

    ctx.restore();
  }

  /**
   * Flattens every descendant of `node` (not just direct children) into a
   * single list, so semantic renderers can find real content — e.g. a
   * navbar's cart-button label two levels down inside its nav-cta child —
   * without needing to know the generated tree's exact nesting per role.
   */
  private resolveDescendants(node: CanvasNode): CanvasNode[] {
    const result: CanvasNode[] = [];
    const visit = (n: CanvasNode) => {
      for (const childId of n.children) {
        const child = this.sceneGraph.getNode(childId);
        if (!child) continue;
        result.push(child);
        visit(child);
      }
    };
    visit(node);
    return result;
  }

  private drawSelectionOverlay(ctx: CanvasRenderingContext2D, node: CanvasNode, zoom: number): void {
    ctx.save();

    const center = getNodeCenter(node);
    const rad = (node.rotation * Math.PI) / 180;

    // Bounding Box stroke
    ctx.strokeStyle = '#38bdf8'; // Sky blue selection border
    ctx.lineWidth = 1.5 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rad);
    ctx.translate(-center.x, -center.y);
    ctx.strokeRect(node.position.x, node.position.y, node.size.width, node.size.height);
    ctx.restore();

    // Handles
    const localCorners = getLocalCorners(node.size);
    const handleSize = 8 / zoom;

    for (const [key, corner] of Object.entries(localCorners)) {
      const unrotated = { x: node.position.x + corner.x, y: node.position.y + corner.y };
      const worldPos = rotatePoint(unrotated, center, rad);

      ctx.beginPath();
      if (key === 'rotate') {
        // Draw stem to rotate handle
        const topUnrotated = { x: node.position.x + node.size.width / 2, y: node.position.y };
        const topWorld = rotatePoint(topUnrotated, center, rad);

        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(topWorld.x, topWorld.y);
        ctx.lineTo(worldPos.x, worldPos.y);
        ctx.stroke();
        ctx.restore();

        // Rotate circle handle
        ctx.arc(worldPos.x, worldPos.y, handleSize / 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / zoom;
        ctx.stroke();
      } else {
        // Square resize handle
        ctx.rect(
          worldPos.x - handleSize / 2,
          worldPos.y - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([]);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
