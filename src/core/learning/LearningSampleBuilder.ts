import { DesignEvaluationResult, LearningCategory, LearningEligibility, LearningSample, SampleQualityScore, SampleStatus } from './LearningTypes';
import { UserFeedbackData } from './FeedbackTypes';

export interface BuildSampleParams {
  prompt?: string;
  sketch?: any;
  semanticTree?: any;
  intentTree?: any;
  blueprint?: any;
  visualDesignModel?: any;
  knowledgeBundle?: any;
  predictionBundle?: any;
  aiDecision?: any;
  renderTree?: any;
  codeResult?: any;
  userSelections?: any;
  userChanges?: any[];
  feedback: UserFeedbackData;
  evaluation: DesignEvaluationResult;
  qualityScore: SampleQualityScore;
  learningEligibility: LearningEligibility;
  eligibilityReasons: string[];
  datasetVersion?: string;
  modelId?: string;
  industry?: string;
  designStyle?: string;
}

export class LearningSampleBuilder {
  public buildSample(params: BuildSampleParams): LearningSample {
    const sampleId = 'sample_' + Math.random().toString(36).substring(2, 10);
    const createdAt = Date.now();

    const categories: LearningCategory[] = this.deriveCategories(params);

    const status: SampleStatus =
      params.learningEligibility === 'eligible'
        ? 'candidate'
        : params.learningEligibility === 'needs_review'
        ? 'needs_review'
        : 'rejected';

    return {
      sampleId,
      prompt: params.prompt || 'Generated canvas design sketch',
      sketchReference: params.sketch ? { shapeCount: params.sketch.shapes?.length || 0 } : null,
      semanticTreeReference: params.semanticTree ? { nodeCount: params.semanticTree.nodes?.length || 0 } : null,
      intentTreeReference: params.intentTree ? { archetype: params.intentTree.archetype } : null,
      blueprintReference: params.blueprint ? { layoutGrid: params.blueprint.layoutGrid } : null,
      visualDesignReference: params.visualDesignModel ? { theme: params.visualDesignModel.theme?.name } : null,
      knowledgeBundleReference: params.knowledgeBundle ? { count: params.knowledgeBundle.records?.length || 0 } : null,
      predictionBundleReference: params.predictionBundle ? { modelCount: params.predictionBundle.predictions?.length || 0 } : null,
      aiDecisionReference: params.aiDecision ? { provider: params.aiDecision.providerId } : null,
      renderReference: params.renderTree ? { mode: params.renderTree.viewportMode } : null,
      codeReference: params.codeResult ? { filesCount: params.codeResult.files?.length || 0 } : null,
      userSelections: params.userSelections || {},
      userChanges: params.userChanges || [],
      feedback: params.feedback,
      evaluation: params.evaluation,
      qualityScore: params.qualityScore,
      learningEligibility: params.learningEligibility,
      eligibilityReasons: params.eligibilityReasons,
      datasetVersion: params.datasetVersion || 'v1.0.0',
      createdAt,
      status,
      categories,
      modelId: params.modelId,
      industry: params.industry || 'General UI',
      designStyle: params.designStyle || 'Modern Minimalist'
    };
  }

  private deriveCategories(params: BuildSampleParams): LearningCategory[] {
    const cats = new Set<LearningCategory>(['Overall Design Quality']);

    if (params.blueprint) cats.add('Layout');
    if (params.visualDesignModel) {
      cats.add('Components');
      cats.add('Colors');
      cats.add('Typography');
      cats.add('Spacing');
      cats.add('Design Style');
    }
    if (params.evaluation?.accessibility) cats.add('Accessibility');
    if (params.evaluation?.ux) cats.add('UX');
    if (params.renderTree) cats.add('Responsive');
    if (params.codeResult) cats.add('Code Generation');
    if (params.aiDecision) cats.add('AI Recommendations');

    return Array.from(cats);
  }
}
