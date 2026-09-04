import { StylePreparationSample } from './StylePreparationTypes';

export class StyleSplitManager {
  public createSplits(
    samples: StylePreparationSample[],
    seed: number = 42
  ): {
    train: StylePreparationSample[];
    val: StylePreparationSample[];
    test: StylePreparationSample[];
    splitManifest: { trainCount: number; valCount: number; testCount: number; groupLeakageCount: number };
    leakageReport: { leakageStatus: 'passed' | 'failed'; groupLeakageCount: number };
  } {
    // Group samples by groupId to guarantee zero split leakage across documents/screens
    const groupMap = new Map<string, StylePreparationSample[]>();
    for (const sample of samples) {
      const gId = sample.groupId || `group_${sample.sampleId}`;
      if (!groupMap.has(gId)) {
        groupMap.set(gId, []);
      }
      groupMap.get(gId)!.push(sample);
    }

    const groupIds = Array.from(groupMap.keys());
    
    // Deterministic shuffle using seed
    const shuffledGroups = [...groupIds].sort((a, b) => {
      let hashA = 0;
      let hashB = 0;
      for (let i = 0; i < a.length; i++) hashA = (hashA << 5) - hashA + a.charCodeAt(i) + seed;
      for (let i = 0; i < b.length; i++) hashB = (hashB << 5) - hashB + b.charCodeAt(i) + seed;
      return hashA - hashB;
    });

    const totalGroups = shuffledGroups.length;
    const trainEnd = Math.floor(totalGroups * 0.8);
    const valEnd = trainEnd + Math.floor(totalGroups * 0.1);

    const trainGroupIds = new Set(shuffledGroups.slice(0, trainEnd));
    const valGroupIds = new Set(shuffledGroups.slice(trainEnd, valEnd));
    const testGroupIds = new Set(shuffledGroups.slice(valEnd));

    const train: StylePreparationSample[] = [];
    const val: StylePreparationSample[] = [];
    const test: StylePreparationSample[] = [];

    for (const [gId, gSamples] of groupMap.entries()) {
      if (trainGroupIds.has(gId)) {
        train.push(...gSamples);
      } else if (valGroupIds.has(gId)) {
        val.push(...gSamples);
      } else {
        test.push(...gSamples);
      }
    }

    // Verify group isolation
    let groupLeakageCount = 0;
    const trainSet = new Set(trainGroupIds);
    for (const gId of valGroupIds) {
      if (trainSet.has(gId)) groupLeakageCount++;
    }
    for (const gId of testGroupIds) {
      if (trainSet.has(gId)) groupLeakageCount++;
    }

    return {
      train,
      val,
      test,
      splitManifest: {
        trainCount: train.length,
        valCount: val.length,
        testCount: test.length,
        groupLeakageCount
      },
      leakageReport: {
        leakageStatus: groupLeakageCount === 0 ? 'passed' : 'failed',
        groupLeakageCount
      }
    };
  }
}
