import { MLFeatureGroup } from './MLFeatureTypes';
import { MLTaskIdentifier } from './MLTaskTypes';

export type MLExperimentStatus = 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface MLExperimentRecord {
  experimentId: string;
  task: MLTaskIdentifier;
  datasetVersion: string;
  featureGroups: MLFeatureGroup[];
  configuration: any;
  baselineId?: string;
  candidateModelId?: string;
  metrics?: Record<string, number>;
  status: MLExperimentStatus;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export class MLExperiment {
  private record: MLExperimentRecord;

  constructor(
    experimentId: string,
    task: MLTaskIdentifier,
    datasetVersion: string,
    featureGroups: MLFeatureGroup[],
    config: any
  ) {
    this.record = {
      experimentId,
      task,
      datasetVersion,
      featureGroups,
      configuration: config,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
  }

  public getRecord(): MLExperimentRecord {
    return { ...this.record };
  }

  public setBaseline(baselineId: string): void {
    this.record.baselineId = baselineId;
  }

  public setCandidateModel(modelId: string): void {
    this.record.candidateModelId = modelId;
  }

  public setMetrics(metrics: Record<string, number>): void {
    this.record.metrics = metrics;
    this.record.status = 'completed';
    this.record.completedAt = new Date().toISOString();
  }

  public setNotes(notes: string): void {
    this.record.notes = notes;
  }
}
