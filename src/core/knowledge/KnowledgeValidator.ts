import { KNOWLEDGE_CATEGORIES } from './KnowledgeCategories';
import {
  KnowledgeRecord,
  KnowledgeValidationIssue,
  KnowledgeValidationResult
} from './KnowledgeTypes';

export class KnowledgeValidator {
  /**
   * Validates a set of KnowledgeRecords for schema integrity, duplicate IDs,
   * broken relationships, invalid categories, and missing metadata.
   */
  public validate(records: KnowledgeRecord[]): KnowledgeValidationResult {
    const issues: KnowledgeValidationIssue[] = [];
    const recordIds = new Set<string>();
    let issueCounter = 1;

    // First pass: collect IDs and check duplicates / basic fields
    for (const record of records) {
      // 1. Duplicate ID check
      if (recordIds.has(record.id)) {
        issues.push({
          id: `kval-${issueCounter++}`,
          code: 'DUPLICATE_ID',
          message: `Duplicate Knowledge Record ID '${record.id}' detected.`,
          severity: 'error',
          recordId: record.id
        });
      } else {
        recordIds.add(record.id);
      }

      // 2. Missing metadata check
      if (!record.title || !record.title.trim()) {
        issues.push({
          id: `kval-${issueCounter++}`,
          code: 'MISSING_METADATA',
          message: `Record '${record.id}' is missing a title.`,
          severity: 'error',
          recordId: record.id
        });
      }

      if (!record.category) {
        issues.push({
          id: `kval-${issueCounter++}`,
          code: 'MISSING_METADATA',
          message: `Record '${record.id}' is missing a category classification.`,
          severity: 'error',
          recordId: record.id
        });
      } else if (!KNOWLEDGE_CATEGORIES[record.category]) {
        // 3. Invalid category check
        issues.push({
          id: `kval-${issueCounter++}`,
          code: 'INVALID_CATEGORY',
          message: `Record '${record.id}' specifies unknown category '${record.category}'.`,
          severity: 'error',
          recordId: record.id
        });
      }

      if (!record.version || !/^\d+\.\d+\.\d+$/.test(record.version)) {
        issues.push({
          id: `kval-${issueCounter++}`,
          code: 'VERSION_CONFLICT',
          message: `Record '${record.id}' has invalid semantic version format '${record.version}'. Expected x.y.z format.`,
          severity: 'warning',
          recordId: record.id
        });
      }
    }

    // Second pass: check broken relationship targets
    for (const record of records) {
      if (record.relationships && record.relationships.length > 0) {
        for (const rel of record.relationships) {
          if (!recordIds.has(rel.targetId)) {
            issues.push({
              id: `kval-${issueCounter++}`,
              code: 'BROKEN_RELATIONSHIP',
              message: `Record '${record.id}' references non-existent target ID '${rel.targetId}' in relationship '${rel.type}'.`,
              severity: 'warning',
              recordId: record.id
            });
          }
        }
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'error');

    return {
      isValid: !hasErrors,
      issues,
      totalChecked: records.length
    };
  }
}
