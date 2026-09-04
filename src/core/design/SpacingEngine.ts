import { DesignSystem, SpacingSystem } from './DesignTypes';

export class SpacingEngine {
  /**
   * Generates a mathematical spacing system based on design system compactness.
   */
  public generateSpacingSystem(designSystem: DesignSystem): SpacingSystem {
    const baseUnit = 4;
    const scale = [4, 8, 12, 16, 24, 32, 48, 64, 96];

    const compactness = designSystem.structuralRules.compactness || 'comfortable';

    let sectionSpacing = 64;
    let containerSpacing = 32;
    let componentSpacing = 16;
    let internalPadding = { top: 16, right: 16, bottom: 16, left: 16 };
    let margins = { top: 8, right: 8, bottom: 8, left: 8 };

    if (compactness === 'compact') {
      sectionSpacing = 48;
      containerSpacing = 24;
      componentSpacing = 12;
      internalPadding = { top: 12, right: 12, bottom: 12, left: 12 };
      margins = { top: 4, right: 4, bottom: 4, left: 4 };
    } else if (compactness === 'spacious') {
      sectionSpacing = 96;
      containerSpacing = 48;
      componentSpacing = 24;
      internalPadding = { top: 24, right: 24, bottom: 24, left: 24 };
      margins = { top: 12, right: 12, bottom: 12, left: 12 };
    }

    return {
      baseUnit,
      scale,
      sectionSpacing,
      containerSpacing,
      componentSpacing,
      internalPadding,
      margins
    };
  }
}
