import { DatasetDeduplicator } from '../../dataset/DatasetDeduplicator';
import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';
import { DuplicateAuditResult } from './AuditTypes';

export class DuplicateRiskAnalyzer {
  private deduplicator: DatasetDeduplicator;

  constructor() {
    this.deduplicator = new DatasetDeduplicator();
  }

  public analyzeDuplicates(
    train: MLTaskSample[],
    val: MLTaskSample[],
    test: MLTaskSample[]
  ): DuplicateAuditResult {
    const all = [...train, ...val, ...test];
    const dummySamples = all.map((s) => ({
      sampleId: s.sampleId,
      prompt: String(s.labels?.rootClass || 'prompt'),
      sketch: { canvasObjects: s.inputFeatures?.canvasObjectCount ? [{ kind: 'box' }] : [] }
    }));

    const { matches } = this.deduplicator.processDuplicates(dummySamples as any);

    let exactDuplicates = 0;
    let nearDuplicates = 0;
    let crossSplitDuplicates = 0;
    let crossSourceDuplicates = 0;
    const duplicateExamples: string[] = [];

    const splitMap = new Map<string, string>();
    const sourceMap = new Map<string, string>();
    for (const s of train) { splitMap.set(s.sampleId, 'train'); sourceMap.set(s.sampleId, s.sourceDataset); }
    for (const s of val) { splitMap.set(s.sampleId, 'validation'); sourceMap.set(s.sampleId, s.sourceDataset); }
    for (const s of test) { splitMap.set(s.sampleId, 'test'); sourceMap.set(s.sampleId, s.sourceDataset); }

    for (const m of matches) {
      if (m.matchType === 'exact') exactDuplicates++;
      else nearDuplicates++;

      const splitA = splitMap.get(m.sampleId);
      const splitB = splitMap.get(m.duplicateOfSampleId);
      if (splitA && splitB && splitA !== splitB) {
        crossSplitDuplicates++;
        duplicateExamples.push(`${m.sampleId} (${splitA}) <-> ${m.duplicateOfSampleId} (${splitB})`);
      }

      const srcA = sourceMap.get(m.sampleId);
      const srcB = sourceMap.get(m.duplicateOfSampleId);
      if (srcA && srcB && srcA !== srcB) {
        crossSourceDuplicates++;
      }
    }

    return {
      exactDuplicates,
      nearDuplicates,
      crossSplitDuplicates,
      crossSourceDuplicates,
      duplicateExamples
    };
  }
}
