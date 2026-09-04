import { TypedEventBus } from '../events/EventBus';
import { DesignChangeTracker, DesignChangeType } from './DesignChangeTracker';
import { DesignEvaluationEngine } from './DesignEvaluationEngine';
import { DatasetExporter, ExportFormat } from './DatasetExporter';
import { DatasetVersioning } from './DatasetVersioning';
import { FeedbackCollector } from './FeedbackCollector';
import { FeedbackNormalizer } from './FeedbackNormalizer';
import { FeedbackValidator } from './FeedbackValidator';
import { FeedbackKind, ChangeReason, AISuggestionOutcome, MLPredictionOutcome, KnowledgeUsefulnessOutcome } from './FeedbackTypes';
import { InteractionTracker } from './InteractionTracker';
import { LearningEvents } from './LearningEvents';
import { LearningSampleBuilder } from './LearningSampleBuilder';
import { LearningStatsData, LearningStatistics } from './LearningStatistics';
import { LearningSample, SampleStatus } from './LearningTypes';
import { SampleQualityEngine } from './SampleQualityEngine';
import { SelectionTracker } from './SelectionTracker';
import { TrainingSampleRegistry } from './TrainingSampleRegistry';

export class DesignFeedbackEngine {
  private eventBus: TypedEventBus;

  private interactionTracker = new InteractionTracker();
  private changeTracker = new DesignChangeTracker();
  private selectionTracker = new SelectionTracker();
  private feedbackCollector = new FeedbackCollector();
  private feedbackNormalizer = new FeedbackNormalizer();
  private feedbackValidator = new FeedbackValidator();
  private evaluationEngine = new DesignEvaluationEngine();
  private sampleBuilder = new LearningSampleBuilder();
  private sampleQualityEngine = new SampleQualityEngine();
  private sampleRegistry = new TrainingSampleRegistry();
  private datasetVersioning = new DatasetVersioning();
  private datasetExporter = new DatasetExporter();
  private statistics = new LearningStatistics();
  private events: LearningEvents;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
    this.events = new LearningEvents(this.eventBus);

    this.events.emitSessionStarted(this.interactionTracker.getActiveSession().sessionId);
  }

  /**
   * Records user rating (1 to 5 stars) for a design.
   */
  public submitRating(designId: string, rating: 1 | 2 | 3 | 4 | 5, optionId?: string): void {
    const userSessionId = this.interactionTracker.getActiveSession().userSessionId;
    const ratingRecord = this.feedbackCollector.recordRating({
      designId,
      rating,
      optionId,
      userSessionId
    });

    this.events.emitFeedbackReceived(ratingRecord.designId, ratingRecord);
    this.updateStats();
  }

  /**
   * Records explicit feedback (Like, Dislike, Comment, Reason, etc.).
   */
  public submitExplicitFeedback(
    designId: string,
    kind: FeedbackKind,
    value: any,
    comment?: string,
    reason?: ChangeReason,
    targetElementId?: string
  ): void {
    const userSessionId = this.interactionTracker.getActiveSession().userSessionId;
    const item = this.feedbackCollector.recordExplicitFeedback(
      designId,
      userSessionId,
      kind,
      value,
      comment,
      reason,
      targetElementId
    );

    if (comment) {
      const normalized = this.feedbackNormalizer.normalizeTextFeedback(comment);
      const fbData = this.feedbackCollector.getFeedbackForDesign(designId);
      fbData.normalizedItems.push(normalized);
    }

    this.events.emitFeedbackReceived(item.id, item);
    this.updateStats();
  }

  /**
   * Records AI suggestion outcome (Accepted, Modified, Rejected, etc.).
   */
  public recordAIFeedback(designId: string, requestId: string, providerId: string, outcome: AISuggestionOutcome, details?: string): void {
    const record = this.feedbackCollector.recordAIFeedback(designId, {
      requestId,
      providerId,
      outcome,
      userModificationDetails: details
    });

    this.events.emitFeedbackReceived('ai_' + requestId, record);
    this.updateStats();
  }

  /**
   * Records ML prediction outcome.
   */
  public recordMLFeedback(
    designId: string,
    modelId: string,
    modelVersion: string,
    prediction: any,
    confidence: number,
    outcome: MLPredictionOutcome
  ): void {
    const record = this.feedbackCollector.recordMLFeedback(designId, {
      modelId,
      modelVersion,
      prediction,
      confidence,
      userOutcome: outcome
    });

    this.events.emitFeedbackReceived('ml_' + modelId, record);
    this.updateStats();
  }

  /**
   * Records Knowledge usefulness feedback.
   */
  public recordKnowledgeFeedback(designId: string, bundleId: string, recordId: string, outcome: KnowledgeUsefulnessOutcome): void {
    const record = this.feedbackCollector.recordKnowledgeFeedback(designId, {
      bundleId,
      recordId,
      outcome
    });

    this.events.emitFeedbackReceived('kb_' + recordId, record);
    this.updateStats();
  }

  /**
   * Track meaningful design change.
   */
  public recordDesignChange(
    designId: string,
    changeType: DesignChangeType,
    before: any,
    after: any,
    reason?: ChangeReason,
    sourceNode?: string,
    comment?: string
  ): void {
    const record = this.changeTracker.recordChange({
      designId,
      changeType,
      before,
      after,
      reason,
      sourceNode,
      comment,
      userInitiated: true
    });

    this.interactionTracker.recordInteraction(designId);
    this.events.emitDesignChangeRecorded(record.changeId, record);
    this.updateStats();
  }

  /**
   * Track selected blueprint / visual option / component.
   */
  public recordSelection(designId: string, blueprintId?: string, optionId?: string, rejectedOptionIds: string[] = []): void {
    if (blueprintId) {
      this.selectionTracker.recordBlueprintSelection(designId, blueprintId);
    }
    if (optionId) {
      this.selectionTracker.recordVisualOptionSelection(designId, optionId, rejectedOptionIds);
    }

    const selectionState = this.selectionTracker.getSelectionsForDesign(designId);
    this.events.emitDesignSelected(designId, selectionState);
    this.updateStats();
  }

  /**
   * Runs complete evaluation and creates a structured LearningSample for a generated design.
   */
  public processDesignEvaluationAndSample(
    designId: string,
    prompt: string,
    sketch: any,
    semanticTree: any,
    intentTree: any,
    blueprint: any,
    visualDesignModel: any,
    renderTree: any,
    knowledgeBundle?: any,
    predictionBundle?: any,
    aiDecision?: any,
    codeResult?: any
  ): LearningSample {
    this.events.emitEvaluationStarted(designId);

    // 1. Evaluate design across 5 dimensions
    const evaluation = this.evaluationEngine.evaluateDesign(
      designId,
      visualDesignModel,
      blueprint,
      intentTree,
      renderTree,
      codeResult
    );
    this.events.emitEvaluationFinished(designId, evaluation);

    // 2. Fetch feedback, selections, changes
    const feedback = this.feedbackCollector.getFeedbackForDesign(designId);
    const userSelections = this.selectionTracker.getSelectionsForDesign(designId);
    const userChanges = this.changeTracker.getChangesForDesign(designId);

    // 3. Assess quality & eligibility
    const qualityAssessment = this.sampleQualityEngine.assessSample(
      prompt,
      visualDesignModel,
      feedback,
      evaluation,
      userChanges
    );

    // 4. Build sample
    const sample = this.sampleBuilder.buildSample({
      prompt,
      sketch,
      semanticTree,
      intentTree,
      blueprint,
      visualDesignModel,
      knowledgeBundle,
      predictionBundle,
      aiDecision,
      renderTree,
      codeResult,
      userSelections,
      userChanges,
      feedback,
      evaluation,
      qualityScore: qualityAssessment.qualityScore,
      learningEligibility: qualityAssessment.eligibility,
      eligibilityReasons: qualityAssessment.reasons,
      datasetVersion: this.datasetVersioning.getLatestVersion().version
    });

    // 5. Register sample
    this.sampleRegistry.registerSample(sample);
    this.events.emitSampleCreated(sample.sampleId, sample);
    this.events.emitSampleValidated(sample.sampleId, sample.learningEligibility);

    this.updateStats();
    return sample;
  }

  /**
   * Manual approval / rejection of sample status in TrainingSampleRegistry.
   */
  public setSampleStatus(sampleId: string, status: SampleStatus): boolean {
    const updated = this.sampleRegistry.updateSampleStatus(sampleId, status);
    if (updated) {
      if (status === 'approved') {
        this.events.emitSampleApproved(sampleId);
      } else if (status === 'rejected') {
        this.events.emitSampleRejected(sampleId, 'User rejected sample');
      }
      this.updateStats();
    }
    return updated;
  }

  /**
   * Create a new dataset version.
   */
  public createDatasetVersion(versionStr: string, qualityThreshold: number = 70): void {
    const allSamples = this.sampleRegistry.getAllSamples();
    this.datasetVersioning.createVersion(versionStr, qualityThreshold, allSamples);
    this.updateStats();
  }

  /**
   * Export approved samples.
   */
  public exportDataset(format: ExportFormat, versionStr?: string): string {
    const version = versionStr ? this.datasetVersioning.getVersion(versionStr) || this.datasetVersioning.getLatestVersion() : this.datasetVersioning.getLatestVersion();
    const samples = this.sampleRegistry.getSamplesByDatasetVersion(version.version);

    const exported = this.datasetExporter.exportDataset(samples, version, format);
    this.events.emitDatasetExported(version.datasetId, version.version, format, samples.length);
    return exported;
  }

  /**
   * Getters for components & state
   */
  public getSampleRegistry(): TrainingSampleRegistry {
    return this.sampleRegistry;
  }

  public getDatasetVersioning(): DatasetVersioning {
    return this.datasetVersioning;
  }

  public getFeedbackValidator(): FeedbackValidator {
    return this.feedbackValidator;
  }

  public getStatistics(): LearningStatsData {
    return this.statistics.getStats();
  }

  public getAllSamples(): LearningSample[] {
    return this.sampleRegistry.getAllSamples();
  }

  public getChanges(): any[] {
    return this.changeTracker.getAllChanges();
  }

  public getSessions(): any[] {
    return this.interactionTracker.getAllSessions();
  }

  public getFeedbackCollector(): FeedbackCollector {
    return this.feedbackCollector;
  }

  public getSelectionTracker(): SelectionTracker {
    return this.selectionTracker;
  }

  private updateStats(): void {
    const allSamples = this.sampleRegistry.getAllSamples();
    const eligible = allSamples.filter((s) => s.learningEligibility === 'eligible');
    const needsReview = allSamples.filter((s) => s.learningEligibility === 'needs_review');
    const rejected = allSamples.filter((s) => s.learningEligibility === 'not_eligible' || s.status === 'rejected');

    let totalQuality = 0;
    let totalUX = 0;
    let totalA11y = 0;

    allSamples.forEach((s) => {
      totalQuality += s.evaluation?.quality?.overallVisualQuality || 0;
      totalUX += s.evaluation?.ux?.overallUXScore || 0;
      totalA11y += s.evaluation?.accessibility?.wcagComplianceScore || 0;
    });

    const count = allSamples.length || 1;

    let aiAccepted = 0;
    let aiRejected = 0;
    let mlAccepted = 0;
    let mlRejected = 0;

    this.feedbackCollector.getAllFeedback().forEach((fb) => {
      fb.aiFeedback.forEach((a) => {
        if (a.outcome === 'Accepted' || a.outcome === 'Partially Accepted') aiAccepted++;
        else if (a.outcome === 'Rejected') aiRejected++;
      });
      fb.mlFeedback.forEach((m) => {
        if (m.userOutcome === 'Accepted') mlAccepted++;
        else if (m.userOutcome === 'Rejected') mlRejected++;
      });
    });

    this.statistics.updateStats({
      totalLearningSessions: this.interactionTracker.getTotalSessionCount(),
      totalDesigns: allSamples.length,
      totalSelections: this.selectionTracker.getTotalSelectionsCount(),
      totalRejections: this.selectionTracker.getTotalRejectionsCount(),
      averageRating: this.feedbackCollector.getAverageRating(),
      averageDesignQuality: Math.round(totalQuality / count),
      averageUXScore: Math.round(totalUX / count),
      averageAccessibilityScore: Math.round(totalA11y / count),
      acceptedAISuggestions: aiAccepted,
      rejectedAISuggestions: aiRejected,
      acceptedMLPredictions: mlAccepted,
      rejectedMLPredictions: mlRejected,
      eligibleSamples: eligible.length,
      samplesNeedingReview: needsReview.length,
      rejectedSamples: rejected.length,
      datasetVersionsCount: this.datasetVersioning.getAllVersions().length
    });
  }
}
