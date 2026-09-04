import { DatasetSample } from './MLTypes';

export interface MLDatasetValidationIssue {
  id: string;
  code: 'MISSING_FIELD' | 'CORRUPT_SAMPLE' | 'DUPLICATE_ENTRY' | 'INVALID_LABEL';
  message: string;
  severity: 'error' | 'warning';
  sampleId?: string;
}

export class DatasetValidator {
  public validateSamples(samples: DatasetSample[]): { isValid: boolean; issues: MLDatasetValidationIssue[] } {
    const issues: MLDatasetValidationIssue[] = [];
    const ids = new Set<string>();
    let counter = 1;

    for (const sample of samples) {
      if (ids.has(sample.id)) {
        issues.push({
          id: `mldv-${counter++}`,
          code: 'DUPLICATE_ENTRY',
          message: `Duplicate sample ID '${sample.id}' detected.`,
          severity: 'error',
          sampleId: sample.id
        });
      } else {
        ids.add(sample.id);
      }

      if (!sample.industry || !sample.style) {
        issues.push({
          id: `mldv-${counter++}`,
          code: 'MISSING_FIELD',
          message: `Sample '${sample.id}' missing industry or style label.`,
          severity: 'warning',
          sampleId: sample.id
        });
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'error');
    return { isValid: !hasErrors, issues };
  }
}
