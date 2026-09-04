import { DatasetDeduplicator } from '../DatasetDeduplicator';
import { DatasetQualityEngine } from '../DatasetQualityEngine';
import { DatasetValidator } from '../DatasetValidator';
import { FullDesignSample } from '../DatasetTypes';
import { PreparationQualityReport } from './TaskPreparationTypes';

export class TaskDatasetFilter {
  private validator: DatasetValidator;
  private qualityEngine: DatasetQualityEngine;
  private deduplicator: DatasetDeduplicator;

  constructor() {
    this.validator = new DatasetValidator();
    this.qualityEngine = new DatasetQualityEngine();
    this.deduplicator = new DatasetDeduplicator();
  }

  /**
   * Filters normalized samples for a target task, producing eligible samples and a detailed PreparationQualityReport.
   */
  public filterTaskSamples(
    rawSamples: FullDesignSample[],
    minQualityScore: number = 60
  ): {
    eligibleSamples: FullDesignSample[];
    qualityReport: PreparationQualityReport;
  } {
    const rawCount = rawSamples.length;
    let invalidSamples = 0;
    let missingLabelSamples = 0;
    let missingFeatureSamples = 0;
    const rejectionReasons: Record<string, number> = {};

    const validCandidateSamples: FullDesignSample[] = [];
    const qualityScores: number[] = [];

    for (const sample of rawSamples) {
      // 1. Validation check
      const val = this.validator.validateSample(sample);
      if (!val.isValid) {
        invalidSamples++;
        const firstErr = val.errors[0];
        const reasonKey = typeof firstErr === 'string' ? firstErr : (firstErr as any)?.message || 'Validation Error';
        rejectionReasons[reasonKey] = (rejectionReasons[reasonKey] || 0) + 1;
        continue;
      }

      // 2. Provenance check
      if (!sample.provenance || !sample.provenance.sourceDataset) {
        invalidSamples++;
        rejectionReasons['Missing Provenance'] = (rejectionReasons['Missing Provenance'] || 0) + 1;
        continue;
      }

      // 3. Score Quality
      const qBreakdown = this.qualityEngine.scoreSample(sample);
      const score = qBreakdown.overallScore;
      sample.qualityScore = score;
      qualityScores.push(score);

      if (score < minQualityScore) {
        invalidSamples++;
        rejectionReasons['Quality Score Below Threshold'] = (rejectionReasons['Quality Score Below Threshold'] || 0) + 1;
        continue;
      }

      validCandidateSamples.push(sample);
    }

    // 4. Deduplication Pass
    const { updatedSamples, matches } = this.deduplicator.processDuplicates(validCandidateSamples);
    const duplicateSamples = matches.length;

    const eligibleSamples = updatedSamples.filter((s) => !s.isDuplicate);
    const rejectedSamples = rawCount - eligibleSamples.length;

    const avgQ = qualityScores.length > 0 ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : 0;
    const minQ = qualityScores.length > 0 ? Math.min(...qualityScores) : 0;
    const maxQ = qualityScores.length > 0 ? Math.max(...qualityScores) : 0;

    const qualityReport: PreparationQualityReport = {
      rawSamples: rawCount,
      validSamples: validCandidateSamples.length,
      invalidSamples,
      duplicateSamples,
      missingLabelSamples,
      missingFeatureSamples,
      eligibleSamples: eligibleSamples.length,
      rejectedSamples,
      averageQuality: avgQ,
      minimumQuality: minQ,
      maximumQuality: maxQ,
      rejectionReasons
    };

    return { eligibleSamples, qualityReport };
  }
}
