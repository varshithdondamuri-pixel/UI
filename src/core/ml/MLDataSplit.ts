import { DatasetSplits } from '../dataset/DatasetTypes';

export interface MLDataSplitSummary {
  trainCount: number;
  valCount: number;
  testCount: number;
  totalCount: number;
  trainRatio: number;
  valRatio: number;
  testRatio: number;
  isValid: boolean;
}

export class MLDataSplitManager {
  public summarizeSplits(splits: DatasetSplits): MLDataSplitSummary {
    const trainCount = splits.train?.length || 0;
    const valCount = splits.validation?.length || 0;
    const testCount = splits.test?.length || 0;
    const totalCount = trainCount + valCount + testCount;

    if (totalCount === 0) {
      return {
        trainCount: 0,
        valCount: 0,
        testCount: 0,
        totalCount: 0,
        trainRatio: 0,
        valRatio: 0,
        testRatio: 0,
        isValid: false
      };
    }

    return {
      trainCount,
      valCount,
      testCount,
      totalCount,
      trainRatio: Number((trainCount / totalCount).toFixed(2)),
      valRatio: Number((valCount / totalCount).toFixed(2)),
      testRatio: Number((testCount / totalCount).toFixed(2)),
      isValid: trainCount > 0
    };
  }
}
