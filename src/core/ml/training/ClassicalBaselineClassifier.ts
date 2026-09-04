import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';

export interface ExtractedFeatureVector {
  sampleId: string;
  features: number[];
  label: string;
}

export class ClassicalBaselineClassifier {
  private modelType: 'reference_majority' | 'naive_bayes_tabular';
  private randomSeed: number;
  private majorityClass: string = 'other';
  private classPrior: Map<string, number> = new Map();
  private featureMeans: Map<string, number[]> = new Map();
  private featureVars: Map<string, number[]> = new Map();
  private classList: string[] = [];

  constructor(modelType: 'reference_majority' | 'naive_bayes_tabular' = 'naive_bayes_tabular', randomSeed: number = 42) {
    this.modelType = modelType;
    this.randomSeed = randomSeed;
  }

  public getModelType(): string {
    return this.modelType === 'reference_majority' ? 'Baseline A (Reference Majority Class)' : 'Baseline B (Supervised Naive Bayes Classifier)';
  }

  public getRandomSeed(): number {
    return this.randomSeed;
  }

  public extractFeatureVector(sample: MLTaskSample): ExtractedFeatureVector {
    const f = sample.inputFeatures || {};
    const canvasObjectCount = Number(f.canvasObjectCount || 0);
    const hasImage = f.hasImageScreenshot ? 1 : 0;
    const textListLength = Number(f.textListLength || 0);
    const vpWidth = Number(f.viewport?.width || 1280);
    const vpHeight = Number(f.viewport?.height || 800);
    const elementCount = Number(sample.labels?.elementCount || 1);

    const featureVector = [canvasObjectCount, hasImage, textListLength, vpWidth / 1000, vpHeight / 1000, elementCount];
    const label = String(sample.labels?.rootClass || sample.labels?.layoutLabel || sample.labels?.primaryComponent || sample.labels?.styleLabel || 'default_class');

    return {
      sampleId: sample.sampleId,
      features: featureVector,
      label
    };
  }

  public fit(trainingSamples: MLTaskSample[]): void {
    if (trainingSamples.length === 0) return;

    const dataset = trainingSamples.map((s) => this.extractFeatureVector(s));
    const labelCounts = new Map<string, number>();

    for (const d of dataset) {
      labelCounts.set(d.label, (labelCounts.get(d.label) || 0) + 1);
    }

    let maxCnt = 0;
    let majCls = 'other';
    for (const [cls, cnt] of labelCounts.entries()) {
      if (cnt > maxCnt) {
        maxCnt = cnt;
        majCls = cls;
      }
    }
    this.majorityClass = majCls;
    this.classList = Array.from(labelCounts.keys());

    if (this.modelType === 'reference_majority') {
      return;
    }

    // Baseline B: Fit Supervised Naive Bayes
    const numFeatures = dataset[0]?.features.length || 6;
    const classData = new Map<string, number[][]>();

    for (const d of dataset) {
      if (!classData.has(d.label)) classData.set(d.label, []);
      classData.get(d.label)!.push(d.features);
    }

    const totalSamples = dataset.length;

    for (const cls of this.classList) {
      const rows = classData.get(cls) || [];
      const prior = rows.length / totalSamples;
      this.classPrior.set(cls, prior);

      const means: number[] = new Array(numFeatures).fill(0);
      for (const row of rows) {
        for (let i = 0; i < numFeatures; i++) {
          means[i] += row[i];
        }
      }
      for (let i = 0; i < numFeatures; i++) {
        means[i] = rows.length > 0 ? means[i] / rows.length : 0;
      }
      this.featureMeans.set(cls, means);

      const vars: number[] = new Array(numFeatures).fill(0);
      for (const row of rows) {
        for (let i = 0; i < numFeatures; i++) {
          vars[i] += Math.pow(row[i] - means[i], 2);
        }
      }
      for (let i = 0; i < numFeatures; i++) {
        vars[i] = rows.length > 1 ? vars[i] / (rows.length - 1) + 1e-4 : 1e-4;
      }
      this.featureVars.set(cls, vars);
    }
  }

  public predictSample(sample: MLTaskSample): string {
    if (this.modelType === 'reference_majority') {
      return this.majorityClass;
    }

    const featureVector = this.extractFeatureVector(sample).features;
    let bestClass = this.majorityClass;
    let maxLogProb = -Infinity;

    for (const cls of this.classList) {
      const prior = this.classPrior.get(cls) || 1e-4;
      let logProb = Math.log(prior);

      const means = this.featureMeans.get(cls) || [];
      const vars = this.featureVars.get(cls) || [];

      for (let i = 0; i < featureVector.length; i++) {
        const x = featureVector[i];
        const mean = means[i] || 0;
        const v = vars[i] || 1e-4;
        const prob = (1 / Math.sqrt(2 * Math.PI * v)) * Math.exp(-Math.pow(x - mean, 2) / (2 * v));
        logProb += Math.log(Math.max(prob, 1e-8));
      }

      if (logProb > maxLogProb) {
        maxLogProb = logProb;
        bestClass = cls;
      }
    }

    return bestClass;
  }

  public predictDataset(samples: MLTaskSample[]): { sampleId: string; actual: string; predicted: string }[] {
    return samples.map((s) => ({
      sampleId: s.sampleId,
      actual: String(s.labels?.rootClass || s.labels?.layoutLabel || s.labels?.primaryComponent || s.labels?.styleLabel || 'default_class'),
      predicted: this.predictSample(s)
    }));
  }
}
