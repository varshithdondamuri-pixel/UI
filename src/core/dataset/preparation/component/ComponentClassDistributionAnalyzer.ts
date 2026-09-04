import { ComponentPreparationSample } from './ComponentPreparationTypes';

export class ComponentClassDistributionAnalyzer {
  public analyzeDistribution(samples: ComponentPreparationSample[]): Record<string, { count: number; percentage: number; isMajority: boolean; isMinority: boolean }> {
    const counts: Record<string, number> = {};
    for (const sample of samples) {
      const label = sample.componentLabel || 'other';
      counts[label] = (counts[label] || 0) + 1;
    }

    const total = samples.length;
    let maxCount = 0;
    let minCount = Number.MAX_SAFE_INTEGER;

    for (const cnt of Object.values(counts)) {
      if (cnt > maxCount) maxCount = cnt;
      if (cnt < minCount) minCount = cnt;
    }

    const distribution: Record<string, { count: number; percentage: number; isMajority: boolean; isMinority: boolean }> = {};
    for (const [label, count] of Object.entries(counts)) {
      distribution[label] = {
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        isMajority: count === maxCount,
        isMinority: count === minCount
      };
    }

    return distribution;
  }
}
