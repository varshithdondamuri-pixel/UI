import { BoundingBox } from '../../types';
import { IntentPriority } from '../recognition/RecognitionTypes';

export type LayoutDirection = 'vertical' | 'horizontal' | 'grid' | 'stack' | 'split';

export type GridType =
  | 'single_column'
  | 'two_column'
  | 'three_column'
  | 'four_column'
  | 'responsive_grid'
  | 'stack'
  | 'split_layout';

export interface AlignmentRule {
  horizontal: 'left' | 'center' | 'right' | 'stretch' | 'space-between';
  vertical: 'top' | 'center' | 'bottom' | 'stretch' | 'space-between';
}

export type DistributionRule =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';

export interface LogicalPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LogicalMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LogicalSafeAreas {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpacingRules {
  sectionSpacing: number;
  internalSpacing: number;
  contentPadding: LogicalPadding;
  margins: LogicalMargins;
  safeAreas: LogicalSafeAreas;
}

export interface GridRules {
  gridType: GridType;
  columns: number;
  gap: number;
  autoFit: boolean;
  minColumnWidth?: number;
}

export interface ContainerRules {
  fullWidth: boolean;
  maxContentWidth: number;
  centered: boolean;
}

export interface LayoutConstraints {
  minWidth: number;
  maxWidth: number;
  preferredWidth: number;
  minHeight?: number;
  maxHeight?: number;
  preferredHeight?: number;
  aspectRatio?: number;
  alignment: string;
  containerRules: ContainerRules;
}

export interface ResponsiveBehavior {
  direction: LayoutDirection;
  columns: number;
  stacking: 'vertical' | 'horizontal' | 'grid' | 'wrap';
  hidden: boolean;
}

export interface ResponsiveRules {
  desktop: ResponsiveBehavior;
  tablet: ResponsiveBehavior;
  mobile: ResponsiveBehavior;
}

export type HierarchyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type VisualWeight = 'high' | 'medium' | 'low';
export type SpacingRequirement = 'compact' | 'standard' | 'relaxed' | 'spacious';
export type ContentDensity = 'low' | 'medium' | 'high';

export interface SectionPlanningInfo {
  estimatedWidth: number;
  estimatedHeight: number;
  preferredPosition: {
    index: number;
    anchor: 'top' | 'middle' | 'bottom' | 'floating';
    relativeY: number;
  };
  importance: IntentPriority;
  visualWeight: VisualWeight;
  spacingRequirement: SpacingRequirement;
  contentDensity: ContentDensity;
}

export interface BlueprintNode {
  id: string;
  type: string;
  parent: string | null;
  children: BlueprintNode[];
  priority: IntentPriority;
  purpose: string;
  bounds: BoundingBox;
  layoutDirection: LayoutDirection;
  alignment: AlignmentRule;
  distribution: DistributionRule;
  spacingRules: SpacingRules;
  gridRules: GridRules;
  constraints: LayoutConstraints;
  responsiveRules: ResponsiveRules;
  sourceIntentNode: string;
  confidence: number;

  // Extended structural metadata
  hierarchyLevel: HierarchyLevel;
  sectionInfo?: SectionPlanningInfo;
}

export type WarningSeverity = 'info' | 'warning' | 'error';

export interface BlueprintWarning {
  id: string;
  code: string;
  message: string;
  severity: WarningSeverity;
  nodeId?: string;
  details?: Record<string, any>;
}

export interface BlueprintValidationResult {
  valid: boolean;
  warnings: BlueprintWarning[];
}

export interface LayoutBlueprint {
  id: string;
  root: BlueprintNode;
  hierarchyMap: Record<HierarchyLevel, string[]>;
  timestamp: number;
  totalNodeCount: number;
  validation: BlueprintValidationResult;
}

// ------------------------------------------------------------------
// Phase 3.5: Multi-Blueprint Planning & Variant Interfaces
// ------------------------------------------------------------------

export type LayoutStrategy =
  | 'centered'
  | 'split'
  | 'asymmetric'
  | 'grid'
  | 'sidebar'
  | 'hero_focused'
  | 'content_focused'
  | 'dashboard'
  | 'landing_page'
  | 'magazine'
  | 'minimal'
  | 'responsive_stack';

export interface BlueprintVariant {
  id: string;
  name: string;
  description: string;
  layoutStrategy: LayoutStrategy;
  confidence: number;
  advantages: string[];
  tradeoffs: string[];
  responsiveScore: number;
  complexityScore: number;
  maintainabilityScore: number;
  sourceIntentTree: string;
  blueprint: LayoutBlueprint;
}

export interface VariantScores {
  intentMatch: number; // 0 - 100
  layoutBalance: number; // 0 - 100
  responsiveStructure: number; // 0 - 100
  hierarchyQuality: number; // 0 - 100
  constraintSatisfaction: number; // 0 - 100
  validationPenalty: number; // 0 - 50
  overallScore: number; // 0 - 100
}

export interface RankedBlueprintVariant {
  rank: number;
  variant: BlueprintVariant;
  scores: VariantScores;
}

export interface StructuralMetrics {
  hierarchyDepth: number;
  spacingUniformity: number; // 0 - 100
  gridFlexibility: number; // 0 - 100
  structuralComplexity: number; // 0 - 100
  responsiveQuality: number; // 0 - 100
  visualBalance: number; // 0 - 100
  contentDensity: number; // 0 - 100
  navigationEfficiency: number; // 0 - 100
}

export interface VariantComparisonEntry {
  variantId: string;
  variantName: string;
  strategy: LayoutStrategy;
  overallScore: number;
  metrics: StructuralMetrics;
}

export interface VariantComparisonMatrix {
  timestamp: number;
  variants: VariantComparisonEntry[];
  recommendedVariantId: string;
}
