export interface LearningStatsData {
  totalLearningSessions: number;
  totalDesigns: number;
  totalSelections: number;
  totalRejections: number;
  averageRating: number;
  averageDesignQuality: number;
  averageUXScore: number;
  averageAccessibilityScore: number;
  acceptedAISuggestions: number;
  rejectedAISuggestions: number;
  acceptedMLPredictions: number;
  rejectedMLPredictions: number;
  eligibleSamples: number;
  samplesNeedingReview: number;
  rejectedSamples: number;
  datasetVersionsCount: number;
}

export class LearningStatistics {
  private stats: LearningStatsData = {
    totalLearningSessions: 1,
    totalDesigns: 0,
    totalSelections: 0,
    totalRejections: 0,
    averageRating: 0,
    averageDesignQuality: 0,
    averageUXScore: 0,
    averageAccessibilityScore: 0,
    acceptedAISuggestions: 0,
    rejectedAISuggestions: 0,
    acceptedMLPredictions: 0,
    rejectedMLPredictions: 0,
    eligibleSamples: 0,
    samplesNeedingReview: 0,
    rejectedSamples: 0,
    datasetVersionsCount: 1
  };

  public updateStats(partial: Partial<LearningStatsData>): LearningStatsData {
    this.stats = {
      ...this.stats,
      ...partial
    };
    return this.stats;
  }

  public getStats(): LearningStatsData {
    return { ...this.stats };
  }
}
