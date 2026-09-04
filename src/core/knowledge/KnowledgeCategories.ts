import { KnowledgeCategoryType } from './KnowledgeTypes';

export interface CategoryMetadata {
  type: KnowledgeCategoryType;
  name: string;
  description: string;
  subcategories: string[];
}

export const KNOWLEDGE_CATEGORIES: Record<KnowledgeCategoryType, CategoryMetadata> = {
  'design-systems': {
    type: 'design-systems',
    name: 'Design Systems',
    description: 'Structured design frameworks and global design language specifications.',
    subcategories: ['Modern SaaS', 'Enterprise', 'Minimal', 'Material', 'Glass', 'Neobrutalism', 'Editorial', 'Luxury', 'Dashboard', 'AI Product', 'Corporate']
  },
  'ui-components': {
    type: 'ui-components',
    name: 'UI Components',
    description: 'Reusable interface component specifications and structural patterns.',
    subcategories: ['Navbar', 'Hero', 'Button', 'Card', 'Sidebar', 'Footer', 'Input', 'Modal', 'Table', 'Chart', 'Avatar', 'Tabs', 'Timeline', 'Accordion', 'Gallery', 'Pricing', 'FAQ']
  },
  'layout-patterns': {
    type: 'layout-patterns',
    name: 'Layout Patterns',
    description: 'Structural spatial composition patterns and grid organization rules.',
    subcategories: ['Landing Page', 'Dashboard', 'Grid', 'Sidebar', 'Split Layout', 'Bento', 'Documentation', 'Portfolio', 'Analytics', 'Marketplace']
  },
  'ux-patterns': {
    type: 'ux-patterns',
    name: 'UX Patterns',
    description: 'User interaction flows and user journey interaction patterns.',
    subcategories: ['Authentication', 'Checkout', 'Search', 'Profile', 'Settings', 'Booking', 'Notifications', 'Messaging', 'Wizard', 'Support']
  },
  'industry-templates': {
    type: 'industry-templates',
    name: 'Industry Templates',
    description: 'Domain-specific design guidelines tailored by industry vertical.',
    subcategories: ['Healthcare', 'Finance', 'Education', 'Travel', 'Restaurant', 'Fitness', 'Legal', 'Government', 'Real Estate', 'Crypto', 'Gaming', 'Hospital', 'AI']
  },
  'design-styles': {
    type: 'design-styles',
    name: 'Design Styles',
    description: 'Visual style aesthetics, materials, surface treatments, and moods.',
    subcategories: ['Minimal', 'Glass', 'Modern', 'Corporate', 'Playful', 'Luxury', 'Futuristic', 'Elegant', 'Editorial', 'Dashboard']
  },
  'color-knowledge': {
    type: 'color-knowledge',
    name: 'Color Knowledge',
    description: 'Color palettes, 60-30-10 distribution rules, contrast ratios, and semantic roles.',
    subcategories: ['Primary', 'Secondary', 'Accent', 'Surface', 'Background', 'Border', 'Text', 'Success', 'Warning', 'Danger']
  },
  'typography-knowledge': {
    type: 'typography-knowledge',
    name: 'Typography Knowledge',
    description: 'Type scales, line heights, letter spacing, font pairings, and hierarchy.',
    subcategories: ['Display Scale', 'Heading Scale', 'Body Scale', 'Caption', 'Spacing', 'Line Height', 'Letter Spacing', 'Hierarchy']
  },
  'animation-knowledge': {
    type: 'animation-knowledge',
    name: 'Animation Knowledge',
    description: 'Motion timing, easing functions, and micro-interaction behaviors.',
    subcategories: ['Hover', 'Focus', 'Loading', 'Entrance', 'Exit', 'Page Transition', 'Micro Interaction']
  },
  'accessibility': {
    type: 'accessibility',
    name: 'Accessibility (A11y)',
    description: 'WCAG compliance standards, ARIA roles, focus management, and reading order.',
    subcategories: ['WCAG', 'Contrast', 'Touch Target', 'Keyboard', 'ARIA', 'Reading Order', 'Focus Order']
  },
  'responsive-design': {
    type: 'responsive-design',
    name: 'Responsive Design',
    description: 'Multi-device responsive breakpoints, stacking rules, and adaptive layouts.',
    subcategories: ['Desktop', 'Tablet', 'Mobile', 'Foldable', 'Ultra Wide']
  },
  'dashboard-library': {
    type: 'dashboard-library',
    name: 'Dashboard Library',
    description: 'Data analytics, monitoring dashboards, and admin control panels.',
    subcategories: ['Analytics', 'CRM', 'ERP', 'Finance', 'Monitoring', 'Inventory', 'Hospital']
  },
  'saas-library': {
    type: 'saas-library',
    name: 'SaaS Library',
    description: 'Software-as-a-service web patterns and conversion-focused pages.',
    subcategories: ['Landing', 'Pricing', 'Features', 'Testimonials', 'Integrations', 'Docs']
  },
  'ai-product-library': {
    type: 'ai-product-library',
    name: 'AI Product Library',
    description: 'AI chat interfaces, prompt workspaces, agent monitors, and knowledge bases.',
    subcategories: ['Chat', 'Workspace', 'Prompt', 'History', 'Agents', 'Automation', 'Knowledge Base']
  },
  'ecommerce-library': {
    type: 'ecommerce-library',
    name: 'E-commerce Library',
    description: 'Shopping, product catalog, cart, and storefront experience patterns.',
    subcategories: ['Product', 'Category', 'Cart', 'Checkout', 'Wishlist', 'Orders']
  },
  'forms-library': {
    type: 'forms-library',
    name: 'Forms Library',
    description: 'Input forms, multi-step wizards, validation feedback, and lead capture.',
    subcategories: ['Login', 'Signup', 'OTP', 'Contact', 'Survey', 'Payment']
  },
  'charts': {
    type: 'charts',
    name: 'Charts & Data Viz',
    description: 'Data visualization widgets, chart selections, and metric displays.',
    subcategories: ['Bar', 'Line', 'Pie', 'Area', 'Heatmap', 'Timeline', 'KPI']
  },
  'icons': {
    type: 'icons',
    name: 'Icons Library',
    description: 'Iconography placement, sizing rules, and semantic symbol usage.',
    subcategories: ['Usage Rules', 'Placement', 'Sizing', 'Purpose']
  },
  'illustrations': {
    type: 'illustrations',
    name: 'Illustrations',
    description: 'Vector illustration placeholders, hero graphic scenes, and empty states.',
    subcategories: ['Hero', 'Feature', 'Background', 'Empty State']
  },
  'component-states': {
    type: 'component-states',
    name: 'Component States',
    description: 'Interactive component state specifications (hover, focus, disabled, loading).',
    subcategories: ['Default', 'Hover', 'Active', 'Focused', 'Disabled', 'Loading', 'Success', 'Error']
  },
  'ux-research': {
    type: 'ux-research',
    name: 'UX Research',
    description: 'Empirical eye-tracking findings, F-shape/Z-shape reading patterns, and CTA placement.',
    subcategories: ['Reading Patterns', 'Eye Tracking', 'CTA Placement', 'Navigation', 'Scrolling']
  },
  'conversion-knowledge': {
    type: 'conversion-knowledge',
    name: 'Conversion Knowledge',
    description: 'High-converting UI heuristics, trust signals, and lead capture optimizations.',
    subcategories: ['Landing Pages', 'Pricing', 'Checkout', 'Forms', 'Lead Capture']
  },
  'design-trends': {
    type: 'design-trends',
    name: 'Design Trends',
    description: 'Curated design trends, popularity metrics, suitability contexts, and tradeoffs.',
    subcategories: ['Trend Name', 'Description', 'Popularity', 'Industries', 'When Appropriate', 'Tradeoffs']
  },
  'generated-designs': {
    type: 'generated-designs',
    name: 'Generated Designs',
    description: 'Stored user-approved design models converted into reusable knowledge assets.',
    subcategories: ['Approved Model', 'Custom Theme', 'User Blueprint']
  }
};
