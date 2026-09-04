import { AIContext, ConstraintValidationResult, NormalizedAIResponse } from './AITypes';

export class ConstraintValidator {
  public validateConstraints(
    normalizedResponse: NormalizedAIResponse,
    context: AIContext
  ): ConstraintValidationResult {
    const violations: Array<{ rule: string; severity: 'error' | 'warning'; message: string }> = [];

    // 1. Accessibility Constraints (Touch Target Size)
    const minTouchSize = context.accessibility.minTouchSize || 44;
    normalizedResponse.normalizedComponents.forEach((comp) => {
      if (comp.bounds.width < minTouchSize || comp.bounds.height < minTouchSize) {
        violations.push({
          rule: 'WCAG_TOUCH_TARGET_SIZE',
          severity: 'warning',
          message: `Component '${comp.label}' (${comp.type}) bounds (${comp.bounds.width}x${comp.bounds.height}) are below minimum touch size (${minTouchSize}px).`
        });
      }
    });

    // 2. Responsive Rules & Bounds
    const maxViewportWidth = 1200;
    normalizedResponse.normalizedComponents.forEach((comp) => {
      if (comp.bounds.x + comp.bounds.width > maxViewportWidth + 50) {
        violations.push({
          rule: 'RESPONSIVE_VIEWPORT_OVERFLOW',
          severity: 'error',
          message: `Component '${comp.label}' overflows viewport width (${comp.bounds.x + comp.bounds.width} > ${maxViewportWidth}).`
        });
      }
    });

    // 3. Spacing Grid Alignment
    const gridMultiple = 4;
    normalizedResponse.normalizedComponents.forEach((comp) => {
      if (comp.bounds.x % gridMultiple !== 0 || comp.bounds.y % gridMultiple !== 0) {
        violations.push({
          rule: 'GRID_SPACING_ALIGNMENT',
          severity: 'warning',
          message: `Component '${comp.label}' position (${comp.bounds.x}, ${comp.bounds.y}) is not aligned to ${gridMultiple}px grid.`
        });
      }
    });

    // 4. Hierarchy Rules (Header / Navbar should be near top)
    normalizedResponse.normalizedComponents.forEach((comp) => {
      if ((comp.type === 'Navbar' || comp.type === 'Header') && comp.bounds.y > 150) {
        violations.push({
          rule: 'VISUAL_HIERARCHY_POSITION',
          severity: 'warning',
          message: `Top-level component '${comp.label}' (${comp.type}) is positioned unusually deep (y=${comp.bounds.y}).`
        });
      }
    });

    // 5. Component Count Rules
    const maxComponents = context.constraints.maxComponents || 40;
    if (normalizedResponse.normalizedComponents.length > maxComponents) {
      violations.push({
        rule: 'MAX_COMPONENT_LIMIT',
        severity: 'error',
        message: `Suggested components count (${normalizedResponse.normalizedComponents.length}) exceeds maximum limit (${maxComponents}).`
      });
    }

    const hasErrors = violations.some((v) => v.severity === 'error');

    return {
      passed: !hasErrors,
      violations
    };
  }
}
