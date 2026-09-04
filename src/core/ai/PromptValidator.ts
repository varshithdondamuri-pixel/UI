import { AIPrompt } from './AITypes';

export interface PromptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PromptValidator {
  public validatePrompt(prompt: AIPrompt, maxTokenLimit: number = 32000): PromptValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!prompt.userDirective || prompt.userDirective.trim().length === 0) {
      errors.push('Prompt is missing user directive / goal.');
    }

    if (!prompt.formattedPrompt || prompt.formattedPrompt.trim().length === 0) {
      errors.push('Formatted prompt string is empty.');
    }

    if (prompt.estimatedTokens > maxTokenLimit) {
      errors.push(`Prompt token count (${prompt.estimatedTokens}) exceeds provider limit (${maxTokenLimit}).`);
    } else if (prompt.estimatedTokens > maxTokenLimit * 0.8) {
      warnings.push(`Prompt token count (${prompt.estimatedTokens}) is close to provider limit (${maxTokenLimit}).`);
    }

    if (prompt.sections.length === 0) {
      warnings.push('Prompt has no structured contextual sections.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
