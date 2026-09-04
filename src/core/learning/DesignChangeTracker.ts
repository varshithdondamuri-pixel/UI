import { ChangeReason } from './FeedbackTypes';

export type DesignChangeType =
  | 'Component Added'
  | 'Component Removed'
  | 'Component Reordered'
  | 'Component Resized'
  | 'Spacing Changed'
  | 'Color Changed'
  | 'Typography Changed'
  | 'Layout Changed'
  | 'Theme Changed'
  | 'Animation Changed'
  | 'Responsive Rule Changed'
  | 'Accessibility Fix';

export interface DesignChangeRecord {
  changeId: string;
  designId: string;
  sourceNode?: string; // Node ID or component name
  changeType: DesignChangeType;
  before: any;
  after: any;
  timestamp: number;
  reason?: ChangeReason;
  comment?: string;
  userInitiated: boolean;
}

export class DesignChangeTracker {
  private changes: DesignChangeRecord[] = [];

  public recordChange(change: Omit<DesignChangeRecord, 'changeId' | 'timestamp'>): DesignChangeRecord {
    const sanitizedComment = this.sanitizeText(change.comment);

    const record: DesignChangeRecord = {
      ...change,
      changeId: 'change_' + Math.random().toString(36).substring(2, 10),
      comment: sanitizedComment,
      timestamp: Date.now()
    };

    this.changes.push(record);
    return record;
  }

  public getChangesForDesign(designId: string): DesignChangeRecord[] {
    return this.changes.filter((c) => c.designId === designId);
  }

  public getAllChanges(): DesignChangeRecord[] {
    return [...this.changes];
  }

  public getChangeCount(): number {
    return this.changes.length;
  }

  /**
   * Sanitizes strings to prevent sensitive personal information or passwords from entering learning records.
   */
  private sanitizeText(text?: string): string | undefined {
    if (!text) return undefined;
    // Strip obvious credentials, emails, or token patterns
    return text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/(password|secret|bearer|token)\s*[:=]\s*\S+/gi, '$1: [REDACTED]');
  }
}
