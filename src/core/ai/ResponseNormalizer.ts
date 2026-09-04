import { NormalizedAIResponse, ParsedAIResponse } from './AITypes';

export class ResponseNormalizer {
  private static readonly COMPONENT_MAP: Record<string, string> = {
    'btn': 'Button',
    'button': 'Button',
    'cta': 'Button',
    'card': 'Card',
    'panel': 'Card',
    'container': 'Card',
    'header': 'Header',
    'topbar': 'Header',
    'navbar': 'Navbar',
    'nav': 'Navbar',
    'sidebar': 'Sidebar',
    'nav-drawer': 'Sidebar',
    'text': 'Typography',
    'title': 'Typography',
    'input': 'Input',
    'textfield': 'Input',
    'search': 'Input',
    'table': 'Table',
    'grid': 'Table',
    'chart': 'Chart',
    'graph': 'Chart',
    'modal': 'Modal',
    'dialog': 'Modal',
    'footer': 'Footer',
    'badge': 'Badge',
    'chip': 'Badge'
  };

  public normalizeResponse(parsed: ParsedAIResponse): NormalizedAIResponse {
    // 1. Normalize Colors (hex uppercase)
    const normalizedColors: Record<string, string> = {};
    if (parsed.colorPalette) {
      for (const [k, v] of Object.entries(parsed.colorPalette)) {
        normalizedColors[k] = this.normalizeHexColor(v);
      }
    } else {
      normalizedColors.primary = '#3B82F6';
      normalizedColors.secondary = '#1E293B';
      normalizedColors.background = '#FFFFFF';
      normalizedColors.surface = '#F8FAFC';
      normalizedColors.text = '#0F172A';
      normalizedColors.accent = '#F59E0B';
    }

    // 2. Normalize Spacing grid (multiple of 4/8)
    const normalizedSpacing = 8;

    // 3. Normalize Components & Bounds
    const normalizedComponents = (parsed.suggestedComponents || []).map((comp) => {
      const typeLower = comp.type.toLowerCase().trim();
      const normalizedType = ResponseNormalizer.COMPONENT_MAP[typeLower] || 'Card';

      const x = this.snapToGrid(comp.position?.x || 0, normalizedSpacing);
      const y = this.snapToGrid(comp.position?.y || 0, normalizedSpacing);
      const width = Math.max(44, this.snapToGrid(comp.size?.width || 120, normalizedSpacing));
      const height = Math.max(44, this.snapToGrid(comp.size?.height || 48, normalizedSpacing));

      return {
        type: normalizedType,
        label: comp.label.trim() || `${normalizedType} Component`,
        bounds: { x, y, width, height }
      };
    });

    // 4. Normalize Typography
    const typography = {
      fontFamily: parsed.typography?.fontFamily || 'Inter, sans-serif',
      headingFont: parsed.typography?.headingFont || 'Inter, sans-serif',
      bodyFont: parsed.typography?.bodyFont || 'Inter, sans-serif'
    };

    return {
      ...parsed,
      colorPalette: {
        primary: normalizedColors.primary,
        secondary: normalizedColors.secondary,
        background: normalizedColors.background,
        surface: normalizedColors.surface,
        text: normalizedColors.text,
        accent: normalizedColors.accent
      },
      typography,
      normalizedComponents,
      normalizedColors,
      normalizedSpacing
    };
  }

  private normalizeHexColor(colorStr: string): string {
    if (!colorStr) return '#000000';
    let hex = colorStr.trim();
    if (!hex.startsWith('#')) {
      hex = `#${hex}`;
    }
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return hex.toUpperCase();
  }

  private snapToGrid(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
  }
}
