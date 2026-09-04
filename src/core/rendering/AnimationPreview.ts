import { RenderNode } from './RenderNode';

export class AnimationPreview {
  /**
   * Applies lightweight preview animation pulse effects on Canvas 2D context.
   */
  public applyAnimation(ctx: CanvasRenderingContext2D, node: RenderNode, timeMs: number): void {
    const animRef = node.animationReference?.animation;
    if (!animRef) return;

    ctx.save();

    const phase = (timeMs % 2000) / 2000; // 0.0 to 1.0 phase loop

    if (animRef.type === 'hover' || animRef.type === 'micro-interaction') {
      const scale = 1 + Math.sin(phase * Math.PI * 2) * 0.015;
      const centerX = node.bounds.minX + node.bounds.width / 2;
      const centerY = node.bounds.minY + node.bounds.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
    } else if (animRef.type === 'loading') {
      // Shimmer overlay bar for loading states
      const shimmerX = node.bounds.minX + phase * node.bounds.width;
      const grad = ctx.createLinearGradient(shimmerX - 40, 0, shimmerX + 40, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(node.bounds.minX, node.bounds.minY, node.bounds.width, node.bounds.height);
    }

    ctx.restore();
  }
}
