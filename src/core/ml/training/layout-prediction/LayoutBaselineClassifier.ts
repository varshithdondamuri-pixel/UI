import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';
import { ExtractedFeatureVector } from '../../features/layout-prediction/LayoutPredictionFeatureTypes';
import { ModelType } from './LayoutTrainingTypes';

export interface TrainingSample {
  sampleId: string;
  featureVector: ExtractedFeatureVector;
  label: LayoutClassLabel;
  sourceDataset: string;
}

export class LayoutBaselineClassifier {
  private modelType: ModelType;
  private randomSeed: number;
  private majorityClass: LayoutClassLabel = 'single_column';
  private classList: LayoutClassLabel[] = [
    'single_column', 'two_column', 'three_column', 'grid', 'sidebar', 'stack', 'centered', 'other'
  ];
  private classPriors: Record<string, number> = {};
  private featureMeans: Record<string, number[]> = {};
  private featureVars: Record<string, number[]> = {};

  constructor(modelType: ModelType = 'supervised_classical', randomSeed: number = 42) {
    this.modelType = modelType;
    this.randomSeed = randomSeed;
  }

  public getRandomSeed(): number {
    return this.randomSeed;
  }

  public fit(trainingSamples: TrainingSample[]): void {
    if (trainingSamples.length === 0) return;

    // 1. Determine Majority Class (Train Only)
    const labelCounts: Record<string, number> = {};
    for (const s of trainingSamples) {
      labelCounts[s.label] = (labelCounts[s.label] || 0) + 1;
    }

    let maxCnt = -1;
    let majCls: LayoutClassLabel = 'single_column';
    for (const [cls, cnt] of Object.entries(labelCounts)) {
      if (cnt > maxCnt) {
        maxCnt = cnt;
        majCls = cls as LayoutClassLabel;
      }
    }
    this.majorityClass = majCls;

    if (this.modelType === 'reference_majority') {
      return; // Baseline A fits majority class only
    }

    // 2. Fit Supervised Classical Classifier (Baseline B)
    const totalSamples = trainingSamples.length;
    const classData: Record<string, number[][]> = {};

    for (const s of trainingSamples) {
      if (!classData[s.label]) classData[s.label] = [];
      const numVals = Object.values(s.featureVector.features)
        .map(f => typeof f.value === 'number' ? f.value : 0);
      classData[s.label].push(numVals);
    }

    for (const cls of this.classList) {
      const rows = classData[cls] || [];
      this.classPriors[cls] = rows.length > 0 ? rows.length / totalSamples : 1 / this.classList.length;

      if (rows.length === 0) {
        this.featureMeans[cls] = new Array(100).fill(0);
        this.featureVars[cls] = new Array(100).fill(1.0);
        continue;
      }

      const numFeats = rows[0].length;
      const means = new Array(numFeats).fill(0);
      const vars = new Array(numFeats).fill(0);

      for (const row of rows) {
        for (let i = 0; i < numFeats; i++) {
          means[i] += row[i];
        }
      }
      for (let i = 0; i < numFeats; i++) {
        means[i] /= rows.length;
      }

      for (const row of rows) {
        for (let i = 0; i < numFeats; i++) {
          vars[i] += Math.pow(row[i] - means[i], 2);
        }
      }
      for (let i = 0; i < numFeats; i++) {
        vars[i] = Math.max(vars[i] / rows.length, 1e-4);
      }

      this.featureMeans[cls] = means;
      this.featureVars[cls] = vars;
    }
  }

  public predict(sample: TrainingSample): LayoutClassLabel {
    if (this.modelType === 'reference_majority') {
      return this.majorityClass;
    }

    // Deterministic Classical Inference (Baseline B)
    const numVals = Object.values(sample.featureVector.features)
      .map(f => typeof f.value === 'number' ? f.value : 0);

    let bestClass: LayoutClassLabel = 'single_column';
    let bestScore = -Infinity;

    for (const cls of this.classList) {
      const prior = this.classPriors[cls] || 0.125;
      let logLikelihood = Math.log(prior);

      const means = this.featureMeans[cls] || [];
      const variances = this.featureVars[cls] || [];

      for (let i = 0; i < Math.min(numVals.length, means.length); i++) {
        const x = numVals[i];
        const m = means[i];
        const v = variances[i];
        // Gaussian log likelihood
        const logProb = -0.5 * Math.log(2 * Math.PI * v) - Math.pow(x - m, 2) / (2 * v);
        logLikelihood += logProb;
      }

      if (logLikelihood > bestScore) {
        bestScore = logLikelihood;
        bestClass = cls;
      }
    }

    return bestClass;
  }
}
