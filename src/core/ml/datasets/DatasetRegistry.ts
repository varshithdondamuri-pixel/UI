import { DatasetIndex } from './DatasetIndex';
import { DatasetLoader } from './DatasetLoader';
import { DatasetStatistics, DatasetStats } from './DatasetStatistics';
import { MLDatasetCategory, MLDatasetMetadata, MLDatasetRecord } from './DatasetTypes';
import { DatasetValidator, DatasetValidationIssue } from './DatasetValidator';

export class DatasetRegistry {
  private records: Map<string, MLDatasetRecord> = new Map();
  private index = new DatasetIndex();
  private validator = new DatasetValidator();
  private statisticsEngine = new DatasetStatistics();

  constructor() {
    this.initialize();
  }

  public initialize(): void {
    const seedRecords = DatasetLoader.loadSeedDatasets();
    for (const r of seedRecords) {
      this.records.set(r.id, r);
    }
    this.reindex();
  }

  public reindex(): void {
    const all = Array.from(this.records.values());
    this.index.indexRecords(all);
  }

  public addRecord(record: MLDatasetRecord): void {
    this.records.set(record.id, { ...record });
    this.reindex();
  }

  public getRecord(id: string): MLDatasetRecord | null {
    return this.records.get(id) || null;
  }

  public getAllRecords(): MLDatasetRecord[] {
    return Array.from(this.records.values());
  }

  public getRecordsByCategory(category: MLDatasetCategory): MLDatasetRecord[] {
    const ids = this.index.getIdsByCategory(category);
    return this.getAllRecords().filter((r) => ids.has(r.id));
  }

  public getStats(): DatasetStats {
    return this.statisticsEngine.computeStats(this.getAllRecords());
  }

  public validate(): { isValid: boolean; issues: DatasetValidationIssue[] } {
    return this.validator.validate(this.getAllRecords());
  }

  public getMetadata(): MLDatasetMetadata {
    const records = this.getAllRecords();
    const stats = this.getStats();

    return {
      datasetId: 'dataset-registry-v1',
      datasetName: 'AI UI Designer Multi-Category ML Dataset Suite',
      category: 'design-systems-ds',
      version: '1.0.0',
      author: 'ML Intelligence Layer',
      license: 'MIT',
      source: 'Internal Multi-Source Registry',
      entryCount: records.length,
      lastUpdated: Date.now(),
      qualityScore: 95,
      coverage: stats.coveragePercentage
    };
  }
}
