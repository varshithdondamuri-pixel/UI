import { MLDatasetCategory, MLDatasetRecord } from './DatasetTypes';

export class DatasetIndex {
  private categoryIndex: Map<MLDatasetCategory, Set<string>> = new Map();
  private industryIndex: Map<string, Set<string>> = new Map();

  public indexRecords(records: MLDatasetRecord[]): void {
    this.categoryIndex.clear();
    this.industryIndex.clear();

    for (const r of records) {
      if (!this.categoryIndex.has(r.category)) {
        this.categoryIndex.set(r.category, new Set());
      }
      this.categoryIndex.get(r.category)!.add(r.id);

      const ind = r.industry.toLowerCase();
      if (!this.industryIndex.has(ind)) {
        this.industryIndex.set(ind, new Set());
      }
      this.industryIndex.get(ind)!.add(r.id);
    }
  }

  public getIdsByCategory(category: MLDatasetCategory): Set<string> {
    return this.categoryIndex.get(category) || new Set();
  }

  public getIdsByIndustry(industry: string): Set<string> {
    return this.industryIndex.get(industry.toLowerCase()) || new Set();
  }
}
