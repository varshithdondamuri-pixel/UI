import { ViewportMode } from './RenderingTypes';

export class ResponsiveRenderer {
  private currentMode: ViewportMode = 'desktop';

  public setViewportMode(mode: ViewportMode): void {
    this.currentMode = mode;
  }

  public getViewportMode(): ViewportMode {
    return this.currentMode;
  }

  public getViewportBounds(mode: ViewportMode): { width: number; label: string } {
    switch (mode) {
      case 'mobile':
        return { width: 375, label: 'Mobile (375px)' };
      case 'tablet':
        return { width: 768, label: 'Tablet (768px)' };
      case 'desktop':
      default:
        return { width: 1200, label: 'Desktop (1200px)' };
    }
  }
}
