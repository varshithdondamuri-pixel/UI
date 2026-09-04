import { RecommendationResult, ScorecardV02Result } from './LayoutV02AuditTypes';

export class LayoutV02RecommendationEngine {
  public determineRecommendation(
    scorecard: ScorecardV02Result,
    leakageAudit: any,
    minorityAudit: any,
    reproducibilityAudit: any
  ): RecommendationResult {
    const leakagePassed = leakageAudit.leakageStatus === 'PASSED';
    const minorityImproved = minorityAudit.minorityMacroF1Delta >= 0.20;
    const reproPassed = reproducibilityAudit.reproducibility === 'PASSED';
    const scorecardPassed = scorecard.failedDimensions === 0;

    if (leakagePassed && minorityImproved && reproPassed && scorecardPassed) {
      return 'ready_for_large_scale_evaluation';
    } else if (scorecard.overallStatus === 'WARNING') {
      return 'keep_candidate';
    } else {
      return 'improve_features';
    }
  }
}
