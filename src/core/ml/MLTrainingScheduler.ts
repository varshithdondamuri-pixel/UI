import { MLTrainingBackend, MLTrainingConfig, ConfigurableTrainingBackend } from './MLTrainingConfig';
import { MLTrainingJob, MLTrainingJobRecord } from './MLTrainingJob';
import { MLTaskIdentifier } from './MLTaskTypes';

export class MLTrainingScheduler {
  private jobs: Map<string, MLTrainingJob> = new Map();
  private backend: MLTrainingBackend;

  constructor(backend?: MLTrainingBackend) {
    this.backend = backend || new ConfigurableTrainingBackend();
  }

  public setBackend(backend: MLTrainingBackend): void {
    this.backend = backend;
  }

  public getBackend(): MLTrainingBackend {
    return this.backend;
  }

  /**
   * Prepares and enqueues a training job.
   * HARD REQUIREMENT: Enqueuing does NOT automatically start execution.
   * Training must require an explicit call to `startJob(jobId)`.
   */
  public prepareJob(
    task: MLTaskIdentifier,
    datasetVersion: string,
    config: MLTrainingConfig
  ): MLTrainingJobRecord {
    const jobId = `job_${task}_${Date.now()}`;
    const job = new MLTrainingJob(jobId, task, datasetVersion, config);
    this.jobs.set(jobId, job);
    return job.getRecord();
  }

  /**
   * Explicit user/controller triggered start action.
   */
  public async startJob(jobId: string): Promise<MLTrainingJobRecord> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job '${jobId}' not found.`);
    }

    const backendStatus = this.backend.getStatus();
    if (!backendStatus.isConfigured) {
      job.setState('failed', backendStatus.message);
      return job.getRecord();
    }

    job.setState('preparing');
    try {
      job.setState('feature_extraction');
      await this.backend.extractFeatures(job.getRecord().configuration);

      job.setState('training');
      const trainResult = await this.backend.train(job.getRecord().configuration, jobId);

      job.setState('evaluating');
      job.setMetrics(trainResult.metrics);

      job.setState('completed');
    } catch (err: any) {
      job.setState('failed', err.message || String(err));
    }

    return job.getRecord();
  }

  public cancelJob(jobId: string): MLTrainingJobRecord | undefined {
    const job = this.jobs.get(jobId);
    if (job) {
      this.backend.cancel(jobId).catch(() => {});
      job.setState('cancelled');
      return job.getRecord();
    }
    return undefined;
  }

  public getJob(jobId: string): MLTrainingJobRecord | undefined {
    return this.jobs.get(jobId)?.getRecord();
  }

  public getAllJobs(): MLTrainingJobRecord[] {
    return Array.from(this.jobs.values()).map((j) => j.getRecord());
  }
}
