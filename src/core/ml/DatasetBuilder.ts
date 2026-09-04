import { DatasetSample, FeatureVector } from './MLTypes';

export class DatasetBuilder {
  private samples: DatasetSample[] = [];

  public captureSample(
    industry: string,
    style: string,
    featureVector: FeatureVector,
    userRating?: number,
    approved: boolean = true
  ): DatasetSample {
    const sample: DatasetSample = {
      id: `ds-sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      industry,
      style,
      featureVector,
      userRating,
      approved,
      createdAt: Date.now()
    };
    this.samples.push(sample);
    return sample;
  }

  public getSamples(): DatasetSample[] {
    return [...this.samples];
  }
}
