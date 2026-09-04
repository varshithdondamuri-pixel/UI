import { AIContext, AIValidationResult, ConstraintValidationResult, DesignDecision, DesignDecisionResult, NormalizedAIResponse } from './AITypes';
import { VisualDesignModel } from '../design/DesignTypes';

export class DesignDecisionEngine {
  public produceDecision(
    context: AIContext,
    normalizedResponse: NormalizedAIResponse,
    validation: AIValidationResult,
    constraintValidation: ConstraintValidationResult
  ): DesignDecisionResult {
    const timestamp = Date.now();
    const appliedChanges: string[] = [];

    // 1. Synthesize inputs
    const aiConfidence = normalizedResponse.confidenceScore || 0.9;
    const validationScore = validation.score;
    const combinedConfidence = Number(((aiConfidence + validationScore) / 2).toFixed(2));

    // Determine source
    let source: 'ai' | 'knowledge' | 'ml' | 'fallback' | 'hybrid' = 'ai';
    if (context.knowledgeBundle && context.predictionBundle) {
      source = 'hybrid';
    }

    // Color Token Updates
    if (normalizedResponse.colorPalette) {
      appliedChanges.push(`Applied Primary Color: ${normalizedResponse.colorPalette.primary}`);
      appliedChanges.push(`Applied Background Color: ${normalizedResponse.colorPalette.background}`);
    }

    // Component Updates
    if (normalizedResponse.normalizedComponents.length > 0) {
      appliedChanges.push(`Normalized ${normalizedResponse.normalizedComponents.length} UI components.`);
    }

    // Check if validation passed
    const isApproved = validation.isValid && constraintValidation.passed;

    const decision: DesignDecision = {
      id: `dec_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      source: isApproved ? source : 'fallback',
      appliedChanges: isApproved ? appliedChanges : ['Validation failed; preserved baseline visual layout.'],
      confidence: combinedConfidence,
      rationale: isApproved
        ? `Approved AI design recommendations with ${combinedConfidence * 100}% confidence.`
        : `Rejected direct AI modification due to ${validation.errors.length} validation errors.`
    };

    // Safely update Visual Design Model without directly exposing internal raw mutators
    let updatedVisualModel: VisualDesignModel | null = null;
    if (context.visualDesignModel && isApproved) {
      updatedVisualModel = this.applyDecisionToModel(context.visualDesignModel, normalizedResponse);
    } else {
      updatedVisualModel = context.visualDesignModel;
    }

    return {
      decision,
      updatedVisualModel,
      successful: isApproved
    };
  }

  private applyDecisionToModel(
    existingModel: VisualDesignModel,
    normalized: NormalizedAIResponse
  ): VisualDesignModel {
    // Immutable deep copy of visual design model
    const cloned: VisualDesignModel = JSON.parse(JSON.stringify(existingModel));

    if (normalized.colorPalette) {
      cloned.colorTokens.primary = normalized.colorPalette.primary;
      cloned.colorTokens.secondary = normalized.colorPalette.secondary;
      cloned.colorTokens.background = normalized.colorPalette.background;
      cloned.colorTokens.surface = normalized.colorPalette.surface;
      cloned.colorTokens.text = normalized.colorPalette.text;
      cloned.colorTokens.accent = normalized.colorPalette.accent;

      if (cloned.activeOption) {
        cloned.activeOption.colorTokens = { ...cloned.colorTokens };
      }
    }

    if (normalized.typography) {
      cloned.typographyScale.fontFamilyBody = normalized.typography.bodyFont || normalized.typography.fontFamily;
      cloned.typographyScale.fontFamilyHeadings = normalized.typography.headingFont || normalized.typography.fontFamily;
      if (cloned.activeOption) {
        cloned.activeOption.typographyScale = { ...cloned.typographyScale };
      }
    }

    cloned.timestamp = Date.now();
    return cloned;
  }
}
