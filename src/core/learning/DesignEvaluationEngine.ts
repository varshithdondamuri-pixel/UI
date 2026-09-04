import { AccessibilityEvaluation } from './AccessibilityEvaluation';
import { CodeEvaluation } from './CodeEvaluation';
import { DesignEvaluationResult } from './LearningTypes';
import { QualityEvaluation } from './QualityEvaluation';
import { UXEvaluation } from './UXEvaluation';
import { VisualEvaluation } from './VisualEvaluation';

export class DesignEvaluationEngine {
  private qualityEval = new QualityEvaluation();
  private uxEval = new UXEvaluation();
  private a11yEval = new AccessibilityEvaluation();
  private visualEval = new VisualEvaluation();
  private codeEval = new CodeEvaluation();

  public evaluateDesign(
    designId: string,
    model: any,
    blueprint: any,
    intentTree: any,
    renderTree: any,
    codeResult?: any
  ): DesignEvaluationResult {
    const quality = this.qualityEval.evaluate(model, blueprint);
    const ux = this.uxEval.evaluate(model, intentTree);
    const accessibility = this.a11yEval.evaluate(model, renderTree);
    const visual = this.visualEval.evaluate(model);
    const code = this.codeEval.evaluate(codeResult);

    const overallScore = Math.round(
      (quality.overallVisualQuality + ux.overallUXScore + accessibility.wcagComplianceScore + visual.overallVisualScore + code.overallCodeScore) / 5
    );

    return {
      evaluationId: 'eval_' + Math.random().toString(36).substring(2, 9),
      designId,
      timestamp: Date.now(),
      quality,
      ux,
      accessibility,
      visual,
      code,
      overallScore
    };
  }
}
