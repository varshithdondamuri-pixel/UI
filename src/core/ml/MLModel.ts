import { MLTaskIdentifier } from './MLTaskTypes';

export type MLModelStatus = 'candidate' | 'evaluating' | 'approved' | 'rejected' | 'deprecated';

export interface MLModelRecord {
  modelId: string;
  task: MLTaskIdentifier;
  version: string;
  datasetVersion: string;
  featureVersion: string;
  trainingConfiguration: any;
  evaluationResults?: Record<string, number>;
  status: MLModelStatus;
  createdAt: string;
  approvedAt?: string;
  deploymentStatus: 'not_deployed' | 'staging' | 'production' | 'disabled';
  artifactHash?: string;
  /**
   * Set when a model's approval was based on evaluation artifacts that never
   * exercised the runtime inference path (MLPredictionEngine.predict()) —
   * i.e. the number that got it approved is not the number the running app
   * would produce. See MODEL_AUDIT_FINDINGS.md.
   */
  approvalNote?: string;
}

export class MLModel {
  private record: MLModelRecord;

  constructor(
    modelId: string,
    task: MLTaskIdentifier,
    version: string,
    datasetVersion: string,
    featureVersion: string,
    trainingConfig: any
  ) {
    this.record = {
      modelId,
      task,
      version,
      datasetVersion,
      featureVersion,
      trainingConfiguration: trainingConfig,
      status: 'candidate',
      createdAt: new Date().toISOString(),
      deploymentStatus: 'not_deployed'
    };
  }

  public getRecord(): MLModelRecord {
    return { ...this.record };
  }

  public setEvaluationResults(results: Record<string, number>): void {
    this.record.evaluationResults = results;
    if (this.record.status === 'candidate') {
      this.record.status = 'evaluating';
    }
  }

  public approveModel(): void {
    if (!this.record.evaluationResults) {
      throw new Error('Cannot approve model without evaluation results.');
    }
    this.record.status = 'approved';
    this.record.approvedAt = new Date().toISOString();
    this.record.deploymentStatus = 'production';
  }

  public rejectModel(_reason?: string): void {
    this.record.status = 'rejected';
    this.record.deploymentStatus = 'disabled';
  }
}
