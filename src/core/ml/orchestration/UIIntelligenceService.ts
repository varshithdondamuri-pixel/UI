import { UIMLOrchestrator } from './UIMLOrchestrator';
import { UIMLOrchestrationRequest, UIMLOrchestrationResponse, MLOrchestratorTaskIdentifier } from './UIMLOrchestratorTypes';
import { MLModelRegistry } from '../MLModelRegistry';
import { UIMLOrchestrationAuditEngine } from './UIMLOrchestrationAuditEngine';

export type ProductDownstreamTaskStatus =
  | 'AVAILABLE'
  | 'BLOCKED_BY_GOVERNANCE'
  | 'UPSTREAM_UNAVAILABLE'
  | 'NOT_PRODUCTION_ENABLED';

export interface ProductTaskStatusReport {
  task: MLOrchestratorTaskIdentifier;
  modelId: string;
  featureSchemaVersion: string;
  status: ProductDownstreamTaskStatus;
  governanceDecision: 'eligible' | 'blocked';
  reason?: string;
}

export interface UIIntelligenceAnalysisResult {
  requestId: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'BLOCKED';
  uiUnderstandingResult: {
    modelId: string;
    featureSchemaVersion: string;
    predictionStatus: 'SUCCESS' | 'UNAVAILABLE' | 'BLOCKED' | 'FAILED';
    confidence: number;
    predictions?: any;
  };
  downstreamTaskStatuses: Record<MLOrchestratorTaskIdentifier, ProductTaskStatusReport>;
  governanceReport: {
    overallStatus: 'GOVERNED_COMPLIANT' | 'GOVERNANCE_VIOLATION';
    eligibleTaskCount: number;
    blockedCandidateCount: number;
  };
  provenance: {
    clientVersion: string;
    orchestratorVersion: string;
    timestamp: string;
  };
  auditEventCount: number;
  rawResponse: UIMLOrchestrationResponse;
}

export class UIIntelligenceService {
  private orchestrator: UIMLOrchestrator;

  constructor(registry?: MLModelRegistry) {
    this.orchestrator = new UIMLOrchestrator(registry);
  }

  /**
   * Execute UI Intelligence Analysis through governed ML Orchestration layer
   */
  public analyzeUI(request: UIMLOrchestrationRequest): UIIntelligenceAnalysisResult {
    const rawRes = this.orchestrator.orchestrate(request);

    // Map downstream task statuses cleanly for Product UI based on orchestrator resolution
    const downstreamTaskStatuses: Record<MLOrchestratorTaskIdentifier, ProductTaskStatusReport> = {
      ui_understanding: {
        task: 'ui_understanding',
        modelId: rawRes.tasks.ui_understanding.modelId,
        featureSchemaVersion: rawRes.tasks.ui_understanding.featureSchemaVersion,
        status: rawRes.tasks.ui_understanding.predictionStatus === 'SUCCESS' ? 'AVAILABLE' : 'NOT_PRODUCTION_ENABLED',
        governanceDecision: rawRes.tasks.ui_understanding.governanceDecision
      },
      layout_prediction: {
        task: 'layout_prediction',
        modelId: rawRes.tasks.layout_prediction.modelId,
        featureSchemaVersion: rawRes.tasks.layout_prediction.featureSchemaVersion,
        status: rawRes.tasks.layout_prediction.predictionStatus === 'SUCCESS' ? 'AVAILABLE' : 'NOT_PRODUCTION_ENABLED',
        governanceDecision: rawRes.tasks.layout_prediction.governanceDecision,
        reason: rawRes.tasks.layout_prediction.predictionStatus === 'SUCCESS' ? undefined : 'Candidate model (layout-prediction-v0.2.0) is not production enabled.'
      },
      component_recommendation: {
        task: 'component_recommendation',
        modelId: rawRes.tasks.component_recommendation.modelId,
        featureSchemaVersion: rawRes.tasks.component_recommendation.featureSchemaVersion,
        status: rawRes.tasks.component_recommendation.predictionStatus === 'SUCCESS' ? 'AVAILABLE' : 'NOT_PRODUCTION_ENABLED',
        governanceDecision: rawRes.tasks.component_recommendation.governanceDecision,
        reason: rawRes.tasks.component_recommendation.predictionStatus === 'SUCCESS' ? undefined : 'Candidate model (component-recommendation-v0.2.0) is not production enabled.'
      },
      visual_style_recommendation: {
        task: 'visual_style_recommendation',
        modelId: rawRes.tasks.visual_style_recommendation.modelId,
        featureSchemaVersion: rawRes.tasks.visual_style_recommendation.featureSchemaVersion,
        status: rawRes.tasks.visual_style_recommendation.predictionStatus === 'SUCCESS' ? 'AVAILABLE' : 'UPSTREAM_UNAVAILABLE',
        governanceDecision: rawRes.tasks.visual_style_recommendation.governanceDecision,
        reason: rawRes.tasks.visual_style_recommendation.predictionStatus === 'SUCCESS' ? undefined : 'Upstream candidate dependencies are not production enabled.'
      }
    };

    const auditEvents = UIMLOrchestrationAuditEngine.getEventsForRequest(rawRes.requestId);

    return {
      requestId: rawRes.requestId,
      status: rawRes.status,
      uiUnderstandingResult: {
        modelId: rawRes.tasks.ui_understanding.modelId,
        featureSchemaVersion: rawRes.tasks.ui_understanding.featureSchemaVersion,
        predictionStatus: rawRes.tasks.ui_understanding.predictionStatus,
        confidence: typeof rawRes.tasks.ui_understanding.confidence === 'number' ? rawRes.tasks.ui_understanding.confidence : 0.95,
        predictions: rawRes.tasks.ui_understanding.result
      },
      downstreamTaskStatuses,
      governanceReport: {
        overallStatus: rawRes.governance.overallGovernanceStatus,
        eligibleTaskCount: rawRes.governance.eligibleTasks,
        blockedCandidateCount: rawRes.governance.blockedCandidateModels.length
      },
      provenance: {
        clientVersion: rawRes.provenance.clientVersion,
        orchestratorVersion: '25.0.0',
        timestamp: rawRes.provenance.timestamp
      },
      auditEventCount: auditEvents.length,
      rawResponse: rawRes
    };
  }
}
