import { MLOrchestratorTaskIdentifier, TaskOrchestrationResult } from './UIMLOrchestratorTypes';

export class UIMLOrchestrationDependencyGraph {
  private static readonly DEPENDENCIES: Record<MLOrchestratorTaskIdentifier, MLOrchestratorTaskIdentifier[]> = {
    ui_understanding: [],
    layout_prediction: ['ui_understanding'],
    component_recommendation: ['ui_understanding'],
    visual_style_recommendation: ['layout_prediction', 'component_recommendation']
  };

  public static getDependencies(task: MLOrchestratorTaskIdentifier): MLOrchestratorTaskIdentifier[] {
    return this.DEPENDENCIES[task] || [];
  }

  public static getDownstream(task: MLOrchestratorTaskIdentifier): MLOrchestratorTaskIdentifier[] {
    const downstream: MLOrchestratorTaskIdentifier[] = [];
    for (const [t, deps] of Object.entries(this.DEPENDENCIES) as [MLOrchestratorTaskIdentifier, MLOrchestratorTaskIdentifier[]][]) {
      if (deps.includes(task)) {
        downstream.push(t);
      }
    }
    return downstream;
  }

  public static getGraphDefinition(): Record<MLOrchestratorTaskIdentifier, MLOrchestratorTaskIdentifier[]> {
    return { ...this.DEPENDENCIES };
  }

  public static getDeterministicExecutionOrder(): MLOrchestratorTaskIdentifier[] {
    return ['ui_understanding', 'layout_prediction', 'component_recommendation', 'visual_style_recommendation'];
  }

  public static evaluateDependencyStatus(
    task: MLOrchestratorTaskIdentifier,
    completedResults: Partial<Record<MLOrchestratorTaskIdentifier, TaskOrchestrationResult>>
  ): { ready: boolean; status: 'SATISFIED' | 'FAILED' | 'SKIPPED'; failedDependencies: MLOrchestratorTaskIdentifier[]; affectedDownstream: MLOrchestratorTaskIdentifier[] } {
    const deps = this.getDependencies(task);
    if (deps.length === 0) {
      return { ready: true, status: 'SATISFIED', failedDependencies: [], affectedDownstream: this.getDownstream(task) };
    }

    const failedDependencies: MLOrchestratorTaskIdentifier[] = [];
    for (const dep of deps) {
      const res = completedResults[dep];
      // An upstream dependency is considered satisfied if it completed with SUCCESS
      if (!res || res.predictionStatus !== 'SUCCESS') {
        failedDependencies.push(dep);
      }
    }

    if (failedDependencies.length > 0) {
      return {
        ready: false,
        status: 'FAILED',
        failedDependencies,
        affectedDownstream: this.getDownstream(task)
      };
    }

    return {
      ready: true,
      status: 'SATISFIED',
      failedDependencies: [],
      affectedDownstream: this.getDownstream(task)
    };
  }
}
