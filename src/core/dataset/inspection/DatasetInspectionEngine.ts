import {
  CombinedInspectionReport,
  DatasetInspectionLimits,
  DatasetInspectionResult,
  DEFAULT_INSPECTION_LIMITS
} from './DatasetInspectionTypes';
import { DatasetFileScanner } from './DatasetFileScanner';
import { DatasetSchemaInspector } from './DatasetSchemaInspector';
import { DatasetStatisticsInspector } from './DatasetStatisticsInspector';
import { DatasetCompatibilityAnalyzer } from './DatasetCompatibilityAnalyzer';
import { DatasetInspectionReport } from './DatasetInspectionReport';

export class DatasetInspectionEngine {
  private scanner: DatasetFileScanner;
  private schemaInspector: DatasetSchemaInspector;
  private statsInspector: DatasetStatisticsInspector;
  private compatibilityAnalyzer: DatasetCompatibilityAnalyzer;
  private reportGenerator: DatasetInspectionReport;

  constructor(limits: DatasetInspectionLimits = DEFAULT_INSPECTION_LIMITS) {
    this.scanner = new DatasetFileScanner(limits);
    this.schemaInspector = new DatasetSchemaInspector(limits);
    this.statsInspector = new DatasetStatisticsInspector();
    this.compatibilityAnalyzer = new DatasetCompatibilityAnalyzer();
    this.reportGenerator = new DatasetInspectionReport();
  }

  /**
   * Inspects all 4 local raw datasets (RICO, Screen2Words, WebCode2M, WebUI).
   */
  public inspectAllDatasets(workspaceRoot: string = process.cwd()): CombinedInspectionReport {
    const datasetConfigs = [
      { id: 'rico', name: 'RICO Mobile UI Dataset', relPath: 'rico', adapter: 'RicoAdapter', license: 'unknown' },
      { id: 'screen2words', name: 'Screen2Words Screen Summaries', relPath: 'screen2words-1b9d9e7c192b03dcd8dc82c17ad63a45a202cb20', adapter: 'Screen2WordsAdapter', license: 'CC-BY-4.0 (Google Research)' },
      { id: 'webcode2m', name: 'WebCode2M Code & Screenshot Corpus', relPath: 'webcode2m', adapter: 'WebCode2MAdapter', license: 'unknown' },
      { id: 'webui', name: 'WebUI Web Design Dataset', relPath: 'webui', adapter: 'WebUIAdapter', license: 'unknown' }
    ];

    const results: Record<string, DatasetInspectionResult> = {};

    for (const cfg of datasetConfigs) {
      results[cfg.id] = this.inspectSingleDataset(cfg, workspaceRoot);
    }

    return this.reportGenerator.generateReports(results);
  }

  public inspectSingleDataset(
    config: { id: string; name: string; relPath: string; adapter: string; license: string },
    workspaceRoot: string = process.cwd()
  ): DatasetInspectionResult {
    const resolvedPath = this.scanner.resolveDatasetPath(config.relPath, workspaceRoot);
    const fileStats = this.scanner.scanDirectory(resolvedPath);
    const schemaDetails = this.schemaInspector.inspectDatasetSchema(config.id, resolvedPath);
    const statsSummary = this.statsInspector.computeStatistics(
      config.id,
      fileStats,
      schemaDetails.rawFieldsFound.length
    );
    const taskComp = this.compatibilityAnalyzer.analyzeTaskCompatibility(config.id, schemaDetails.rawFieldsFound);
    const featComp = this.compatibilityAnalyzer.analyzeFeatureGroupCompatibility(
      config.id,
      schemaDetails.rawFieldsFound
    );

    const warnings: string[] = [];
    if (config.license === 'unknown') {
      warnings.push(`License for dataset ${config.name} is not explicitly specified locally; treated as non-commercial / unverified license.`);
    }

    return {
      datasetId: config.id,
      datasetName: config.name,
      localPath: resolvedPath,
      inspectionTimestamp: new Date().toISOString(),
      isDiscovered: fileStats.totalFiles > 0,
      fileStats,
      schemaSummary: schemaDetails.schemaSummary,
      samplePreview: schemaDetails.samplePreviews,
      statistics: statsSummary,
      licenseInfo: {
        license: config.license,
        source: `Local filesystem at ${resolvedPath}`,
        citation: `${config.name} Dataset`,
        usageRestrictions: ['Non-proprietary data', 'No commercial rights claimed without verification'],
        attributionRequirements: `Attribute ${config.name} in evaluation reports`,
        isVerifiedLocally: config.license !== 'unknown'
      },
      taskCompatibility: taskComp,
      featureGroupCompatibility: featComp,
      normalizationStatus: {
        isNormalizable: true,
        adapterName: config.adapter,
        normalizedSampleCount: statsSummary.estimatedSampleCount,
        provenanceSourceType: 'external',
        provenanceSourceName: config.name
      },
      warnings,
      errors: []
    };
  }
}
