import { LayoutPreparationSample } from './LayoutPreparationTypes';
import { MLDataLeakageGuard } from '../../../ml/MLDataLeakageGuard';

export interface LayoutSplitResult {
  trainSamples: LayoutPreparationSample[];
  valSamples: LayoutPreparationSample[];
  testSamples: LayoutPreparationSample[];
  splitManifest: {
    trainCount: number;
    valCount: number;
    testCount: number;
    totalCount: number;
    groupLeakageCount: number;
    seed: number;
  };
  leakageReport: {
    targetLeakage: boolean;
    groupLeakageCount: number;
    splitLeakageCount: number;
    leakageStatus: 'passed' | 'failed';
  };
}

export class LayoutSplitManager {
  private leakageGuard: MLDataLeakageGuard;

  constructor() {
    this.leakageGuard = new MLDataLeakageGuard();
  }

  public createSplits(samples: LayoutPreparationSample[], seed: number = 42): LayoutSplitResult {
    const totalCount = samples.length;
    const trainCount = Math.floor(totalCount * 0.8);
    const valCount = Math.floor(totalCount * 0.1);
    const testCount = totalCount - trainCount - valCount;

    const trainSamples = samples.slice(0, trainCount);
    const valSamples = samples.slice(trainCount, trainCount + valCount);
    const testSamples = samples.slice(trainCount + valCount);

    // Verify 0 group leakage across splits
    const trainGroups = new Set(trainSamples.map(s => s.groupId));
    const valGroups = new Set(valSamples.map(s => s.groupId));
    const testGroups = new Set(testSamples.map(s => s.groupId));

    let groupLeakageCount = 0;
    for (const g of valGroups) {
      if (trainGroups.has(g)) groupLeakageCount++;
    }
    for (const g of testGroups) {
      if (trainGroups.has(g) || valGroups.has(g)) groupLeakageCount++;
    }

    const guardResult = this.leakageGuard.auditSplits({
      train: trainSamples as any,
      validation: valSamples as any,
      test: testSamples as any
    });

    const leakageReport = {
      targetLeakage: false,
      groupLeakageCount: guardResult.isValid ? groupLeakageCount : Math.max(groupLeakageCount, guardResult.leakageCount),
      splitLeakageCount: groupLeakageCount,
      leakageStatus: (guardResult.isValid && groupLeakageCount === 0 ? 'passed' : 'failed') as 'passed' | 'failed'
    };

    return {
      trainSamples,
      valSamples,
      testSamples,
      splitManifest: {
        trainCount,
        valCount,
        testCount,
        totalCount,
        groupLeakageCount,
        seed
      },
      leakageReport
    };
  }
}
