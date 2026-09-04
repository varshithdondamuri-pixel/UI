import { EvaluationErrorRecord } from './LayoutV02FinalReviewTypes';

export class LayoutV02ConfidenceErrorAnalysis {
  public auditConfidenceErrors(errors: EvaluationErrorRecord[], totalSampleCount: number = 4000): {
    threshold: 0.95;
    totalErrors: number;
    highConfidenceErrorCount: number;
    highConfidenceErrorRate: number;
    meanConfidenceOfErrors: number;
    maxConfidenceOfErrors: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    const threshold = 0.95;
    const highConf = errors.filter(e => e.confidence >= threshold);
    const meanConf = errors.length > 0 ? errors.reduce((a, e) => a + e.confidence, 0) / errors.length : 0;
    const maxConf = errors.length > 0 ? Math.max(...errors.map(e => e.confidence)) : 0;
    const rate = parseFloat((highConf.length / totalSampleCount).toFixed(4));

    return {
      threshold: 0.95,
      totalErrors: errors.length,
      highConfidenceErrorCount: highConf.length,
      highConfidenceErrorRate: rate,
      meanConfidenceOfErrors: parseFloat(meanConf.toFixed(4)),
      maxConfidenceOfErrors: maxConf,
      riskLevel: rate < 0.02 ? 'LOW' : (rate < 0.05 ? 'MEDIUM' : 'HIGH')
    };
  }
}
