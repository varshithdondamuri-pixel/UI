import { ModelRegistry } from './ModelRegistry';

export interface MLStats {
  totalModels: number;
  readyModels: number;
  avgAccuracy: number;
  avgConfidence: number;
  avgLatencyMs: number;
}

export class MLStatistics {
  public computeMLStats(registry: ModelRegistry): MLStats {
    const models = registry.getAllModels();
    const totalModels = models.length;
    const readyModels = models.filter((m) => m.status === 'ready').length;

    let sumAcc = 0;
    let sumConf = 0;
    let sumLat = 0;

    for (const m of models) {
      sumAcc += m.metrics.accuracy;
      sumConf += m.metrics.confidence;
      sumLat += m.metrics.predictionLatencyMs;
    }

    return {
      totalModels,
      readyModels,
      avgAccuracy: Number((sumAcc / (totalModels || 1)).toFixed(2)),
      avgConfidence: Number((sumConf / (totalModels || 1)).toFixed(2)),
      avgLatencyMs: Number((sumLat / (totalModels || 1)).toFixed(2))
    };
  }
}
