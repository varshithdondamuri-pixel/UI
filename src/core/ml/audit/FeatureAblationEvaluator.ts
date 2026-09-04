import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';
import { ClassicalBaselineClassifier } from '../training/ClassicalBaselineClassifier';
import { MetricsEvaluator } from '../training/MetricsEvaluator';
import { AblationResult } from './AuditTypes';

export class FeatureAblationEvaluator {
  private evaluator: MetricsEvaluator;

  constructor() {
    this.evaluator = new MetricsEvaluator();
  }

  public runAblation(
    train: MLTaskSample[],
    test: MLTaskSample[]
  ): AblationResult[] {
    const fullClassifier = new ClassicalBaselineClassifier('naive_bayes_tabular', 42);
    fullClassifier.fit(train);
    const fullPreds = fullClassifier.predictDataset(test);
    const fullMetrics = this.evaluator.evaluatePredictions(fullPreds);

    const results: AblationResult[] = [];

    // 1. Full Model
    results.push({
      featureSet: 'Full Model (All Features)',
      testAccuracy: fullMetrics.accuracy,
      macroF1: fullMetrics.macroF1,
      weightedF1: fullMetrics.weightedF1,
      precision: fullMetrics.precision,
      recall: fullMetrics.recall,
      deltaFromFullModel: 0
    });

    const featureNames = ['canvasObjectCount', 'hasImageScreenshot', 'textListLength', 'viewport', 'elementCount'];

    // 2. Without each feature
    for (const feat of featureNames) {
      const maskedTrain = this.maskFeatures(train, [feat]);
      const maskedTest = this.maskFeatures(test, [feat]);

      const clf = new ClassicalBaselineClassifier('naive_bayes_tabular', 42);
      clf.fit(maskedTrain);
      const preds = clf.predictDataset(maskedTest);
      const m = this.evaluator.evaluatePredictions(preds);

      results.push({
        featureSet: `Without ${feat}`,
        testAccuracy: m.accuracy,
        macroF1: m.macroF1,
        weightedF1: m.weightedF1,
        precision: m.precision,
        recall: m.recall,
        deltaFromFullModel: parseFloat((m.accuracy - fullMetrics.accuracy).toFixed(4))
      });
    }

    // 3. Each feature alone
    for (const feat of featureNames) {
      const keepOnly = featureNames.filter((f) => f !== feat);
      const soloTrain = this.maskFeatures(train, keepOnly);
      const soloTest = this.maskFeatures(test, keepOnly);

      const clf = new ClassicalBaselineClassifier('naive_bayes_tabular', 42);
      clf.fit(soloTrain);
      const preds = clf.predictDataset(soloTest);
      const m = this.evaluator.evaluatePredictions(preds);

      results.push({
        featureSet: `Only ${feat}`,
        testAccuracy: m.accuracy,
        macroF1: m.macroF1,
        weightedF1: m.weightedF1,
        precision: m.precision,
        recall: m.recall,
        deltaFromFullModel: parseFloat((m.accuracy - fullMetrics.accuracy).toFixed(4))
      });
    }

    return results;
  }

  private maskFeatures(samples: MLTaskSample[], removeFeatures: string[]): MLTaskSample[] {
    return samples.map((s) => {
      const copyFeats = { ...(s.inputFeatures || {}) };
      for (const r of removeFeatures) {
        if (r === 'canvasObjectCount') copyFeats.canvasObjectCount = 0;
        if (r === 'hasImageScreenshot') copyFeats.hasImageScreenshot = false;
        if (r === 'textListLength') copyFeats.textListLength = 0;
        if (r === 'viewport') copyFeats.viewport = { width: 0, height: 0 };
      }
      return { ...s, inputFeatures: copyFeats };
    });
  }
}
