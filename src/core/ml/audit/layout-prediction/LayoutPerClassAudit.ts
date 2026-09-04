import { ClassPerformanceCell, LayoutPerClassAuditResult } from './LayoutAuditTypes';
import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';
import { LayoutBaselineClassifier, TrainingSample } from '../../training/layout-prediction/LayoutBaselineClassifier';

export class LayoutPerClassAudit {
  private static readonly CLASSES: LayoutClassLabel[] = [
    'single_column', 'two_column', 'three_column', 'grid', 'sidebar', 'stack', 'centered', 'other'
  ];

  public auditPerClass(
    classifier: LayoutBaselineClassifier,
    testSamples: TrainingSample[]
  ): LayoutPerClassAuditResult {
    const classIdxMap = new Map<LayoutClassLabel, number>();
    LayoutPerClassAudit.CLASSES.forEach((c, idx) => classIdxMap.set(c, idx));

    const matrix: number[][] = Array.from({ length: 8 }, () => new Array(8).fill(0));
    const labelCounts: Record<string, number> = {};

    for (const s of testSamples) {
      labelCounts[s.label] = (labelCounts[s.label] || 0) + 1;
      const row = classIdxMap.get(s.label) ?? 0;
      const pred = classifier.predict(s);
      const col = classIdxMap.get(pred) ?? 0;
      matrix[row][col]++;
    }

    const classCells: ClassPerformanceCell[] = LayoutPerClassAudit.CLASSES.map((cls, idx) => {
      const tp = matrix[idx][idx];
      let fn = 0;
      let fp = 0;
      let support = 0;

      for (let j = 0; j < 8; j++) {
        support += matrix[idx][j];
        if (j !== idx) fn += matrix[idx][j];
        if (j !== idx) fp += matrix[j][idx];
      }

      const prec = tp + fp > 0 ? tp / (tp + fp) : 0;
      const rec = support > 0 ? tp / support : 0;
      const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;
      const errorCount = fn + fp;

      return {
        className: cls,
        support,
        precision: parseFloat(prec.toFixed(4)),
        recall: parseFloat(rec.toFixed(4)),
        f1Score: parseFloat(f1.toFixed(4)),
        errorCount
      };
    });

    // Identify strongest and weakest classes
    let maxF1 = -1;
    let minF1 = 999;
    let strongestClass: LayoutClassLabel = 'single_column';
    let weakestClass: LayoutClassLabel = 'sidebar';

    classCells.forEach(cell => {
      if (cell.f1Score > maxF1) {
        maxF1 = cell.f1Score;
        strongestClass = cell.className;
      }
      if (cell.f1Score < minF1) {
        minF1 = cell.f1Score;
        weakestClass = cell.className;
      }
    });

    // Identify majority and minority class
    let maxSupport = -1;
    let minSupport = 999999;
    let majorityClass: LayoutClassLabel = 'single_column';
    let minorityClass: LayoutClassLabel = 'other';

    classCells.forEach(cell => {
      if (cell.support > maxSupport) {
        maxSupport = cell.support;
        majorityClass = cell.className;
      }
      if (cell.support < minSupport && cell.support > 0) {
        minSupport = cell.support;
        minorityClass = cell.className;
      }
    });

    const insufficientPerformanceClasses = classCells
      .filter(cell => cell.f1Score < 0.20 || cell.support < 10)
      .map(cell => cell.className);

    return {
      classes: classCells,
      strongestClass,
      weakestClass,
      majorityClass,
      minorityClass,
      insufficientPerformanceClasses
    };
  }
}
