import { MLModelRecord } from './MLModel';
import { MLTaskIdentifier } from './MLTaskTypes';

export class MLModelVersioning {
  private versions: Map<string, MLModelRecord> = new Map();

  public registerVersion(task: MLTaskIdentifier, versionTag: string, model: MLModelRecord): string {
    const formattedTag = versionTag.startsWith(`${task}-v`) ? versionTag : `${task}-${versionTag.startsWith('v') ? versionTag : 'v' + versionTag}`;

    if (this.versions.has(formattedTag)) {
      throw new Error(`Model version '${formattedTag}' is immutable and cannot be overwritten.`);
    }

    const immutableCopy: MLModelRecord = Object.freeze(JSON.parse(JSON.stringify(model)));
    this.versions.set(formattedTag, immutableCopy);
    return formattedTag;
  }

  public getVersion(formattedTag: string): MLModelRecord | undefined {
    return this.versions.get(formattedTag);
  }

  public getAllVersions(): MLModelRecord[] {
    return Array.from(this.versions.values());
  }
}
