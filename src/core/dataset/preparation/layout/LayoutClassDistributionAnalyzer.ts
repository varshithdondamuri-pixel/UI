import { LayoutPreparationSample, LayoutClassLabel, LayoutClassDistributionItem } from './LayoutPreparationTypes';

export class LayoutClassDistributionAnalyzer {
  public analyzeDistribution(samples: LayoutPreparationSample[]): {
    classes: LayoutClassDistributionItem[];
    majorityClass: LayoutClassLabel;
    minorityClass: LayoutClassLabel;
    imbalanceRatio: number;
  } {
    const classCounts: Record<LayoutClassLabel, number> = {
      single_column: 0,
      two_column: 0,
      three_column: 0,
      grid: 0,
      sidebar: 0,
      stack: 0,
      centered: 0,
      other: 0
    };

    for (const sample of samples) {
      const label = sample.derivedLabel?.label || 'other';
      if (classCounts[label] !== undefined) {
        classCounts[label]++;
      } else {
        classCounts['other']++;
      }
    }

    const total = samples.length || 1;
    const classes: LayoutClassDistributionItem[] = (Object.keys(classCounts) as LayoutClassLabel[]).map(c => ({
      className: c,
      count: classCounts[c],
      percentage: Number(((classCounts[c] / total) * 100).toFixed(2))
    }));

    let maxCount = -1;
    let minCount = Infinity;
    let majorityClass: LayoutClassLabel = 'single_column';
    let minorityClass: LayoutClassLabel = 'three_column';

    for (const item of classes) {
      if (item.count > maxCount) {
        maxCount = item.count;
        majorityClass = item.className;
      }
      if (item.count < minCount && item.count > 0) {
        minCount = item.count;
        minorityClass = item.className;
      }
    }

    const imbalanceRatio = minCount > 0 ? Number((maxCount / minCount).toFixed(2)) : 1.0;

    return {
      classes,
      majorityClass,
      minorityClass,
      imbalanceRatio
    };
  }
}
