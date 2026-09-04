import { GridType, LayoutDirection, LayoutStrategy } from '../BlueprintTypes';

export interface StrategyConfig {
  strategy: LayoutStrategy;
  name: string;
  description: string;
  defaultDirection: LayoutDirection;
  defaultGridType: GridType;
  maxContentWidth: number;
  sectionGapScale: number; // multiplier for spacing
  advantages: string[];
  tradeoffs: string[];
  baseResponsiveScore: number;
  baseComplexityScore: number;
  baseMaintainabilityScore: number;
}

export class VariantConstraints {
  private static readonly STRATEGY_DEFINITIONS: Record<LayoutStrategy, StrategyConfig> = {
    landing_page: {
      strategy: 'landing_page',
      name: 'Classic Landing Page',
      description: 'Sequential high-impact structural flow with Hero, Features, Testimonials, and CTA.',
      defaultDirection: 'vertical',
      defaultGridType: 'single_column',
      maxContentWidth: 1440,
      sectionGapScale: 1.25,
      advantages: ['High structural conversion flow', 'Clear visual storytelling', 'Well-defined hierarchy'],
      tradeoffs: ['Requires substantial content vertical height', 'Can feel lengthy on small screens'],
      baseResponsiveScore: 90,
      baseComplexityScore: 40,
      baseMaintainabilityScore: 85
    },
    hero_focused: {
      strategy: 'hero_focused',
      name: 'Hero Focused Layout',
      description: 'Prioritizes immediate value proposition and primary action at the top.',
      defaultDirection: 'vertical',
      defaultGridType: 'single_column',
      maxContentWidth: 1280,
      sectionGapScale: 1.5,
      advantages: ['Maximum initial focus', 'Strong primary hierarchy', 'Spacious padding'],
      tradeoffs: ['Secondary sections compressed below fold', 'Less dense content density'],
      baseResponsiveScore: 88,
      baseComplexityScore: 35,
      baseMaintainabilityScore: 90
    },
    split: {
      strategy: 'split',
      name: 'Split Two-Column Layout',
      description: 'Dual structural weight dividing key information or media side-by-side.',
      defaultDirection: 'horizontal',
      defaultGridType: 'split_layout',
      maxContentWidth: 1440,
      sectionGapScale: 1.0,
      advantages: ['Balanced side-by-side comparison', 'Efficient horizontal spatial distribution'],
      tradeoffs: ['Requires vertical stacking on mobile', 'Needs equal content weight on both sides'],
      baseResponsiveScore: 82,
      baseComplexityScore: 50,
      baseMaintainabilityScore: 80
    },
    grid: {
      strategy: 'grid',
      name: 'Structured Grid Layout',
      description: 'Multi-column uniform modular organization ideal for card arrays and catalog structures.',
      defaultDirection: 'grid',
      defaultGridType: 'responsive_grid',
      maxContentWidth: 1320,
      sectionGapScale: 0.9,
      advantages: ['High content scannability', 'Modular scalability', 'Uniform structural balance'],
      tradeoffs: ['Can feel repetitive', 'Rigid item boundary constraints'],
      baseResponsiveScore: 85,
      baseComplexityScore: 55,
      baseMaintainabilityScore: 85
    },
    sidebar: {
      strategy: 'sidebar',
      name: 'Sidebar & Main Content Layout',
      description: 'Asymmetric structural division with persistent navigation or context panel alongside main canvas.',
      defaultDirection: 'horizontal',
      defaultGridType: 'split_layout',
      maxContentWidth: 1600,
      sectionGapScale: 0.8,
      advantages: ['High navigation efficiency', 'Context persistence', 'Compact tool access'],
      tradeoffs: ['Higher structural complexity', 'Drawer conversion required on mobile'],
      baseResponsiveScore: 78,
      baseComplexityScore: 70,
      baseMaintainabilityScore: 75
    },
    centered: {
      strategy: 'centered',
      name: 'Centered Minimal Stack',
      description: 'Focused single-column layout centered on screen with generous margins.',
      defaultDirection: 'vertical',
      defaultGridType: 'single_column',
      maxContentWidth: 960,
      sectionGapScale: 1.1,
      advantages: ['Distraction-free focus', 'Excellent readability', 'Extremely responsive'],
      tradeoffs: ['Underutilizes widescreen displays', 'Limited horizontal content capacity'],
      baseResponsiveScore: 95,
      baseComplexityScore: 25,
      baseMaintainabilityScore: 95
    },
    asymmetric: {
      strategy: 'asymmetric',
      name: 'Asymmetric Dynamic Layout',
      description: 'Varied structural widths and offsets creating dynamic visual rhythm.',
      defaultDirection: 'vertical',
      defaultGridType: 'responsive_grid',
      maxContentWidth: 1440,
      sectionGapScale: 1.2,
      advantages: ['Dynamic engaging layout rhythm', 'Distinctive visual structure'],
      tradeoffs: ['Complex responsive alignment rules', 'Harder to standardize'],
      baseResponsiveScore: 75,
      baseComplexityScore: 75,
      baseMaintainabilityScore: 65
    },
    dashboard: {
      strategy: 'dashboard',
      name: 'Analytical Dashboard Layout',
      description: 'Dense multi-widget grid optimizing data density and analytical breakdown.',
      defaultDirection: 'grid',
      defaultGridType: 'four_column',
      maxContentWidth: 1680,
      sectionGapScale: 0.75,
      advantages: ['Maximum content density', 'At-a-glance information architecture'],
      tradeoffs: ['High visual complexity', 'Requires aggressive stacking on mobile'],
      baseResponsiveScore: 72,
      baseComplexityScore: 85,
      baseMaintainabilityScore: 70
    },
    content_focused: {
      strategy: 'content_focused',
      name: 'Content Reading Layout',
      description: 'Optimized text and media reading measure with side margins.',
      defaultDirection: 'vertical',
      defaultGridType: 'single_column',
      maxContentWidth: 1080,
      sectionGapScale: 1.0,
      advantages: ['Optimal reading line lengths', 'Clean hierarchy'],
      tradeoffs: ['Less emphasis on promotional heroes'],
      baseResponsiveScore: 92,
      baseComplexityScore: 30,
      baseMaintainabilityScore: 90
    },
    magazine: {
      strategy: 'magazine',
      name: 'Editorial Magazine Layout',
      description: 'Featured headline layout with mixed columns and secondary highlights.',
      defaultDirection: 'grid',
      defaultGridType: 'three_column',
      maxContentWidth: 1400,
      sectionGapScale: 1.1,
      advantages: ['Rich editorial storytelling', 'Flexible feature highlights'],
      tradeoffs: ['Complex hierarchy levels', 'Moderate mobile stacking overhead'],
      baseResponsiveScore: 80,
      baseComplexityScore: 65,
      baseMaintainabilityScore: 75
    },
    minimal: {
      strategy: 'minimal',
      name: 'Ultra-Minimalist Layout',
      description: 'Stripped-down essential layout with maximum white space.',
      defaultDirection: 'vertical',
      defaultGridType: 'stack',
      maxContentWidth: 900,
      sectionGapScale: 1.6,
      advantages: ['Pure clarity', 'Zero clutter', 'Fast structural load'],
      tradeoffs: ['Low information density'],
      baseResponsiveScore: 96,
      baseComplexityScore: 15,
      baseMaintainabilityScore: 98
    },
    responsive_stack: {
      strategy: 'responsive_stack',
      name: 'Universal Responsive Stack',
      description: 'Adaptive linear stack designed to reflow perfectly across all screen sizes.',
      defaultDirection: 'vertical',
      defaultGridType: 'stack',
      maxContentWidth: 1200,
      sectionGapScale: 1.0,
      advantages: ['100% predictable responsive reflow', 'Simple structural logic'],
      tradeoffs: ['Conservative horizontal space utilization'],
      baseResponsiveScore: 98,
      baseComplexityScore: 20,
      baseMaintainabilityScore: 95
    }
  };

  public static getStrategyConfig(strategy: LayoutStrategy): StrategyConfig {
    return (
      this.STRATEGY_DEFINITIONS[strategy] || this.STRATEGY_DEFINITIONS['landing_page']
    );
  }

  public static getAllStrategies(): LayoutStrategy[] {
    return Object.keys(this.STRATEGY_DEFINITIONS) as LayoutStrategy[];
  }
}
