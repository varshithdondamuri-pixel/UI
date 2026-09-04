import { AgentExecutionPlan } from './AgentPlanner';
import { AgentDesignController } from './AgentDesignController';
import { AgentContextPayload } from './AgentContext';

export interface ExecutionResult {
  success: boolean;
  executedStepsCount: number;
  error: string | null;
  outputPayload: any;
}

export class AgentExecutor {
  private controller: AgentDesignController;

  constructor(controller: AgentDesignController) {
    this.controller = controller;
  }

  public async executePlan(plan: AgentExecutionPlan, context: AgentContextPayload): Promise<ExecutionResult> {
    let executedCount = 0;

    try {
      for (const step of plan.steps) {
        step.completed = true;
        executedCount++;

        if (step.actionKey === 'INSPECT_CANVAS' || step.actionKey === 'UNDERSTAND_SKETCH') {
          this.controller.triggerSketchAnalysis();
        } else if (step.actionKey === 'INVOKE_CODEGEN') {
          const codeProject = await this.controller.generateProductionCode();
          return {
            success: true,
            executedStepsCount: executedCount,
            error: null,
            outputPayload: { codeProject }
          };
        }
      }

      return {
        success: true,
        executedStepsCount: executedCount,
        error: null,
        outputPayload: { planId: plan.planId, context }
      };
    } catch (err: any) {
      // Fallback handling: preserve current design on error
      return {
        success: false,
        executedStepsCount: executedCount,
        error: err?.message || 'Agent execution failed. Preserving current design state.',
        outputPayload: null
      };
    }
  }
}
