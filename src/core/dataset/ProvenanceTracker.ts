import { ExternalDatasetImportConfig, ProvenanceData } from './DatasetTypes';

export class ProvenanceTracker {
  private defaultVersion: string;

  constructor(defaultVersion: string = 'v0.1') {
    this.defaultVersion = defaultVersion;
  }

  public createFirstPartyProvenance(customVersion?: string): ProvenanceData {
    return {
      sourceType: 'first_party',
      sourceDataset: 'ai_ui_designer',
      sourceDatasetVersion: customVersion || this.defaultVersion,
      sourceUrl: 'https://ai-ui-designer.internal',
      license: 'proprietary',
      licenseUrl: 'https://ai-ui-designer.internal/license',
      collectionDate: new Date().toISOString(),
      transformationVersion: '1.0.0',
      sampleOrigin: 'user_interactive_session'
    };
  }

  public createExternalProvenance(config: ExternalDatasetImportConfig): ProvenanceData {
    return {
      sourceType: 'external',
      sourceDataset: config.sourceName,
      sourceDatasetVersion: config.sourceVersion,
      sourceUrl: config.sourceUrl || '',
      license: config.license,
      licenseUrl: config.licenseUrl || '',
      collectionDate: new Date().toISOString(),
      transformationVersion: '1.0.0',
      sampleOrigin: config.isEvaluationOnly ? 'external_evaluation_benchmark' : 'external_training_corpus'
    };
  }

  public validateProvenance(provenance: ProvenanceData | null | undefined): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!provenance) {
      return { isValid: false, errors: ['Provenance object is missing'] };
    }

    if (!provenance.sourceType) errors.push('Missing sourceType');
    if (!provenance.sourceDataset) errors.push('Missing sourceDataset');
    if (!provenance.sourceDatasetVersion) errors.push('Missing sourceDatasetVersion');
    if (!provenance.license) errors.push('Missing license');
    if (!provenance.collectionDate) errors.push('Missing collectionDate');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
