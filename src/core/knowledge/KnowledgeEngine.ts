import { TypedEventBus } from '../events/EventBus';
import { KnowledgeBundleBuilder } from './KnowledgeBundle';
import { KnowledgeEventNotifier } from './KnowledgeEvents';
import { KnowledgeGraph } from './KnowledgeGraph';
import { KnowledgeIndex } from './KnowledgeIndex';
import { KnowledgeLoader } from './KnowledgeLoader';
import { KnowledgeRanking } from './KnowledgeRanking';
import { KnowledgeSearch } from './KnowledgeSearch';
import { KnowledgeStatistics } from './KnowledgeStatistics';
import { KnowledgeStorage } from './KnowledgeStorage';
import {
  KnowledgeBundle,
  KnowledgeBundleRequest,
  KnowledgeRankingWeights,
  KnowledgeRecord,
  KnowledgeSearchQuery,
  KnowledgeSearchResult,
  KnowledgeStats,
  KnowledgeValidationResult
} from './KnowledgeTypes';
import { KnowledgeValidator } from './KnowledgeValidator';

export class KnowledgeEngine {
  private eventBus: TypedEventBus;

  private storage = new KnowledgeStorage();
  private index = new KnowledgeIndex();
  private graph = new KnowledgeGraph();
  private searchEngine: KnowledgeSearch;
  private rankingEngine = new KnowledgeRanking();
  private validator = new KnowledgeValidator();
  private statisticsEngine = new KnowledgeStatistics();
  private bundleBuilder = new KnowledgeBundleBuilder();
  private notifier: KnowledgeEventNotifier;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
    this.searchEngine = new KnowledgeSearch(this.index);
    this.notifier = new KnowledgeEventNotifier(this.eventBus);

    this.initialize();
  }

  /**
   * Initializes Knowledge Platform with seed data if storage is empty,
   * builds indices and knowledge graph, and emits KNOWLEDGE_LOADED event.
   */
  public initialize(): void {
    let records = this.storage.getAllRecords();

    if (records.length === 0) {
      records = KnowledgeLoader.loadSeedData();
      this.storage.addRecords(records);
    }

    this.rebuildPlatform();

    this.notifier.notifyLoaded(records.length);
  }

  /**
   * Rebuilds inverted indices and knowledge graph relationships.
   */
  public rebuildPlatform(): void {
    const records = this.storage.getAllRecords();
    this.index.buildIndex(records);
    this.graph.buildGraph(records);
  }

  /**
   * Adds a new Knowledge Record to the platform.
   */
  public addRecord(record: KnowledgeRecord): KnowledgeRecord {
    this.storage.addRecord(record);
    this.rebuildPlatform();
    this.notifier.notifyUpdated(record.id, record);
    return record;
  }

  /**
   * Updates an existing Knowledge Record.
   */
  public updateRecord(id: string, updates: Partial<KnowledgeRecord>): KnowledgeRecord | null {
    const updated = this.storage.updateRecord(id, updates);
    if (updated) {
      this.rebuildPlatform();
      this.notifier.notifyUpdated(id, updated);
    }
    return updated;
  }

  /**
   * Deletes a Knowledge Record.
   */
  public deleteRecord(id: string): boolean {
    const success = this.storage.deleteRecord(id);
    if (success) {
      this.rebuildPlatform();
    }
    return success;
  }

  /**
   * Gets a Knowledge Record by ID.
   */
  public getRecord(id: string): KnowledgeRecord | null {
    return this.storage.getRecord(id);
  }

  /**
   * Returns all stored records.
   */
  public getAllRecords(): KnowledgeRecord[] {
    return this.storage.getAllRecords();
  }

  /**
   * Searches and ranks records based on query parameters.
   */
  public search(
    query: KnowledgeSearchQuery,
    customWeights?: Partial<KnowledgeRankingWeights>
  ): KnowledgeSearchResult[] {
    const records = this.storage.getAllRecords();
    const matches = this.searchEngine.search(records, query);
    const ranked = this.rankingEngine.rank(matches, query, customWeights);

    this.notifier.notifySearched(query, matches.length);
    this.notifier.notifyRanked(query, ranked);

    return ranked;
  }

  /**
   * Validates schema integrity, duplicate IDs, and relationships.
   */
  public validate(): KnowledgeValidationResult {
    const records = this.storage.getAllRecords();
    const validation = this.validator.validate(records);
    this.notifier.notifyValidated(validation);
    return validation;
  }

  /**
   * Computes platform statistics.
   */
  public getStats(): KnowledgeStats {
    const records = this.storage.getAllRecords();
    return this.statisticsEngine.computeStats(records);
  }

  /**
   * Creates a Knowledge Bundle based on intent/prompt parameters.
   */
  public createBundle(request: KnowledgeBundleRequest): KnowledgeBundle {
    const records = this.storage.getAllRecords();
    const bundle = this.bundleBuilder.buildBundle(records, request);
    this.notifier.notifyBundleCreated(bundle);
    return bundle;
  }

  /**
   * Returns Knowledge Graph instance.
   */
  public getGraph(): KnowledgeGraph {
    return this.graph;
  }
}
