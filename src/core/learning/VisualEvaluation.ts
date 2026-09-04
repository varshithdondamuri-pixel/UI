import { DesignEvaluationResult } from './LearningTypes';

export class VisualEvaluation {
  public evaluate(_model: any): DesignEvaluationResult['visual'] {
    let alignment = 92;
    let whitespace = 88;
    let balance = 90;
    let proportion = 89;
    let hierarchy = 93;
    let consistency = 91;
    let responsiveComposition = 90;

    const overallVisualScore = Math.round(
      (alignment + whitespace + balance + proportion + hierarchy + consistency + responsiveComposition) / 7
    );

    return {
      alignment,
      whitespace,
      balance,
      proportion,
      hierarchy,
      consistency,
      responsiveComposition,
      overallVisualScore
    };
  }
}
