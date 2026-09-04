import { LayoutPreparationResult } from './LayoutPreparationTypes';

export class LayoutPreparationManifest {
  private static isLocked = false;

  public static createManifest(result: LayoutPreparationResult): any {
    return {
      releaseId: result.releaseId,
      preparedAt: result.preparedAt,
      datasetVersion: result.datasetVersion,
      task: 'layout_prediction',
      status: 'prepared',
      immutable: true,
      statistics: result.statistics,
      confidenceDistribution: result.confidenceDistribution,
      classDistributionSummary: result.classDistribution,
      splitManifestSummary: result.splitManifest,
      trainingReadiness: result.trainingReadiness
    };
  }

  public static lockRelease(): void {
    LayoutPreparationManifest.isLocked = true;
  }

  public static isReleaseLocked(): boolean {
    return LayoutPreparationManifest.isLocked;
  }
}
