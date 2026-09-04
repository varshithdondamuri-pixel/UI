import { BlueprintSample } from './DatasetTypes';

export class BlueprintDatasetBuilder {
  public buildSample(
    intentTree: any,
    blueprintVariants: any[],
    selectedBlueprint: any,
    selectionReason: string = 'Highest layout score and density match'
  ): BlueprintSample {
    const safeVariants = blueprintVariants || (selectedBlueprint ? [selectedBlueprint] : []);
    const candidateBlueprintVariants = safeVariants.map((v) => ({
      id: v.id || v.variantId,
      name: v.name || v.strategyName || 'Blueprint Variant',
      totalNodeCount: v.totalNodeCount || v.nodes?.length || 0,
      score: v.score || v.overallScore || 0.85
    }));

    const structuralStrategies = Array.from(
      new Set(safeVariants.map((v) => v.strategyName || v.strategy || 'FlexGrid Strategy'))
    );

    const rankingScores: Record<string, number> = {};
    for (const v of safeVariants) {
      const key = v.id || v.variantId || 'variant_1';
      rankingScores[key] = v.score || v.overallScore || 0.85;
    }

    const selectedId = selectedBlueprint?.id || selectedBlueprint?.variantId;
    const rejectedBlueprints = safeVariants.filter(
      (v) => (v.id || v.variantId) !== selectedId
    );

    return {
      intentTree: intentTree || null,
      candidateBlueprintVariants,
      structuralStrategies,
      rankingScores,
      selectedBlueprint: selectedBlueprint || null,
      rejectedBlueprints,
      selectionReason
    };
  }
}
