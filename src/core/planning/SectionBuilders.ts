import { UIGenerationSpec } from '../ai/UIGenerationSpec';
import { DesignTokenSchema } from '../recognition/DesignTokenSchema';
import { GeneratedNode, GeneratedNodeStyle } from './GenerationTree';

export type SectionKey =
  | 'navbar'
  | 'hero'
  | 'product_grid'
  | 'feature_grid'
  | 'cta'
  | 'footer'
  | 'sidebar'
  | 'topbar'
  | 'kpi_row'
  | 'chart_area'
  | 'data_table'
  | 'login_form';

interface StyleKit {
  surface: GeneratedNodeStyle;
  surfaceAccent: GeneratedNodeStyle;
  primaryButton: GeneratedNodeStyle;
  inputField: GeneratedNodeStyle;
  transparentText: GeneratedNodeStyle;
  mutedText: GeneratedNodeStyle;
  onAccentText: GeneratedNodeStyle;
  priceText: GeneratedNodeStyle;
  spacing: Record<string, number>;
}

/**
 * Every color a builder uses comes from here, resolved once per generation
 * from the spec's visualStyle (see DefaultDesignTokens.resolveDesignTokens).
 * Builders never hardcode a hex value.
 */
function styleKit(tokens: DesignTokenSchema): StyleKit {
  return {
    surface: { fill: tokens.colors.surface, stroke: tokens.colors.border, strokeWidth: 1 },
    surfaceAccent: { fill: tokens.colors.surface, stroke: tokens.colors.primary, strokeWidth: 2 },
    primaryButton: { fill: tokens.colors.primary, stroke: tokens.colors.primary, strokeWidth: 1 },
    inputField: { fill: tokens.colors.background, stroke: tokens.colors.border, strokeWidth: 1 },
    transparentText: { fill: tokens.colors.textPrimary, stroke: 'transparent', strokeWidth: 0 },
    mutedText: { fill: tokens.colors.textSecondary, stroke: 'transparent', strokeWidth: 0 },
    onAccentText: { fill: tokens.colors.background, stroke: 'transparent', strokeWidth: 0 },
    priceText: { fill: tokens.colors.primary, stroke: 'transparent', strokeWidth: 0 },
    spacing: tokens.spacing as unknown as Record<string, number>
  };
}

function counter() {
  let n = 0;
  return () => n++;
}

function textNode(id: string, role: GeneratedNode['role'], text: string, style: GeneratedNodeStyle): GeneratedNode {
  return {
    id,
    role,
    kind: 'text',
    text,
    layout: { direction: 'vertical', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    style,
    children: []
  };
}

export type SectionBuilder = (spec: UIGenerationSpec, tokens: DesignTokenSchema) => GeneratedNode;

// ---------------------------------------------------------------------------
// 1. Navbar
// ---------------------------------------------------------------------------
const BRAND_BY_PRODUCT_TYPE: Partial<Record<UIGenerationSpec['productType'], string>> = {
  ecommerce: 'Northwind',
  dashboard: 'Metrio',
  mobile_app: 'Pulse',
  form: 'Accessly'
};

export function buildNavbar(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surfaceAccent, primaryButton, transparentText, mutedText, onAccentText, spacing } = styleKit(tokens);
  const next = counter();
  const brand = BRAND_BY_PRODUCT_TYPE[spec.productType] || 'Northwind';
  const links = (spec.content.labels?.length ? spec.content.labels : ['Home', 'Shop', 'About', 'Contact']).slice(0, 4);
  const cta = spec.content.ctas?.[0] || 'Sign In';

  const children: GeneratedNode[] = [
    textNode(`navbar-brand-${next()}`, 'brand-logo', brand, transparentText),
    ...links.map((label) => textNode(`navbar-link-${next()}`, 'nav-link', label, mutedText)),
    {
      id: `navbar-cta-${next()}`,
      role: 'nav-cta',
      kind: 'rect',
      layout: { direction: 'vertical', gap: 0, padding: { top: 8, right: 16, bottom: 8, left: 16 }, width: 120, height: 40 },
      style: primaryButton,
      children: [textNode(`navbar-cta-text-${next()}`, 'nav-cta', cta, onAccentText)]
    }
  ];

  return {
    id: 'navbar-root',
    role: 'navbar',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: spacing.lg, padding: { top: 16, right: 32, bottom: 16, left: 32 }, height: 72 },
    style: surfaceAccent,
    children
  };
}

// ---------------------------------------------------------------------------
// 2. Hero
// ---------------------------------------------------------------------------
export function buildHero(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surfaceAccent, primaryButton, transparentText, mutedText, onAccentText, spacing } = styleKit(tokens);
  const heading = spec.content.headings?.[0] || 'Build Your Perfect Experience';
  const subheading = spec.content.headings?.[1] || spec.purpose || 'A modern, high-converting interface generated for you.';
  const cta = spec.content.ctas?.[0] || 'Get Started';

  const content: GeneratedNode = {
    id: 'hero-content',
    role: 'hero-content',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.md, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    children: [
      textNode('hero-heading', 'hero-heading', heading, transparentText),
      textNode('hero-subheading', 'hero-subheading', subheading, mutedText),
      {
        id: 'hero-cta',
        role: 'hero-cta',
        kind: 'rect',
        layout: { direction: 'vertical', gap: 0, padding: { top: 12, right: 24, bottom: 12, left: 24 }, width: 180, height: 50 },
        style: primaryButton,
        children: [textNode('hero-cta-text', 'hero-cta', cta, onAccentText)]
      }
    ]
  };

  const media: GeneratedNode = {
    id: 'hero-media',
    role: 'hero-media',
    kind: 'rect',
    layout: { direction: 'vertical', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 }, width: 420 },
    style: surfaceAccent,
    children: []
  };

  return {
    id: 'hero-root',
    role: 'hero',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: spacing.xl, padding: { top: 48, right: 48, bottom: 48, left: 48 }, height: 420 },
    style: { fill: tokens.colors.background, stroke: 'transparent', strokeWidth: 0 },
    children: [content, media]
  };
}

const DEFAULT_PRODUCTS = [
  { name: 'Classic Runner Sneaker', price: '$129.99' },
  { name: 'Trail Blazer Hiking Boot', price: '$159.99' },
  { name: 'Studio Canvas Low-Top', price: '$89.99' },
  { name: 'AeroKnit Performance Trainer', price: '$149.99' },
  { name: 'Everyday Court Sneaker', price: '$99.99' },
  { name: 'Premium Leather High-Top', price: '$189.99' }
];

// ---------------------------------------------------------------------------
// 3. Product grid
// ---------------------------------------------------------------------------
export function buildProductGrid(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, surfaceAccent, transparentText, mutedText, priceText, spacing } = styleKit(tokens);
  const cta = spec.content.ctas?.[1] || spec.content.ctas?.[0] || 'Add to Cart';

  const cards: GeneratedNode[] = DEFAULT_PRODUCTS.map((product, idx) => ({
    id: `product-card-${idx}`,
    role: 'product-card',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.sm, padding: { top: 16, right: 16, bottom: 16, left: 16 }, height: 260 },
    style: surface,
    children: [
      { id: `product-card-image-${idx}`, role: 'product-card-image', kind: 'rect', layout: { direction: 'vertical', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 }, height: 130 }, style: surfaceAccent, children: [] },
      textNode(`product-card-title-${idx}`, 'product-card-title', product.name, transparentText),
      textNode(`product-card-price-${idx}`, 'product-card-price', product.price, priceText),
      textNode(`product-card-cta-${idx}`, 'product-card-cta', cta, mutedText)
    ]
  }));

  return {
    id: 'product-grid-root',
    role: 'product-grid',
    kind: 'rect',
    layout: { direction: 'grid', columns: 3, gap: spacing.lg, padding: { top: 32, right: 32, bottom: 32, left: 32 } },
    style: { fill: tokens.colors.background, stroke: 'transparent', strokeWidth: 0 },
    children: cards
  };
}

const DEFAULT_FEATURES = [
  { title: 'Fast Shipping', description: 'Free two-day delivery on every order, no minimum required.' },
  { title: 'Easy Returns', description: '30-day hassle-free returns with a prepaid shipping label.' },
  { title: 'Secure Checkout', description: 'Bank-grade encryption protects every transaction end-to-end.' }
];

// ---------------------------------------------------------------------------
// 4. Feature grid
// ---------------------------------------------------------------------------
export function buildFeatureGrid(_spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, transparentText, mutedText, spacing } = styleKit(tokens);
  const cards: GeneratedNode[] = DEFAULT_FEATURES.map((feature, idx) => ({
    id: `feature-card-${idx}`,
    role: 'feature-card',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.sm, padding: { top: 20, right: 20, bottom: 20, left: 20 }, height: 180 },
    style: surface,
    children: [
      textNode(`feature-title-${idx}`, 'feature-title', feature.title, transparentText),
      textNode(`feature-description-${idx}`, 'feature-description', feature.description, mutedText)
    ]
  }));

  return {
    id: 'feature-grid-root',
    role: 'feature-grid',
    kind: 'rect',
    layout: { direction: 'grid', columns: 3, gap: spacing.lg, padding: { top: 32, right: 32, bottom: 32, left: 32 } },
    // A step up from the raw page background so this band reads as distinct
    // from whatever sits above/below it, instead of one flat wall of color.
    style: { fill: tokens.colors.surface, stroke: 'transparent', strokeWidth: 0 },
    children: cards
  };
}

// ---------------------------------------------------------------------------
// 5. CTA section
// ---------------------------------------------------------------------------
export function buildCTA(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surfaceAccent, primaryButton, transparentText, onAccentText, spacing } = styleKit(tokens);
  const heading = spec.content.headings?.[1] || 'Ready to get started?';
  const cta = spec.content.ctas?.[1] || spec.content.ctas?.[0] || 'Get Started Today';

  return {
    id: 'cta-root',
    role: 'cta-section',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.md, padding: { top: 48, right: 48, bottom: 48, left: 48 }, height: 200 },
    style: surfaceAccent,
    children: [
      textNode('cta-heading', 'cta-heading', heading, transparentText),
      {
        id: 'cta-button',
        role: 'cta-button',
        kind: 'rect',
        layout: { direction: 'vertical', gap: 0, padding: { top: 12, right: 24, bottom: 12, left: 24 }, width: 200, height: 50 },
        style: primaryButton,
        children: [textNode('cta-button-text', 'cta-button', cta, onAccentText)]
      }
    ]
  };
}

// ---------------------------------------------------------------------------
// 6. Footer
// ---------------------------------------------------------------------------
export function buildFooter(_spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, transparentText, mutedText, spacing } = styleKit(tokens);
  const columns: { title: string; links: string[] }[] = [
    { title: 'Shop', links: ['New Arrivals', 'Best Sellers', 'Sale'] },
    { title: 'Support', links: ['Contact Us', 'Shipping Info', 'Returns'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Privacy Policy'] }
  ];

  const children: GeneratedNode[] = columns.map((col, idx) => ({
    id: `footer-column-${idx}`,
    role: 'footer-column',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.sm, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    children: [
      textNode(`footer-column-title-${idx}`, 'footer-link', col.title, transparentText),
      ...col.links.map((link, lidx) => textNode(`footer-link-${idx}-${lidx}`, 'footer-link', link, mutedText))
    ]
  }));

  return {
    id: 'footer-root',
    role: 'footer',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: spacing.xl, padding: { top: 32, right: 48, bottom: 32, left: 48 }, height: 180 },
    style: surface,
    children
  };
}

// ---------------------------------------------------------------------------
// 7. Sidebar
// ---------------------------------------------------------------------------
export function buildSidebar(_spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surfaceAccent, mutedText, spacing } = styleKit(tokens);
  // Not sourced from spec.content.labels: those are generic nav labels
  // (e.g. "Products/Features/Pricing") that don't read as sidebar nav items.
  const items = ['Dashboard', 'Orders', 'Customers', 'Settings', 'Sign Out'];

  return {
    id: 'sidebar-root',
    role: 'sidebar',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.sm, padding: { top: 24, right: 16, bottom: 24, left: 16 }, width: 220 },
    style: surfaceAccent,
    children: items.slice(0, 6).map((item, idx) => textNode(`sidebar-item-${idx}`, 'sidebar-item', item, mutedText))
  };
}

// ---------------------------------------------------------------------------
// 8. Topbar
// ---------------------------------------------------------------------------
export function buildTopbar(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, transparentText, mutedText, spacing } = styleKit(tokens);
  const title = spec.content.headings?.[0] || 'Dashboard Overview';

  return {
    id: 'topbar-root',
    role: 'topbar',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: spacing.md, padding: { top: 16, right: 32, bottom: 16, left: 32 }, height: 64 },
    style: surface,
    children: [
      textNode('topbar-title', 'topbar-title', title, transparentText),
      textNode('topbar-user', 'topbar-user', 'Account', mutedText)
    ]
  };
}

// ---------------------------------------------------------------------------
// 9. KPI row
// ---------------------------------------------------------------------------
export function buildKPIRow(_spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, transparentText, mutedText, spacing } = styleKit(tokens);
  // Not sourced from spec.content: it has no paired label/value shape, so
  // there's no way to derive a real metric value from it without faking one.
  const metrics: { label: string; value: string }[] = [
    { label: 'Monthly revenue', value: '$84,200' },
    { label: 'Active users', value: '14,250' },
    { label: 'Conversion rate', value: '4.8%' },
    { label: 'Churn rate', value: '1.2%' }
  ];

  const children: GeneratedNode[] = metrics.map((metric, idx) => ({
    id: `kpi-card-${idx}`,
    role: 'kpi-card',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.xs, padding: { top: 16, right: 16, bottom: 16, left: 16 }, height: 110 },
    style: surface,
    children: [
      textNode(`kpi-value-${idx}`, 'kpi-value', metric.value, transparentText),
      textNode(`kpi-label-${idx}`, 'kpi-label', metric.label, mutedText)
    ]
  }));

  return {
    id: 'kpi-row-root',
    role: 'kpi-row',
    kind: 'rect',
    layout: { direction: 'grid', columns: 4, gap: spacing.md, padding: { top: 24, right: 32, bottom: 0, left: 32 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    children
  };
}

// ---------------------------------------------------------------------------
// 10. Chart area
// ---------------------------------------------------------------------------
export function buildChartArea(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, transparentText, spacing } = styleKit(tokens);
  const title = spec.content.headings?.[1] || 'Revenue Trend — Last 30 Days';

  return {
    id: 'chart-area-root',
    role: 'chart-area',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.sm, padding: { top: 20, right: 24, bottom: 20, left: 24 }, height: 320 },
    style: surface,
    children: [textNode('chart-title', 'chart-title', title, transparentText)]
  };
}

// ---------------------------------------------------------------------------
// 11. Data table
// ---------------------------------------------------------------------------
export function buildDataTable(_spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surface, surfaceAccent, transparentText, mutedText, spacing } = styleKit(tokens);
  const columns = ['Customer', 'Order', 'Status', 'Total'];
  const rows = [
    ['Alicia Cole', '#10432', 'Shipped', '$189.00'],
    ['Marcus Webb', '#10431', 'Processing', '$74.50'],
    ['Priya Nair', '#10430', 'Delivered', '$312.20']
  ];

  const header: GeneratedNode = {
    id: 'data-table-header',
    role: 'data-table-header',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: spacing.md, padding: { top: 10, right: 16, bottom: 10, left: 16 }, height: 40 },
    style: surfaceAccent,
    children: columns.map((col, idx) => textNode(`data-table-header-cell-${idx}`, 'data-table-header-cell', col, transparentText))
  };

  const bodyRows: GeneratedNode[] = rows.map((row, ridx) => ({
    id: `data-table-row-${ridx}`,
    role: 'data-table-row',
    kind: 'rect',
    layout: { direction: 'horizontal', gap: spacing.md, padding: { top: 10, right: 16, bottom: 10, left: 16 }, height: 40 },
    style: surface,
    children: row.map((cell, cidx) => textNode(`data-table-cell-${ridx}-${cidx}`, 'data-table-cell', cell, mutedText))
  }));

  return {
    id: 'data-table-root',
    role: 'data-table',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.xs, padding: { top: 20, right: 24, bottom: 20, left: 24 } },
    style: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
    children: [header, ...bodyRows]
  };
}

// ---------------------------------------------------------------------------
// 12. Login form
// ---------------------------------------------------------------------------
export function buildLoginForm(spec: UIGenerationSpec, tokens: DesignTokenSchema): GeneratedNode {
  const { surfaceAccent, primaryButton, inputField, transparentText, mutedText, onAccentText, spacing } = styleKit(tokens);
  const title = spec.content.headings?.[0] || 'Welcome Back';
  const cta = spec.content.ctas?.[0] || 'Sign In';

  return {
    id: 'login-form-root',
    role: 'login-form',
    kind: 'rect',
    layout: { direction: 'vertical', gap: spacing.md, padding: { top: 40, right: 40, bottom: 40, left: 40 }, width: 440 },
    style: surfaceAccent,
    children: [
      textNode('login-title', 'login-title', title, transparentText),
      { id: 'login-field-email', role: 'login-field', kind: 'rect', layout: { direction: 'vertical', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 }, height: 48 }, style: inputField, children: [textNode('login-field-email-label', 'login-field', 'Email Address', mutedText)] },
      { id: 'login-field-password', role: 'login-field', kind: 'rect', layout: { direction: 'vertical', gap: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 }, height: 48 }, style: inputField, children: [textNode('login-field-password-label', 'login-field', 'Password', mutedText)] },
      {
        id: 'login-button',
        role: 'login-button',
        kind: 'rect',
        layout: { direction: 'vertical', gap: 0, padding: { top: 12, right: 0, bottom: 12, left: 0 }, height: 50 },
        style: primaryButton,
        children: [textNode('login-button-text', 'login-button', cta, onAccentText)]
      }
    ]
  };
}

export const sectionBuilders: Record<SectionKey, SectionBuilder> = {
  navbar: buildNavbar,
  hero: buildHero,
  product_grid: buildProductGrid,
  feature_grid: buildFeatureGrid,
  cta: buildCTA,
  footer: buildFooter,
  sidebar: buildSidebar,
  topbar: buildTopbar,
  kpi_row: buildKPIRow,
  chart_area: buildChartArea,
  data_table: buildDataTable,
  login_form: buildLoginForm
};

/**
 * Maps a spec section's freeform `type` string (and overall productType
 * context, since a generic "content grid" section means different things for
 * an ecommerce site vs. a SaaS landing page) to a known builder key.
 * Returns null for anything unrecognized — composer skips those, never fakes them.
 */
export function resolveSectionKey(sectionType: string, productType: UIGenerationSpec['productType']): SectionKey | null {
  const t = sectionType.toLowerCase().replace(/[^a-z]/g, '');

  if (/login|signin|signup|auth/.test(t)) return 'login_form';
  if (/sidebar/.test(t)) return 'sidebar';
  if (/topbar/.test(t)) return 'topbar';
  if (/kpi|metric|stat/.test(t)) return 'kpi_row';
  if (/chart|analytic|graph/.test(t)) return 'chart_area';
  if (/table|datagrid/.test(t)) return 'data_table';
  if (/product|catalog|shop/.test(t)) return 'product_grid';
  if (/cta|calltoaction/.test(t)) return 'cta';
  if (/hero|banner/.test(t)) return 'hero';
  if (/nav|header|menu/.test(t) && !/sub/.test(t)) return 'navbar';
  if (/footer/.test(t)) return 'footer';

  // Generic "content" sections (Features, ContentGrid, Content, Grid, ...)
  // resolve based on what the product actually is.
  if (/feature|content|grid|benefit/.test(t)) {
    if (productType === 'ecommerce') return 'product_grid';
    if (productType === 'dashboard') return 'kpi_row';
    if (productType === 'form') return 'login_form';
    return 'feature_grid';
  }

  return null;
}
