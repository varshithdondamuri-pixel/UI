import { LayoutControlledV02TrainingPipeline } from '../../training/layout-prediction/LayoutControlledV02TrainingPipeline';
import { AuditSummaryV02Report } from './LayoutV02AuditTypes';
import { LayoutV02ConfidenceAudit } from './LayoutV02ConfidenceAudit';
import { LayoutV02CrossDatasetAudit } from './LayoutV02CrossDatasetAudit';
import { LayoutV02DistributionShiftAudit } from './LayoutV02DistributionShiftAudit';
import { LayoutV02DuplicateAudit } from './LayoutV02DuplicateAudit';
import { LayoutV02ErrorAnalysis } from './LayoutV02ErrorAnalysis';
import { LayoutV02FeatureAblationAudit } from './LayoutV02FeatureAblationAudit';
import { LayoutV02FeatureGroupAudit } from './LayoutV02FeatureGroupAudit';
import { LayoutV02GeneralizationReport } from './LayoutV02GeneralizationReport';
import { LayoutV02GeneralizationScorecard } from './LayoutV02GeneralizationScorecard';
import { LayoutV02LeakageAudit } from './LayoutV02LeakageAudit';
import { LayoutV02MinorityClassAudit } from './LayoutV02MinorityClassAudit';
import { LayoutV02ModelComparisonAudit } from './LayoutV02ModelComparisonAudit';
import { LayoutV02PerClassAudit } from './LayoutV02PerClassAudit';
import { LayoutV02PerDatasetAudit } from './LayoutV02PerDatasetAudit';
import { LayoutV02RecommendationEngine } from './LayoutV02RecommendationEngine';
import { LayoutV02ReproducibilityAudit } from './LayoutV02ReproducibilityAudit';

export class LayoutV02GeneralizationAuditEngine {
  private comparisonAudit: LayoutV02ModelComparisonAudit;
  private perDatasetAudit: LayoutV02PerDatasetAudit;
  private perClassAudit: LayoutV02PerClassAudit;
  private minorityClassAudit: LayoutV02MinorityClassAudit;
  private featureGroupAudit: LayoutV02FeatureGroupAudit;
  private featureAblationAudit: LayoutV02FeatureAblationAudit;
  private leakageAudit: LayoutV02LeakageAudit;
  private duplicateAudit: LayoutV02DuplicateAudit;
  private distributionShiftAudit: LayoutV02DistributionShiftAudit;
  private confidenceAudit: LayoutV02ConfidenceAudit;
  private errorAnalysis: LayoutV02ErrorAnalysis;
  private crossDatasetAudit: LayoutV02CrossDatasetAudit;
  private reproducibilityAudit: LayoutV02ReproducibilityAudit;
  private scorecardGenerator: LayoutV02GeneralizationScorecard;
  private recommendationEngine: LayoutV02RecommendationEngine;
  private reporter: LayoutV02GeneralizationReport;

  constructor() {
    this.comparisonAudit = new LayoutV02ModelComparisonAudit();
    this.perDatasetAudit = new LayoutV02PerDatasetAudit();
    this.perClassAudit = new LayoutV02PerClassAudit();
    this.minorityClassAudit = new LayoutV02MinorityClassAudit();
    this.featureGroupAudit = new LayoutV02FeatureGroupAudit();
    this.featureAblationAudit = new LayoutV02FeatureAblationAudit();
    this.leakageAudit = new LayoutV02LeakageAudit();
    this.duplicateAudit = new LayoutV02DuplicateAudit();
    this.distributionShiftAudit = new LayoutV02DistributionShiftAudit();
    this.confidenceAudit = new LayoutV02ConfidenceAudit();
    this.errorAnalysis = new LayoutV02ErrorAnalysis();
    this.crossDatasetAudit = new LayoutV02CrossDatasetAudit();
    this.reproducibilityAudit = new LayoutV02ReproducibilityAudit();
    this.scorecardGenerator = new LayoutV02GeneralizationScorecard();
    this.recommendationEngine = new LayoutV02RecommendationEngine();
    this.reporter = new LayoutV02GeneralizationReport();
  }

  public runGeneralizationAudit(workspaceRoot: string = process.cwd()): AuditSummaryV02Report {
    // 1. Execute controlled training pipeline in audit mode to obtain metric evidence
    const pipeline = new LayoutControlledV02TrainingPipeline();
    const trainingResult = pipeline.executeControlledTraining(workspaceRoot);

    // 2. Run all audit sub-modules
    const comparison = this.comparisonAudit.auditComparison(
      trainingResult.testResults.baselineB,
      trainingResult.testResults.candidateC
    );
    const perDataset = this.perDatasetAudit.auditPerDataset();
    const perClass = this.perClassAudit.auditPerClass(trainingResult.testResults.candidateC);
    const minorityClass = this.minorityClassAudit.auditMinorityClasses(perClass);
    const featureGroups = this.featureGroupAudit.auditFeatureGroups();
    const ablation = this.featureAblationAudit.auditAblation();
    const leakage = this.leakageAudit.auditLeakage();
    const duplicate = this.duplicateAudit.auditDuplicates();
    const distribution = this.distributionShiftAudit.auditDistributionShift();
    const confidence = this.confidenceAudit.auditConfidence();
    const errors = this.errorAnalysis.auditErrors(trainingResult);
    const crossDataset = this.crossDatasetAudit.auditCrossDataset();
    const reproducibility = this.reproducibilityAudit.auditReproducibility();

    const scorecard = this.scorecardGenerator.generateScorecard(
      leakage,
      minorityClass,
      perDataset,
      distribution,
      confidence,
      reproducibility
    );

    const recommendation = this.recommendationEngine.determineRecommendation(
      scorecard,
      leakage,
      minorityClass,
      reproducibility
    );

    const summary: AuditSummaryV02Report = {
      modelId: 'layout-prediction-v0.2.0',
      task: 'layout_prediction',
      datasetReleaseId: 'ml-prepared-layout-v0.1',
      featureSchemaVersion: 'layout-prediction-features-v0.2',
      status: 'candidate',
      deploymentStatus: 'not_active',
      auditedAt: new Date().toISOString(),
      modelComparison: comparison,
      perDataset,
      perClass,
      minorityClass,
      featureGroups,
      ablation,
      leakage,
      duplicate,
      distribution,
      confidence,
      errorAnalysis: errors,
      crossDataset,
      reproducibility,
      scorecard,
      recommendation,
      governanceUntouched: true
    };

    // 3. Save all 16 JSON artifacts and Markdown report
    this.reporter.saveAuditReports(summary, workspaceRoot);

    return summary;
  }
}
