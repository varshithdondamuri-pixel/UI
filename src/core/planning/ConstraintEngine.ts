import { IntentNode } from '../recognition/RecognitionTypes';
import { AlignmentRule, DistributionRule, LayoutConstraints } from './BlueprintTypes';

export class ConstraintEngine {
  /**
   * Derive layout constraints (minWidth, maxWidth, preferredWidth, container rules, etc.)
   */
  public planConstraints(node: IntentNode): {
    constraints: LayoutConstraints;
    alignment: AlignmentRule;
    distribution: DistributionRule;
  } {
    const type = node.type.toLowerCase();
    const rawBounds = node.metadata?.bounds || { width: 1200, height: 400 };

    let minWidth = 320;
    let maxWidth = 1440;
    let preferredWidth = Math.max(320, Math.min(1440, rawBounds.width || 1200));
    let minHeight: number | undefined = undefined;
    let maxHeight: number | undefined = undefined;
    let preferredHeight: number | undefined = rawBounds.height > 0 ? rawBounds.height : undefined;
    let aspectRatio: number | undefined = undefined;

    let alignment: AlignmentRule = { horizontal: 'center', vertical: 'center' };
    let distribution: DistributionRule = 'start';

    let containerRules = {
      fullWidth: false,
      maxContentWidth: 1200,
      centered: true
    };

    if (type.includes('page') || type.includes('landing_page')) {
      minWidth = 320;
      maxWidth = 1920;
      preferredWidth = 1440;
      containerRules.fullWidth = true;
      containerRules.maxContentWidth = 1440;
      alignment = { horizontal: 'stretch', vertical: 'stretch' };
      distribution = 'stretch';
    } else if (type.includes('navbar') || type.includes('header')) {
      minWidth = 320;
      maxWidth = 1920;
      preferredWidth = 1440;
      minHeight = 60;
      maxHeight = 100;
      preferredHeight = 80;
      containerRules.fullWidth = true;
      containerRules.maxContentWidth = 1280;
      alignment = { horizontal: 'stretch', vertical: 'center' };
      distribution = 'space-between';
    } else if (type.includes('hero')) {
      minWidth = 320;
      maxWidth = 1920;
      preferredWidth = 1440;
      minHeight = 400;
      preferredHeight = 600;
      containerRules.fullWidth = true;
      containerRules.maxContentWidth = 1200;
      alignment = { horizontal: 'center', vertical: 'center' };
      distribution = 'center';
    } else if (type.includes('card_grid') || type.includes('grid')) {
      minWidth = 300;
      maxWidth = 1280;
      preferredWidth = 1200;
      containerRules.fullWidth = false;
      containerRules.maxContentWidth = 1200;
      alignment = { horizontal: 'stretch', vertical: 'stretch' };
      distribution = 'space-between';
    } else if (type.includes('card')) {
      minWidth = 240;
      maxWidth = 400;
      preferredWidth = 320;
      minHeight = 180;
      preferredHeight = 280;
      aspectRatio = 1.2;
      containerRules.fullWidth = false;
      containerRules.maxContentWidth = 400;
      alignment = { horizontal: 'stretch', vertical: 'stretch' };
      distribution = 'start';
    } else if (type.includes('button')) {
      minWidth = 100;
      maxWidth = 300;
      preferredWidth = 160;
      minHeight = 40;
      maxHeight = 56;
      preferredHeight = 48;
      containerRules.fullWidth = false;
      containerRules.maxContentWidth = 300;
      alignment = { horizontal: 'center', vertical: 'center' };
      distribution = 'center';
    } else if (type.includes('footer')) {
      minWidth = 320;
      maxWidth = 1920;
      preferredWidth = 1440;
      minHeight = 120;
      preferredHeight = 240;
      containerRules.fullWidth = true;
      containerRules.maxContentWidth = 1280;
      alignment = { horizontal: 'stretch', vertical: 'center' };
      distribution = 'space-between';
    }

    const constraints: LayoutConstraints = {
      minWidth,
      maxWidth,
      preferredWidth,
      minHeight,
      maxHeight,
      preferredHeight,
      aspectRatio,
      alignment: `${alignment.horizontal}-${alignment.vertical}`,
      containerRules
    };

    return { constraints, alignment, distribution };
  }
}
