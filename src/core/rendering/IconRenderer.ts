import { RenderNode } from './RenderNode';

export class IconRenderer {
  /**
   * Renders preview icon placeholders onto Canvas 2D context using pure vector paths.
   */
  public renderIcon(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const iconRef = node.iconReference?.icon;
    if (!iconRef) return;

    const size = iconRef.size || 16;
    const x = node.bounds.minX + 8;
    const y = node.bounds.minY + (node.bounds.height - size) / 2;

    ctx.save();
    ctx.strokeStyle = node.styleReference.foreground?.color || '#38bdf8';
    ctx.fillStyle = node.styleReference.foreground?.color || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw vector icon shape based on suggested icon name
    switch (iconRef.suggestedName) {
      case 'menu':
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x + size, y + 4);
        ctx.moveTo(x, y + size / 2);
        ctx.lineTo(x + size, y + size / 2);
        ctx.moveTo(x, y + size - 4);
        ctx.lineTo(x + size, y + size - 4);
        ctx.stroke();
        break;

      case 'search':
        ctx.beginPath();
        ctx.arc(x + size / 2.5, y + size / 2.5, size / 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + size / 1.8, y + size / 1.8);
        ctx.lineTo(x + size - 2, y + size - 2);
        ctx.stroke();
        break;

      case 'arrow-right':
        ctx.beginPath();
        ctx.moveTo(x + 2, y + size / 2);
        ctx.lineTo(x + size - 2, y + size / 2);
        ctx.lineTo(x + size - 6, y + size / 2 - 4);
        ctx.moveTo(x + size - 2, y + size / 2);
        ctx.lineTo(x + size - 6, y + size / 2 + 4);
        ctx.stroke();
        break;

      case 'check-circle':
      default:
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }
}
