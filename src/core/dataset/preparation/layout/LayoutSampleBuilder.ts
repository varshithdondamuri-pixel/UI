import { FullDesignSample } from '../../DatasetTypes';
import { ExtractedGeometry } from './LayoutGeometryExtractor';
import { ExtractedStructure } from './LayoutStructureExtractor';
import { LayoutDerivedLabel, LayoutPreparationSample } from './LayoutPreparationTypes';

export class LayoutSampleBuilder {
  public buildSample(
    sample: FullDesignSample,
    geom: ExtractedGeometry,
    struct: ExtractedStructure,
    derivedLabel: LayoutDerivedLabel | null
  ): LayoutPreparationSample {
    const s = sample as any;
    const dsName = s.provenance?.sourceName || s.datasetName || 'RICO';
    const sampleId = s.sampleId || s.id || 'sample_1';
    const groupId = (s.metadata?.screenId || s.metadata?.documentId || sampleId) as string;
    const isValid = derivedLabel !== null;

    return {
      sampleId: `layout_prep_${dsName}_${sampleId}`,
      sourceDataset: dsName,
      sourceRecordId: sampleId,
      groupId,
      derivedLabel: derivedLabel || {
        label: 'other',
        labelSource: 'deterministic_rule_engine',
        labelConfidence: 'low',
        derivationEvidence: ['Text summary only'],
        sourceDataset: dsName,
        sourceRecordId: sampleId,
        geometryEvidence: {
          boundingBoxesCount: 0,
          alignedColumnsCount: 0,
          alignedRowsCount: 0,
          hasSidebarRegion: false,
          hasSymmetricMargins: false,
          aspectRatio: 1
        },
        structureEvidence: {
          containerType: 'none',
          parentChildCount: 0
        }
      },
      geometry: {
        viewportWidth: geom.viewportWidth,
        viewportHeight: geom.viewportHeight,
        elementCount: geom.boundingBoxesCount,
        boundingAreaCoverage: geom.boundingAreaCoverage
      },
      structure: {
        hierarchyDepth: struct.hierarchyDepth,
        containerCount: struct.containerCount
      },
      qualityStatus: isValid ? 'valid' : 'rejected',
      rejectionReason: isValid ? undefined : 'Screen2Words dataset lacks observable geometry/layout evidence'
    };
  }
}
