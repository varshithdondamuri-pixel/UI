import { SemanticTree, IntentTree } from '../recognition/RecognitionTypes';
import { LayoutBlueprint } from '../planning/BlueprintTypes';
import { VisualDesignModel, VisualDesignOption } from '../design/DesignTypes';
import { KnowledgeBundle } from '../knowledge/KnowledgeTypes';
import { PredictionBundle } from '../ml/MLTypes';
import { AIProvider } from './AIProvider';

export type { AIProvider };
export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'local' | 'mock';

export interface AIProviderCapabilities {
  supportsMultimodal: boolean;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  supportsJsonOutput: boolean;
  maxTokenLimit: number;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  apiKey?: string;
  endpoint?: string;
  modelName: string;
  capabilities: AIProviderCapabilities;
}

export interface AIContext {
  userPrompt: string;
  sketch: {
    nodeCount: number;
    shapes: string[];
    hasRelationships: boolean;
  };
  semanticTree: SemanticTree | null;
  intentTree: IntentTree | null;
  blueprint: LayoutBlueprint | null;
  visualDesignModel: VisualDesignModel | null;
  knowledgeBundle: KnowledgeBundle | null;
  predictionBundle: PredictionBundle | null;
  accessibility: {
    wcagTargetLevel: 'A' | 'AA' | 'AAA';
    minTouchSize: number;
    colorContrastRatio: number;
  };
  constraints: {
    responsive: boolean;
    maxDepth: number;
    maxComponents: number;
    brandColor?: string;
  };
  timestamp: number;
}

export interface AIPromptSection {
  title: string;
  content: string;
  priority: number;
}

export interface AIPrompt {
  systemDirective: string;
  userDirective: string;
  sections: AIPromptSection[];
  formattedPrompt: string;
  estimatedTokens: number;
  compressed: boolean;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  timeoutMs?: number;
  retryAttempts?: number;
}

export interface AIProviderResponse {
  requestId: string;
  providerId: string;
  rawResponse: string;
  parsedResponse?: any;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  timestamp: number;
  status: 'success' | 'error' | 'fallback';
  errorMessage?: string;
}

export type ReasoningStageId = 'context_analysis' | 'planning' | 'creative_suggestions' | 'validation' | 'final_recommendation';

export interface ReasoningStage {
  id: ReasoningStageId;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  details?: Record<string, any>;
  executionTimeMs?: number;
}

export interface ReasoningPipelineResult {
  stages: ReasoningStage[];
  totalExecutionTimeMs: number;
  summary: string;
}

export interface ParsedAIResponse {
  suggestedLayoutVariantId?: string;
  colorPalette?: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography?: {
    fontFamily: string;
    headingFont?: string;
    bodyFont?: string;
  };
  suggestedComponents?: Array<{
    type: string;
    label: string;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }>;
  reasoningText: string;
  confidenceScore: number;
  rawJson?: any;
}

export interface NormalizedAIResponse extends ParsedAIResponse {
  normalizedComponents: Array<{
    type: string;
    label: string;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
  normalizedColors: Record<string, string>;
  normalizedSpacing: number;
}

export interface ComponentValidationDetail {
  componentType: string;
  isValid: boolean;
  isHallucinated: boolean;
  reason?: string;
}

export interface AIValidationResult {
  isValid: boolean;
  score: number;
  blueprintConsistent: boolean;
  accessibilityValid: boolean;
  layoutValid: boolean;
  componentValidations: ComponentValidationDetail[];
  hallucinatedCount: number;
  errors: string[];
  warnings: string[];
}

export interface ConstraintValidationResult {
  passed: boolean;
  violations: Array<{
    rule: string;
    severity: 'error' | 'warning';
    message: string;
  }>;
}

export interface DesignDecision {
  id: string;
  timestamp: number;
  source: 'ai' | 'knowledge' | 'ml' | 'fallback' | 'hybrid';
  appliedChanges: string[];
  visualOptionOverride?: Partial<VisualDesignOption>;
  confidence: number;
  rationale: string;
}

export interface DesignDecisionResult {
  decision: DesignDecision;
  updatedVisualModel: VisualDesignModel | null;
  successful: boolean;
}

export interface AIStats {
  promptCount: number;
  latencyMsTotal: number;
  averageLatencyMs: number;
  providerUsage: Record<string, number>;
  validationFailures: number;
  retryCount: number;
  fallbackCount: number;
  totalTokens: number;
  averageTokens: number;
  averageContextSize: number;
}

export interface ConversationTurn {
  id: string;
  timestamp: number;
  userPrompt: string;
  contextSummary: string;
  aiPromptPreview: string;
  providerResponse: AIProviderResponse;
  decision?: DesignDecision;
}

export interface AIOrchestrationResult {
  requestId: string;
  providerId: string;
  context: AIContext;
  prompt: AIPrompt;
  response: AIProviderResponse;
  reasoning: ReasoningPipelineResult;
  parsedResponse: ParsedAIResponse;
  normalizedResponse: NormalizedAIResponse;
  validation: AIValidationResult;
  constraintValidation: ConstraintValidationResult;
  decisionResult: DesignDecisionResult;
  usedFallback: boolean;
  executionTimeMs: number;
}
