import { IntentNode } from '../recognition/RecognitionTypes';
import { GridRules, GridType, LayoutDirection } from './BlueprintTypes';

export class GridPlanner {
  /**
   * Derives structural grid configuration for an IntentNode based on children counts and intent type.
   */
  public planGrid(node: IntentNode): { gridRules: GridRules; layoutDirection: LayoutDirection } {
    const type = node.type.toLowerCase();
    const childrenCount = node.children ? node.children.length : 0;

    let gridType: GridType = 'stack';
    let columns = 1;
    let gap = 16;
    let autoFit = false;
    let minColumnWidth: number | undefined = undefined;
    let layoutDirection: LayoutDirection = 'vertical';

    if (type.includes('page') || type.includes('landing_page')) {
      gridType = 'single_column';
      columns = 1;
      layoutDirection = 'vertical';
      gap = 32;
    } else if (type.includes('navbar') || type.includes('header')) {
      gridType = 'stack';
      columns = childrenCount > 0 ? childrenCount : 2;
      layoutDirection = 'horizontal';
      gap = 16;
    } else if (type.includes('hero') || type.includes('split')) {
      if (childrenCount >= 2) {
        gridType = 'split_layout';
        columns = 2;
        layoutDirection = 'horizontal';
        gap = 24;
      } else {
        gridType = 'single_column';
        columns = 1;
        layoutDirection = 'vertical';
        gap = 24;
      }
    } else if (type.includes('card_grid') || type.includes('grid') || type.includes('feature')) {
      if (childrenCount === 2) {
        gridType = 'two_column';
        columns = 2;
        layoutDirection = 'grid';
        gap = 24;
      } else if (childrenCount === 3) {
        gridType = 'three_column';
        columns = 3;
        layoutDirection = 'grid';
        gap = 24;
      } else if (childrenCount >= 4) {
        gridType = 'four_column';
        columns = 4;
        layoutDirection = 'grid';
        gap = 24;
      } else {
        gridType = 'responsive_grid';
        columns = 3;
        autoFit = true;
        minColumnWidth = 280;
        layoutDirection = 'grid';
        gap = 24;
      }
    } else if (type.includes('card') || type.includes('container')) {
      gridType = 'stack';
      columns = 1;
      layoutDirection = 'vertical';
      gap = 12;
    } else {
      // General fallbacks based on child count
      if (childrenCount > 1) {
        // Check if children are arranged horizontally or vertically in source metadata
        const isHorizontal = node.metadata?.layoutDirection === 'horizontal' || type.includes('button_group');
        if (isHorizontal) {
          gridType = 'stack';
          columns = childrenCount;
          layoutDirection = 'horizontal';
          gap = 16;
        } else {
          gridType = 'single_column';
          columns = 1;
          layoutDirection = 'vertical';
          gap = 16;
        }
      } else {
        gridType = 'stack';
        columns = 1;
        layoutDirection = 'vertical';
        gap = 12;
      }
    }

    return {
      gridRules: {
        gridType,
        columns,
        gap,
        autoFit,
        minColumnWidth
      },
      layoutDirection
    };
  }
}
