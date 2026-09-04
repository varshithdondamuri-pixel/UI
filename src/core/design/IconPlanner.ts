import { DesignSystem, IconPlacement } from './DesignTypes';

export class IconPlanner {
  /**
   * Plans icon placement metadata for a component.
   * Does NOT load external icon libraries; strictly describes placement and purpose.
   */
  public planIcon(componentType: string, designSystem: DesignSystem): IconPlacement | null {
    const isNeobrutalist = designSystem.id === 'neobrutalist';
    const style: 'outline' | 'filled' | 'duotone' = isNeobrutalist
      ? 'filled'
      : designSystem.id === 'apple-inspired'
      ? 'duotone'
      : 'outline';

    switch (componentType) {
      case 'Navbar':
        return {
          location: 'left',
          size: 24,
          style,
          purpose: 'navigation',
          suggestedName: 'menu'
        };

      case 'Search':
      case 'Input':
        return {
          location: 'left-inside',
          size: 18,
          style,
          purpose: 'indicator',
          suggestedName: 'search'
        };

      case 'Button':
        return {
          location: 'right',
          size: 16,
          style,
          purpose: 'action',
          suggestedName: 'arrow-right'
        };

      case 'Avatar':
        return {
          location: 'center',
          size: 20,
          style: 'filled',
          purpose: 'indicator',
          suggestedName: 'user'
        };

      case 'Pricing Card':
        return {
          location: 'top-left',
          size: 20,
          style,
          purpose: 'status',
          suggestedName: 'check-circle'
        };

      default:
        return null;
    }
  }
}
