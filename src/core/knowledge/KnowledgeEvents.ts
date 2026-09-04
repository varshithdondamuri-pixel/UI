import { CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';
import {
  KnowledgeBundle,
  KnowledgeRecord,
  KnowledgeSearchQuery,
  KnowledgeSearchResult,
  KnowledgeValidationResult
} from './KnowledgeTypes';

export class KnowledgeEventNotifier {
  private eventBus: TypedEventBus;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  public notifyLoaded(totalRecords: number): void {
    this.eventBus.emit(CoreEvent.KNOWLEDGE_LOADED, {
      totalRecords,
      timestamp: Date.now()
    });
  }

  public notifyUpdated(recordId: string, record: KnowledgeRecord): void {
    this.eventBus.emit(CoreEvent.KNOWLEDGE_UPDATED, {
      recordId,
      record
    });
  }

  public notifyValidated(validation: KnowledgeValidationResult): void {
    this.eventBus.emit(CoreEvent.KNOWLEDGE_VALIDATED, {
      validation
    });
  }

  public notifySearched(query: KnowledgeSearchQuery, resultsCount: number): void {
    this.eventBus.emit(CoreEvent.KNOWLEDGE_SEARCHED, {
      query,
      resultsCount
    });
  }

  public notifyRanked(query: KnowledgeSearchQuery, rankedResults: KnowledgeSearchResult[]): void {
    this.eventBus.emit(CoreEvent.KNOWLEDGE_RANKED, {
      query,
      rankedResults
    });
  }

  public notifyBundleCreated(bundle: KnowledgeBundle): void {
    this.eventBus.emit(CoreEvent.KNOWLEDGE_BUNDLE_CREATED, {
      bundle,
      timestamp: Date.now()
    });
  }
}
