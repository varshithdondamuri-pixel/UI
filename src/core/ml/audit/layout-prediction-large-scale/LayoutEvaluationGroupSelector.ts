export class LayoutEvaluationGroupSelector {
  public verifyGroupIsolation(evalGroups: string[], trainGroups: string[], valGroups: string[], testGroups: string[]): {
    trainOverlap: number;
    validationOverlap: number;
    testOverlap: number;
    isIsolated: boolean;
  } {
    const trainSet = new Set(trainGroups);
    const valSet = new Set(valGroups);
    const testSet = new Set(testGroups);

    let trainOverlap = 0;
    let validationOverlap = 0;
    let testOverlap = 0;

    for (const g of evalGroups) {
      if (trainSet.has(g)) trainOverlap++;
      if (valSet.has(g)) validationOverlap++;
      if (testSet.has(g)) testOverlap++;
    }

    const isIsolated = trainOverlap === 0 && validationOverlap === 0 && testOverlap === 0;

    return {
      trainOverlap,
      validationOverlap,
      testOverlap,
      isIsolated
    };
  }
}
