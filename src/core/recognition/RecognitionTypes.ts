import { BoundingBox, NodeKind } from '../../types';
import { VisualDesignModel } from '../design/DesignTypes';
import { LayoutBlueprint } from '../planning/BlueprintTypes';

export type ShapeKind = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen_stroke';

export interface RecognizedShape {
  id: string; // Matches CanvasNode uuid
  originalKind: NodeKind;
  classifiedKind: ShapeKind;
  bounds: BoundingBox;
  label: string | null;
  confidence: number; // 0.0 to 1.0
  metadata: Record<string, any>;
}

export interface TextAssociation {
  shapeNodeId: string;
  textNodeId: string;
  textContent: string;
  distance: number;
  confidence: number;
}

export type SpatialRelationshipType =
  | 'contains'
  | 'inside'
  | 'overlaps'
  | 'near'
  | 'connected_by_arrow'
  | 'above'
  | 'below'
  | 'left_of'
  | 'right_of'
  | 'parent'
  | 'child';

export interface SpatialRelationship {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: SpatialRelationshipType;
  confidence: number;
  distance?: number;
  metadata?: Record<string, any>;
}

export type LayoutStructureType =
  | 'single_column'
  | 'two_column'
  | 'three_column'
  | 'grid'
  | 'sidebar_layout'
  | 'header'
  | 'footer'
  | 'centered_layout'
  | 'vertical_stack'
  | 'horizontal_stack';

export interface LayoutStructure {
  id: string;
  type: LayoutStructureType;
  nodeIds: string[];
  bounds: BoundingBox;
  confidence: number;
  metadata?: Record<string, any>;
}

export type SemanticNodeType =
  | 'page'
  | 'navbar'
  | 'hero'
  | 'header'
  | 'button'
  | 'card'
  | 'card_grid'
  | 'heading_section'
  | 'sidebar'
  | 'footer'
  | 'container'
  | 'text_block'
  | 'generic';

export interface SemanticNode {
  id: string;
  type: SemanticNodeType;
  confidence: number; // 0.0 to 1.0
  sourceNodes: string[]; // UUIDs of associated CanvasNodes
  children: SemanticNode[];
  metadata: Record<string, any>;
}

export interface SemanticTree {
  root: SemanticNode;
  timestamp: number;
  analysisDurationMs: number;
  totalNodeCount: number;
}

export type IntentPriority = 'critical' | 'high' | 'medium' | 'low';

export interface IntentCandidate {
  type: string;
  confidence: number;
  reason?: string;
}

export interface IntentNode {
  id: string;
  type: string;
  purpose: string;
  priority: IntentPriority;
  confidence: number;
  possibleVariants: string[];
  candidates: IntentCandidate[];
  children: IntentNode[];
  sourceSemanticNodes: string[];
  metadata: Record<string, any>;
}

export interface IntentTree {
  root: IntentNode;
  timestamp: number;
  totalNodeCount: number;
}

export interface RecognitionResult {
  shapes: RecognizedShape[];
  textAssociations: TextAssociation[];
  relationships: SpatialRelationship[];
  layouts: LayoutStructure[];
  semanticTree: SemanticTree;
  intentTree?: IntentTree;
  blueprint?: LayoutBlueprint;
  visualDesignModel?: VisualDesignModel;
  timestamp: number;
}
