import { StylePreparationSample } from './StylePreparationTypes';

export class StyleClassDistributionAnalyzer {
  public analyzeDistribution(samples: StylePreparationSample[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const sample of samples) {
      const lbl = sample.styleLabel;
      counts[lbl] = (counts[lbl] || 0) + 1;
    }
    return counts;
  }
}
