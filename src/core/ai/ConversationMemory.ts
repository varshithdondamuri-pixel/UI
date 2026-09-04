import { AIContext, AIProviderResponse, ConversationTurn, DesignDecision } from './AITypes';

export interface UserPreferences {
  preferredProviderId?: string;
  autoApplyDecisions: boolean;
  themePreference: 'light' | 'dark' | 'system';
  accessibilityLevel: 'A' | 'AA' | 'AAA';
}

export class ConversationMemory {
  private sessionId: string;
  private turns: ConversationTurn[] = [];
  private previousDecisions: DesignDecision[] = [];
  private userPreferences: UserPreferences;
  private maxTurnsHistory: number = 20;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || `session_${Date.now()}`;
    this.userPreferences = {
      autoApplyDecisions: true,
      themePreference: 'system',
      accessibilityLevel: 'AA'
    };
  }

  public addTurn(
    userPrompt: string,
    context: AIContext,
    aiPromptPreview: string,
    providerResponse: AIProviderResponse,
    decision?: DesignDecision
  ): ConversationTurn {
    const turn: ConversationTurn = {
      id: `turn_${Date.now()}_${this.turns.length + 1}`,
      timestamp: Date.now(),
      userPrompt,
      contextSummary: `Sketch nodes: ${context.sketch.nodeCount}, Intent: ${context.intentTree?.root.type || 'unknown'}`,
      aiPromptPreview,
      providerResponse,
      decision
    };

    this.turns.push(turn);
    if (this.turns.length > this.maxTurnsHistory) {
      this.turns.shift();
    }

    if (decision) {
      this.previousDecisions.push(decision);
    }

    return turn;
  }

  public getHistory(): ConversationTurn[] {
    return [...this.turns];
  }

  public getRecentTurn(): ConversationTurn | null {
    return this.turns.length > 0 ? this.turns[this.turns.length - 1] : null;
  }

  public getPreviousDecisions(): DesignDecision[] {
    return [...this.previousDecisions];
  }

  public getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  public updateUserPreferences(prefs: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...prefs };
  }

  public clearHistory(): void {
    this.turns = [];
    this.previousDecisions = [];
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}
