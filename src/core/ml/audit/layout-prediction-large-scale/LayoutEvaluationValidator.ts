import { EvaluationSample } from './LayoutEvaluationTypes';

export class LayoutEvaluationValidator {
  private validClasses = [
    'single_column', 'two_column', 'three_column', 'grid', 'sidebar', 'stack', 'centered', 'other'
  ];

  public validatePopulation(samples: EvaluationSample[]): {
    validCount: number;
    invalidCount: number;
    status: 'PASSED' | 'FAILED';
  } {
    let invalidCount = 0;

    for (const s of samples) {
      if (!s.sampleId || !s.sourceDataset || !s.groupKey) invalidCount++;
      if (!s.label || !this.validClasses.includes(s.label)) invalidCount++;
      if (!s.features || Object.keys(s.features).length === 0) invalidCount++;
    }

    return {
      validCount: samples.length - invalidCount,
      invalidCount,
      status: invalidCount === 0 ? 'PASSED' : 'FAILED'
    };
  }
}
