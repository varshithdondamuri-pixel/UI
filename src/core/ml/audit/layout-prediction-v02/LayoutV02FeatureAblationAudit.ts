import { FeatureAblationAuditResult } from './LayoutV02AuditTypes';

export class LayoutV02FeatureAblationAudit {
  public auditAblation(): FeatureAblationAuditResult {
    return {
      status: 'BLOCKED',
      reason: 'valid causal ablation requires retraining',
      retrainingAttempted: false
    };
  }
}
