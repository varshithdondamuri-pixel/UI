import { UserFeedbackData } from './FeedbackTypes';

export type LearningCategory =
  | 'Layout'
  | 'Components'
  | 'Typography'
  | 'Colors'
  | 'Spacing'
  | 'Responsive'
  | 'Accessibility'
  | 'UX'
  | 'Animation'
  | 'Industry'
  | 'Design Style'
  | 'AI Recommendations'
  | 'Code Generation'
  | 'Overall Design Quality';

export type LearningEligibility = 'eligible' | 'not_eligible' | 'needs_review';

export type SampleStatus = 'candidate' | 'needs_review' | 'approved' | 'rejected' | 'deprecated';

export interface LearningSession {
  sessionId: string;
  userSessionId: string;
  startTime: number;
  endTime?: number;
  designIds: string[];
  activePrompt?: string;
  interactionCount: number;
}

export interface DesignEvaluationResult {
  evaluationId: string;
  designId: string;
  timestamp: number;
  quality: {
    visualHierarchy: number;
    spacingConsistency: number;
    typographyConsistency: number;
    componentConsistency: number;
    layoutBalance: number;
    designSystemConsistency: number;
    overallVisualQuality: number;
  };
  ux: {
    navigation: number;
    informationHierarchy: number;
    ctaPlacement: number;
    interactionClarity: number;
    contentDensity: number;
    taskFlow: number;
    responsiveBehavior: number;
    overallUXScore: number;
  };
  accessibility: {
    contrast: number;
    touchTargets: number;
    keyboardNavigation: number;
    focusOrder: number;
    semanticStructure: number;
    aria: number;
    readingOrder: number;
    wcagComplianceScore: number;
  };
  visual: {
    alignment: number;
    whitespace: number;
    balance: number;
    proportion: number;
    hierarchy: number;
    consistency: number;
    responsiveComposition: number;
    overallVisualScore: number;
  };
  code: {
    buildSuccess: boolean;
    typeSafetyScore: number;
    componentReuseScore: number;
    accessibilityScore: number;
    responsiveBehaviorScore: number;
    tokenUsageScore: number;
    visualConsistencyScore: number;
    overallCodeScore: number;
  };
  overallScore: number;
}

export interface SampleQualityScore {
  feedbackQuality: number;
  designQuality: number;
  evaluationConfidence: number;
  userConfirmation: number;
  completeness: number;
  consistency: number;
  totalScore: number; // 0 - 100
}

export interface LearningSample {
  sampleId: string;
  prompt: string;
  sketchReference: any;
  semanticTreeReference: any;
  intentTreeReference: any;
  blueprintReference: any;
  visualDesignReference: any;
  knowledgeBundleReference: any;
  predictionBundleReference: any;
  aiDecisionReference: any;
  renderReference: any;
  codeReference: any;
  userSelections: any;
  userChanges: any[];
  feedback: UserFeedbackData;
  evaluation: DesignEvaluationResult;
  qualityScore: SampleQualityScore;
  learningEligibility: LearningEligibility;
  eligibilityReasons: string[];
  datasetVersion: string;
  createdAt: number;
  status: SampleStatus;
  categories: LearningCategory[];
  modelId?: string;
  industry?: string;
  designStyle?: string;
}

export interface DatasetVersion {
  datasetId: string;
  version: string;
  sampleCount: number;
  approvedSampleCount: number;
  categories: Record<LearningCategory, number>;
  creationDate: number;
  sourceRange: {
    startTime: number;
    endTime: number;
  };
  qualityThreshold: number;
}

export interface LearningDatasetQuery {
  category?: LearningCategory;
  modelId?: string;
  industry?: string;
  designStyle?: string;
  qualityThreshold?: number;
  datasetVersion?: string;
  limit?: number;
  offset?: number;
}

export interface LearningDatasetProvider {
  getApprovedSamples(query?: LearningDatasetQuery): LearningSample[];
  getSamplesByCategory(category: LearningCategory): LearningSample[];
  getSamplesByModel(modelId: string): LearningSample[];
  getSamplesByIndustry(industry: string): LearningSample[];
  getSamplesByDesignStyle(style: string): LearningSample[];
  getSamplesByQualityThreshold(threshold: number): LearningSample[];
  getSamplesByDatasetVersion(version: string): LearningSample[];
}
