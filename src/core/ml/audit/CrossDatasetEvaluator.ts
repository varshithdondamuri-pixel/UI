import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';
import { ClassicalBaselineClassifier } from '../training/ClassicalBaselineClassifier';
import { MetricsEvaluator } from '../training/MetricsEvaluator';
import { CrossDatasetResult } from './AuditTypes';

export class CrossDatasetEvaluator {
  private evaluator: MetricsEvaluator;

  constructor() {
    this.evaluator = new MetricsEvaluator();
  }

  public evaluateCrossDataset(allTaskSamples: MLTaskSample[]): CrossDatasetResult[] {
    const results: CrossDatasetResult[] = [];

    // Experiment A: Train on RICO+Screen2Words+WebCode2M -> Test on WebUI
    const expATrain = allTaskSamples.filter((s) => !s.sourceDataset.toUpperCase().includes('WEBUI'));
    const expATest = allTaskSamples.filter((s) => s.sourceDataset.toUpperCase().includes('WEBUI'));

    if (expATrain.length > 0 && expATest.length > 0) {
      const clfA = new ClassicalBaselineClassifier('naive_bayes_tabular', 42);
      clfA.fit(expATrain);
      const predsA = clfA.predictDataset(expATest);
      const metricsA = this.evaluator.evaluatePredictions(predsA);

      results.push({
        experimentName: 'Experiment A (Train Mobile/Code -> Test WebUI)',
        trainSources: ['RICO', 'Screen2Words', 'WebCode2M'],
        testSource: 'WebUI',
        status: 'completed',
        testAccuracy: metricsA.accuracy
      });
    } else {
      results.push({
        experimentName: 'Experiment A (Train Mobile/Code -> Test WebUI)',
        trainSources: ['RICO', 'Screen2Words', 'WebCode2M'],
        testSource: 'WebUI',
        status: 'blocked',
        reason: 'Insufficient distinct held-out WebUI test samples in current baseline preview split.'
      });
    }

    // Experiment B: Train on WebUI+WebCode2M -> Test on RICO
    const expBTrain = allTaskSamples.filter((s) => s.sourceDataset.toUpperCase().includes('WEBUI') || s.sourceDataset.toUpperCase().includes('WEBCODE2M'));
    const expBTest = allTaskSamples.filter((s) => s.sourceDataset.toUpperCase().includes('RICO'));

    if (expBTrain.length > 0 && expBTest.length > 0) {
      const clfB = new ClassicalBaselineClassifier('naive_bayes_tabular', 42);
      clfB.fit(expBTrain);
      const predsB = clfB.predictDataset(expBTest);
      const metricsB = this.evaluator.evaluatePredictions(predsB);

      results.push({
        experimentName: 'Experiment B (Train Web -> Test RICO)',
        trainSources: ['WebUI', 'WebCode2M'],
        testSource: 'RICO',
        status: 'completed',
        testAccuracy: metricsB.accuracy
      });
    } else {
      results.push({
        experimentName: 'Experiment B (Train Web -> Test RICO)',
        trainSources: ['WebUI', 'WebCode2M'],
        testSource: 'RICO',
        status: 'blocked',
        reason: 'Insufficient distinct held-out RICO test samples in current baseline preview split.'
      });
    }

    return results;
  }
}
