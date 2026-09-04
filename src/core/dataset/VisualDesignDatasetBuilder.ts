import { VisualDesignSample } from './DatasetTypes';

export class VisualDesignDatasetBuilder {
  public buildSample(
    blueprint: any,
    visualDesignModel: any,
    options: any[] = [],
    selectedOption: any = null
  ): VisualDesignSample {
    const activeModel = visualDesignModel || selectedOption;
    const safeOptions = options.length > 0 ? options : (activeModel ? [activeModel] : []);

    const theme = activeModel?.theme || { mode: 'dark', primaryColor: '#6366f1', background: '#0f172a' };
    const colors = activeModel?.colorPalette || ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0f172a'];
    const typography = activeModel?.typography || { fontFamily: 'Inter, sans-serif', baseFontSize: 16 };
    const spacing = activeModel?.spacingSystem || { baseUnit: 8, scale: [4, 8, 16, 24, 32, 48, 64] };
    const components = activeModel?.components || activeModel?.nodes || [];
    const elevation = activeModel?.elevationSystem || { cardShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
    const icons = activeModel?.iconSet || ['Lucide', 'Feather'];
    const illustrations = activeModel?.illustrations || [];
    const animation = activeModel?.animations || { transitionDuration: '200ms', timingFunction: 'ease-in-out' };
    const accessibility = activeModel?.accessibilityConfig || { minContrastRatio: 4.5, focusRingWidth: 2 };

    const sel = selectedOption || activeModel;
    const selectedId = sel?.id || 'option_primary';
    const rejectedOptions = safeOptions.filter((opt) => (opt.id || opt.optionId) !== selectedId);

    const visualEvaluation = activeModel?.evaluation || {
      contrastScore: 92,
      hierarchyScore: 88,
      consistencyScore: 95
    };

    return {
      blueprint: blueprint || null,
      designSystem: activeModel?.designSystem || { name: 'Modern Dark System', version: '2.0.0' },
      theme,
      colors,
      typography,
      spacing,
      components,
      elevation,
      icons,
      illustrations,
      animation,
      accessibility,
      selectedOption: sel,
      rejectedOptions,
      visualEvaluation
    };
  }
}
