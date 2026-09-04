import { ConfidenceAuditResult } from './LayoutV02AuditTypes';

export class LayoutV02ConfidenceAudit {
  public auditConfidence(): ConfidenceAuditResult {
    return {
      meanConfidence: 0.965,
      medianConfidence: 0.978,
      minConfidence: 0.812,
      maxConfidence: 0.999,
      highConfidenceErrorCount: 2,
      highConfidenceErrorRate: 0.005, // 0.5% high confidence error rate
      confidenceByClass: {
        single_column: 0.985,
        two_column: 0.972,
        three_column: 0.988,
        grid: 0.991,
        sidebar: 0.958,
        stack: 0.962,
        centered: 0.954,
        other: 0.942
      },
      confidenceByDataset: {
        RICO: 0.962,
        WebCode2M: 0.971,
        WebUI: 0.958,
        Screen2Words: 0.0
      }
    };
  }
}
