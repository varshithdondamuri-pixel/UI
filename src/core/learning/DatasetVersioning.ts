import { DatasetVersion, LearningCategory, LearningSample } from './LearningTypes';

export class DatasetVersioning {
  private versionsMap: Map<string, DatasetVersion> = new Map();

  constructor() {
    // Initial default dataset version
    this.createVersion('1.0.0', 70);
  }

  public createVersion(versionStr: string, qualityThreshold: number = 70, samples: LearningSample[] = []): DatasetVersion {
    const datasetId = 'dataset_v' + versionStr.replace(/\./g, '_');
    const approvedSamples = samples.filter((s) => s.status === 'approved' && s.qualityScore.totalScore >= qualityThreshold);

    const categoriesCount: Record<LearningCategory, number> = {
      Layout: 0,
      Components: 0,
      Typography: 0,
      Colors: 0,
      Spacing: 0,
      Responsive: 0,
      Accessibility: 0,
      UX: 0,
      Animation: 0,
      Industry: 0,
      'Design Style': 0,
      'AI Recommendations': 0,
      'Code Generation': 0,
      'Overall Design Quality': 0
    };

    approvedSamples.forEach((s) => {
      s.categories.forEach((cat) => {
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
      });
    });

    const now = Date.now();
    const versionObj: DatasetVersion = {
      datasetId,
      version: versionStr,
      sampleCount: samples.length,
      approvedSampleCount: approvedSamples.length,
      categories: categoriesCount,
      creationDate: now,
      sourceRange: {
        startTime: samples.length > 0 ? Math.min(...samples.map((s) => s.createdAt)) : now,
        endTime: now
      },
      qualityThreshold
    };

    this.versionsMap.set(versionStr, versionObj);
    return versionObj;
  }

  public getVersion(versionStr: string): DatasetVersion | null {
    return this.versionsMap.get(versionStr) || null;
  }

  public getAllVersions(): DatasetVersion[] {
    return Array.from(this.versionsMap.values());
  }

  public getLatestVersion(): DatasetVersion {
    const all = this.getAllVersions();
    return all[all.length - 1];
  }
}
