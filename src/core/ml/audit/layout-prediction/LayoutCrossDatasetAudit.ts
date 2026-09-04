import { LayoutCrossDatasetAuditResult } from './LayoutAuditTypes';

export class LayoutCrossDatasetAudit {
  public auditCrossDataset(): LayoutCrossDatasetAuditResult {
    const datasets = ['RICO', 'WebCode2M', 'WebUI', 'Screen2Words'];
    const transfers: { trainDataset: string; testDataset: string; status: 'blocked' }[] = [];

    for (const trainDs of datasets) {
      for (const testDs of datasets) {
        if (trainDs !== testDs) {
          transfers.push({
            trainDataset: trainDs,
            testDataset: testDs,
            status: 'blocked'
          });
        }
      }
    }

    return {
      status: 'blocked',
      reason: 'Cross-dataset transfer requires additional model fitting, which is outside this audit-only phase.',
      transferEvaluations: transfers
    };
  }
}
