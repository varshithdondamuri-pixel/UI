import { AIContext } from './AITypes';
import { SemanticTree, IntentTree, RecognitionResult } from '../recognition/RecognitionTypes';
import { LayoutBlueprint } from '../planning/BlueprintTypes';
import { VisualDesignModel } from '../design/DesignTypes';
import { KnowledgeBundle } from '../knowledge/KnowledgeTypes';
import { PredictionBundle } from '../ml/MLTypes';

export interface ContextBuilderInput {
  userPrompt?: string;
  recognitionResult?: RecognitionResult | null;
  semanticTree?: SemanticTree | null;
  intentTree?: IntentTree | null;
  blueprint?: LayoutBlueprint | null;
  visualDesignModel?: VisualDesignModel | null;
  knowledgeBundle?: KnowledgeBundle | null;
  predictionBundle?: PredictionBundle | null;
  accessibilityTarget?: 'A' | 'AA' | 'AAA';
  brandColor?: string;
}

export class ContextBuilder {
  public buildContext(input: ContextBuilderInput): AIContext {
    const userPrompt = input.userPrompt || 'Optimize visual hierarchy and component styling for the layout.';

    const shapes = input.recognitionResult?.shapes.map((s) => s.classifiedKind) || [];
    const hasRelationships = (input.recognitionResult?.relationships.length || 0) > 0;
    const nodeCount = input.recognitionResult?.shapes.length || 0;

    return {
      userPrompt,
      sketch: {
        nodeCount,
        shapes,
        hasRelationships
      },
      semanticTree: input.semanticTree || input.recognitionResult?.semanticTree || null,
      intentTree: input.intentTree || input.recognitionResult?.intentTree || null,
      blueprint: input.blueprint || input.recognitionResult?.blueprint || null,
      visualDesignModel: input.visualDesignModel || input.recognitionResult?.visualDesignModel || null,
      knowledgeBundle: input.knowledgeBundle || null,
      predictionBundle: input.predictionBundle || null,
      accessibility: {
        wcagTargetLevel: input.accessibilityTarget || 'AA',
        minTouchSize: 44, // px
        colorContrastRatio: input.accessibilityTarget === 'AAA' ? 7.0 : 4.5
      },
      constraints: {
        responsive: true,
        maxDepth: 6,
        maxComponents: 40,
        brandColor: input.brandColor || '#3B82F6'
      },
      timestamp: Date.now()
    };
  }
}
