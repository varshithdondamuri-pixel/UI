import { FullDesignSample } from './DatasetTypes';

export interface DatasetVersionRelease {
  version: string; // e.g. 'ai-ui-dataset-v0.1'
  releaseDate: string;
  sampleIds: string[];
  sampleCount: number;
  approvedCount: number;
  qualityAverage: number;
  snapshot: FullDesignSample[]; // Immutable copy
  isReleased: boolean;
}

export class DatasetVersioning {
  private versions: Map<string, DatasetVersionRelease> = new Map();

  /**
   * Creates an immutable version release.
   * Throws an error if attempting to overwrite or mutate an existing version.
   */
  public createRelease(
    versionTag: string,
    samples: FullDesignSample[]
  ): DatasetVersionRelease {
    const formattedTag = versionTag.startsWith('ai-ui-dataset-') ? versionTag : `ai-ui-dataset-${versionTag}`;

    if (this.versions.has(formattedTag)) {
      throw new Error(`Dataset version '${formattedTag}' is immutable and cannot be overwritten.`);
    }

    // Freeze / deep copy snapshot samples
    const immutableSnapshot: FullDesignSample[] = JSON.parse(JSON.stringify(samples));

    const approvedCount = immutableSnapshot.filter((s) => s.trainingDataAllowed && !s.isDuplicate).length;
    const avgQuality = immutableSnapshot.length > 0
      ? Number((immutableSnapshot.reduce((acc, s) => acc + (s.qualityScore || 0), 0) / immutableSnapshot.length).toFixed(1))
      : 0;

    const release: DatasetVersionRelease = {
      version: formattedTag,
      releaseDate: new Date().toISOString(),
      sampleIds: immutableSnapshot.map((s) => s.sampleId),
      sampleCount: immutableSnapshot.length,
      approvedCount,
      qualityAverage: avgQuality,
      snapshot: Object.freeze(immutableSnapshot) as unknown as FullDesignSample[],
      isReleased: true
    };

    this.versions.set(formattedTag, release);
    return release;
  }

  public getVersion(versionTag: string): DatasetVersionRelease | undefined {
    const formattedTag = versionTag.startsWith('ai-ui-dataset-') ? versionTag : `ai-ui-dataset-${versionTag}`;
    return this.versions.get(formattedTag);
  }

  public getAllVersions(): DatasetVersionRelease[] {
    return Array.from(this.versions.values());
  }

  public isVersionImmutable(versionTag: string): boolean {
    const formattedTag = versionTag.startsWith('ai-ui-dataset-') ? versionTag : `ai-ui-dataset-${versionTag}`;
    return this.versions.has(formattedTag);
  }
}
