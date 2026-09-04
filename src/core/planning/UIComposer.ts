import { UIGenerationSpec } from '../ai/UIGenerationSpec';
import { GeneratedNode } from './GenerationTree';
import { resolveSectionKey, sectionBuilders } from './SectionBuilders';
import { resolveDesignTokens } from './DefaultDesignTokens';

/**
 * Orders a UIGenerationSpec's sections and calls the matching builder for
 * each. An unrecognized section type is skipped, never faked. Throws if
 * nothing could be built, so callers never mistake "nothing recognized" for
 * a valid empty page.
 */
export function composeGenerationTree(spec: UIGenerationSpec): GeneratedNode {
  const orderedSections = [...spec.sections].sort((a, b) => a.order - b.order);
  const tokens = resolveDesignTokens(spec.visualStyle);

  const built: GeneratedNode[] = [];
  for (const section of orderedSections) {
    const key = resolveSectionKey(section.type, spec.productType);
    if (!key) continue;
    built.push(sectionBuilders[key](spec, tokens));
  }

  if (built.length === 0) {
    throw new Error(
      `composeGenerationTree: no recognizable sections in spec (types: ${spec.sections.map((s) => s.type).join(', ') || 'none'})`
    );
  }

  return {
    id: 'page-root',
    role: 'page',
    kind: 'rect',
    layout: { direction: 'vertical', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    invisible: true,
    children: groupSidebarWithMainColumn(built)
  };
}

/**
 * A sidebar is meant to sit beside the rest of the page, not stack above or
 * below it full-width like every other section. When one is present, this
 * wraps the sidebar and the remaining non-nav sections in a horizontal row.
 */
function groupSidebarWithMainColumn(sections: GeneratedNode[]): GeneratedNode[] {
  const sidebarIndex = sections.findIndex((s) => s.role === 'sidebar');
  if (sidebarIndex === -1) return sections;

  const sidebar = sections[sidebarIndex];
  const topBands = sections.filter((s, i) => i !== sidebarIndex && (s.role === 'navbar' || s.role === 'topbar'));
  const mainSections = sections.filter((s, i) => i !== sidebarIndex && s.role !== 'navbar' && s.role !== 'topbar');

  if (mainSections.length === 0) return sections;

  const mainColumn: GeneratedNode = {
    id: 'main-column',
    role: 'main-column',
    kind: 'rect',
    layout: { direction: 'vertical', gap: 16, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    invisible: true,
    children: mainSections
  };

  const row: GeneratedNode = {
    id: 'main-row',
    role: 'main-row',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    invisible: true,
    children: [sidebar, mainColumn]
  };

  return [...topBands, row];
}
