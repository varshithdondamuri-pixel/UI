export interface UIGenerationSpecSection {
  type: string;
  purpose: string;
  order: number;
}

export interface UIGenerationSpecComponent {
  type: string;
  purpose: string;
  content?: string;
}

export interface UIGenerationSpecLayout {
  structure: string;
  columns?: number;
  responsive: boolean;
}

export interface UIGenerationSpecStyle {
  theme: string;
  mood: string;
  typography: string;
  spacing: string;
  radius: string;
}

export interface UIGenerationSpecContent {
  headings: string[];
  labels: string[];
  ctas: string[];
}

export interface UIGenerationSpec {
  intent: string;

  productType:
    | 'website'
    | 'dashboard'
    | 'mobile_app'
    | 'landing_page'
    | 'ecommerce'
    | 'form'
    | 'other';

  purpose: string;

  pages: string[];

  sections: UIGenerationSpecSection[];

  components: UIGenerationSpecComponent[];

  layout: UIGenerationSpecLayout;

  visualStyle: UIGenerationSpecStyle;

  content: UIGenerationSpecContent;

  referenceQueries: string[];

  confidence: number;
}

/**
 * Creates a default, schema-valid UIGenerationSpec fallback for safe recovery
 */
export function createDefaultUIGenerationSpec(
  prompt: string,
  productType: UIGenerationSpec['productType'] = 'website'
): UIGenerationSpec {
  return {
    intent: prompt,
    productType,
    purpose: `Build a modern, high-converting ${productType} interface`,
    pages: ['Home', 'Features', 'Pricing', 'Contact'],
    sections: [
      { type: 'Navbar', purpose: 'Navigation & Branding', order: 1 },
      { type: 'Hero', purpose: 'Primary Value Proposition & CTA', order: 2 },
      { type: 'Features', purpose: 'Key Features Showcase', order: 3 },
      { type: 'Footer', purpose: 'Footer & Legal Links', order: 4 }
    ],
    components: [
      { type: 'Navbar', purpose: 'Top Bar', content: 'Brand Logo, Nav Links, Sign In' },
      { type: 'HeroBanner', purpose: 'Hero Section', content: 'Main Headline, Subtitle, CTA Button' },
      { type: 'CardGrid', purpose: 'Feature Cards', content: 'Feature Items with Icons' }
    ],
    layout: {
      structure: 'responsive_grid',
      columns: 12,
      responsive: true
    },
    visualStyle: {
      theme: 'dark',
      mood: 'modern_premium',
      typography: 'Inter, sans-serif',
      spacing: 'relaxed',
      radius: 'rounded_md'
    },
    content: {
      headings: ['Build Exceptional Digital Products', 'Powerful Features for Modern Teams'],
      labels: ['Products', 'Features', 'Pricing', 'About Us'],
      ctas: ['Get Started', 'Learn More', 'Sign Up Free']
    },
    referenceQueries: [productType, 'hero section', 'feature grid', 'navigation bar'],
    confidence: 0.95
  };
}
