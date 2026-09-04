import { KnowledgeIndex } from './KnowledgeIndex';
import { KnowledgeRecord, KnowledgeSearchQuery } from './KnowledgeTypes';

export class KnowledgeSearch {
  private index: KnowledgeIndex;

  constructor(index: KnowledgeIndex) {
    this.index = index;
  }

  public search(
    records: KnowledgeRecord[],
    query: KnowledgeSearchQuery
  ): KnowledgeRecord[] {
    let candidateIds: Set<string> | null = null;

    // Filter by Category
    if (query.category) {
      const categoryIds = this.index.getIdsByCategory(query.category);
      candidateIds = this.intersect(candidateIds, categoryIds);
    }

    // Filter by Industry
    if (query.industry && query.industry !== 'all') {
      const industryIds = this.index.getIdsByIndustry(query.industry);
      candidateIds = this.intersect(candidateIds, industryIds);
    }

    // Filter by Style
    if (query.style && query.style !== 'all') {
      const styleIds = this.index.getIdsByStyle(query.style);
      candidateIds = this.intersect(candidateIds, styleIds);
    }

    // Filter by Tag
    if (query.tags && query.tags.length > 0) {
      for (const tag of query.tags) {
        const tagIds = this.index.getIdsByTag(tag);
        candidateIds = this.intersect(candidateIds, tagIds);
      }
    }

    let filteredRecords = candidateIds
      ? records.filter((r) => candidateIds!.has(r.id))
      : [...records];

    // Filter by Status (Default active)
    const targetStatus = query.status || 'active';
    filteredRecords = filteredRecords.filter((r) => r.status === targetStatus);

    // Filter by Subcategory
    if (query.subcategory) {
      const sub = query.subcategory.toLowerCase();
      filteredRecords = filteredRecords.filter(
        (r) => r.subcategory.toLowerCase() === sub
      );
    }

    // Filter by Min Quality Score
    if (query.minQualityScore !== undefined) {
      filteredRecords = filteredRecords.filter(
        (r) => r.qualityScore >= query.minQualityScore!
      );
    }

    // Filter by Device
    if (query.device) {
      filteredRecords = filteredRecords.filter((r) =>
        r.deviceSupport.includes(query.device!)
      );
    }

    // Filter by Accessibility Level
    if (query.minAccessibilityLevel) {
      const levels = { A: 1, AA: 2, AAA: 3 };
      const targetVal = levels[query.minAccessibilityLevel] || 1;
      filteredRecords = filteredRecords.filter(
        (r) => (levels[r.accessibility.wcagLevel] || 1) >= targetVal
      );
    }

    // Filter by Keyword (fulltext search in title, description, keywords, purpose)
    if (query.keyword && query.keyword.trim()) {
      const kw = query.keyword.toLowerCase().trim();
      filteredRecords = filteredRecords.filter(
        (r) =>
          r.title.toLowerCase().includes(kw) ||
          r.description.toLowerCase().includes(kw) ||
          r.purpose.toLowerCase().includes(kw) ||
          r.keywords.some((k) => k.toLowerCase().includes(kw)) ||
          r.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    return filteredRecords;
  }

  private intersect(setA: Set<string> | null, setB: Set<string>): Set<string> {
    if (setA === null) return new Set(setB);
    const result = new Set<string>();
    for (const elem of setB) {
      if (setA.has(elem)) {
        result.add(elem);
      }
    }
    return result;
  }
}
