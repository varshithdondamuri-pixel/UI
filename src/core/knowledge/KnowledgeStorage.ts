import { KnowledgeRecord } from './KnowledgeTypes';

export class KnowledgeStorage {
  private records: Map<string, KnowledgeRecord> = new Map();
  private storageKey = 'ai_ui_designer_knowledge_v1';

  constructor() {
    this.loadFromLocalStorage();
  }

  public addRecord(record: KnowledgeRecord): void {
    this.records.set(record.id, { ...record });
    this.saveToLocalStorage();
  }

  public addRecords(records: KnowledgeRecord[]): void {
    for (const record of records) {
      this.records.set(record.id, { ...record });
    }
    this.saveToLocalStorage();
  }

  public getRecord(id: string): KnowledgeRecord | null {
    return this.records.get(id) || null;
  }

  public getAllRecords(): KnowledgeRecord[] {
    return Array.from(this.records.values());
  }

  public getActiveRecords(): KnowledgeRecord[] {
    return this.getAllRecords().filter((r) => r.status === 'active');
  }

  public updateRecord(id: string, updates: Partial<KnowledgeRecord>): KnowledgeRecord | null {
    const existing = this.records.get(id);
    if (!existing) return null;

    const updated: KnowledgeRecord = {
      ...existing,
      ...updates,
      updatedAt: Date.now()
    };
    this.records.set(id, updated);
    this.saveToLocalStorage();
    return updated;
  }

  public deleteRecord(id: string): boolean {
    const res = this.records.delete(id);
    if (res) this.saveToLocalStorage();
    return res;
  }

  public clear(): void {
    this.records.clear();
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const serialized = JSON.stringify(Array.from(this.records.values()));
        window.localStorage.setItem(this.storageKey, serialized);
      }
    } catch {
      // Memory fallback if localStorage is disabled
    }
  }

  private loadFromLocalStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(this.storageKey);
        if (data) {
          const parsed: KnowledgeRecord[] = JSON.parse(data);
          for (const item of parsed) {
            this.records.set(item.id, item);
          }
        }
      }
    } catch {
      // Memory fallback
    }
  }
}
