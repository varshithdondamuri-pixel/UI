import { EvaluationErrorRecord } from './LayoutV02FinalReviewTypes';

export class LayoutV02ErrorDistribution {
  public computeDistribution(errors: EvaluationErrorRecord[]): {
    totalErrors: number;
    byCategory: Record<string, number>;
    byDataset: Record<string, number>;
    byTrueClass: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const byDataset: Record<string, number> = {};
    const byTrueClass: Record<string, number> = {};

    for (const e of errors) {
      byCategory[e.errorCategory] = (byCategory[e.errorCategory] || 0) + 1;
      byDataset[e.sourceDataset] = (byDataset[e.sourceDataset] || 0) + 1;
      byTrueClass[e.trueLabel] = (byTrueClass[e.trueLabel] || 0) + 1;
    }

    return {
      totalErrors: errors.length,
      byCategory,
      byDataset,
      byTrueClass
    };
  }
}
