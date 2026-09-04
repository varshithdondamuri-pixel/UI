export type FeedbackKind =
  | 'Rating'
  | 'Like'
  | 'Dislike'
  | 'Accept'
  | 'Reject'
  | 'Comment'
  | 'Reason'
  | 'Suggested Change'
  | 'Design Preference';

export type ChangeReason =
  | 'Visual Preference'
  | 'UX Improvement'
  | 'Brand Requirement'
  | 'Accessibility'
  | 'Responsive Requirement'
  | 'Content Requirement'
  | 'Performance'
  | 'Bug Fix'
  | 'AI Suggestion'
  | 'Other';

export type AISuggestionOutcome = 'Accepted' | 'Modified' | 'Partially Accepted' | 'Rejected' | 'Ignored';
export type MLPredictionOutcome = 'Accepted' | 'Modified' | 'Rejected' | 'Ignored';
export type KnowledgeUsefulnessOutcome = 'Useful' | 'Not Useful' | 'Partially Useful' | 'Rejected';

export interface RatingFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  timestamp: number;
  designId: string;
  optionId?: string;
  userSessionId: string;
}

export interface ExplicitFeedbackItem {
  id: string;
  kind: FeedbackKind;
  value: any;
  comment?: string;
  reason?: ChangeReason;
  timestamp: number;
  designId: string;
  targetElementId?: string;
  userSessionId: string;
}

export interface NormalizedFeedback {
  id: string;
  category: 'layout' | 'components' | 'typography' | 'colors' | 'spacing' | 'responsive' | 'accessibility' | 'ux' | 'other';
  target: string;
  action: 'resize' | 'reorder' | 'add' | 'remove' | 'recolor' | 'restyle' | 'change' | 'none';
  direction?: 'increase' | 'decrease' | 'left' | 'right' | 'up' | 'down' | 'custom';
  source: 'user' | 'system';
  rawText?: string;
  confidence: number;
}

export interface AIFeedbackRecord {
  requestId: string;
  providerId: string;
  recommendationId?: string;
  outcome: AISuggestionOutcome;
  userModificationDetails?: string;
  timestamp: number;
}

export interface MLFeedbackRecord {
  modelId: string;
  modelVersion: string;
  prediction: any;
  confidence: number;
  userOutcome: MLPredictionOutcome;
  timestamp: number;
}

export interface KnowledgeFeedbackRecord {
  bundleId: string;
  recordId: string;
  outcome: KnowledgeUsefulnessOutcome;
  timestamp: number;
}

export interface DesignVariantComparison {
  comparisonId: string;
  variants: {
    variantAId: string;
    variantBId?: string;
    variantCId?: string;
  };
  selectedVariantId: string;
  rejectedVariantIds: string[];
  selectionReason?: ChangeReason | string;
  timestamp: number;
}

export interface UserFeedbackData {
  ratings: RatingFeedback[];
  explicitItems: ExplicitFeedbackItem[];
  normalizedItems: NormalizedFeedback[];
  aiFeedback: AIFeedbackRecord[];
  mlFeedback: MLFeedbackRecord[];
  knowledgeFeedback: KnowledgeFeedbackRecord[];
  variantComparisons: DesignVariantComparison[];
  lastUpdated: number;
}
