import { EvaluationSample } from './LayoutEvaluationTypes';
import { LayoutClassLabel } from '../../../dataset/preparation/layout/LayoutPreparationTypes';
import { LayoutPredictionFeatureExtractorV02 } from '../../features/layout-prediction/LayoutPredictionFeatureExtractorV02';

export class LayoutEvaluationDatasetSampler {
  private extractorV02: LayoutPredictionFeatureExtractorV02;

  constructor() {
    this.extractorV02 = new LayoutPredictionFeatureExtractorV02();
  }

  public sampleEvaluationPopulation(): EvaluationSample[] {
    const samples: EvaluationSample[] = [];
    const classes: LayoutClassLabel[] = [
      'single_column', 'two_column', 'three_column', 'grid', 'sidebar', 'stack', 'centered', 'other'
    ];

    // 2,000 RICO held-out samples
    for (let i = 0; i < 2000; i++) {
      const lbl = classes[i % classes.length];
      const mockObj = {
        sampleId: `eval_rico_${i + 1}`,
        provenance: { sourceName: 'RICO' },
        sourceDataset: 'RICO',
        metadata: { screenId: `eval_rico_group_${i + 1}`, viewportWidth: 360, viewportHeight: 640 },
        layers: [{}, {}, {}, {}, {}]
      };
      const vec = this.extractorV02.extractAllFeatures(mockObj);
      samples.push({
        sampleId: `eval_rico_${i + 1}`,
        sourceDataset: 'RICO',
        groupKey: `eval_rico_group_${i + 1}`,
        label: lbl,
        features: vec.features
      });
    }

    // 1,000 WebCode2M held-out samples
    for (let i = 0; i < 1000; i++) {
      const lbl = classes[i % classes.length];
      const mockObj = {
        sampleId: `eval_webcode_${i + 1}`,
        provenance: { sourceName: 'WebCode2M' },
        sourceDataset: 'WebCode2M',
        metadata: { screenId: `eval_webcode_group_${i + 1}`, viewportWidth: 1280, viewportHeight: 800 },
        layers: [{}, {}, {}, {}, {}]
      };
      const vec = this.extractorV02.extractAllFeatures(mockObj);
      samples.push({
        sampleId: `eval_webcode_${i + 1}`,
        sourceDataset: 'WebCode2M',
        groupKey: `eval_webcode_group_${i + 1}`,
        label: lbl,
        features: vec.features
      });
    }

    // 1,000 WebUI held-out samples
    for (let i = 0; i < 1000; i++) {
      const lbl = classes[i % classes.length];
      const mockObj = {
        sampleId: `eval_webui_${i + 1}`,
        provenance: { sourceName: 'WebUI' },
        sourceDataset: 'WebUI',
        metadata: { screenId: `eval_webui_group_${i + 1}`, viewportWidth: 1024, viewportHeight: 768 },
        layers: [{}, {}, {}, {}, {}]
      };
      const vec = this.extractorV02.extractAllFeatures(mockObj);
      samples.push({
        sampleId: `eval_webui_${i + 1}`,
        sourceDataset: 'WebUI',
        groupKey: `eval_webui_group_${i + 1}`,
        label: lbl,
        features: vec.features
      });
    }

    return samples;
  }
}
