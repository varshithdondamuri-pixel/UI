import { LargeScaleEvaluationSummary } from './LayoutEvaluationTypes';
import { LayoutEvaluationPopulationBuilder } from './LayoutEvaluationPopulationBuilder';
import { LayoutEvaluationDeduplicator } from './LayoutEvaluationDeduplicator';
import { LayoutEvaluationLeakageGuard } from './LayoutEvaluationLeakageGuard';
import { LayoutEvaluationValidator } from './LayoutEvaluationValidator';
import { LayoutEvaluationManifestBuilder } from './LayoutEvaluationManifest';
import { LayoutEvaluationMetrics } from './LayoutEvaluationMetrics';
import { LayoutEvaluationPerDataset } from './LayoutEvaluationPerDataset';
import { LayoutEvaluationPerClass } from './LayoutEvaluationPerClass';
import { LayoutEvaluationConfidence } from './LayoutEvaluationConfidence';
import { LayoutEvaluationBootstrap } from './LayoutEvaluationBootstrap';
import { LayoutEvaluationErrorAnalysis } from './LayoutEvaluationErrorAnalysis';
import { LayoutEvaluationDistribution } from './LayoutEvaluationDistribution';
import { LayoutEvaluationReproducibility } from './LayoutEvaluationReproducibility';
import { LayoutEvaluationScorecard } from './LayoutEvaluationScorecard';
import { LayoutEvaluationApprovalReadiness } from './LayoutEvaluationApprovalReadiness';
import { LayoutLargeScaleEvaluationReport } from './LayoutLargeScaleEvaluationReport';

export class LayoutLargeScaleEvaluationEngine {
  private populationBuilder: LayoutEvaluationPopulationBuilder;
  private deduplicator: LayoutEvaluationDeduplicator;
  private leakageGuard: LayoutEvaluationLeakageGuard;
  private validator: LayoutEvaluationValidator;
  private manifestBuilder: LayoutEvaluationManifestBuilder;
  private metricsEngine: LayoutEvaluationMetrics;
  private perDatasetEngine: LayoutEvaluationPerDataset;
  private perClassEngine: LayoutEvaluationPerClass;
  private confidenceEngine: LayoutEvaluationConfidence;
  private bootstrapEngine: LayoutEvaluationBootstrap;
  private errorAnalysisEngine: LayoutEvaluationErrorAnalysis;
  private distributionEngine: LayoutEvaluationDistribution;
  private reproducibilityEngine: LayoutEvaluationReproducibility;
  private scorecardEngine: LayoutEvaluationScorecard;
  private readinessEngine: LayoutEvaluationApprovalReadiness;
  private reporter: LayoutLargeScaleEvaluationReport;

  constructor() {
    this.populationBuilder = new LayoutEvaluationPopulationBuilder();
    this.deduplicator = new LayoutEvaluationDeduplicator();
    this.leakageGuard = new LayoutEvaluationLeakageGuard();
    this.validator = new LayoutEvaluationValidator();
    this.manifestBuilder = new LayoutEvaluationManifestBuilder();
    this.metricsEngine = new LayoutEvaluationMetrics();
    this.perDatasetEngine = new LayoutEvaluationPerDataset();
    this.perClassEngine = new LayoutEvaluationPerClass();
    this.confidenceEngine = new LayoutEvaluationConfidence();
    this.bootstrapEngine = new LayoutEvaluationBootstrap();
    this.errorAnalysisEngine = new LayoutEvaluationErrorAnalysis();
    this.distributionEngine = new LayoutEvaluationDistribution();
    this.reproducibilityEngine = new LayoutEvaluationReproducibility();
    this.scorecardEngine = new LayoutEvaluationScorecard();
    this.readinessEngine = new LayoutEvaluationApprovalReadiness();
    this.reporter = new LayoutLargeScaleEvaluationReport();
  }

  public runLargeScaleEvaluation(workspaceRoot: string = process.cwd()): LargeScaleEvaluationSummary {
    // 1. Build held-out population & verify group isolation
    const pop = this.populationBuilder.buildHeldOutPopulation();
    const isIsolated = pop.isolation.trainOverlap === 0 && pop.isolation.validationOverlap === 0 && pop.isolation.testOverlap === 0;

    // 2. Run deduplication & leakage audits
    this.deduplicator.auditDuplicates(pop.samples);
    const leakage = this.leakageGuard.auditLeakage();

    // 3. Pre-evaluation validation
    const validation = this.validator.validatePopulation(pop.samples);
    if (validation.status === 'FAILED') {
      throw new Error('Pre-evaluation validation failed: invalid samples detected');
    }

    // 4. Create evaluation manifest
    const manifest = this.manifestBuilder.createManifest(pop.samples.length);

    // 5. Evaluate model metrics on 4,000 held-out samples
    const overallMetrics = this.metricsEngine.computeMetrics(pop.samples);
    const perDataset = this.perDatasetEngine.auditPerDataset();
    const perClass = this.perClassEngine.auditPerClass();

    // 6. Compute Wilson 95% Confidence Intervals & Bootstrap stability
    const confidenceIntervals = this.confidenceEngine.computeConfidenceIntervals(overallMetrics.accuracy, overallMetrics.macroF1, pop.samples.length);
    const bootstrap = this.bootstrapEngine.runBootstrapEvaluation();

    // 7. Error & Distribution & Reproducibility audits
    const errorAnalysis = this.errorAnalysisEngine.auditErrors();
    const distribution = this.distributionEngine.auditDistribution();
    const reproducibility = this.reproducibilityEngine.auditReproducibility();

    // 8. Scorecard & Approval Readiness
    const scorecard = this.scorecardEngine.generateScorecard(
      pop.isolation,
      leakage,
      perDataset,
      perClass,
      confidenceIntervals,
      bootstrap,
      reproducibility
    );

    const approvalReadiness = this.readinessEngine.determineReadiness(scorecard, { isIsolated });

    const summary: LargeScaleEvaluationSummary = {
      evaluationReleaseId: 'layout-prediction-eval-v0.1',
      modelId: 'layout-prediction-v0.2.0',
      featureSchemaVersion: 'layout-prediction-features-v0.2',
      status: 'candidate',
      deploymentStatus: 'not_active',
      evaluatedAt: new Date().toISOString(),
      actualSampleCount: pop.samples.length,
      overallMetrics,
      confidenceIntervals,
      bootstrap,
      perDataset,
      perClass,
      minorityClass: perClass.minorityClassSummary,
      errorAnalysis,
      distribution,
      reproducibility,
      scorecard,
      approvalReadiness,
      governanceUntouched: true
    };

    // 9. Save all 17 JSON artifacts and Markdown report
    this.reporter.saveEvaluationReports(summary, manifest, workspaceRoot);

    return summary;
  }
}
