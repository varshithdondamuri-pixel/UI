import { MLTaskIdentifier } from './MLTaskTypes';

export interface MLBaselineRecord {
  baselineId: string;
  task: MLTaskIdentifier;
  modelType: string;
  features: string[];
  labels: string[];
  trainingSamplesCount: number;
  validationSamplesCount: number;
  testSamplesCount: number;
  metrics?: Record<string, number>;
  hyperparameters: Record<string, any>;
  version: string;
  status: 'draft' | 'configured' | 'evaluated' | 'archived';
  isTrained: boolean;
  createdAt: string;
}

export class MLBaselineEngine {
  private baselines: Map<string, MLBaselineRecord> = new Map();

  public createBaseline(
    task: MLTaskIdentifier,
    modelType: string = 'Rule-based Heuristic Baseline',
    features: string[] = ['sketch_features', 'layout_features'],
    labels: string[] = ['category'],
    hyperparameters: Record<string, any> = { heuristicThreshold: 0.75 }
  ): MLBaselineRecord {
    const baselineId = `baseline_${task}_v0.1`;
    const record: MLBaselineRecord = {
      baselineId,
      task,
      modelType,
      features,
      labels,
      trainingSamplesCount: 0,
      validationSamplesCount: 0,
      testSamplesCount: 0,
      hyperparameters,
      version: 'v0.1',
      status: 'configured',
      isTrained: false, // HARD REQUIREMENT: Not trained unless executed
      createdAt: new Date().toISOString()
    };

    this.baselines.set(baselineId, record);
    return record;
  }

  public getBaseline(baselineId: string): MLBaselineRecord | undefined {
    return this.baselines.get(baselineId);
  }

  public getBaselineForTask(task: MLTaskIdentifier): MLBaselineRecord | undefined {
    return Array.from(this.baselines.values()).find((b) => b.task === task);
  }

  public getAllBaselines(): MLBaselineRecord[] {
    return Array.from(this.baselines.values());
  }
}
