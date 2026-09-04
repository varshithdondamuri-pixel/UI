import { FullDesignSample } from './DatasetTypes';

export interface DeduplicationMatch {
  sampleId: string;
  duplicateOfSampleId: string;
  similarityScore: number;
  matchType: 'exact' | 'near_sketch' | 'duplicate_prompt' | 'duplicate_design' | 'duplicate_feedback';
}

export class DatasetDeduplicator {
  /**
   * Scans a collection of samples for duplicate or near-identical items.
   * Marks duplicates through metadata (`isDuplicate`, `duplicateOfSampleId`)
   * WITHOUT deleting original source data.
   */
  public processDuplicates(samples: FullDesignSample[]): {
    updatedSamples: FullDesignSample[];
    matches: DeduplicationMatch[];
  } {
    const matches: DeduplicationMatch[] = [];
    const updatedSamples = samples.map((s) => ({ ...s }));

    for (let i = 0; i < updatedSamples.length; i++) {
      for (let j = i + 1; j < updatedSamples.length; j++) {
        const a = updatedSamples[i];
        const b = updatedSamples[j];

        // Skip if b is already marked as duplicate
        if (b.isDuplicate) continue;

        const match = this.checkSimilarity(a, b);
        if (match) {
          b.isDuplicate = true;
          b.duplicateOfSampleId = a.sampleId;
          matches.push({
            sampleId: b.sampleId,
            duplicateOfSampleId: a.sampleId,
            similarityScore: match.similarityScore,
            matchType: match.matchType
          });
        }
      }
    }

    return { updatedSamples, matches };
  }

  private checkSimilarity(
    a: FullDesignSample,
    b: FullDesignSample
  ): { similarityScore: number; matchType: DeduplicationMatch['matchType'] } | null {
    // 1. Duplicate Prompts
    if (a.prompt && b.prompt && a.prompt.trim().toLowerCase() === b.prompt.trim().toLowerCase()) {
      // If sketches are also identical
      if (this.areSketchesIdentical(a.sketch, b.sketch)) {
        return { similarityScore: 1.0, matchType: 'exact' };
      }
      return { similarityScore: 0.92, matchType: 'duplicate_prompt' };
    }

    // 2. Near-identical Sketches
    if (this.areSketchesSimilar(a.sketch, b.sketch)) {
      return { similarityScore: 0.88, matchType: 'near_sketch' };
    }

    // 3. Duplicate Feedback
    if (
      a.evaluation?.humanFeedback &&
      b.evaluation?.humanFeedback &&
      a.evaluation.humanFeedback.length > 10 &&
      a.evaluation.humanFeedback === b.evaluation.humanFeedback
    ) {
      return { similarityScore: 0.85, matchType: 'duplicate_feedback' };
    }

    return null;
  }

  private areSketchesIdentical(sA: any, sB: any): boolean {
    if (!sA || !sB) return false;
    const objsA = sA.canvasObjects || [];
    const objsB = sB.canvasObjects || [];
    if (objsA.length !== objsB.length) return false;
    if (objsA.length === 0) return true;

    return JSON.stringify(objsA.map((o: any) => ({ k: o.kind, p: o.position, s: o.size }))) ===
           JSON.stringify(objsB.map((o: any) => ({ k: o.kind, p: o.position, s: o.size })));
  }

  private areSketchesSimilar(sA: any, sB: any): boolean {
    if (!sA || !sB) return false;
    const objsA = sA.canvasObjects || [];
    const objsB = sB.canvasObjects || [];
    if (objsA.length === 0 || objsB.length === 0) return false;
    if (Math.abs(objsA.length - objsB.length) > 2) return false;

    const typesA = (sA.objectTypes || []).sort().join(',');
    const typesB = (sB.objectTypes || []).sort().join(',');
    return typesA.length > 0 && typesA === typesB;
  }
}
