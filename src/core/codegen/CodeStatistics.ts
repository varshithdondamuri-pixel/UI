import { GeneratedFile, CodeGenStats, CodeGenValidationResult } from './CodeGenerationTypes';

export class CodeStatistics {
  public computeStats(
    files: GeneratedFile[],
    generationTimeMs: number,
    validation: CodeGenValidationResult,
    targetId: string
  ): CodeGenStats {
    const totalFiles = files.length;
    const totalLinesOfCode = files.reduce((sum, f) => sum + (f.content.split('\n').length), 0);
    const totalComponents = files.filter((f) => f.type === 'component').length;
    const totalTokensGenerated = files.filter((f) => f.type === 'token').reduce(
      (sum, f) => sum + this.countTokenLines(f.content),
      0
    );

    return {
      generationTimeMs,
      totalFiles,
      totalLinesOfCode,
      totalComponents,
      totalTokensGenerated,
      validationScore: validation.score,
      targetId
    };
  }

  public formatSummary(stats: CodeGenStats): string {
    return [
      `Target: ${stats.targetId}`,
      `Files generated: ${stats.totalFiles}`,
      `Total lines of code: ${stats.totalLinesOfCode}`,
      `Components: ${stats.totalComponents}`,
      `Tokens: ${stats.totalTokensGenerated}`,
      `Validation score: ${stats.validationScore}/100`,
      `Generation time: ${stats.generationTimeMs}ms`
    ].join('\n');
  }

  private countTokenLines(content: string): number {
    return (content.match(/:/g) || []).length;
  }
}
