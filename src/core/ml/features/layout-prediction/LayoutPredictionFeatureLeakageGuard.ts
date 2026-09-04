import { ExtractedFeatureVector, FeatureLeakageAuditReport } from './LayoutPredictionFeatureTypes';

export class LayoutPredictionFeatureLeakageGuard {
  private static readonly PROHIBITED_FIELDS = [
    'layoutLabel',
    'targetLabel',
    'normalizedLayoutLabel',
    'derivedLayoutLabel',
    'labelConfidence',
    'labelSource',
    'derivationEvidence',
    'sourceDataset',
    'datasetName',
    'sourceRecordId',
    'screenId',
    'documentId',
    'split',
    'splitMembership',
    'train/validation/test membership',
    'modelPrediction',
    'evaluationResult',
    'postOutcomeMetadata',
    'approvalMetadata'
  ];

  public auditFeatureVector(vector: ExtractedFeatureVector): FeatureLeakageAuditReport {
    const prohibitedMatches: string[] = [];
    const keys = Object.keys(vector.features);

    for (const key of keys) {
      for (const prohibited of LayoutPredictionFeatureLeakageGuard.PROHIBITED_FIELDS) {
        if (key.toLowerCase().includes(prohibited.toLowerCase())) {
          prohibitedMatches.push(`Feature key '${key}' contains prohibited pattern '${prohibited}'`);
        }
      }
    }

    return {
      prohibitedFieldsChecked: LayoutPredictionFeatureLeakageGuard.PROHIBITED_FIELDS,
      rejectedFieldsCount: prohibitedMatches.length,
      leakageStatus: prohibitedMatches.length === 0 ? 'PASSED' : 'FAILED',
      prohibitedMatches
    };
  }

  public isProhibitedField(fieldName: string): boolean {
    const lower = fieldName.toLowerCase();
    return LayoutPredictionFeatureLeakageGuard.PROHIBITED_FIELDS.some(p => lower.includes(p.toLowerCase()));
  }
}
