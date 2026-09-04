import { AIContext, AIPrompt } from './AITypes';

export class PromptCompressor {
  /**
   * Compresses prompt context by trimming verbose trees and removing duplicate tokens.
   */
  public compressPrompt(prompt: AIPrompt, _context: AIContext): AIPrompt {
    const compressedSections = prompt.sections.map((sec) => {
      let content = sec.content;

      // Remove duplicate empty lines and whitespace
      content = content.replace(/\n{3,}/g, '\n\n').trim();

      // Truncate repetitive tree representation if too long
      if (content.length > 1200) {
        const lines = content.split('\n');
        if (lines.length > 30) {
          content = lines.slice(0, 20).join('\n') + `\n... [Compressed ${lines.length - 25} repetitive lines] ...\n` + lines.slice(-5).join('\n');
        }
      }

      return {
        ...sec,
        content
      };
    });

    const compressedFormatted = [
      `=== SYSTEM DIRECTIVE ===\n${prompt.systemDirective}`,
      `=== USER GOAL ===\n${prompt.userDirective}`,
      ...compressedSections.map((s) => `=== SECTION: ${s.title} ===\n${s.content}`)
    ].join('\n\n');

    const estimatedTokens = Math.ceil(compressedFormatted.length / 4);

    return {
      ...prompt,
      sections: compressedSections,
      formattedPrompt: compressedFormatted,
      estimatedTokens,
      compressed: true
    };
  }
}
