import { AblationCell, LayoutFeatureAblationAuditResult } from './LayoutAuditTypes';

export class LayoutFeatureAblationAudit {
  public auditFeatureAblation(fullAccuracy: number = 0.50, fullMacroF1: number = 0.3333): LayoutFeatureAblationAuditResult {
    const featureGroups = [
      'geometry', 'spatial', 'alignment', 'spacing', 'density', 'composition',
      'hierarchy', 'viewport', 'dom_structure', 'css_layout', 'responsive_structure', 'component_distribution'
    ];

    const ablations: AblationCell[] = featureGroups.map(group => ({
      featureGroup: group,
      status: 'blocked',
      reason: 'Feature ablation requires fitting sub-models with omitted feature groups, which is outside this audit-only phase.'
    }));

    return {
      fullFeatureRepresentation: {
        accuracy: fullAccuracy,
        macroF1: fullMacroF1
      },
      ablations,
      status: 'blocked',
      reason: 'Feature ablation requires fitting sub-models with omitted feature groups, which is outside this audit-only phase.'
    };
  }
}
