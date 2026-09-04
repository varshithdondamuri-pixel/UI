export type KnowledgeCategoryType =
  | 'design-systems'
  | 'ui-components'
  | 'layout-patterns'
  | 'ux-patterns'
  | 'industry-templates'
  | 'design-styles'
  | 'color-knowledge'
  | 'typography-knowledge'
  | 'animation-knowledge'
  | 'accessibility'
  | 'responsive-design'
  | 'dashboard-library'
  | 'saas-library'
  | 'ai-product-library'
  | 'ecommerce-library'
  | 'forms-library'
  | 'charts'
  | 'icons'
  | 'illustrations'
  | 'component-states'
  | 'ux-research'
  | 'conversion-knowledge'
  | 'design-trends'
  | 'generated-designs';

export type KnowledgeRecordStatus = 'active' | 'deprecated' | 'draft';

export type KnowledgeRelationshipType =
  | 'uses'
  | 'contains'
  | 'complements'
  | 'variantOf'
  | 'recommends';

export interface KnowledgeRelationship {
  sourceId: string;
  type: KnowledgeRelationshipType;
  targetId: string;
  weight: number; // 0.0 to 1.0
  description?: string;
}

export interface KnowledgeRecord {
  id: string;
  title: string;
  category: KnowledgeCategoryType;
  subcategory: string;
  industry: string;
  style: string;
  purpose: string;
  description: string;
  tags: string[];
  keywords: string[];
  qualityScore: number; // 0 to 100
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  deviceSupport: ('desktop' | 'tablet' | 'mobile' | 'foldable' | 'ultrawide')[];
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    contrastRatio: number;
    ariaSupported: boolean;
    keyboardNavigable: boolean;
  };
  responsiveSupport: {
    supportsDesktop: boolean;
    supportsTablet: boolean;
    supportsMobile: boolean;
    stackingStrategy: 'stack' | 'grid' | 'wrap' | 'hide';
  };
  relationships: KnowledgeRelationship[];
  version: string; // e.g. "1.0.0"
  createdAt: number;
  updatedAt: number;
  source: string;
  license: string;
  status: KnowledgeRecordStatus;
  payload?: Record<string, any>;
}

export interface KnowledgeSearchQuery {
  category?: KnowledgeCategoryType;
  subcategory?: string;
  industry?: string;
  style?: string;
  keyword?: string;
  purpose?: string;
  tags?: string[];
  device?: 'desktop' | 'tablet' | 'mobile' | 'foldable' | 'ultrawide';
  minQualityScore?: number;
  minAccessibilityLevel?: 'A' | 'AA' | 'AAA';
  status?: KnowledgeRecordStatus;
}

export interface KnowledgeRankingWeights {
  relevance: number;
  industryMatch: number;
  styleMatch: number;
  popularity: number;
  qualityScore: number;
  freshness: number;
  accessibility: number;
}

export interface KnowledgeSearchResult {
  record: KnowledgeRecord;
  score: number;
  matchReasons: string[];
}

export interface KnowledgeValidationIssue {
  id: string;
  code:
    | 'DUPLICATE_ID'
    | 'MISSING_METADATA'
    | 'BROKEN_RELATIONSHIP'
    | 'INVALID_CATEGORY'
    | 'VERSION_CONFLICT';
  message: string;
  severity: 'error' | 'warning' | 'info';
  recordId?: string;
}

export interface KnowledgeValidationResult {
  isValid: boolean;
  issues: KnowledgeValidationIssue[];
  totalChecked: number;
}

export interface KnowledgeQualityDistribution {
  excellent: number; // 90-100
  good: number; // 75-89
  fair: number; // 50-74
  poor: number; // < 50
}

export interface KnowledgeStats {
  totalEntries: number;
  entriesPerCategory: Record<KnowledgeCategoryType, number>;
  entriesPerIndustry: Record<string, number>;
  entriesPerStyle: Record<string, number>;
  coveragePercentage: number;
  qualityDistribution: KnowledgeQualityDistribution;
}

export interface KnowledgeBundleRequest {
  prompt?: string;
  intent?: string;
  industry?: string;
  style?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export interface KnowledgeBundle {
  id: string;
  intent: string;
  industry: string;
  style: string;
  layoutPattern: KnowledgeRecord | null;
  components: KnowledgeRecord[];
  colors: KnowledgeRecord | null;
  typography: KnowledgeRecord | null;
  accessibilityRules: KnowledgeRecord[];
  animations: KnowledgeRecord[];
  createdAt: number;
}
