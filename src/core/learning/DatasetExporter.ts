import { DatasetVersion, LearningSample } from './LearningTypes';

export type ExportFormat = 'JSON' | 'JSONL' | 'CSV';

export class DatasetExporter {
  public exportDataset(samples: LearningSample[], version: DatasetVersion, format: ExportFormat): string {
    switch (format) {
      case 'JSON':
        return this.toJSON(samples, version);
      case 'JSONL':
        return this.toJSONL(samples);
      case 'CSV':
        return this.toCSV(samples);
      default:
        return this.toJSON(samples, version);
    }
  }

  private toJSON(samples: LearningSample[], version: DatasetVersion): string {
    return JSON.stringify(
      {
        datasetVersion: version,
        exportedAt: new Date().toISOString(),
        totalSamples: samples.length,
        samples
      },
      null,
      2
    );
  }

  private toJSONL(samples: LearningSample[]): string {
    return samples.map((sample) => JSON.stringify(sample)).join('\n');
  }

  private toCSV(samples: LearningSample[]): string {
    const headers = [
      'sampleId',
      'prompt',
      'createdAt',
      'status',
      'learningEligibility',
      'qualityTotalScore',
      'visualQuality',
      'uxScore',
      'a11yScore',
      'codeScore',
      'industry',
      'designStyle',
      'categories'
    ];

    const rows = samples.map((s) => [
      s.sampleId,
      `"${(s.prompt || '').replace(/"/g, '""')}"`,
      new Date(s.createdAt).toISOString(),
      s.status,
      s.learningEligibility,
      s.qualityScore.totalScore,
      s.evaluation?.quality?.overallVisualQuality || 0,
      s.evaluation?.ux?.overallUXScore || 0,
      s.evaluation?.accessibility?.wcagComplianceScore || 0,
      s.evaluation?.code?.overallCodeScore || 0,
      `"${s.industry || ''}"`,
      `"${s.designStyle || ''}"`,
      `"${s.categories.join(',')}"`
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
