import { BoundingBox } from '../../types';

import { LayoutStructure, RecognizedShape, SpatialRelationship } from './RecognitionTypes';
import { RecognitionUtilities } from './RecognitionUtilities';

export class LayoutAnalyzer {
  /**
   * Detects simple macro and micro layout structures.
   * Only detects; does not generate layout code or modify objects.
   */
  public analyzeLayouts(
    shapes: RecognizedShape[],
    relationships: SpatialRelationship[],
    canvasBounds?: BoundingBox
  ): LayoutStructure[] {
    const layouts: LayoutStructure[] = [];

    // Filter top-level shapes (not contained inside any other shape)
    const topLevelShapes = shapes.filter((s) => {
      if (s.classifiedKind === 'text') return false; // Ignore standalone text for macro layout
      return !relationships.some((r) => r.sourceNodeId === s.id && r.type === 'inside');
    });

    if (topLevelShapes.length === 0) {
      return layouts;
    }

    let layoutCounter = 1;
    const addLayout = (
      type: LayoutStructure['type'],
      nodeIds: string[],
      bounds: BoundingBox,
      confidence: number,
      metadata?: Record<string, any>
    ) => {
      layouts.push({
        id: `layout-${layoutCounter++}`,
        type,
        nodeIds,
        bounds,
        confidence: Math.round(confidence * 100) / 100,
        metadata
      });
    };

    // 1. Header Detection
    const headerCandidates = topLevelShapes.filter((s) => {
      const isWide = s.bounds.width >= 250 || s.bounds.width / s.bounds.height >= 2.5;
      const isTop = s.bounds.minY <= 150;
      return isWide && isTop;
    });

    for (const h of headerCandidates) {
      const conf = Math.min(0.95, 0.7 + (h.bounds.width / Math.max(1, h.bounds.height)) * 0.05);
      addLayout('header', [h.id], h.bounds, conf, { label: h.label });
    }

    // 2. Footer Detection
    if (topLevelShapes.length >= 2) {
      const sortedByY = [...topLevelShapes].sort((a, b) => b.bounds.maxY - a.bounds.maxY);
      const bottomShape = sortedByY[0];
      if (
        bottomShape &&
        (bottomShape.bounds.width >= 250 || bottomShape.bounds.width / bottomShape.bounds.height >= 2.5)
      ) {
        // Ensure it's in the lower third
        const overallUnion = RecognitionUtilities.computeUnionBounds(topLevelShapes.map((s) => s.bounds));
        if (bottomShape.bounds.minY >= overallUnion.minY + overallUnion.height * 0.6) {
          addLayout('footer', [bottomShape.id], bottomShape.bounds, 0.88, { label: bottomShape.label });
        }
      }
    }

    // 3. Sidebar Layout Detection
    const sidebarCandidates = topLevelShapes.filter((s) => {
      const isTall = s.bounds.height / s.bounds.width >= 1.8 && s.bounds.height >= 200;
      return isTall;
    });

    for (const sb of sidebarCandidates) {
      addLayout('sidebar_layout', [sb.id], sb.bounds, 0.85, { label: sb.label });
    }

    // 4. Vertical Stack & Horizontal Stack Detection
    if (topLevelShapes.length >= 2) {
      // Group by X alignment (Vertical Stack)
      const vStackGroups: RecognizedShape[][] = [];
      for (const s of topLevelShapes) {
        const center = RecognitionUtilities.getCenter(s.bounds);
        let added = false;
        for (const group of vStackGroups) {
          const groupCenter = RecognitionUtilities.getCenter(group[0].bounds);
          if (Math.abs(center.x - groupCenter.x) <= 40) {
            group.push(s);
            added = true;
            break;
          }
        }
        if (!added) {
          vStackGroups.push([s]);
        }
      }

      for (const group of vStackGroups) {
        if (group.length >= 2) {
          const bounds = RecognitionUtilities.computeUnionBounds(group.map((s) => s.bounds));
          const conf = Math.min(0.95, 0.65 + group.length * 0.1);
          addLayout(
            'vertical_stack',
            group.map((s) => s.id),
            bounds,
            conf,
            { count: group.length }
          );
        }
      }

      // Group by Y alignment (Horizontal Stack)
      const hStackGroups: RecognizedShape[][] = [];
      for (const s of topLevelShapes) {
        const center = RecognitionUtilities.getCenter(s.bounds);
        let added = false;
        for (const group of hStackGroups) {
          const groupCenter = RecognitionUtilities.getCenter(group[0].bounds);
          if (Math.abs(center.y - groupCenter.y) <= 40) {
            group.push(s);
            added = true;
            break;
          }
        }
        if (!added) {
          hStackGroups.push([s]);
        }
      }

      for (const group of hStackGroups) {
        if (group.length >= 2) {
          const bounds = RecognitionUtilities.computeUnionBounds(group.map((s) => s.bounds));
          const conf = Math.min(0.95, 0.65 + group.length * 0.1);
          addLayout(
            'horizontal_stack',
            group.map((s) => s.id),
            bounds,
            conf,
            { count: group.length }
          );
        }
      }

      // 5. Column Layouts (Single, Two, Three)
      const cols = hStackGroups.filter((g) => g.length >= 2);
      if (cols.length > 0) {
        const maxCols = Math.max(...cols.map((g) => g.length));
        const sampleGroup = cols.find((g) => g.length === maxCols)!;
        const bounds = RecognitionUtilities.computeUnionBounds(sampleGroup.map((s) => s.bounds));
        if (maxCols === 2) {
          addLayout('two_column', sampleGroup.map((s) => s.id), bounds, 0.85);
        } else if (maxCols === 3) {
          addLayout('three_column', sampleGroup.map((s) => s.id), bounds, 0.9);
        }
      } else if (vStackGroups.length === 1 && topLevelShapes.length >= 3) {
        const bounds = RecognitionUtilities.computeUnionBounds(topLevelShapes.map((s) => s.bounds));
        addLayout('single_column', topLevelShapes.map((s) => s.id), bounds, 0.88);
      }

      // 6. Grid Detection
      if (topLevelShapes.length >= 4) {
        // Check if elements are arranged in rows and columns
        const isGrid = vStackGroups.length >= 2 && hStackGroups.length >= 2;
        if (isGrid) {
          const bounds = RecognitionUtilities.computeUnionBounds(topLevelShapes.map((s) => s.bounds));
          addLayout(
            'grid',
            topLevelShapes.map((s) => s.id),
            bounds,
            0.88,
            { rows: hStackGroups.length, columns: vStackGroups.length }
          );
        }
      }

      // 7. Centered Layout
      const overallUnion = RecognitionUtilities.computeUnionBounds(topLevelShapes.map((s) => s.bounds));
      const overallCenter = RecognitionUtilities.getCenter(overallUnion);
      if (canvasBounds) {
        const canvasCenter = RecognitionUtilities.getCenter(canvasBounds);
        const dist = RecognitionUtilities.pointDistance(overallCenter, canvasCenter);
        if (dist <= 50) {
          addLayout(
            'centered_layout',
            topLevelShapes.map((s) => s.id),
            overallUnion,
            0.82
          );
        }
      }
    }

    return layouts;
  }
}
