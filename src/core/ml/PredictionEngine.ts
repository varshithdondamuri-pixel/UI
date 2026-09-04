import { AccessibilityPredictor } from './AccessibilityPredictor';
import { ColorPredictor } from './ColorPredictor';
import { ComponentPredictor } from './ComponentPredictor';
import { InferenceEngine } from './InferenceEngine';
import { LayoutPredictor } from './LayoutPredictor';
import { FeatureVector, PredictionBundle } from './MLTypes';
import { QualityPredictor } from './QualityPredictor';
import { RankingEngine } from './RankingEngine';
import { StylePredictor } from './StylePredictor';
import { TrendEngine } from './TrendEngine';
import { TypographyPredictor } from './TypographyPredictor';

export class PredictionEngine {
  private inferenceEngine = new InferenceEngine();

  private layoutPredictor = new LayoutPredictor();
  private stylePredictor = new StylePredictor();
  private colorPredictor = new ColorPredictor();
  private typographyPredictor = new TypographyPredictor();
  private componentPredictor = new ComponentPredictor();
  private qualityPredictor = new QualityPredictor();
  private accessibilityPredictor = new AccessibilityPredictor();
  private trendEngine = new TrendEngine();
  private rankingEngine = new RankingEngine();

  public generatePredictions(features: FeatureVector): PredictionBundle {
    const startTime = performance.now();

    const layoutPrediction = this.inferenceEngine.runInference('model-layout-predictor', () =>
      this.layoutPredictor.predictLayout(features)
    );

    const stylePrediction = this.inferenceEngine.runInference('model-style-predictor', () =>
      this.stylePredictor.predictStyle(features)
    );

    const colorPrediction = this.inferenceEngine.runInference('model-color-predictor', () =>
      this.colorPredictor.predictColor(features)
    );

    const typographyPrediction = this.inferenceEngine.runInference('model-typography-predictor', () =>
      this.typographyPredictor.predictTypography(features)
    );

    const accessibilityPrediction = this.inferenceEngine.runInference('model-accessibility-predictor', () =>
      this.accessibilityPredictor.predictAccessibility(features)
    );

    const qualityPrediction = this.inferenceEngine.runInference('model-quality-predictor', () =>
      this.qualityPredictor.predictQuality(features)
    );

    const trendPrediction = this.inferenceEngine.runInference('model-trend-predictor', () =>
      this.trendEngine.predictTrend(features)
    );

    const componentPrediction = this.inferenceEngine.runInference('model-component-recognizer', () =>
      this.componentPredictor.predictComponents(features)
    );

    const rawRankings = [
      { id: 'opt-a', name: stylePrediction.prediction, score: qualityPrediction.prediction.overallScore },
      { id: 'opt-b', name: trendPrediction.prediction.recommendedTrend, score: qualityPrediction.prediction.overallScore - 3 },
      { id: 'opt-c', name: layoutPrediction.prediction, score: qualityPrediction.prediction.overallScore - 5 },
      { id: 'opt-d', name: `Suite: ${componentPrediction.prediction.slice(0, 3).join(', ')}`, score: qualityPrediction.prediction.overallScore - 2 }
    ];

    const rankings = this.rankingEngine.rankItems(rawRankings);

    const endTime = performance.now();
    const totalLatencyMs = Number(Math.max(0.5, endTime - startTime).toFixed(2));

    return {
      id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      layoutPrediction,
      stylePrediction,
      typographyPrediction,
      colorPrediction,
      accessibilityPrediction,
      trendPrediction,
      qualityPrediction,
      rankings,
      totalLatencyMs,
      timestamp: Date.now()
    };
  }
}
