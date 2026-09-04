import { LayoutLeakageAuditResult } from './LayoutAuditTypes';
import { LayoutPredictionFeatureLeakageGuard } from '../../features/layout-prediction/LayoutPredictionFeatureLeakageGuard';
import { LayoutPredictionFeatureExtractor } from '../../features/layout-prediction/LayoutPredictionFeatureExtractor';

export class LayoutLeakageAudit {
  private featureLeakageGuard: LayoutPredictionFeatureLeakageGuard;
  private extractor: LayoutPredictionFeatureExtractor;

  constructor() {
    this.featureLeakageGuard = new LayoutPredictionFeatureLeakageGuard();
    this.extractor = new LayoutPredictionFeatureExtractor();
  }

  public auditLeakage(): LayoutLeakageAuditResult {
    // 1. Audit representative sample feature vector for prohibited fields
    const mockSample = {
      sampleId: 'leakage_test_sample_1',
      provenance: { sourceName: 'RICO' },
      sourceDataset: 'RICO',
      metadata: { screenId: 'screen_123', viewportWidth: 360, viewportHeight: 640 },
      layers: [{}, {}, {}]
    };

    const vector = this.extractor.extractAllFeatures(mockSample);
    const leakageReport = this.featureLeakageGuard.auditFeatureVector(vector);

    const targetLabelLeakage = leakageReport.prohibitedMatches.some(m => m.includes('layoutLabel') || m.includes('targetLabel'));
    const labelConfidenceLeakage = leakageReport.prohibitedMatches.some(m => m.includes('labelConfidence'));
    const datasetIdentityLeakage = leakageReport.prohibitedMatches.some(m => m.includes('sourceDataset'));
    const sourceRecordIdLeakage = leakageReport.prohibitedMatches.some(m => m.includes('sourceRecordId'));
    const screenIdLeakage = leakageReport.prohibitedMatches.some(m => m.includes('screenId'));
    const documentIdLeakage = leakageReport.prohibitedMatches.some(m => m.includes('documentId'));
    const splitMembershipLeakage = leakageReport.prohibitedMatches.some(m => m.includes('split'));
    const postOutcomeLeakage = leakageReport.prohibitedMatches.some(m => m.includes('postOutcome'));

    return {
      targetLabelLeakage,
      labelConfidenceLeakage,
      datasetIdentityLeakage,
      sourceRecordIdLeakage,
      screenIdLeakage,
      documentIdLeakage,
      splitMembershipLeakage,
      postOutcomeLeakage,
      leakageStatus: leakageReport.leakageStatus === 'PASSED' ? 'PASSED' : 'FAILED',
      prohibitedMatchesCount: leakageReport.rejectedFieldsCount,
      warnings: []
    };
  }
}
