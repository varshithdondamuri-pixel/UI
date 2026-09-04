import {
  BlueprintNode,
  BlueprintValidationResult,
  BlueprintWarning,
  LayoutBlueprint
} from './BlueprintTypes';

export class BlueprintValidator {
  /**
   * Validates a LayoutBlueprint for structural integrity, hierarchy consistency, bounds overlap, and duplicate sections.
   */
  public validate(blueprint: LayoutBlueprint): BlueprintValidationResult {
    const warnings: BlueprintWarning[] = [];
    const root = blueprint.root;

    if (!root) {
      warnings.push({
        id: `warn-${Date.now()}-1`,
        code: 'MISSING_ROOT',
        message: 'Layout blueprint is missing a root page node.',
        severity: 'error'
      });
      return { valid: false, warnings };
    }

    // 1. Validate missing sections
    this.checkMissingSections(root, warnings);

    // 2. Validate duplicate sections
    this.checkDuplicateSections(root, warnings);

    // 3. Validate hierarchy & impossible layouts recursively
    this.validateNode(root, null, warnings);

    // 4. Validate overlapping plans (section bounds)
    this.checkOverlappingSections(root, warnings);

    const hasError = warnings.some((w) => w.severity === 'error');

    return {
      valid: !hasError,
      warnings
    };
  }

  private checkMissingSections(root: BlueprintNode, warnings: BlueprintWarning[]): void {
    if (!root.children || root.children.length === 0) {
      warnings.push({
        id: `warn-missing-${Date.now()}`,
        code: 'MISSING_SECTIONS',
        message: 'Page blueprint contains no layout sections or content.',
        severity: 'warning',
        nodeId: root.id
      });
      return;
    }

    const childTypes = root.children.map((c) => c.type.toLowerCase());
    const hasMainContent = childTypes.some(
      (t) =>
        t.includes('hero') ||
        t.includes('feature') ||
        t.includes('card_grid') ||
        t.includes('cta') ||
        t.includes('content')
    );

    if (!hasMainContent) {
      warnings.push({
        id: `warn-main-${Date.now()}`,
        code: 'MISSING_PRIMARY_SECTION',
        message: 'Blueprint is missing primary content sections (e.g. Hero, Features, or CTA).',
        severity: 'warning',
        nodeId: root.id
      });
    }
  }

  private checkDuplicateSections(root: BlueprintNode, warnings: BlueprintWarning[]): void {
    if (!root.children) return;

    const navbars = root.children.filter((c) => c.type.toLowerCase().includes('navbar'));
    if (navbars.length > 1) {
      warnings.push({
        id: `warn-dup-nav-${Date.now()}`,
        code: 'DUPLICATE_SECTION',
        message: `Multiple navigation bars detected (${navbars.length}). A page typically requires only one main Navbar.`,
        severity: 'warning',
        nodeId: navbars[1].id
      });
    }

    const footers = root.children.filter((c) => c.type.toLowerCase().includes('footer'));
    if (footers.length > 1) {
      warnings.push({
        id: `warn-dup-footer-${Date.now()}`,
        code: 'DUPLICATE_SECTION',
        message: `Multiple footers detected (${footers.length}). A page typically requires only one Footer.`,
        severity: 'warning',
        nodeId: footers[1].id
      });
    }
  }

  private validateNode(
    node: BlueprintNode,
    parent: BlueprintNode | null,
    warnings: BlueprintWarning[]
  ): void {
    // A. Check Invalid Hierarchy
    if (parent) {
      if (node.hierarchyLevel < parent.hierarchyLevel) {
        warnings.push({
          id: `warn-hierarchy-${node.id}`,
          code: 'INVALID_HIERARCHY',
          message: `Inverted hierarchy level detected: ${node.type} (Level ${node.hierarchyLevel}) is inside ${parent.type} (Level ${parent.hierarchyLevel}).`,
          severity: 'warning',
          nodeId: node.id
        });
      }
    }

    // B. Check Impossible Layouts (Constraints conflict)
    const { minWidth, maxWidth, preferredWidth, minHeight, maxHeight } = node.constraints;

    if (minWidth > maxWidth) {
      warnings.push({
        id: `warn-impossible-w-${node.id}`,
        code: 'IMPOSSIBLE_LAYOUT',
        message: `Minimum width (${minWidth}px) cannot exceed maximum width (${maxWidth}px).`,
        severity: 'error',
        nodeId: node.id
      });
    }

    if (preferredWidth < minWidth || preferredWidth > maxWidth) {
      warnings.push({
        id: `warn-preferred-w-${node.id}`,
        code: 'IMPOSSIBLE_LAYOUT',
        message: `Preferred width (${preferredWidth}px) is outside [${minWidth}px, ${maxWidth}px] bounds.`,
        severity: 'warning',
        nodeId: node.id
      });
    }

    if (minHeight !== undefined && maxHeight !== undefined && minHeight > maxHeight) {
      warnings.push({
        id: `warn-impossible-h-${node.id}`,
        code: 'IMPOSSIBLE_LAYOUT',
        message: `Minimum height (${minHeight}px) cannot exceed maximum height (${maxHeight}px).`,
        severity: 'error',
        nodeId: node.id
      });
    }

    if (node.bounds.width <= 0 || node.bounds.height <= 0) {
      warnings.push({
        id: `warn-zero-bounds-${node.id}`,
        code: 'IMPOSSIBLE_LAYOUT',
        message: `Node ${node.type} has zero or negative bounding dimensions.`,
        severity: 'error',
        nodeId: node.id
      });
    }

    // Recurse children
    if (node.children) {
      node.children.forEach((child) => this.validateNode(child, node, warnings));
    }
  }

  private checkOverlappingSections(root: BlueprintNode, warnings: BlueprintWarning[]): void {
    if (!root.children || root.children.length < 2) return;

    const sections = root.children;
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const a = sections[i];
        const b = sections[j];

        // Check vertical overlap for top-level stacked sections
        const b1MinY = a.bounds.minY;
        const b1MaxY = a.bounds.maxY;
        const b2MinY = b.bounds.minY;
        const b2MaxY = b.bounds.maxY;

        const overlapY = Math.max(0, Math.min(b1MaxY, b2MaxY) - Math.max(b1MinY, b2MinY));
        const minSectionHeight = Math.min(a.bounds.height, b.bounds.height);

        if (overlapY > 0.5 * minSectionHeight && minSectionHeight > 40) {
          warnings.push({
            id: `warn-overlap-${a.id}-${b.id}`,
            code: 'OVERLAPPING_PLANS',
            message: `Overlapping section plans detected between "${a.type}" and "${b.type}".`,
            severity: 'warning',
            nodeId: b.id,
            details: { sectionA: a.type, sectionB: b.type, overlapPx: overlapY }
          });
        }
      }
    }
  }
}
