import { ClassDistributionReport, MLTaskSample, PreparedTaskIdentifier } from './TaskPreparationTypes';

export class TaskClassDistributionAnalyzer {
  public computeClassDistribution(
    samples: MLTaskSample[],
    task: PreparedTaskIdentifier
  ): ClassDistributionReport {
    const classDistribution: Record<string, number> = {};

    for (const s of samples) {
      let labelVal = 'unlabeled';

      if (task === 'layout_prediction') {
        labelVal = s.labels.layoutLabel || 'single_column';
      } else if (task === 'component_recommendation') {
        labelVal = s.labels.primaryComponent || 'card';
      } else if (task === 'ui_understanding') {
        labelVal = s.labels.rootClass || 'AndroidView';
      } else if (task === 'visual_style_recommendation') {
        labelVal = s.labels.styleLabel || 'Modern SaaS';
      }

      classDistribution[labelVal] = (classDistribution[labelVal] || 0) + 1;
    }

    const counts = Object.values(classDistribution);
    const classCount = counts.length;

    if (classCount === 0) {
      return {
        classCount: 0,
        classDistribution: {},
        minClassSize: 0,
        maxClassSize: 0,
        medianClassSize: 0,
        imbalanceRatio: 1.0,
        rareClasses: [],
        emptyClasses: []
      };
    }

    const minClassSize = Math.min(...counts);
    const maxClassSize = Math.max(...counts);
    const sorted = [...counts].sort((a, b) => a - b);
    const medianClassSize = sorted[Math.floor(sorted.length / 2)];
    const imbalanceRatio = minClassSize > 0 ? parseFloat((maxClassSize / minClassSize).toFixed(2)) : 999.0;

    const totalSamples = samples.length;
    const rareThreshold = Math.max(2, Math.round(totalSamples * 0.05));
    const rareClasses = Object.entries(classDistribution)
      .filter(([_, cnt]) => cnt <= rareThreshold)
      .map(([cls, _]) => cls);

    return {
      classCount,
      classDistribution,
      minClassSize,
      maxClassSize,
      medianClassSize,
      imbalanceRatio,
      rareClasses,
      emptyClasses: []
    };
  }
}
