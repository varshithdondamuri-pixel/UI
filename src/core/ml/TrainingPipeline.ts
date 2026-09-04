import { DatasetSample } from './MLTypes';
import { ModelRegistry } from './ModelRegistry';

export class TrainingPipeline {
  private registry: ModelRegistry;

  constructor(registry: ModelRegistry) {
    this.registry = registry;
  }

  public runLocalTraining(modelId: string, samples: DatasetSample[]): boolean {
    const model = this.registry.getModel(modelId);
    if (!model) return false;

    this.registry.updateModelStatus(modelId, 'training');

    // Simulate deterministic local model updating
    model.lastTrainedAt = Date.now();
    model.metrics.coverage = Math.min(100, model.metrics.coverage + Math.min(1, samples.length));
    this.registry.updateModelStatus(modelId, 'ready');

    return true;
  }
}
