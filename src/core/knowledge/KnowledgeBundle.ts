import {
  KnowledgeBundle,
  KnowledgeBundleRequest,
  KnowledgeRecord
} from './KnowledgeTypes';

export class KnowledgeBundleBuilder {
  /**
   * Constructs a structured KnowledgeBundle aggregating layout, component, color, typography,
   * accessibility, and animation records based on request parameters.
   */
  public buildBundle(
    records: KnowledgeRecord[],
    request: KnowledgeBundleRequest
  ): KnowledgeBundle {
    const targetIndustry = (request.industry || 'SaaS').toLowerCase();
    const targetStyle = (request.style || 'Modern').toLowerCase();

    // 1. Retrieve matching Layout Pattern
    const layouts = records.filter(
      (r) => r.category === 'layout-patterns' && r.status === 'active'
    );
    const layoutPattern =
      layouts.find(
        (r) =>
          r.industry.toLowerCase() === targetIndustry ||
          r.style.toLowerCase() === targetStyle
      ) ||
      layouts[0] ||
      null;

    // 2. Retrieve UI Components
    const components = records
      .filter((r) => r.category === 'ui-components' && r.status === 'active')
      .slice(0, 5);

    // 3. Retrieve Color Knowledge
    const colors =
      records.find(
        (r) =>
          r.category === 'color-knowledge' &&
          (r.style.toLowerCase() === targetStyle || r.status === 'active')
      ) || null;

    // 4. Retrieve Typography Knowledge
    const typography =
      records.find(
        (r) =>
          r.category === 'typography-knowledge' &&
          (r.style.toLowerCase() === targetStyle || r.status === 'active')
      ) || null;

    // 5. Retrieve Accessibility Rules
    const accessibilityRules = records.filter(
      (r) => r.category === 'accessibility' && r.status === 'active'
    );

    // 6. Retrieve Animation Knowledge
    const animations = records.filter(
      (r) => r.category === 'animation-knowledge' && r.status === 'active'
    );

    return {
      id: `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      intent: request.intent || request.prompt || 'Generate UI Design Model',
      industry: request.industry || 'SaaS',
      style: request.style || 'Modern',
      layoutPattern,
      components,
      colors,
      typography,
      accessibilityRules,
      animations,
      createdAt: Date.now()
    };
  }
}
