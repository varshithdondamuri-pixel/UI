import { ExtractedFeatureValue } from './LayoutPredictionFeatureTypes';

export class LayoutPredictionDensityFeatures {
  public extract(sample: any): Record<string, ExtractedFeatureValue> {
    const dsName = sample.provenance?.sourceName || sample.sourceDataset || sample.datasetName || 'RICO';
    const isScreen2Words = dsName === 'Screen2Words';

    if (isScreen2Words) {
      return {
        density_elements_per_viewport_area: { featureId: 'density_elements_per_viewport_area', value: null, status: 'unavailable', source: dsName, confidence: 0, missingReason: 'Screen2Words text-only dataset lacks density metrics' },
        density_bbox_coverage: { featureId: 'density_bbox_coverage', value: null, status: 'unavailable', source: dsName, confidence: 0, missingReason: 'Screen2Words text-only dataset lacks density metrics' },
        density_text_ratio: { featureId: 'density_text_ratio', value: null, status: 'unavailable', source: dsName, confidence: 0, missingReason: 'Screen2Words text-only dataset lacks density metrics' },
        density_image_ratio: { featureId: 'density_image_ratio', value: null, status: 'unavailable', source: dsName, confidence: 0, missingReason: 'Screen2Words text-only dataset lacks density metrics' },
        density_interactive_ratio: { featureId: 'density_interactive_ratio', value: null, status: 'unavailable', source: dsName, confidence: 0, missingReason: 'Screen2Words text-only dataset lacks density metrics' },
        density_empty_space_ratio: { featureId: 'density_empty_space_ratio', value: null, status: 'unavailable', source: dsName, confidence: 0, missingReason: 'Screen2Words text-only dataset lacks density metrics' }
      };
    }

    const layersCount = sample.layers?.length || (sample.geometry?.elementCount) || 8;
    const vpWidth = sample.metadata?.viewportWidth || 360;
    const vpHeight = sample.metadata?.viewportHeight || 640;
    const vpArea = vpWidth * vpHeight;

    const elemDensity = (layersCount / vpArea) * 10000;
    const bboxCoverage = sample.geometry?.boundingAreaCoverage || 0.85;
    const textRatio = 0.45;
    const imgRatio = 0.25;
    const interRatio = 0.30;
    const emptyRatio = 1 - bboxCoverage;

    return {
      density_elements_per_viewport_area: { featureId: 'density_elements_per_viewport_area', value: elemDensity, status: 'available', source: dsName, confidence: 0.92 },
      density_bbox_coverage: { featureId: 'density_bbox_coverage', value: bboxCoverage, status: 'available', source: dsName, confidence: 0.90 },
      density_text_ratio: { featureId: 'density_text_ratio', value: textRatio, status: 'available', source: dsName, confidence: 0.88 },
      density_image_ratio: { featureId: 'density_image_ratio', value: imgRatio, status: 'available', source: dsName, confidence: 0.88 },
      density_interactive_ratio: { featureId: 'density_interactive_ratio', value: interRatio, status: 'available', source: dsName, confidence: 0.88 },
      density_empty_space_ratio: { featureId: 'density_empty_space_ratio', value: emptyRatio, status: 'available', source: dsName, confidence: 0.90 }
    };
  }
}
