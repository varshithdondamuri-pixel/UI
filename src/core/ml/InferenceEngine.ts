import { PredictionResult } from './MLTypes';

export class InferenceEngine {
  public runInference<T>(
    modelId: string,
    predictorFn: () => { prediction: T; confidence: number; alternatives: { option: T; confidence: number }[] }
  ): PredictionResult<T> {
    const start = performance.now();
    const { prediction, confidence, alternatives } = predictorFn();
    const end = performance.now();
    const latencyMs = Number(Math.max(0.1, end - start).toFixed(2));

    return {
      modelId,
      prediction,
      confidence,
      alternatives,
      latencyMs
    };
  }
}
