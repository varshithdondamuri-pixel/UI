import { StylePreparationSample } from './StylePreparationTypes';

export class StyleDatasetQualityEngine {
  public auditDatasetQuality(samples: StylePreparationSample[]): {
    totalRawRecords: number;
    eligibleRecords: number;
    rejectedRecords: number;
    validRecords: number;
    unavailableRecords: number;
    labelCoverage: number;
    datasetCoverage: Record<string, { total: number; valid: number; coverage: number; status: 'available' | 'unavailable' }>;
    confidenceDistribution: { high: number; medium: number; low: number };
  } {
    const totalRawRecords = samples.length;
    let validRecords = 0;
    let unavailableRecords = 0;
    let rejectedRecords = 0;

    const dsStats: Record<string, { total: number; valid: number }> = {
      RICO: { total: 0, valid: 0 },
      Screen2Words: { total: 0, valid: 0 },
      WebCode2M: { total: 0, valid: 0 },
      WebUI: { total: 0, valid: 0 }
    };

    let highConf = 0;
    let medConf = 0;
    let lowConf = 0;

    for (const sample of samples) {
      const ds = sample.datasetName;
      if (!dsStats[ds]) dsStats[ds] = { total: 0, valid: 0 };
      dsStats[ds].total++;

      if (sample.isSupported) {
        validRecords++;
        dsStats[ds].valid++;
        if (sample.labelConfidence >= 0.9) highConf++;
        else if (sample.labelConfidence >= 0.7) medConf++;
        else lowConf++;
      } else if (ds === 'Screen2Words') {
        unavailableRecords++;
      } else {
        rejectedRecords++;
      }
    }

    const labelCoverage = totalRawRecords > 0 ? validRecords / totalRawRecords : 0;

    const datasetCoverage: Record<string, { total: number; valid: number; coverage: number; status: 'available' | 'unavailable' }> = {};
    for (const [dsName, stat] of Object.entries(dsStats)) {
      const coverage = stat.total > 0 ? stat.valid / stat.total : 0;
      datasetCoverage[dsName] = {
        total: stat.total,
        valid: stat.valid,
        coverage,
        status: coverage > 0 ? 'available' : 'unavailable'
      };
    }

    return {
      totalRawRecords,
      eligibleRecords: validRecords,
      rejectedRecords,
      validRecords,
      unavailableRecords,
      labelCoverage,
      datasetCoverage,
      confidenceDistribution: {
        high: highConf,
        medium: medConf,
        low: lowConf
      }
    };
  }
}
