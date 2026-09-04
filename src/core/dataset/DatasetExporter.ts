import { FullDesignSample } from './DatasetTypes';

export class DatasetExporter {
  public exportJSON(samples: FullDesignSample[]): string {
    return JSON.stringify(samples, null, 2);
  }

  public exportJSONL(samples: FullDesignSample[]): string {
    return samples.map((sample) => JSON.stringify(sample)).join('\n');
  }

  public exportCSV(samples: FullDesignSample[]): string {
    if (samples.length === 0) {
      return 'sampleId,datasetVersion,category,industry,style,qualityScore,prompt,sourceDataset,license,createdAt,trainingDataAllowed';
    }

    const headers = [
      'sampleId',
      'datasetVersion',
      'category',
      'industry',
      'style',
      'qualityScore',
      'prompt',
      'sourceDataset',
      'license',
      'createdAt',
      'trainingDataAllowed',
      'isDuplicate',
      'duplicateOfSampleId',
      'elementCount',
      'humanFeedback'
    ];

    const rows = samples.map((s) => {
      const promptEscaped = `"${(s.prompt || '').replace(/"/g, '""')}"`;
      const feedbackEscaped = `"${(s.evaluation?.humanFeedback || '').replace(/"/g, '""')}"`;
      const elemCount = s.sketch?.canvasObjects?.length || 0;

      return [
        s.sampleId,
        s.datasetVersion,
        s.category || '',
        s.industry || '',
        s.style || '',
        s.qualityScore,
        promptEscaped,
        s.provenance?.sourceDataset || '',
        s.provenance?.license || '',
        s.createdAt,
        s.trainingDataAllowed,
        Boolean(s.isDuplicate),
        s.duplicateOfSampleId || '',
        elemCount,
        feedbackEscaped
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  public downloadFile(content: string, filename: string, mimeType: string) {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
