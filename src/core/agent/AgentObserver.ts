import { AgentContextPayload } from './AgentContext';

export interface SystemObservation {
  nodeCount: number;
  hasUserSketch: boolean;
  activeArchetype: string;
  activeDesignSystem: string;
  activeTheme: string;
  selectedElementKind: string | null;
  affectedStage: 'sketch' | 'semantic' | 'blueprint' | 'visual' | 'render' | 'code';
  activeConstraints: string[];
  userDrawnCount: number;
  agentProposedCount: number;
}

export class AgentObserver {
  public observe(context: AgentContextPayload): SystemObservation {
    const nodeCount = context.sceneGraphSnapshot?.nodes?.length || 0;
    const hasUserSketch = nodeCount > 0;
    const activeArchetype = context.intentTree?.archetype || 'Landing Page';
    const activeDesignSystem = context.visualDesignModel?.designSystem?.name || 'Modern SaaS';
    const activeTheme = context.visualDesignModel?.theme?.name || 'Dark Mode';
    const selectedElementKind = context.selectedNodeUuid ? 'Selected Canvas Component' : null;

    let affectedStage: SystemObservation['affectedStage'] = 'visual';
    if (context.userPrompt?.toLowerCase().includes('layout') || context.userPrompt?.toLowerCase().includes('structure')) {
      affectedStage = 'blueprint';
    } else if (context.userPrompt?.toLowerCase().includes('code')) {
      affectedStage = 'code';
    }

    const activeConstraints = ['WCAG AA Contrast Minimum 4.5:1', '8px Grid System Alignment', 'Preserve Active User Canvas Selections'];

    return {
      nodeCount,
      hasUserSketch,
      activeArchetype,
      activeDesignSystem,
      activeTheme,
      selectedElementKind,
      affectedStage,
      activeConstraints,
      userDrawnCount: nodeCount,
      agentProposedCount: context.visualDesignModel?.totalNodeCount ? Math.max(0, context.visualDesignModel.totalNodeCount - nodeCount) : 0
    };
  }
}
