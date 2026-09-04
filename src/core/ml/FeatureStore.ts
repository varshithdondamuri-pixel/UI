import { FeatureVector } from './MLTypes';

export class FeatureStore {
  private history: { timestamp: number; features: FeatureVector }[] = [];

  public storeFeatures(features: FeatureVector): void {
    this.history.push({ timestamp: Date.now(), features });
  }

  public getLatestFeatures(): FeatureVector | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1].features;
  }

  public getAllFeatures(): FeatureVector[] {
    return this.history.map((item) => item.features);
  }

  public clear(): void {
    this.history = [];
  }
}
