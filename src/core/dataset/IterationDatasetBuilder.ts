import { IterationSample } from './DatasetTypes';
import { sanitizeText } from './DatasetSchema';

export class IterationDatasetBuilder {
  public buildSample(
    beforeDesign: any,
    userRequest: string,
    proposedChange: any,
    afterDesign: any,
    userApproval: boolean = true,
    userModification: any = null,
    recommendations: {
      ai?: any;
      ml?: any;
      knowledge?: any;
    } = {},
    qualityBefore: number = 75,
    qualityAfter: number = 90
  ): IterationSample {
    const sanitizedRequest = sanitizeText(userRequest);

    return {
      beforeDesign: beforeDesign || null,
      userRequest: sanitizedRequest,
      proposedChange: proposedChange || { description: 'Updated design layout according to user prompt' },
      aiRecommendation: recommendations.ai || { action: 'refine_typography_and_spacing', confidence: 0.92 },
      mlRecommendation: recommendations.ml || { model: 'LayoutPredictor', predictedScore: 88 },
      knowledgeRecommendation: recommendations.knowledge || { pattern: 'SaaS Hero Banner Best Practices' },
      userApproval,
      userModification: userModification || null,
      afterDesign: afterDesign || null,
      qualityBefore: Math.max(0, Math.min(100, qualityBefore)),
      qualityAfter: Math.max(0, Math.min(100, qualityAfter))
    };
  }
}
