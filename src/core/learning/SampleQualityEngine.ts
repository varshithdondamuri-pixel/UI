import { DesignEvaluationResult, LearningEligibility, SampleQualityScore } from './LearningTypes';
import { UserFeedbackData } from './FeedbackTypes';

export interface SampleQualityAssessment {
  qualityScore: SampleQualityScore;
  eligibility: LearningEligibility;
  reasons: string[];
  isDuplicate: boolean;
}

export class SampleQualityEngine {
  private existingSampleHashes: Set<string> = new Set();

  public assessSample(
    prompt: string,
    model: any,
    feedback: UserFeedbackData,
    evaluation: DesignEvaluationResult,
    _userChanges: any[]
  ): SampleQualityAssessment {
    const reasons: string[] = [];

    // 1. Calculate component quality scores
    const feedbackQuality = this.calculateFeedbackQuality(feedback);
    const designQuality = Math.min(100, Math.max(0, evaluation.overallScore));
    const evaluationConfidence = 90;
    const userConfirmation = feedback.ratings.length > 0 ? 100 : 50;
    const completeness = this.calculateCompleteness(model, evaluation);
    const consistency = evaluation.quality.spacingConsistency;

    const totalScore = Math.round(
      feedbackQuality * 0.25 +
        designQuality * 0.3 +
        evaluationConfidence * 0.15 +
        userConfirmation * 0.1 +
        completeness * 0.1 +
        consistency * 0.1
    );

    const qualityScore: SampleQualityScore = {
      feedbackQuality,
      designQuality,
      evaluationConfidence,
      userConfirmation,
      completeness,
      consistency,
      totalScore
    };

    // 2. Duplicate Detection
    const sampleHash = this.computeHash(prompt, model);
    const isDuplicate = this.existingSampleHashes.has(sampleHash);
    if (!isDuplicate) {
      this.existingSampleHashes.add(sampleHash);
    } else {
      reasons.push('Duplicate prompt or design composition detected');
    }

    // 3. Determine Eligibility
    let eligibility: LearningEligibility = 'eligible';

    if (isDuplicate) {
      eligibility = 'not_eligible';
    } else if (totalScore < 60) {
      eligibility = 'not_eligible';
      reasons.push(`Total quality score ${totalScore} below threshold (60)`);
    } else if (totalScore < 75 || feedback.ratings.length === 0) {
      eligibility = 'needs_review';
      if (feedback.ratings.length === 0) {
        reasons.push('Missing explicit user rating (needs review)');
      }
      if (totalScore < 75) {
        reasons.push('Quality score requires manual dataset review');
      }
    } else {
      reasons.push('High quality sample with verified feedback and integrity');
    }

    return {
      qualityScore,
      eligibility,
      reasons,
      isDuplicate
    };
  }

  private calculateFeedbackQuality(feedback: UserFeedbackData): number {
    if (!feedback) return 0;
    let score = 50;
    if (feedback.ratings.length > 0) score += 20;
    if (feedback.explicitItems.length > 0) score += 15;
    if (feedback.aiFeedback.length > 0 || feedback.mlFeedback.length > 0) score += 15;
    return Math.min(100, score);
  }

  private calculateCompleteness(model: any, evaluation: DesignEvaluationResult): number {
    let score = 70;
    if (model) score += 15;
    if (evaluation && evaluation.overallScore > 0) score += 15;
    return Math.min(100, score);
  }

  private computeHash(prompt: string, model: any): string {
    const raw = (prompt || '') + '_' + (model?.id || JSON.stringify(model || {}).length);
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }
}
