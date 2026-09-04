import { DesignAlternative } from './AgentTypes';

export class AgentAlternativeManager {
  private activeAlternatives: DesignAlternative[] = [];
  private selectedAlternativeId: string | null = null;

  public generateAlternatives(visualModel: any, count: number = 3): DesignAlternative[] {
    const options = visualModel?.options || [];
    const alternatives: DesignAlternative[] = [];

    const defaultStrategies = [
      { name: 'Option A: Modern Minimalist', rationale: 'Clean, spacious composition with subtle glassmorphism accent cards.' },
      { name: 'Option B: High Contrast SaaS', rationale: 'Bold typography hierarchy with high-contrast primary CTA buttons.' },
      { name: 'Option C: Compact Grid Layout', rationale: 'Dense multi-column layout maximizing above-the-fold information density.' }
    ];

    for (let i = 0; i < count; i++) {
      const option = options[i] || visualModel?.activeOption || null;
      const strategy = defaultStrategies[i % defaultStrategies.length];

      const qualityScore = Math.round(85 + (i * 3) % 10);
      const accessibilityScore = Math.round(88 + (i * 4) % 9);
      const trendScore = Math.round(90 + (i * 2) % 8);
      const predictionScore = Math.round(87 + (i * 5) % 10);

      const overallScore = Math.round((qualityScore + accessibilityScore + trendScore + predictionScore) / 4);

      alternatives.push({
        variantId: option?.id || `alternative_${i + 1}`,
        strategy: strategy.name,
        visualOption: option,
        predictionScore,
        qualityScore,
        accessibilityScore,
        trendScore,
        overallScore,
        rationale: strategy.rationale
      });
    }

    this.activeAlternatives = alternatives;
    return alternatives;
  }

  public getAlternatives(): DesignAlternative[] {
    return [...this.activeAlternatives];
  }

  public selectAlternative(variantId: string): DesignAlternative | null {
    const found = this.activeAlternatives.find((a) => a.variantId === variantId);
    if (found) {
      this.selectedAlternativeId = variantId;
      return found;
    }
    return null;
  }

  public getSelectedAlternative(): DesignAlternative | null {
    if (!this.selectedAlternativeId) return null;
    return this.activeAlternatives.find((a) => a.variantId === this.selectedAlternativeId) || null;
  }
}
