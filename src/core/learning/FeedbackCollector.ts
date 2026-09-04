import {
  AIFeedbackRecord,
  ExplicitFeedbackItem,
  FeedbackKind,
  KnowledgeFeedbackRecord,
  MLFeedbackRecord,
  RatingFeedback,
  UserFeedbackData,
  ChangeReason
} from './FeedbackTypes';

export class FeedbackCollector {
  private feedbackMap: Map<string, UserFeedbackData> = new Map();

  public recordRating(ratingData: Omit<RatingFeedback, 'timestamp'>): RatingFeedback {
    const record: RatingFeedback = {
      ...ratingData,
      timestamp: Date.now()
    };

    const userFeedback = this.getOrCreateFeedback(ratingData.designId);
    userFeedback.ratings.push(record);
    userFeedback.lastUpdated = Date.now();

    return record;
  }

  public recordExplicitFeedback(
    designId: string,
    userSessionId: string,
    kind: FeedbackKind,
    value: any,
    comment?: string,
    reason?: ChangeReason,
    targetElementId?: string
  ): ExplicitFeedbackItem {
    const item: ExplicitFeedbackItem = {
      id: 'fb_' + Math.random().toString(36).substring(2, 10),
      kind,
      value,
      comment: this.sanitize(comment),
      reason,
      targetElementId,
      timestamp: Date.now(),
      designId,
      userSessionId
    };

    const userFeedback = this.getOrCreateFeedback(designId);
    userFeedback.explicitItems.push(item);
    userFeedback.lastUpdated = Date.now();

    return item;
  }

  public recordAIFeedback(designId: string, aiFeedback: Omit<AIFeedbackRecord, 'timestamp'>): AIFeedbackRecord {
    const record: AIFeedbackRecord = {
      ...aiFeedback,
      timestamp: Date.now()
    };

    const userFeedback = this.getOrCreateFeedback(designId);
    userFeedback.aiFeedback.push(record);
    userFeedback.lastUpdated = Date.now();

    return record;
  }

  public recordMLFeedback(designId: string, mlFeedback: Omit<MLFeedbackRecord, 'timestamp'>): MLFeedbackRecord {
    const record: MLFeedbackRecord = {
      ...mlFeedback,
      timestamp: Date.now()
    };

    const userFeedback = this.getOrCreateFeedback(designId);
    userFeedback.mlFeedback.push(record);
    userFeedback.lastUpdated = Date.now();

    return record;
  }

  public recordKnowledgeFeedback(designId: string, kbFeedback: Omit<KnowledgeFeedbackRecord, 'timestamp'>): KnowledgeFeedbackRecord {
    const record: KnowledgeFeedbackRecord = {
      ...kbFeedback,
      timestamp: Date.now()
    };

    const userFeedback = this.getOrCreateFeedback(designId);
    userFeedback.knowledgeFeedback.push(record);
    userFeedback.lastUpdated = Date.now();

    return record;
  }

  public getFeedbackForDesign(designId: string): UserFeedbackData {
    return this.getOrCreateFeedback(designId);
  }

  public getAllFeedback(): Map<string, UserFeedbackData> {
    return this.feedbackMap;
  }

  public getAverageRating(): number {
    let sum = 0;
    let count = 0;
    this.feedbackMap.forEach((fb) => {
      fb.ratings.forEach((r) => {
        sum += r.rating;
        count++;
      });
    });
    return count > 0 ? Number((sum / count).toFixed(2)) : 0;
  }

  private getOrCreateFeedback(designId: string): UserFeedbackData {
    let data = this.feedbackMap.get(designId);
    if (!data) {
      data = {
        ratings: [],
        explicitItems: [],
        normalizedItems: [],
        aiFeedback: [],
        mlFeedback: [],
        knowledgeFeedback: [],
        variantComparisons: [],
        lastUpdated: Date.now()
      };
      this.feedbackMap.set(designId, data);
    }
    return data;
  }

  private sanitize(str?: string): string | undefined {
    if (!str) return undefined;
    return str
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/(password|secret|bearer|token)\s*[:=]\s*\S+/gi, '$1: [REDACTED]');
  }
}
