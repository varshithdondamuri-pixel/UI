import { ComponentRenderer } from './ComponentRenderer';
import { RenderNode } from './RenderNode';

export class LayoutRenderer {
  private componentRenderer = new ComponentRenderer();

  /**
   * Recursively renders the layout tree onto Canvas 2D context.
   */
  public renderLayoutTree(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    if (!node.visibility) return;

    ctx.save();
    ctx.globalAlpha = node.opacity;

    // Render current node component
    this.componentRenderer.renderComponent(ctx, node);

    // Render children recursively in zIndex order
    if (node.children && node.children.length > 0) {
      const sortedChildren = [...node.children].sort((a, b) => a.zIndex - b.zIndex);
      for (const child of sortedChildren) {
        this.renderLayoutTree(ctx, child);
      }
    }

    ctx.restore();
  }
}
