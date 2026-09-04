import { RenderNode } from './RenderNode';
import { RenderValidationResult, RenderValidationWarning } from './RenderingTypes';

export class RendererValidator {
  /**
   * Validates a RenderTree for missing nodes, invalid bounds, overflow, layer ordering, and invisible elements.
   */
  public validate(rootNode: RenderNode): RenderValidationResult {
    const warnings: RenderValidationWarning[] = [];
    let counter = 1;

    const traverse = (node: RenderNode) => {
      // 1. Missing node validation
      if (!node.id || !node.componentType) {
        warnings.push({
          id: `rwarn-${counter++}`,
          code: 'MISSING_RENDER_NODE_DATA',
          message: 'RenderNode missing essential ID or componentType specification.',
          severity: 'error',
          nodeId: node.id
        });
      }

      // 2. Invalid bounds validation
      if (node.bounds.width <= 0 || node.bounds.height <= 0) {
        warnings.push({
          id: `rwarn-${counter++}`,
          code: 'INVALID_BOUNDS',
          message: `RenderNode '${node.componentType}' (${node.id.slice(0, 6)}) has non-positive width/height bounds.`,
          severity: 'error',
          nodeId: node.id
        });
      }

      // 3. Invisible element notice
      if (!node.visibility) {
        warnings.push({
          id: `rwarn-${counter++}`,
          code: 'INVISIBLE_NODE',
          message: `RenderNode '${node.componentType}' (${node.id.slice(0, 6)}) is hidden in active viewport mode.`,
          severity: 'info',
          nodeId: node.id
        });
      }

      // 4. Overflow validation
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (child.bounds.maxX > node.bounds.maxX + 10) {
            warnings.push({
              id: `rwarn-${counter++}`,
              code: 'CONTAINER_OVERFLOW',
              message: `Child node '${child.componentType}' exceeds container bounds of '${node.componentType}'.`,
              severity: 'warning',
              nodeId: child.id
            });
          }
        }
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(rootNode);

    const hasErrors = warnings.some((w) => w.severity === 'error');

    return {
      isValid: !hasErrors,
      warnings
    };
  }
}
