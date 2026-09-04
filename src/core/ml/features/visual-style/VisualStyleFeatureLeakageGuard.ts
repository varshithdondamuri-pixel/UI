export class VisualStyleFeatureLeakageGuard {
  private prohibitedPatterns: RegExp[] = [
    /^target/i,
    /target_style/i,
    /target_label/i,
    /target_class/i,
    /target_token/i,
    /target_palette/i,
    /target_typography/i,
    /target_spacing/i,
    /generated_css/i,
    /generated_style/i,
    /recommendation_result/i,
    /post_recommendation/i,
    /user_preference/i,
    /conversion_outcome/i,
    /source_dataset_id/i,
    /screen_id/i,
    /document_id/i,
    /split_membership/i,
    /post_outcome/i
  ];

  public validateFeatureName(featureName: string): { isClean: boolean; reason?: string } {
    for (const pattern of this.prohibitedPatterns) {
      if (pattern.test(featureName)) {
        return {
          isClean: false,
          reason: `Feature '${featureName}' matches prohibited target leakage pattern '${pattern.source}'`
        };
      }
    }
    return { isClean: true };
  }

  public sanitizeFeatureMap(featureMap: Record<string, number>): Record<string, number> {
    const sanitized: Record<string, number> = {};
    for (const [key, value] of Object.entries(featureMap)) {
      const check = this.validateFeatureName(key);
      if (!check.isClean) {
        throw new Error(`LEAKAGE DETECTED: ${check.reason}`);
      }
      sanitized[key] = value;
    }
    return sanitized;
  }
}
