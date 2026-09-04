import { TypedEventBus } from '../events/EventBus';
import { ProprietaryDatasetProvider } from '../dataset/DatasetTypes';
import { MLDatasetAdapter } from './MLDatasetAdapter';
import { MLDataLeakageGuard } from './MLDataLeakageGuard';
import { MLFeatureExtractor } from './MLFeatureExtractor';
import { MLFeatureNormalizer } from './MLFeatureNormalizer';
import { MLLabelEncoder } from './MLLabelEncoder';
import { MLTaskRegistry } from './MLTaskRegistry';
import { MLTrainingBackend, ConfigurableTrainingBackend } from './MLTrainingConfig';
import { MLTrainingScheduler } from './MLTrainingScheduler';
import { MLBaselineEngine } from './MLBaselineEngine';
import { MLEvaluationEngine } from './MLEvaluationEngine';
import { MLExperimentRegistry } from './MLExperimentRegistry';
import { MLModelRegistry } from './MLModelRegistry';
import { MLPredictionEngine } from './MLPredictionEngine';
import { MLValidationGate } from './MLValidation';
import { MLTrainingStatisticsTracker } from './MLTrainingStatistics';
import { MLIntelligenceBundle } from './MLTypes';
import { MLTaskIdentifier } from './MLTaskTypes';

export class MLIntelligenceEngine {
  private eventBus: TypedEventBus;
  private taskRegistry: MLTaskRegistry;
  private datasetAdapter?: MLDatasetAdapter;
  private leakageGuard: MLDataLeakageGuard;
  private featureExtractor: MLFeatureExtractor;
  private featureNormalizer: MLFeatureNormalizer;
  private labelEncoder: MLLabelEncoder;
  private trainingScheduler: MLTrainingScheduler;
  private baselineEngine: MLBaselineEngine;
  private evaluationEngine: MLEvaluationEngine;
  private experimentRegistry: MLExperimentRegistry;
  private modelRegistry: MLModelRegistry;
  private predictionEngine: MLPredictionEngine;
  private validationGate: MLValidationGate;
  private statisticsTracker: MLTrainingStatisticsTracker;

  constructor(eventBus: TypedEventBus, datasetProvider?: ProprietaryDatasetProvider, backend?: MLTrainingBackend) {
    this.eventBus = eventBus;
    this.taskRegistry = new MLTaskRegistry();
    if (datasetProvider) {
      this.datasetAdapter = new MLDatasetAdapter(datasetProvider);
    }
    this.leakageGuard = new MLDataLeakageGuard();
    this.featureExtractor = new MLFeatureExtractor();
    this.featureNormalizer = new MLFeatureNormalizer();
    this.labelEncoder = new MLLabelEncoder();
    this.trainingScheduler = new MLTrainingScheduler(backend || new ConfigurableTrainingBackend());
    this.baselineEngine = new MLBaselineEngine();
    this.evaluationEngine = new MLEvaluationEngine();
    this.experimentRegistry = new MLExperimentRegistry();
    this.modelRegistry = new MLModelRegistry();
    this.predictionEngine = new MLPredictionEngine(this.modelRegistry);
    this.validationGate = new MLValidationGate();
    this.statisticsTracker = new MLTrainingStatisticsTracker();
  }

  public getEventBus(): TypedEventBus {
    return this.eventBus;
  }

  public connectDatasetProvider(provider: ProprietaryDatasetProvider) {
    this.datasetAdapter = new MLDatasetAdapter(provider);
  }

  public getTaskRegistry(): MLTaskRegistry {
    return this.taskRegistry;
  }

  public getDatasetAdapter(): MLDatasetAdapter | undefined {
    return this.datasetAdapter;
  }

  public getLeakageGuard(): MLDataLeakageGuard {
    return this.leakageGuard;
  }

  public getFeatureExtractor(): MLFeatureExtractor {
    return this.featureExtractor;
  }

  public getFeatureNormalizer(): MLFeatureNormalizer {
    return this.featureNormalizer;
  }

  public getLabelEncoder(): MLLabelEncoder {
    return this.labelEncoder;
  }

  public getTrainingScheduler(): MLTrainingScheduler {
    return this.trainingScheduler;
  }

  public getBaselineEngine(): MLBaselineEngine {
    return this.baselineEngine;
  }

  public getEvaluationEngine(): MLEvaluationEngine {
    return this.evaluationEngine;
  }

  public getExperimentRegistry(): MLExperimentRegistry {
    return this.experimentRegistry;
  }

  public getModelRegistry(): MLModelRegistry {
    return this.modelRegistry;
  }

  public getPredictionEngine(): MLPredictionEngine {
    return this.predictionEngine;
  }

  public getValidationGate(): MLValidationGate {
    return this.validationGate;
  }

  public getStatisticsTracker(): MLTrainingStatisticsTracker {
    return this.statisticsTracker;
  }

  /**
   * Generates ML Intelligence Bundle for Phase 8 AI Orchestration context, Phase 6 Knowledge & Phase 11 AI Agent.
   */
  public generatePredictionBundle(task?: MLTaskIdentifier, inputFeatures?: any): MLIntelligenceBundle {
    const targetTask = task || 'layout_prediction';
    const predResponse = this.predictionEngine.predict(targetTask, inputFeatures);

    if (predResponse.status === 'unavailable') {
      return {
        predictions: {},
        confidence: 0,
        modelVersions: {},
        featureVersions: {},
        taskResults: {},
        evaluationStatus: 'no_approved_model',
        availability: 'unavailable',
        unavailableReason: 'model_not_available',
        timestamp: Date.now()
      };
    }

    return {
      predictions: { [targetTask]: predResponse.prediction },
      confidence: predResponse.confidence || 0,
      modelVersions: { [targetTask]: predResponse.modelVersion || 'v0.1' },
      featureVersions: { [targetTask]: predResponse.featureVersion || 'v1.0' },
      taskResults: { [targetTask]: predResponse.prediction },
      evaluationStatus: 'evaluated',
      availability: 'available',
      timestamp: Date.now()
    };
  }

  public getStatistics() {
    const datasetSamplesCount = this.datasetAdapter ? this.datasetAdapter.getTrainingSamples().length : 0;
    return this.statisticsTracker.computeSummary(
      this.taskRegistry.getAllTasks().length,
      datasetSamplesCount,
      this.trainingScheduler.getAllJobs(),
      this.experimentRegistry.getAllExperiments(),
      this.modelRegistry.getAllModels()
    );
  }
}
