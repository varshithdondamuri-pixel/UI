export class RankingEngine {
  public rankItems<T extends { id: string; name?: string; title?: string; score?: number; qualityScore?: number }>(
    items: T[]
  ): { id: string; name: string; score: number }[] {
    return items
      .map((item) => {
        const name = item.name || item.title || item.id;
        const score = item.score !== undefined ? item.score : item.qualityScore !== undefined ? item.qualityScore : 90;
        return { id: item.id, name, score };
      })
      .sort((a, b) => b.score - a.score);
  }
}
