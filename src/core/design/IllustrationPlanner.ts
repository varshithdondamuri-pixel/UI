import { IllustrationPlacement } from './DesignTypes';

export class IllustrationPlanner {
  /**
   * Determines illustration placement for components that warrant artwork or graphic elements.
   * Purely structural definition of placement and aspect ratio.
   */
  public planIllustration(componentType: string): IllustrationPlacement | null {
    switch (componentType) {
      case 'Hero':
        return {
          type: 'hero',
          location: 'right-side-hero-banner',
          suggestedStyle: '3D isometric or sleek abstract vector graphic',
          aspectRatio: '16:9'
        };

      case 'Feature Grid':
      case 'Card':
        return {
          type: 'feature',
          location: 'card-header-graphic',
          suggestedStyle: 'Minimal line illustration or gradient spot graphic',
          aspectRatio: '4:3'
        };

      case 'Modal':
      case 'Table':
        return {
          type: 'empty-state',
          location: 'center-empty-state',
          suggestedStyle: 'Subtle spot illustration',
          aspectRatio: '1:1'
        };

      case 'Section':
        return {
          type: 'background-graphics',
          location: 'section-backdrop-glow',
          suggestedStyle: 'Radial mesh gradient or geometric grid background',
          aspectRatio: 'full'
        };

      default:
        return null;
    }
  }
}
