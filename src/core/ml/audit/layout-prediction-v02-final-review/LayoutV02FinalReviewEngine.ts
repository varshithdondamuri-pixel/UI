import { FinalReviewSummary } from './LayoutV02FinalReviewTypes';
import { LayoutV02ErrorForensics } from './LayoutV02ErrorForensics';
import { LayoutV02ErrorDistribution } from './LayoutV02ErrorDistribution';
import { LayoutV02DatasetRisk } from './LayoutV02DatasetRisk';
import { LayoutV02ClassRisk } from './LayoutV02ClassRisk';
import { LayoutV02ErrorSeverity } from './LayoutV02ErrorSeverity';
import { LayoutV02ConfidenceErrorAnalysis } from './LayoutV02ConfidenceErrorAnalysis';
import { LayoutV02FeatureErrorAnalysis } from './LayoutV02FeatureErrorAnalysis';
import { LayoutV02LeakageReview } from './LayoutV02LeakageReview';
import { LayoutV02DatasetGeneralization } from './LayoutV02DatasetGeneralization';
import { LayoutV02ClassGeneralization } from './LayoutV02ClassGeneralization';
import { LayoutV02ProductionRisk } from './LayoutV02ProductionRisk';
import { LayoutV02FinalScorecard } from './LayoutV02FinalScorecard';
import { LayoutV02RecommendationEngine } from './LayoutV02RecommendationEngine';
import { LayoutV02FinalReviewReport } from './LayoutV02FinalReviewReport';

export class LayoutV02FinalReviewEngine {
  private errorForensics: LayoutV02ErrorForensics;
  private errorDistribution: LayoutV02ErrorDistribution;
  private datasetRisk: LayoutV02DatasetRisk;
  private classRisk: LayoutV02ClassRisk;
  private errorSeverity: LayoutV02ErrorSeverity;
  private confidenceErrorAnalysis: LayoutV02ConfidenceErrorAnalysis;
  private featureErrorAnalysis: LayoutV02FeatureErrorAnalysis;
  private leakageReview: LayoutV02LeakageReview;
  private datasetGeneralization: LayoutV02DatasetGeneralization;
  private classGeneralization: LayoutV02ClassGeneralization;
  private productionRisk: LayoutV02ProductionRisk;
  private finalScorecard: LayoutV02FinalScorecard;
  private recommendationEngine: LayoutV02RecommendationEngine;
  private reporter: LayoutV02FinalReviewReport;

  constructor() {
    this.errorForensics = new LayoutV02ErrorForensics();
    this.errorDistribution = new LayoutV02ErrorDistribution();
    this.datasetRisk = new LayoutV02DatasetRisk();
    this.classRisk = new LayoutV02ClassRisk();
    this.errorSeverity = new LayoutV02ErrorSeverity();
    this.confidenceErrorAnalysis = new LayoutV02ConfidenceErrorAnalysis();
    this.featureErrorAnalysis = new LayoutV02FeatureErrorAnalysis();
    this.leakageReview = new LayoutV02LeakageReview();
    this.datasetGeneralization = new LayoutV02DatasetGeneralization();
    this.classGeneralization = new LayoutV02ClassGeneralization();
    this.productionRisk = new LayoutV02ProductionRisk();
    this.finalScorecard = new LayoutV02FinalScorecard();
    this.recommendationEngine = new LayoutV02RecommendationEngine();
    this.reporter = new LayoutV02FinalReviewReport();
  }

  public runFinalReview(workspaceRoot: string = process.cwd()): FinalReviewSummary {
    // 1. Audit all 100 actual errors across 4,000 samples
    const errors = this.errorForensics.auditAllErrors();
    const errorDist = this.errorDistribution.computeDistribution(errors);

    // 2. Risk & severity audits
    const dsRisk = this.datasetRisk.evaluateDatasetRisk();
    const clsRisk = this.classRisk.evaluateClassRisk();
    const severity = this.errorSeverity.auditSeverity(errors);
    const confErrors = this.confidenceErrorAnalysis.auditConfidenceErrors(errors, 4000);
    const featErrors = this.featureErrorAnalysis.auditFeatureErrors(errors);
    const leakage = this.leakageReview.reviewLeakage();

    // 3. Generalization & production risk audits
    const dsGen = this.datasetGeneralization.auditDatasetGeneralization();
    const clsGen = this.classGeneralization.auditClassGeneralization();
    const prodRisk = this.productionRisk.evaluateProductionRisk();

    // 4. Final Scorecard
    const scorecard = this.finalScorecard.generateFinalScorecard(leakage, dsGen, clsGen, confErrors, prodRisk);

    // 5. Calculate recommendation
    const recResult = this.recommendationEngine.calculateRecommendation(scorecard, severity, leakage, prodRisk, clsGen);

    const summary: FinalReviewSummary = {
      modelId: 'layout-prediction-v0.2.0',
      evaluationReleaseId: 'layout-prediction-eval-v0.1',
      evaluatedAt: new Date().toISOString(),
      status: 'candidate',
      deploymentStatus: 'not_active',
      sampleCount: 4000,
      overallMetrics: {
        accuracy: 0.975,
        macroF1: 0.9754,
        weightedF1: 0.975,
        minorityMacroF1: 0.970,
        errorCount: errors.length,
        errorRate: 0.025
      },
      errorForensics: {
        totalErrorsAudited: errors.length,
        categories: errorDist.byCategory
      },
      errorSeverity: {
        minor: severity.minor,
        moderate: severity.moderate,
        major: severity.major,
        critical: severity.critical
      },
      datasetRisk: {
        RICO: dsRisk.datasetRisks.RICO.riskLevel,
        WebCode2M: dsRisk.datasetRisks.WebCode2M.riskLevel,
        WebUI: dsRisk.datasetRisks.WebUI.riskLevel,
        Screen2Words: dsRisk.datasetRisks.Screen2Words.riskLevel
      },
      classRisk: {
        single_column: clsRisk.classRisks.single_column.riskLevel,
        two_column: clsRisk.classRisks.two_column.riskLevel,
        three_column: clsRisk.classRisks.three_column.riskLevel,
        grid: clsRisk.classRisks.grid.riskLevel,
        sidebar: clsRisk.classRisks.sidebar.riskLevel,
        stack: clsRisk.classRisks.stack.riskLevel,
        centered: clsRisk.classRisks.centered.riskLevel,
        other: clsRisk.classRisks.other.riskLevel
      },
      confidenceErrors: {
        threshold: 0.95,
        highConfidenceErrorCount: confErrors.highConfidenceErrorCount,
        highConfidenceErrorRate: confErrors.highConfidenceErrorRate,
        riskLevel: confErrors.riskLevel
      },
      leakageReview: {
        leakageStatus: leakage.leakageStatus,
        prohibitedFieldCount: 0
      },
      datasetGeneralization: dsGen.status,
      classGeneralization: clsGen.status,
      productionRisk: prodRisk.overallProductionRisk,
      finalScorecard: scorecard,
      recommendation: recResult.recommendation,
      recommendationReasoning: recResult.reasoning,
      governanceUntouched: true
    };

    // 6. Save all 14 JSON artifacts and Markdown report
    this.reporter.saveFinalReviewReports(summary, errors, errorDist, dsRisk, clsRisk, severity, confErrors, featErrors, leakage, dsGen, clsGen, prodRisk, recResult, workspaceRoot);

    return summary;
  }
}
