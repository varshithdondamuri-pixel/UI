import { IntentNode } from '../recognition/RecognitionTypes';
import { SpacingRules } from './BlueprintTypes';

export class SpacingPlanner {
  /**
   * Logical spacing scale constants (in px or logical units).
   */
  public static readonly SPACING_SCALE = {
    XS: 8,
    S: 12,
    M: 16,
    L: 24,
    XL: 32,
    XXL: 48,
    XXXL: 64,
    HUGE: 80
  };

  /**
   * Determine logical section spacing, internal spacing, content padding, margins, and safe areas.
   */
  public planSpacing(node: IntentNode): SpacingRules {
    const type = node.type.toLowerCase();

    let sectionSpacing = SpacingPlanner.SPACING_SCALE.XL; // default 32
    let internalSpacing = SpacingPlanner.SPACING_SCALE.M; // default 16
    let contentPadding = { top: 16, right: 16, bottom: 16, left: 16 };
    let margins = { top: 0, right: 0, bottom: 0, left: 0 };
    let safeAreas = { top: 0, right: 0, bottom: 0, left: 0 };

    if (type.includes('page') || type.includes('landing_page')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.XXXL; // 64
      internalSpacing = SpacingPlanner.SPACING_SCALE.XL; // 32
      contentPadding = { top: 0, right: 24, bottom: 48, left: 24 };
      safeAreas = { top: 44, right: 16, bottom: 34, left: 16 }; // Safe areas for mobile/desktop viewports
    } else if (type.includes('navbar') || type.includes('header')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.M; // 16
      internalSpacing = SpacingPlanner.SPACING_SCALE.M; // 16
      contentPadding = { top: 16, right: 32, bottom: 16, left: 32 };
      margins = { top: 0, right: 0, bottom: 16, left: 0 };
      safeAreas = { top: 20, right: 16, bottom: 0, left: 16 };
    } else if (type.includes('hero')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.HUGE; // 80
      internalSpacing = SpacingPlanner.SPACING_SCALE.L; // 24
      contentPadding = { top: 64, right: 32, bottom: 64, left: 32 };
      margins = { top: 0, right: 0, bottom: 32, left: 0 };
    } else if (type.includes('feature') || type.includes('testimonial') || type.includes('cta')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.XXL; // 48
      internalSpacing = SpacingPlanner.SPACING_SCALE.L; // 24
      contentPadding = { top: 48, right: 24, bottom: 48, left: 24 };
      margins = { top: 0, right: 0, bottom: 24, left: 0 };
    } else if (type.includes('card_grid') || type.includes('grid')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.XL; // 32
      internalSpacing = SpacingPlanner.SPACING_SCALE.L; // 24
      contentPadding = { top: 24, right: 0, bottom: 24, left: 0 };
    } else if (type.includes('card')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.M; // 16
      internalSpacing = SpacingPlanner.SPACING_SCALE.S; // 12
      contentPadding = { top: 20, right: 20, bottom: 20, left: 20 };
    } else if (type.includes('footer')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.XXL; // 48
      internalSpacing = SpacingPlanner.SPACING_SCALE.L; // 24
      contentPadding = { top: 40, right: 32, bottom: 40, left: 32 };
      safeAreas = { top: 0, right: 16, bottom: 34, left: 16 };
    } else if (type.includes('button')) {
      sectionSpacing = SpacingPlanner.SPACING_SCALE.XS; // 8
      internalSpacing = SpacingPlanner.SPACING_SCALE.XS; // 8
      contentPadding = { top: 12, right: 24, bottom: 12, left: 24 };
    }

    return {
      sectionSpacing,
      internalSpacing,
      contentPadding,
      margins,
      safeAreas
    };
  }
}
