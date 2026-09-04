import { RegisteredModel } from './MLTypes';

export class ModelRegistry {
  private models: Map<string, RegisteredModel> = new Map();

  constructor() {
    this.registerDefaultModels();
  }

  private registerDefaultModels(): void {
    const defaultModels: RegisteredModel[] = [
      {
        id: 'model-sketch-classifier',
        name: 'SketchClassifier',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['rawStrokes', 'boundingBox', 'aspectRatio'],
        outputSchema: ['shapeKind', 'confidence'],
        metrics: { accuracy: 0.94, precision: 0.93, recall: 0.92, f1Score: 0.925, confidence: 0.94, predictionLatencyMs: 1.2, coverage: 98 }
      },
      {
        id: 'model-component-recognizer',
        name: 'ComponentRecognizer',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['shapes', 'spatialRelationships'],
        outputSchema: ['semanticComponentType', 'role'],
        metrics: { accuracy: 0.92, precision: 0.91, recall: 0.90, f1Score: 0.905, confidence: 0.92, predictionLatencyMs: 2.1, coverage: 95 }
      },
      {
        id: 'model-layout-predictor',
        name: 'LayoutPredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['intentTree', 'industry', 'device'],
        outputSchema: ['recommendedLayout', 'gridStructure'],
        metrics: { accuracy: 0.91, precision: 0.90, recall: 0.89, f1Score: 0.895, confidence: 0.91, predictionLatencyMs: 2.8, coverage: 96 }
      },
      {
        id: 'model-style-predictor',
        name: 'StylePredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['industry', 'audience', 'purpose'],
        outputSchema: ['designStyle', 'surfaceMaterial'],
        metrics: { accuracy: 0.93, precision: 0.92, recall: 0.91, f1Score: 0.915, confidence: 0.93, predictionLatencyMs: 1.5, coverage: 94 }
      },
      {
        id: 'model-color-predictor',
        name: 'ColorPredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['industry', 'accessibility', 'theme'],
        outputSchema: ['colorStrategy', 'contrastScore', 'a11yScore'],
        metrics: { accuracy: 0.96, precision: 0.95, recall: 0.94, f1Score: 0.945, confidence: 0.96, predictionLatencyMs: 1.8, coverage: 99 }
      },
      {
        id: 'model-typography-predictor',
        name: 'TypographyPredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['style', 'contentDensity', 'readingPattern'],
        outputSchema: ['typeScale', 'fontPairing', 'hierarchy'],
        metrics: { accuracy: 0.92, precision: 0.91, recall: 0.90, f1Score: 0.905, confidence: 0.92, predictionLatencyMs: 1.4, coverage: 96 }
      },
      {
        id: 'model-accessibility-predictor',
        name: 'AccessibilityPredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['colorPalette', 'touchTargets', 'fontSize', 'ariaRoles'],
        outputSchema: ['wcagLevel', 'complianceScore'],
        metrics: { accuracy: 0.98, precision: 0.97, recall: 0.96, f1Score: 0.965, confidence: 0.98, predictionLatencyMs: 1.1, coverage: 100 }
      },
      {
        id: 'model-quality-predictor',
        name: 'QualityPredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['visualDesignModel', 'spacingGrid', 'hierarchyScore'],
        outputSchema: ['designQualityScore', 'readabilityScore'],
        metrics: { accuracy: 0.94, precision: 0.93, recall: 0.92, f1Score: 0.925, confidence: 0.94, predictionLatencyMs: 2.2, coverage: 97 }
      },
      {
        id: 'model-trend-predictor',
        name: 'TrendPredictor',
        version: '1.0.0',
        status: 'ready',
        inputSchema: ['industry', 'freshnessWeight', 'popularityScore'],
        outputSchema: ['recommendedTrend', 'trendConfidence'],
        metrics: { accuracy: 0.89, precision: 0.88, recall: 0.87, f1Score: 0.875, confidence: 0.89, predictionLatencyMs: 1.3, coverage: 92 }
      }
    ];

    for (const m of defaultModels) {
      this.models.set(m.id, m);
    }
  }

  public registerModel(model: RegisteredModel): void {
    this.models.set(model.id, { ...model });
  }

  public getModel(id: string): RegisteredModel | null {
    return this.models.get(id) || null;
  }

  public getAllModels(): RegisteredModel[] {
    return Array.from(this.models.values());
  }

  public updateModelStatus(id: string, status: RegisteredModel['status']): void {
    const model = this.models.get(id);
    if (model) {
      model.status = status;
    }
  }
}
