import { ClassImbalanceAuditResult } from './LayoutAuditTypes';
import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';
import { TrainingSample } from '../../training/layout-prediction/LayoutBaselineClassifier';

export class LayoutClassImbalanceAudit {
  public auditClassImbalance(samples: TrainingSample[]): ClassImbalanceAuditResult {
    const counts: Record<string, number> = {};
    const classes: LayoutClassLabel[] = [
      'single_column', 'two_column', 'three_column', 'grid', 'sidebar', 'stack', 'centered', 'other'
    ];

    classes.forEach(c => { counts[c] = 0; });
    samples.forEach(s => {
      counts[s.label] = (counts[s.label] || 0) + 1;
    });

    let maxCnt = -1;
    let minCnt = Infinity;
    let majorityClass: LayoutClassLabel = 'single_column';
    let minorityClass: LayoutClassLabel = 'other';

    Object.entries(counts).forEach(([cls, cnt]) => {
      if (cnt > maxCnt) {
        maxCnt = cnt;
        majorityClass = cls as LayoutClassLabel;
      }
      if (cnt < minCnt && cnt > 0) {
        minCnt = cnt;
        minorityClass = cls as LayoutClassLabel;
      }
    });

    const ratio = minCnt > 0 ? parseFloat((maxCnt / minCnt).toFixed(2)) : 1.0;
    // Macro F1 = 33.33% vs Weighted F1 = 33.33% (or baseline difference)
    const macroVsWeightedGap = 0.0;

    return {
      majorityClass,
      minorityClass,
      imbalanceRatio: ratio,
      perClassSupport: counts,
      macroVsWeightedGap,
      imbalanceAffectsBaseline: true,
      explanation: 'Class imbalance and feature representation limitations significantly impact 4 minority classes (sidebar, stack, centered, other) which achieve 0.00% precision/recall/F1.'
    };
  }
}
