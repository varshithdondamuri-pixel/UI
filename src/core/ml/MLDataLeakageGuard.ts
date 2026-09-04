import { DatasetSplits } from '../dataset/DatasetTypes';

export interface LeakageReport {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  leakageCount: number;
  leakageExamples: { sampleIdA: string; sampleIdB: string; reason: string }[];
}

export class MLDataLeakageGuard {
  public auditSplits(splits: DatasetSplits): LeakageReport {
    const warnings: string[] = [];
    const errors: string[] = [];
    const leakageExamples: { sampleIdA: string; sampleIdB: string; reason: string }[] = [];

    const train = splits.train || [];
    const val = splits.validation || [];
    const test = splits.test || [];

    // 1. Check Session Leakage (same sessionId across splits)
    const trainSessions = new Set(train.map((s) => s.sessionId).filter(Boolean));
    const valSessions = new Set(val.map((s) => s.sessionId).filter(Boolean));

    for (const s of val) {
      if (s.sessionId && trainSessions.has(s.sessionId)) {
        const matchingTrain = train.find((t) => t.sessionId === s.sessionId);
        errors.push(`Session leakage: sessionId '${s.sessionId}' found in both train and validation splits.`);
        leakageExamples.push({
          sampleIdA: matchingTrain?.sampleId || 'train_sample',
          sampleIdB: s.sampleId,
          reason: `Session '${s.sessionId}' shared across train and validation splits`
        });
      }
    }

    for (const s of test) {
      if (s.sessionId && (trainSessions.has(s.sessionId) || valSessions.has(s.sessionId))) {
        const matchingTrain = train.find((t) => t.sessionId === s.sessionId);
        errors.push(`Session leakage: sessionId '${s.sessionId}' found in test split.`);
        leakageExamples.push({
          sampleIdA: matchingTrain?.sampleId || 'train_val_sample',
          sampleIdB: s.sampleId,
          reason: `Session '${s.sessionId}' shared in test split`
        });
      }
    }

    // 2. Duplicate Sample IDs across splits
    const trainIds = new Set(train.map((s) => s.sampleId));
    for (const s of val) {
      if (trainIds.has(s.sampleId)) {
        errors.push(`Duplicate sample ID leakage: '${s.sampleId}' in train and validation splits.`);
        leakageExamples.push({ sampleIdA: s.sampleId, sampleIdB: s.sampleId, reason: 'Duplicate ID in val' });
      }
    }
    for (const s of test) {
      if (trainIds.has(s.sampleId)) {
        errors.push(`Duplicate sample ID leakage: '${s.sampleId}' in train and test splits.`);
        leakageExamples.push({ sampleIdA: s.sampleId, sampleIdB: s.sampleId, reason: 'Duplicate ID in test' });
      }
    }

    // 3. Duplicate prompts across splits warning
    const trainPrompts = new Set(train.map((s) => s.prompt?.trim().toLowerCase()).filter(Boolean));
    for (const s of val) {
      if (s.prompt && trainPrompts.has(s.prompt.trim().toLowerCase())) {
        warnings.push(`Near-identical prompt across train/val splits: "${s.prompt.slice(0, 30)}..."`);
      }
    }

    const leakageCount = leakageExamples.length;
    const isValid = errors.length === 0;

    return {
      isValid,
      warnings,
      errors,
      leakageCount,
      leakageExamples
    };
  }
}
