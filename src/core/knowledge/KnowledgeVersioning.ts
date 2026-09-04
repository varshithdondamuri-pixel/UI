import { KnowledgeRecord } from './KnowledgeTypes';

export class KnowledgeVersioning {
  public static deprecateRecord(record: KnowledgeRecord, reason?: string): KnowledgeRecord {
    return {
      ...record,
      status: 'deprecated',
      description: reason ? `${record.description} (Deprecated: ${reason})` : record.description,
      updatedAt: Date.now()
    };
  }

  public static bumpVersion(
    record: KnowledgeRecord,
    type: 'major' | 'minor' | 'patch' = 'patch'
  ): KnowledgeRecord {
    const parts = record.version.split('.').map((p) => parseInt(p, 10) || 0);
    let major = parts[0] || 1;
    let minor = parts[1] || 0;
    let patch = parts[2] || 0;

    if (type === 'major') {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (type === 'minor') {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }

    return {
      ...record,
      version: `${major}.${minor}.${patch}`,
      updatedAt: Date.now()
    };
  }

  public static isDeprecated(record: KnowledgeRecord): boolean {
    return record.status === 'deprecated';
  }
}
