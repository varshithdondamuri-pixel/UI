import { UserFeedbackData } from './FeedbackTypes';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class FeedbackValidator {
  public validateFeedback(data: UserFeedbackData): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data) {
      return { isValid: false, errors: ['Feedback data object is null or undefined'], warnings: [] };
    }

    // Check ratings
    data.ratings.forEach((r, idx) => {
      if (r.rating < 1 || r.rating > 5) {
        errors.push(`Rating at index ${idx} has invalid value: ${r.rating}. Expected 1-5.`);
      }
      if (!r.designId) {
        errors.push(`Rating at index ${idx} missing designId reference.`);
      }
    });

    // Check explicit feedback items
    data.explicitItems.forEach((item, idx) => {
      if (!item.id || !item.designId) {
        errors.push(`Explicit feedback item ${idx} missing ID or designId.`);
      }
      if (item.comment) {
        if (/password|secret|bearer/i.test(item.comment)) {
          warnings.push(`Explicit feedback comment ${item.id} contained potential credential keyword.`);
        }
      }
    });

    // Check timestamps
    if (data.lastUpdated <= 0) {
      warnings.push('Feedback lastUpdated timestamp is invalid or zero.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
