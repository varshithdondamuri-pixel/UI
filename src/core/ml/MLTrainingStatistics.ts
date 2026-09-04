export interface MLTrainingStatisticsSummary {
  totalTasks: number;
  datasetSamplesCount: number;
  trainingJobsCount: number;
  completedJobsCount: number;
  failedJobsCount: number;
  experimentsCount: number;
  candidateModelsCount: number;
  approvedModelsCount: number;
  averageEvaluationScore: number;
  predictionCount: number;
  predictionFailuresCount: number;
  averageModelLatencyMs: number;
  featureExtractionTimeMs: number;
}

export class MLTrainingStatisticsTracker {
  private predictionCount: number = 0;
  private predictionFailuresCount: number = 0;
  private featureExtractionTimeMs: number = 12;

  public incrementPrediction(success: boolean) {
    this.predictionCount++;
    if (!success) this.predictionFailuresCount++;
  }

  public setFeatureExtractionTime(ms: number) {
    this.featureExtractionTimeMs = ms;
  }

  public computeSummary(
    taskCount: number,
    datasetSamplesCount: number,
    jobs: any[],
    experiments: any[],
    models: any[]
  ): MLTrainingStatisticsSummary {
    const completedJobs = jobs.filter((j) => j.state === 'completed').length;
    const failedJobs = jobs.filter((j) => j.state === 'failed').length;

    const candidateModels = models.filter((m) => m.status === 'candidate' || m.status === 'evaluating').length;
    const approvedModels = models.filter((m) => m.status === 'approved').length;

    let evalSum = 0;
    let evalCount = 0;
    for (const m of models) {
      if (m.evaluationResults && typeof m.evaluationResults.accuracy === 'number') {
        evalSum += m.evaluationResults.accuracy;
        evalCount++;
      }
    }

    const avgEval = evalCount > 0 ? Number((evalSum / evalCount).toFixed(4)) : 0;

    return {
      totalTasks: taskCount,
      datasetSamplesCount,
      trainingJobsCount: jobs.length,
      completedJobsCount: completedJobs,
      failedJobsCount: failedJobs,
      experimentsCount: experiments.length,
      candidateModelsCount: candidateModels,
      approvedModelsCount: approvedModels,
      averageEvaluationScore: avgEval,
      predictionCount: this.predictionCount,
      predictionFailuresCount: this.predictionFailuresCount,
      averageModelLatencyMs: 15,
      featureExtractionTimeMs: this.featureExtractionTimeMs
    };
  }
}
