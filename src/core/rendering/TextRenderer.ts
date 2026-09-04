import { RenderNode } from './RenderNode';

export class TextRenderer {
  /**
   * Renders typographic elements (headings, body, labels) onto Canvas 2D context.
   */
  public renderText(ctx: CanvasRenderingContext2D, node: RenderNode, textOverride?: string): void {
    const textRef = node.textReference;
    if (!textRef) return;

    const typography = textRef.typography;
    const content = textOverride || textRef.content || node.componentType;
    const fgColor = node.styleReference.foreground?.color || '#f8fafc';

    ctx.save();
    ctx.font = `${typography.fontWeight || 500} ${typography.fontSize || '14px'} ${node.styleReference.designTokens['--font-family'] || 'Inter, sans-serif'}`;
    ctx.fillStyle = fgColor;
    ctx.textBaseline = 'top';

    const paddingX = 12;
    const paddingY = 8;
    const x = node.bounds.minX + paddingX;
    const y = node.bounds.minY + paddingY;

    ctx.fillText(content, x, y);
    ctx.restore();
  }
}
