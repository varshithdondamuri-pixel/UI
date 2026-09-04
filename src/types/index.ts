export type NodeKind = 'pen' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface NodeMetadata {
  semanticLabel: string | null;
  userLabel: string | null;
  confidence: number;
  notes: string | null;
}

export interface CanvasNode {
  uuid: string;
  kind: NodeKind;
  position: Point;
  size: Size;
  rotation: number; // degrees
  stroke: string;
  fill: string;
  strokeWidth: number;
  visibility: boolean;
  locked: boolean;
  layerId: string;
  parentId: string | null;
  children: string[];
  zIndex: number;
  createdAt: number;
  updatedAt: number;
  text?: string;
  points?: Point[];
  metadata: NodeMetadata;
}

export type ToolKind = 'select' | 'pen' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text';

export type InteractionMode = 'idle' | 'drawing' | 'dragging' | 'resizing' | 'rotating' | 'panning';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GridSettings {
  visible: boolean;
  snap: boolean;
  size: number;
}

export interface InteractionState {
  mode: InteractionMode;
  activeTool: ToolKind;
  activeHandle: ResizeHandle | null;
  startPoint: Point | null;
  currentPoint: Point | null;
  initialNodeState: Partial<CanvasNode> | null;
}

export interface ICommand {
  type: string;
  execute(): void;
  undo(): void;
}

export enum CoreEvent {
  NODE_CREATED = 'NODE_CREATED',
  NODE_UPDATED = 'NODE_UPDATED',
  NODE_DELETED = 'NODE_DELETED',
  SELECTION_CHANGED = 'SELECTION_CHANGED',
  TOOL_CHANGED = 'TOOL_CHANGED',
  VIEWPORT_CHANGED = 'VIEWPORT_CHANGED',
  HISTORY_CHANGED = 'HISTORY_CHANGED',
  GRID_CHANGED = 'GRID_CHANGED',
  SCENE_CLEARED = 'SCENE_CLEARED',
  RECOGNITION_STARTED = 'RECOGNITION_STARTED',
  RECOGNITION_FINISHED = 'RECOGNITION_FINISHED',
  SEMANTIC_TREE_UPDATED = 'SEMANTIC_TREE_UPDATED',
  RECOGNITION_FAILED = 'RECOGNITION_FAILED',
  INTENT_ANALYSIS_STARTED = 'INTENT_ANALYSIS_STARTED',
  INTENT_TREE_UPDATED = 'INTENT_TREE_UPDATED',
  INTENT_ANALYSIS_FINISHED = 'INTENT_ANALYSIS_FINISHED',
  BLUEPRINT_STARTED = 'BLUEPRINT_STARTED',
  BLUEPRINT_UPDATED = 'BLUEPRINT_UPDATED',
  BLUEPRINT_VALIDATED = 'BLUEPRINT_VALIDATED',
  BLUEPRINT_FINISHED = 'BLUEPRINT_FINISHED',
  BLUEPRINT_VARIANTS_STARTED = 'BLUEPRINT_VARIANTS_STARTED',
  BLUEPRINT_VARIANTS_UPDATED = 'BLUEPRINT_VARIANTS_UPDATED',
  BLUEPRINT_VARIANTS_FINISHED = 'BLUEPRINT_VARIANTS_FINISHED',
  BLUEPRINT_RANKED = 'BLUEPRINT_RANKED',
  VISUAL_DESIGN_STARTED = 'VISUAL_DESIGN_STARTED',
  VISUAL_DESIGN_UPDATED = 'VISUAL_DESIGN_UPDATED',
  VISUAL_DESIGN_VALIDATED = 'VISUAL_DESIGN_VALIDATED',
  VISUAL_DESIGN_FINISHED = 'VISUAL_DESIGN_FINISHED',
  RENDER_STARTED = 'RENDER_STARTED',
  RENDER_UPDATED = 'RENDER_UPDATED',
  RENDER_VALIDATED = 'RENDER_VALIDATED',
  RENDER_FINISHED = 'RENDER_FINISHED',
  KNOWLEDGE_LOADED = 'KNOWLEDGE_LOADED',
  KNOWLEDGE_UPDATED = 'KNOWLEDGE_UPDATED',
  KNOWLEDGE_VALIDATED = 'KNOWLEDGE_VALIDATED',
  KNOWLEDGE_SEARCHED = 'KNOWLEDGE_SEARCHED',
  KNOWLEDGE_RANKED = 'KNOWLEDGE_RANKED',
  KNOWLEDGE_BUNDLE_CREATED = 'KNOWLEDGE_BUNDLE_CREATED',
  MODEL_LOADED = 'MODEL_LOADED',
  PREDICTION_STARTED = 'PREDICTION_STARTED',
  PREDICTION_FINISHED = 'PREDICTION_FINISHED',
  MODEL_UPDATED = 'MODEL_UPDATED',
  DATASET_UPDATED = 'DATASET_UPDATED',
  RANKING_UPDATED = 'RANKING_UPDATED',
  AI_REQUEST_STARTED = 'AI_REQUEST_STARTED',
  AI_REQUEST_FINISHED = 'AI_REQUEST_FINISHED',
  AI_VALIDATION_STARTED = 'AI_VALIDATION_STARTED',
  AI_VALIDATION_FINISHED = 'AI_VALIDATION_FINISHED',
  AI_DECISION_CREATED = 'AI_DECISION_CREATED',
  AI_PROVIDER_CHANGED = 'AI_PROVIDER_CHANGED',
  CODEGEN_STARTED = 'CODEGEN_STARTED',
  CODEGEN_IR_CREATED = 'CODEGEN_IR_CREATED',
  CODEGEN_COMPONENT_CREATED = 'CODEGEN_COMPONENT_CREATED',
  CODEGEN_VALIDATION_STARTED = 'CODEGEN_VALIDATION_STARTED',
  CODEGEN_VALIDATION_FINISHED = 'CODEGEN_VALIDATION_FINISHED',
  CODEGEN_FINISHED = 'CODEGEN_FINISHED',
  CODEGEN_FAILED = 'CODEGEN_FAILED',
  LEARNING_SESSION_STARTED = 'LEARNING_SESSION_STARTED',
  FEEDBACK_RECEIVED = 'FEEDBACK_RECEIVED',
  DESIGN_CHANGE_RECORDED = 'DESIGN_CHANGE_RECORDED',
  DESIGN_SELECTED = 'DESIGN_SELECTED',
  DESIGN_REJECTED = 'DESIGN_REJECTED',
  EVALUATION_STARTED = 'EVALUATION_STARTED',
  EVALUATION_FINISHED = 'EVALUATION_FINISHED',
  LEARNING_SAMPLE_CREATED = 'LEARNING_SAMPLE_CREATED',
  LEARNING_SAMPLE_VALIDATED = 'LEARNING_SAMPLE_VALIDATED',
  LEARNING_SAMPLE_APPROVED = 'LEARNING_SAMPLE_APPROVED',
  LEARNING_SAMPLE_REJECTED = 'LEARNING_SAMPLE_REJECTED',
  DATASET_EXPORTED = 'DATASET_EXPORTED',
  AGENT_SESSION_STARTED = 'AGENT_SESSION_STARTED',
  AGENT_INTENT_DETECTED = 'AGENT_INTENT_DETECTED',
  AGENT_PLAN_CREATED = 'AGENT_PLAN_CREATED',
  AGENT_CONTEXT_BUILT = 'AGENT_CONTEXT_BUILT',
  AGENT_KNOWLEDGE_RETRIEVED = 'AGENT_KNOWLEDGE_RETRIEVED',
  AGENT_PREDICTION_RECEIVED = 'AGENT_PREDICTION_RECEIVED',
  AGENT_AI_REQUESTED = 'AGENT_AI_REQUESTED',
  AGENT_DESIGN_PROPOSED = 'AGENT_DESIGN_PROPOSED',
  AGENT_ALTERNATIVES_CREATED = 'AGENT_ALTERNATIVES_CREATED',
  AGENT_VALIDATION_STARTED = 'AGENT_VALIDATION_STARTED',
  AGENT_VALIDATION_FINISHED = 'AGENT_VALIDATION_FINISHED',
  AGENT_APPROVAL_REQUIRED = 'AGENT_APPROVAL_REQUIRED',
  AGENT_CHANGE_APPROVED = 'AGENT_CHANGE_APPROVED',
  AGENT_CHANGE_REJECTED = 'AGENT_CHANGE_REJECTED',
  AGENT_CHANGE_APPLIED = 'AGENT_CHANGE_APPLIED',
  AGENT_ITERATION_STARTED = 'AGENT_ITERATION_STARTED',
  AGENT_ITERATION_FINISHED = 'AGENT_ITERATION_FINISHED',
  AGENT_CODE_REQUESTED = 'AGENT_CODE_REQUESTED',
  AGENT_SESSION_FINISHED = 'AGENT_SESSION_FINISHED',
  AGENT_FAILED = 'AGENT_FAILED'
}

export interface CoreEventPayloads {
  [CoreEvent.NODE_CREATED]: { node: CanvasNode };
  [CoreEvent.NODE_UPDATED]: { node: CanvasNode };
  [CoreEvent.NODE_DELETED]: { uuid: string };
  [CoreEvent.SELECTION_CHANGED]: { selectedUuid: string | null };
  [CoreEvent.TOOL_CHANGED]: { tool: ToolKind };
  [CoreEvent.VIEWPORT_CHANGED]: { viewport: Viewport };
  [CoreEvent.HISTORY_CHANGED]: { canUndo: boolean; canRedo: boolean };
  [CoreEvent.GRID_CHANGED]: { grid: GridSettings };
  [CoreEvent.SCENE_CLEARED]: void;
  [CoreEvent.RECOGNITION_STARTED]: { timestamp: number };
  [CoreEvent.RECOGNITION_FINISHED]: { result: any };
  [CoreEvent.SEMANTIC_TREE_UPDATED]: { tree: any };
  [CoreEvent.RECOGNITION_FAILED]: { error: string };
  [CoreEvent.INTENT_ANALYSIS_STARTED]: { timestamp: number };
  [CoreEvent.INTENT_TREE_UPDATED]: { tree: any };
  [CoreEvent.INTENT_ANALYSIS_FINISHED]: { tree: any };
  [CoreEvent.BLUEPRINT_STARTED]: { timestamp: number };
  [CoreEvent.BLUEPRINT_UPDATED]: { blueprint: any };
  [CoreEvent.BLUEPRINT_VALIDATED]: { validation: any; blueprint: any };
  [CoreEvent.BLUEPRINT_FINISHED]: { blueprint: any; timestamp: number };
  [CoreEvent.BLUEPRINT_VARIANTS_STARTED]: { timestamp: number };
  [CoreEvent.BLUEPRINT_VARIANTS_UPDATED]: { variants: any[] };
  [CoreEvent.BLUEPRINT_VARIANTS_FINISHED]: { variants: any[]; matrix: any };
  [CoreEvent.BLUEPRINT_RANKED]: { rankedVariants: any[]; activeVariantId: string };
  [CoreEvent.VISUAL_DESIGN_STARTED]: { timestamp: number };
  [CoreEvent.VISUAL_DESIGN_UPDATED]: { model: any };
  [CoreEvent.VISUAL_DESIGN_VALIDATED]: { validation: any; model: any };
  [CoreEvent.VISUAL_DESIGN_FINISHED]: { model: any; timestamp: number };
  [CoreEvent.RENDER_STARTED]: { timestamp: number };
  [CoreEvent.RENDER_UPDATED]: { tree: any };
  [CoreEvent.RENDER_VALIDATED]: { validation: any };
  [CoreEvent.RENDER_FINISHED]: { tree: any; metrics: any; timestamp: number };
  [CoreEvent.KNOWLEDGE_LOADED]: { totalRecords: number; timestamp: number };
  [CoreEvent.KNOWLEDGE_UPDATED]: { recordId: string; record: any };
  [CoreEvent.KNOWLEDGE_VALIDATED]: { validation: any };
  [CoreEvent.KNOWLEDGE_SEARCHED]: { query: any; resultsCount: number };
  [CoreEvent.KNOWLEDGE_RANKED]: { query: any; rankedResults: any[] };
  [CoreEvent.KNOWLEDGE_BUNDLE_CREATED]: { bundle: any; timestamp: number };
  [CoreEvent.MODEL_LOADED]: { modelId: string; timestamp: number };
  [CoreEvent.PREDICTION_STARTED]: { timestamp: number };
  [CoreEvent.PREDICTION_FINISHED]: { bundle: any; timestamp: number };
  [CoreEvent.MODEL_UPDATED]: { modelId: string; status: string };
  [CoreEvent.DATASET_UPDATED]: { datasetId: string; totalEntries: number };
  [CoreEvent.RANKING_UPDATED]: { rankings: any[] };
  [CoreEvent.AI_REQUEST_STARTED]: { requestId: string; providerId: string; timestamp: number };
  [CoreEvent.AI_REQUEST_FINISHED]: { requestId: string; response: any; timestamp: number };
  [CoreEvent.AI_VALIDATION_STARTED]: { requestId: string; timestamp: number };
  [CoreEvent.AI_VALIDATION_FINISHED]: { requestId: string; validation: any; timestamp: number };
  [CoreEvent.AI_DECISION_CREATED]: { decision: any; timestamp: number };
  [CoreEvent.AI_PROVIDER_CHANGED]: { providerId: string; providerName: string };
  [CoreEvent.CODEGEN_STARTED]: { targetId: string; timestamp: number };
  [CoreEvent.CODEGEN_IR_CREATED]: { irTree: any; totalNodes: number; timestamp: number };
  [CoreEvent.CODEGEN_COMPONENT_CREATED]: { componentName: string; filePath: string };
  [CoreEvent.CODEGEN_VALIDATION_STARTED]: { timestamp: number };
  [CoreEvent.CODEGEN_VALIDATION_FINISHED]: { validation: any; timestamp: number };
  [CoreEvent.CODEGEN_FINISHED]: { project: any; executionTimeMs: number; timestamp: number };
  [CoreEvent.CODEGEN_FAILED]: { error: string; timestamp: number };
  [CoreEvent.LEARNING_SESSION_STARTED]: { sessionId: string; timestamp: number };
  [CoreEvent.FEEDBACK_RECEIVED]: { feedbackId: string; feedback: any; timestamp: number };
  [CoreEvent.DESIGN_CHANGE_RECORDED]: { changeId: string; change: any; timestamp: number };
  [CoreEvent.DESIGN_SELECTED]: { designId: string; selection: any; timestamp: number };
  [CoreEvent.DESIGN_REJECTED]: { designId: string; reason: string; timestamp: number };
  [CoreEvent.EVALUATION_STARTED]: { designId: string; timestamp: number };
  [CoreEvent.EVALUATION_FINISHED]: { designId: string; evaluation: any; timestamp: number };
  [CoreEvent.LEARNING_SAMPLE_CREATED]: { sampleId: string; sample: any; timestamp: number };
  [CoreEvent.LEARNING_SAMPLE_VALIDATED]: { sampleId: string; eligibility: string; timestamp: number };
  [CoreEvent.LEARNING_SAMPLE_APPROVED]: { sampleId: string; timestamp: number };
  [CoreEvent.LEARNING_SAMPLE_REJECTED]: { sampleId: string; reason: string; timestamp: number };
  [CoreEvent.DATASET_EXPORTED]: { datasetId: string; version: string; format: string; count: number; timestamp: number };
  [CoreEvent.AGENT_SESSION_STARTED]: { sessionId: string; timestamp: number };
  [CoreEvent.AGENT_INTENT_DETECTED]: { intent: any; timestamp: number };
  [CoreEvent.AGENT_PLAN_CREATED]: { plan: any; timestamp: number };
  [CoreEvent.AGENT_CONTEXT_BUILT]: { context: any; timestamp: number };
  [CoreEvent.AGENT_KNOWLEDGE_RETRIEVED]: { bundle: any; timestamp: number };
  [CoreEvent.AGENT_PREDICTION_RECEIVED]: { bundle: any; timestamp: number };
  [CoreEvent.AGENT_AI_REQUESTED]: { request: any; timestamp: number };
  [CoreEvent.AGENT_DESIGN_PROPOSED]: { proposal: any; timestamp: number };
  [CoreEvent.AGENT_ALTERNATIVES_CREATED]: { alternatives: any[]; timestamp: number };
  [CoreEvent.AGENT_VALIDATION_STARTED]: { proposalId: string; timestamp: number };
  [CoreEvent.AGENT_VALIDATION_FINISHED]: { validation: any; timestamp: number };
  [CoreEvent.AGENT_APPROVAL_REQUIRED]: { proposal: any; timestamp: number };
  [CoreEvent.AGENT_CHANGE_APPROVED]: { changeId: string; timestamp: number };
  [CoreEvent.AGENT_CHANGE_REJECTED]: { changeId: string; reason: string; timestamp: number };
  [CoreEvent.AGENT_CHANGE_APPLIED]: { changeId: string; timestamp: number };
  [CoreEvent.AGENT_ITERATION_STARTED]: { iterationNumber: number; timestamp: number };
  [CoreEvent.AGENT_ITERATION_FINISHED]: { iterationNumber: number; timestamp: number };
  [CoreEvent.AGENT_CODE_REQUESTED]: { targetId: string; timestamp: number };
  [CoreEvent.AGENT_SESSION_FINISHED]: { sessionId: string; timestamp: number };
  [CoreEvent.AGENT_FAILED]: { error: string; timestamp: number };
}
