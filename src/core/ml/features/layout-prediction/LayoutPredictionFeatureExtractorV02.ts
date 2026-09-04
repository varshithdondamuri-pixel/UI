import { ExtractedFeatureValue, ExtractedFeatureVector } from './LayoutPredictionFeatureTypes';
import { LayoutPredictionFeatureExtractor } from './LayoutPredictionFeatureExtractor';
import { LayoutPredictionSidebarFeatures } from './LayoutPredictionSidebarFeatures';
import { LayoutPredictionStackFeatures } from './LayoutPredictionStackFeatures';
import { LayoutPredictionCenteredFeatures } from './LayoutPredictionCenteredFeatures';
import { LayoutPredictionGridFeaturesV02 } from './LayoutPredictionGridFeaturesV02';
import { LayoutPredictionMultiColumnFeatures } from './LayoutPredictionMultiColumnFeatures';
import { LayoutPredictionIrregularFeatures } from './LayoutPredictionIrregularFeatures';
import { LayoutPredictionLayoutStructureFeatures } from './LayoutPredictionLayoutStructureFeatures';

export class LayoutPredictionFeatureExtractorV02 {
  private v01Extractor: LayoutPredictionFeatureExtractor;
  private sidebarExtractor: LayoutPredictionSidebarFeatures;
  private stackExtractor: LayoutPredictionStackFeatures;
  private centeredExtractor: LayoutPredictionCenteredFeatures;
  private gridExtractor: LayoutPredictionGridFeaturesV02;
  private multiColumnExtractor: LayoutPredictionMultiColumnFeatures;
  private irregularExtractor: LayoutPredictionIrregularFeatures;
  private layoutStructureExtractor: LayoutPredictionLayoutStructureFeatures;

  constructor() {
    this.v01Extractor = new LayoutPredictionFeatureExtractor();
    this.sidebarExtractor = new LayoutPredictionSidebarFeatures();
    this.stackExtractor = new LayoutPredictionStackFeatures();
    this.centeredExtractor = new LayoutPredictionCenteredFeatures();
    this.gridExtractor = new LayoutPredictionGridFeaturesV02();
    this.multiColumnExtractor = new LayoutPredictionMultiColumnFeatures();
    this.irregularExtractor = new LayoutPredictionIrregularFeatures();
    this.layoutStructureExtractor = new LayoutPredictionLayoutStructureFeatures();
  }

  public extractAllFeatures(sample: any): ExtractedFeatureVector {
    // 1. Extract 103 v0.1 baseline features
    const v01Vector = this.v01Extractor.extractAllFeatures(sample);

    // 2. Extract 80 new v0.2 features across specialized layout groups
    const sidebar = this.sidebarExtractor.extractSidebarFeatures(sample);
    const stack = this.stackExtractor.extractStackFeatures(sample);
    const centered = this.centeredExtractor.extractCenteredFeatures(sample);
    const grid = this.gridExtractor.extractGridFeatures(sample);
    const multiColumn = this.multiColumnExtractor.extractMultiColumnFeatures(sample);
    const irregular = this.irregularExtractor.extractIrregularFeatures(sample);
    const layoutStructure = this.layoutStructureExtractor.extractLayoutStructureFeatures(sample);

    const mergedFeatures: Record<string, ExtractedFeatureValue> = {
      ...v01Vector.features,
      ...sidebar,
      ...stack,
      ...centered,
      ...grid,
      ...multiColumn,
      ...irregular,
      ...layoutStructure
    };

    // Calculate group availability
    const isTextOnly = sample?.sourceDataset === 'Screen2Words';
    const totalGroupCount = 13;
    const availableGroupCount = isTextOnly ? 0 : 13;

    return {
      sampleId: sample?.sampleId || 'sample_v02',
      features: mergedFeatures,
      availableGroupCount,
      totalGroupCount
    };
  }
}
