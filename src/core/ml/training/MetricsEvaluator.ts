import { ConfusionMatrix, EvaluationMetrics, PerClassMetrics } from './MLTrainingTypes';

export class MetricsEvaluator {
  /**
   * Computes real evaluation metrics from actual predictions.
   */
  public evaluatePredictions(
    predictions: { sampleId: string; actual: string; predicted: string }[]
  ): EvaluationMetrics {
    if (predictions.length === 0) {
      return this.getEmptyMetrics();
    }

    const allClassesSet = new Set<string>();
    for (const p of predictions) {
      allClassesSet.add(p.actual);
      allClassesSet.add(p.predicted);
    }
    const classes = Array.from(allClassesSet).sort();

    const classIndices = new Map<string, number>();
    classes.forEach((cls, idx) => classIndices.set(cls, idx));

    // Initialize 2D Confusion Matrix (actual rows x predicted cols)
    const n = classes.length;
    const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    let correctCount = 0;

    for (const p of predictions) {
      const actualIdx = classIndices.get(p.actual)!;
      const predIdx = classIndices.get(p.predicted)!;
      matrix[actualIdx][predIdx]++;

      if (p.actual === p.predicted) {
        correctCount++;
      }
    }

    const accuracy = parseFloat((correctCount / predictions.length).toFixed(4));

    // Per-class Precision, Recall, F1
    const perClassMetrics: Record<string, PerClassMetrics> = {};
    let macroPSum = 0;
    let macroRSum = 0;
    let macroF1Sum = 0;
    let weightedF1Sum = 0;

    for (let i = 0; i < n; i++) {
      const clsName = classes[i];
      const tp = matrix[i][i];

      let fp = 0;
      for (let r = 0; r < n; r++) {
        if (r !== i) fp += matrix[r][i];
      }

      let fn = 0;
      for (let c = 0; c < n; c++) {
        if (c !== i) fn += matrix[i][c];
      }

      const sampleCount = matrix[i].reduce((a, b) => a + b, 0);

      const p = tp + fp > 0 ? tp / (tp + fp) : 0;
      const r = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = p + r > 0 ? (2 * p * r) / (p + r) : 0;

      perClassMetrics[clsName] = {
        className: clsName,
        precision: parseFloat(p.toFixed(4)),
        recall: parseFloat(r.toFixed(4)),
        f1: parseFloat(f1.toFixed(4)),
        sampleCount
      };

      macroPSum += p;
      macroRSum += r;
      macroF1Sum += f1;
      weightedF1Sum += f1 * sampleCount;
    }

    const macroP = parseFloat((macroPSum / n).toFixed(4));
    const macroR = parseFloat((macroRSum / n).toFixed(4));
    const macroF1 = parseFloat((macroF1Sum / n).toFixed(4));
    const weightedF1 = parseFloat((weightedF1Sum / predictions.length).toFixed(4));

    const confusionMatrix: ConfusionMatrix = {
      classes,
      matrix
    };

    return {
      accuracy,
      precision: macroP,
      recall: macroR,
      f1: macroF1,
      macroF1,
      weightedF1,
      confusionMatrix,
      perClassMetrics
    };
  }

  private getEmptyMetrics(): EvaluationMetrics {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      macroF1: 0,
      weightedF1: 0,
      confusionMatrix: { classes: [], matrix: [] },
      perClassMetrics: {}
    };
  }
}
