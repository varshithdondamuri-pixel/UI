import { ColorTokens, TypographyStyle } from '../design/DesignTypes';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface Transform2D {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface StyleReference {
  colorTokens: ColorTokens;
  borderRadius: string | number;
  border: { width: number; style: string; color: string };
  background: { type: 'solid' | 'gradient' | 'glass'; color: string; gradient?: string; backdropFilter?: string };
  foreground: { color: string; mutedColor?: string };
  shadow: string | null;
  elevation: number;
  designTokens: Record<string, string | number>;
}

export interface TextReference {
  content?: string;
  typography: TypographyStyle;
}

export interface IconReference {
  icon: any;
}

export interface IllustrationReference {
  illustration: any;
}

export interface AnimationReference {
  animation: any;
}

export interface RenderValidationWarning {
  id: string;
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  nodeId?: string;
}

export interface RenderValidationResult {
  isValid: boolean;
  warnings: RenderValidationWarning[];
}

export interface RenderPerformanceMetrics {
  renderTimeMs: number;
  fps: number;
  visibleNodeCount: number;
  totalNodeCount: number;
}
