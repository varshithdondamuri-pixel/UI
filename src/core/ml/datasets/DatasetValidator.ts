import { MLDatasetRecord } from './DatasetTypes';

export interface DatasetValidationIssue {
  id: string;
  code: 'MISSING_RECORD' | 'BROKEN_REFERENCE' | 'DUPLICATE_ID' | 'INVALID_CATEGORY';
  message: string;
  severity: 'error' | 'warning';
  recordId?: string;
}

export class DatasetValidator {
  public validate(records: MLDatasetRecord[]): { isValid: boolean; issues: DatasetValidationIssue[] } {
    const issues: DatasetValidationIssue[] = [];
    const ids = new Set<string>();
    let counter = 1;

    for (const r of records) {
      if (ids.has(r.id)) {
        issues.push({
          id: `dval-${counter++}`,
          code: 'DUPLICATE_ID',
          message: `Duplicate dataset record ID '${r.id}'.`,
          severity: 'error',
          recordId: r.id
        });
      } else {
        ids.add(r.id);
      }

      if (!r.title || !r.title.trim()) {
        issues.push({
          id: `dval-${counter++}`,
          code: 'MISSING_RECORD',
          message: `Record '${r.id}' is missing a title.`,
          severity: 'error',
          recordId: r.id
        });
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'error');
    return { isValid: !hasErrors, issues };
  }
}
