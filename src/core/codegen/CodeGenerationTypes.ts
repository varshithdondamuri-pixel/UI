import { VisualNode } from '../design/DesignTypes';
import { BoundingBox } from '../../types';

export type TargetLanguage = 'typescript' | 'javascript' | 'dart' | 'swift' | 'html';
export type TargetFramework = 'react' | 'nextjs' | 'vue' | 'svelte' | 'flutter' | 'swiftui' | 'vanilla';
export type TargetStylingSystem = 'tailwind' | 'css-modules' | 'vanilla-css' | 'styled-components';

export interface CodeGenTargetConfig {
  id: string;
  name: string;
  language: TargetLanguage;
  framework: TargetFramework;
  stylingSystem: TargetStylingSystem;
  componentModel: 'functional' | 'class';
  routingModel: 'app-router' | 'pages-router' | 'flat';
  assetModel: 'public-folder' | 'import';
  useTypeScript: boolean;
}

export interface IRComponentProp {
  name: string;
  type: string;
  value: any;
  isOptional?: boolean;
}

export interface IRNode {
  id: string;
  componentType: string;
  name: string;
  props: Record<string, any>;
  children: IRNode[];
  layout: {
    bounds: BoundingBox;
    direction: 'vertical' | 'horizontal' | 'grid';
    gap: number;
    padding: { top: number; right: number; bottom: number; left: number };
  };
  styles: Record<string, string>;
  tailwindClasses: string[];
  tokens: Record<string, string>;
  responsiveRules: {
    mobile?: Record<string, string>;
    tablet?: Record<string, string>;
    desktop?: Record<string, string>;
  };
  accessibility: {
    ariaRole: string;
    ariaLabel?: string;
    semanticTag: string;
    tabIndex?: number;
  };
  sourceVisualNode?: VisualNode;
}

export interface IRTree {
  id: string;
  root: IRNode;
  totalNodeCount: number;
  componentTypes: string[];
  timestamp: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  type: 'component' | 'page' | 'style' | 'token' | 'config' | 'type' | 'asset' | 'util';
}

export interface CodeGenValidationIssue {
  id: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  filePath?: string;
}

export interface CodeGenValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  issues: CodeGenValidationIssue[];
  typeScriptErrors: number;
  missingImports: number;
  accessibilityIssues: number;
}

export interface CodeGenStats {
  generationTimeMs: number;
  totalFiles: number;
  totalLinesOfCode: number;
  totalComponents: number;
  totalTokensGenerated: number;
  validationScore: number;
  targetId: string;
}

export interface CodeGenProjectResult {
  id: string;
  target: CodeGenTargetConfig;
  irTree: IRTree;
  files: GeneratedFile[];
  validation: CodeGenValidationResult;
  stats: CodeGenStats;
  timestamp: number;
}
