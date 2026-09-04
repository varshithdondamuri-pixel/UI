import { DesignValidationResult, DesignWarning, VisualNode } from './DesignTypes';

export class DesignValidator {
  /**
   * Validates a VisualNode tree against design system rules, hierarchy, contrast, and spacing.
   */
  public validate(rootNode: VisualNode): DesignValidationResult {
    const warnings: DesignWarning[] = [];
    let warningIdCounter = 1;

    const traverse = (node: VisualNode) => {
      // 1. Spacing consistency validation
      if (node.spacing.internalSpacing < 8 && node.children.length > 1) {
        warnings.push({
          id: `warn-${warningIdCounter++}`,
          code: 'SPACING_TOO_TIGHT',
          message: `Node '${node.componentType}' (${node.id.slice(0, 6)}) has tight internal spacing (${node.spacing.internalSpacing}px) for multiple children.`,
          severity: 'warning',
          nodeId: node.id
        });
      }

      // 2. Color accessibility validation
      if (!node.accessibility.contrastPasses) {
        warnings.push({
          id: `warn-${warningIdCounter++}`,
          code: 'LOW_CONTRAST',
          message: `Node '${node.componentType}' (${node.id.slice(0, 6)}) has sub-optimal contrast ratio (${node.accessibility.contrastRatio.toFixed(1)}:1).`,
          severity: 'error',
          nodeId: node.id
        });
      }

      // 3. Touch target sizing validation
      if (!node.accessibility.touchTargetSizing.meetsMinimum && node.accessibility.keyboardNavigable) {
        warnings.push({
          id: `warn-${warningIdCounter++}`,
          code: 'SMALL_TOUCH_TARGET',
          message: `Interactive component '${node.componentType}' (${node.id.slice(0, 6)}) is smaller than recommended 44x44px target.`,
          severity: 'warning',
          nodeId: node.id
        });
      }

      // 4. Responsive consistency validation
      if (node.bounds.width < 320 && node.responsiveRules?.mobile?.columns > 1) {
        warnings.push({
          id: `warn-${warningIdCounter++}`,
          code: 'RESPONSIVE_OVERCROWDING',
          message: `Mobile view for '${node.componentType}' has multi-column layout on small width (${Math.round(node.bounds.width)}px).`,
          severity: 'info',
          nodeId: node.id
        });
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(rootNode);

    // Calculate quality score (starts at 100, drops per warning)
    const errorCount = warnings.filter((w) => w.severity === 'error').length;
    const warnCount = warnings.filter((w) => w.severity === 'warning').length;
    const score = Math.max(0, 100 - errorCount * 15 - warnCount * 5);

    return {
      isValid: errorCount === 0,
      score,
      warnings
    };
  }
}
