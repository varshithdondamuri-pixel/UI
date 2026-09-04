import { ComponentPreparationSample } from './ComponentPreparationTypes';

export class ComponentDuplicateGuard {
  public deduplicate(samples: ComponentPreparationSample[]): {
    uniqueSamples: ComponentPreparationSample[];
    duplicateReport: {
      totalEvaluated: number;
      exactDuplicates: number;
      nearDuplicates: number;
      uniqueCount: number;
      duplicateRiskScore: number;
    };
  } {
    const seenHashes = new Set<string>();
    const unique: ComponentPreparationSample[] = [];
    let exactDupes = 0;
    let nearDupes = 0;

    for (const sample of samples) {
      // Fingerprint key based on screen group, geometry, tag type, and component label
      const hash = `${sample.groupId}_${sample.geometry.x}_${sample.geometry.y}_${sample.geometry.width}_${sample.geometry.height}_${sample.componentLabel}`;
      if (seenHashes.has(hash)) {
        exactDupes++;
      } else {
        seenHashes.add(hash);
        unique.push(sample);
      }
    }

    const totalEvaluated = samples.length;
    const uniqueCount = unique.length;
    const duplicateRiskScore = totalEvaluated > 0 ? (exactDupes + nearDupes) / totalEvaluated : 0;

    return {
      uniqueSamples: unique,
      duplicateReport: {
        totalEvaluated,
        exactDuplicates: exactDupes,
        nearDuplicates: nearDupes,
        uniqueCount,
        duplicateRiskScore
      }
    };
  }
}
