import * as fs from 'fs';
import * as path from 'path';
import { TaskPreparationEngine } from '../../dataset/preparation/TaskPreparationEngine';
import { MLExperimentRegistry } from '../MLExperimentRegistry';
import { MLModelRegistry } from '../MLModelRegistry';
import { MLPredictionEngine } from '../MLPredictionEngine';
import { MLTrainingJob } from '../MLTrainingJob';
import { ClassicalBaselineClassifier } from './ClassicalBaselineClassifier';
import { MetricsEvaluator } from './MetricsEvaluator';
import {
  BaselineComparison,
  MLTrainingConfiguration,
  ModelArtifact
} from './MLTrainingTypes';

export class BaselineTrainingPipeline {
  private preparationEngine: TaskPreparationEngine;
  private modelRegistry: MLModelRegistry;
  private experimentRegistry: MLExperimentRegistry;
  private predictionEngine: MLPredictionEngine;
  private evaluator: MetricsEvaluator;

  constructor(modelRegistry?: MLModelRegistry, experimentRegistry?: MLExperimentRegistry) {
    this.preparationEngine = new TaskPreparationEngine();
    this.modelRegistry = modelRegistry || new MLModelRegistry();
    this.experimentRegistry = experimentRegistry || new MLExperimentRegistry();
    this.predictionEngine = new MLPredictionEngine(this.modelRegistry);
    this.evaluator = new MetricsEvaluator();
  }

  public getModelRegistry(): MLModelRegistry {
    return this.modelRegistry;
  }

  public getPredictionEngine(): MLPredictionEngine {
    return this.predictionEngine;
  }

  public getExperimentRegistry(): MLExperimentRegistry {
    return this.experimentRegistry;
  }

  /**
   * Executes the Phase 13 training pipeline for ui_understanding.
   */
  public executeUIUnderstandingTraining(
    workspaceRoot: string = process.cwd()
  ): {
    job: MLTrainingJob;
    artifact: ModelArtifact;
    baselineComparison: BaselineComparison;
  } {
    // 1. Load prepared task dataset
    const preparedTasks = this.preparationEngine.prepareAllTargetTasks(workspaceRoot);
    const uiPrep = preparedTasks.ui_understanding;

    if (!uiPrep || !uiPrep.manifest.trainingReady) {
      throw new Error(`Task ui_understanding is not training-ready: ${uiPrep?.manifest.trainingBlockedReason}`);
    }

    const { train, validation, test } = uiPrep.samples;

    const config: MLTrainingConfiguration = {
      task: 'ui_understanding',
      datasetVersion: uiPrep.manifest.datasetVersion,
      featureVersion: uiPrep.manifest.featureVersion.featureVersionId,
      labelVersion: uiPrep.manifest.labelVersion.labelVersionId,
      modelType: 'Supervised Classical Naive Bayes Classifier',
      randomSeed: 42,
      hyperparameters: { laplaceSmoothing: 1e-4, priorStrategy: 'empirical' },
      trainingSplit: 'train (80%)',
      validationSplit: 'validation (10%)',
      testSplit: 'test (10%)',
      timestamp: new Date().toISOString(),
      codeVersion: 'Phase-13-v0.1',
      environment: 'TypeScript Supervised Runtime'
    };

    // 2. Initialize MLTrainingJob and step states
    const jobId = `job_ui_understanding_${Date.now()}`;
    const job = new MLTrainingJob(jobId, 'ui_understanding', config.datasetVersion, config as any);
    job.setSampleCounts(train.length, validation.length, test.length);

    job.setState('preparing');
    job.setState('feature_extraction');

    // 3. Train Baseline A (Reference Majority Class)
    const baselineA = new ClassicalBaselineClassifier('reference_majority', 42);
    baselineA.fit(train);
    const predsA_test = baselineA.predictDataset(test);
    const metricsA_test = this.evaluator.evaluatePredictions(predsA_test);

    // 4. Train Baseline B (Supervised Naive Bayes)
    job.setState('training');
    const baselineB = new ClassicalBaselineClassifier('naive_bayes_tabular', 42);
    baselineB.fit(train);

    // 5. Evaluate Baseline B on Validation and Held-out Test
    job.setState('evaluating');
    const predsB_train = baselineB.predictDataset(train);
    const metricsB_train = this.evaluator.evaluatePredictions(predsB_train);

    const predsB_val = baselineB.predictDataset(validation);
    const metricsB_val = this.evaluator.evaluatePredictions(predsB_val);

    const predsB_test = baselineB.predictDataset(test);
    const metricsB_test = this.evaluator.evaluatePredictions(predsB_test);

    // 6. Compute Baseline Comparison
    const comparison: BaselineComparison = {
      baselineA: {
        name: 'Baseline A (Reference Majority Class)',
        modelType: baselineA.getModelType(),
        testAccuracy: metricsA_test.accuracy,
        testMacroF1: metricsA_test.macroF1
      },
      baselineB: {
        name: 'Baseline B (Supervised Naive Bayes)',
        modelType: baselineB.getModelType(),
        testAccuracy: metricsB_test.accuracy,
        testMacroF1: metricsB_test.macroF1
      },
      accuracyImprovement: parseFloat((metricsB_test.accuracy - metricsA_test.accuracy).toFixed(4)),
      macroF1Improvement: parseFloat((metricsB_test.macroF1 - metricsA_test.macroF1).toFixed(4)),
      isMLSuperior: metricsB_test.accuracy >= metricsA_test.accuracy
    };

    job.setMetrics({ accuracy: metricsB_test.accuracy, macroF1: metricsB_test.macroF1 });
    job.setModelVersion('ui-understanding-v0.1.0');
    job.setState('completed');

    // 7. Assemble ModelArtifact
    const artifact: ModelArtifact = {
      modelId: `ui-understanding-v0.1.0`,
      task: 'ui_understanding',
      modelType: config.modelType,
      datasetVersion: config.datasetVersion,
      featureVersion: config.featureVersion,
      labelVersion: config.labelVersion,
      trainingConfiguration: config,
      trainingMetrics: metricsB_train,
      validationMetrics: metricsB_val,
      testMetrics: metricsB_test,
      baselineComparison: comparison,
      classDistribution: uiPrep.manifest.classDistribution.classDistribution,
      featureSchema: {
        canvasObjectCount: 'number',
        hasImageScreenshot: 'boolean',
        textListLength: 'number',
        vpWidth: 'number',
        vpHeight: 'number',
        elementCount: 'number'
      },
      labelSchema: uiPrep.manifest.labelSchema,
      provenance: uiPrep.manifest.provenance,
      createdAt: new Date().toISOString(),
      status: 'candidate'
    };

    // 8. Write Model Artifact Files
    this.writeModelArtifactFiles(artifact, workspaceRoot);

    // 9. Register Candidate Model in MLModelRegistry
    const candRecord = this.modelRegistry.registerCandidateModel(
      'ui_understanding',
      'v0.1.0',
      config.datasetVersion,
      config.featureVersion,
      config
    );
    this.modelRegistry.evaluateModel(candRecord.modelId, {
      accuracy: metricsB_test.accuracy,
      macroF1: metricsB_test.macroF1
    });

    // 10. Register Experiment in MLExperimentRegistry
    this.experimentRegistry.createExperiment(
      'ui_understanding',
      config.datasetVersion,
      ['sketch_features', 'geometry_features'] as any,
      { modelType: config.modelType, seed: config.randomSeed, testAccuracy: metricsB_test.accuracy },
      'First real ML baseline experiment for ui_understanding'
    );

    return { job, artifact, baselineComparison: comparison };
  }

  private writeModelArtifactFiles(artifact: ModelArtifact, workspaceRoot: string): void {
    const modelDir = path.resolve(workspaceRoot, 'data set layer/models/ui_understanding/ui-understanding-v0.1.0');
    if (!fs.existsSync(modelDir)) {
      try {
        fs.mkdirSync(modelDir, { recursive: true });
      } catch {
        // ignore
      }
    }

    try {
      fs.writeFileSync(path.join(modelDir, 'model.json'), JSON.stringify(artifact, null, 2), 'utf-8');
      fs.writeFileSync(path.join(modelDir, 'training-config.json'), JSON.stringify(artifact.trainingConfiguration, null, 2), 'utf-8');
      fs.writeFileSync(path.join(modelDir, 'metrics.json'), JSON.stringify({ training: artifact.trainingMetrics, validation: artifact.validationMetrics, test: artifact.testMetrics, baselineComparison: artifact.baselineComparison }, null, 2), 'utf-8');
      fs.writeFileSync(path.join(modelDir, 'confusion-matrix.json'), JSON.stringify(artifact.testMetrics.confusionMatrix, null, 2), 'utf-8');
      fs.writeFileSync(path.join(modelDir, 'feature-schema.json'), JSON.stringify(artifact.featureSchema, null, 2), 'utf-8');
      fs.writeFileSync(path.join(modelDir, 'label-schema.json'), JSON.stringify(artifact.labelSchema, null, 2), 'utf-8');
      fs.writeFileSync(path.join(modelDir, 'provenance.json'), JSON.stringify(artifact.provenance, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }
}
