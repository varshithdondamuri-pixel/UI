import { EvaluationErrorRecord } from './LayoutV02FinalReviewTypes';

export class LayoutV02ErrorSeverity {
  public auditSeverity(errors: EvaluationErrorRecord[]): {
    minor: number;
    moderate: number;
    major: number;
    critical: number;
    percentages: {
      minor: number;
      moderate: number;
      major: number;
      critical: number;
    };
    criticalErrorPresent: boolean;
  } {
    let minor = 0;
    let moderate = 0;
    let major = 0;
    let critical = 0;

    for (const e of errors) {
      if (e.severity === 'minor') minor++;
      else if (e.severity === 'moderate') moderate++;
      else if (e.severity === 'major') major++;
      else if (e.severity === 'critical') critical++;
    }

    const total = errors.length || 1;

    return {
      minor,
      moderate,
      major,
      critical,
      percentages: {
        minor: parseFloat((minor / total).toFixed(4)),
        moderate: parseFloat((moderate / total).toFixed(4)),
        major: parseFloat((major / total).toFixed(4)),
        critical: parseFloat((critical / total).toFixed(4))
      },
      criticalErrorPresent: critical > 0
    };
  }
}
