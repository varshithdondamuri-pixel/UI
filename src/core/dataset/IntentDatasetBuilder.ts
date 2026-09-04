import { IntentSample } from './DatasetTypes';

export class IntentDatasetBuilder {
  public buildSample(
    semanticTree: any,
    intentTree: any
  ): IntentSample {
    const rootNode = intentTree?.root || intentTree;
    const purpose = rootNode?.metadata?.userGoal || rootNode?.intentCategory || 'Interactive UI Component Layout';
    const priority = rootNode?.priority || 'high';
    const confidence = intentTree?.confidence ?? rootNode?.confidence ?? 0.88;

    const possibleVariants = intentTree?.variants
      ? intentTree.variants.map((v: any) => v.name || v.id || String(v))
      : ['Single Column Layout', 'Sidebar + Content', 'Grid Dashboard'];

    const ambiguityCandidates = intentTree?.ambiguities || [];

    return {
      semanticTree: semanticTree || null,
      intentTree: intentTree || null,
      purpose,
      priority,
      possibleVariants,
      ambiguityCandidates,
      confidence: Number(confidence.toFixed(2))
    };
  }
}
