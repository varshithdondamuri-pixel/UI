export class ComponentRecommendationFeatureLeakageGuard {
  private static PROHIBITED_FIELDS = new Set<string>([
    'target',
    'targetlabel',
    'target_label',
    'componentlabel',
    'component_label',
    'normalizedtarget',
    'normalized_target',
    'labelconfidence',
    'label_confidence',
    'sourcedataset',
    'source_dataset',
    'sourcerecordid',
    'source_record_id',
    'screenid',
    'screen_id',
    'documentid',
    'document_id',
    'split',
    'splitmembership',
    'split_membership',
    'postoutcomemetadata',
    'post_outcome_metadata',
    'recommendationoutcome',
    'recommendation_outcome',
    'generatedcomponent',
    'generated_component',
    'humanpreferenceresult',
    'human_preference_result',
    'human_evaluation_outcome',
    'downstream_conversion'
  ]);

  public validateFeatureName(featureName: string): { isClean: boolean; violationReason?: string } {
    const normalized = featureName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    for (const prohibited of ComponentRecommendationFeatureLeakageGuard.PROHIBITED_FIELDS) {
      if (normalized === prohibited || normalized.includes(prohibited)) {
        return {
          isClean: false,
          violationReason: `Feature '${featureName}' matches prohibited leakage pattern '${prohibited}'`
        };
      }
    }
    return { isClean: true };
  }

  public sanitizeFeatureMap(featureMap: Record<string, number>): Record<string, number> {
    const cleanMap: Record<string, number> = {};
    for (const [key, value] of Object.entries(featureMap)) {
      const check = this.validateFeatureName(key);
      if (!check.isClean) {
        throw new Error(`Leakage Guard Rejected Feature Vector Construction: ${check.violationReason}`);
      }
      cleanMap[key] = value;
    }
    return cleanMap;
  }
}
