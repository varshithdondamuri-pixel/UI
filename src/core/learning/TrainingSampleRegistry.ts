import {
  LearningCategory,
  LearningDatasetQuery,
  LearningDatasetProvider,
  LearningSample,
  SampleStatus
} from './LearningTypes';

export class TrainingSampleRegistry implements LearningDatasetProvider {
  private samplesMap: Map<string, LearningSample> = new Map();

  public registerSample(sample: LearningSample): void {
    this.samplesMap.set(sample.sampleId, sample);
  }

  public updateSampleStatus(sampleId: string, newStatus: SampleStatus): boolean {
    const sample = this.samplesMap.get(sampleId);
    if (!sample) return false;

    sample.status = newStatus;
    return true;
  }

  public getSample(sampleId: string): LearningSample | null {
    return this.samplesMap.get(sampleId) || null;
  }

  public getAllSamples(): LearningSample[] {
    return Array.from(this.samplesMap.values());
  }

  // --- Implementation of LearningDatasetProvider for Future ML Layer ---

  public getApprovedSamples(query?: LearningDatasetQuery): LearningSample[] {
    let list = Array.from(this.samplesMap.values()).filter((s) => s.status === 'approved');

    if (query) {
      if (query.category) {
        list = list.filter((s) => s.categories.includes(query.category!));
      }
      if (query.modelId) {
        list = list.filter((s) => s.modelId === query.modelId);
      }
      if (query.industry) {
        list = list.filter((s) => s.industry === query.industry);
      }
      if (query.designStyle) {
        list = list.filter((s) => s.designStyle === query.designStyle);
      }
      if (query.qualityThreshold !== undefined) {
        list = list.filter((s) => s.qualityScore.totalScore >= query.qualityThreshold!);
      }
      if (query.datasetVersion) {
        list = list.filter((s) => s.datasetVersion === query.datasetVersion);
      }
      if (query.offset) {
        list = list.slice(query.offset);
      }
      if (query.limit) {
        list = list.slice(0, query.limit);
      }
    }

    return list;
  }

  public getSamplesByCategory(category: LearningCategory): LearningSample[] {
    return this.getApprovedSamples({ category });
  }

  public getSamplesByModel(modelId: string): LearningSample[] {
    return this.getApprovedSamples({ modelId });
  }

  public getSamplesByIndustry(industry: string): LearningSample[] {
    return this.getApprovedSamples({ industry });
  }

  public getSamplesByDesignStyle(style: string): LearningSample[] {
    return this.getApprovedSamples({ designStyle: style });
  }

  public getSamplesByQualityThreshold(threshold: number): LearningSample[] {
    return this.getApprovedSamples({ qualityThreshold: threshold });
  }

  public getSamplesByDatasetVersion(version: string): LearningSample[] {
    return this.getApprovedSamples({ datasetVersion: version });
  }

  public getCountsByStatus(): Record<SampleStatus, number> {
    const counts: Record<SampleStatus, number> = {
      candidate: 0,
      needs_review: 0,
      approved: 0,
      rejected: 0,
      deprecated: 0
    };
    this.samplesMap.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }
}
