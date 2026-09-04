import { DesignEvaluationResult } from './LearningTypes';

export class UXEvaluation {
  public evaluate(_model: any, intentTree: any): DesignEvaluationResult['ux'] {
    let navigation = 88;
    let informationHierarchy = 90;
    let ctaPlacement = 92;
    let interactionClarity = 85;
    let contentDensity = 86;
    let taskFlow = 89;
    let responsiveBehavior = 91;

    if (intentTree?.sections?.length) {
      informationHierarchy = Math.min(98, 80 + intentTree.sections.length * 3);
    }

    const overallUXScore = Math.round(
      (navigation + informationHierarchy + ctaPlacement + interactionClarity + contentDensity + taskFlow + responsiveBehavior) / 7
    );

    return {
      navigation,
      informationHierarchy,
      ctaPlacement,
      interactionClarity,
      contentDensity,
      taskFlow,
      responsiveBehavior,
      overallUXScore
    };
  }
}
