import { AIContext, AIValidationResult, ComponentValidationDetail, NormalizedAIResponse } from './AITypes';

export class ResponseValidator {
  private static readonly ALLOWED_COMPONENT_TYPES = new Set([
    'Header',
    'Navbar',
    'Sidebar',
    'Card',
    'Button',
    'Input',
    'Typography',
    'Table',
    'Chart',
    'Footer',
    'Modal',
    'Badge',
    'Container',
    'ContentGrid'
  ]);

  public validateResponse(
    normalized: NormalizedAIResponse,
    context: AIContext
  ): AIValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const componentValidations: ComponentValidationDetail[] = [];
    let hallucinatedCount = 0;

    // 1. Verify Component Validity & Detect Hallucinated Components
    for (const comp of normalized.normalizedComponents) {
      const isAllowed = ResponseValidator.ALLOWED_COMPONENT_TYPES.has(comp.type);
      if (!isAllowed) {
        hallucinatedCount++;
        componentValidations.push({
          componentType: comp.type,
          isValid: false,
          isHallucinated: true,
          reason: `Component type '${comp.type}' is hallucinated and not in standard Design System registry.`
        });
        errors.push(`Hallucinated component detected: '${comp.type}'`);
      } else {
        componentValidations.push({
          componentType: comp.type,
          isValid: true,
          isHallucinated: false
        });
      }
    }

    // 2. Blueprint Consistency Check
    const blueprintConsistent = context.blueprint
      ? context.blueprint.totalNodeCount === 0 || normalized.normalizedComponents.length > 0
      : true;
    if (!blueprintConsistent) {
      warnings.push('AI suggestion differs significantly from blueprint node structure.');
    }

    // 3. Accessibility Check
    const accessibilityValid = normalized.colorPalette
      ? this.checkColorContrast(normalized.colorPalette.primary, normalized.colorPalette.background) >= (context.accessibility.colorContrastRatio || 4.5)
      : true;
    if (!accessibilityValid) {
      warnings.push('Color contrast ratio between primary and background is below target threshold.');
    }

    // 4. Layout Validity
    const layoutValid = normalized.normalizedComponents.every(
      (c) => c.bounds.width > 0 && c.bounds.height > 0
    );
    if (!layoutValid) {
      errors.push('Found components with zero or negative dimensions.');
    }

    const isValid = errors.length === 0;

    // Calculate quality score (0.0 to 1.0)
    let score = 1.0;
    if (hallucinatedCount > 0) score -= 0.3 * hallucinatedCount;
    if (!accessibilityValid) score -= 0.15;
    if (!blueprintConsistent) score -= 0.1;
    if (errors.length > 0) score -= 0.25 * errors.length;
    score = Math.max(0, Math.min(1.0, score));

    return {
      isValid,
      score,
      blueprintConsistent,
      accessibilityValid,
      layoutValid,
      componentValidations,
      hallucinatedCount,
      errors,
      warnings
    };
  }

  private checkColorContrast(fgHex: string, bgHex: string): number {
    // Basic WCAG contrast estimation heuristic
    if (!fgHex || !bgHex) return 4.5;
    const fgLum = this.getLuminance(fgHex);
    const bgLum = this.getLuminance(bgHex);
    const l1 = Math.max(fgLum, bgLum);
    const l2 = Math.min(fgLum, bgLum);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  private getLuminance(hex: string): number {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return 0.5;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
}
