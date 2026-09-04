export interface DerivedLayoutLabel {
  layoutLabel:
    | 'single_column'
    | 'two_column'
    | 'three_column'
    | 'grid'
    | 'sidebar'
    | 'stack'
    | 'centered'
    | 'other';
  labelSource: 'derived_deterministic';
  derivationMethod: string;
  confidence: number;
}

export class LayoutLabelDeriver {
  /**
   * Deterministically derives layout structure label from DOM bboxes, HTML layout tags, or canvas objects.
   */
  public deriveLayoutLabel(sample: any): DerivedLayoutLabel {
    const html = (sample.codeGenerationReference || sample.finalDesign?.html || '').toLowerCase();
    const canvasObjs = sample.sketch?.canvasObjects || [];
    const bboxes = sample.sketch?.bboxes || [];

    // 1. Check HTML CSS Grid & Sidebar structure
    if (html.includes('grid-cols-3') || html.includes('grid-template-columns: repeat(3') || html.includes('three-column')) {
      return { layoutLabel: 'three_column', labelSource: 'derived_deterministic', derivationMethod: 'html_css_grid_column_count', confidence: 0.95 };
    }
    if (html.includes('grid-cols-2') || html.includes('grid-template-columns: repeat(2') || html.includes('two-column')) {
      return { layoutLabel: 'two_column', labelSource: 'derived_deterministic', derivationMethod: 'html_css_grid_column_count', confidence: 0.95 };
    }
    if (html.includes('grid') || html.includes('display: grid')) {
      return { layoutLabel: 'grid', labelSource: 'derived_deterministic', derivationMethod: 'html_grid_display', confidence: 0.9 };
    }
    if (html.includes('sidebar') || html.includes('<aside')) {
      return { layoutLabel: 'sidebar', labelSource: 'derived_deterministic', derivationMethod: 'html_aside_element', confidence: 0.9 };
    }
    if (html.includes('max-w-') && (html.includes('mx-auto') || html.includes('margin: 0 auto'))) {
      return { layoutLabel: 'centered', labelSource: 'derived_deterministic', derivationMethod: 'html_centered_container', confidence: 0.85 };
    }

    // 2. Bounding Box Geometry Spatial Analysis
    if (Array.isArray(canvasObjs) && canvasObjs.length > 0) {
      const xPositions = canvasObjs.map((o: any) => o.bounds?.[0] ?? o.position?.x ?? 0).filter((x: number) => !isNaN(x));
      const uniqueXCols = new Set(xPositions.map((x: number) => Math.round(x / 100) * 100));

      if (uniqueXCols.size >= 3) {
        return { layoutLabel: 'three_column', labelSource: 'derived_deterministic', derivationMethod: 'bbox_spatial_columns', confidence: 0.85 };
      }
      if (uniqueXCols.size === 2) {
        return { layoutLabel: 'two_column', labelSource: 'derived_deterministic', derivationMethod: 'bbox_spatial_columns', confidence: 0.85 };
      }
      if (uniqueXCols.size === 1) {
        return { layoutLabel: 'single_column', labelSource: 'derived_deterministic', derivationMethod: 'bbox_spatial_vertical_stack', confidence: 0.9 };
      }
    }

    if (bboxes.length > 0) {
      return { layoutLabel: 'stack', labelSource: 'derived_deterministic', derivationMethod: 'bbox_element_stacking', confidence: 0.8 };
    }

    return { layoutLabel: 'single_column', labelSource: 'derived_deterministic', derivationMethod: 'fallback_default_stack', confidence: 0.7 };
  }
}
