import { TypedEventBus } from '../events/EventBus';
import { CoreEvent } from '../../types';

export class AgentEvents {
  private eventBus: TypedEventBus;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  public emitSessionStarted(sessionId: string): void {
    this.eventBus.emit(CoreEvent.AGENT_SESSION_STARTED, { sessionId, timestamp: Date.now() });
  }

  public emitIntentDetected(intent: any): void {
    this.eventBus.emit(CoreEvent.AGENT_INTENT_DETECTED, { intent, timestamp: Date.now() });
  }

  public emitPlanCreated(plan: any): void {
    this.eventBus.emit(CoreEvent.AGENT_PLAN_CREATED, { plan, timestamp: Date.now() });
  }

  public emitContextBuilt(context: any): void {
    this.eventBus.emit(CoreEvent.AGENT_CONTEXT_BUILT, { context, timestamp: Date.now() });
  }

  public emitKnowledgeRetrieved(bundle: any): void {
    this.eventBus.emit(CoreEvent.AGENT_KNOWLEDGE_RETRIEVED, { bundle, timestamp: Date.now() });
  }

  public emitPredictionReceived(bundle: any): void {
    this.eventBus.emit(CoreEvent.AGENT_PREDICTION_RECEIVED, { bundle, timestamp: Date.now() });
  }

  public emitAIRequested(request: any): void {
    this.eventBus.emit(CoreEvent.AGENT_AI_REQUESTED, { request, timestamp: Date.now() });
  }

  public emitDesignProposed(proposal: any): void {
    this.eventBus.emit(CoreEvent.AGENT_DESIGN_PROPOSED, { proposal, timestamp: Date.now() });
  }

  public emitAlternativesCreated(alternatives: any[]): void {
    this.eventBus.emit(CoreEvent.AGENT_ALTERNATIVES_CREATED, { alternatives, timestamp: Date.now() });
  }

  public emitValidationStarted(proposalId: string): void {
    this.eventBus.emit(CoreEvent.AGENT_VALIDATION_STARTED, { proposalId, timestamp: Date.now() });
  }

  public emitValidationFinished(validation: any): void {
    this.eventBus.emit(CoreEvent.AGENT_VALIDATION_FINISHED, { validation, timestamp: Date.now() });
  }

  public emitApprovalRequired(proposal: any): void {
    this.eventBus.emit(CoreEvent.AGENT_APPROVAL_REQUIRED, { proposal, timestamp: Date.now() });
  }

  public emitChangeApproved(changeId: string): void {
    this.eventBus.emit(CoreEvent.AGENT_CHANGE_APPROVED, { changeId, timestamp: Date.now() });
  }

  public emitChangeRejected(changeId: string, reason: string): void {
    this.eventBus.emit(CoreEvent.AGENT_CHANGE_REJECTED, { changeId, reason, timestamp: Date.now() });
  }

  public emitChangeApplied(changeId: string): void {
    this.eventBus.emit(CoreEvent.AGENT_CHANGE_APPLIED, { changeId, timestamp: Date.now() });
  }

  public emitIterationStarted(iterationNumber: number): void {
    this.eventBus.emit(CoreEvent.AGENT_ITERATION_STARTED, { iterationNumber, timestamp: Date.now() });
  }

  public emitIterationFinished(iterationNumber: number): void {
    this.eventBus.emit(CoreEvent.AGENT_ITERATION_FINISHED, { iterationNumber, timestamp: Date.now() });
  }

  public emitCodeRequested(targetId: string): void {
    this.eventBus.emit(CoreEvent.AGENT_CODE_REQUESTED, { targetId, timestamp: Date.now() });
  }

  public emitSessionFinished(sessionId: string): void {
    this.eventBus.emit(CoreEvent.AGENT_SESSION_FINISHED, { sessionId, timestamp: Date.now() });
  }

  public emitFailed(error: string): void {
    this.eventBus.emit(CoreEvent.AGENT_FAILED, { error, timestamp: Date.now() });
  }
}
