import { MLTaskIdentifier } from './MLTaskTypes';

export type MLPredictionStatus = 'available' | 'partially_available' | 'unavailable';

export interface MLPredictionResponse<T = any> {
  status: MLPredictionStatus;
  reason?: string;
  prediction?: T;
  confidence?: number;
  task: MLTaskIdentifier;
  modelVersion?: string;
  featureVersion?: string;
  timestamp: string;
  validationStatus: 'valid' | 'invalid' | 'unverified';
}
