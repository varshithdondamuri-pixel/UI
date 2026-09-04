import { FullDesignSample } from '../../DatasetTypes';

export interface ExtractedStructure {
  containerType: string;
  flexDirection?: string;
  gridTemplate?: string;
  parentChildCount: number;
  hierarchyDepth: number;
  containerCount: number;
}

export class LayoutStructureExtractor {
  public extractStructure(sample: FullDesignSample): ExtractedStructure {
    const s = sample as any;
    const layersCount = s.layers?.length || 1;
    const hierarchyDepth = Math.min(Math.ceil(layersCount / 3), 5);
    const containerCount = Math.max(Math.floor(layersCount / 2), 1);

    let containerType = 'stack';
    let flexDirection = 'column';
    let gridTemplate: string | undefined = undefined;

    const dsName = s.provenance?.sourceName || s.datasetName || 'RICO';

    if (dsName === 'WebCode2M') {
      containerType = 'grid';
      gridTemplate = 'repeat(3, 1fr)';
    } else if (dsName === 'WebUI') {
      containerType = 'flex';
      flexDirection = 'row';
    }

    return {
      containerType,
      flexDirection,
      gridTemplate,
      parentChildCount: layersCount,
      hierarchyDepth,
      containerCount
    };
  }
}
