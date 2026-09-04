import { LayoutEvaluationDatasetSampler } from './LayoutEvaluationDatasetSampler';
import { LayoutEvaluationGroupSelector } from './LayoutEvaluationGroupSelector';
import { EvaluationSample } from './LayoutEvaluationTypes';

export class LayoutEvaluationPopulationBuilder {
  private sampler: LayoutEvaluationDatasetSampler;
  private groupSelector: LayoutEvaluationGroupSelector;

  constructor() {
    this.sampler = new LayoutEvaluationDatasetSampler();
    this.groupSelector = new LayoutEvaluationGroupSelector();
  }

  public buildHeldOutPopulation(): {
    samples: EvaluationSample[];
    isolation: {
      trainOverlap: number;
      validationOverlap: number;
      testOverlap: number;
      uniqueEvaluationGroups: number;
    };
  } {
    const samples = this.sampler.sampleEvaluationPopulation();
    const evalGroups = samples.map(s => s.groupKey);

    // Verify isolation against mock train/val/test group keys
    const trainGroups = Array.from({ length: 320 }, (_, i) => `group_${i}`);
    const valGroups = Array.from({ length: 40 }, (_, i) => `group_${i + 320}`);
    const testGroups = Array.from({ length: 40 }, (_, i) => `group_${i + 360}`);

    const iso = this.groupSelector.verifyGroupIsolation(evalGroups, trainGroups, valGroups, testGroups);

    return {
      samples,
      isolation: {
        trainOverlap: iso.trainOverlap,
        validationOverlap: iso.validationOverlap,
        testOverlap: iso.testOverlap,
        uniqueEvaluationGroups: new Set(evalGroups).size
      }
    };
  }
}
