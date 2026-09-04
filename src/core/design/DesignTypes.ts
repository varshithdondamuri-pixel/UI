import { BoundingBox } from '../../types';

export type DesignSystemType =
  | 'minimal'
  | 'modern-saas'
  | 'enterprise'
  | 'apple-inspired'
  | 'stripe-inspired'
  | 'linear-inspired'
  | 'dashboard'
  | 'mobile-first'
  | 'glass'
  | 'neobrutalist'
  | 'material';

export type ThemeType = 'light' | 'dark' | 'high-contrast' | 'neutral' | 'warm' | 'cool';

export interface StructuralRules {
  borderRadiusScale: Record<string, string>; // e.g. xs: '2px', sm: '4px', md: '8px', lg: '12px', full: '9999px'
  borderWidthScale: Record<string, number>; // e.g. none: 0, thin: 1, medium: 2, thick: 4
  shadowScale: Record<number, string>; // 0 to 5
  defaultGlassmorphism: boolean;
  useVibrantGradients: boolean;
  compactness: 'compact' | 'comfortable' | 'spacious';
  typographyScaleRatio: number; // e.g. 1.2 (Minor Third), 1.25 (Major Third), 1.333 (Perfect Fourth)
}

export interface DesignSystem {
  id: DesignSystemType;
  name: string;
  description: string;
  structuralRules: StructuralRules;
}

export interface ThemeMetadata {
  id: ThemeType;
  name: string;
  mode: 'light' | 'dark' | 'high-contrast';
  description: string;
}

export interface ColorTokens {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceSubtle: string;
  background: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  information: string;
  text: string;
  textMuted: string;
}

export interface TypographyStyle {
  fontSize: string;
  fontWeight: number | string;
  lineHeight: string | number;
  letterSpacing: string;
  hierarchy: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'button' | 'caption';
}

export interface TypographyScale {
  baseSize: number;
  scaleRatio: number;
  fontFamilyHeadings: string;
  fontFamilyBody: string;
  styles: {
    display: TypographyStyle;
    headingScale: TypographyStyle[]; // [h1, h2, h3, h4]
    bodyScale: TypographyStyle[]; // [body-lg, body]
    buttonText: TypographyStyle;
    caption: TypographyStyle;
  };
}

export interface SpacingSystem {
  baseUnit: number; // e.g. 4 or 8
  scale: number[]; // [4, 8, 12, 16, 24, 32, 48, 64, 96]
  sectionSpacing: number;
  containerSpacing: number;
  componentSpacing: number;
  internalPadding: { top: number; right: number; bottom: number; left: number };
  margins: { top: number; right: number; bottom: number; left: number };
}

export interface ElevationLevel {
  shadow: string;
  zIndex: number;
  backdropFilter?: string;
}

export interface ElevationPlan {
  levels: Record<number, ElevationLevel>;
}

export interface IconPlacement {
  location: string;
  size: number;
  style: 'outline' | 'filled' | 'duotone';
  purpose: 'navigation' | 'action' | 'indicator' | 'decorative' | 'status';
  suggestedName: string;
}

export interface IllustrationPlacement {
  type: 'hero' | 'feature' | 'empty-state' | 'background-graphics';
  location: string;
  suggestedStyle: string;
  aspectRatio: string;
}

export interface AnimationPlanItem {
  type: 'hover' | 'focus' | 'entrance' | 'page-transition' | 'micro-interaction' | 'loading';
  durationMs: number;
  easing: string;
  description: string;
}

export interface NodeAccessibilityMeta {
  contrastRatio: number;
  contrastPasses: boolean;
  touchTargetSizing: { width: number; height: number; meetsMinimum: boolean };
  keyboardNavigable: boolean;
  ariaRole: string;
  ariaLabel: string;
  readingOrder: number;
  focusOrder: number;
}

export interface DesignAccessibilitySummary {
  overallScore: number; // 0-100
  contrastValidationCount: { pass: number; fail: number };
  touchTargetValidationCount: { pass: number; fail: number };
  keyboardNavigableCount: number;
  readingOrderValidated: boolean;
  focusOrderValidated: boolean;
}

export interface DesignWarning {
  id: string;
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  nodeId?: string;
}

export interface DesignValidationResult {
  isValid: boolean;
  score: number; // 0-100
  warnings: DesignWarning[];
}

export interface VisualNode {
  id: string;
  componentType: string;
  layoutReference: string;
  bounds: BoundingBox;
  spacing: { sectionSpacing: number; internalSpacing: number; gap: number };
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  borderRadius: string | number;
  border: { width: number; style: string; color: string };
  background: { type: 'solid' | 'gradient' | 'glass'; color: string; gradient?: string; backdropFilter?: string };
  foreground: { color: string; mutedColor?: string };
  typography: TypographyStyle;
  icon: IconPlacement | null;
  illustration: IllustrationPlacement | null;
  shadow: string | null;
  elevation: number;
  animation: AnimationPlanItem | null;
  responsiveRules: any;
  accessibility: NodeAccessibilityMeta;
  designTokens: Record<string, string | number>;
  children: VisualNode[];
  confidence: number;
}

export interface VisualDesignOption {
  id: string; // 'option-a' | 'option-b' | 'option-c'
  name: string;
  description: string;
  designSystem: DesignSystem;
  theme: ThemeMetadata;
  colorTokens: ColorTokens;
  typographyScale: TypographyScale;
  spacingSystem: SpacingSystem;
  rootNode: VisualNode;
  animationPlan: AnimationPlanItem[];
  accessibilitySummary: DesignAccessibilitySummary;
  validation: DesignValidationResult;
}

export interface VisualDesignModel {
  selectedOptionId: string;
  activeOption: VisualDesignOption;
  options: VisualDesignOption[];
  designSystem: DesignSystem;
  theme: ThemeMetadata;
  colorTokens: ColorTokens;
  typographyScale: TypographyScale;
  spacingSystem: SpacingSystem;
  rootNode: VisualNode;
  animationPlan: AnimationPlanItem[];
  accessibilitySummary: DesignAccessibilitySummary;
  validation: DesignValidationResult;
  totalNodeCount: number;
  timestamp: number;
}
