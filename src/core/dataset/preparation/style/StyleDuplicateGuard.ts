import { StylePreparationSample } from './StylePreparationTypes';

export class StyleDuplicateGuard {
  public deduplicate(samples: StylePreparationSample[]): {
    uniqueSamples: StylePreparationSample[];
    duplicateReport: { totalEvaluated: number; duplicateCount: number; uniqueCount: number };
  } {
    const seen = new Set<string>();
    const uniqueSamples: StylePreparationSample[] = [];
    let duplicateCount = 0;

    for (const sample of samples) {
      // Key based on group + style + entropy + density
      const key = `${sample.datasetName}_${sample.groupId}_${sample.styleLabel}_${sample.colorContext.paletteEntropy.toFixed(2)}`;
      if (seen.has(key)) {
        duplicateCount++;
      } else {
        seen.add(key);
        uniqueSamples.push(sample);
      }
    }

    return {
      uniqueSamples,
      duplicateReport: {
        totalEvaluated: samples.length,
        duplicateCount,
        uniqueCount: uniqueSamples.length
      }
    };
  }
}
