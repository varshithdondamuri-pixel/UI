import { DesignPreferenceExample, PreferenceSample } from './DatasetTypes';
import { sanitizeText } from './DatasetSchema';

export class PreferenceDatasetBuilder {
  public buildSample(
    alternatives: any[],
    selectedVariant: any,
    reason: string = 'User selected preferred design variant',
    qualityScores: Record<string, number> = {},
    userChanges: any[] = [],
    finalOutcome: string = 'approved',
    preferenceExamples: DesignPreferenceExample[] = []
  ): PreferenceSample {
    const safeAlternatives = alternatives || (selectedVariant ? [selectedVariant] : []);
    const sanitizedReason = sanitizeText(reason);

    return {
      alternatives: safeAlternatives,
      selection: selectedVariant || safeAlternatives[0] || null,
      reason: sanitizedReason,
      qualityScores,
      userChanges,
      finalOutcome,
      preferenceExamples: preferenceExamples.length > 0 ? preferenceExamples : this.generateDefaultExamples(sanitizedReason)
    };
  }

  public createStructuredPreferenceExample(
    userRequest: string,
    beforeState: any,
    afterState: any,
    isApproved: boolean = true,
    qualityDelta: number = 5.0
  ): DesignPreferenceExample {
    const req = sanitizeText(userRequest);
    const parsed = this.parseUserRequest(req);

    return {
      request: req,
      target: parsed.target,
      changeType: parsed.changeType,
      before: beforeState || null,
      after: afterState || null,
      outcome: isApproved ? 'accepted' : 'rejected',
      approval: isApproved,
      qualityDelta
    };
  }

  private parseUserRequest(request: string): { target: string; changeType: string } {
    const lower = request.toLowerCase();

    if (lower.includes('hero')) {
      if (lower.includes('smaller') || lower.includes('compact')) {
        return { target: 'hero_section', changeType: 'resize_smaller' };
      }
      return { target: 'hero_section', changeType: 'layout_enhancement' };
    }
    if (lower.includes('premium')) {
      return { target: 'global_theme', changeType: 'style_upgrade_premium' };
    }
    if (lower.includes('dark') || lower.includes('theme')) {
      return { target: 'color_theme', changeType: 'theme_dark_mode' };
    }
    if (lower.includes('card') || lower.includes('compact')) {
      return { target: 'card_components', changeType: 'density_increase' };
    }
    if (lower.includes('mobile') || lower.includes('responsive')) {
      return { target: 'viewport_layout', changeType: 'responsive_mobile_opt' };
    }
    if (lower.includes('cta') || lower.includes('button')) {
      return { target: 'cta_button', changeType: 'visual_prominence' };
    }
    if (lower.includes('whitespace') || lower.includes('padding') || lower.includes('margin')) {
      return { target: 'layout_spacing', changeType: 'increase_whitespace' };
    }
    if (lower.includes('typography') || lower.includes('font') || lower.includes('clean')) {
      return { target: 'typography_system', changeType: 'font_hierarchy' };
    }

    return { target: 'ui_component', changeType: 'custom_modifier' };
  }

  private generateDefaultExamples(reason: string): DesignPreferenceExample[] {
    return [
      {
        request: reason || 'Make the hero section smaller and increase CTA prominence',
        target: 'hero_section',
        changeType: 'resize_smaller',
        before: { height: 600, padding: 48 },
        after: { height: 420, padding: 32 },
        outcome: 'accepted',
        approval: true,
        qualityDelta: 6.5
      }
    ];
  }
}
