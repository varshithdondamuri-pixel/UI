import { MLDatasetRecord } from './DatasetTypes';

export class DatasetVersioning {
  public static bumpRecordVersion(record: MLDatasetRecord): MLDatasetRecord {
    const parts = record.version.split('.').map((p) => parseInt(p, 10) || 0);
    const major = parts[0] || 1;
    const minor = parts[1] || 0;
    const patch = (parts[2] || 0) + 1;

    return {
      ...record,
      version: `${major}.${minor}.${patch}`,
      updatedAt: Date.now()
    };
  }
}
