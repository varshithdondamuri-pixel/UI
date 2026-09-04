import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';
import { ClassicalBaselineClassifier } from '../training/ClassicalBaselineClassifier';
import { MetricsEvaluator } from '../training/MetricsEvaluator';
import { SourcePerformance } from './AuditTypes';

export class SourcePerformanceEvaluator {
  private evaluator: MetricsEvaluator;

  constructor() {
    this.evaluator = new MetricsEvaluator();
  }

  public evaluatePerSource(
    classifier: ClassicalBaselineClassifier,
    testSamples: MLTaskSample[]
  ): SourcePerformance[] {
    const sources = ['RICO', 'Screen2Words', 'WebCode2M', 'WebUI'];
    const results: SourcePerformance[] = [];

    for (const src of sources) {
      const srcTest = testSamples.filter((s) => s.sourceDataset.toUpperCase().includes(src.toUpperCase()));

      if (srcTest.length === 0) {
        results.push({
          sourceName: src,
          sampleCount: 0,
          accuracy: 'unavailable',
          macroF1: 'unavailable',
          weightedF1: 'unavailable',
          precision: 'unavailable',
          recall: 'unavailable'
        });
        continue;
      }

      const preds = classifier.predictDataset(srcTest);
      const metrics = this.evaluator.evaluatePredictions(preds);

      results.push({
        sourceName: src,
        sampleCount: srcTest.length,
        accuracy: metrics.accuracy,
        macroF1: metrics.macroF1,
        weightedF1: metrics.weightedF1,
        precision: metrics.precision,
        recall: metrics.recall
      });
    }

    return results;
  }
}
