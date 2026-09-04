import { MLTrainingConfig } from './MLTrainingConfig';
import { MLTaskIdentifier } from './MLTaskTypes';

export type MLTrainingJobState =
  | 'queued'
  | 'preparing'
  | 'feature_extraction'
  | 'training'
  | 'evaluating'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface MLTrainingJobRecord {
  jobId: string;
  task: MLTaskIdentifier;
  datasetVersion: string;
  configuration: MLTrainingConfig;
  state: MLTrainingJobState;
  startedAt?: string;
  completedAt?: string;
  trainingSampleCount: number;
  validationSampleCount: number;
  testSampleCount: number;
  metrics?: Record<string, number>;
  modelVersion?: string;
  error?: string;
  logsReference?: string;
}

export class MLTrainingJob {
  private record: MLTrainingJobRecord;

  constructor(jobId: string, task: MLTaskIdentifier, datasetVersion: string, config: MLTrainingConfig) {
    this.record = {
      jobId,
      task,
      datasetVersion,
      configuration: config,
      state: 'queued',
      trainingSampleCount: 0,
      validationSampleCount: 0,
      testSampleCount: 0,
      logsReference: `logs_${jobId}`
    };
  }

  public getRecord(): MLTrainingJobRecord {
    return { ...this.record };
  }

  public setState(state: MLTrainingJobState, error?: string): void {
    this.record.state = state;
    if (state === 'preparing' || state === 'training') {
      if (!this.record.startedAt) this.record.startedAt = new Date().toISOString();
    }
    if (state === 'completed' || state === 'failed' || state === 'cancelled') {
      this.record.completedAt = new Date().toISOString();
    }
    if (error) {
      this.record.error = error;
    }
  }

  public setSampleCounts(train: number, val: number, test: number): void {
    this.record.trainingSampleCount = train;
    this.record.validationSampleCount = val;
    this.record.testSampleCount = test;
  }

  public setMetrics(metrics: Record<string, number>): void {
    this.record.metrics = metrics;
  }

  public setModelVersion(version: string): void {
    this.record.modelVersion = version;
  }
}
