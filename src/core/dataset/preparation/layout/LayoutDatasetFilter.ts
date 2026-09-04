import { LayoutPreparationSample } from './LayoutPreparationTypes';

export class LayoutDatasetFilter {
  public filterSample(sample: LayoutPreparationSample): { isUsable: boolean; reason?: string } {
    if (!sample.sourceRecordId) {
      return { isUsable: false, reason: 'Missing source record ID' };
    }
    if (!sample.groupId) {
      return { isUsable: false, reason: 'Missing group ID' };
    }
    if (sample.qualityStatus === 'rejected') {
      return { isUsable: false, reason: sample.rejectionReason || 'Rejected sample quality gate' };
    }
    if (sample.geometry.viewportWidth <= 0 || sample.geometry.viewportHeight <= 0) {
      return { isUsable: false, reason: 'Invalid or non-positive viewport dimensions' };
    }

    return { isUsable: true };
  }
}
