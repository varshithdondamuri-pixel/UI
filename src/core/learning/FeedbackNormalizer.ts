import { NormalizedFeedback } from './FeedbackTypes';

export class FeedbackNormalizer {
  /**
   * Normalizes arbitrary feedback string into structured categorical feedback object.
   */
  public normalizeTextFeedback(rawText: string): NormalizedFeedback {
    const text = rawText.toLowerCase().trim();

    let category: NormalizedFeedback['category'] = 'other';
    let target = 'general';
    let action: NormalizedFeedback['action'] = 'change';
    let direction: NormalizedFeedback['direction'] = 'custom';

    // 1. Identify category & target
    if (text.includes('hero') || text.includes('header') || text.includes('sidebar') || text.includes('footer') || text.includes('layout') || text.includes('grid')) {
      category = 'layout';
      if (text.includes('hero')) target = 'hero';
      else if (text.includes('header')) target = 'header';
      else if (text.includes('sidebar')) target = 'sidebar';
      else if (text.includes('footer')) target = 'footer';
    } else if (text.includes('color') || text.includes('background') || text.includes('contrast') || text.includes('theme')) {
      category = 'colors';
      target = 'theme';
    } else if (text.includes('font') || text.includes('typography') || text.includes('text size') || text.includes('title')) {
      category = 'typography';
      target = 'typography';
    } else if (text.includes('spacing') || text.includes('padding') || text.includes('margin') || text.includes('gap')) {
      category = 'spacing';
      target = 'spacing';
    } else if (text.includes('button') || text.includes('card') || text.includes('input') || text.includes('component')) {
      category = 'components';
      if (text.includes('button')) target = 'button';
      else if (text.includes('card')) target = 'card';
    } else if (text.includes('mobile') || text.includes('responsive') || text.includes('screen') || text.includes('tablet')) {
      category = 'responsive';
      target = 'responsive';
    } else if (text.includes('accessibility') || text.includes('aria') || text.includes('wcag') || text.includes('keyboard')) {
      category = 'accessibility';
      target = 'accessibility';
    } else if (text.includes('nav') || text.includes('flow') || text.includes('ux') || text.includes('cta')) {
      category = 'ux';
      target = 'navigation';
    }

    // 2. Identify action
    if (text.includes('smaller') || text.includes('larger') || text.includes('resize') || text.includes('scale')) {
      action = 'resize';
    } else if (text.includes('move') || text.includes('reorder') || text.includes('swap')) {
      action = 'reorder';
    } else if (text.includes('add') || text.includes('include') || text.includes('insert')) {
      action = 'add';
    } else if (text.includes('remove') || text.includes('delete') || text.includes('hide')) {
      action = 'remove';
    } else if (text.includes('color') || text.includes('darker') || text.includes('lighter')) {
      action = 'recolor';
    } else if (text.includes('font') || text.includes('style')) {
      action = 'restyle';
    }

    // 3. Identify direction
    if (text.includes('smaller') || text.includes('decrease') || text.includes('reduce') || text.includes('compact')) {
      direction = 'decrease';
    } else if (text.includes('larger') || text.includes('increase') || text.includes('bigger') || text.includes('expand')) {
      direction = 'increase';
    } else if (text.includes('left')) {
      direction = 'left';
    } else if (text.includes('right')) {
      direction = 'right';
    } else if (text.includes('up') || text.includes('top')) {
      direction = 'up';
    } else if (text.includes('down') || text.includes('bottom')) {
      direction = 'down';
    }

    return {
      id: 'norm_' + Math.random().toString(36).substring(2, 9),
      category,
      target,
      action,
      direction,
      source: 'user',
      rawText,
      confidence: 0.9
    };
  }
}
