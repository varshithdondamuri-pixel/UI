import { TypedEventBus } from '../events/EventBus';
import { LayoutBlueprint } from '../planning/BlueprintTypes';
import { VisualDesignModel } from '../design/DesignTypes';
import { KnowledgeBundle } from '../knowledge/KnowledgeTypes';
import { DatasetRegistry } from './datasets/DatasetRegistry';
import { DatasetBuilder } from './DatasetBuilder';
import { EvaluationEngine } from './EvaluationEngine';
import { FeatureExtractor } from './FeatureExtractor';
import { FeatureStore } from './FeatureStore';
import { MLEventNotifier } from './MLEvents';
import { MLStatistics, MLStats } from './MLStatistics';
import { ModelRegistry } from './ModelRegistry';
import { PredictionEngine } from './PredictionEngine';
import { PredictionBundle } from './MLTypes';

export class MLCore {
  private eventBus: TypedEventBus;

  private modelRegistry = new ModelRegistry();
  private datasetRegistry = new DatasetRegistry();
  private featureExtractor = new FeatureExtractor();
  private featureStore = new FeatureStore();
  private predictionEngine = new PredictionEngine();
  private evaluationEngine = new EvaluationEngine();
  private datasetBuilder = new DatasetBuilder();
  private mlStatistics = new MLStatistics();
  private notifier: MLEventNotifier;

  private lastPredictionBundle: PredictionBundle | null = null;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
    this.notifier = new MLEventNotifier(this.eventBus);

    this.notifier.notifyModelLoaded('model-layout-predictor');
  }

  /**
   * Main Phase 7 entry point:
   * Extracts feature vector from active VisualDesignModel / Blueprint / KnowledgeBundle,
   * runs deterministic ML prediction models, captures dataset samples, and emits PREDICTION_FINISHED.
   */
  public processDesign(
    visualModel?: VisualDesignModel | null,
    blueprint?: LayoutBlueprint | null,
    bundle?: KnowledgeBundle | null
  ): PredictionBundle {
    this.notifier.notifyPredictionStarted();

    const features = this.featureExtractor.extractFeatures(visualModel, blueprint, bundle);
    this.featureStore.storeFeatures(features);

    const predictionBundle = this.predictionEngine.generatePredictions(features);
    this.lastPredictionBundle = predictionBundle;

    // Automatically capture sample for dataset building
    this.datasetBuilder.captureSample(
      features.industry,
      features.style,
      features,
      undefined,
      true
    );

    this.evaluationEngine.evaluateModel('model-quality-predictor', [predictionBundle.totalLatencyMs]);

    this.notifier.notifyPredictionFinished(predictionBundle);

    return predictionBundle;
  }

  public getModelRegistry(): ModelRegistry {
    return this.modelRegistry;
  }

  public getDatasetRegistry(): DatasetRegistry {
    return this.datasetRegistry;
  }

  public getPredictionEngine(): PredictionEngine {
    return this.predictionEngine;
  }

  public getLastPredictionBundle(): PredictionBundle | null {
    return this.lastPredictionBundle;
  }

  public getMLStats(): MLStats {
    return this.mlStatistics.computeMLStats(this.modelRegistry);
  }

  public getFeatureStore(): FeatureStore {
    return this.featureStore;
  }
}
