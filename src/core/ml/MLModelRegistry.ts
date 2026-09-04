import { MLModel, MLModelRecord } from './MLModel';
import { MLModelVersioning } from './MLModelVersioning';
import { MLTaskIdentifier } from './MLTaskTypes';

/**
 * Approval for these v0.2.0 models was based on evaluation artifacts that
 * never exercised MLPredictionEngine.predict() — the code path that actually
 * runs when a prediction is requested. predict() returns hardcoded constants
 * for every task and every input; no feature vector reaches it in the shape
 * the training/eval artifacts assume. deploymentStatus is set to 'disabled'
 * (not 'production') so no inference is served on the strength of that
 * evaluation. The approval record itself (status: 'approved', approvedAt)
 * is left in place — this is a status correction, not a retraction of
 * history. See MODEL_AUDIT_FINDINGS.md, Checks 1 and 6.
 */
const NOT_SERVING_NOTE =
  'Approval was based on evaluation that did not exercise the runtime inference path ' +
  '(MLPredictionEngine.predict() returns hardcoded constants regardless of input — see ' +
  'MODEL_AUDIT_FINDINGS.md Checks 1 and 6). deploymentStatus set to \'disabled\': not serving.';

export class MLModelRegistry {
  private static staticModels: Map<string, MLModelRecord> = new Map();
  private models: Map<string, MLModel> = new Map();
  private versioning: MLModelVersioning;

  constructor() {
    this.versioning = new MLModelVersioning();
    if (!MLModelRegistry.getModel('ui-understanding-v0.2.0')) {
      MLModelRegistry.registerModel({
        modelId: 'ui-understanding-v0.2.0',
        task: 'ui_element_classification' as any,
        version: '0.2.0',
        datasetVersion: 'ml-prepared-layout-v0.1',
        featureVersion: 'ui-understanding-features-v0.2',
        status: 'approved',
        deploymentStatus: 'disabled',
        artifactHash: 'prod_ui_v02_hash_abcdef0123456789abcdef0123456789',
        approvalNote: NOT_SERVING_NOTE
      });
    }
    if (!MLModelRegistry.getModel('layout-prediction-v0.1.0')) {
      MLModelRegistry.registerModel({
        modelId: 'layout-prediction-v0.1.0',
        task: 'layout_prediction' as any,
        version: '0.1.0',
        datasetVersion: 'ml-prepared-layout-v0.1',
        featureVersion: 'layout-prediction-features-v0.1',
        status: 'candidate',
        deploymentStatus: 'not_active',
        artifactHash: 'layout_v01_hash_abcdef0123456789abcdef0123456789'
      });
    }
    if (!MLModelRegistry.getModel('layout-prediction-v0.2.0')) {
      MLModelRegistry.registerModel({
        modelId: 'layout-prediction-v0.2.0',
        task: 'layout_prediction' as any,
        version: '0.2.0',
        datasetVersion: 'ml-prepared-layout-v0.1',
        featureVersion: 'layout-prediction-features-v0.2',
        status: 'approved',
        deploymentStatus: 'disabled',
        artifactHash: 'layout_v02_hash_1234567890abcdef1234567890abcdef',
        approvalNote: NOT_SERVING_NOTE
      });
    }
    if (!MLModelRegistry.getModel('component-recommendation-v0.1.0')) {
      MLModelRegistry.registerModel({
        modelId: 'component-recommendation-v0.1.0',
        task: 'component_recommendation',
        version: '0.1.0',
        datasetVersion: 'ml-prepared-component-v0.1',
        featureVersion: 'component-recommendation-features-v0.1',
        status: 'candidate',
        deploymentStatus: 'not_active',
        artifactHash: 'comp_rec_v010_hash_9876543210fedcba9876543210fedcba'
      });
    }
    if (!MLModelRegistry.getModel('component-recommendation-v0.2.0')) {
      MLModelRegistry.registerModel({
        modelId: 'component-recommendation-v0.2.0',
        task: 'component_recommendation',
        version: '0.2.0',
        datasetVersion: 'ml-prepared-component-v0.1',
        featureVersion: 'component-recommendation-features-v0.2',
        status: 'approved',
        deploymentStatus: 'disabled',
        artifactHash: 'comp_rec_v020_hash_1234567890abcdef1234567890abcdef',
        approvalNote: NOT_SERVING_NOTE
      });
    }
    if (!MLModelRegistry.getModel('visual-style-v0.1.0')) {
      MLModelRegistry.registerModel({
        modelId: 'visual-style-v0.1.0',
        task: 'visual_style_recommendation',
        version: '0.1.0',
        datasetVersion: 'ml-prepared-style-v0.1',
        featureVersion: 'visual-style-features-v0.1',
        status: 'candidate',
        deploymentStatus: 'not_active',
        artifactHash: 'style_rec_v010_hash_9876543210fedcba9876543210fedcba'
      });
    }
    if (!MLModelRegistry.getModel('visual-style-v0.2.0')) {
      MLModelRegistry.registerModel({
        modelId: 'visual-style-v0.2.0',
        task: 'visual_style_recommendation',
        version: '0.2.0',
        datasetVersion: 'ml-prepared-style-v0.1',
        featureVersion: 'visual-style-features-v0.2',
        status: 'approved',
        deploymentStatus: 'disabled',
        artifactHash: 'style_rec_v020_hash_1234567890abcdef1234567890abcdef',
        approvalNote: NOT_SERVING_NOTE
      });
    }
  }

  public static registerModel(record: {
    modelId: string;
    task: MLTaskIdentifier;
    version: string;
    datasetVersion: string;
    featureVersion: string;
    trainingConfiguration?: any;
    evaluationResults?: Record<string, number>;
    status?: any;
    deploymentStatus?: any;
    artifactHash?: string;
    approvalNote?: string;
  }): MLModelRecord {
    const fullRecord: MLModelRecord & { artifactHash?: string } = {
      modelId: record.modelId,
      task: record.task,
      version: record.version,
      datasetVersion: record.datasetVersion,
      featureVersion: record.featureVersion,
      trainingConfiguration: record.trainingConfiguration || {},
      evaluationResults: record.evaluationResults,
      status: record.status || 'candidate',
      deploymentStatus: record.deploymentStatus || 'not_deployed',
      createdAt: new Date().toISOString(),
      artifactHash: record.artifactHash,
      approvalNote: record.approvalNote
    };
    MLModelRegistry.staticModels.set(record.modelId, fullRecord);
    return fullRecord;
  }

  public static updateStaticModelStatus(modelId: string, status: any, deploymentStatus: any): MLModelRecord | undefined {
    const existing = MLModelRegistry.staticModels.get(modelId);
    if (!existing) return undefined;
    existing.status = status;
    existing.deploymentStatus = deploymentStatus;
    MLModelRegistry.staticModels.set(modelId, existing);
    return existing;
  }

  public static getModel(modelId: string): MLModelRecord | undefined {
    if (!MLModelRegistry.staticModels.has('ui-understanding-v0.2.0')) {
      MLModelRegistry.registerModel({
        modelId: 'ui-understanding-v0.2.0',
        task: 'ui_element_classification' as any,
        version: '0.2.0',
        datasetVersion: 'ml-prepared-layout-v0.1',
        featureVersion: 'ui-understanding-features-v0.2',
        status: 'approved',
        deploymentStatus: 'disabled',
        artifactHash: 'prod_ui_v02_hash_abcdef0123456789abcdef0123456789',
        approvalNote: NOT_SERVING_NOTE
      });
    }
    if (!MLModelRegistry.staticModels.has('layout-prediction-v0.1.0')) {
      MLModelRegistry.registerModel({
        modelId: 'layout-prediction-v0.1.0',
        task: 'layout_prediction' as any,
        version: '0.1.0',
        datasetVersion: 'ml-prepared-layout-v0.1',
        featureVersion: 'layout-prediction-features-v0.1',
        status: 'candidate',
        deploymentStatus: 'not_active',
        artifactHash: 'layout_v01_hash_abcdef0123456789abcdef0123456789'
      });
    }
    return MLModelRegistry.staticModels.get(modelId);
  }

  public static getApprovedModelForTask(task: MLTaskIdentifier): MLModelRecord | undefined {
    const all = Array.from(MLModelRegistry.staticModels.values());
    return all.find((m) => (m.task === task || (task === 'ui_understanding' && (m.task as any) === 'ui_element_classification')) && m.status === 'approved');
  }

  public static getAllStaticModels(): MLModelRecord[] {
    return Array.from(MLModelRegistry.staticModels.values());
  }

  public registerCandidateModel(
    task: MLTaskIdentifier,
    versionTag: string,
    datasetVersion: string,
    featureVersion: string,
    trainingConfig: any
  ): MLModelRecord {
    const modelId = `model_${task}_${Date.now()}`;
    const model = new MLModel(modelId, task, versionTag, datasetVersion, featureVersion, trainingConfig);

    this.models.set(modelId, model);
    MLModelRegistry.staticModels.set(modelId, model.getRecord());
    this.versioning.registerVersion(task, versionTag, model.getRecord());
    return model.getRecord();
  }

  public getModel(modelId: string): MLModelRecord | undefined {
    return this.models.get(modelId)?.getRecord() || MLModelRegistry.staticModels.get(modelId);
  }

  public getApprovedModelForTask(task: MLTaskIdentifier): MLModelRecord | undefined {
    const all = Array.from(this.models.values()).map((m) => m.getRecord());
    const instMatch = all.find((m) => m.task === task && m.status === 'approved');
    if (instMatch) return instMatch;
    return MLModelRegistry.getApprovedModelForTask(task);
  }

  public getAllModels(): MLModelRecord[] {
    const instAll = Array.from(this.models.values()).map((m) => m.getRecord());
    const staticAll = Array.from(MLModelRegistry.staticModels.values());
    return [...instAll, ...staticAll];
  }

  public evaluateModel(modelId: string, evaluationResults: Record<string, number>): MLModelRecord {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model '${modelId}' not found.`);

    model.setEvaluationResults(evaluationResults);
    return model.getRecord();
  }

  public approveModel(modelId: string): MLModelRecord {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model '${modelId}' not found.`);

    model.approveModel();
    return model.getRecord();
  }

  public rejectModel(modelId: string, reason?: string): MLModelRecord {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model '${modelId}' not found.`);

    model.rejectModel(reason);
    return model.getRecord();
  }

  public getVersioning(): MLModelVersioning {
    return this.versioning;
  }
}
