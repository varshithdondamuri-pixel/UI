import {
  KnowledgeRecord,
  KnowledgeRankingWeights,
  KnowledgeSearchQuery,
  KnowledgeSearchResult
} from './KnowledgeTypes';

export class KnowledgeRanking {
  private defaultWeights: KnowledgeRankingWeights = {
    relevance: 0.35,
    industryMatch: 0.2,
    styleMatch: 0.15,
    popularity: 0.1,
    qualityScore: 0.1,
    freshness: 0.05,
    accessibility: 0.05
  };

  public rank(
    records: KnowledgeRecord[],
    query: KnowledgeSearchQuery,
    customWeights?: Partial<KnowledgeRankingWeights>
  ): KnowledgeSearchResult[] {
    const weights = { ...this.defaultWeights, ...customWeights };

    const results: KnowledgeSearchResult[] = records.map((record) => {
      const matchReasons: string[] = [];

      // 1. Relevance score
      let relevance = 0.5;
      if (query.keyword) {
        const kw = query.keyword.toLowerCase();
        if (record.title.toLowerCase().includes(kw)) {
          relevance += 0.4;
          matchReasons.push('Title keyword match');
        }
        if (record.keywords.some((k) => k.toLowerCase().includes(kw))) {
          relevance += 0.3;
          matchReasons.push('Keyword tag match');
        }
      } else {
        relevance = 0.8;
      }
      relevance = Math.min(1.0, relevance);

      // 2. Industry Match score
      let industryScore = 0.5;
      if (query.industry && query.industry !== 'all') {
        if (record.industry.toLowerCase() === query.industry.toLowerCase()) {
          industryScore = 1.0;
          matchReasons.push(`Exact industry match (${record.industry})`);
        } else if (record.industry === 'Universal' || record.industry === 'General') {
          industryScore = 0.7;
          matchReasons.push('Universal industry fallback');
        }
      }

      // 3. Style Match score
      let styleScore = 0.5;
      if (query.style && query.style !== 'all') {
        if (record.style.toLowerCase() === query.style.toLowerCase()) {
          styleScore = 1.0;
          matchReasons.push(`Exact style match (${record.style})`);
        }
      }

      // 4. Quality Score (normalized 0 to 1)
      const qualityScoreNorm = Math.max(0, Math.min(1, record.qualityScore / 100));
      if (record.qualityScore >= 85) {
        matchReasons.push(`High quality rating (${record.qualityScore}/100)`);
      }

      // 5. Accessibility score
      const a11yScores = { AAA: 1.0, AA: 0.8, A: 0.5 };
      const a11yScore = a11yScores[record.accessibility.wcagLevel] || 0.5;
      if (record.accessibility.wcagLevel === 'AA' || record.accessibility.wcagLevel === 'AAA') {
        matchReasons.push(`WCAG ${record.accessibility.wcagLevel} compliance`);
      }

      // 6. Freshness score (newer updatedAt = higher score)
      const ageMs = Math.max(0, Date.now() - record.updatedAt);
      const freshnessScore = Math.max(0.1, 1 - ageMs / (1000 * 60 * 60 * 24 * 365));

      // 7. Popularity score (default to qualityScore)
      const popularityScore = qualityScoreNorm;

      // Weighted combination
      const totalScore =
        relevance * weights.relevance +
        industryScore * weights.industryMatch +
        styleScore * weights.styleMatch +
        popularityScore * weights.popularity +
        qualityScoreNorm * weights.qualityScore +
        freshnessScore * weights.freshness +
        a11yScore * weights.accessibility;

      return {
        record,
        score: Number((totalScore * 100).toFixed(1)),
        matchReasons
      };
    });

    // Sort descending by score
    return results.sort((a, b) => b.score - a.score);
  }
}
