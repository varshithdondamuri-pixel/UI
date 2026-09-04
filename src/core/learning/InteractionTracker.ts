import { LearningSession } from './LearningTypes';

export class InteractionTracker {
  private activeSession: LearningSession;
  private pastSessions: LearningSession[] = [];

  constructor() {
    this.activeSession = this.createNewSession();
  }

  public createNewSession(userSessionId: string = 'user_session_' + Date.now()): LearningSession {
    if (this.activeSession && this.activeSession.interactionCount > 0) {
      this.activeSession.endTime = Date.now();
      this.pastSessions.push(this.activeSession);
    }

    const newSession: LearningSession = {
      sessionId: 'learn_sess_' + Math.random().toString(36).substring(2, 9),
      userSessionId,
      startTime: Date.now(),
      designIds: [],
      interactionCount: 0
    };

    this.activeSession = newSession;
    return newSession;
  }

  public recordInteraction(designId?: string, prompt?: string): void {
    if (!this.activeSession) {
      this.createNewSession();
    }

    this.activeSession.interactionCount++;
    if (designId && !this.activeSession.designIds.includes(designId)) {
      this.activeSession.designIds.push(designId);
    }
    if (prompt) {
      this.activeSession.activePrompt = prompt;
    }
  }

  public getActiveSession(): LearningSession {
    return this.activeSession;
  }

  public getAllSessions(): LearningSession[] {
    return [...this.pastSessions, this.activeSession];
  }

  public getTotalSessionCount(): number {
    return this.pastSessions.length + 1;
  }
}
