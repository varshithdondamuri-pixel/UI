import { CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';
import { PredictionBundle } from './MLTypes';

export enum MLEventType {
  DATASET_VALIDATION_STARTED = 'ML_DATASET_VALIDATION_STARTED',
  DATASET_VALIDATION_FINISHED = 'ML_DATASET_VALIDATION_FINISHED',
  FEATURE_EXTRACTION_STARTED = 'ML_FEATURE_EXTRACTION_STARTED',
  FEATURE_EXTRACTION_FINISHED = 'ML_FEATURE_EXTRACTION_FINISHED',
  TRAINING_PREPARED = 'ML_TRAINING_PREPARED',
  TRAINING_STARTED = 'ML_TRAINING_STARTED',
  TRAINING_PROGRESS = 'ML_TRAINING_PROGRESS',
  TRAINING_FINISHED = 'ML_TRAINING_FINISHED',
  TRAINING_FAILED = 'ML_TRAINING_FAILED',
  EVALUATION_STARTED = 'ML_EVALUATION_STARTED',
  EVALUATION_FINISHED = 'ML_EVALUATION_FINISHED',
  MODEL_REGISTERED = 'ML_MODEL_REGISTERED',
  MODEL_APPROVED = 'ML_MODEL_APPROVED',
  MODEL_REJECTED = 'ML_MODEL_REJECTED',
  PREDICTION_STARTED = 'ML_PREDICTION_STARTED',
  PREDICTION_FINISHED = 'ML_PREDICTION_FINISHED'
}

export class MLEventNotifier {
  private eventBus: TypedEventBus;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  public notifyModelLoaded(modelId: string): void {
    this.eventBus.emit(CoreEvent.MODEL_LOADED, { modelId, timestamp: Date.now() });
  }

  public notifyPredictionStarted(): void {
    this.eventBus.emit(CoreEvent.PREDICTION_STARTED, { timestamp: Date.now() });
  }

  public notifyPredictionFinished(bundle: PredictionBundle): void {
    this.eventBus.emit(CoreEvent.PREDICTION_FINISHED, { bundle, timestamp: Date.now() });
  }

  public notifyModelUpdated(modelId: string, status: string): void {
    this.eventBus.emit(CoreEvent.MODEL_UPDATED, { modelId, status });
  }

  public notifyDatasetUpdated(datasetId: string, totalEntries: number): void {
    this.eventBus.emit(CoreEvent.DATASET_UPDATED, { datasetId, totalEntries });
  }

  public notifyRankingUpdated(rankings: any[]): void {
    this.eventBus.emit(CoreEvent.RANKING_UPDATED, { rankings });
  }
}
