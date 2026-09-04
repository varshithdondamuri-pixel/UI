import { FullDesignSample } from './DatasetTypes';

export interface DatasetStatisticsSummary {
  totalSamples: number;
  sketchSamples: number;
  semanticSamples: number;
  intentSamples: number;
  blueprintSamples: number;
  visualSamples: number;
  preferenceSamples: number;
  iterationSamples: number;
  qualitySamples: number;
  approvedSamples: number;
  rejectedSamples: number;
  averageQuality: number;
  averageRating: number;
  industryDistribution: Record<string, number>;
  styleDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
}

export class DatasetStatistics {
  public compute(samples: FullDesignSample[]): DatasetStatisticsSummary {
    const totalSamples = samples.length;
    let approvedSamples = 0;
    let rejectedSamples = 0;
    let qualitySum = 0;
    let ratingSum = 0;

    const industryDist: Record<string, number> = {};
    const styleDist: Record<string, number> = {};
    const categoryDist: Record<string, number> = {};
    const sourceDist: Record<string, number> = {};

    let sketchSamples = 0;
    let semanticSamples = 0;
    let intentSamples = 0;
    let blueprintSamples = 0;
    let visualSamples = 0;
    let preferenceSamples = 0;
    let iterationSamples = 0;
    let qualitySamples = 0;

    for (const sample of samples) {
      if (sample.trainingDataAllowed && !sample.isDuplicate) {
        approvedSamples++;
      } else {
        rejectedSamples++;
      }

      qualitySum += sample.qualityScore || 0;
      ratingSum += sample.evaluation?.finalRating || sample.qualityScore || 0;

      // Sub-sample counts
      if (sample.sketch?.canvasObjects?.length) sketchSamples++;
      if (sample.semanticTree) semanticSamples++;
      if (sample.intentTree) intentSamples++;
      if (sample.blueprintVariants) blueprintSamples++;
      if (sample.visualDesignOptions) visualSamples++;
      if (sample.userSelections || sample.preferenceExamples?.length) preferenceSamples++;
      if (sample.userChanges?.length) iterationSamples++;
      if (sample.evaluation) qualitySamples++;

      // Distributions
      const ind = sample.industry || 'Unspecified';
      industryDist[ind] = (industryDist[ind] || 0) + 1;

      const style = sample.style || 'Unspecified';
      styleDist[style] = (styleDist[style] || 0) + 1;

      const cat = sample.category || 'ui_understanding';
      categoryDist[cat] = (categoryDist[cat] || 0) + 1;

      const src = sample.provenance?.sourceDataset || 'first_party';
      sourceDist[src] = (sourceDist[src] || 0) + 1;
    }

    const averageQuality = totalSamples > 0 ? Number((qualitySum / totalSamples).toFixed(1)) : 0;
    const averageRating = totalSamples > 0 ? Number((ratingSum / totalSamples).toFixed(1)) : 0;

    return {
      totalSamples,
      sketchSamples,
      semanticSamples,
      intentSamples,
      blueprintSamples,
      visualSamples,
      preferenceSamples,
      iterationSamples,
      qualitySamples,
      approvedSamples,
      rejectedSamples,
      averageQuality,
      averageRating,
      industryDistribution: industryDist,
      styleDistribution: styleDist,
      categoryDistribution: categoryDist,
      sourceDistribution: sourceDist
    };
  }
}
