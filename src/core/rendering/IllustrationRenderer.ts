import { RenderNode } from './RenderNode';

export class IllustrationRenderer {
  /**
   * Renders graphic illustration placeholders onto Canvas 2D context using abstract vector shapes.
   */
  public renderIllustration(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const illRef = node.illustrationReference?.illustration;
    if (!illRef) return;

    ctx.save();

    const x = node.bounds.minX + node.bounds.width * 0.6;
    const y = node.bounds.minY + 10;
    const w = node.bounds.width * 0.35;
    const h = node.bounds.height - 20;

    if (w > 30 && h > 30) {
      // Abstract gradient mesh placeholder box
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0.25)');

      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      ctx.stroke();

      // Placeholder label
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`[ ${illRef.type} graphic ]`, x + w / 2, y + h / 2);
    }

    ctx.restore();
  }
}
