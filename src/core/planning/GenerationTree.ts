import { BoundingBox } from '../../types';

/**
 * Semantic role every generated node carries. This is what PropertyInspector
 * and SelectionEngine surface instead of a raw shape id like "rect_47".
 */
export type GeneratedRole =
  | 'page'
  | 'main-row'
  | 'main-column'
  | 'navbar'
  | 'brand-logo'
  | 'nav-link'
  | 'nav-cta'
  | 'hero'
  | 'hero-content'
  | 'hero-heading'
  | 'hero-subheading'
  | 'hero-cta'
  | 'hero-media'
  | 'product-grid'
  | 'product-card'
  | 'product-card-image'
  | 'product-card-title'
  | 'product-card-price'
  | 'product-card-cta'
  | 'feature-grid'
  | 'feature-card'
  | 'feature-title'
  | 'feature-description'
  | 'cta-section'
  | 'cta-heading'
  | 'cta-button'
  | 'footer'
  | 'footer-column'
  | 'footer-link'
  | 'sidebar'
  | 'sidebar-item'
  | 'topbar'
  | 'topbar-title'
  | 'topbar-user'
  | 'kpi-row'
  | 'kpi-card'
  | 'kpi-value'
  | 'kpi-label'
  | 'chart-area'
  | 'chart-title'
  | 'data-table'
  | 'data-table-header'
  | 'data-table-header-cell'
  | 'data-table-row'
  | 'data-table-cell'
  | 'login-form'
  | 'login-title'
  | 'login-field'
  | 'login-button';

export type LayoutDirection = 'vertical' | 'horizontal' | 'grid';

export interface LayoutHint {
  direction: LayoutDirection;
  columns?: number;
  gap: number;
  padding: { top: number; right: number; bottom: number; left: number };
  /** Fixed height in px. If omitted, height is derived from children. */
  height?: number;
  /** Fixed width in px. If omitted, width fills the parent's content box. */
  width?: number;
}

export interface GeneratedNodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/**
 * Structural output of a section builder / the composer: a tree with real
 * content but no absolute geometry yet. The layout pass turns this into a
 * BoxedNode tree.
 */
export interface GeneratedNode {
  id: string;
  role: GeneratedRole;
  kind: 'rect' | 'text';
  text?: string;
  layout: LayoutHint;
  style: GeneratedNodeStyle;
  children: GeneratedNode[];
  /** Purely structural wrapper (e.g. a row grouping a sidebar with its main column) — never emitted as a SceneGraph node. */
  invisible?: boolean;
}

/** A GeneratedNode after the layout pass has assigned it an absolute box. */
export interface BoxedNode extends Omit<GeneratedNode, 'children'> {
  box: BoundingBox;
  children: BoxedNode[];
}
