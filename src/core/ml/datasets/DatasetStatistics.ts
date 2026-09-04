import { MLDatasetCategory, MLDatasetRecord } from './DatasetTypes';

export interface DatasetStats {
  totalDatasets: number;
  totalEntries: number;
  coveragePercentage: number;
  industryCoverageCount: number;
  categoryCoverageCount: number;
  qualityDistribution: { excellent: number; good: number; fair: number; poor: number };
}

export class DatasetStatistics {
  public computeStats(records: MLDatasetRecord[]): DatasetStats {
    const totalEntries = records.length;
    const categoriesSet = new Set<MLDatasetCategory>();
    const industriesSet = new Set<string>();

    const qualityDist = { excellent: 0, good: 0, fair: 0, poor: 0 };

    for (const r of records) {
      categoriesSet.add(r.category);
      industriesSet.add(r.industry.toLowerCase());

      if (r.qualityScore >= 90) qualityDist.excellent++;
      else if (r.qualityScore >= 75) qualityDist.good++;
      else if (r.qualityScore >= 50) qualityDist.fair++;
      else qualityDist.poor++;
    }

    const categoryCoverageCount = categoriesSet.size;
    const coveragePercentage = Number(((categoryCoverageCount / 20) * 100).toFixed(1));

    return {
      totalDatasets: 20,
      totalEntries,
      coveragePercentage,
      industryCoverageCount: industriesSet.size,
      categoryCoverageCount,
      qualityDistribution: qualityDist
    };
  }
}
