import {
  DatasetCategory,
  DatasetSplits,
  DesignStyleLabel,
  FullDesignSample,
  IndustryLabel,
  ProprietaryDatasetProvider
} from './DatasetTypes';
import { DatasetVersioning, DatasetVersionRelease } from './DatasetVersioning';
import { DatasetStatistics, DatasetStatisticsSummary } from './DatasetStatistics';
import { DatasetQualityEngine } from './DatasetQualityEngine';
import { DatasetDeduplicator } from './DatasetDeduplicator';
import { DatasetNormalizer } from './DatasetNormalizer';

export interface RegistryMetadata {
  datasetName: string;
  datasetVersion: string;
  sampleCount: number;
  categoryCount: number;
  sourceCount: number;
  qualityAverage: number;
  approvedCount: number;
  rejectedCount: number;
  reviewCount: number;
  createdDate: string;
  updatedDate: string;
}

export class DatasetRegistry implements ProprietaryDatasetProvider {
  private samples: Map<string, FullDesignSample> = new Map();
  private versioning: DatasetVersioning;
  private statistics: DatasetStatistics;
  private qualityEngine: DatasetQualityEngine;
  private deduplicator: DatasetDeduplicator;
  private normalizer: DatasetNormalizer;

  private datasetName: string = 'AI UI Designer Proprietary Dataset';
  private currentVersion: string = 'v0.1';
  private createdDate: string = new Date().toISOString();
  private updatedDate: string = new Date().toISOString();

  constructor() {
    this.versioning = new DatasetVersioning();
    this.statistics = new DatasetStatistics();
    this.qualityEngine = new DatasetQualityEngine();
    this.deduplicator = new DatasetDeduplicator();
    this.normalizer = new DatasetNormalizer();
  }

  public addSample(sample: FullDesignSample): FullDesignSample {
    // Score sample quality if not pre-computed
    const qBreakdown = this.qualityEngine.scoreSample(sample);
    sample.qualityScore = qBreakdown.overallScore;

    this.samples.set(sample.sampleId, sample);
    this.updatedDate = new Date().toISOString();

    // Run deduplication pass across samples
    this.runDeduplicationPass();

    return this.samples.get(sample.sampleId)!;
  }

  public getSample(sampleId: string): FullDesignSample | undefined {
    return this.samples.get(sampleId);
  }

  public getAllSamples(): FullDesignSample[] {
    return Array.from(this.samples.values());
  }

  public getApprovedSamples(): FullDesignSample[] {
    return this.getAllSamples().filter((s) => s.trainingDataAllowed && !s.isDuplicate);
  }

  public runDeduplicationPass() {
    const all = this.getAllSamples();
    const { updatedSamples } = this.deduplicator.processDuplicates(all);
    for (const s of updatedSamples) {
      this.samples.set(s.sampleId, s);
    }
  }

  public createVersionRelease(versionTag: string): DatasetVersionRelease {
    const approved = this.getApprovedSamples();
    const release = this.versioning.createRelease(versionTag, approved);
    this.currentVersion = release.version;
    this.updatedDate = new Date().toISOString();
    return release;
  }

  public getVersioning(): DatasetVersioning {
    return this.versioning;
  }

  public getNormalizer(): DatasetNormalizer {
    return this.normalizer;
  }

  public getMetadata(): RegistryMetadata {
    const all = this.getAllSamples();
    const stats = this.statistics.compute(all);

    const categoriesSet = new Set(all.map((s) => s.category));
    const sourcesSet = new Set(all.map((s) => s.provenance?.sourceDataset || 'first_party'));
    const reviewCount = all.filter((s) => !s.evaluation || (s.qualityScore >= 50 && s.qualityScore < 70)).length;

    return {
      datasetName: this.datasetName,
      datasetVersion: this.currentVersion,
      sampleCount: stats.totalSamples,
      categoryCount: categoriesSet.size,
      sourceCount: sourcesSet.size,
      qualityAverage: stats.averageQuality,
      approvedCount: stats.approvedSamples,
      rejectedCount: stats.rejectedSamples,
      reviewCount,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate
    };
  }

  public getStatisticsSummary(): DatasetStatisticsSummary {
    return this.statistics.compute(this.getAllSamples());
  }

  // --- ProprietaryDatasetProvider Interface Implementation ---

  public samplesByCategory(category: DatasetCategory): FullDesignSample[] {
    return this.getApprovedSamples().filter((s) => s.category === category);
  }

  public samplesByIndustry(industry: IndustryLabel): FullDesignSample[] {
    return this.getApprovedSamples().filter((s) => s.industry === industry);
  }

  public samplesByStyle(style: DesignStyleLabel): FullDesignSample[] {
    return this.getApprovedSamples().filter((s) => s.style === style);
  }

  public samplesByTask(task: string): FullDesignSample[] {
    const lower = task.toLowerCase();
    return this.getApprovedSamples().filter(
      (s) => s.prompt.toLowerCase().includes(lower) || s.category.toLowerCase().includes(lower)
    );
  }

  public samplesByQuality(minQuality: number): FullDesignSample[] {
    return this.getApprovedSamples().filter((s) => (s.qualityScore || 0) >= minQuality);
  }

  public samplesByVersion(version: string): FullDesignSample[] {
    const ver = this.versioning.getVersion(version);
    return ver ? ver.snapshot : [];
  }

  /**
   * Generates Train / Validation / Test splits with strict session leakage prevention.
   * A complete user session (sessionId) remains in ONE split.
   */
  public generateSplits(
    trainRatio: number = 0.8,
    valRatio: number = 0.1,
    _testRatio: number = 0.1
  ): DatasetSplits {
    const eligibleSamples = this.getApprovedSamples();

    // Group samples by sessionId
    const sessionMap: Map<string, FullDesignSample[]> = new Map();
    for (const sample of eligibleSamples) {
      const sessId = sample.sessionId || `single_session_${sample.sampleId}`;
      if (!sessionMap.has(sessId)) {
        sessionMap.set(sessId, []);
      }
      sessionMap.get(sessId)!.push(sample);
    }

    const sessionIds = Array.from(sessionMap.keys());
    const totalSessions = sessionIds.length;

    const trainEnd = Math.round(totalSessions * trainRatio);
    const valEnd = trainEnd + Math.round(totalSessions * valRatio);

    const trainSessions = sessionIds.slice(0, trainEnd);
    const valSessions = sessionIds.slice(trainEnd, valEnd);
    const testSessions = sessionIds.slice(valEnd);

    const train: FullDesignSample[] = [];
    const validation: FullDesignSample[] = [];
    const test: FullDesignSample[] = [];

    for (const sessId of trainSessions) {
      train.push(...sessionMap.get(sessId)!);
    }
    for (const sessId of valSessions) {
      validation.push(...sessionMap.get(sessId)!);
    }
    for (const sessId of testSessions) {
      test.push(...sessionMap.get(sessId)!);
    }

    return { train, validation, test };
  }

  public trainingSplit(): FullDesignSample[] {
    return this.generateSplits().train;
  }

  public validationSplit(): FullDesignSample[] {
    return this.generateSplits().validation;
  }

  public testSplit(): FullDesignSample[] {
    return this.generateSplits().test;
  }

  // --- External Dataset Identity Registration (Phase 12.5) ---

  private externalIdentities: Map<string, {
    identity: string;
    datasetName: string;
    source: string;
    version: string;
    license: string;
    provenance: any;
    normalizationStatus: string;
    inspectionReport?: any;
    registeredAt: string;
  }> = new Map();

  public registerExternalDatasetIdentity(
    identity: 'external/rico' | 'external/screen2words' | 'external/webcode2m' | 'external/webui' | string,
    metadata: {
      datasetName: string;
      source: string;
      version: string;
      license: string;
      provenance: any;
      normalizationStatus: string;
      inspectionReport?: any;
    }
  ): void {
    this.externalIdentities.set(identity, {
      identity,
      ...metadata,
      registeredAt: new Date().toISOString()
    });
  }

  public getExternalDatasetIdentities(): Array<any> {
    return Array.from(this.externalIdentities.values());
  }

  public getExternalDatasetIdentity(identity: string): any | undefined {
    return this.externalIdentities.get(identity);
  }
}

