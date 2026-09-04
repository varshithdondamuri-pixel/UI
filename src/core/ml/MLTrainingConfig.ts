import { MLTaskIdentifier } from './MLTaskTypes';
import { MLFeatureGroup } from './MLFeatureTypes';

export interface MLTrainingConfig {
  task: MLTaskIdentifier;
  datasetVersion: string;
  featureGroups: MLFeatureGroup[];
  label: string;
  modelType: string;
  hyperparameters?: Record<string, any>;
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  seed?: number;
  validationStrategy?: 'k_fold' | 'holdout' | 'stratified';
  earlyStopping?: boolean;
  checkpointing?: boolean;
  hardware?: 'cpu' | 'gpu' | 'tpu';
  maximumSamples?: number;
  maximumTrainingTime?: number; // seconds
}

export interface MLBackendStatus {
  isConfigured: boolean;
  backendName: string;
  message: string;
}

export interface MLTrainingBackend {
  prepareDataset(config: MLTrainingConfig): Promise<{ success: boolean; message: string }>;
  extractFeatures(config: MLTrainingConfig): Promise<{ success: boolean; featureCount: number }>;
  train(config: MLTrainingConfig, jobId: string): Promise<{ success: boolean; metrics: Record<string, number> }>;
  evaluate(modelId: string, testSamples: any[]): Promise<{ metrics: Record<string, number> }>;
  saveCheckpoint(jobId: string, checkpointId: string): Promise<{ checkpointPath: string }>;
  loadCheckpoint(checkpointPath: string): Promise<{ success: boolean }>;
  cancel(jobId: string): Promise<{ cancelled: boolean }>;
  getStatus(): MLBackendStatus;
}

/**
 * Pluggable default backend reporting "Training backend not configured."
 */
export class ConfigurableTrainingBackend implements MLTrainingBackend {
  private configured: boolean = false;
  private backendName: string = 'Pluggable ML Backend';

  public async prepareDataset(_config: MLTrainingConfig) {
    return { success: false, message: 'Training backend not configured.' };
  }

  public async extractFeatures(_config: MLTrainingConfig) {
    return { success: false, featureCount: 0 };
  }

  public async train(_config: MLTrainingConfig, _jobId: string): Promise<{ success: boolean; metrics: Record<string, number> }> {
    throw new Error('Training backend not configured.');
  }

  public async evaluate(_modelId: string, _testSamples: any[]) {
    return { metrics: {} };
  }

  public async saveCheckpoint(_jobId: string, _checkpointId: string) {
    return { checkpointPath: '' };
  }

  public async loadCheckpoint(_checkpointPath: string) {
    return { success: false };
  }

  public async cancel(_jobId: string) {
    return { cancelled: true };
  }

  public getStatus(): MLBackendStatus {
    return {
      isConfigured: this.configured,
      backendName: this.backendName,
      message: this.configured ? 'Backend active' : 'Training backend not configured.'
    };
  }
}
