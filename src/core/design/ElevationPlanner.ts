import { DesignSystem, ElevationPlan } from './DesignTypes';

export class ElevationPlanner {
  /**
   * Generates elevation level mapping for a design system.
   */
  public generateElevationPlan(designSystem: DesignSystem): ElevationPlan {
    const scale = designSystem.structuralRules.shadowScale;
    const isGlass = designSystem.structuralRules.defaultGlassmorphism;

    return {
      levels: {
        0: { shadow: scale[0] || 'none', zIndex: 0 },
        1: { shadow: scale[1] || 'none', zIndex: 10 },
        2: { shadow: scale[2] || 'none', zIndex: 20, backdropFilter: isGlass ? 'blur(8px)' : undefined },
        3: { shadow: scale[3] || 'none', zIndex: 30, backdropFilter: isGlass ? 'blur(12px)' : undefined },
        4: { shadow: scale[4] || 'none', zIndex: 40, backdropFilter: isGlass ? 'blur(16px)' : undefined },
        5: { shadow: scale[5] || 'none', zIndex: 50, backdropFilter: isGlass ? 'blur(24px)' : undefined }
      }
    };
  }

  /**
   * Determines appropriate elevation level (0 to 5) for a given component type.
   */
  public determineElevation(componentType: string, hierarchyLevel: number): number {
    switch (componentType) {
      case 'Modal':
        return 5;
      case 'Navbar':
        return 3;
      case 'Card':
      case 'Pricing Card':
        return 2;
      case 'Button':
      case 'Input':
      case 'Search':
        return 1;
      case 'Hero':
      case 'Section':
      case 'Feature Grid':
      default:
        return hierarchyLevel === 1 ? 0 : 1;
    }
  }
}
