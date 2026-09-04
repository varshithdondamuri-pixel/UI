import { StylePreparationSample } from './StylePreparationTypes';

export interface StyleFilterResult {
  sampleId: string;
  isUsable: boolean;
  rejectReason?: string;
}

export class StyleDatasetFilter {
  public filterSample(sample: StylePreparationSample): StyleFilterResult {
    if (!sample.isSupported) {
      return {
        sampleId: sample.sampleId,
        isUsable: false,
        rejectReason: sample.unavailableReason || 'Unsupported style source'
      };
    }

    if (sample.labelConfidence < 0.5) {
      return {
        sampleId: sample.sampleId,
        isUsable: false,
        rejectReason: 'Low label confidence'
      };
    }

    return {
      sampleId: sample.sampleId,
      isUsable: true
    };
  }
}
