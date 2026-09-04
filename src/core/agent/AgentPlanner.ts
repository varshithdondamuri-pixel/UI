import { StructuredAgentIntent } from './AgentIntent';

export interface PlanStep {
  stepIndex: number;
  label: string;
  actionKey: string;
  completed: boolean;
}

export interface AgentExecutionPlan {
  planId: string;
  intent: StructuredAgentIntent;
  steps: PlanStep[];
  requiresApproval: boolean;
}

export class AgentPlanner {
  public createPlan(intent: StructuredAgentIntent): AgentExecutionPlan {
    const planId = 'plan_' + Math.random().toString(36).substring(2, 9);
    const steps: PlanStep[] = [];

    let stepIdx = 1;
    steps.push({ stepIndex: stepIdx++, label: 'Inspect canvas sketch and active selection', actionKey: 'INSPECT_CANVAS', completed: false });
    steps.push({ stepIndex: stepIdx++, label: `Classify intent: ${intent.type}`, actionKey: 'CLASSIFY_INTENT', completed: false });
    steps.push({ stepIndex: stepIdx++, label: 'Retrieve knowledge design patterns and rules', actionKey: 'RETRIEVE_KNOWLEDGE', completed: false });
    steps.push({ stepIndex: stepIdx++, label: 'Request ML quality & style predictions', actionKey: 'REQUEST_ML_PREDICTIONS', completed: false });
    steps.push({ stepIndex: stepIdx++, label: 'Request AI orchestration reasoning', actionKey: 'REQUEST_AI_REASONING', completed: false });

    if (intent.type === 'GENERATE_VARIANTS' || intent.type === 'CREATE_DESIGN') {
      steps.push({ stepIndex: stepIdx++, label: 'Generate layout blueprint variants', actionKey: 'GENERATE_BLUEPRINTS', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Process visual design options', actionKey: 'PROCESS_VISUAL_OPTIONS', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Validate design alternatives and token scales', actionKey: 'VALIDATE_ALTERNATIVES', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Render preview trees for viewport', actionKey: 'RENDER_PREVIEWS', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Present alternatives to user for selection', actionKey: 'PRESENT_ALTERNATIVES', completed: false });
    } else if (intent.type === 'GENERATE_CODE') {
      steps.push({ stepIndex: stepIdx++, label: 'Resolve latest validated Visual Design Model', actionKey: 'RESOLVE_MODEL', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Invoke CodeGenerationEngine for React + TS project', actionKey: 'INVOKE_CODEGEN', completed: false });
    } else {
      steps.push({ stepIndex: stepIdx++, label: 'Formulate localized change proposal', actionKey: 'FORMULATE_PROPOSAL', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Validate layout and WCAG accessibility constraints', actionKey: 'VALIDATE_PROPOSAL', completed: false });
      steps.push({ stepIndex: stepIdx++, label: 'Present change proposal for user approval', actionKey: 'AWAIT_APPROVAL', completed: false });
    }

    const requiresApproval = intent.type !== 'UNDERSTAND_SKETCH';

    return {
      planId,
      intent,
      steps,
      requiresApproval
    };
  }
}
