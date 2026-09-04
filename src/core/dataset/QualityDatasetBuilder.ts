import { QualitySample } from './DatasetTypes';
import { sanitizeText } from './DatasetSchema';

export class QualityDatasetBuilder {
  public buildSample(
    metrics: {
      visualQuality?: number;
      uxQuality?: number;
      accessibility?: number;
      responsiveQuality?: number;
      typography?: number;
      spacing?: number;
      hierarchy?: number;
      consistency?: number;
      codeQuality?: number;
    } = {},
    humanFeedback: string = 'High quality design, clean layout',
    machineEvaluation: any = null,
    overrideRating?: number
  ): QualitySample {
    const clamp = (val: number | undefined, def: number) =>
      Math.max(0, Math.min(100, val !== undefined ? val : def));

    const visualQuality = clamp(metrics.visualQuality, 88);
    const uxQuality = clamp(metrics.uxQuality, 85);
    const accessibility = clamp(metrics.accessibility, 92);
    const responsiveQuality = clamp(metrics.responsiveQuality, 86);
    const typography = clamp(metrics.typography, 90);
    const spacing = clamp(metrics.spacing, 87);
    const hierarchy = clamp(metrics.hierarchy, 89);
    const consistency = clamp(metrics.consistency, 94);
    const codeQuality = clamp(metrics.codeQuality, 91);

    const scores = [
      visualQuality,
      uxQuality,
      accessibility,
      responsiveQuality,
      typography,
      spacing,
      hierarchy,
      consistency,
      codeQuality
    ];
    const computedOverall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const finalRating = overrideRating !== undefined ? clamp(overrideRating, computedOverall) : computedOverall;

    return {
      visualQuality,
      uxQuality,
      accessibility,
      responsiveQuality,
      typography,
      spacing,
      hierarchy,
      consistency,
      codeQuality,
      overallQuality: computedOverall,
      humanFeedback: sanitizeText(humanFeedback),
      machineEvaluation: machineEvaluation || {
        evaluatedAt: new Date().toISOString(),
        evaluatorVersion: '1.0.0',
        automatedChecksPassed: 18,
        automatedChecksFailed: 0
      },
      finalRating
    };
  }
}
