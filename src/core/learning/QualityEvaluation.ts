import { DesignEvaluationResult } from './LearningTypes';

export class QualityEvaluation {
  public evaluate(model: any, blueprint: any): DesignEvaluationResult['quality'] {
    let visualHierarchy = 85;
    let spacingConsistency = 90;
    let typographyConsistency = 88;
    let componentConsistency = 92;
    let layoutBalance = 87;
    let designSystemConsistency = 94;

    if (model) {
      if (model.activeOption?.style) typographyConsistency = 92;
      if (blueprint?.layoutGrid) layoutBalance = 90;
    }

    const overallVisualQuality = Math.round(
      (visualHierarchy + spacingConsistency + typographyConsistency + componentConsistency + layoutBalance + designSystemConsistency) / 6
    );

    return {
      visualHierarchy,
      spacingConsistency,
      typographyConsistency,
      componentConsistency,
      layoutBalance,
      designSystemConsistency,
      overallVisualQuality
    };
  }
}
