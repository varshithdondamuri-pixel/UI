import { AgentIntentType } from './AgentTypes';

export interface StructuredAgentIntent {
  type: AgentIntentType;
  confidence: number;
  extractedParameters: {
    targetElement?: string;
    styleDirective?: string;
    colorDirective?: string;
    variantCount?: number;
    viewportTarget?: string;
    rawPrompt?: string;
  };
}

export class AgentIntentClassifier {
  public classify(prompt?: string, hasSketch?: boolean, selectedNodeId?: string): StructuredAgentIntent {
    if (!prompt || prompt.trim() === '') {
      if (hasSketch) {
        return {
          type: 'UNDERSTAND_SKETCH',
          confidence: 0.95,
          extractedParameters: {}
        };
      }
      return {
        type: 'ASK_QUESTION',
        confidence: 0.5,
        extractedParameters: {}
      };
    }

    const text = prompt.toLowerCase();

    if (text.includes('code') || text.includes('export code') || text.includes('generate website') || text.includes('build app')) {
      return { type: 'GENERATE_CODE', confidence: 0.95, extractedParameters: { rawPrompt: prompt } };
    }

    if (text.includes('alternative') || text.includes('variant') || text.includes('versions') || text.includes('option')) {
      const match = text.match(/(\d+)/);
      const count = match ? parseInt(match[1], 10) : 3;
      return { type: 'GENERATE_VARIANTS', confidence: 0.9, extractedParameters: { variantCount: count, rawPrompt: prompt } };
    }

    if (text.includes('compare')) {
      return { type: 'COMPARE_VARIANTS', confidence: 0.9, extractedParameters: { rawPrompt: prompt } };
    }

    if (text.includes('undo')) {
      return { type: 'UNDO_AGENT_CHANGE', confidence: 0.95, extractedParameters: {} };
    }

    if (text.includes('mobile') || text.includes('responsive') || text.includes('tablet') || text.includes('screen size')) {
      return { type: 'CHANGE_RESPONSIVE', confidence: 0.9, extractedParameters: { rawPrompt: prompt } };
    }

    if (text.includes('dark') || text.includes('color') || text.includes('theme') || text.includes('background') || text.includes('palette')) {
      return { type: 'CHANGE_COLOR', confidence: 0.9, extractedParameters: { colorDirective: prompt, rawPrompt: prompt } };
    }

    if (text.includes('font') || text.includes('typography') || text.includes('heading') || text.includes('text size')) {
      return { type: 'CHANGE_TYPOGRAPHY', confidence: 0.9, extractedParameters: { rawPrompt: prompt } };
    }

    if (text.includes('spacing') || text.includes('compact') || text.includes('padding') || text.includes('margin') || text.includes('gap')) {
      return { type: 'CHANGE_SPACING', confidence: 0.9, extractedParameters: { rawPrompt: prompt } };
    }

    if (text.includes('accessibility') || text.includes('contrast') || text.includes('wcag') || text.includes('aria')) {
      return { type: 'CHANGE_ACCESSIBILITY', confidence: 0.9, extractedParameters: { rawPrompt: prompt } };
    }

    if (text.includes('hero') || text.includes('layout') || text.includes('reorder') || text.includes('grid') || text.includes('navigation')) {
      return { type: 'CHANGE_LAYOUT', confidence: 0.9, extractedParameters: { targetElement: selectedNodeId || 'layout', rawPrompt: prompt } };
    }

    if (text.includes('saas') || text.includes('modern') || text.includes('style') || text.includes('clean') || text.includes('minimal') || text.includes('glass')) {
      return { type: 'CHANGE_STYLE', confidence: 0.85, extractedParameters: { styleDirective: prompt, rawPrompt: prompt } };
    }

    if (text.includes('card') || text.includes('button') || text.includes('input') || text.includes('component')) {
      return { type: 'CHANGE_COMPONENT', confidence: 0.85, extractedParameters: { targetElement: selectedNodeId || 'component', rawPrompt: prompt } };
    }

    if (text.includes('turn this') || text.includes('sketch into') || text.includes('landing page') || text.includes('create')) {
      return { type: 'CREATE_DESIGN', confidence: 0.9, extractedParameters: { rawPrompt: prompt } };
    }

    return { type: 'IMPROVE_DESIGN', confidence: 0.8, extractedParameters: { rawPrompt: prompt } };
  }
}
