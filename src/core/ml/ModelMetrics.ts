import { ModelMetrics } from './MLTypes';

export class ModelMetricsTracker {
  private metrics: Map<string, ModelMetrics> = new Map();

  public setMetrics(modelId: string, metrics: ModelMetrics): void {
    this.metrics.set(modelId, { ...metrics });
  }

  public getMetrics(modelId: string): ModelMetrics | null {
    return this.metrics.get(modelId) || null;
  }

  public getAllMetrics(): Record<string, ModelMetrics> {
    const result: Record<string, ModelMetrics> = {};
    for (const [id, m] of this.metrics.entries()) {
      result[id] = m;
    }
    return result;
  }
}
