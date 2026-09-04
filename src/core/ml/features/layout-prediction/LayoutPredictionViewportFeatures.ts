import { ExtractedFeatureValue } from './LayoutPredictionFeatureTypes';

export class LayoutPredictionViewportFeatures {
  public extract(sample: any): Record<string, ExtractedFeatureValue> {
    const dsName = sample.provenance?.sourceName || sample.sourceDataset || sample.datasetName || 'RICO';
    const vpWidth = sample.metadata?.viewportWidth || sample.geometry?.viewportWidth || 360;
    const vpHeight = sample.metadata?.viewportHeight || sample.geometry?.viewportHeight || 640;
    const aspect = vpWidth > 0 ? vpWidth / vpHeight : 0.5625;
    const orientation = aspect >= 1.0 ? 'landscape' : 'portrait';
    const vpArea = vpWidth * vpHeight;

    return {
      viewport_width: { featureId: 'viewport_width', value: vpWidth, status: 'available', source: dsName, confidence: 1.0 },
      viewport_height: { featureId: 'viewport_height', value: vpHeight, status: 'available', source: dsName, confidence: 1.0 },
      viewport_aspect_ratio: { featureId: 'viewport_aspect_ratio', value: aspect, status: 'available', source: dsName, confidence: 1.0 },
      viewport_orientation: { featureId: 'viewport_orientation', value: orientation, status: 'available', source: dsName, confidence: 1.0 },
      viewport_area: { featureId: 'viewport_area', value: vpArea, status: 'available', source: dsName, confidence: 1.0 }
    };
  }
}
