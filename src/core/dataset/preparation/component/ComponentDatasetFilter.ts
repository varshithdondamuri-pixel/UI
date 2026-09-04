import { ComponentPreparationSample } from './ComponentPreparationTypes';

export class ComponentDatasetFilter {
  public filterSample(sample: ComponentPreparationSample): { isUsable: boolean; reason?: string } {
    if (!sample) {
      return { isUsable: false, reason: 'Sample is null' };
    }

    if (!sample.isSupported) {
      return { isUsable: false, reason: sample.unavailableReason || 'Unsupported element context' };
    }

    if (sample.labelConfidence < 0.50) {
      return { isUsable: false, reason: 'Low label confidence (< 0.50)' };
    }

    // Geometry sanity check
    if (sample.geometry.width <= 0 || sample.geometry.height <= 0) {
      return { isUsable: false, reason: 'Non-positive geometry bounds' };
    }

    return { isUsable: true };
  }
}
