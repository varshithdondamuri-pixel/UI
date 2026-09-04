import { ComponentPreparationSample } from './ComponentPreparationTypes';

export class ComponentSplitManager {
  /**
   * Deterministically assigns samples into group-isolated Train (80%), Validation (10%), Test (10%) splits using seed 42.
   */
  public createSplits(samples: ComponentPreparationSample[], randomSeed: number = 42): {
    splits: { train: ComponentPreparationSample[]; val: ComponentPreparationSample[]; test: ComponentPreparationSample[] };
    splitManifest: {
      trainCount: number;
      valCount: number;
      testCount: number;
      groupLeakageCount: number;
      leakageStatus: 'passed' | 'failed';
      trainPct: number;
      valPct: number;
      testPct: number;
    };
    leakageReport: {
      totalGroups: number;
      trainGroups: string[];
      valGroups: string[];
      testGroups: string[];
      overlappingGroups: number;
      leakageStatus: 'passed' | 'failed';
    };
  } {
    // Group samples by groupId (screenId / documentId)
    const groupsMap = new Map<string, ComponentPreparationSample[]>();
    for (const sample of samples) {
      const g = sample.groupId || 'default_group';
      if (!groupsMap.has(g)) {
        groupsMap.set(g, []);
      }
      groupsMap.get(g)!.push(sample);
    }

    const uniqueGroups = Array.from(groupsMap.keys());
    // Simple deterministic PRNG seed-based shuffle of group keys
    const sortedGroups = uniqueGroups.sort((a, b) => {
      const hashA = this.hashString(a + '_' + randomSeed);
      const hashB = this.hashString(b + '_' + randomSeed);
      return hashA - hashB;
    });

    const trainGroupsSet = new Set<string>();
    const valGroupsSet = new Set<string>();
    const testGroupsSet = new Set<string>();

    const totalGroupCount = sortedGroups.length;
    const trainCut = Math.floor(totalGroupCount * 0.80);
    const valCut = Math.floor(totalGroupCount * 0.90);

    sortedGroups.forEach((group, idx) => {
      if (idx < trainCut) {
        trainGroupsSet.add(group);
      } else if (idx < valCut) {
        valGroupsSet.add(group);
      } else {
        testGroupsSet.add(group);
      }
    });

    const train: ComponentPreparationSample[] = [];
    const val: ComponentPreparationSample[] = [];
    const test: ComponentPreparationSample[] = [];

    for (const [g, groupSamples] of groupsMap.entries()) {
      if (trainGroupsSet.has(g)) {
        train.push(...groupSamples);
      } else if (valGroupsSet.has(g)) {
        val.push(...groupSamples);
      } else if (testGroupsSet.has(g)) {
        test.push(...groupSamples);
      }
    }

    // Audit group leakage
    let groupLeakageCount = 0;
    for (const g of trainGroupsSet) {
      if (valGroupsSet.has(g) || testGroupsSet.has(g)) groupLeakageCount++;
    }
    for (const g of valGroupsSet) {
      if (testGroupsSet.has(g)) groupLeakageCount++;
    }

    const totalCount = samples.length;
    const trainPct = totalCount > 0 ? (train.length / totalCount) * 100 : 0;
    const valPct = totalCount > 0 ? (val.length / totalCount) * 100 : 0;
    const testPct = totalCount > 0 ? (test.length / totalCount) * 100 : 0;

    return {
      splits: { train, val, test },
      splitManifest: {
        trainCount: train.length,
        valCount: val.length,
        testCount: test.length,
        groupLeakageCount,
        leakageStatus: groupLeakageCount === 0 ? 'passed' : 'failed',
        trainPct,
        valPct,
        testPct
      },
      leakageReport: {
        totalGroups: totalGroupCount,
        trainGroups: Array.from(trainGroupsSet),
        valGroups: Array.from(valGroupsSet),
        testGroups: Array.from(testGroupsSet),
        overlappingGroups: groupLeakageCount,
        leakageStatus: groupLeakageCount === 0 ? 'passed' : 'failed'
      }
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
