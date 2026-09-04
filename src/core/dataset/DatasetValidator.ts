import { FullDesignSample } from './DatasetTypes';
import { isValidCategory } from './DatasetSchema';

export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export class DatasetValidator {
  public validateSample(sample: Partial<FullDesignSample>): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // 1. Missing IDs
    if (!sample.sampleId) {
      errors.push({ code: 'MISSING_ID', field: 'sampleId', message: 'Sample ID is missing', severity: 'error' });
    }

    // 2. Missing Dataset Version
    if (!sample.datasetVersion) {
      errors.push({ code: 'MISSING_VERSION', field: 'datasetVersion', message: 'Dataset version is missing', severity: 'error' });
    }

    // 3. Category Validation
    if (!sample.category) {
      errors.push({ code: 'MISSING_CATEGORY', field: 'category', message: 'Category is missing', severity: 'error' });
    } else if (!isValidCategory(sample.category)) {
      errors.push({ code: 'INVALID_CATEGORY', field: 'category', message: `Invalid category '${sample.category}'`, severity: 'error' });
    }

    // 4. Missing Provenance
    if (!sample.provenance) {
      errors.push({ code: 'MISSING_PROVENANCE', field: 'provenance', message: 'Provenance data is missing', severity: 'error' });
    } else {
      if (!sample.provenance.sourceType) {
        errors.push({ code: 'INVALID_PROVENANCE', field: 'provenance.sourceType', message: 'Provenance sourceType is missing', severity: 'error' });
      }
      if (!sample.provenance.license) {
        errors.push({ code: 'INVALID_PROVENANCE', field: 'provenance.license', message: 'Provenance license is missing', severity: 'error' });
      }
    }

    // 5. Invalid Coordinates & Sketch Validation
    if (sample.sketch) {
      if (sample.sketch.positions && Array.isArray(sample.sketch.positions)) {
        for (let i = 0; i < sample.sketch.positions.length; i++) {
          const pos = sample.sketch.positions[i];
          if (pos === null || pos === undefined || typeof pos.x !== 'number' || typeof pos.y !== 'number' || isNaN(pos.x) || isNaN(pos.y)) {
            errors.push({ code: 'INVALID_COORDINATES', field: `sketch.positions[${i}]`, message: 'Position coordinates must be valid numbers', severity: 'error' });
          }
        }
      }
    } else {
      warnings.push({ code: 'MISSING_SKETCH', field: 'sketch', message: 'Sketch sample is empty', severity: 'warning' });
    }

    // 6. Invalid Scores
    if (typeof sample.qualityScore === 'number') {
      if (sample.qualityScore < 0 || sample.qualityScore > 100 || isNaN(sample.qualityScore)) {
        errors.push({ code: 'INVALID_SCORE', field: 'qualityScore', message: 'Quality score must be between 0 and 100', severity: 'error' });
      }
    } else {
      warnings.push({ code: 'MISSING_SCORE', field: 'qualityScore', message: 'Quality score is missing', severity: 'warning' });
    }

    if (sample.evaluation) {
      const evalScores = [
        sample.evaluation.visualQuality,
        sample.evaluation.uxQuality,
        sample.evaluation.accessibility,
        sample.evaluation.overallQuality
      ];
      for (const score of evalScores) {
        if (typeof score === 'number' && (score < 0 || score > 100 || isNaN(score))) {
          errors.push({ code: 'INVALID_SCORE', field: 'evaluation', message: 'Evaluation metric scores must be between 0 and 100', severity: 'error' });
        }
      }
    }

    // 7. Duplicate Warning
    if (sample.isDuplicate) {
      warnings.push({ code: 'DUPLICATE_SAMPLE', field: 'isDuplicate', message: `Sample is marked as duplicate of ${sample.duplicateOfSampleId || 'another sample'}`, severity: 'warning' });
    }

    // 8. Inconsistent before/after states or invalid feedback
    if (sample.userChanges && Array.isArray(sample.userChanges) && sample.userChanges.length > 0) {
      if (!sample.selectedVisualDesign && !sample.finalDesign) {
        warnings.push({ code: 'INCONSISTENT_STATE', field: 'finalDesign', message: 'User changes exist but final design is missing', severity: 'warning' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
