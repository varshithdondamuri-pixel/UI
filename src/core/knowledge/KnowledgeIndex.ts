import { KnowledgeCategoryType, KnowledgeRecord } from './KnowledgeTypes';

export class KnowledgeIndex {
  private categoryIndex: Map<KnowledgeCategoryType, Set<string>> = new Map();
  private industryIndex: Map<string, Set<string>> = new Map();
  private styleIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();

  public buildIndex(records: KnowledgeRecord[]): void {
    this.categoryIndex.clear();
    this.industryIndex.clear();
    this.styleIndex.clear();
    this.tagIndex.clear();
    this.keywordIndex.clear();

    for (const record of records) {
      this.addToIndex(record);
    }
  }

  public addToIndex(record: KnowledgeRecord): void {
    const id = record.id;

    // Category
    if (!this.categoryIndex.has(record.category)) {
      this.categoryIndex.set(record.category, new Set());
    }
    this.categoryIndex.get(record.category)!.add(id);

    // Industry
    const ind = record.industry.toLowerCase();
    if (!this.industryIndex.has(ind)) {
      this.industryIndex.set(ind, new Set());
    }
    this.industryIndex.get(ind)!.add(id);

    // Style
    const st = record.style.toLowerCase();
    if (!this.styleIndex.has(st)) {
      this.styleIndex.set(st, new Set());
    }
    this.styleIndex.get(st)!.add(id);

    // Tags
    for (const tag of record.tags) {
      const t = tag.toLowerCase();
      if (!this.tagIndex.has(t)) {
        this.tagIndex.set(t, new Set());
      }
      this.tagIndex.get(t)!.add(id);
    }

    // Keywords
    for (const kw of record.keywords) {
      const k = kw.toLowerCase();
      if (!this.keywordIndex.has(k)) {
        this.keywordIndex.set(k, new Set());
      }
      this.keywordIndex.get(k)!.add(id);
    }
  }

  public getIdsByCategory(category: KnowledgeCategoryType): Set<string> {
    return this.categoryIndex.get(category) || new Set();
  }

  public getIdsByIndustry(industry: string): Set<string> {
    return this.industryIndex.get(industry.toLowerCase()) || new Set();
  }

  public getIdsByStyle(style: string): Set<string> {
    return this.styleIndex.get(style.toLowerCase()) || new Set();
  }

  public getIdsByTag(tag: string): Set<string> {
    return this.tagIndex.get(tag.toLowerCase()) || new Set();
  }

  public getIdsByKeyword(keyword: string): Set<string> {
    return this.keywordIndex.get(keyword.toLowerCase()) || new Set();
  }
}
