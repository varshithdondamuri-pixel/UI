import { IconRenderer } from './IconRenderer';
import { IllustrationRenderer } from './IllustrationRenderer';
import { RenderNode } from './RenderNode';
import { ShapeRenderer } from './ShapeRenderer';
import { TextRenderer } from './TextRenderer';

export class ComponentRenderer {
  private shapeRenderer = new ShapeRenderer();
  private textRenderer = new TextRenderer();
  private iconRenderer = new IconRenderer();
  private illustrationRenderer = new IllustrationRenderer();

  /**
   * Renders preview components onto Canvas 2D context.
   */
  public renderComponent(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    if (!node.visibility) return;

    switch (node.componentType) {
      case 'Navbar':
        this.renderNavbar(ctx, node);
        break;

      case 'Hero':
        this.renderHero(ctx, node);
        break;

      case 'Button':
        this.renderButton(ctx, node);
        break;

      case 'Card':
      case 'Pricing Card':
        this.renderCard(ctx, node);
        break;

      case 'Feature Grid':
      case 'Grid':
        this.renderGrid(ctx, node);
        break;

      case 'Sidebar':
        this.renderSidebar(ctx, node);
        break;

      case 'Footer':
        this.renderFooter(ctx, node);
        break;

      case 'Input':
      case 'Search':
        this.renderInput(ctx, node);
        break;

      case 'Table':
        this.renderTable(ctx, node);
        break;

      case 'Chart Placeholder':
        this.renderChartPlaceholder(ctx, node);
        break;

      default:
        this.shapeRenderer.renderShape(ctx, node);
        this.textRenderer.renderText(ctx, node);
        break;
    }
  }

  private renderNavbar(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.iconRenderer.renderIcon(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Navigation Bar');
  }

  private renderHero(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.illustrationRenderer.renderIllustration(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Hero Title & Subtitle');
  }

  private renderButton(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.iconRenderer.renderIcon(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Action Button');
  }

  private renderCard(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.illustrationRenderer.renderIllustration(ctx, node);
    this.textRenderer.renderText(ctx, node, node.componentType);
  }

  private renderGrid(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Feature Grid Layout');
  }

  private renderSidebar(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.iconRenderer.renderIcon(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Sidebar Menu');
  }

  private renderFooter(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Footer Navigation & Copyright');
  }

  private renderInput(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.iconRenderer.renderIcon(ctx, node);
    this.textRenderer.renderText(ctx, node, node.componentType === 'Search' ? 'Search...' : 'Input field...');
  }

  private renderTable(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Data Grid / Table');

    // Draw preview table grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const rowH = 24;
    for (let y = node.bounds.minY + 30; y < node.bounds.maxY; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(node.bounds.minX + 10, y);
      ctx.lineTo(node.bounds.maxX - 10, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderChartPlaceholder(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    this.shapeRenderer.renderShape(ctx, node);
    this.textRenderer.renderText(ctx, node, 'Analytics Chart');

    // Draw preview line graph
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const x0 = node.bounds.minX + 20;
    const y0 = node.bounds.maxY - 15;
    const w = node.bounds.width - 40;
    const h = node.bounds.height - 40;

    ctx.moveTo(x0, y0 - h * 0.2);
    ctx.lineTo(x0 + w * 0.25, y0 - h * 0.6);
    ctx.lineTo(x0 + w * 0.5, y0 - h * 0.4);
    ctx.lineTo(x0 + w * 0.75, y0 - h * 0.85);
    ctx.lineTo(x0 + w, y0 - h * 0.5);
    ctx.stroke();
    ctx.restore();
  }
}
