import { UIFeatureLeakageGuardReport, UIUnderstandingFeatureSpec } from './UIUnderstandingFeatureTypes';

export class UIUnderstandingFeatureLeakageGuard {
  private forbiddenKeywords = [
    'rootClass',
    'layoutLabel',
    'primaryComponent',
    'styleLabel',
    'targetLabel',
    'groundTruth',
    'sourceDataset',
    'sourceRecordId',
    'datasetName',
    'testLabel',
    'postOutcome',
    'finalRating',
    'humanFeedback'
  ];

  /**
   * Guards features against target leakage and dataset-source shortcut learning.
   */
  public auditAndFilterFeatures(
    sampleId: string,
    extractedFeatures: UIUnderstandingFeatureSpec[]
  ): {
    cleanFeatures: Record<string, UIUnderstandingFeatureSpec>;
    leakageReport: UIFeatureLeakageGuardReport;
  } {
    const cleanFeatures: Record<string, UIUnderstandingFeatureSpec> = {};
    const rejectedFeatureIds: string[] = [];
    const rejectionReasons: Record<string, string> = {};

    for (const feat of extractedFeatures) {
      const fidLower = feat.featureId.toLowerCase();
      const groupLower = feat.featureGroup.toLowerCase();

      // 1. Check for target label leakage
      let isLeaked = false;
      let reason = '';

      for (const kw of this.forbiddenKeywords) {
        if (fidLower.includes(kw.toLowerCase())) {
          isLeaked = true;
          reason = `Feature ID '${feat.featureId}' contains forbidden target/source shortcut keyword '${kw}'.`;
          break;
        }
      }

      // 2. Reject Provenance features from predictive feature vector
      if (groupLower === 'provenance') {
        isLeaked = true;
        reason = `Provenance group feature '${feat.featureId}' rejected from model predictive vector to prevent dataset-source shortcut learning.`;
      }

      if (isLeaked) {
        feat.leakageStatus = 'rejected_target_leakage';
        rejectedFeatureIds.push(feat.featureId);
        rejectionReasons[feat.featureId] = reason;
      } else {
        feat.leakageStatus = 'guarded_clean';
        cleanFeatures[feat.featureId] = feat;
      }
    }

    const leakageReport: UIFeatureLeakageGuardReport = {
      sampleId,
      totalExtractedFeatures: extractedFeatures.length,
      acceptedFeatures: Object.keys(cleanFeatures).length,
      rejectedFeatures: rejectedFeatureIds.length,
      rejectedFeatureIds,
      rejectionReasons,
      isClean: rejectedFeatureIds.length === 0
    };

    return { cleanFeatures, leakageReport };
  }
}
