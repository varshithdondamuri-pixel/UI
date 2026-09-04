import { MLExperiment, MLExperimentRecord } from './MLExperiment';
import { MLFeatureGroup } from './MLFeatureTypes';
import { MLTaskIdentifier } from './MLTaskTypes';

export interface ExperimentComparison {
  experimentId: string;
  task: string;
  datasetVersion: string;
  featureGroupsCount: number;
  modelType: string;
  trainingSize: number;
  metrics: Record<string, number>;
  status: string;
  candidateModelId: string;
}

export class MLExperimentRegistry {
  private static staticExperiments: Map<string, MLExperimentRecord> = new Map();
  private experiments: Map<string, MLExperiment> = new Map();

  public static registerExperiment(exp: Partial<MLExperimentRecord> & { experimentId: string }): MLExperimentRecord {
    const record: MLExperimentRecord = {
      experimentId: exp.experimentId,
      task: exp.task as any || 'layout_prediction',
      datasetVersion: exp.datasetVersion || 'ml-prepared-layout-v0.1',
      featureGroups: exp.featureGroups || [],
      configuration: exp.configuration || {},
      status: exp.status || 'completed',
      metrics: exp.metrics || {},
      createdAt: exp.createdAt || new Date().toISOString()
    };
    MLExperimentRegistry.staticExperiments.set(exp.experimentId, record);
    return record;
  }

  public createExperiment(
    task: MLTaskIdentifier,
    datasetVersion: string,
    featureGroups: MLFeatureGroup[],
    config: any,
    notes?: string
  ): MLExperimentRecord {
    const expId = `exp_${task}_${Date.now()}`;
    const exp = new MLExperiment(expId, task, datasetVersion, featureGroups, config);
    if (notes) exp.setNotes(notes);
    this.experiments.set(expId, exp);
    MLExperimentRegistry.staticExperiments.set(expId, exp.getRecord());
    return exp.getRecord();
  }

  public getExperiment(expId: string): MLExperimentRecord | undefined {
    return this.experiments.get(expId)?.getRecord();
  }

  public getAllExperiments(): MLExperimentRecord[] {
    return Array.from(this.experiments.values()).map((e) => e.getRecord());
  }

  public compareExperiments(experimentIds: string[]): ExperimentComparison[] {
    const result: ExperimentComparison[] = [];
    for (const id of experimentIds) {
      const exp = this.getExperiment(id);
      if (exp) {
        result.push({
          experimentId: exp.experimentId,
          task: exp.task,
          datasetVersion: exp.datasetVersion,
          featureGroupsCount: exp.featureGroups?.length || 0,
          modelType: exp.configuration?.modelType || 'Custom ML Model',
          trainingSize: exp.configuration?.maximumSamples || 100,
          metrics: exp.metrics || {},
          status: exp.status,
          candidateModelId: exp.candidateModelId || 'N/A'
        });
      }
    }

    return result;
  }
}
