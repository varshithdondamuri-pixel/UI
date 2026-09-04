import { FullDesignSample } from '../../../dataset/DatasetTypes';
import { UIUnderstandingFeatureExtractor } from './UIUnderstandingFeatureExtractor';
import {
  DatasetCoverageMatrix,
  ExpandedUIFeatureVector,
  FeatureStats,
  UIUnderstandingFeatureGroup
} from './UIUnderstandingFeatureTypes';

export class UIUnderstandingFeatureSchemaRegistry {
  private extractor: UIUnderstandingFeatureExtractor;

  constructor() {
    this.extractor = new UIUnderstandingFeatureExtractor();
  }

  public getImmutableVersionV01(): { versionId: string; description: string; featureCount: number } {
    return {
      versionId: 'ui_understanding-features-v0.1',
      description: 'Phase 12.75 Metadata Proxy Baseline Feature Schema (Immutable)',
      featureCount: 5
    };
  }

  public getExpandedVersionV02(): { versionId: string; description: string; featureGroupsCount: number } {
    return {
      versionId: 'ui-understanding-features-v0.2',
      description: 'Phase 13.75 Expanded UI Understanding Feature Schema across 18 Feature Groups',
      featureGroupsCount: 18
    };
  }

  /**
   * Generates feature statistics across samples for schema v0.2.
   */
  public computeFeatureStatistics(samples: FullDesignSample[]): FeatureStats[] {
    if (samples.length === 0) return [];

    const vectors: ExpandedUIFeatureVector[] = samples.map((s) => this.extractor.extractExpandedFeatures(s));
    const firstVec = vectors[0]?.features || {};
    const featIds = Object.keys(firstVec);

    const statsList: FeatureStats[] = [];

    for (const fid of featIds) {
      const vals: number[] = [];
      let missingCount = 0;
      const sourceCoverage: Record<string, number> = {};

      for (let i = 0; i < vectors.length; i++) {
        const vec = vectors[i];
        const feat = vec.features[fid];
        const srcName = samples[i].provenance?.sourceDataset || 'External';

        if (!feat || feat.availability === 'unavailable') {
          missingCount++;
        } else {
          const num = Number(feat.value);
          if (!isNaN(num)) {
            vals.push(num);
          }
          sourceCoverage[srcName] = (sourceCoverage[srcName] || 0) + 1;
        }
      }

      const total = vectors.length;
      const missingRate = parseFloat((missingCount / total).toFixed(4));
      const sorted = [...vals].sort((a, b) => a - b);
      const min = sorted.length > 0 ? sorted[0] : 0;
      const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
      const mean = sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
      const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
      const variance = sorted.length > 1 ? sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sorted.length - 1) : 0;
      const stdDev = Math.sqrt(variance);

      statsList.push({
        featureId: fid,
        count: vals.length,
        missingCount,
        missingRate,
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        mean: parseFloat(mean.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        uniqueCount: new Set(vals).size,
        sourceCoverage
      });
    }

    return statsList;
  }

  /**
   * Generates the Dataset Coverage Matrix for all 18 feature groups.
   */
  public generateDatasetCoverageMatrix(): DatasetCoverageMatrix {
    const featureGroups: UIUnderstandingFeatureGroup[] = [
      'geometry',
      'spatial',
      'alignment',
      'spacing',
      'density',
      'components',
      'component_composition',
      'text',
      'hierarchy',
      'visual',
      'typography',
      'viewport',
      'semantic',
      'intent',
      'blueprint',
      'visual_design',
      'quality',
      'provenance'
    ];

    const matrix: any = {};

    for (const fg of featureGroups) {
      matrix[fg] = {
        RICO: fg === 'visual' || fg === 'typography' || fg === 'intent' || fg === 'blueprint' || fg === 'visual_design' ? 'UNAVAILABLE' : fg === 'hierarchy' ? 'SUPPORTED' : 'PARTIAL',
        Screen2Words: fg === 'text' || fg === 'components' ? 'SUPPORTED' : fg === 'visual' || fg === 'typography' || fg === 'intent' || fg === 'blueprint' || fg === 'visual_design' ? 'UNAVAILABLE' : 'PARTIAL',
        WebCode2M: fg === 'geometry' || fg === 'components' || fg === 'text' ? 'SUPPORTED' : fg === 'intent' || fg === 'blueprint' || fg === 'visual_design' ? 'UNAVAILABLE' : 'PARTIAL',
        WebUI: fg === 'geometry' || fg === 'components' || fg === 'text' || fg === 'viewport' || fg === 'density' ? 'SUPPORTED' : fg === 'intent' || fg === 'blueprint' ? 'UNAVAILABLE' : 'PARTIAL'
      };
    }

    return {
      featureGroups: matrix,
      lastUpdated: new Date().toISOString()
    };
  }
}
