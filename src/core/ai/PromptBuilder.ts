import { AIContext, AIPrompt, AIPromptSection } from './AITypes';
import { PromptCompressor } from './PromptCompressor';
import { PromptTemplates } from './PromptTemplates';
import { PromptValidator } from './PromptValidator';

export class PromptBuilder {
  private compressor: PromptCompressor = new PromptCompressor();
  private validator: PromptValidator = new PromptValidator();

  public buildPrompt(context: AIContext, shouldCompress: boolean = true): AIPrompt {
    const sections: AIPromptSection[] = [];

    // 1. Goal
    sections.push({
      title: 'Goal',
      content: `User Request: "${context.userPrompt}"`,
      priority: 1
    });

    // 2. Industry
    const industry = context.knowledgeBundle?.industry || 'SaaS / Enterprise UI';
    sections.push({
      title: 'Industry',
      content: `Target Industry Domain: ${industry}`,
      priority: 2
    });

    // 3. Audience
    sections.push({
      title: 'Audience',
      content: 'Target Audience: Web & Desktop App Users requiring intuitive, accessible UI layouts.',
      priority: 3
    });

    // 4. Intent
    const rootIntent = context.intentTree?.root.type || 'Generic Dashboard';
    sections.push({
      title: 'Intent',
      content: `Root Intent Category: ${rootIntent}\nNodes Count: ${context.sketch.nodeCount}\nShapes: ${context.sketch.shapes.join(', ')}`,
      priority: 4
    });

    // 5. Blueprint
    const bpSummary = context.blueprint
      ? `Blueprint ID: ${context.blueprint.id}, Total Nodes: ${context.blueprint.totalNodeCount}`
      : 'Blueprint not yet generated.';
    sections.push({
      title: 'Blueprint',
      content: bpSummary,
      priority: 5
    });

    // 6. Visual Design
    const vdSummary = context.visualDesignModel
      ? `Active Option ID: ${context.visualDesignModel.selectedOptionId}, Primary Color: ${context.visualDesignModel.activeOption.colorTokens.primary}, Font: ${context.visualDesignModel.activeOption.typographyScale.fontFamilyHeadings}`
      : 'Visual design model not initialized.';
    sections.push({
      title: 'Visual Design',
      content: vdSummary,
      priority: 6
    });

    // 7. Knowledge
    const kbSummary = context.knowledgeBundle
      ? `Matched Records: ${context.knowledgeBundle.components.length}, Primary Recommendation: ${context.knowledgeBundle.intent || 'Standard layout guidelines'}`
      : 'No knowledge bundle attached.';
    sections.push({
      title: 'Knowledge',
      content: kbSummary,
      priority: 7
    });

    // 8. ML Predictions
    const mlSummary = context.predictionBundle
      ? `Predicted Layout Type: ${context.predictionBundle.layoutPrediction.prediction || 'Dashboard'}, Confidence: ${context.predictionBundle.layoutPrediction.confidence}`
      : 'No ML prediction bundle attached.';
    sections.push({
      title: 'ML Predictions',
      content: mlSummary,
      priority: 8
    });

    // 9. Accessibility
    sections.push({
      title: 'Accessibility',
      content: `WCAG Level: ${context.accessibility.wcagTargetLevel}, Min Touch Target: ${context.accessibility.minTouchSize}px, Min Contrast Ratio: ${context.accessibility.colorContrastRatio}:1`,
      priority: 9
    });

    // 10. Constraints
    sections.push({
      title: 'Constraints',
      content: `Responsive: ${context.constraints.responsive}, Max Depth: ${context.constraints.maxDepth}, Max Components: ${context.constraints.maxComponents}`,
      priority: 10
    });

    // 11. Expected Output
    sections.push({
      title: 'Expected Output',
      content: `Return valid JSON strictly matching the following schema:\n${PromptTemplates.EXPECTED_JSON_SCHEMA}`,
      priority: 11
    });

    // Format prompt text
    const formattedPrompt = [
      `=== SYSTEM DIRECTIVE ===\n${PromptTemplates.SYSTEM_DIRECTIVE}`,
      `=== USER GOAL ===\n${context.userPrompt}`,
      ...sections.map((s) => `=== SECTION: ${s.title} ===\n${s.content}`)
    ].join('\n\n');

    const estimatedTokens = Math.ceil(formattedPrompt.length / 4);

    let rawPrompt: AIPrompt = {
      systemDirective: PromptTemplates.SYSTEM_DIRECTIVE,
      userDirective: context.userPrompt,
      sections,
      formattedPrompt,
      estimatedTokens,
      compressed: false
    };

    if (shouldCompress && estimatedTokens > 1000) {
      rawPrompt = this.compressor.compressPrompt(rawPrompt, context);
    }

    const validation = this.validator.validatePrompt(rawPrompt);
    if (!validation.isValid) {
      console.warn('Prompt Validation Warnings:', validation.errors);
    }

    return rawPrompt;
  }
}
