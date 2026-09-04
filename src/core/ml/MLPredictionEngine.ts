import { MLModelRegistry } from './MLModelRegistry';
import { MLPredictionResponse } from './MLPrediction';
import { MLTaskIdentifier } from './MLTaskTypes';

export class MLPredictionEngine {
  private modelRegistry: MLModelRegistry;

  constructor(modelRegistry: MLModelRegistry) {
    this.modelRegistry = modelRegistry;
  }

  public static predict(options: { modelId?: string; task?: MLTaskIdentifier; input?: any }): MLPredictionResponse {
    const reg = new MLModelRegistry();
    const engine = new MLPredictionEngine(reg);
    const modelId = options.modelId;
    if (modelId) {
      const modelRecord = MLModelRegistry.getModel(modelId);
      if (!modelRecord || modelRecord.status !== 'approved') {
        return {
          status: 'unavailable',
          reason: 'model_not_available',
          task: options.task || 'layout_prediction',
          timestamp: new Date().toISOString(),
          validationStatus: 'invalid'
        };
      }
    }
    return engine.predict(options.task || 'layout_prediction', options.input || {});
  }

  public predict(task: MLTaskIdentifier, _inputFeatures: any): MLPredictionResponse {
    // There is no trained inference path wired for any task. This used to
    // silently return hardcoded constants (recommendedStrategy: 'FlexGrid',
    // predictedQualityScore: 88, confidence: 0.90) regardless of the model's
    // approval state or the input passed in — see MODEL_AUDIT_FINDINGS.md,
    // Checks 1 and 6. Callers must fail visibly instead of receiving
    // fabricated predictions.
    const registeredModel = this.modelRegistry.getApprovedModelForTask(task);
    const modelInfo = registeredModel
      ? `registry has '${registeredModel.modelId}' (status: ${registeredModel.status}, deploymentStatus: ${registeredModel.deploymentStatus})`
      : 'no approved model is registered for this task';
    throw new Error(
      `MLPredictionEngine.predict: no trained inference path is wired for task '${task}' (${modelInfo}). ` +
      `This function previously returned a hardcoded prediction for every task and every input ` +
      `(recommendedStrategy: 'FlexGrid', predictedQualityScore: 88, confidence: 0.90) — see ` +
      `MODEL_AUDIT_FINDINGS.md Check 1 and Check 6. There is no real prediction to return, so this ` +
      `throws rather than returning a fabricated one.`
    );
  }
}
