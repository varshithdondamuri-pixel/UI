import { CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';

export class LearningEvents {
  private eventBus: TypedEventBus;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  public emitSessionStarted(sessionId: string): void {
    this.eventBus.emit(CoreEvent.LEARNING_SESSION_STARTED, {
      sessionId,
      timestamp: Date.now()
    });
  }

  public emitFeedbackReceived(feedbackId: string, feedback: any): void {
    this.eventBus.emit(CoreEvent.FEEDBACK_RECEIVED, {
      feedbackId,
      feedback,
      timestamp: Date.now()
    });
  }

  public emitDesignChangeRecorded(changeId: string, change: any): void {
    this.eventBus.emit(CoreEvent.DESIGN_CHANGE_RECORDED, {
      changeId,
      change,
      timestamp: Date.now()
    });
  }

  public emitDesignSelected(designId: string, selection: any): void {
    this.eventBus.emit(CoreEvent.DESIGN_SELECTED, {
      designId,
      selection,
      timestamp: Date.now()
    });
  }

  public emitDesignRejected(designId: string, reason: string): void {
    this.eventBus.emit(CoreEvent.DESIGN_REJECTED, {
      designId,
      reason,
      timestamp: Date.now()
    });
  }

  public emitEvaluationStarted(designId: string): void {
    this.eventBus.emit(CoreEvent.EVALUATION_STARTED, {
      designId,
      timestamp: Date.now()
    });
  }

  public emitEvaluationFinished(designId: string, evaluation: any): void {
    this.eventBus.emit(CoreEvent.EVALUATION_FINISHED, {
      designId,
      evaluation,
      timestamp: Date.now()
    });
  }

  public emitSampleCreated(sampleId: string, sample: any): void {
    this.eventBus.emit(CoreEvent.LEARNING_SAMPLE_CREATED, {
      sampleId,
      sample,
      timestamp: Date.now()
    });
  }

  public emitSampleValidated(sampleId: string, eligibility: string): void {
    this.eventBus.emit(CoreEvent.LEARNING_SAMPLE_VALIDATED, {
      sampleId,
      eligibility,
      timestamp: Date.now()
    });
  }

  public emitSampleApproved(sampleId: string): void {
    this.eventBus.emit(CoreEvent.LEARNING_SAMPLE_APPROVED, {
      sampleId,
      timestamp: Date.now()
    });
  }

  public emitSampleRejected(sampleId: string, reason: string): void {
    this.eventBus.emit(CoreEvent.LEARNING_SAMPLE_REJECTED, {
      sampleId,
      reason,
      timestamp: Date.now()
    });
  }

  public emitDatasetExported(datasetId: string, version: string, format: string, count: number): void {
    this.eventBus.emit(CoreEvent.DATASET_EXPORTED, {
      datasetId,
      version,
      format,
      count,
      timestamp: Date.now()
    });
  }
}
