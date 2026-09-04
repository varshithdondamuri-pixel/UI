import { OrchestrationAuditEvent } from './UIMLOrchestratorTypes';

export class UIMLOrchestrationAuditEngine {
  private static events: OrchestrationAuditEvent[] = [];

  public static recordEvent(
    eventData: Omit<OrchestrationAuditEvent, 'eventId' | 'timestamp'>
  ): OrchestrationAuditEvent {
    const fullEvent: OrchestrationAuditEvent = {
      eventId: `audit_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...eventData
    };
    this.events.push(fullEvent);
    return fullEvent;
  }

  public static getEventsForRequest(requestId: string): OrchestrationAuditEvent[] {
    return this.events.filter((e) => e.requestId === requestId);
  }

  public static getAllEvents(): OrchestrationAuditEvent[] {
    return [...this.events];
  }

  public static clearEvents(): void {
    this.events = [];
  }
}
