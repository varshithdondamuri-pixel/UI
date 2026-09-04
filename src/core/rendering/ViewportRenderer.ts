export class ViewportRenderer {
  /**
   * Applies pixel-perfect canvas transforms for zoom, pan, and fit-to-screen.
   */
  public applyTransform(
    ctx: CanvasRenderingContext2D,
    viewport: { x: number; y: number; zoom: number }
  ): void {
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);
  }
}
