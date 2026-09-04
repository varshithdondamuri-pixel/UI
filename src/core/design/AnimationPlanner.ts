import { AnimationPlanItem, DesignSystem } from './DesignTypes';

export class AnimationPlanner {
  /**
   * Plans animation metadata for interactive or structural VisualNodes.
   * Purely descriptive; no executable implementation.
   */
  public planAnimation(componentType: string, designSystem: DesignSystem): AnimationPlanItem | null {
    const isFast = designSystem.structuralRules.compactness === 'compact';
    const durationMultiplier = isFast ? 0.8 : 1.0;

    switch (componentType) {
      case 'Button':
        return {
          type: 'hover',
          durationMs: Math.round(150 * durationMultiplier),
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          description: 'Subtle Y-axis translation (-2px) and shadow scale increase on cursor hover.'
        };

      case 'Card':
      case 'Pricing Card':
        return {
          type: 'micro-interaction',
          durationMs: Math.round(200 * durationMultiplier),
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          description: 'Smooth card border highlight and light backdrop blur transition on hover.'
        };

      case 'Input':
      case 'Search':
        return {
          type: 'focus',
          durationMs: Math.round(150 * durationMultiplier),
          easing: 'ease-out',
          description: 'Ring glow expansion around border on input focus event.'
        };

      case 'Hero':
        return {
          type: 'entrance',
          durationMs: Math.round(500 * durationMultiplier),
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          description: 'Staggered fade-in and upward slide for title, subhead, and CTA.'
        };

      case 'Modal':
        return {
          type: 'page-transition',
          durationMs: Math.round(250 * durationMultiplier),
          easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
          description: 'Backdrop opacity fade and modal scale-up from 0.95 to 1.0.'
        };

      case 'Table':
      case 'Chart Placeholder':
        return {
          type: 'loading',
          durationMs: Math.round(1000 * durationMultiplier),
          easing: 'linear',
          description: 'Pulse skeleton shimmer effect across table rows during data load.'
        };

      default:
        return null;
    }
  }

  /**
   * Generates overall animation strategy items for the complete option.
   */
  public generateOptionAnimationPlan(_designSystem: DesignSystem): AnimationPlanItem[] {
    return [
      {
        type: 'page-transition',
        durationMs: 300,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        description: 'Smooth view transition between layout routes.'
      },
      {
        type: 'entrance',
        durationMs: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        description: 'Staggered vertical reveal of top-level sections.'
      },
      {
        type: 'hover',
        durationMs: 150,
        easing: 'ease-out',
        description: 'Standard micro-interaction feedback on interactive buttons and controls.'
      },
      {
        type: 'focus',
        durationMs: 150,
        easing: 'ease-out',
        description: 'Accessible focus ring expansion for keyboard navigation.'
      }
    ];
  }
}
