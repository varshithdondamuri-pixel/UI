import { MLDataLeakageGuard } from '../MLDataLeakageGuard';
import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';
import { SplitAuditResult } from './AuditTypes';

export class SplitLeakageAuditor {
  private leakageGuard: MLDataLeakageGuard;

  constructor() {
    this.leakageGuard = new MLDataLeakageGuard();
  }

  public auditSplits(
    train: MLTaskSample[],
    validation: MLTaskSample[],
    test: MLTaskSample[]
  ): SplitAuditResult {
    const rawTrain = train.map((s) => ({ sampleId: s.sampleId, prompt: s.sampleId, sessionId: s.sourceRecordId }));
    const rawVal = validation.map((s) => ({ sampleId: s.sampleId, prompt: s.sampleId, sessionId: s.sourceRecordId }));
    const rawTest = test.map((s) => ({ sampleId: s.sampleId, prompt: s.sampleId, sessionId: s.sourceRecordId }));

    const auditReport = this.leakageGuard.auditSplits({
      train: rawTrain as any,
      validation: rawVal as any,
      test: rawTest as any
    });

    const trainGroups = new Set(train.map((s) => s.sourceRecordId)).size;
    const valGroups = new Set(validation.map((s) => s.sourceRecordId)).size;
    const testGroups = new Set(test.map((s) => s.sourceRecordId)).size;

    const leakageExamples = auditReport.leakageExamples.map((ex) => `${ex.sampleIdA} / ${ex.sampleIdB}: ${ex.reason}`);

    return {
      trainGroups,
      validationGroups: valGroups,
      testGroups,
      overlapCount: auditReport.leakageCount,
      leakageCount: auditReport.leakageCount,
      leakageExamples,
      status: auditReport.isValid ? 'passed' : 'failed'
    };
  }
}
