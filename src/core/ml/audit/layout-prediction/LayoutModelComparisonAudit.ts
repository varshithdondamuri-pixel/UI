import { LayoutModelComparisonAuditResult, ModelComparisonResultCell } from './LayoutAuditTypes';
import { LayoutMetricsEvaluator } from '../../training/layout-prediction/LayoutMetricsEvaluator';
import { LayoutBaselineClassifier, TrainingSample } from '../../training/layout-prediction/LayoutBaselineClassifier';

export class LayoutModelComparisonAudit {
  private evaluator: LayoutMetricsEvaluator;

  constructor() {
    this.evaluator = new LayoutMetricsEvaluator();
  }

  public auditModelComparison(
    valSamples: TrainingSample[],
    testSamples: TrainingSample[],
    randomSeed: number = 42
  ): LayoutModelComparisonAuditResult {
    // Audit-only: Use existing fitted model logic without modifying artifacts
    const baselineA = new LayoutBaselineClassifier('reference_majority', randomSeed);
    baselineA.fit(valSamples); // Baseline A fits majority class

    const baselineB = new LayoutBaselineClassifier('supervised_classical', randomSeed);
    baselineB.fit(valSamples);

    const valEvalA = this.evaluator.evaluateModel(baselineA, valSamples, 'reference_majority', 'Baseline A (Reference Majority Class)');
    const valEvalB = this.evaluator.evaluateModel(baselineB, valSamples, 'supervised_classical', 'Baseline B (Supervised Classical Model)');

    const testEvalA = this.evaluator.evaluateModel(baselineA, testSamples, 'reference_majority', 'Baseline A (Reference Majority Class)');
    const testEvalB = this.evaluator.evaluateModel(baselineB, testSamples, 'supervised_classical', 'Baseline B (Supervised Classical Model)');

    const valCellA: ModelComparisonResultCell = {
      modelName: valEvalA.modelName,
      modelType: valEvalA.modelType,
      accuracy: valEvalA.accuracy,
      macroF1: valEvalA.macroF1,
      weightedF1: valEvalA.weightedF1,
      precision: valEvalA.precision,
      recall: valEvalA.recall
    };

    const valCellB: ModelComparisonResultCell = {
      modelName: valEvalB.modelName,
      modelType: valEvalB.modelType,
      accuracy: valEvalB.accuracy,
      macroF1: valEvalB.macroF1,
      weightedF1: valEvalB.weightedF1,
      precision: valEvalB.precision,
      recall: valEvalB.recall
    };

    const testCellA: ModelComparisonResultCell = {
      modelName: testEvalA.modelName,
      modelType: testEvalA.modelType,
      accuracy: testEvalA.accuracy,
      macroF1: testEvalA.macroF1,
      weightedF1: testEvalA.weightedF1,
      precision: testEvalA.precision,
      recall: testEvalA.recall
    };

    const testCellB: ModelComparisonResultCell = {
      modelName: testEvalB.modelName,
      modelType: testEvalB.modelType,
      accuracy: testEvalB.accuracy,
      macroF1: testEvalB.macroF1,
      weightedF1: testEvalB.weightedF1,
      precision: testEvalB.precision,
      recall: testEvalB.recall
    };

    return {
      modelId: 'layout-prediction-v0.1.0',
      validation: {
        baselineA: valCellA,
        baselineB: valCellB,
        improvement: {
          accuracyDelta: parseFloat((valCellB.accuracy - valCellA.accuracy).toFixed(4)),
          macroF1Delta: parseFloat((valCellB.macroF1 - valCellA.macroF1).toFixed(4)),
          weightedF1Delta: parseFloat((valCellB.weightedF1 - valCellA.weightedF1).toFixed(4)),
          relativeAccuracyGain: valCellA.accuracy > 0 ? parseFloat((((valCellB.accuracy - valCellA.accuracy) / valCellA.accuracy) * 100).toFixed(2)) : 0
        }
      },
      test: {
        baselineA: testCellA,
        baselineB: testCellB,
        improvement: {
          accuracyDelta: parseFloat((testCellB.accuracy - testCellA.accuracy).toFixed(4)),
          macroF1Delta: parseFloat((testCellB.macroF1 - testCellA.macroF1).toFixed(4)),
          weightedF1Delta: parseFloat((testCellB.weightedF1 - testCellA.weightedF1).toFixed(4)),
          relativeAccuracyGain: testCellA.accuracy > 0 ? parseFloat((((testCellB.accuracy - testCellA.accuracy) / testCellA.accuracy) * 100).toFixed(2)) : 0
        }
      }
    };
  }
}
