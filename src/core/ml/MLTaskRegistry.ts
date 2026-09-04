import { MLTaskDefinition, MLTaskIdentifier, MLTaskStatus } from './MLTaskTypes';

export class MLTaskRegistry {
  private tasks: Map<MLTaskIdentifier, MLTaskDefinition> = new Map();

  constructor() {
    this.registerDefaultTasks();
  }

  private registerDefaultTasks() {
    const defaultTasks: MLTaskDefinition[] = [
      {
        id: 'ui_understanding',
        name: 'UI Understanding',
        description: 'Predict UI structural elements from sketch shapes and canvas objects',
        status: 'planned',
        requiredFeatureGroups: ['sketch_features', 'geometry_features'],
        labelType: 'categorical',
        primaryMetric: 'accuracy',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'semantic_prediction',
        name: 'Semantic Classification',
        description: 'Map canvas shapes and text into semantic node hierarchy',
        status: 'planned',
        requiredFeatureGroups: ['sketch_features', 'semantic_features'],
        labelType: 'categorical',
        primaryMetric: 'f1',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'intent_prediction',
        name: 'Intent Prediction',
        description: 'Predict user layout intent and component hierarchy priority',
        status: 'planned',
        requiredFeatureGroups: ['semantic_features', 'intent_features', 'prompt_features'],
        labelType: 'categorical',
        primaryMetric: 'accuracy',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'layout_prediction',
        name: 'Layout Blueprint Prediction',
        description: 'Predict optimal structural strategy and node distribution',
        status: 'planned',
        requiredFeatureGroups: ['intent_features', 'layout_features', 'geometry_features'],
        labelType: 'categorical',
        primaryMetric: 'topKAccuracy',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'component_recommendation',
        name: 'Component Recommendation',
        description: 'Recommend high-quality component choices based on design context',
        status: 'planned',
        requiredFeatureGroups: ['component_features', 'layout_features', 'industry_features'],
        labelType: 'multi_label',
        primaryMetric: 'f1',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'visual_style_recommendation',
        name: 'Visual Style Recommendation',
        description: 'Recommend color theme, typography scale, and spacing tokens',
        status: 'planned',
        requiredFeatureGroups: ['visual_features', 'color_features', 'typography_features', 'style_features'],
        labelType: 'categorical',
        primaryMetric: 'accuracy',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'responsive_prediction',
        name: 'Responsive Layout Prediction',
        description: 'Predict responsive breakpoint adaptations across desktop/tablet/mobile',
        status: 'planned',
        requiredFeatureGroups: ['responsive_features', 'layout_features'],
        labelType: 'categorical',
        primaryMetric: 'accuracy',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'design_quality_prediction',
        name: 'Design Quality Prediction',
        description: 'Predict 0-100 quality score across visual, UX, accessibility & code metrics',
        status: 'planned',
        requiredFeatureGroups: ['quality_features', 'accessibility_features', 'spacing_features'],
        labelType: 'continuous',
        primaryMetric: 'MAE',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'alternative_ranking',
        name: 'Design Alternative Ranking',
        description: 'Rank candidate blueprint & visual design variants',
        status: 'planned',
        requiredFeatureGroups: ['layout_features', 'visual_features', 'preference_features'],
        labelType: 'ranking',
        primaryMetric: 'NDCG',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'user_preference_prediction',
        name: 'User Preference Prediction',
        description: 'Predict user acceptance/rejection of proposed design changes',
        status: 'planned',
        requiredFeatureGroups: ['interaction_features', 'preference_features', 'prompt_features'],
        labelType: 'binary',
        primaryMetric: 'f1',
        datasetSampleCount: 0,
        updatedAt: new Date().toISOString()
      }
    ];

    for (const t of defaultTasks) {
      this.tasks.set(t.id, t);
    }
  }

  public getTask(id: MLTaskIdentifier): MLTaskDefinition | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(): MLTaskDefinition[] {
    return Array.from(this.tasks.values());
  }

  public updateTaskStatus(id: MLTaskIdentifier, status: MLTaskStatus, approvedModelId?: string): MLTaskDefinition | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    task.status = status;
    if (approvedModelId) task.approvedModelId = approvedModelId;
    task.updatedAt = new Date().toISOString();

    return task;
  }

  public updateTaskSampleCount(id: MLTaskIdentifier, count: number): void {
    const task = this.tasks.get(id);
    if (task) {
      task.datasetSampleCount = count;
      if (count > 0 && task.status === 'planned') {
        task.status = 'dataset_ready';
      }
      task.updatedAt = new Date().toISOString();
    }
  }
}
