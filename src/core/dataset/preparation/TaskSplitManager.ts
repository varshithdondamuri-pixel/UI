import { MLDataLeakageGuard } from '../../ml/MLDataLeakageGuard';
import { FullDesignSample } from '../DatasetTypes';
import { MLTaskSample, PreparedTaskIdentifier } from './TaskPreparationTypes';
import { TaskSampleBuilder } from './TaskSampleBuilder';

export class TaskSplitManager {
  private leakageGuard: MLDataLeakageGuard;
  private sampleBuilder: TaskSampleBuilder;

  constructor() {
    this.leakageGuard = new MLDataLeakageGuard();
    this.sampleBuilder = new TaskSampleBuilder();
  }

  /**
   * Generates reproducible train (80%), validation (10%), test (10%) splits grouped by source screenId / recordId.
   */
  public generateTaskSplits(
    eligibleSamples: FullDesignSample[],
    task: PreparedTaskIdentifier
  ): {
    train: MLTaskSample[];
    validation: MLTaskSample[];
    test: MLTaskSample[];
    leakageStatus: {
      isValid: boolean;
      leakageCount: number;
      warnings: string[];
      errors: string[];
    };
    splitStrategy: string;
  } {
    // 1. Group by groupKey (screenId or sourceRecordId) to prevent split leakage
    const groupMap = new Map<string, FullDesignSample[]>();

    for (const sample of eligibleSamples) {
      // Extract screenId for Screen2Words / RICO cross-link protection
      const rawScreenId = sample.sampleId.replace('norm_screen2words_', '').replace('norm_rico_', '').split('_')[0];
      const groupKey = rawScreenId || sample.sessionId || sample.sampleId;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(sample);
    }

    const groupKeys = Array.from(groupMap.keys());
    const totalGroups = groupKeys.length;

    let trainCount = Math.round(totalGroups * 0.8);
    let valCount = Math.round(totalGroups * 0.1);
    let testCount = totalGroups - trainCount - valCount;

    if (totalGroups >= 3) {
      valCount = Math.max(1, valCount);
      testCount = Math.max(1, testCount);
      trainCount = Math.max(1, totalGroups - valCount - testCount);
    }

    const trainKeys = groupKeys.slice(0, trainCount);
    const valKeys = groupKeys.slice(trainCount, trainCount + valCount);
    const testKeys = groupKeys.slice(trainCount + valCount);


    const rawTrain: FullDesignSample[] = [];
    const rawVal: FullDesignSample[] = [];
    const rawTest: FullDesignSample[] = [];

    for (const k of trainKeys) rawTrain.push(...groupMap.get(k)!);
    for (const k of valKeys) rawVal.push(...groupMap.get(k)!);
    for (const k of testKeys) rawTest.push(...groupMap.get(k)!);

    // 2. Audit with MLDataLeakageGuard
    const auditReport = this.leakageGuard.auditSplits({
      train: rawTrain,
      validation: rawVal,
      test: rawTest
    });

    // 3. Build MLTaskSample records
    const train = rawTrain.map((s) => this.sampleBuilder.buildTaskSample(s, task, 'train')).filter(Boolean) as MLTaskSample[];
    const validation = rawVal.map((s) => this.sampleBuilder.buildTaskSample(s, task, 'validation')).filter(Boolean) as MLTaskSample[];
    const test = rawTest.map((s) => this.sampleBuilder.buildTaskSample(s, task, 'test')).filter(Boolean) as MLTaskSample[];

    return {
      train,
      validation,
      test,
      leakageStatus: {
        isValid: auditReport.isValid,
        leakageCount: auditReport.leakageCount,
        warnings: auditReport.warnings,
        errors: auditReport.errors
      },
      splitStrategy: 'Grouped by screenId / sourceRecordId (80/10/10 session leakage guarded)'
    };
  }
}
