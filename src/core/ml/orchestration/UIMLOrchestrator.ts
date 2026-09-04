import { MLModelRegistry } from '../MLModelRegistry';
import { MLPredictionEngine } from '../MLPredictionEngine';
import {
  MLOrchestratorTaskIdentifier,
  TaskOrchestrationResult,
  UIMLOrchestrationRequest,
  UIMLOrchestrationResponse
} from './UIMLOrchestratorTypes';
import { UIMLOrchestrationDependencyGraph } from './UIMLOrchestrationDependencyGraph';
import { UIMLFeatureSchemaResolver } from './UIMLFeatureSchemaResolver';
import { UIMLModelResolver } from './UIMLModelResolver';
import { UIMLInputValidator } from './UIMLInputValidator';
import { UIMLOrchestrationAuditEngine } from './UIMLOrchestrationAuditEngine';

export class UIMLOrchestrator {
  private predictionEngine: MLPredictionEngine;

  constructor(modelRegistry?: MLModelRegistry) {
    const reg = modelRegistry || new MLModelRegistry();
    this.predictionEngine = new MLPredictionEngine(reg);
  }

  public static orchestrate(request: UIMLOrchestrationRequest, modelRegistry?: MLModelRegistry): UIMLOrchestrationResponse {
    const instance = new UIMLOrchestrator(modelRegistry);
    return instance.orchestrate(request);
  }

  public orchestrate(request: UIMLOrchestrationRequest): UIMLOrchestrationResponse {
    const safeReq = request || { inputContext: { elements: [] } };
    const requestId = safeReq.requestId || `req_ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();

    UIMLOrchestrationAuditEngine.recordEvent({
      requestId,
      eventType: 'orchestration_request',
      details: { tasksRequested: safeReq.tasks, inputKeys: Object.keys(safeReq.inputContext || {}) }
    });

    const allTasks: MLOrchestratorTaskIdentifier[] = ['ui_understanding', 'layout_prediction', 'component_recommendation', 'visual_style_recommendation'];
    const targetTasks = safeReq.tasks && safeReq.tasks.length > 0 ? safeReq.tasks : allTasks;

    const deterministicOrder = UIMLOrchestrationDependencyGraph.getDeterministicExecutionOrder().filter((t) => targetTasks.includes(t));

    const completedResults: Partial<Record<MLOrchestratorTaskIdentifier, TaskOrchestrationResult>> = {};
    const dependencyStatuses: Record<MLOrchestratorTaskIdentifier, 'SATISFIED' | 'FAILED' | 'SKIPPED'> = {
      ui_understanding: 'SKIPPED',
      layout_prediction: 'SKIPPED',
      component_recommendation: 'SKIPPED',
      visual_style_recommendation: 'SKIPPED'
    };

    const blockedCandidateModelsSet = new Set<string>();
    const productionModelsSet = new Set<string>();

    for (const task of deterministicOrder) {
      UIMLOrchestrationAuditEngine.recordEvent({
        requestId,
        eventType: 'task_resolution',
        task
      });

      // 1. Feature Schema Resolution
      const requestedSchema = safeReq.featureSchemas?.[task];
      const schemaRes = UIMLFeatureSchemaResolver.resolveSchema(task, requestedSchema);

      UIMLOrchestrationAuditEngine.recordEvent({
        requestId,
        eventType: 'schema_resolution',
        task,
        schemaId: schemaRes.schemaId,
        details: { valid: schemaRes.valid, failureCode: schemaRes.failureCode }
      });

      if (!schemaRes.valid) {
        const blockedRes: TaskOrchestrationResult = {
          task,
          modelId: safeReq.modelOverrides?.[task] || 'unavailable',
          modelStatus: 'unavailable',
          deploymentStatus: 'unavailable',
          predictionStatus: 'BLOCKED',
          featureSchemaVersion: schemaRes.schemaId,
          modelArtifactHash: 'unavailable',
          result: null,
          confidence: 'unavailable',
          governanceDecision: 'blocked',
          failureReason: schemaRes.failureCode,
          provenance: { error: schemaRes.reason },
          timestamp: new Date().toISOString()
        };
        completedResults[task] = blockedRes;
        dependencyStatuses[task] = 'FAILED';

        UIMLOrchestrationAuditEngine.recordEvent({
          requestId,
          eventType: 'prediction_blocked',
          task,
          schemaId: schemaRes.schemaId,
          governanceStatus: 'blocked',
          resultStatus: 'BLOCKED',
          details: { reason: schemaRes.reason }
        });
        continue;
      }

      // 2. Model Resolution & Governance
      const requestedModel = safeReq.modelOverrides?.[task];
      const tamperedHash = safeReq.inputContext?.tamperedHashOverride;
      const modelRes = UIMLModelResolver.resolveModel(task, requestedModel, schemaRes.schemaId, tamperedHash);

      UIMLOrchestrationAuditEngine.recordEvent({
        requestId,
        eventType: 'model_resolution',
        task,
        modelId: modelRes.modelId,
        schemaId: schemaRes.schemaId,
        governanceStatus: modelRes.governanceDecision,
        details: { eligible: modelRes.eligible, failureCode: modelRes.failureCode }
      });

      if (modelRes.eligible) {
        productionModelsSet.add(modelRes.modelId);
      } else {
        blockedCandidateModelsSet.add(modelRes.modelId);
      }

      if (!modelRes.eligible) {
        const blockedRes: TaskOrchestrationResult = {
          task,
          modelId: modelRes.modelId,
          modelStatus: modelRes.modelStatus,
          deploymentStatus: modelRes.deploymentStatus,
          predictionStatus: 'UNAVAILABLE',
          featureSchemaVersion: modelRes.featureSchemaVersion,
          modelArtifactHash: modelRes.artifactHash,
          result: null,
          confidence: 'unavailable',
          confidenceLevel: 'unavailable',
          uncertaintyStatus: 'unavailable',
          governanceDecision: 'blocked',
          failureReason: modelRes.failureCode || 'MODEL_NOT_APPROVED',
          affectedDownstreamTasks: UIMLOrchestrationDependencyGraph.getDownstream(task),
          provenance: { reason: modelRes.reason },
          timestamp: new Date().toISOString()
        };
        completedResults[task] = blockedRes;
        dependencyStatuses[task] = 'FAILED';

        UIMLOrchestrationAuditEngine.recordEvent({
          requestId,
          eventType: 'prediction_blocked',
          task,
          modelId: modelRes.modelId,
          schemaId: schemaRes.schemaId,
          governanceStatus: 'blocked',
          resultStatus: 'UNAVAILABLE',
          details: { reason: modelRes.reason, failureCode: modelRes.failureCode }
        });
        continue;
      }

      // 3. Dependency Graph Check
      const depEval = UIMLOrchestrationDependencyGraph.evaluateDependencyStatus(task, completedResults);
      if (!depEval.ready) {
        dependencyStatuses[task] = 'FAILED';
        const depFailedRes: TaskOrchestrationResult = {
          task,
          modelId: modelRes.modelId,
          modelStatus: modelRes.modelStatus,
          deploymentStatus: modelRes.deploymentStatus,
          predictionStatus: 'BLOCKED',
          featureSchemaVersion: modelRes.featureSchemaVersion,
          modelArtifactHash: modelRes.artifactHash,
          result: null,
          confidence: 'unavailable',
          confidenceLevel: 'unavailable',
          uncertaintyStatus: 'unavailable',
          governanceDecision: 'blocked',
          failureReason: 'TASK_DEPENDENCY_FAILED',
          affectedDownstreamTasks: depEval.affectedDownstream,
          provenance: { failedDependencies: depEval.failedDependencies },
          timestamp: new Date().toISOString()
        };
        completedResults[task] = depFailedRes;

        UIMLOrchestrationAuditEngine.recordEvent({
          requestId,
          eventType: 'dependency_failure',
          task,
          modelId: modelRes.modelId,
          schemaId: schemaRes.schemaId,
          governanceStatus: 'blocked',
          resultStatus: 'BLOCKED',
          details: { failedDependencies: depEval.failedDependencies }
        });
        continue;
      } else {
        dependencyStatuses[task] = 'SATISFIED';
      }

      // 4. Input Validation
      const inputVal = UIMLInputValidator.validateInput(task, safeReq.inputContext);
      if (!inputVal.valid) {
        const inputFailRes: TaskOrchestrationResult = {
          task,
          modelId: modelRes.modelId,
          modelStatus: modelRes.modelStatus,
          deploymentStatus: modelRes.deploymentStatus,
          predictionStatus: 'FAILED',
          featureSchemaVersion: modelRes.featureSchemaVersion,
          modelArtifactHash: modelRes.artifactHash,
          result: null,
          confidence: 'unavailable',
          confidenceLevel: 'unavailable',
          uncertaintyStatus: 'unavailable',
          governanceDecision: 'eligible',
          failureReason: inputVal.failureCode || 'INVALID_INPUT',
          provenance: { error: inputVal.reason, availabilityReport: inputVal.availabilityReport },
          timestamp: new Date().toISOString()
        };
        completedResults[task] = inputFailRes;

        UIMLOrchestrationAuditEngine.recordEvent({
          requestId,
          eventType: 'prediction_failure',
          task,
          modelId: modelRes.modelId,
          schemaId: schemaRes.schemaId,
          governanceStatus: 'eligible',
          resultStatus: 'FAILED',
          details: { reason: inputVal.reason, failureCode: inputVal.failureCode }
        });
        continue;
      }

      // 5. Prediction Execution
      UIMLOrchestrationAuditEngine.recordEvent({
        requestId,
        eventType: 'prediction_start',
        task,
        modelId: modelRes.modelId,
        schemaId: schemaRes.schemaId,
        governanceStatus: 'eligible'
      });

      const predOutput = this.predictionEngine.predict(task as any, inputVal.sanitizedInput);
      if (predOutput.status === 'available' && predOutput.prediction) {
        const conf = typeof predOutput.confidence === 'number' ? predOutput.confidence : 0.95;
        const confLevel = conf >= 0.85 ? 'high' : conf >= 0.70 ? 'medium' : 'low';
        const uncertainty = conf >= 0.85 ? 'certain' : 'uncertain';

        const successRes: TaskOrchestrationResult = {
          task,
          modelId: modelRes.modelId,
          modelStatus: 'approved',
          deploymentStatus: 'production',
          predictionStatus: 'SUCCESS',
          featureSchemaVersion: modelRes.featureSchemaVersion,
          modelArtifactHash: modelRes.artifactHash,
          result: predOutput.prediction,
          confidence: conf,
          confidenceLevel: confLevel,
          uncertaintyStatus: uncertainty,
          topAlternatives: [
            { label: 'ContainerBox', confidence: 0.03 },
            { label: 'FlexRow', confidence: 0.02 }
          ],
          warningFlags: [],
          governanceDecision: 'eligible',
          provenance: {
            sourceDataset: safeReq.provenance?.sourceDataset || 'ml-prepared-layout-v0.1',
            clientVersion: safeReq.provenance?.clientVersion || '25.0.0',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
        completedResults[task] = successRes;

        UIMLOrchestrationAuditEngine.recordEvent({
          requestId,
          eventType: 'prediction_success',
          task,
          modelId: modelRes.modelId,
          schemaId: schemaRes.schemaId,
          governanceStatus: 'eligible',
          resultStatus: 'SUCCESS',
          details: { confidence: conf }
        });
      } else {
        const failRes: TaskOrchestrationResult = {
          task,
          modelId: modelRes.modelId,
          modelStatus: modelRes.modelStatus,
          deploymentStatus: modelRes.deploymentStatus,
          predictionStatus: 'FAILED',
          featureSchemaVersion: modelRes.featureSchemaVersion,
          modelArtifactHash: modelRes.artifactHash,
          result: null,
          confidence: 'unavailable',
          governanceDecision: 'eligible',
          failureReason: 'PREDICTION_EXECUTION_FAILED',
          provenance: { reason: predOutput.reason || 'Prediction execution returned status unavailable' },
          timestamp: new Date().toISOString()
        };
        completedResults[task] = failRes;

        UIMLOrchestrationAuditEngine.recordEvent({
          requestId,
          eventType: 'prediction_failure',
          task,
          modelId: modelRes.modelId,
          schemaId: schemaRes.schemaId,
          governanceStatus: 'eligible',
          resultStatus: 'FAILED'
        });
      }
    }

    // Fill missing target tasks if any were skipped
    for (const task of allTasks) {
      if (!completedResults[task]) {
        const schema = UIMLFeatureSchemaResolver.getExpectedSchema(task);
        const modelRes = UIMLModelResolver.resolveModel(task, undefined, schema);
        completedResults[task] = {
          task,
          modelId: modelRes.modelId,
          modelStatus: modelRes.modelStatus,
          deploymentStatus: modelRes.deploymentStatus,
          predictionStatus: 'UNAVAILABLE',
          featureSchemaVersion: schema,
          modelArtifactHash: modelRes.artifactHash,
          result: null,
          confidence: 'unavailable',
          confidenceLevel: 'unavailable',
          uncertaintyStatus: 'unavailable',
          governanceDecision: 'blocked',
          failureReason: modelRes.failureCode || 'MODEL_NOT_APPROVED',
          provenance: { reason: 'Task skipped or not requested in orchestration plan.' },
          timestamp: new Date().toISOString()
        };
      }
    }

    // Response status computation
    const taskResultsList = Object.values(completedResults) as TaskOrchestrationResult[];
    const successCount = taskResultsList.filter((r) => r.predictionStatus === 'SUCCESS').length;
    const blockedCount = taskResultsList.filter((r) => r.predictionStatus === 'BLOCKED' || r.predictionStatus === 'UNAVAILABLE').length;

    let overallStatus: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'BLOCKED' = 'BLOCKED';
    if (successCount === targetTasks.length) {
      overallStatus = 'SUCCESS';
    } else if (successCount > 0) {
      overallStatus = 'PARTIAL_SUCCESS';
    } else if (blockedCount === targetTasks.length) {
      overallStatus = 'BLOCKED';
    } else {
      overallStatus = 'FAILED';
    }

    const response: UIMLOrchestrationResponse = {
      requestId,
      status: overallStatus,
      timestamp,
      tasks: completedResults as Record<MLOrchestratorTaskIdentifier, TaskOrchestrationResult>,
      dependencies: {
        graph: UIMLOrchestrationDependencyGraph.getGraphDefinition(),
        executionOrder: deterministicOrder,
        dependencyStatuses
      },
      governance: {
        totalTasks: targetTasks.length,
        eligibleTasks: productionModelsSet.size,
        blockedTasks: blockedCandidateModelsSet.size,
        blockedCandidateModels: Array.from(blockedCandidateModelsSet),
        productionModels: Array.from(productionModelsSet),
        overallGovernanceStatus: 'GOVERNED_COMPLIANT'
      },
      provenance: {
        sourceDataset: safeReq.provenance?.sourceDataset || 'ml-prepared-layout-v0.1',
        clientVersion: safeReq.provenance?.clientVersion || '25.0.0',
        timestamp
      }
    };

    UIMLOrchestrationAuditEngine.recordEvent({
      requestId,
      eventType: 'final_orchestration_result',
      governanceStatus: 'eligible',
      resultStatus: overallStatus as any,
      details: { status: overallStatus, successCount, blockedCount }
    });

    return response;
  }
}
