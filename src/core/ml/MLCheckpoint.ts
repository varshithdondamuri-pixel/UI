export interface MLCheckpointRecord {
  checkpointId: string;
  jobId: string;
  epoch: number;
  step: number;
  metrics: Record<string, number>;
  createdAt: string;
  filePath: string;
}

export class MLCheckpointManager {
  private checkpoints: Map<string, MLCheckpointRecord> = new Map();

  public createCheckpoint(
    jobId: string,
    epoch: number,
    step: number,
    metrics: Record<string, number>
  ): MLCheckpointRecord {
    const checkpointId = `chk_${jobId}_e${epoch}_s${step}`;
    const record: MLCheckpointRecord = {
      checkpointId,
      jobId,
      epoch,
      step,
      metrics,
      createdAt: new Date().toISOString(),
      filePath: `/checkpoints/${checkpointId}.bin`
    };

    this.checkpoints.set(checkpointId, record);
    return record;
  }

  public getCheckpoint(checkpointId: string): MLCheckpointRecord | undefined {
    return this.checkpoints.get(checkpointId);
  }

  public getCheckpointsForJob(jobId: string): MLCheckpointRecord[] {
    return Array.from(this.checkpoints.values()).filter((c) => c.jobId === jobId);
  }
}
