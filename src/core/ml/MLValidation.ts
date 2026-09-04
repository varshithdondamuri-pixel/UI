import { DatasetSplits } from '../dataset/DatasetTypes';
import { MLDataLeakageGuard } from './MLDataLeakageGuard';
import { MLTaskIdentifier } from './MLTaskTypes';

export interface QualityGateResult {
  trainingStatus: 'allowed' | 'blocked';
  reasons: string[];
  sampleCounts: { train: number; val: number; test: number };
  leakageSummary: { leakageCount: number };
}

export class MLValidationGate {
  private leakageGuard: MLDataLeakageGuard;

  constructor() {
    this.leakageGuard = new MLDataLeakageGuard();
  }

  public validateTaskForTraining(
    task: MLTaskIdentifier,
    splits: DatasetSplits,
    datasetVersion?: string
  ): QualityGateResult {
    const reasons: string[] = [];

    const train = splits.train || [];
    const val = splits.validation || [];
    const test = splits.test || [];

    // 1. Check Dataset Version
    if (!datasetVersion) {
      reasons.push('Dataset version is missing');
    }

    // 2. Minimum Approved Samples Check
    if (train.length === 0) {
      reasons.push(`No approved training samples found for task '${task}'`);
    }

    // 3. trainingDataAllowed & Provenance Check
    const unapprovedInTrain = train.filter((s) => !s.trainingDataAllowed || !s.provenance?.license);
    if (unapprovedInTrain.length > 0) {
      reasons.push(`${unapprovedInTrain.length} samples in training split are restricted or lack valid provenance`);
    }

    // 4. Data Leakage Audit
    const leakageReport = this.leakageGuard.auditSplits(splits);
    if (!leakageReport.isValid) {
      reasons.push(...leakageReport.errors);
    }

    const trainingStatus = reasons.length === 0 ? 'allowed' : 'blocked';

    return {
      trainingStatus,
      reasons,
      sampleCounts: { train: train.length, val: val.length, test: test.length },
      leakageSummary: { leakageCount: leakageReport.leakageCount }
    };
  }
}
