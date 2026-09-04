import { AgentIntentType, AgentStatus, ChangeProposal } from './AgentTypes';

export class AgentState {
  public sessionId: string;
  public currentDesignId: string | null = null;
  public currentDesignVersion: string = 'v1.0.0';
  public currentIntent: AgentIntentType | null = null;
  public currentBlueprint: any | null = null;
  public currentVisualDesign: any | null = null;
  public currentRenderTree: any | null = null;
  public activeKnowledgeBundle: any | null = null;
  public activePredictionBundle: any | null = null;
  public activeAIDecision: any | null = null;
  public pendingChanges: ChangeProposal[] = [];
  public approvedChanges: ChangeProposal[] = [];
  public rejectedChanges: ChangeProposal[] = [];
  public conversationContext: any[] = [];
  public iterationNumber: number = 1;
  public agentStatus: AgentStatus = 'idle';
  public lastAction: string | null = null;
  public lastResult: any | null = null;

  constructor(sessionId: string = 'agent_sess_' + Date.now()) {
    this.sessionId = sessionId;
  }

  public setStatus(status: AgentStatus): void {
    this.agentStatus = status;
  }

  public updateState(partial: Partial<AgentState>): void {
    Object.assign(this, partial);
  }

  public resetPendingChanges(): void {
    this.pendingChanges = [];
  }

  public snapshot(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      currentDesignId: this.currentDesignId,
      currentDesignVersion: this.currentDesignVersion,
      agentStatus: this.agentStatus,
      iterationNumber: this.iterationNumber,
      pendingCount: this.pendingChanges.length,
      approvedCount: this.approvedChanges.length
    };
  }
}
