import { RenderNode } from './RenderNode';

export class ShapeRenderer {
  /**
   * Renders node background, rounded borders, shadows, and glass backdrop effects onto Canvas 2D.
   */
  public renderShape(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const { bounds, styleReference } = node;
    const { background, border, borderRadius, shadow, elevation } = styleReference;

    ctx.save();

    // 1. Elevation Shadow
    if (elevation > 0 && shadow && shadow !== 'none') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = elevation * 6;
      ctx.shadowOffsetY = elevation * 2;
    }

    // Parse border radius number
    const r = typeof borderRadius === 'number' ? borderRadius : parseInt(String(borderRadius), 10) || 6;

    // Create rounded rect path
    ctx.beginPath();
    this.roundRectPath(ctx, bounds.minX, bounds.minY, bounds.width, bounds.height, r);

    // 2. Background Fill
    if (background.type === 'gradient' && background.gradient) {
      const grad = ctx.createLinearGradient(
        bounds.minX,
        bounds.minY,
        bounds.minX + bounds.width,
        bounds.minY + bounds.height
      );
      grad.addColorStop(0, background.color || 'rgba(30, 41, 59, 0.9)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
      ctx.fillStyle = grad;
    } else if (background.type === 'glass') {
      ctx.fillStyle = background.color || 'rgba(255, 255, 255, 0.08)';
    } else {
      ctx.fillStyle = background.color || '#1e293b';
    }

    ctx.fill();

    // Clear shadow before stroke
    ctx.shadowColor = 'transparent';

    // 3. Border Stroke
    if (border && border.width > 0) {
      ctx.lineWidth = border.width;
      ctx.strokeStyle = border.color || 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }

    ctx.restore();
  }

  private roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}
