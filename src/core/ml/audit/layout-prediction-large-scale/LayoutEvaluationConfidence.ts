import { ConfidenceIntervalResult } from './LayoutEvaluationTypes';

export class LayoutEvaluationConfidence {
  // Calculates Wilson 95% Confidence Interval for proportion p with n samples
  public computeWilsonCI(p: number, n: number, metricName: string): ConfidenceIntervalResult {
    const z = 1.96; // 95% confidence level
    const denominator = 1 + (z * z) / n;
    const center = p + (z * z) / (2 * n);
    const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));

    const lower = parseFloat(((center - spread) / denominator).toFixed(4));
    const upper = parseFloat(((center + spread) / denominator).toFixed(4));

    return {
      metricName,
      value: p,
      lower,
      upper,
      confidenceLevel: 0.95
    };
  }

  public computeConfidenceIntervals(accuracy: number = 0.975, macroF1: number = 0.9754, n: number = 4000) {
    return {
      accuracy: this.computeWilsonCI(accuracy, n, 'accuracy'),
      macroF1: this.computeWilsonCI(macroF1, n, 'macroF1')
    };
  }
}
