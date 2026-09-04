import { IntentNode } from '../recognition/RecognitionTypes';
import { ConstraintEngine } from './ConstraintEngine';
import { BoxedNode, GeneratedNode, GeneratedRole } from './GenerationTree';

const constraintEngine = new ConstraintEngine();

// Role-based intrinsic line-height for leaf text nodes that have no fixed
// layout.height of their own (headings need more vertical room than labels).
const TEXT_ROLE_HEIGHT: Partial<Record<GeneratedRole, number>> = {
  'brand-logo': 24,
  'nav-link': 20,
  'nav-cta': 16,
  'hero-heading': 56,
  'hero-subheading': 28,
  'hero-cta': 16,
  'product-card-title': 20,
  'product-card-price': 18,
  'product-card-cta': 16,
  'feature-title': 22,
  'feature-description': 40,
  'cta-heading': 32,
  'cta-button': 16,
  'footer-link': 20,
  'sidebar-item': 20,
  'topbar-title': 22,
  'topbar-user': 16,
  'kpi-value': 28,
  'kpi-label': 14,
  'chart-title': 18,
  'data-table-header-cell': 16,
  'data-table-cell': 16,
  'login-title': 26,
  'login-field': 16,
  'login-button': 16
};

const DEFAULT_LEAF_HEIGHT = 20;
const MIN_BOX = 1;

/**
 * Maps a generated node's role to the substring ConstraintEngine matches on,
 * so the layout pass can clamp sizes to its min/max width & height rules.
 * Roles with no clear ConstraintEngine category are left unclamped.
 */
function constraintTypeForRole(role: GeneratedRole): string | null {
  switch (role) {
    case 'navbar':
      return 'navbar';
    case 'hero':
      return 'hero';
    case 'footer':
      return 'footer';
    case 'product-card':
    case 'feature-card':
    case 'kpi-card':
      return 'card';
    case 'nav-cta':
    case 'hero-cta':
    case 'cta-button':
    case 'login-button':
      return 'button';
    default:
      return null;
  }
}

function stubIntentNode(type: string, width: number, height: number): IntentNode {
  return {
    id: 'layout-stub',
    type,
    purpose: '',
    priority: 'medium',
    confidence: 1,
    possibleVariants: [],
    candidates: [],
    children: [],
    sourceSemanticNodes: [],
    metadata: { bounds: { width, height } }
  };
}

/** Reuses ConstraintEngine to clamp a proposed box to its role's min/max rules. */
function clampToConstraints(role: GeneratedRole, width: number, height: number): { width: number; height: number } {
  const type = constraintTypeForRole(role);
  if (!type) return { width, height };

  const { constraints } = constraintEngine.planConstraints(stubIntentNode(type, width, height));

  let w = Math.min(constraints.maxWidth, Math.max(constraints.minWidth, width));
  let h = height;
  if (constraints.minHeight !== undefined) h = Math.max(constraints.minHeight, h);
  if (constraints.maxHeight !== undefined) h = Math.min(constraints.maxHeight, h);

  return { width: Math.max(MIN_BOX, w), height: Math.max(MIN_BOX, h) };
}

function intrinsicLeafHeight(node: GeneratedNode): number {
  if (node.layout.height) return node.layout.height;
  return TEXT_ROLE_HEIGHT[node.role] ?? DEFAULT_LEAF_HEIGHT;
}

/**
 * Lays out `node` at absolute position (x, y) given `availableWidth` from its
 * parent, and returns the fully boxed subtree. This is the piece that was
 * genuinely missing: ConstraintEngine only ever produced preferred
 * width/height *rules*, never an absolute, non-overlapping box for every
 * node in a tree.
 */
export function layoutNode(node: GeneratedNode, x: number, y: number, availableWidth: number): BoxedNode {
  // A node's own preferred width never overrides what its parent actually
  // made available — that's what keeps every box inside the page bounds.
  const width = Math.max(MIN_BOX, Math.min(node.layout.width ?? availableWidth, availableWidth));
  const { padding, gap, direction } = node.layout;
  const contentWidth = Math.max(MIN_BOX, width - padding.left - padding.right);
  const contentX = x + padding.left;
  const contentY = y + padding.top;

  let boxedChildren: BoxedNode[] = [];
  let contentHeight: number;

  if (node.children.length === 0) {
    contentHeight = node.layout.height ? node.layout.height - padding.top - padding.bottom : intrinsicLeafHeight(node);
    contentHeight = Math.max(MIN_BOX, contentHeight);
  } else if (direction === 'grid') {
    ({ children: boxedChildren, height: contentHeight } = layoutGridChildren(node, contentX, contentY, contentWidth, gap));
  } else if (direction === 'horizontal') {
    ({ children: boxedChildren, height: contentHeight } = layoutHorizontalChildren(node, contentX, contentY, contentWidth, gap));
  } else {
    ({ children: boxedChildren, height: contentHeight } = layoutVerticalChildren(node, contentX, contentY, contentWidth, gap));
  }

  const naturalHeight = node.layout.height ?? contentHeight + padding.top + padding.bottom;
  const clamped = clampToConstraints(node.role, width, naturalHeight);
  // ConstraintEngine's minWidth can exceed what the parent actually made
  // available (e.g. on a narrow mobile page) — width may only ever shrink
  // from what the parent granted, never grow past it, or the page-bounds
  // invariant breaks.
  const finalWidth = Math.min(clamped.width, width);

  return {
    ...node,
    box: { minX: x, minY: y, maxX: x + finalWidth, maxY: y + clamped.height, width: finalWidth, height: clamped.height },
    children: boxedChildren
  };
}

function layoutVerticalChildren(
  node: GeneratedNode,
  contentX: number,
  contentY: number,
  contentWidth: number,
  gap: number
): { children: BoxedNode[]; height: number } {
  const boxed: BoxedNode[] = [];
  let cursorY = contentY;

  node.children.forEach((child, idx) => {
    // Pass the full content width; layoutNode itself clamps a child's own
    // fixed width down to whatever its parent actually made available.
    const boxedChild = layoutNode(child, contentX, cursorY, contentWidth);
    boxed.push(boxedChild);
    cursorY += boxedChild.box.height + (idx < node.children.length - 1 ? gap : 0);
  });

  return { children: boxed, height: Math.max(MIN_BOX, cursorY - contentY) };
}

function layoutHorizontalChildren(
  node: GeneratedNode,
  contentX: number,
  contentY: number,
  contentWidth: number,
  gap: number
): { children: BoxedNode[]; height: number } {
  const count = node.children.length;
  const totalGap = gap * Math.max(0, count - 1);
  const fixedWidthSum = node.children.reduce((sum, c) => sum + (c.layout.width ?? 0), 0);
  const autoCount = node.children.filter((c) => !c.layout.width).length;
  const remaining = Math.max(0, contentWidth - fixedWidthSum - totalGap);
  const autoWidth = autoCount > 0 ? remaining / autoCount : 0;

  const boxed: BoxedNode[] = [];
  let cursorX = contentX;
  let maxHeight = MIN_BOX;

  node.children.forEach((child) => {
    const childWidth = Math.max(MIN_BOX, child.layout.width ?? autoWidth);
    const boxedChild = layoutNode(child, cursorX, contentY, childWidth);
    boxed.push(boxedChild);
    cursorX += childWidth + gap;
    maxHeight = Math.max(maxHeight, boxedChild.box.height);
  });

  return { children: boxed, height: maxHeight };
}

function layoutGridChildren(
  node: GeneratedNode,
  contentX: number,
  contentY: number,
  contentWidth: number,
  gap: number
): { children: BoxedNode[]; height: number } {
  const columns = Math.max(1, node.layout.columns ?? 1);
  const colWidth = Math.max(MIN_BOX, (contentWidth - gap * (columns - 1)) / columns);

  const boxed: BoxedNode[] = [];
  let cursorY = contentY;
  let rowHeight = MIN_BOX;

  node.children.forEach((child, idx) => {
    const col = idx % columns;
    const cellX = contentX + col * (colWidth + gap);
    const boxedChild = layoutNode(child, cellX, cursorY, colWidth);
    boxed.push(boxedChild);
    rowHeight = Math.max(rowHeight, boxedChild.box.height);

    const isLastInRow = col === columns - 1 || idx === node.children.length - 1;
    if (isLastInRow) {
      cursorY += rowHeight + gap;
      rowHeight = MIN_BOX;
    }
  });

  const totalHeight = boxed.length > 0 ? cursorY - gap - contentY : MIN_BOX;
  return { children: boxed, height: Math.max(MIN_BOX, totalHeight) };
}

/** Entry point: lays out the whole generated tree within a page of `pageWidth`. */
export function layoutGenerationTree(root: GeneratedNode, pageWidth: number): BoxedNode {
  return layoutNode(root, 0, 0, pageWidth);
}
