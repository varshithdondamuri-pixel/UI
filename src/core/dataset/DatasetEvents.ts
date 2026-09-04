import { FullDesignSample, DatasetSplits } from './DatasetTypes';

export enum DatasetEventType {
  SAMPLE_CREATED = 'DATASET_SAMPLE_CREATED',
  SAMPLE_UPDATED = 'DATASET_SAMPLE_UPDATED',
  SAMPLE_VALIDATED = 'DATASET_SAMPLE_VALIDATED',
  VERSION_CREATED = 'DATASET_VERSION_CREATED',
  SPLITS_GENERATED = 'DATASET_SPLITS_GENERATED',
  DATASET_EXPORTED = 'DATASET_EXPORTED',
  EXTERNAL_IMPORTED = 'DATASET_EXTERNAL_IMPORTED'
}

export interface DatasetEventPayloads {
  [DatasetEventType.SAMPLE_CREATED]: { sample: FullDesignSample };
  [DatasetEventType.SAMPLE_UPDATED]: { sample: FullDesignSample };
  [DatasetEventType.SAMPLE_VALIDATED]: { sampleId: string; isValid: boolean; errorsCount: number };
  [DatasetEventType.VERSION_CREATED]: { version: string; sampleCount: number };
  [DatasetEventType.SPLITS_GENERATED]: { splits: DatasetSplits };
  [DatasetEventType.DATASET_EXPORTED]: { format: 'json' | 'jsonl' | 'csv'; count: number };
  [DatasetEventType.EXTERNAL_IMPORTED]: { source: string; count: number };
}
